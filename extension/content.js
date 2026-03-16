/**
 * Content Script v5.0 — Universal Multi-Platform Google SERP parser.
 *
 * Supported platforms:
 *   Instagram, Facebook, TikTok, Twitter/X, LinkedIn, YouTube,
 *   Pinterest, Snapchat, Threads
 *
 * Extracts: username/handle, display name, bio/snippet, emails (validated),
 *           phones, followers, location, hashtags, website,
 *           WhatsApp links, Telegram links, platform type.
 */

(() => {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════════
     Platform Definitions
     ═══════════════════════════════════════════════════════════════════ */
  const PLATFORMS = {
    instagram: {
      domain: 'instagram.com',
      profileRe: /instagram\.com\/([a-zA-Z0-9_.]+)\/?/,
      skipPaths: ['/p/', '/reel/', '/reels/', '/explore/', '/stories/', '/tv/', '/s/'],
      skipUsers: ['p', 'reel', 'reels', 'explore', 'stories', 'tv', 'about', 'accounts', 'directory', 'tags', 'developer', 'legal', 'privacy'],
      icon: '📸',
    },
    facebook: {
      domain: 'facebook.com',
      profileRe: /facebook\.com\/(?:(?:profile\.php\?id=(\d+))|([a-zA-Z0-9_.]+))\/?/,
      skipPaths: ['/photo/', '/photos/', '/videos/', '/watch/', '/events/', '/groups/', '/marketplace/', '/gaming/'],
      skipUsers: ['login', 'help', 'policies', 'privacy', 'ads', 'business', 'watch', 'groups', 'events', 'pages', 'marketplace', 'gaming', 'permalink.php', 'sharer', 'share', 'dialog', 'photo.php', 'story.php', 'reel'],
      icon: '👤',
    },
    tiktok: {
      domain: 'tiktok.com',
      profileRe: /tiktok\.com\/@([a-zA-Z0-9_.]+)\/?/,
      skipPaths: ['/video/', '/embed/', '/tag/'],
      skipUsers: ['login', 'signup', 'explore', 'foryou', 'following', 'live'],
      icon: '🎵',
    },
    twitter: {
      domain: 'x.com',
      altDomains: ['twitter.com'],
      profileRe: /(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)\/?/,
      skipPaths: ['/status/', '/i/', '/search', '/hashtag/', '/explore'],
      skipUsers: ['login', 'signup', 'home', 'explore', 'search', 'notifications', 'messages', 'settings', 'i', 'intent', 'share', 'hashtag', 'compose'],
      icon: '🐦',
    },
    linkedin: {
      domain: 'linkedin.com',
      profileRe: /linkedin\.com\/(?:in|company)\/([a-zA-Z0-9\-_.]+)\/?/,
      skipPaths: ['/posts/', '/pulse/', '/jobs/', '/feed/', '/learning/'],
      skipUsers: ['login', 'signup', 'feed', 'jobs', 'messaging', 'notifications', 'learning'],
      icon: '💼',
    },
    youtube: {
      domain: 'youtube.com',
      profileRe: /youtube\.com\/(?:@|channel\/|c\/|user\/)([a-zA-Z0-9_\-]+)\/?/,
      skipPaths: ['/watch', '/shorts/', '/playlist', '/results', '/feed/', '/premium'],
      skipUsers: ['watch', 'results', 'feed', 'premium', 'account', 'channel', 'gaming', 'music'],
      icon: '🎬',
    },
    pinterest: {
      domain: 'pinterest.com',
      profileRe: /pinterest\.com\/([a-zA-Z0-9_]+)\/?/,
      skipPaths: ['/pin/', '/ideas/', '/search/', '/topics/'],
      skipUsers: ['pin', 'ideas', 'search', 'topics', 'settings', 'business', 'today', 'login'],
      icon: '📌',
    },
    snapchat: {
      domain: 'snapchat.com',
      profileRe: /snapchat\.com\/add\/([a-zA-Z0-9_.]+)\/?/,
      skipPaths: ['/discover/', '/stories/'],
      skipUsers: ['login', 'download'],
      icon: '👻',
    },
    threads: {
      domain: 'threads.net',
      profileRe: /threads\.net\/@([a-zA-Z0-9_.]+)\/?/,
      skipPaths: ['/post/'],
      skipUsers: ['login', 'signup'],
      icon: '🧵',
    },
  };

  /* ═══════════════════════════════════════════════════════════════════
     Regex Library
     ═══════════════════════════════════════════════════════════════════ */
  const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/gi;
  const PHONE_RE = /(?:\+?\d{1,4}[\s\-.]?)?\(?\d{1,4}\)?[\s\-.]?\d{2,4}[\s\-.]?\d{2,4}[\s\-.]?\d{0,4}/g;
  const WHATSAPP_RE = /(?:wa\.me\/|whatsapp\.com\/send\?phone=|whatsapp[\s:]*)\+?(\d[\d\s\-]{7,})/gi;
  const TELEGRAM_RE = /(?:t\.me\/|telegram[\s:]*@?)([a-zA-Z0-9_]+)/gi;
  const HASHTAG_RE = /#([a-zA-Z0-9_]+)/g;
  const WEBSITE_RE = /(?:🔗|🌐|linktr\.ee|www\.|https?:\/\/)([a-zA-Z0-9\-]+\.(?:com|co|io|net|org|shop|store|xyz|link|me|bio)[a-zA-Z0-9.\/\-]*)/gi;

  const FOLLOWER_PATTERNS = [
    /(\d[\d,.]*\s*(?:K|M|B|k|m|b)\+?\s*(?:followers|Followers|subscriber|Subscriber)s?)/i,
    /(\d[\d,]*\+?\s*(?:followers|Followers|subscriber|Subscriber)s?)/i,
    /(\d[\d,.]*\s*(?:ming|тыс|тис|мың)\+?\s*(?:obunachi|подписчик|obunachilar))/i,
    /(\d[\d,.]*\+?\s*(?:obunachi|подписчик))/i,
    /(\d[\d,.]*\s*(?:K|M)\+?\s*(?:likes|Likes|fans|Fans))/i,
    /(\d[\d,.]*\s*(?:connections|Connections))/i,
  ];

  /* ═══════════════════════════════════════════════════════════════════
     Email Validation
     ═══════════════════════════════════════════════════════════════════ */
  const VALID_TLDS = [
    'com','net','org','io','co','me','info','edu','biz','name','app',
    'uk','de','fr','es','it','ru','br','au','ca','nl','se','no','fi',
    'pl','cz','ua','tr','kr','jp','cn','in','za','mx','ar','cl',
    'id','my','ph','th','vn','sg','ae','sa','eg','ng','ke',
  ];
  const BLOCKED_DOMAINS = [
    'example.com','email.com','domain.com','sentry.io','test.com',
    'wixpress.com','squarespace.com','shopify.com','facebook.com',
    'instagram.com','tiktok.com','twitter.com','x.com',
  ];
  const BLOCKED_PATTERNS = [
    /noreply/i, /no-reply/i, /support@/i, /info@example/i,
    /admin@/i, /webmaster@/i, /postmaster@/i,
  ];

  function validateEmail(email) {
    const parts = email.split('@');
    if (parts.length !== 2) return false;
    const [local, domain] = parts;
    if (local.length < 2 || domain.length < 4) return false;
    const tld = domain.split('.').pop().toLowerCase();
    if (!VALID_TLDS.includes(tld)) return false;
    if (BLOCKED_DOMAINS.some(d => domain.toLowerCase().endsWith(d))) return false;
    if (BLOCKED_PATTERNS.some(p => p.test(email))) return false;
    return true;
  }

  /* ═══════════════════════════════════════════════════════════════════
     Extraction Helpers
     ═══════════════════════════════════════════════════════════════════ */
  function extractFollowers(text) {
    for (const p of FOLLOWER_PATTERNS) {
      p.lastIndex = 0;
      const m = p.exec(text);
      if (m) return m[0].trim();
    }
    return '';
  }

  function extractRegexAll(re, text) {
    re.lastIndex = 0;
    const matches = [];
    let m;
    while ((m = re.exec(text)) !== null) {
      matches.push(m[1]);
    }
    return [...new Set(matches)];
  }

  /* ═══════════════════════════════════════════════════════════════════
     Platform Detection
     ═══════════════════════════════════════════════════════════════════ */
  function detectPlatform(url) {
    const lower = url.toLowerCase();
    for (const [name, cfg] of Object.entries(PLATFORMS)) {
      if (lower.includes(cfg.domain)) return name;
      if (cfg.altDomains) {
        for (const alt of cfg.altDomains) {
          if (lower.includes(alt)) return name;
        }
      }
    }
    return null;
  }

  function extractUsername(url, platform) {
    const cfg = PLATFORMS[platform];
    if (!cfg) return null;
    const m = cfg.profileRe.exec(url);
    if (!m) return null;
    // Facebook has two capture groups (numeric id vs name)
    if (platform === 'facebook') return (m[2] || m[1] || '').toLowerCase();
    return (m[1] || '').toLowerCase();
  }

  function isSkipped(url, username, platform) {
    const cfg = PLATFORMS[platform];
    if (!cfg) return true;
    if (cfg.skipPaths.some(p => url.includes(p))) return true;
    if (cfg.skipUsers.includes(username)) return true;
    if (username.length < 2) return true;
    return false;
  }

  /* ═══════════════════════════════════════════════════════════════════
     Main SERP Parser
     ═══════════════════════════════════════════════════════════════════ */
  function parseSERP() {
    let containers = document.querySelectorAll('div.MjjYud');
    if (!containers.length) containers = document.querySelectorAll('div.g');
    if (!containers.length) containers = document.querySelectorAll('[data-sokoban-container]');

    const results = [];
    const seenUsernames = new Set();

    containers.forEach(container => {
      // Find any social media link
      const allLinks = container.querySelectorAll('a[href]');
      let bestLink = null;
      let bestPlatform = null;

      for (const link of allLinks) {
        const href = link.href || '';
        const platform = detectPlatform(href);
        if (platform) {
          bestLink = link;
          bestPlatform = platform;
          break;
        }
      }

      if (!bestLink || !bestPlatform) return;

      const href = bestLink.href;
      const username = extractUsername(href, bestPlatform);
      if (!username) return;
      if (isSkipped(href, username, bestPlatform)) return;

      const dedupeKey = `${bestPlatform}:${username}`;
      if (seenUsernames.has(dedupeKey)) return;
      seenUsernames.add(dedupeKey);

      // Extract text content
      const h3 = container.querySelector('h3');
      const snippetEl = container.querySelector('div.VwiC3b, .IsZvec, span.aCOpRe, div[data-sncf]');
      const citeEl = container.querySelector('cite');

      const title = h3 ? h3.textContent.trim() : '';
      const snippet = snippetEl ? snippetEl.textContent.trim() : '';
      const breadcrumb = citeEl ? citeEl.textContent.trim() : '';
      const fullText = `${title} ${snippet} ${breadcrumb}`;

      // Extract emails
      const rawEmails = fullText.match(EMAIL_RE) || [];
      const validEmails = rawEmails.map(e => e.toLowerCase()).filter(validateEmail);

      // Extract phones (7-15 digit)
      const rawPhones = snippet.match(PHONE_RE) || [];
      const phones = rawPhones.filter(p => {
        const digits = p.replace(/\D/g, '');
        return digits.length >= 7 && digits.length <= 15;
      });

      // WhatsApp & Telegram
      const whatsapp = extractRegexAll(WHATSAPP_RE, fullText).map(w => w.replace(/[\s\-]/g, '')).slice(0, 3);
      const telegram = extractRegexAll(TELEGRAM_RE, fullText).filter(t => t.length > 3).map(t => '@' + t).slice(0, 3);

      // Followers
      const followerText = extractFollowers(fullText) || extractFollowers(breadcrumb);

      // Hashtags
      const hashtags = (snippet.match(HASHTAG_RE) || []).slice(0, 6);

      // Website
      WEBSITE_RE.lastIndex = 0;
      const websiteMatch = WEBSITE_RE.exec(snippet);

      // Location
      let location = '';
      const locPatterns = [
        /(?:📍|Location|Based in|Located in|Made in)\s*[:.]?\s*([A-Z][a-zA-Z\s,]+?)(?:\s*[·.|•]|\s*$)/i,
        /·\s*([A-Z][a-zA-Z\s]+(?:,\s*[A-Z]{2})?)\s*$/,
      ];
      for (const lp of locPatterns) {
        lp.lastIndex = 0;
        const lm = lp.exec(snippet) || lp.exec(title);
        if (lm) { location = lm[1].trim(); break; }
      }

      // Verified badge detection
      const isVerified = /✓|✔|verified|☑/i.test(title) || container.querySelector('svg[aria-label*="erif"]') !== null;

      // Build display name
      let displayName = title;
      // Clean platform-specific patterns
      displayName = displayName
        .replace(/\(@[a-zA-Z0-9_.]+\)/g, '')
        .replace(/• Instagram.*/gi, '')
        .replace(/• Facebook.*/gi, '')
        .replace(/- YouTube.*/gi, '')
        .replace(/\| TikTok.*/gi, '')
        .replace(/\(@.*?\)/g, '')
        .replace(/on X:.*/gi, '')
        .replace(/\| LinkedIn.*/gi, '')
        .trim()
        .slice(0, 50);

      const cfg = PLATFORMS[bestPlatform];

      results.push({
        platform: bestPlatform,
        platform_icon: cfg.icon,
        username,
        profile_url: href,
        display_name: displayName,
        bio: snippet.slice(0, 200),
        emails: [...new Set(validEmails)].slice(0, 3),
        phones: [...new Set(phones)].slice(0, 3),
        whatsapp,
        telegram,
        follower_text: followerText,
        location,
        hashtags,
        website: websiteMatch ? websiteMatch[1] : '',
        is_verified: isVerified,
      });
    });

    // Next page link
    const nextPage = document.querySelector('a#pnnext');

    // "No results" detection (7 languages)
    const bodyText = document.body.textContent.toLowerCase();
    const noResults =
      bodyText.includes('did not match any documents') ||
      bodyText.includes('no results found') ||
      bodyText.includes('hech qanday natija topilmadi') ||
      bodyText.includes('hech narsa topilmadi') ||
      bodyText.includes('ничего не найдено') ||
      bodyText.includes('keine ergebnisse') ||
      bodyText.includes('aucun résultat');

    // CAPTCHA detection
    const hasCaptcha =
      bodyText.includes('unusual traffic') ||
      bodyText.includes('are not a robot') ||
      bodyText.includes('captcha') ||
      !!document.querySelector('#captcha-form') ||
      !!document.querySelector('form[action*="sorry"]');

    return { results, hasNextPage: !!nextPage, noResults, hasCaptcha };
  }

  /* ═══════════════════════════════════════════════════════════════════
     Message Handler
     ═══════════════════════════════════════════════════════════════════ */
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.action === 'PARSE_RESULTS') {
      try {
        const data = parseSERP();
        sendResponse({
          ok: true,
          results: data.results,
          hasNextPage: data.hasNextPage,
          noResults: data.noResults,
          hasCaptcha: data.hasCaptcha,
          resultCount: data.results.length,
        });
      } catch (err) {
        sendResponse({ ok: false, error: err.message, results: [] });
      }
    }
    return true;
  });
})();
