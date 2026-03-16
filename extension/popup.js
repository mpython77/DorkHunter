/**
 * Popup JS v1.0 — Pro Architecture UI with live log, pagination, direct links.
 *
 * Tabs: Scraper, Results, Templates, Dashboard, Blacklist, Settings.
 * v1.0: Live query log, result pagination (20/page), direct contact links,
 *        query history, error log display.
 */

// ─── Platform Icons ────────────────────────────────────────────────
const PLATFORM_ICONS = {
  instagram: '📸', facebook: '👤', tiktok: '🎵',
  twitter: '🐦', linkedin: '💼', youtube: '🎬',
  pinterest: '📌', snapchat: '👻', threads: '🧵',
};

// v6.0: Pagination state
let resultsPage = 0;
const RESULTS_PER_PAGE = 20;
let filteredResults = [];
let verifyCache = {};  // email → {valid, score, provider}

// ─── Default Settings ───────────────────────────────────────────────
const DEFAULTS = {
  pageDelayMin: 4, pageDelayMax: 8,
  queryDelayMin: 10, queryDelayMax: 20,
  captchaRetries: 3, captchaWait: 5,
  smartSkipThreshold: 3, smartSkipEnabled: 'true',
  tabActive: 'false', notificationsEnabled: 'true',
  soundEnabled: 'true', exportPrefix: 'dorking',
  autoSaveInterval: 10, domainRotation: 'false',
  deepScanEnabled: 'false', theme: 'dark',
};

// ─── DOM Elements ───────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

// ─── Tab Navigation ─────────────────────────────────────────────────
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
    if (tab.dataset.tab === 'dashboard') refreshDashboard();
    if (tab.dataset.tab === 'results') refreshResults();
  });
});

// ─── Theme Toggle ───────────────────────────────────────────────────
const themeToggle = $('themeToggle');
function applyTheme(theme) {
  document.body.classList.toggle('light', theme === 'light');
  themeToggle.textContent = theme === 'light' ? '☀' : '🌙';
}

themeToggle.addEventListener('click', () => {
  const isLight = document.body.classList.toggle('light');
  const theme = isLight ? 'light' : 'dark';
  themeToggle.textContent = isLight ? '☀' : '🌙';
  chrome.storage.local.set({ dorkerTheme: theme });
  $('themeSelect').value = theme;
});

$('themeSelect')?.addEventListener('change', (e) => {
  applyTheme(e.target.value);
  chrome.storage.local.set({ dorkerTheme: e.target.value });
});

// Load saved theme
chrome.storage.local.get('dorkerTheme', (d) => {
  applyTheme(d.dorkerTheme || 'dark');
  if ($('themeSelect')) $('themeSelect').value = d.dorkerTheme || 'dark';
});

// ─── Settings ───────────────────────────────────────────────────────
const SETTING_IDS = [
  'pageDelayMin', 'pageDelayMax', 'queryDelayMin', 'queryDelayMax',
  'captchaRetries', 'captchaWait', 'smartSkipThreshold', 'smartSkipEnabled',
  'tabActive', 'notificationsEnabled', 'soundEnabled', 'exportPrefix',
  'autoSaveInterval', 'domainRotation', 'deepScanEnabled',
  'notifyOnEmail', 'notifyOnCaptcha', 'notifyOnComplete',
];

function getSettings() {
  const s = {};
  SETTING_IDS.forEach(id => { const el = $(id); if (el) s[id] = el.value; });
  return s;
}

function loadSettings() {
  chrome.storage.local.get('dorkerSettings', (d) => {
    const s = d.dorkerSettings || DEFAULTS;
    SETTING_IDS.forEach(id => { const el = $(id); if (el) el.value = s[id] ?? DEFAULTS[id]; });
  });
}

$('btnSaveSettings').addEventListener('click', () => {
  const s = getSettings();
  chrome.storage.local.set({ dorkerSettings: s });
  chrome.runtime.sendMessage({ action: 'UPDATE_SETTINGS', settings: s });
  flashButton($('btnSaveSettings'), '✅ Saved!');
});

$('btnResetSettings').addEventListener('click', () => {
  chrome.storage.local.set({ dorkerSettings: DEFAULTS });
  loadSettings();
  chrome.runtime.sendMessage({ action: 'UPDATE_SETTINGS', settings: DEFAULTS });
  flashButton($('btnResetSettings'), '✅ Reset!');
});

function flashButton(btn, text) {
  const orig = btn.textContent;
  btn.textContent = text;
  setTimeout(() => { btn.textContent = orig; }, 1500);
}

// ─── Scraper Controls ───────────────────────────────────────────────
$('btnStart').addEventListener('click', () => {
  const settings = getSettings();
  chrome.runtime.sendMessage({
    action: 'START',
    category: $('category').value,
    maxPages: parseInt($('maxPages').value) || 5,
    googleDomain: $('googleDomain').value,
    resultsPerPage: parseInt($('resultsPerPage').value) || 10,
    ...settings,
  });
});

$('btnResume').addEventListener('click', () => chrome.runtime.sendMessage({ action: 'RESUME' }));
$('btnPause').addEventListener('click', () => chrome.runtime.sendMessage({ action: 'PAUSE' }));
$('btnStop').addEventListener('click', () => chrome.runtime.sendMessage({ action: 'STOP' }));
$('btnReset').addEventListener('click', () => {
  if (confirm('Reset all results and stats?')) chrome.runtime.sendMessage({ action: 'RESET' });
});

$('btnExportJSON').addEventListener('click', () => chrome.runtime.sendMessage({ action: 'EXPORT', format: 'json' }));
$('btnExportCSV').addEventListener('click', () => chrome.runtime.sendMessage({ action: 'EXPORT', format: 'csv' }));
$('btnExportEmailCSV').addEventListener('click', () => chrome.runtime.sendMessage({ action: 'EXPORT', format: 'csv', emailOnly: true }));

// ─── Status Updates ─────────────────────────────────────────────────
let lastStatus = null;

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'STATUS_UPDATE') updateUI(msg.data);
});

function updateUI(d) {
  lastStatus = d;
  // Stats grid
  $('statTotal').textContent = d.totalResults || 0;
  $('statEmails').textContent = d.emailCount || 0;
  $('statPhones').textContent = d.phoneCount || 0;
  $('statWA').textContent = d.waCount || 0;
  $('statTG').textContent = d.tgCount || 0;
  $('statCaptcha').textContent = `${d.stats?.captchaSolved || 0}/${d.stats?.captchaHits || 0}`;
  $('statPages').textContent = d.stats?.totalPages || 0;
  $('statDupes').textContent = d.stats?.duplicatesSkipped || 0;
  $('statBlocked').textContent = d.stats?.blacklisted || 0;
  $('statSkips').textContent = d.stats?.smartSkipped || 0;
  $('statSaves').textContent = d.stats?.autoSaves || 0;
  $('statDomainRot').textContent = d.stats?.domainRotations || 0;

  // Status badge
  const badge = $('statusBadge');
  if (d.isRunning && !d.isPaused) {
    badge.className = 'status-badge running';
    badge.textContent = '▶ Running';
  } else if (d.isPaused) {
    badge.className = 'status-badge paused';
    badge.textContent = '⏸ Paused';
  } else if (d.totalResults > 0) {
    badge.className = 'status-badge done';
    badge.textContent = '✅ Done';
  } else {
    badge.className = 'status-badge idle';
    badge.textContent = '⏹ Idle';
  }

  // Progress
  const totalQ = d.totalQueries || 1;
  const pct = Math.min(100, Math.round(((d.currentQueryIndex || 0) / totalQ) * 100));
  $('progressFill').style.width = pct + '%';
  $('progressText').textContent = d.isRunning
    ? `Query ${(d.currentQueryIndex || 0) + 1}/${totalQ} • Page ${d.currentPage || 0}/${d.maxPages || 5} • ${d.currentQuery?.slice(0, 55) || ''}...`
    : d.totalResults > 0 ? `Done: ${d.totalResults} profiles found` : 'Ready to start';

  // Buttons
  $('btnStart').disabled = d.isRunning;
  $('btnResume').disabled = d.isRunning || !d.canResume;
  $('btnPause').disabled = !d.isRunning;
  $('btnStop').disabled = !d.isRunning;

  // Scheduler
  if (d.schedulerEnabled && d.schedulerTime) {
    $('schedulerStatus').textContent = `⏰ Scheduled for ${d.schedulerTime} daily`;
    $('schedulerTime').value = d.schedulerTime;
  }

  // Blacklist count
  $('blacklistCount').textContent = d.blacklistCount || 0;

  // v1.0: Sync existing log entries from broadcastStatus (for when popup opens mid-scrape)
  if (d.queryLog?.length && $('logList')) {
    const logList = $('logList');
    // Only sync if log list is empty (first load)
    if (logList.children.length <= 1) {
      logList.innerHTML = '';
      for (const entry of d.queryLog) {
        appendLogEntry(entry);
      }
    }
  }

  // v1.0: Show captchaBackoff in status if elevated
  if (d.captchaBackoff > 1 && d.isRunning) {
    $('progressText').textContent += ` ⚡ Backoff: ${d.captchaBackoff}x`;
  }
}

// ─── Results Tab (v6.0: Pagination + Direct Links) ─────────────────
function refreshResults() {
  if (!lastStatus) return;
  resultsPage = 0;
  filteredResults = lastStatus.recentResults || [];
  renderResultsPage();
}

$('filterResults')?.addEventListener('input', debounce(filterResultsTable, 300));
$('filterType')?.addEventListener('change', filterResultsTable);

function filterResultsTable() {
  if (!lastStatus?.recentResults) return;
  const q = ($('filterResults')?.value || '').toLowerCase();
  const type = $('filterType')?.value || 'all';
  let data = lastStatus.recentResults;

  const platformNames = Object.keys(PLATFORM_ICONS);
  if (platformNames.includes(type)) {
    data = data.filter(r => r.platform === type);
  } else if (type === 'email') {
    data = data.filter(r => r.emails?.length);
  } else if (type === 'phone') {
    data = data.filter(r => r.phones?.length);
  } else if (type === 'whatsapp') {
    data = data.filter(r => r.whatsapp?.length);
  } else if (type === 'telegram') {
    data = data.filter(r => r.telegram?.length);
  } else if (type === 'verified') {
    data = data.filter(r => r.is_verified);
  }

  if (q) data = data.filter(r => JSON.stringify(r).toLowerCase().includes(q));
  resultsPage = 0;
  filteredResults = data;
  renderResultsPage();
}

function renderResultsPage() {
  const body = $('resultsBody');
  if (!body) return;
  body.innerHTML = '';

  const start = resultsPage * RESULTS_PER_PAGE;
  const pageData = filteredResults.slice(start, start + RESULTS_PER_PAGE);
  const totalPages = Math.max(1, Math.ceil(filteredResults.length / RESULTS_PER_PAGE));

  pageData.forEach(r => {
    const tr = document.createElement('tr');
    const icon = PLATFORM_ICONS[r.platform] || '🌐';
    const pName = (r.platform || '').charAt(0).toUpperCase() + (r.platform || '').slice(1);
    const profileUrl = r.profile_url || '#';
    const email = (r.emails || [])[0] || '';
    const phone = (r.phones || [])[0] || '';
    const verified = r.is_verified ? '<span class="verified-tag">✓</span>' : '';

    // Direct action buttons
    let actions = `<a href="${profileUrl}" target="_blank" class="action-btn" title="Open Profile">🔗</a>`;
    if (email) actions += ` <a href="mailto:${email}" class="action-btn" title="Send Email">📧</a>`;
    if (r.whatsapp?.length) {
      const waNum = r.whatsapp[0].replace(/\D/g, '');
      actions += ` <a href="https://wa.me/${waNum}" target="_blank" class="action-btn" title="WhatsApp">💬</a>`;
    }
    if (r.telegram?.length) {
      actions += ` <a href="https://t.me/${r.telegram[0]}" target="_blank" class="action-btn" title="Telegram">✈</a>`;
    }

    // Tag system
    const tag = r._tag || 'none';
    const TAG_LABELS = { none: '🏷', hot: '🔥', warm: '🌤', cold: '❄', contacted: '✅', favorite: '⭐' };
    const tagHtml = `<span class="tag-badge ${tag}" data-username="${r.username}" onclick="cycleTag(this)">${TAG_LABELS[tag]}</span>`;

    // Verify badge (PRO tier-based)
    const emailForVerify = email || '';
    let verifyHtml = '-';
    if (emailForVerify && verifyCache[emailForVerify]) {
      const v = verifyCache[emailForVerify];
      const tier = v.tier || (v.score >= 85 ? 'trusted' : v.score >= 65 ? 'standard' : v.score >= 40 ? 'risky' : 'invalid');
      const tierMap = {
        trusted: { cls: 'verify-valid', icon: '🟢', label: 'Trusted' },
        standard: { cls: 'verify-valid', icon: '🟢', label: 'Standard' },
        risky: { cls: 'verify-risky', icon: '🟡', label: 'Risky' },
        invalid: { cls: 'verify-invalid', icon: '🔴', label: 'Invalid' },
      };
      const t = tierMap[tier] || tierMap.risky;
      const role = v.checks?.role_account ? ' | ⚠️ Role email' : '';
      const trust = v.checks?.provider_trust ? ` | Trust: ${v.checks.provider_trust}%` : '';
      verifyHtml = `<span class="verify-badge ${t.cls}" title="${t.label}: ${v.score}/100 | ${v.provider}${trust}${role}">${t.icon} ${v.score}</span>`;
    } else if (emailForVerify) {
      verifyHtml = `<span class="verify-badge verify-pending" title="Not verified">⏳</span>`;
    }

    tr.innerHTML = `
      <td><span class="platform-icon">${icon}</span> ${pName}</td>
      <td><a href="${profileUrl}" target="_blank">@${r.username}</a>${verified}</td>
      <td>${(r.display_name || '').slice(0, 20)}</td>
      <td>${email ? `<span class="email-tag">${email}</span>` : '-'}</td>
      <td>${phone ? `<span class="phone-tag">${phone}</span>` : '-'}</td>
      <td>${tagHtml}</td>
      <td>${verifyHtml}</td>
      <td class="actions-cell">${actions}</td>
    `;
    body.appendChild(tr);
  });

  // Pagination controls
  $('pageIndicator').textContent = `Page ${resultsPage + 1} / ${totalPages}`;
  $('btnPrevPage').disabled = resultsPage <= 0;
  $('btnNextPage').disabled = resultsPage >= totalPages - 1;
  $('resultCount').textContent = `${filteredResults.length} results (showing ${start + 1}-${Math.min(start + RESULTS_PER_PAGE, filteredResults.length)})`;
}

$('btnPrevPage')?.addEventListener('click', () => { resultsPage--; renderResultsPage(); });
$('btnNextPage')?.addEventListener('click', () => { resultsPage++; renderResultsPage(); });

// ─── Verify All Emails ──────────────────────────────────────────────
$('btnVerifyAll')?.addEventListener('click', async () => {
  if (!lastStatus?.recentResults) return;
  const emails = lastStatus.recentResults
    .map(r => (r.emails || [])[0])
    .filter(Boolean)
    .filter(e => !verifyCache[e]);
  if (!emails.length) {
    $('verifyStatus').textContent = 'All emails already verified!';
    return;
  }
  $('btnVerifyAll').disabled = true;
  $('verifyStatus').textContent = `Verifying ${emails.length} emails...`;
  chrome.runtime.sendMessage({ action: 'VERIFY_EMAILS', emails }, (resp) => {
    $('btnVerifyAll').disabled = false;
    if (resp?.ok && resp.results) {
      for (const r of resp.results) verifyCache[r.email] = r;
      const trusted = resp.results.filter(r => (r.tier === 'trusted' || r.tier === 'standard') || (!r.tier && r.score >= 65)).length;
      const risky = resp.results.filter(r => r.tier === 'risky' || (!r.tier && r.score >= 40 && r.score < 65)).length;
      const invalid = resp.results.filter(r => r.tier === 'invalid' || (!r.tier && r.score < 40)).length;
      $('verifyStatus').textContent = `Done: 🟢${trusted} trusted, 🟡${risky} risky, 🔴${invalid} invalid`;
      renderResultsPage();
    } else {
      $('verifyStatus').textContent = 'Verification failed: ' + (resp?.error || 'unknown');
    }
  });
});

// ─── Live Query Log (v6.0) ──────────────────────────────────────────
const LOG_COLORS = {
  QUERY: '#58a6ff', PAGE: '#8b949e', CAPTCHA: '#d29922',
  RESULT: '#3fb950', SKIP: '#f0883e', DONE: '#3fb950',
  ERROR: '#f85149', SYSTEM: '#bc8cff', IMPORT: '#39d2c0',
};

$('logToggle')?.addEventListener('click', () => {
  const body = $('logBody');
  const icon = $('logToggleIcon');
  if (body.style.display === 'none') {
    body.style.display = 'block';
    icon.textContent = '▲';
  } else {
    body.style.display = 'none';
    icon.textContent = '▼';
  }
});

function appendLogEntry(entry) {
  const list = $('logList');
  if (!list) return;
  const div = document.createElement('div');
  div.className = 'log-entry';
  const color = LOG_COLORS[entry.type] || '#8b949e';
  const time = new Date(entry.time).toLocaleTimeString();
  div.innerHTML = `<span class="log-time">${time}</span> <span style="color:${color}">[${entry.type}]</span> ${entry.msg}`;
  list.appendChild(div);
  // Keep max 50 visible entries
  while (list.children.length > 50) list.removeChild(list.firstChild);
  list.scrollTop = list.scrollHeight;
}

// Listen for real-time log entries from background
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'LOG_ENTRY' && msg.entry) appendLogEntry(msg.entry);
});

// ─── Platform Selections ───────────────────────────────────────────
function getSelectedPlatforms() {
  const checks = document.querySelectorAll('#platformCheckboxes input[type=checkbox]:checked');
  return Array.from(checks).map(c => c.value);
}

$('btnSelectAll')?.addEventListener('click', () => {
  document.querySelectorAll('#platformCheckboxes input[type=checkbox]').forEach(c => c.checked = true);
});

$('btnDeselectAll')?.addEventListener('click', () => {
  document.querySelectorAll('#platformCheckboxes input[type=checkbox]').forEach(c => c.checked = false);
});

// ─── Templates Tab (AI Smart Generator) ────────────────────────────
$('btnGenerate').addEventListener('click', () => {
  const niche = $('nicheInput').value.trim();
  if (!niche) return;
  const platforms = getSelectedPlatforms();
  if (!platforms.length) { alert('Select at least one platform!'); return; }
  const advancedOps = {
    useIntext: $('aiUseIntext')?.checked || false,
    useFiletype: $('aiUseFiletype')?.checked || false,
    useAfter: $('aiUseAfter')?.checked || false,
    useWildcard: $('aiUseWildcard')?.checked || false,
  };
  chrome.runtime.sendMessage({ action: 'GENERATE_TEMPLATE', niche, platforms, advancedOps }, (resp) => {
    if (resp?.queries) {
      $('generatedList').value = resp.queries.join('\n');
      $('genCount').textContent = resp.count;
      $('generatedQueries').style.display = 'block';
    }
  });
});

$('btnStartTemplate')?.addEventListener('click', () => {
  const niche = $('nicheInput').value.trim();
  if (!niche) return;
  const platforms = getSelectedPlatforms();
  if (!platforms.length) { alert('Select at least one platform!'); return; }
  const settings = getSettings();
  chrome.runtime.sendMessage({
    action: 'START_TEMPLATE', niche, platforms,
    maxPages: parseInt($('maxPages').value) || 5,
    googleDomain: $('googleDomain').value,
    ...settings,
  });
  // Switch to scraper tab
  tabs.forEach(t => t.classList.remove('active'));
  tabContents.forEach(t => t.classList.remove('active'));
  tabs[0].classList.add('active');
  tabContents[0].classList.add('active');
});

$('btnSaveAsCustom')?.addEventListener('click', () => {
  const queries = ($('generatedList').value || '').split('\n').filter(Boolean);
  chrome.runtime.sendMessage({ action: 'SAVE_CUSTOM_QUERIES', queries }, () => {
    flashButton($('btnSaveAsCustom'), '✅ Saved!');
  });
});

$('btnSaveCustom').addEventListener('click', () => {
  const queries = ($('customQueries').value || '').split('\n').filter(Boolean);
  chrome.runtime.sendMessage({ action: 'SAVE_CUSTOM_QUERIES', queries }, () => {
    flashButton($('btnSaveCustom'), '✅ Saved!');
  });
});

$('btnLoadCustom').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'GET_CUSTOM_QUERIES' }, (resp) => {
    if (resp?.queries) $('customQueries').value = resp.queries.join('\n');
  });
});

// ─── Dashboard Tab ──────────────────────────────────────────────────
function refreshDashboard() {
  chrome.runtime.sendMessage({ action: 'GET_ANALYTICS' }, (resp) => {
    if (!resp) return;
    $('dashEmailRate').textContent = (resp.emailRate || 0) + '%';

    if (lastStatus) {
      const total = lastStatus.totalResults || 0;
      const phoneRate = total ? Math.round((lastStatus.phoneCount / total) * 100) : 0;
      $('dashPhoneRate').textContent = phoneRate + '%';

      const dur = resp.analytics?.startTime
        ? Math.round((Date.now() - resp.analytics.startTime) / 60000)
        : 0;
      $('dashDuration').textContent = dur + 'm';
      $('dashSpeed').textContent = dur > 0 ? Math.round(total / dur) + '/min' : '0/min';
    }

    // Top queries
    const list = $('topQueriesList');
    if (resp.topQueries?.length) {
      list.innerHTML = resp.topQueries.map(q =>
        `<div class="top-query-item">
          <span class="top-query-name">${q.query}</span>
          <span class="top-query-count">${q.found} (📧${q.emails})</span>
        </div>`
      ).join('');
    }

    // Timeline chart
    drawChart(resp.analytics?.timeline || []);

    // Platform & Contact charts
    if (lastStatus?.recentResults) {
      drawPlatformChart(lastStatus.recentResults);
      drawContactChart(lastStatus);
    }
  });
}

function drawChart(timeline) {
  const canvas = $('timelineChart');
  if (!canvas || !timeline.length) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.offsetWidth;
  const h = canvas.height = 120;
  ctx.clearRect(0, 0, w, h);

  const max = Math.max(...timeline.map(t => t.totalResults), 1);
  const step = w / (timeline.length - 1 || 1);

  ctx.strokeStyle = '#58a6ff'; ctx.lineWidth = 2; ctx.beginPath();
  timeline.forEach((t, i) => {
    const x = i * step;
    const y = h - (t.totalResults / max) * (h - 20) - 10;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.strokeStyle = '#3fb950'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]); ctx.beginPath();
  timeline.forEach((t, i) => {
    const x = i * step;
    const y = h - (t.emailCount / max) * (h - 20) - 10;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke(); ctx.setLineDash([]);

  ctx.fillStyle = '#8b949e'; ctx.font = '9px sans-serif'; ctx.fillText('Results', 5, 12);
  ctx.fillStyle = '#3fb950'; ctx.fillText('Emails', 60, 12);
}

// ─── Platform Bar Chart ─────────────────────────────────────────────
function drawPlatformChart(results) {
  const canvas = $('platformChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.offsetWidth;
  const h = canvas.height = 150;
  ctx.clearRect(0, 0, w, h);

  const counts = {};
  results.forEach(r => { counts[r.platform] = (counts[r.platform] || 0) + 1; });
  const platforms = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
  if (!platforms.length) return;

  const max = Math.max(...Object.values(counts));
  const barW = Math.min(40, (w - 20) / platforms.length - 8);
  const COLORS = { instagram: '#E4405F', facebook: '#1877F2', tiktok: '#00F2EA',
    twitter: '#1DA1F2', linkedin: '#0A66C2', youtube: '#FF0000', pinterest: '#BD081C' };

  platforms.forEach((p, i) => {
    const x = 10 + i * (barW + 8);
    const barH = (counts[p] / max) * (h - 30);
    const y = h - barH - 20;
    ctx.fillStyle = COLORS[p] || '#58a6ff';
    ctx.beginPath();
    ctx.roundRect(x, y, barW, barH, 3);
    ctx.fill();
    // Label
    ctx.fillStyle = '#8b949e'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(p.slice(0, 5), x + barW / 2, h - 6);
    ctx.fillStyle = '#e6edf3';
    ctx.fillText(counts[p], x + barW / 2, y - 4);
  });
  ctx.textAlign = 'start';
}

// ─── Contact Type Pie Chart ─────────────────────────────────────────
function drawContactChart(d) {
  const canvas = $('contactChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.offsetWidth;
  const h = canvas.height = 150;
  ctx.clearRect(0, 0, w, h);

  const data = [
    { label: 'Email', value: d.emailCount || 0, color: '#3fb950' },
    { label: 'Phone', value: d.phoneCount || 0, color: '#58a6ff' },
    { label: 'WhatsApp', value: d.waCount || 0, color: '#25D366' },
    { label: 'Telegram', value: d.tgCount || 0, color: '#0088cc' },
  ].filter(s => s.value > 0);

  if (!data.length) {
    ctx.fillStyle = '#8b949e'; ctx.font = '11px sans-serif';
    ctx.fillText('No contact data yet', w / 2 - 45, h / 2);
    return;
  }

  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = 75, cy = h / 2, r = 55;
  let angle = -Math.PI / 2;

  data.forEach(s => {
    const slice = (s.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, angle, angle + slice);
    ctx.fillStyle = s.color;
    ctx.fill();
    angle += slice;
  });

  // Legend
  data.forEach((s, i) => {
    const lx = 150, ly = 20 + i * 28;
    ctx.fillStyle = s.color;
    ctx.beginPath(); ctx.roundRect(lx, ly, 14, 14, 3); ctx.fill();
    ctx.fillStyle = '#e6edf3'; ctx.font = '11px sans-serif';
    ctx.fillText(`${s.label}: ${s.value} (${Math.round(s.value / total * 100)}%)`, lx + 20, ly + 11);
  });
}

// ─── Full Scheduler ─────────────────────────────────────────────────
$('btnSetScheduler')?.addEventListener('click', () => {
  const time = $('schedulerTime').value;
  if (!time) return;
  const repeat = $('schedulerRepeat')?.value || 'daily';
  const category = $('schedulerCategory')?.value || 'priority';
  const dayEls = document.querySelectorAll('.scheduler-days input:checked');
  const days = Array.from(dayEls).map(el => parseInt(el.value));
  chrome.runtime.sendMessage({ action: 'SET_SCHEDULER', time, repeat, category, days }, () => {
    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const dayStr = days.map(d => dayNames[d]).join(', ');
    $('schedulerStatus').textContent = `⏰ ${time} • ${repeat} • ${dayStr} • ${category}`;
    flashButton($('btnSetScheduler'), '✅ Set!');
  });
});

$('btnClearScheduler')?.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'CLEAR_SCHEDULER' }, () => {
    $('schedulerStatus').textContent = 'No schedule set';
    $('schedulerTime').value = '';
    $('schedulerLastRun').textContent = '';
  });
});

// ─── Tag System ─────────────────────────────────────────────────────
const TAG_CYCLE = ['none', 'hot', 'warm', 'cold', 'contacted', 'favorite'];
const TAG_LABELS = { none: '🏷', hot: '🔥', warm: '🌤', cold: '❄', contacted: '✅', favorite: '⭐' };

// Make cycleTag globally accessible for onclick
window.cycleTag = function(el) {
  const username = el.dataset.username;
  const currentTag = TAG_CYCLE.find(t => el.classList.contains(t)) || 'none';
  const nextIdx = (TAG_CYCLE.indexOf(currentTag) + 1) % TAG_CYCLE.length;
  const nextTag = TAG_CYCLE[nextIdx];
  el.className = `tag-badge ${nextTag}`;
  el.textContent = TAG_LABELS[nextTag];
  // Save tag
  chrome.runtime.sendMessage({ action: 'SET_TAG', username, tag: nextTag });
  // Update local data
  if (lastStatus?.recentResults) {
    const r = lastStatus.recentResults.find(r => r.username === username);
    if (r) r._tag = nextTag;
  }
};

// Tag filter buttons
document.querySelectorAll('.tag-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tag = btn.dataset.tag;
    if (tag === 'all') {
      filteredResults = lastStatus?.recentResults || [];
    } else {
      filteredResults = (lastStatus?.recentResults || []).filter(r => (r._tag || 'none') === tag);
    }
    resultsPage = 0;
    renderResultsPage();
  });
});

// ─── Blacklist Tab ──────────────────────────────────────────────────
$('btnImportBlacklist')?.addEventListener('click', () => {
  const txt = $('blacklistInput').value.trim();
  if (!txt) return;
  const usernames = txt.split('\n').map(u => u.trim()).filter(Boolean);
  chrome.runtime.sendMessage({ action: 'IMPORT_BLACKLIST', usernames }, (resp) => {
    $('blacklistCount').textContent = resp?.count || 0;
    $('blacklistInput').value = '';
    flashButton($('btnImportBlacklist'), `✅ ${usernames.length} added!`);
  });
});

$('btnAddCurrentResults')?.addEventListener('click', () => {
  if (!lastStatus?.recentResults) return;
  const usernames = lastStatus.recentResults.map(r => r.username);
  chrome.runtime.sendMessage({ action: 'IMPORT_BLACKLIST', usernames }, (resp) => {
    $('blacklistCount').textContent = resp?.count || 0;
    flashButton($('btnAddCurrentResults'), `✅ ${usernames.length} added!`);
  });
});

$('btnExportBlacklist')?.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'EXPORT_BLACKLIST' }, (resp) => {
    if (resp?.usernames) {
      const blob = new Blob([resp.usernames.join('\n')], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      chrome.downloads.download({ url, filename: 'blacklist.txt', saveAs: true });
    }
  });
});

$('btnClearBlacklist')?.addEventListener('click', () => {
  if (confirm('Clear all blacklisted usernames?')) {
    chrome.runtime.sendMessage({ action: 'CLEAR_BLACKLIST' }, () => {
      $('blacklistCount').textContent = '0';
    });
  }
});

// ─── Utilities ──────────────────────────────────────────────────────
function debounce(fn, ms) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

// ─── Init ───────────────────────────────────────────────────────────
loadSettings();
chrome.runtime.sendMessage({ action: 'GET_STATUS' });

// Load custom queries
chrome.runtime.sendMessage({ action: 'GET_CUSTOM_QUERIES' }, (resp) => {
  if (resp?.queries) $('customQueries').value = resp.queries.join('\n');
});

// Periodic status refresh
setInterval(() => {
  chrome.runtime.sendMessage({ action: 'GET_STATUS' });
}, 2000);

// ─── Email Verifier Status ──────────────────────────────────────────
function checkVerifierStatus() {
  chrome.runtime.sendMessage({ action: 'GET_VERIFIER_STATUS' }, (resp) => {
    if (!resp) return;
    const icon = $('verifierIcon');
    const mode = $('verifierMode');
    const detail = $('verifierDetail');
    const card = $('verifierStatusCard');
    const bar = $('nativeStatusBar');
    const dot = $('nativeStatusDot');
    const barText = $('nativeStatusText');
    
    if (resp.nativeAvailable) {
      // Settings card
      if (icon) icon.textContent = '🟢';
      if (mode) mode.textContent = 'SMTP Engine — Active';
      if (detail) detail.textContent = '99% accuracy: Syntax + Disposable + MX + SMTP Ping';
      if (card) card.style.background = 'rgba(63,185,80,0.1)';
      // Header bar
      if (bar) { bar.className = 'native-status-bar native-mode'; }
      if (barText) barText.textContent = '🟢 SMTP Verifier Active — 99% accuracy';
    } else {
      // Settings card
      if (icon) icon.textContent = '🟡';
      if (mode) mode.textContent = 'DNS-only — Fallback Mode';
      if (detail) detail.textContent = '85% accuracy: Syntax + Disposable + MX (no server needed)';
      if (card) card.style.background = 'rgba(210,153,34,0.1)';
      // Header bar
      if (bar) { bar.className = 'native-status-bar dns-mode'; }
      if (barText) barText.textContent = '🟡 DNS-only Mode — run install_verifier.bat to upgrade';
    }
    
    // Load cached verification results
    if (resp.cache) {
      Object.assign(verifyCache, resp.cache);
    }
  });
}

// Check verifier status on open
checkVerifierStatus();

// Reconnect button
$('btnReconnectVerifier')?.addEventListener('click', () => {
  $('verifierIcon').textContent = '⏳';
  $('verifierMode').textContent = 'Connecting...';
  chrome.runtime.sendMessage({ action: 'RECONNECT_NATIVE' });
  setTimeout(checkVerifierStatus, 2000);
});

