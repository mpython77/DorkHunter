/**
 * Background Service Worker v1.0 — Pro Architecture.
 *
 * Platforms: Instagram, Facebook, TikTok, Twitter/X, LinkedIn,
 *            YouTube, Pinterest, Snapchat, Threads
 *
 * v1.0 Features:
 * ─ Anti-Detection: 15 UA rotation, exponential backoff, keep-alive
 * ─ State:   Full chrome.storage persistence, crash recovery
 * ─ Logging: Real-time query log → popup
 * ─ Core:    Resume, Smart Skip, CAPTCHA Solver, Multi-domain
 * ─ Export:  JSON/CSV/Email-only with field control
 * ─ Extra:   Auto-Save, Domain Rotation, Scheduler, Blacklist,
 *            WhatsApp/Telegram, Dashboard Analytics, Query History
 */

importScripts('queries.js');

// ═══════════════════════════════════════════════════════════════════
//  ANTI-DETECTION: User-Agent Rotation Pool
// ═══════════════════════════════════════════════════════════════════
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0',
  'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:133.0) Gecko/20100101 Firefox/133.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 OPR/116.0.0.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0',
];
function getRandomUA() { return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]; }

// ═══════════════════════════════════════════════════════════════════
//  KEEP-ALIVE: Prevent Service Worker from dying (5min timeout)
// ═══════════════════════════════════════════════════════════════════
chrome.alarms.create('keepAlive', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'keepAlive' && state.isRunning) {
    console.log('[KeepAlive] Service worker heartbeat');
  }
});

// ─── State ───────────────────────────────────────────────────────────
let state = {
  isRunning: false,
  isPaused: false,
  currentQueryIndex: 0,
  currentPage: 0,
  maxPages: 5,
  selectedCategory: 'priority',
  queries: [],
  customQueries: [],
  seenUsernames: new Set(),
  blacklist: new Set(),
  results: [],
  tabId: null,
  // Settings
  googleDomain: 'www.google.com',
  resultsPerPage: 10,
  smartSkipThreshold: 3,
  smartSkipEnabled: true,
  captchaRetries: 3,
  captchaWait: 5000,
  tabActive: false,
  notificationsEnabled: true,
  soundEnabled: true,
  exportPrefix: 'dorking',
  autoSaveInterval: 10,  // save every N results
  domainRotation: false,
  domainRotationList: [
    'www.google.com', 'www.google.co.uk', 'www.google.com.au',
    'www.google.de', 'www.google.fr', 'www.google.es',
    'www.google.it', 'www.google.com.br', 'www.google.ca',
  ],
  domainRotationIndex: 0,
  schedulerEnabled: false,
  schedulerTime: '', // HH:MM format
  deepScanEnabled: false,
  // v1.0: Anti-detection
  captchaBackoff: 1,     // exponential multiplier (1x, 2x, 4x...)
  consecutiveCaptchas: 0,
  // v1.0: Query Log (real-time)
  queryLog: [],          // [{time, type, msg}] — last 100 entries
  // v1.0: Query History
  queryHistory: [],      // [{query, found, emails, timestamp}] — last 50
  // v1.0: Error Log
  errorLog: [],          // [{time, msg}] — last 50
  // v1.0: Tags
  tags: {},              // {username: 'hot'|'warm'|'cold'|'contacted'|'favorite'}
  // v1.0: Notification prefs
  notifyOnEmail: true,
  notifyOnCaptcha: true,
  notifyOnComplete: true,
  // v1.0: Scheduler extended
  schedulerRepeat: 'daily',
  schedulerCategory: 'priority',
  schedulerDays: [1, 2, 3, 4, 5],
  // Analytics
  analytics: {
    queryStats: {},
    categoryStats: {},
    timeline: [],
    startTime: null,
    endTime: null,
  },
  stats: {
    totalQueries: 0, completedQueries: 0, totalPages: 0,
    totalResults: 0, duplicatesSkipped: 0, blacklisted: 0,
    captchaHits: 0, captchaSolved: 0,
    noResultsSkipped: 0, smartSkipped: 0, errors: 0,
    autoSaves: 0, domainRotations: 0,
  },
  pageDelayMin: 4000,
  pageDelayMax: 8000,
  queryDelayMin: 10000,
  queryDelayMax: 20000,
};

// ═══════════════════════════════════════════════════════════════════
//  REAL-TIME LOGGING
// ═══════════════════════════════════════════════════════════════════
function addLog(type, msg) {
  const entry = { time: Date.now(), type, msg };
  state.queryLog.push(entry);
  if (state.queryLog.length > 100) state.queryLog.shift();
  // Broadcast to popup
  chrome.runtime.sendMessage({ action: 'LOG_ENTRY', entry }).catch(() => {});
  console.log(`[${type}] ${msg}`);
}

function addError(msg) {
  state.errorLog.push({ time: Date.now(), msg });
  if (state.errorLog.length > 50) state.errorLog.shift();
  state.stats.errors++;
  addLog('ERROR', msg);
}

function addQueryHistory(query, found, emails) {
  state.queryHistory.unshift({ query, found, emails, timestamp: Date.now() });
  if (state.queryHistory.length > 50) state.queryHistory.pop();
}

// ─── Helpers ─────────────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function randomDelay(min, max) { return sleep(min + Math.random() * (max - min)); }

function getGoogleDomain() {
  if (state.domainRotation && state.domainRotationList.length > 0) {
    const domain = state.domainRotationList[state.domainRotationIndex % state.domainRotationList.length];
    return domain;
  }
  return state.googleDomain;
}

function rotateDomain() {
  if (state.domainRotation) {
    state.domainRotationIndex++;
    state.stats.domainRotations++;
  }
}

function buildSearchUrl(query, start = 0) {
  const domain = getGoogleDomain();
  const params = new URLSearchParams({ q: query, num: String(state.resultsPerPage) });
  if (start > 0) params.set('start', String(start));
  return `https://${domain}/search?${params.toString()}`;
}

function notify(title, message) {
  if (!state.notificationsEnabled) return;
  chrome.notifications.create({
    type: 'basic', iconUrl: 'icons/icon128.png', title, message,
  });
  if (state.soundEnabled) playSound();
}

function playSound() {
  // Use offscreen document for audio (MV3 compatible)
  try {
    chrome.offscreen?.createDocument?.({
      url: 'sound.html',
      reasons: ['AUDIO_PLAYBACK'],
      justification: 'Play notification sound',
    }).catch(() => {});
  } catch (e) {}
}

// ─── Platform Config ────────────────────────────────────────────────
const PLATFORM_SITES = {
  instagram: { site: 'instagram.com', skipFilter: '-"/p/" -"/reel/" -"/explore/"' },
  facebook:  { site: 'facebook.com',  skipFilter: '-"/posts/" -"/photos/" -"/videos/"' },
  tiktok:    { site: 'tiktok.com',    skipFilter: '-"/video/" -"/tag/"' },
  twitter:   { site: 'x.com',        skipFilter: '-"/status/" -"/hashtag/"' },
  linkedin:  { site: 'linkedin.com',  skipFilter: '-"/posts/" -"/pulse/" -"/jobs/"' },
  youtube:   { site: 'youtube.com',   skipFilter: '-"/watch" -"/shorts/" -"/playlist"' },
  pinterest: { site: 'pinterest.com', skipFilter: '-"/pin/" -"/ideas/"' },
  snapchat:  { site: 'snapchat.com',  skipFilter: '' },
  threads:   { site: 'threads.net',   skipFilter: '-"/post/"' },
};

// ─── Query Templates ────────────────────────────────────────────────
function generateQueriesFromNiche(niche, platforms, advancedOps = {}) {
  const selectedPlatforms = platforms || ['instagram'];
  const queries = [];

  const queryPatterns = [
    // ── Basic ──
    { suffix: '', desc: 'brand' },
    { suffix: '"email"', desc: 'email' },
    { suffix: '"@gmail.com"', desc: 'gmail' },
    { suffix: '"@outlook.com" OR "@yahoo.com"', desc: 'outlook/yahoo' },
    { suffix: '"DM" OR "order"', desc: 'DM' },
    { suffix: '"shop"', desc: 'shop' },
    { suffix: '"worldwide shipping"', desc: 'shipping' },
    { suffix: '"small business"', desc: 'small biz' },
    { suffix: '"handmade"', desc: 'handmade' },
    { suffix: '"contact"', desc: 'contact' },
    // ── Pro ──
    { suffix: '"brand" "founder"', desc: 'founder' },
    { suffix: '"wholesale"', desc: 'wholesale' },
    { suffix: '"sustainable"', desc: 'sustainable' },
    { suffix: '"collab"', desc: 'collab' },
    { suffix: '"whatsapp" OR "telegram"', desc: 'messaging' },
    { suffix: '"link in bio" OR "linktree"', desc: 'linktree' },
    // ── Advanced PRO ──
    { suffix: '"influencer" OR "content creator"', desc: 'influencer' },
    { suffix: '"open to collabs" OR "PR friendly"', desc: 'PR' },
    { suffix: '"brand ambassador" OR "gifted"', desc: 'ambassador' },
    { suffix: '"just launched" OR "new brand"', desc: 'startup' },
    { suffix: '"free shipping" "DM for orders"', desc: 'DM orders' },
    { suffix: '"CEO" OR "founder" "brand"', desc: 'B2B' },
    // ── intitle / advanced operators ──
    { prefix: 'intitle:"', suffix: '"', desc: 'intitle', raw: true },
    { suffix: '-"spam" -"bot" -"fake"', desc: 'clean' },
  ];

  for (const platformKey of selectedPlatforms) {
    const cfg = PLATFORM_SITES[platformKey];
    if (!cfg) continue;
    for (const p of queryPatterns) {
      let q;
      if (p.raw && p.prefix) {
        q = `${p.prefix}${niche}${p.suffix} site:${cfg.site}`;
        if (cfg.skipFilter) q += ' ' + cfg.skipFilter;
      } else {
        const parts = [`site:${cfg.site}`, `"${niche}"`];
        if (p.suffix) parts.push(p.suffix);
        if (cfg.skipFilter) parts.push(cfg.skipFilter);
        q = parts.join(' ');
      }
      queries.push(q);
    }

    // ── Advanced Operator Queries (AI Generated) ──
    if (advancedOps.useIntext) {
      queries.push(`intext:"@gmail.com" site:${cfg.site} "${niche}" ${cfg.skipFilter || ''}`);
      queries.push(`intext:"email" site:${cfg.site} "${niche}" "contact" ${cfg.skipFilter || ''}`);
      queries.push(`intext:"wa.me" site:${cfg.site} "${niche}" ${cfg.skipFilter || ''}`);
    }
    if (advancedOps.useAfter) {
      queries.push(`site:${cfg.site} "${niche}" "brand" after:2025-01-01 ${cfg.skipFilter || ''}`);
      queries.push(`site:${cfg.site} "${niche}" "new" after:2025-06-01 ${cfg.skipFilter || ''}`);
    }
    if (advancedOps.useWildcard) {
      queries.push(`site:${cfg.site} "* ${niche}" "brand" ${cfg.skipFilter || ''}`);
      queries.push(`site:${cfg.site} "founder of *" "${niche}" ${cfg.skipFilter || ''}`);
    }
  }

  // ── Filetype (platform-agnostic) ──
  if (advancedOps.useFiletype) {
    queries.push(`filetype:pdf "${niche}" "email" "contact"`);
    queries.push(`filetype:csv "${niche}" "email" "brand"`);
    queries.push(`filetype:pdf "${niche}" "wholesale" "catalog"`);
  }

  return queries;
}

// ─── State Persistence ──────────────────────────────────────────────
async function saveState() {
  const s = {
    currentQueryIndex: state.currentQueryIndex,
    selectedCategory: state.selectedCategory,
    results: state.results,
    seenUsernames: [...state.seenUsernames],
    blacklist: [...state.blacklist],
    customQueries: state.customQueries,
    queries: state.queries,
    stats: state.stats,
    analytics: state.analytics,
    maxPages: state.maxPages,
    googleDomain: state.googleDomain,
    // v1.0
    queryHistory: state.queryHistory,
    captchaBackoff: state.captchaBackoff,
  };
  await chrome.storage.local.set({ dorkerState: s });
}

async function loadState() {
  const { dorkerState } = await chrome.storage.local.get('dorkerState');
  if (dorkerState) {
    state.results = dorkerState.results || [];
    state.seenUsernames = new Set(dorkerState.seenUsernames || []);
    state.blacklist = new Set(dorkerState.blacklist || []);
    state.customQueries = dorkerState.customQueries || [];
    state.stats = { ...state.stats, ...(dorkerState.stats || {}) };
    state.analytics = { ...state.analytics, ...(dorkerState.analytics || {}) };
    state.currentQueryIndex = dorkerState.currentQueryIndex || 0;
    state.selectedCategory = dorkerState.selectedCategory || 'priority';
    state.queries = dorkerState.queries || [];
    state.maxPages = dorkerState.maxPages || 5;
    state.googleDomain = dorkerState.googleDomain || 'www.google.com';
    // v1.0
    state.queryHistory = dorkerState.queryHistory || [];
    state.captchaBackoff = dorkerState.captchaBackoff || 1;
  }
  // Load settings
  const { dorkerSettings } = await chrome.storage.local.get('dorkerSettings');
  if (dorkerSettings) applySettings(dorkerSettings);
  // Load blacklist
  const { dorkerBlacklist } = await chrome.storage.local.get('dorkerBlacklist');
  if (dorkerBlacklist) state.blacklist = new Set(dorkerBlacklist);
}

function applySettings(s) {
  state.pageDelayMin = (s.pageDelayMin || 4) * 1000;
  state.pageDelayMax = (s.pageDelayMax || 8) * 1000;
  state.queryDelayMin = (s.queryDelayMin || 10) * 1000;
  state.queryDelayMax = (s.queryDelayMax || 20) * 1000;
  state.captchaRetries = s.captchaRetries || 3;
  state.captchaWait = (s.captchaWait || 5) * 1000;
  state.smartSkipThreshold = s.smartSkipThreshold || 3;
  state.smartSkipEnabled = s.smartSkipEnabled !== 'false';
  state.tabActive = s.tabActive === 'true';
  state.notificationsEnabled = s.notificationsEnabled !== 'false';
  state.soundEnabled = s.soundEnabled !== 'false';
  state.exportPrefix = s.exportPrefix || 'dorking';
  state.autoSaveInterval = parseInt(s.autoSaveInterval) || 10;
  state.domainRotation = s.domainRotation === 'true';
  state.deepScanEnabled = s.deepScanEnabled === 'true';
}

// ─── Auto-Save (crash protection) ──────────────────────────────────
let autoSaveCounter = 0;
async function checkAutoSave() {
  autoSaveCounter++;
  if (autoSaveCounter >= state.autoSaveInterval) {
    autoSaveCounter = 0;
    state.stats.autoSaves++;
    await saveState();
    console.log(`[AutoSave] ${state.results.length} results saved`);
  }
}

// ─── Scheduler ──────────────────────────────────────────────────────
chrome.alarms?.onAlarm?.addListener((alarm) => {
  if (alarm.name === 'dorker-scheduler' && !state.isRunning) {
    console.log('[Scheduler] Auto-starting scraping...');
    startScraping(false);
  }
});

function setScheduler(timeStr, repeat = 'daily', category = 'priority', days = [1,2,3,4,5]) {
  if (!timeStr || !chrome.alarms) return;
  chrome.alarms.clear('dorker-scheduler');
  const [hours, minutes] = timeStr.split(':').map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  const delayMs = target - now;
  const period = repeat === 'once' ? undefined : 1440; // daily = 24h
  chrome.alarms.create('dorker-scheduler', { delayInMinutes: delayMs / 60000, ...(period && { periodInMinutes: period }) });
  state.schedulerEnabled = true;
  state.schedulerTime = timeStr;
  state.schedulerRepeat = repeat;
  state.schedulerCategory = category;
  state.schedulerDays = days;
}

function clearScheduler() {
  chrome.alarms?.clear?.('dorker-scheduler');
  state.schedulerEnabled = false;
  state.schedulerTime = '';
}

// ─── Desktop Notifications ───────────────────────────────────────────
function sendNotification(title, message, type = 'basic') {
  if (!state.notificationsEnabled) return;
  try {
    chrome.notifications.create(`dorker-${Date.now()}`, {
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: `🔍 Dorker PRO: ${title}`,
      message: message,
      priority: 2,
    });
  } catch (e) { /* notifications may not be available */ }
}

// ═══════════════════════════════════════════════════════════════════
//  EMAIL VERIFICATION ENGINE
//  Native Messaging → dorker_verify.exe (SMTP + MX + Disposable)
//  Fallback → DNS-only via dns.google API
// ═══════════════════════════════════════════════════════════════════
let nativePort = null;
let nativeAvailable = null; // null = not tested, true/false = result
let pendingVerifications = new Map(); // email → {resolve, reject}

// ─── Connect to Native App ──────────────────────────────────────────
function connectNative() {
  try {
    nativePort = chrome.runtime.connectNative('com.dorker.verifier');
    nativePort.onMessage.addListener((msg) => {
      if (msg.action === 'PONG') {
        nativeAvailable = true;
        addLog('VERIFY', '🟢 Dorker Verify engine connected (v' + (msg.version || '1.0') + ')');
      } else if (msg.action === 'VERIFY_RESULT' && msg.result) {
        const pending = pendingVerifications.get(msg.result.email);
        if (pending) {
          pending.resolve(msg.result);
          pendingVerifications.delete(msg.result.email);
        }
      } else if (msg.action === 'VERIFY_BATCH_RESULT' && msg.results) {
        for (const r of msg.results) {
          const pending = pendingVerifications.get(r.email);
          if (pending) {
            pending.resolve(r);
            pendingVerifications.delete(r.email);
          }
        }
      } else if (msg.action === 'ERROR') {
        addError('Verify engine: ' + (msg.error || 'unknown error'));
      }
    });
    nativePort.onDisconnect.addListener(() => {
      nativePort = null;
      if (nativeAvailable) {
        addLog('VERIFY', '🔴 Dorker Verify engine disconnected');
        nativeAvailable = false;
      } else {
        nativeAvailable = false;
      }
    });
    // Ping to check if alive
    nativePort.postMessage({ action: 'PING' });
  } catch (e) {
    nativeAvailable = false;
    nativePort = null;
  }
}

// ─── Verify single email (Native or DNS fallback) ────────────────────
async function verifyEmail(email) {
  if (!email || !email.includes('@')) {
    return { email, valid: false, score: 0, provider: 'unknown', checks: { syntax: false } };
  }

  // Try native app first
  if (nativeAvailable && nativePort) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        pendingVerifications.delete(email);
        // Fallback to DNS
        verifyEmailDNS(email).then(resolve);
      }, 15000);
      
      pendingVerifications.set(email, {
        resolve: (result) => { clearTimeout(timeout); resolve(result); },
        reject,
      });
      nativePort.postMessage({ action: 'VERIFY_EMAIL', email });
    });
  }
  
  // Fallback: DNS-only verification
  return verifyEmailDNS(email);
}

// ─── DNS-only verification with Provider Intelligence (no server needed) ─────
async function verifyEmailDNS(email) {
  const domain = email.split('@')[1];
  const local = email.split('@')[0];
  let score = 0;
  const checks = { syntax: false, role_account: false, disposable: false, provider_trust: 0, mx_found: false, mx_host: '', smtp_valid: false, catch_all: false, smtp_error: 'DNS-only mode', has_gravatar: false };

  // 1. Syntax (10 pts)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  checks.syntax = emailRegex.test(email);
  if (!checks.syntax) return { email, valid: false, score: 0, provider: 'unknown', tier: 'invalid', checks };
  score += 10;

  // 2. Role-based (5 pts)
  const roleEmails = new Set(['info','admin','support','sales','contact','help','noreply','no-reply','postmaster','webmaster','abuse','billing','office','marketing','hr','hello','team','feedback','general','reception','mail','careers','jobs','newsletter','subscribe','root','www','spam','dev','ops']);
  checks.role_account = roleEmails.has(local);
  if (!checks.role_account) score += 5;

  // 3. Disposable (15 pts)
  const disposable = new Set(['mailinator.com','tempmail.com','guerrillamail.com','throwaway.email','10minutemail.com','trashmail.com','yopmail.com','fakeinbox.com','dispostable.com','maildrop.cc','guerrillamail.net','sharklasers.com','grr.la','pokemail.net','spam4.me','binkmail.com','trashmail.net','trashmail.me','temp-mail.org','emailondeck.com']);
  checks.disposable = disposable.has(domain);
  if (checks.disposable) return { email, valid: false, score, provider: 'disposable', tier: 'invalid', checks };
  score += 15;

  // 4. Provider Intelligence (15 pts)
  const providerDB = {
    'gmail.com': { name: 'gmail', trust: 95 },
    'googlemail.com': { name: 'gmail', trust: 95 },
    'outlook.com': { name: 'outlook', trust: 92 },
    'hotmail.com': { name: 'outlook', trust: 92 },
    'live.com': { name: 'outlook', trust: 90 },
    'icloud.com': { name: 'icloud', trust: 95 },
    'protonmail.com': { name: 'protonmail', trust: 98 },
    'proton.me': { name: 'protonmail', trust: 98 },
    'yahoo.com': { name: 'yahoo', trust: 82 },
    'aol.com': { name: 'aol', trust: 78 },
    'zoho.com': { name: 'zoho', trust: 85 },
    'mail.ru': { name: 'mailru', trust: 70 },
    'yandex.ru': { name: 'yandex', trust: 72 },
    'yandex.com': { name: 'yandex', trust: 72 },
  };
  const providerInfo = providerDB[domain] || { name: 'custom', trust: 50 };
  // Education/Government boost
  if (domain.endsWith('.edu') || domain.endsWith('.ac.uk') || domain.endsWith('.ac.th') || domain.endsWith('.ac.za')) {
    providerInfo.name = 'education'; providerInfo.trust = 90;
  } else if (domain.endsWith('.gov') || domain.endsWith('.mil')) {
    providerInfo.name = 'government'; providerInfo.trust = 96;
  }
  const provider = providerInfo.name;
  checks.provider_trust = providerInfo.trust;
  score += Math.round(providerInfo.trust * 15 / 100);

  // 5. MX Record (20 pts)
  try {
    const resp = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`);
    const data = await resp.json();
    if (data.Answer && data.Answer.length > 0) {
      checks.mx_found = true;
      checks.mx_host = data.Answer[0].data || '';
      score += 20;
    }
  } catch (e) { /* DNS check failed */ }

  // 6. Trust-based SMTP substitute (no actual SMTP in DNS mode)
  if (providerInfo.trust >= 90) { score += 20; checks.smtp_error = `${provider} trusted — SMTP not needed`; }
  else if (providerInfo.trust >= 80) { score += 15; checks.smtp_error = `${provider} — trust-based scoring`; }
  else if (providerInfo.trust >= 70) { score += 10; }

  if (score > 100) score = 100;
  const tier = score >= 85 ? 'trusted' : score >= 65 ? 'standard' : score >= 40 ? 'risky' : 'invalid';

  return { email, valid: score >= 50, score, provider, tier, checks };
}

// ─── Batch verify (for "Verify All" button) ──────────────────────────
async function verifyBatch(emails) {
  const results = [];
  // Process 5 at a time
  for (let i = 0; i < emails.length; i += 5) {
    const batch = emails.slice(i, i + 5);
    const batchResults = await Promise.all(batch.map(e => verifyEmail(e)));
    results.push(...batchResults);
  }
  return results;
}

// Try connecting to native app on startup
try { connectNative(); } catch (e) { nativeAvailable = false; }

// ─── Tab Navigation ─────────────────────────────────────────────────
async function navigateTab(url) {
  try {
    await chrome.tabs.update(state.tabId, { url });
  } catch (e) {
    // Tab may have been closed — recreate it
    const tab = await chrome.tabs.create({ url, active: state.tabActive });
    state.tabId = tab.id;
  }
  return new Promise(resolve => {
    let resolved = false;
    function listener(tabId, changeInfo) {
      if (tabId === state.tabId && changeInfo.status === 'complete' && !resolved) {
        resolved = true;
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    }
    chrome.tabs.onUpdated.addListener(listener);
    // Safety timeout — never hang forever
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    }, 30000);
  });
}

// ─── Parse Page ─────────────────────────────────────────────────────
async function parseCurrentPage() {
  try {
    // Inject content.js (v5.0 multi-platform parser)
    await chrome.scripting.executeScript({
      target: { tabId: state.tabId },
      files: ['content.js'],
    });
    await sleep(800);

    // Use sendMessage to content script first
    try {
      const resp = await chrome.tabs.sendMessage(state.tabId, { action: 'PARSE_RESULTS' });
      if (resp && resp.ok) {
        return {
          results: resp.results || [],
          pageInfo: {
            hasNextPage: resp.hasNextPage || false,
            hasCaptcha: resp.hasCaptcha || false,
            noResults: resp.noResults || false,
          },
        };
      }
    } catch (_) {}

    // Fallback: inline multi-platform parser
    const [data] = await chrome.scripting.executeScript({
      target: { tabId: state.tabId },
      func: () => {
        const SOCIAL_PATTERNS = {
          instagram: { re: /instagram\.com\/([a-zA-Z0-9_.]+)/, skip: ['/p/','/reel/','/explore/','/stories/','/tv/'], bad: ['p','reel','explore','stories','tv','about','accounts','directory','tags'] },
          facebook:  { re: /facebook\.com\/([a-zA-Z0-9_.]+)/, skip: ['/photo/','/photos/','/videos/','/watch/','/events/','/groups/'], bad: ['login','help','policies','watch','groups','events','pages','marketplace','share','sharer','permalink.php','photo.php','reel'] },
          tiktok:    { re: /tiktok\.com\/@([a-zA-Z0-9_.]+)/, skip: ['/video/','/embed/','/tag/'], bad: ['login','signup','explore','foryou'] },
          twitter:   { re: /(?:twitter|x)\.com\/([a-zA-Z0-9_]+)/, skip: ['/status/','/i/','/search','/hashtag/'], bad: ['login','signup','home','explore','search','notifications','messages','settings','i','intent','share','compose'] },
          linkedin:  { re: /linkedin\.com\/(?:in|company)\/([a-zA-Z0-9\-_.]+)/, skip: ['/posts/','/pulse/','/jobs/'], bad: ['login','signup','feed','jobs','messaging'] },
          youtube:   { re: /youtube\.com\/(?:@|channel\/|c\/|user\/)([a-zA-Z0-9_\-]+)/, skip: ['/watch','/shorts/','/playlist'], bad: ['watch','results','feed','premium'] },
          pinterest: { re: /pinterest\.com\/([a-zA-Z0-9_]+)/, skip: ['/pin/','/ideas/','/search/'], bad: ['pin','ideas','search','settings','login'] },
          snapchat:  { re: /snapchat\.com\/add\/([a-zA-Z0-9_.]+)/, skip: [], bad: ['login'] },
          threads:   { re: /threads\.net\/@([a-zA-Z0-9_.]+)/, skip: ['/post/'], bad: ['login'] },
        };

        const containers = document.querySelectorAll('div.MjjYud, div.g');
        const results = [];
        const seen = new Set();

        containers.forEach(c => {
          const links = c.querySelectorAll('a[href]');
          let foundPlatform = null, foundUsername = null, foundHref = '';

          for (const link of links) {
            const href = link.href || '';
            for (const [pName, pCfg] of Object.entries(SOCIAL_PATTERNS)) {
              const m = pCfg.re.exec(href);
              if (!m) continue;
              if (pCfg.skip.some(s => href.includes(s))) continue;
              const u = m[1].toLowerCase();
              if (pCfg.bad.includes(u) || u.length < 2) continue;
              foundPlatform = pName; foundUsername = u; foundHref = href;
              break;
            }
            if (foundPlatform) break;
          }

          if (!foundPlatform || !foundUsername) return;
          const key = foundPlatform + ':' + foundUsername;
          if (seen.has(key)) return;
          seen.add(key);

          const h3 = c.querySelector('h3');
          const snip = c.querySelector('div.VwiC3b');
          const text = (h3?.textContent || '') + ' ' + (snip?.textContent || '');
          const emails = (text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi) || []).map(e => e.toLowerCase());
          const phones = (text.match(/(?:\+?\d{1,4}[\s-.]?)?\(?\d{1,4}\)?[\s-.]?\d{2,4}[\s-.]?\d{2,4}/g) || []).filter(p => p.replace(/\D/g,'').length >= 7);

          results.push({
            platform: foundPlatform, username: foundUsername, profile_url: foundHref,
            display_name: (h3?.textContent?.trim() || foundUsername).slice(0, 50),
            bio: snip?.textContent?.trim()?.slice(0, 200) || '',
            emails: [...new Set(emails)].slice(0, 3),
            phones: [...new Set(phones)].slice(0, 3),
            whatsapp: [], telegram: [], follower_text: '', location: '',
            hashtags: [], website: '', is_verified: false,
          });
        });

        const body = document.body.textContent.toLowerCase();
        return {
          results,
          pageInfo: {
            hasNextPage: !!document.querySelector('a#pnnext'),
            hasCaptcha: body.includes('unusual traffic') || body.includes('are not a robot') || !!document.querySelector('#captcha-form'),
            noResults: body.includes('did not match any documents') || body.includes('no results found') || body.includes('hech narsa topilmadi'),
          },
        };
      },
    });
    return data?.result || { results: [], pageInfo: { hasNextPage: false, hasCaptcha: false, noResults: false } };
  } catch (e) {
    console.error('Parse error:', e);
    return { results: [], pageInfo: { hasNextPage: false, hasCaptcha: false, noResults: false } };
  }
}

// ─── CAPTCHA Auto-Solver ────────────────────────────────────────────
async function solveCaptcha() {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: state.tabId },
      func: () => {
        const checkbox = document.querySelector('#recaptcha-anchor, .recaptcha-checkbox');
        if (checkbox) { checkbox.click(); return; }
        const iframes = document.querySelectorAll('iframe[src*="recaptcha"]');
        for (const iframe of iframes) {
          try {
            const box = iframe.contentDocument?.querySelector('.recaptcha-checkbox, #recaptcha-anchor');
            if (box) { box.click(); return; }
          } catch (e) {}
        }
      },
    });
    await sleep(state.captchaWait);
    return await verifyCaptchaSolved();
  } catch (e) { return false; }
}

async function verifyCaptchaSolved() {
  try {
    const [check] = await chrome.scripting.executeScript({
      target: { tabId: state.tabId },
      func: () => {
        const body = document.body.textContent.toLowerCase();
        return !(body.includes('unusual traffic') || body.includes('are not a robot') || !!document.querySelector('#captcha-form'));
      },
    });
    return check?.result ?? false;
  } catch (e) {}
  return false;
}

// ─── Scrape Query (v1.0: logging + exponential backoff) ─────────────
async function scrapeQuery(query) {
  state.stats.totalQueries++;
  const category = state.selectedCategory;
  let consecutiveEmpty = 0;
  let queryEmailCount = 0;

  addLog('QUERY', `▶ [${state.stats.totalQueries}] ${query.slice(0, 80)}`);

  // Analytics: track query start
  if (!state.analytics.queryStats[query]) {
    state.analytics.queryStats[query] = { found: 0, emails: 0, startTime: Date.now() };
  }

  for (let page = 0; page < state.maxPages; page++) {
    if (!state.isRunning) return;
    while (state.isPaused) { await sleep(500); if (!state.isRunning) return; }

    state.currentPage = page + 1;
    addLog('PAGE', `  📄 Page ${page + 1}/${state.maxPages}`);
    broadcastStatus();

    await navigateTab(buildSearchUrl(query, page * state.resultsPerPage));
    await randomDelay(1500, 3000);

    let { results: pageResults, pageInfo } = await parseCurrentPage();

    // No results — skip
    if (pageInfo.noResults) {
      addLog('SKIP', `  ⏭ No results — skipping`);
      state.stats.noResultsSkipped++;
      break;
    }

    // CAPTCHA — auto-solve with exponential backoff
    if (pageInfo.hasCaptcha) {
      state.stats.captchaHits++;
      state.consecutiveCaptchas++;
      const backoffDelay = Math.min(state.captchaWait * state.captchaBackoff, 120000); // max 2 min
      addLog('CAPTCHA', `  🛡 CAPTCHA detected! Backoff: ${Math.round(backoffDelay/1000)}s (x${state.captchaBackoff})`);
      broadcastStatus();
      notify('⚠️ CAPTCHA Detected', `Attempt with ${Math.round(backoffDelay/1000)}s backoff (${state.consecutiveCaptchas} consecutive)`);

      let solved = false;
      for (let a = 1; a <= state.captchaRetries; a++) {
        addLog('CAPTCHA', `  🔄 Solve attempt ${a}/${state.captchaRetries}...`);
        solved = await solveCaptcha();
        if (solved) break;
        await sleep(backoffDelay);
      }
      if (solved) {
        state.stats.captchaSolved++;
        state.captchaBackoff = 1; // reset on success
        state.consecutiveCaptchas = 0;
        addLog('CAPTCHA', `  ✅ CAPTCHA solved!`);
        notify('CAPTCHA Solved ✅', 'Auto-solver successfully bypassed CAPTCHA');
        await sleep(3000);
        const retry = await parseCurrentPage();
        if (!retry.pageInfo.hasCaptcha) {
          pageResults = retry.results;
          pageInfo = retry.pageInfo;
        } else { break; }
      } else {
        // Exponential backoff: double for next time
        state.captchaBackoff = Math.min(state.captchaBackoff * 2, 16);
        addLog('CAPTCHA', `  ❌ Failed. Backoff → ${state.captchaBackoff}x. Rotating domain...`);
        notify('CAPTCHA Failed ❌', `Backoff increased to ${state.captchaBackoff}x. Rotating domain...`);
        rotateDomain();
        await sleep(backoffDelay * 2); // longer wait after failure
        break;
      }
    } else {
      // Reset backoff on successful page (no CAPTCHA)
      if (state.captchaBackoff > 1) {
        state.captchaBackoff = Math.max(1, state.captchaBackoff / 2);
      }
      state.consecutiveCaptchas = 0;
    }

    // Process results
    const beforeCount = state.results.length;
    processResults(pageResults, query, category);
    const newFound = state.results.length - beforeCount;
    const pageEmails = pageResults.filter(r => r.emails?.length).length;
    queryEmailCount += pageEmails;

    addLog('RESULT', `  📊 +${newFound} profiles, +${pageEmails} with email (total: ${state.results.length})`);

    // Update analytics
    state.analytics.queryStats[query].found += newFound;
    state.analytics.queryStats[query].emails += pageEmails;

    // Smart skip
    if (state.smartSkipEnabled && newFound === 0) {
      consecutiveEmpty++;
      if (consecutiveEmpty >= state.smartSkipThreshold) {
        addLog('SKIP', `  ⏭ Smart skip (${consecutiveEmpty} empty pages)`);
        state.stats.smartSkipped++;
        break;
      }
    } else {
      consecutiveEmpty = 0;
    }

    state.stats.totalPages++;
    broadcastStatus();
    await checkAutoSave();

    if (!pageInfo.hasNextPage || page >= state.maxPages - 1) break;
    await randomDelay(state.pageDelayMin, state.pageDelayMax);
  }

  // Query completed — log + history
  state.stats.completedQueries++;
  state.analytics.queryStats[query].endTime = Date.now();
  const queryFound = state.analytics.queryStats[query].found;
  addLog('DONE', `✅ Query done: ${queryFound} found, ${queryEmailCount} emails`);
  addQueryHistory(query, queryFound, queryEmailCount);

  // Rotate domain after each query (if enabled)
  if (state.domainRotation) rotateDomain();
}

// ─── Process & Deduplicate ──────────────────────────────────────────
function processResults(pageResults, query, category) {
  for (const r of pageResults) {
    const dedupeKey = (r.platform || 'unknown') + ':' + r.username;
    // Blacklist check
    if (state.blacklist.has(r.username) || state.blacklist.has(dedupeKey)) {
      state.stats.blacklisted++;
      continue;
    }
    // Duplicate check (platform:username)
    if (state.seenUsernames.has(dedupeKey)) {
      state.stats.duplicatesSkipped++;
      continue;
    }
    state.seenUsernames.add(dedupeKey);
    state.results.push({ ...r, source_query: query, category, found_at: new Date().toISOString() });
    state.stats.totalResults++;

    // Analytics timeline (every 10 results)
    if (state.stats.totalResults % 10 === 0) {
      state.analytics.timeline.push({
        timestamp: Date.now(),
        totalResults: state.stats.totalResults,
        emailCount: state.results.filter(x => x.emails?.length).length,
      });
    }
  }
}

// ─── Main Run Loop ──────────────────────────────────────────────────
async function startScraping(resume = false) {
  if (state.isRunning) return;
  state.isRunning = true;
  state.isPaused = false;
  state.analytics.startTime = Date.now();

  if (!resume) {
    state.currentQueryIndex = 0;
    state.currentPage = 0;
    state.domainRotationIndex = 0;

    // Category name compatibility mapping (popup.html → queries.js)
    const CATEGORY_MAP = {
      'fashion_brand': 'fashion',
      'swimwear': 'basic_brand',
    };
    const cat = CATEGORY_MAP[state.selectedCategory] || state.selectedCategory;

    if (cat === 'priority') {
      state.queries = getPriorityQueries();
    } else if (cat === 'all') {
      state.queries = getAllQueries();
    } else if (cat === 'custom') {
      state.queries = [...state.customQueries];
    } else if (cat === 'template') {
      // Template mode — queries already set
    } else {
      state.queries = getQueriesByCategory(cat);
    }
  }

  if (!state.queries.length) {
    state.isRunning = false;
    broadcastStatus();
    return;
  }

  const tab = await chrome.tabs.create({ url: 'about:blank', active: state.tabActive });
  state.tabId = tab.id;
  broadcastStatus();

  notify('Scraping Started 🚀', `${state.queries.length} queries, domain: ${getGoogleDomain()}`);

  try {
    for (let i = state.currentQueryIndex; i < state.queries.length; i++) {
      if (!state.isRunning) break;
      state.currentQueryIndex = i;
      broadcastStatus();
      await scrapeQuery(state.queries[i]);
      if (i < state.queries.length - 1 && state.isRunning) {
        await randomDelay(state.queryDelayMin, state.queryDelayMax);
      }
      await saveState();
    }
  } catch (err) {
    addError(`Scraping error: ${err.message || err}`);
  }

  state.isRunning = false;
  state.analytics.endTime = Date.now();
  await saveState();
  broadcastStatus();

  const emailCount = state.results.filter(r => r.emails?.length).length;
  const duration = Math.round((state.analytics.endTime - state.analytics.startTime) / 60000);
  notify('Scraping Complete ✅', `${state.stats.totalResults} profiles, ${emailCount} emails in ${duration} min`);
}

function stopScraping() {
  state.isRunning = false;
  state.isPaused = false;
  if (state.tabId) { chrome.tabs.remove(state.tabId).catch(() => {}); state.tabId = null; }
  broadcastStatus();
  saveState();
}

function pauseScraping() {
  state.isPaused = !state.isPaused;
  broadcastStatus();
}

function resetState() {
  state.results = [];
  state.seenUsernames = new Set();
  state.currentQueryIndex = 0;
  state.currentPage = 0;
  state.queries = [];
  state.queryLog = [];
  state.queryHistory = [];
  state.errorLog = [];
  state.captchaBackoff = 1;
  state.consecutiveCaptchas = 0;
  state.analytics = { queryStats: {}, categoryStats: {}, timeline: [], startTime: null, endTime: null };
  state.stats = {
    totalQueries: 0, completedQueries: 0, totalPages: 0, totalResults: 0,
    duplicatesSkipped: 0, blacklisted: 0, captchaHits: 0, captchaSolved: 0,
    noResultsSkipped: 0, smartSkipped: 0, errors: 0, autoSaves: 0, domainRotations: 0,
  };
  chrome.storage.local.remove('dorkerState');
  broadcastStatus();
  addLog('SYSTEM', '🗑 All data reset');
}

// ─── Export ──────────────────────────────────────────────────────────
function exportResults(format, emailOnly = false, prefix) {
  let data = state.results;
  if (emailOnly) data = data.filter(r => r.emails && r.emails.length > 0);
  if (!data.length) return;

  const pfx = prefix || state.exportPrefix || 'dorking';
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

  if (format === 'json') {
    const str = JSON.stringify(data, null, 2);
    const url = 'data:application/json;base64,' + btoa(unescape(encodeURIComponent(str)));
    chrome.downloads.download({ url, filename: `${pfx}_${ts}.json`, saveAs: true });
  } else {
    const headers = ['platform','username','profile_url','display_name','bio','emails','phones','whatsapp','telegram','follower_text','location','hashtags','website','is_verified','source_query','category','found_at'];
    const rows = [headers.join(',')];
    for (const r of data) {
      const row = headers.map(h => {
        let v = r[h] || '';
        if (Array.isArray(v)) v = v.join('; ');
        if (typeof v === 'boolean') v = v ? 'Yes' : 'No';
        return `"${String(v).replace(/"/g, '""')}"`;
      });
      rows.push(row.join(','));
    }
    const url = 'data:text/csv;base64,' + btoa(unescape(encodeURIComponent(rows.join('\n'))));
    chrome.downloads.download({ url, filename: `${pfx}_${ts}.csv`, saveAs: true });
  }
}

// ─── Broadcast Status ───────────────────────────────────────────────
function broadcastStatus() {
  const emailCount = state.results.filter(r => r.emails?.length > 0).length;
  const phoneCount = state.results.filter(r => r.phones?.length > 0).length;
  const waCount = state.results.filter(r => r.whatsapp?.length > 0).length;
  const tgCount = state.results.filter(r => r.telegram?.length > 0).length;

  const s = {
    isRunning: state.isRunning, isPaused: state.isPaused,
    currentQueryIndex: state.currentQueryIndex, currentPage: state.currentPage,
    maxPages: state.maxPages, totalQueries: state.queries.length,
    currentQuery: state.queries[state.currentQueryIndex] || '',
    selectedCategory: state.selectedCategory, stats: state.stats,
    totalResults: state.results.length,
    emailCount, phoneCount, waCount, tgCount,
    recentResults: state.results.slice(-30).reverse(),
    canResume: state.currentQueryIndex > 0 && !state.isRunning && state.queries.length > 0,
    googleDomain: getGoogleDomain(),
    customQueryCount: state.customQueries.length,
    blacklistCount: state.blacklist.size,
    analytics: state.analytics,
    schedulerEnabled: state.schedulerEnabled,
    schedulerTime: state.schedulerTime,
    domainRotation: state.domainRotation,
    deepScanEnabled: state.deepScanEnabled,
    // v1.0
    queryLog: state.queryLog.slice(-20),
    queryHistory: state.queryHistory.slice(0, 10),
    errorLog: state.errorLog.slice(-10),
    captchaBackoff: state.captchaBackoff,
  };
  chrome.runtime.sendMessage({ action: 'STATUS_UPDATE', data: s }).catch(() => {});
}

// ─── Message Handler ────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.action) {
    case 'START':
      state.selectedCategory = msg.category || 'priority';
      state.maxPages = msg.maxPages || 5;
      state.googleDomain = msg.googleDomain || 'www.google.com';
      state.resultsPerPage = msg.resultsPerPage || 10;
      if (msg.pageDelayMin) state.pageDelayMin = msg.pageDelayMin * 1000;
      if (msg.pageDelayMax) state.pageDelayMax = msg.pageDelayMax * 1000;
      if (msg.queryDelayMin) state.queryDelayMin = msg.queryDelayMin * 1000;
      if (msg.queryDelayMax) state.queryDelayMax = msg.queryDelayMax * 1000;
      if (msg.captchaRetries) state.captchaRetries = msg.captchaRetries;
      if (msg.captchaWait) state.captchaWait = msg.captchaWait * 1000;
      if (msg.smartSkipThreshold) state.smartSkipThreshold = msg.smartSkipThreshold;
      state.smartSkipEnabled = msg.smartSkipEnabled !== 'false';
      state.tabActive = msg.tabActive === 'true';
      state.notificationsEnabled = msg.notificationsEnabled !== 'false';
      state.soundEnabled = msg.soundEnabled !== 'false';
      state.exportPrefix = msg.exportPrefix || 'dorking';
      state.domainRotation = msg.domainRotation === 'true';
      state.deepScanEnabled = msg.deepScanEnabled === 'true';
      startScraping(false);
      sendResponse({ ok: true });
      break;
    case 'RESUME':
      startScraping(true);
      sendResponse({ ok: true });
      break;
    case 'STOP':
      stopScraping();
      sendResponse({ ok: true });
      break;
    case 'PAUSE':
      pauseScraping();
      sendResponse({ ok: true });
      break;
    case 'RESET':
      resetState();
      sendResponse({ ok: true });
      break;
    case 'EXPORT':
      exportResults(msg.format || 'json', msg.emailOnly || false, msg.prefix);
      sendResponse({ ok: true });
      break;
    case 'GET_STATUS':
      broadcastStatus();
      sendResponse({ ok: true });
      break;
    case 'GET_CATEGORIES':
      sendResponse({
        categories: getCategoryNames(),
        counts: Object.fromEntries(Object.entries(QUERY_CATEGORIES).map(([k, v]) => [k, v.length])),
        totalAll: getAllQueries().length,
      });
      break;
    case 'SAVE_CUSTOM_QUERIES':
      state.customQueries = msg.queries || [];
      saveState();
      sendResponse({ ok: true, count: state.customQueries.length });
      break;
    case 'GET_CUSTOM_QUERIES':
      sendResponse({ queries: state.customQueries });
      break;
    case 'GENERATE_TEMPLATE':
      const generated = generateQueriesFromNiche(msg.niche || '', msg.platforms || ['instagram'], msg.advancedOps || {});
      sendResponse({ queries: generated, count: generated.length });
      break;
    case 'START_TEMPLATE':
      state.selectedCategory = 'template';
      state.queries = generateQueriesFromNiche(msg.niche || '', msg.platforms || ['instagram']);
      state.maxPages = msg.maxPages || 5;
      state.googleDomain = msg.googleDomain || 'www.google.com';
      startScraping(false);
      sendResponse({ ok: true });
      break;
    case 'IMPORT_BLACKLIST':
      const newEntries = (msg.usernames || []).map(u => u.toLowerCase().trim()).filter(Boolean);
      newEntries.forEach(u => state.blacklist.add(u));
      chrome.storage.local.set({ dorkerBlacklist: [...state.blacklist] });
      sendResponse({ ok: true, count: state.blacklist.size });
      break;
    case 'EXPORT_BLACKLIST':
      sendResponse({ usernames: [...state.blacklist] });
      break;
    case 'CLEAR_BLACKLIST':
      state.blacklist = new Set();
      chrome.storage.local.remove('dorkerBlacklist');
      sendResponse({ ok: true });
      break;
    case 'SET_SCHEDULER':
      setScheduler(msg.time, msg.repeat || 'daily', msg.category || 'priority', msg.days || [1,2,3,4,5]);
      sendResponse({ ok: true, time: msg.time });
      break;
    case 'CLEAR_SCHEDULER':
      clearScheduler();
      sendResponse({ ok: true });
      break;
    case 'SET_TAG':
      if (msg.username) {
        state.tags = state.tags || {};
        if (msg.tag === 'none') {
          delete state.tags[msg.username];
        } else {
          state.tags[msg.username] = msg.tag;
        }
        chrome.storage.local.set({ dorkerTags: state.tags });
        // Also update result in memory
        const tagResult = state.results.find(r => r.username === msg.username);
        if (tagResult) tagResult._tag = msg.tag === 'none' ? undefined : msg.tag;
      }
      sendResponse({ ok: true });
      break;
    case 'UPDATE_SETTINGS':
      if (msg.settings) applySettings(msg.settings);
      sendResponse({ ok: true });
      break;
    case 'GET_ANALYTICS':
      sendResponse({
        analytics: state.analytics,
        topQueries: getTopQueries(),
        emailRate: state.results.length ? Math.round((state.results.filter(r => r.emails?.length).length / state.results.length) * 100) : 0,
      });
      break;
    // v1.0: New handlers
    case 'VERIFY_EMAILS':
      (async () => {
        try {
          const emails = (msg.emails || []).filter(Boolean);
          const results = await verifyBatch(emails);
          // Store results
          state.verificationCache = state.verificationCache || {};
          for (const r of results) {
            state.verificationCache[r.email] = r;
          }
          sendResponse({ ok: true, results });
        } catch (e) {
          sendResponse({ ok: false, error: e.message });
        }
      })();
      break;
    case 'VERIFY_SINGLE':
      (async () => {
        try {
          const result = await verifyEmail(msg.email);
          state.verificationCache = state.verificationCache || {};
          state.verificationCache[msg.email] = result;
          sendResponse({ ok: true, result });
        } catch (e) {
          sendResponse({ ok: false, error: e.message });
        }
      })();
      break;
    case 'GET_VERIFIER_STATUS':
      sendResponse({
        nativeAvailable: nativeAvailable === true,
        mode: nativeAvailable ? 'native' : 'dns',
        cache: state.verificationCache || {},
      });
      break;
    case 'GET_QUERY_LOG':
      sendResponse({ log: state.queryLog });
      break;
    case 'GET_QUERY_HISTORY':
      sendResponse({ history: state.queryHistory });
      break;
    case 'GET_ERROR_LOG':
      sendResponse({ errors: state.errorLog });
      break;
    case 'IMPORT_RESULTS':
      try {
        const imported = msg.results || [];
        let importCount = 0;
        for (const r of imported) {
          const key = (r.platform || 'unknown') + ':' + (r.username || '');
          if (!state.seenUsernames.has(key) && r.username) {
            state.seenUsernames.add(key);
            state.results.push(r);
            state.stats.totalResults++;
            importCount++;
          }
        }
        saveState();
        addLog('IMPORT', `📥 Imported ${importCount} profiles (${imported.length - importCount} duplicates)`);
        sendResponse({ ok: true, imported: importCount });
      } catch (e) {
        addError(`Import failed: ${e.message}`);
        sendResponse({ ok: false, error: e.message });
      }
      break;
    case 'RECONNECT_NATIVE':
      try { connectNative(); } catch (e) { nativeAvailable = false; }
      sendResponse({ ok: true });
      break;
    case 'PAGE_LOADED':
      break;
  }
  return true;
});

function getTopQueries() {
  return Object.entries(state.analytics.queryStats)
    .sort((a, b) => b[1].found - a[1].found)
    .slice(0, 10)
    .map(([q, s]) => ({ query: q.slice(0, 50), found: s.found, emails: s.emails }));
}

loadState();
