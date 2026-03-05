// Launch Dash

const REFRESH_INTERVAL = 10000;
const MAX_LOG_LINES = 200;
let agents = [];
let prevAgentJSON = "";
let expandedLabel = null;
let showHidden = false;
let logCache = {}; // { label: { stdout, stderr, error } }

// -- Hidden agents (localStorage) --

function getHidden() {
  try {
    return JSON.parse(localStorage.getItem("launch-dash-hidden") || "[]");
  } catch { return []; }
}

function setHidden(list) {
  localStorage.setItem("launch-dash-hidden", JSON.stringify(list));
}

function hideAgent(label) {
  const h = getHidden();
  if (!h.includes(label)) h.push(label);
  setHidden(h);
  render();
}

function unhideAgent(label) {
  setHidden(getHidden().filter((l) => l !== label));
  render();
}

// -- Data --

async function fetchAgents() {
  try {
    const res = await fetch("/api/agents");
    const data = await res.json();
    const json = JSON.stringify(data);
    if (json === prevAgentJSON) return false; // nothing changed, skip render
    prevAgentJSON = json;
    agents = data;
    render();
    return true;
  } catch {
    document.getElementById("agents").innerHTML =
      '<div class="error">Cannot reach server</div>';
    return false;
  }
}

async function fetchLog(label) {
  try {
    const res = await fetch(`/api/agents/${encodeURIComponent(label)}/log`);
    const data = await res.json();
    // Truncate long logs
    if (data.stdout) data.stdout = truncateLog(data.stdout);
    if (data.stderr) data.stderr = truncateLog(data.stderr);
    logCache[label] = data;
    return data;
  } catch {
    const err = { error: "Failed to fetch logs" };
    logCache[label] = err;
    return err;
  }
}

function truncateLog(text) {
  const lines = text.split("\n");
  if (lines.length <= MAX_LOG_LINES) return text;
  return `... (${lines.length - MAX_LOG_LINES} earlier lines hidden)\n\n` +
    lines.slice(-MAX_LOG_LINES).join("\n");
}

async function doKickstart(label) {
  try {
    const res = await fetch(
      `/api/agents/${encodeURIComponent(label)}/kickstart`,
      { method: "POST" }
    );
    const data = await res.json();
    if (!data.ok) console.error("Kickstart failed:", data.message);
    prevAgentJSON = "";
    setTimeout(fetchAgents, 1500);
  } catch {
    console.error("Kickstart request failed");
  }
}

async function doAgentAction(label, action) {
  try {
    const res = await fetch(
      `/api/agents/${encodeURIComponent(label)}/${action}`,
      { method: "POST" }
    );
    const data = await res.json();
    if (!data.ok) console.error(`${action} failed:`, data.message);
    prevAgentJSON = "";
    setTimeout(fetchAgents, 1000);
  } catch {
    console.error(`${action} request failed`);
  }
}

// -- Render --

const STATUS_ORDER = { failed: 0, running: 1, idle: 2, unloaded: 3, disabled: 4 };

function render() {
  const hidden = getHidden();
  const visible = agents.filter((a) => !hidden.includes(a.label));
  const hiddenAgents = agents.filter((a) => hidden.includes(a.label));
  const sorted = [...visible].sort(
    (a, b) => (STATUS_ORDER[a.status] ?? 5) - (STATUS_ORDER[b.status] ?? 5)
  );

  // Header
  document.getElementById("status-summary").textContent =
    `${visible.length} agent${visible.length !== 1 ? "s" : ""}`;

  const counts = {
    running: visible.filter((a) => a.status === "running").length,
    failed: visible.filter((a) => a.status === "failed").length,
    idle: visible.filter((a) => a.status === "idle").length,
  };
  let pillsHTML = "";
  if (counts.running) pillsHTML += `<span class="header-pill running-pill">${counts.running} running</span>`;
  if (counts.failed) pillsHTML += `<span class="header-pill failed-pill">${counts.failed} failed</span>`;
  if (counts.idle) pillsHTML += `<span class="header-pill idle-pill">${counts.idle} idle</span>`;
  const hasMissing = visible.some(a => !a.description);
  if (hasMissing) {
    pillsHTML += `<button class="btn btn-describe" id="btn-describe" ${describing ? 'disabled' : ''}>
      ${describing ? 'Generating...' : 'Describe Agents'}</button>`;
  }
  document.getElementById("header-pills").innerHTML = pillsHTML;

  // Bind describe button
  const descBtn = document.getElementById("btn-describe");
  if (descBtn) descBtn.addEventListener("click", generateDescriptions);

  // Agent list
  const container = document.getElementById("agents");
  if (sorted.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No agents found in ~/Library/LaunchAgents</p></div>';
  } else {
    container.innerHTML = sorted.map((a) => cardHTML(a, false)).join("");
  }

  // Restore cached logs for expanded card
  if (expandedLabel && logCache[expandedLabel]) {
    renderLogContent(expandedLabel, logCache[expandedLabel]);
  }

  // Hidden section
  const hiddenSection = document.getElementById("hidden-section");
  if (hiddenAgents.length === 0) {
    hiddenSection.innerHTML = "";
    return;
  }

  const hiddenSorted = [...hiddenAgents].sort(
    (a, b) => (STATUS_ORDER[a.status] ?? 5) - (STATUS_ORDER[b.status] ?? 5)
  );

  hiddenSection.innerHTML = `
    <div class="section-divider"></div>
    <div class="section-toggle" id="toggle-hidden">
      <span class="chevron ${showHidden ? "open" : ""}">&#9654;</span>
      <span>${hiddenAgents.length} hidden</span>
    </div>
    ${showHidden ? `<div class="hidden-agents">${hiddenSorted.map((a) => cardHTML(a, true)).join("")}</div>` : ""}
  `;
}

function cardHTML(agent, isHidden) {
  const expanded = expandedLabel === agent.label;
  const exitDisplay = agent.lastExitStatus != null ? agent.lastExitStatus : "";
  const exitClass = agent.lastExitStatus != null && agent.lastExitStatus !== 0 ? "error" : "";

  let html = `
    <div class="card ${agent.status} ${expanded ? "expanded" : ""}"
         data-label="${esc(agent.label)}" data-hidden="${isHidden}">
      <div class="status-bar ${agent.status}"></div>
      <div class="card-main">
        <span class="agent-name">${esc(agent.name)}</span>
        ${agent.description
          ? `<span class="agent-desc">${esc(agent.description)}</span>`
          : `<span class="agent-schedule">${esc(agent.schedule)}</span>`
        }
      </div>
      <div class="card-right">
        <span class="exit-code ${exitClass}">${exitDisplay}</span>
        <span class="status-badge ${agent.status}">${agent.status}</span>
        ${isHidden
          ? `<button class="btn-hide btn-unhide" data-label="${esc(agent.label)}" title="Show">&#x2b;</button>`
          : ""
        }
      </div>`;

  if (expanded) {
    html += `
      <div class="card-expanded">
        <div class="detail-grid">
          <span class="detail-label">Schedule</span>
          <span class="detail-value">${esc(agent.schedule)}</span>
          <span class="detail-label">Label</span>
          <span class="detail-value">${esc(agent.label)}</span>
          <span class="detail-label">Program</span>
          <span class="detail-value">${esc(agent.program || "—")}</span>
          <span class="detail-label">Plist</span>
          <span class="detail-value">${esc(agent.plistPath)}</span>
          ${agent.pid ? `
          <span class="detail-label">PID</span>
          <span class="detail-value">${agent.pid}</span>` : ""}
        </div>
        <div class="card-actions">
          <button class="btn btn-kickstart" data-label="${esc(agent.label)}">Run Now</button>
          ${agent.loaded
            ? `<button class="btn btn-unload" data-label="${esc(agent.label)}">Unload</button>`
            : `<button class="btn btn-load" data-label="${esc(agent.label)}">Load</button>`
          }
          <button class="btn btn-hide-action" data-label="${esc(agent.label)}">Hide from dashboard</button>
        </div>
        <div class="log-viewer" data-label="${esc(agent.label)}">
          <div class="loading">Loading logs...</div>
        </div>
      </div>`;
  }

  html += "</div>";
  return html;
}

// -- Log rendering --

function renderLogContent(label, logs) {
  const el = document.querySelector(`.log-viewer[data-label="${label}"]`);
  if (!el) return;

  let html = "";
  if (logs.stdout) {
    html += logSectionHTML("stdout", logs.stdout);
  }
  if (logs.stderr) {
    html += logSectionHTML("stderr", logs.stderr);
  }
  if (!logs.stdout && !logs.stderr && !logs.error) {
    html = '<div class="log-empty">No log files configured</div>';
  }
  if (logs.error) {
    html = `<div class="log-empty">${esc(logs.error)}</div>`;
  }
  el.innerHTML = html;
}

function logSectionHTML(title, content) {
  return `
    <div class="log-section">
      <div class="log-header">
        <span class="log-title">${title}</span>
        <button class="btn btn-copy" data-log-type="${title}">Copy</button>
      </div>
      <pre>${esc(content)}</pre>
    </div>`;
}

// -- Events --

document.getElementById("agents").addEventListener("click", handleCardClick);

document.getElementById("hidden-section").addEventListener("click", (e) => {
  if (e.target.closest("#toggle-hidden")) {
    showHidden = !showHidden;
    render();
    return;
  }
  const unhideBtn = e.target.closest(".btn-unhide");
  if (unhideBtn) {
    e.stopPropagation();
    unhideAgent(unhideBtn.dataset.label);
    return;
  }
  handleCardClick(e);
});

function handleCardClick(e) {
  // Copy button
  const copyBtn = e.target.closest(".btn-copy");
  if (copyBtn) {
    e.stopPropagation();
    const pre = copyBtn.closest(".log-section").querySelector("pre");
    if (pre) {
      navigator.clipboard.writeText(pre.textContent).then(() => {
        copyBtn.textContent = "Copied";
        setTimeout(() => { copyBtn.textContent = "Copy"; }, 1500);
      });
    }
    return;
  }

  // Hide button (in expanded card actions)
  const hideBtn = e.target.closest(".btn-hide-action");
  if (hideBtn) {
    e.stopPropagation();
    hideAgent(hideBtn.dataset.label);
    return;
  }

  // Hide button (unhide in hidden section — still uses btn-hide)
  const hideBtnOld = e.target.closest(".btn-hide:not(.btn-unhide)");
  if (hideBtnOld) {
    e.stopPropagation();
    hideAgent(hideBtnOld.dataset.label);
    return;
  }

  // Kickstart
  const kickBtn = e.target.closest(".btn-kickstart");
  if (kickBtn) {
    e.stopPropagation();
    doKickstart(kickBtn.dataset.label);
    return;
  }

  // Load/Unload
  const loadBtn = e.target.closest(".btn-load");
  if (loadBtn) {
    e.stopPropagation();
    doAgentAction(loadBtn.dataset.label, "load");
    return;
  }
  const unloadBtn = e.target.closest(".btn-unload");
  if (unloadBtn) {
    e.stopPropagation();
    doAgentAction(unloadBtn.dataset.label, "unload");
    return;
  }

  // Expand/collapse
  const card = e.target.closest(".card");
  if (!card) return;
  const label = card.dataset.label;
  expandedLabel = expandedLabel === label ? null : label;
  render();
  if (expandedLabel) loadLogs(label);
}

async function loadLogs(label) {
  const logs = await fetchLog(label);
  renderLogContent(label, logs);
}

// -- Util --

function esc(text) {
  if (text == null) return "";
  const d = document.createElement("div");
  d.textContent = String(text);
  return d.innerHTML;
}

// -- Markdown --

function renderMarkdown(text) {
  // Extract fenced code blocks first — protect from further processing
  const codeBlocks = [];
  let md = text.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    codeBlocks.push(`<pre><code>${esc(code.trimEnd())}</code></pre>`);
    return `\x00CB${codeBlocks.length - 1}\x00`;
  });

  // Escape HTML in remaining text
  md = esc(md);

  // Inline code
  md = md.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Bold
  md = md.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Headings
  md = md.replace(/^#### (.+)$/gm, '<h5>$1</h5>');
  md = md.replace(/^### (.+)$/gm, '<h4>$1</h4>');
  md = md.replace(/^## (.+)$/gm, '<h3>$1</h3>');
  md = md.replace(/^# (.+)$/gm, '<h2>$1</h2>');
  // Horizontal rules
  md = md.replace(/^---$/gm, '<hr>');
  // Bullet lists
  md = md.replace(/^- (.+)$/gm, '<li>$1</li>');

  // Wrap consecutive <li> in <ul>
  md = md.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

  // Paragraphs — split on double newlines
  md = md.split(/\n{2,}/).map(block => {
    block = block.trim();
    if (!block) return '';
    // Don't wrap block elements in <p>
    if (/^<(h[2-5]|ul|hr|pre|\x00CB)/.test(block)) return block;
    return `<p>${block.replace(/\n/g, '<br>')}</p>`;
  }).join('\n');

  // Restore code blocks
  md = md.replace(/\x00CB(\d+)\x00/g, (_, i) => codeBlocks[parseInt(i)]);

  return md;
}

// -- Diagnose --

let diagnosing = false;
let lastDiagnosisRaw = "";

document.getElementById("btn-diagnose").addEventListener("click", async () => {
  if (diagnosing) return;
  diagnosing = true;
  lastDiagnosisRaw = "";

  const btn = document.getElementById("btn-diagnose");
  const panel = document.getElementById("diagnose-panel");

  btn.textContent = "Scanning...";
  btn.classList.add("diagnosing");
  panel.innerHTML = `
    <div class="diagnose-box">
      <div class="diagnose-header">
        <span class="diagnose-title">Diagnosis</span>
        <span class="diagnose-status scanning">scanning agents...</span>
      </div>
      <div class="diagnose-body"><span class="loading">Running Claude on agent statuses and error logs...</span></div>
    </div>`;

  try {
    const res = await fetch("/api/diagnose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hidden: getHidden() }),
    });
    const data = await res.json();

    if (data.ok) {
      lastDiagnosisRaw = data.diagnosis;
      panel.innerHTML = `
        <div class="diagnose-box">
          <div class="diagnose-header">
            <span class="diagnose-title">Diagnosis</span>
            <div class="diagnose-actions">
              <button class="btn btn-copy" id="copy-diagnosis">Copy</button>
              <button class="btn btn-dismiss" id="dismiss-diagnosis">&times;</button>
            </div>
          </div>
          <div class="diagnose-body markdown">${renderMarkdown(data.diagnosis)}</div>
          <div class="chat-input-row">
            <input type="text" class="chat-input" id="chat-input"
              placeholder="Add context (optional)...">
            <button class="btn btn-continue" id="btn-claude-cmd">Open in Claude Code</button>
          </div>
        </div>`;
      document.getElementById("btn-claude-cmd").title = "Saves context to /tmp and copies a claude command to your clipboard"
      document.getElementById("chat-input").focus();
    } else {
      panel.innerHTML = `
        <div class="diagnose-box diagnose-error">
          <div class="diagnose-header">
            <span class="diagnose-title">Diagnosis failed</span>
            <button class="btn btn-dismiss" id="dismiss-diagnosis">&times;</button>
          </div>
          <div class="diagnose-body"><pre>${esc(data.error)}</pre></div>
        </div>`;
    }
  } catch {
    panel.innerHTML = `
      <div class="diagnose-box diagnose-error">
        <div class="diagnose-header">
          <span class="diagnose-title">Diagnosis failed</span>
          <button class="btn btn-dismiss" id="dismiss-diagnosis">&times;</button>
        </div>
        <div class="diagnose-body"><span class="log-empty">Could not reach server</span></div>
      </div>`;
  }

  btn.textContent = "Diagnose with Claude";
  btn.classList.remove("diagnosing");
  diagnosing = false;
});

// Delegated events for diagnose panel
document.getElementById("diagnose-panel").addEventListener("click", (e) => {
  const copyBtn = e.target.closest("#copy-diagnosis");
  if (copyBtn) {
    navigator.clipboard.writeText(lastDiagnosisRaw).then(() => {
      copyBtn.textContent = "Copied";
      setTimeout(() => { copyBtn.textContent = "Copy"; }, 1500);
    });
    return;
  }

  const claudeBtn = e.target.closest("#btn-claude-cmd");
  if (claudeBtn) {
    const input = document.getElementById("chat-input");
    const followUp = input ? input.value.trim() : "";
    claudeBtn.disabled = true;
    fetch("/api/claude-command", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ diagnosis: lastDiagnosisRaw, followUp }),
    }).then(res => res.json()).then(data => {
      if (data.ok) {
        navigator.clipboard.writeText(data.command).then(() => {
          claudeBtn.textContent = "Copied!";
          setTimeout(() => {
            claudeBtn.textContent = "Open in Claude Code";
            claudeBtn.disabled = false;
          }, 2000);
        });
      }
    });
    return;
  }

  const dismissBtn = e.target.closest("#dismiss-diagnosis");
  if (dismissBtn) {
    document.getElementById("diagnose-panel").innerHTML = "";
  }
});

document.getElementById("diagnose-panel").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target.matches(".chat-input")) {
    e.preventDefault();
    document.getElementById("btn-continue").click();
  }
});

// -- Descriptions --

let describing = false;

async function generateDescriptions() {
  if (describing) return;
  describing = true;
  const btn = document.getElementById("btn-describe");
  if (btn) {
    btn.textContent = "Generating...";
    btn.disabled = true;
  }
  try {
    await fetch("/api/describe", { method: "POST" });
    prevAgentJSON = "";
    await fetchAgents();
  } catch {
    // silent fail
  }
  describing = false;
  if (btn) {
    btn.textContent = "Describe Agents";
    btn.disabled = false;
  }
}

// -- Init --

fetchAgents();
setInterval(fetchAgents, REFRESH_INTERVAL);
