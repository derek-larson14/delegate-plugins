#!/usr/bin/env python3
"""Launchd Dashboard — localhost dashboard for macOS LaunchAgents.

Zero dependencies beyond Python 3 and macOS.

Usage:
    python3 server.py
    python3 server.py --port 8080
    python3 server.py --no-open
"""

import argparse
import glob
import http.server
import json
import os
import plistlib
import subprocess
import sys
import threading
import time
import webbrowser
from pathlib import Path
from urllib.parse import urlparse, unquote

DEFAULT_PORT = 3847
IDLE_TIMEOUT = 600  # 10 minutes
CACHE_TTL = 5  # seconds

plugin_dir = Path(__file__).parent.parent
public_dir = plugin_dir / "public"
cache_dir = Path.home() / ".cache" / "launchd-dashboard"
cache_dir.mkdir(parents=True, exist_ok=True)
descriptions_path = cache_dir / "descriptions.json"
last_activity = time.time()
_cache = {"agents": None, "time": 0}


# ---------------------------------------------------------------------------
# Idle watchdog
# ---------------------------------------------------------------------------

def reset_idle():
    global last_activity
    last_activity = time.time()


def idle_watchdog():
    while True:
        time.sleep(30)
        if time.time() - last_activity > IDLE_TIMEOUT:
            print("\nIdle timeout. Shutting down.")
            os._exit(0)


# ---------------------------------------------------------------------------
# Agent data
# ---------------------------------------------------------------------------

def load_descriptions():
    """Load cached agent descriptions from JSON file."""
    try:
        with open(descriptions_path, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def save_descriptions(descs):
    """Save agent descriptions to JSON file."""
    with open(descriptions_path, "w") as f:
        json.dump(descs, f, indent=2)


def read_script_content(program_path):
    """Read first 150 lines of a script file for description generation."""
    if not program_path:
        return None
    # The program field might be a full command — extract the file path
    path = program_path.strip()
    # Handle cases like "/bin/bash /path/to/script.sh"
    for part in path.split():
        part = part.strip()
        if os.path.isfile(part) and not part.startswith("/bin/") and not part.startswith("/usr/bin/"):
            path = part
            break
    if not os.path.isfile(path):
        return None
    try:
        with open(path, "r") as f:
            lines = f.readlines()[:150]
            return "".join(lines)
    except Exception:
        return None


def generate_description(agent):
    """Use Claude to generate a 2-3 sentence description of an agent."""
    parts = [
        "Describe what this macOS LaunchAgent does in 2-3 sentences.",
        "Be specific about its purpose, not generic. No preamble.",
        "",
        f"Label: {agent['label']}",
        f"Schedule: {agent['schedule']}",
        f"Program: {agent['program'] or 'unknown'}",
    ]

    script = read_script_content(agent.get("program"))
    if script:
        parts.append("")
        parts.append("Script contents:")
        parts.append(script)

    prompt = "\n".join(parts)

    env = os.environ.copy()
    env.pop("CLAUDECODE", None)

    try:
        result = subprocess.run(
            ["claude", "-p", prompt, "--model", "claude-sonnet-4-6"],
            capture_output=True, text=True, timeout=30, env=env,
        )
        if result.returncode == 0:
            return result.stdout.strip()
    except Exception:
        pass
    return None


def generate_missing_descriptions(agents):
    """Generate descriptions for agents that don't have one cached."""
    descs = load_descriptions()
    missing = [a for a in agents if a["label"] not in descs]
    if not missing:
        return descs

    for agent in missing:
        desc = generate_description(agent)
        if desc:
            descs[agent["label"]] = desc

    save_descriptions(descs)
    return descs


def read_agents():
    plist_dir = os.path.expanduser("~/Library/LaunchAgents")
    status_map = get_launchctl_status()
    descs = load_descriptions()
    agents = []

    for plist_path in sorted(glob.glob(os.path.join(plist_dir, "*.plist"))):
        try:
            with open(plist_path, "rb") as f:
                plist = plistlib.load(f)
            label = plist.get("Label", Path(plist_path).stem)
            live = status_map.get(label, {})

            agents.append({
                "label": label,
                "name": humanize_label(label),
                "description": descs.get(label),
                "status": compute_status(plist, live),
                "pid": live.get("pid"),
                "lastExitStatus": live.get("lastExitStatus"),
                "schedule": format_schedule(plist),
                "scheduleType": get_schedule_type(plist),
                "program": get_program(plist),
                "runAtLoad": plist.get("RunAtLoad", False),
                "disabled": plist.get("Disabled", False),
                "plistPath": plist_path,
                "stdoutPath": plist.get("StandardOutPath"),
                "stderrPath": plist.get("StandardErrorPath"),
                "loaded": label in status_map,
            })
        except Exception:
            continue

    return agents


def read_agents_cached():
    now = time.time()
    if _cache["agents"] is None or now - _cache["time"] > CACHE_TTL:
        _cache["agents"] = read_agents()
        _cache["time"] = now
    return _cache["agents"]


def get_launchctl_status():
    try:
        result = subprocess.run(
            ["launchctl", "list"],
            capture_output=True, text=True, timeout=5,
        )
        status = {}
        for line in result.stdout.strip().split("\n")[1:]:
            parts = line.split("\t")
            if len(parts) == 3:
                pid_str, exit_str, label = parts
                status[label] = {
                    "pid": int(pid_str) if pid_str != "-" else None,
                    "lastExitStatus": int(exit_str) if exit_str != "-" else None,
                    "running": pid_str != "-",
                }
        return status
    except Exception:
        return {}


def humanize_label(label):
    prefixes = [
        "com.claude.", "com.exec.", "com.dispatch.",
        "com.voicememos.", "com.voicevault.",
        "com.apple.", "com.google.", "com.",
    ]
    for prefix in prefixes:
        if label.startswith(prefix):
            return label[len(prefix):]
    return label


def compute_status(plist, live):
    if plist.get("Disabled", False):
        return "disabled"
    if not live:
        return "unloaded"
    if live.get("running"):
        return "running"
    exit_code = live.get("lastExitStatus")
    if exit_code is not None and exit_code != 0:
        return "failed"
    return "idle"


def format_schedule(plist):
    if "StartCalendarInterval" in plist:
        sci = plist["StartCalendarInterval"]
        if isinstance(sci, dict):
            sci = [sci]
        times = []
        for entry in sci:
            hour = entry.get("Hour", "*")
            minute = entry.get("Minute", 0)
            if hour == "*":
                times.append(f":{str(minute).zfill(2)} hourly")
            else:
                times.append(f"{hour}:{str(minute).zfill(2)}")
        return ", ".join(times)
    elif "StartInterval" in plist:
        secs = plist["StartInterval"]
        if secs < 60:
            return f"every {secs}s"
        elif secs < 3600:
            return f"every {secs // 60}min"
        else:
            return f"every {secs // 3600}h"
    elif plist.get("RunAtLoad"):
        return "on load"
    elif "WatchPaths" in plist:
        return "on file change"
    elif "KeepAlive" in plist:
        return "keep alive"
    return "manual"


def get_schedule_type(plist):
    if "StartCalendarInterval" in plist:
        return "calendar"
    elif "StartInterval" in plist:
        return "interval"
    elif "WatchPaths" in plist:
        return "watch"
    elif plist.get("RunAtLoad"):
        return "load"
    return "manual"


def get_program(plist):
    if "Program" in plist:
        return plist["Program"]
    args = plist.get("ProgramArguments", [])
    if not args:
        return None
    shells = ("/bin/sh", "/bin/bash", "/bin/zsh")
    if len(args) >= 3 and args[0] in shells and args[1] == "-c":
        return args[2]
    if len(args) >= 2 and args[0] in shells:
        return args[1]
    return " ".join(args)


def kickstart_agent(label):
    uid = os.getuid()
    result = subprocess.run(
        ["launchctl", "kickstart", f"gui/{uid}/{label}"],
        capture_output=True, text=True, timeout=10,
    )
    return result.returncode == 0, result.stderr.strip()


def read_log_tail(path, lines=50):
    if not path or not os.path.exists(path):
        return None
    try:
        with open(path, "r") as f:
            all_lines = f.readlines()
            return "".join(all_lines[-lines:])
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Diagnose
# ---------------------------------------------------------------------------

def build_diagnose_prompt(agents):
    lines = [
        "You are diagnosing macOS LaunchAgents on a developer's machine.",
        "Review the agents below. For any problems:",
        "- What's wrong",
        "- Likely cause",
        "- How to fix it (specific commands when possible)",
        "",
        "Be direct and brief. If everything is healthy, say so in one line.",
        "",
        "=== AGENTS ===",
        "",
    ]

    for agent in agents:
        parts = [f"{agent['name']} ({agent['label']})"]
        parts.append(f"status: {agent['status']}")
        if agent["lastExitStatus"] is not None:
            parts.append(f"exit: {agent['lastExitStatus']}")
        parts.append(f"schedule: {agent['schedule']}")
        if agent["program"]:
            parts.append(f"runs: {agent['program']}")
        lines.append(" | ".join(parts))

    # Include logs for failed or non-zero-exit agents
    problem_agents = [
        a for a in agents
        if a["status"] == "failed"
        or (a["lastExitStatus"] is not None and a["lastExitStatus"] != 0)
    ]
    if problem_agents:
        lines.append("")
        lines.append("=== ERROR LOGS ===")
        for agent in problem_agents:
            lines.append(f"\n--- {agent['label']} ---")
            if agent.get("stderrPath"):
                stderr = read_log_tail(agent["stderrPath"], 80)
                if stderr:
                    lines.append(f"STDERR:\n{stderr}")
            if agent.get("stdoutPath"):
                stdout = read_log_tail(agent["stdoutPath"], 80)
                if stdout:
                    lines.append(f"STDOUT:\n{stdout}")

    return "\n".join(lines)


def save_context_file(diagnosis, follow_up=""):
    """Write diagnostic context to temp file. Returns the claude command to run."""
    tmp_path = "/tmp/launch-dash-context.md"
    content = f"# LaunchAgent Diagnostic Scan\n\n{diagnosis}"
    if follow_up:
        content += f"\n\n---\n\n# My follow-up\n\n{follow_up}"

    with open(tmp_path, "w") as f:
        f.write(content)

    msg = "Read /tmp/launch-dash-context.md and help me fix the issues described."
    if follow_up:
        msg = "Read /tmp/launch-dash-context.md — it has a diagnostic scan and my follow-up. Address the follow-up."

    return f'claude "{msg}"'


def run_diagnose(hidden_labels=None):
    """Run Claude CLI to diagnose agent issues. Returns (ok, text, agents_context)."""
    agents = read_agents()  # fresh, not cached
    if hidden_labels:
        agents = [a for a in agents if a["label"] not in hidden_labels]
    agents_context = build_diagnose_prompt(agents)
    prompt = agents_context

    # Clear CLAUDECODE env var so claude -p doesn't refuse to launch
    env = os.environ.copy()
    env.pop("CLAUDECODE", None)

    try:
        result = subprocess.run(
            ["claude", "-p", prompt, "--model", "claude-sonnet-4-6"],
            capture_output=True, text=True, timeout=120, env=env,
        )
        if result.returncode == 0:
            return True, result.stdout.strip(), agents_context
        return False, result.stderr.strip() or "Claude exited with an error", agents_context
    except subprocess.TimeoutExpired:
        return False, "Diagnosis timed out (120s)", agents_context
    except FileNotFoundError:
        return False, "Claude CLI not found. Install: npm install -g @anthropic-ai/claude-code", agents_context


def load_agent(plist_path):
    """Load a LaunchAgent."""
    result = subprocess.run(
        ["launchctl", "load", plist_path],
        capture_output=True, text=True, timeout=10,
    )
    return result.returncode == 0, result.stderr.strip()


def unload_agent(plist_path):
    """Unload a LaunchAgent."""
    result = subprocess.run(
        ["launchctl", "unload", plist_path],
        capture_output=True, text=True, timeout=10,
    )
    return result.returncode == 0, result.stderr.strip()


# ---------------------------------------------------------------------------
# HTTP handler
# ---------------------------------------------------------------------------

class DashHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(public_dir), **kwargs)

    def log_message(self, format, *args):
        pass  # quiet

    def do_GET(self):
        reset_idle()
        path = urlparse(self.path).path

        if path == "/api/agents":
            self.send_json(read_agents_cached())

        elif path.startswith("/api/agents/") and path.endswith("/log"):
            label = unquote(path[len("/api/agents/"):-len("/log")])
            agent = next((a for a in read_agents_cached() if a["label"] == label), None)
            if not agent:
                self.send_json({"error": "not found"}, 404)
                return
            logs = {}
            if agent.get("stdoutPath"):
                logs["stdout"] = read_log_tail(agent["stdoutPath"])
            if agent.get("stderrPath"):
                logs["stderr"] = read_log_tail(agent["stderrPath"])
            self.send_json(logs)

        else:
            super().do_GET()

    def do_POST(self):
        reset_idle()
        path = urlparse(self.path).path

        if path == "/api/diagnose":
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length)) if length else {}
            hidden = body.get("hidden", [])
            ok, text, ctx = run_diagnose(hidden_labels=hidden)
            self.send_json({
                "ok": ok,
                "diagnosis": text if ok else None,
                "error": text if not ok else None,
                "agentsContext": ctx,
            })

        elif path == "/api/describe":
            agents = read_agents()
            descs = generate_missing_descriptions(agents)
            _cache["agents"] = None  # bust cache so next read includes new descriptions
            self.send_json({"ok": True, "count": len(descs)})

        elif path == "/api/claude-command":
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length)) if length else {}
            diagnosis = body.get("diagnosis", "")
            follow_up = body.get("followUp", "")
            cmd = save_context_file(diagnosis, follow_up)
            self.send_json({"ok": True, "command": cmd})

        elif path.startswith("/api/agents/") and path.endswith("/kickstart"):
            label = unquote(path[len("/api/agents/"):-len("/kickstart")])
            ok, msg = kickstart_agent(label)
            _cache["agents"] = None
            self.send_json({"ok": ok, "message": msg})

        elif path.startswith("/api/agents/") and path.endswith("/load"):
            label = unquote(path[len("/api/agents/"):-len("/load")])
            agent = next((a for a in read_agents() if a["label"] == label), None)
            if not agent:
                self.send_json({"ok": False, "message": "Agent not found"}, 404)
                return
            ok, msg = load_agent(agent["plistPath"])
            _cache["agents"] = None
            self.send_json({"ok": ok, "message": msg})

        elif path.startswith("/api/agents/") and path.endswith("/unload"):
            label = unquote(path[len("/api/agents/"):-len("/unload")])
            agent = next((a for a in read_agents() if a["label"] == label), None)
            if not agent:
                self.send_json({"ok": False, "message": "Agent not found"}, 404)
                return
            ok, msg = unload_agent(agent["plistPath"])
            _cache["agents"] = None
            self.send_json({"ok": ok, "message": msg})

        else:
            self.send_json({"error": "not found"}, 404)

    def send_json(self, data, code=200):
        body = json.dumps(data).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Launch Dash")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT)
    parser.add_argument("--no-open", action="store_true", help="Don't open browser")
    args = parser.parse_args()

    # Check if another instance is actually serving
    import socket
    check = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    check.settimeout(1)
    try:
        check.connect(("127.0.0.1", args.port))
        check.close()
        # Connection succeeded — server is already running
        url = f"http://localhost:{args.port}"
        print(f"Dashboard already running at {url}")
        if not args.no_open:
            webbrowser.open(url)
        sys.exit(0)
    except (ConnectionRefusedError, OSError):
        pass  # Port is free, start server

    watchdog = threading.Thread(target=idle_watchdog, daemon=True)
    watchdog.start()

    server = http.server.ThreadingHTTPServer(("127.0.0.1", args.port), DashHandler)
    server.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    url = f"http://localhost:{args.port}"
    print(f"Launch Dash → {url}")
    print("Auto-exits after 10 minutes idle. Ctrl-C to stop.")

    if not args.no_open:
        webbrowser.open(url)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down.")
        server.shutdown()


if __name__ == "__main__":
    main()
