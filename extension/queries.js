/**
 * Google Dorking Query'lari v5.0 — Multi-Platform, 22+ kategoriya.
 * Module for Chrome Extension.
 *
 * Platforms: Instagram, Facebook, TikTok, Twitter/X, LinkedIn,
 *            YouTube, Pinterest
 */

// ─── Platform-agnostic query builder ────────────────────────────────
function buildQuery(site, keyword, skipFilter, extras = '') {
  const parts = [`site:${site}`, `"${keyword}"`];
  if (extras) parts.push(extras);
  if (skipFilter) parts.push(skipFilter);
  return parts.join(' ');
}

const IG_SKIP = '-"/p/" -"/reel/" -"/explore/"';
const FB_SKIP = '-"/posts/" -"/photos/" -"/videos/"';
const TT_SKIP = '-"/video/" -"/tag/"';
const TW_SKIP = '-"/status/" -"/hashtag/"';
const LI_SKIP = '-"/posts/" -"/pulse/" -"/jobs/"';
const YT_SKIP = '-"/watch" -"/shorts/" -"/playlist"';
const PI_SKIP = '-"/pin/" -"/ideas/"';

const QUERY_CATEGORIES = {
  basic_brand: [
    // Instagram
    buildQuery('instagram.com', 'swimwear brand', IG_SKIP),
    buildQuery('instagram.com', 'bikini brand', IG_SKIP),
    buildQuery('instagram.com', 'swimsuit brand', IG_SKIP),
    buildQuery('instagram.com', 'beachwear brand', IG_SKIP),
    buildQuery('instagram.com', 'resortwear brand', IG_SKIP),
    // Facebook
    buildQuery('facebook.com', 'swimwear brand', FB_SKIP),
    buildQuery('facebook.com', 'bikini brand', FB_SKIP),
    buildQuery('facebook.com', 'beachwear brand', FB_SKIP),
    buildQuery('facebook.com', 'swimsuit brand', FB_SKIP),
    'site:facebook.com "swimwear" "About" "Page" ' + FB_SKIP,
    // LinkedIn
    buildQuery('linkedin.com', 'swimwear brand', LI_SKIP),
    buildQuery('linkedin.com', 'beachwear company', LI_SKIP),
    // TikTok
    buildQuery('tiktok.com', 'swimwear brand', TT_SKIP),
    buildQuery('tiktok.com', 'bikini brand', TT_SKIP),
    // YouTube
    buildQuery('youtube.com', 'swimwear brand', YT_SKIP),
    // Pinterest
    buildQuery('pinterest.com', 'swimwear brand', PI_SKIP),
    // Twitter/X
    buildQuery('x.com', 'swimwear brand', TW_SKIP),
  ],
  email: [
    // Instagram
    buildQuery('instagram.com', 'swimwear brand', IG_SKIP, '"email"'),
    buildQuery('instagram.com', 'bikini brand', IG_SKIP, '"email"'),
    buildQuery('instagram.com', 'swimwear', IG_SKIP, '"@gmail.com"'),
    buildQuery('instagram.com', 'bikini', IG_SKIP, '"@gmail.com"'),
    // Facebook — email
    buildQuery('facebook.com', 'swimwear brand', FB_SKIP, '"email"'),
    buildQuery('facebook.com', 'bikini brand', FB_SKIP, '"email"'),
    buildQuery('facebook.com', 'swimwear', FB_SKIP, '"@gmail.com"'),
    'site:facebook.com "swimwear" "contact" "@" ' + FB_SKIP,
    // LinkedIn — email
    buildQuery('linkedin.com', 'swimwear', LI_SKIP, '"email"'),
    buildQuery('linkedin.com', 'fashion', LI_SKIP, '"@gmail.com"'),
    'site:linkedin.com "swimwear" "contact" "email" ' + LI_SKIP,
    // TikTok
    buildQuery('tiktok.com', 'swimwear', TT_SKIP, '"email"'),
    buildQuery('tiktok.com', 'fashion brand', TT_SKIP, '"email"'),
    // Twitter/X
    buildQuery('x.com', 'swimwear', TW_SKIP, '"email"'),
    // YouTube
    buildQuery('youtube.com', 'swimwear brand', YT_SKIP, '"email"'),
  ],
  contact: [
    buildQuery('instagram.com', 'swimwear', IG_SKIP, '"contact us"'),
    buildQuery('instagram.com', 'bikini brand', IG_SKIP, '"whatsapp"'),
    buildQuery('instagram.com', 'swimwear', IG_SKIP, '"dm for orders"'),
    // Facebook — contact
    buildQuery('facebook.com', 'swimwear', FB_SKIP, '"contact"'),
    buildQuery('facebook.com', 'bikini brand', FB_SKIP, '"order"'),
    buildQuery('facebook.com', 'fashion', FB_SKIP, '"whatsapp"'),
    buildQuery('facebook.com', 'fashion brand', FB_SKIP, '"phone" OR "call"'),
    'site:facebook.com "fashion" "Send Message" "contact" ' + FB_SKIP,
    // LinkedIn — contact
    buildQuery('linkedin.com', 'fashion brand', LI_SKIP, '"contact"'),
    buildQuery('linkedin.com', 'swimwear', LI_SKIP, '"phone"'),
    // TikTok
    buildQuery('tiktok.com', 'swimwear', TT_SKIP, '"DM" OR "link in bio"'),
    buildQuery('tiktok.com', 'fashion', TT_SKIP, '"whatsapp"'),
  ],
  luxury: [
    buildQuery('instagram.com', 'luxury swimwear', IG_SKIP),
    buildQuery('instagram.com', 'premium swimwear', IG_SKIP),
    buildQuery('instagram.com', 'designer bikini', IG_SKIP),
    // Facebook
    buildQuery('facebook.com', 'luxury swimwear', FB_SKIP),
    buildQuery('facebook.com', 'designer swimwear', FB_SKIP),
    buildQuery('facebook.com', 'premium bikini', FB_SKIP),
    // LinkedIn
    buildQuery('linkedin.com', 'luxury swimwear', LI_SKIP),
    buildQuery('linkedin.com', 'designer fashion', LI_SKIP),
    // Pinterest
    buildQuery('pinterest.com', 'luxury swimwear', PI_SKIP),
    buildQuery('pinterest.com', 'designer bikini', PI_SKIP),
    // YouTube
    buildQuery('youtube.com', 'luxury swimwear', YT_SKIP),
    // TikTok
    buildQuery('tiktok.com', 'luxury swimwear', TT_SKIP),
  ],
  eco: [
    buildQuery('instagram.com', 'sustainable swimwear', IG_SKIP),
    buildQuery('instagram.com', 'ethical swimwear', IG_SKIP),
    buildQuery('instagram.com', 'eco swimwear', IG_SKIP),
    // Facebook
    buildQuery('facebook.com', 'sustainable swimwear', FB_SKIP),
    buildQuery('facebook.com', 'eco friendly fashion', FB_SKIP),
    buildQuery('facebook.com', 'ethical fashion', FB_SKIP),
    // LinkedIn
    buildQuery('linkedin.com', 'sustainable fashion', LI_SKIP),
    buildQuery('linkedin.com', 'eco fashion brand', LI_SKIP),
    // TikTok
    buildQuery('tiktok.com', 'sustainable swimwear', TT_SKIP),
    buildQuery('tiktok.com', 'eco fashion', TT_SKIP),
    // YouTube
    buildQuery('youtube.com', 'sustainable fashion', YT_SKIP),
  ],
  geo: [
    buildQuery('instagram.com', 'swimwear brand', IG_SKIP, '"usa"'),
    buildQuery('instagram.com', 'swimwear brand', IG_SKIP, '"uk"'),
    buildQuery('instagram.com', 'swimwear brand', IG_SKIP, '"australia"'),
    buildQuery('instagram.com', 'bikini brand', IG_SKIP, '"miami"'),
    // Facebook — geo
    buildQuery('facebook.com', 'swimwear brand', FB_SKIP, '"usa"'),
    buildQuery('facebook.com', 'fashion brand', FB_SKIP, '"New York"'),
    buildQuery('facebook.com', 'fashion brand', FB_SKIP, '"London"'),
    buildQuery('facebook.com', 'fashion brand', FB_SKIP, '"Dubai"'),
    // LinkedIn — geo
    buildQuery('linkedin.com', 'fashion brand', LI_SKIP, '"United States"'),
    buildQuery('linkedin.com', 'fashion brand', LI_SKIP, '"United Kingdom"'),
    // TikTok — geo
    buildQuery('tiktok.com', 'swimwear brand', TT_SKIP, '"usa"'),
    buildQuery('tiktok.com', 'fashion brand', TT_SKIP, '"uk"'),
  ],
  shop: [
    buildQuery('instagram.com', 'swimwear brand', IG_SKIP, '"shop"'),
    buildQuery('instagram.com', 'bikini brand', IG_SKIP, '"shop"'),
    // Facebook — shop
    buildQuery('facebook.com', 'swimwear', FB_SKIP, '"shop now"'),
    buildQuery('facebook.com', 'fashion brand', FB_SKIP, '"shop"'),
    'site:facebook.com "fashion" "Shop" "View Products" ' + FB_SKIP,
    'site:facebook.com "fashion" "See All" "Products" ' + FB_SKIP,
    // TikTok
    buildQuery('tiktok.com', 'swimwear', TT_SKIP, '"shop"'),
    buildQuery('tiktok.com', 'fashion brand', TT_SKIP, '"shop"'),
    // Pinterest
    buildQuery('pinterest.com', 'swimwear', PI_SKIP, '"shop"'),
    // LinkedIn
    buildQuery('linkedin.com', 'fashion brand', LI_SKIP, '"ecommerce"'),
  ],
  ecommerce: [
    buildQuery('instagram.com', 'swimwear', IG_SKIP, '"shopify"'),
    buildQuery('instagram.com', 'bikini brand', IG_SKIP, '"online store"'),
    // Facebook
    buildQuery('facebook.com', 'swimwear', FB_SKIP, '"online store"'),
    buildQuery('facebook.com', 'fashion brand', FB_SKIP, '"shopify"'),
    buildQuery('facebook.com', 'fashion', FB_SKIP, '"etsy" OR "amazon"'),
    // TikTok
    buildQuery('tiktok.com', 'swimwear', TT_SKIP, '"shopify"'),
    buildQuery('tiktok.com', 'fashion brand', TT_SKIP, '"etsy"'),
    // LinkedIn
    buildQuery('linkedin.com', 'fashion ecommerce', LI_SKIP),
    // Pinterest
    buildQuery('pinterest.com', 'fashion brand', PI_SKIP, '"shopify" OR "etsy"'),
  ],
  manufacturer: [
    buildQuery('instagram.com', 'swimwear manufacturer', IG_SKIP),
    buildQuery('instagram.com', 'bikini manufacturer', IG_SKIP),
    buildQuery('instagram.com', 'swimwear wholesale', IG_SKIP),
    // LinkedIn — manufacturer (key!)
    buildQuery('linkedin.com', 'swimwear manufacturer', LI_SKIP),
    buildQuery('linkedin.com', 'garment manufacturer', LI_SKIP),
    buildQuery('linkedin.com', 'clothing manufacturer', LI_SKIP),
    buildQuery('linkedin.com', 'textile supplier', LI_SKIP),
    'inurl:company site:linkedin.com "manufacturer" "swimwear" OR "clothing"',
    // Facebook
    buildQuery('facebook.com', 'swimwear manufacturer', FB_SKIP),
    buildQuery('facebook.com', 'garment factory', FB_SKIP),
    buildQuery('facebook.com', 'clothing manufacturer', FB_SKIP),
    // Twitter/X
    buildQuery('x.com', 'clothing manufacturer', TW_SKIP),
  ],
  niche: [
    buildQuery('instagram.com', 'plus size swimwear', IG_SKIP),
    buildQuery('instagram.com', 'modest swimwear', IG_SKIP),
    buildQuery('instagram.com', 'maternity swimwear', IG_SKIP),
    // Facebook
    buildQuery('facebook.com', 'plus size swimwear', FB_SKIP),
    buildQuery('facebook.com', 'modest swimwear', FB_SKIP),
    buildQuery('facebook.com', 'maternity swimwear', FB_SKIP),
    // TikTok
    buildQuery('tiktok.com', 'plus size swimwear', TT_SKIP),
    buildQuery('tiktok.com', 'modest fashion', TT_SKIP),
    // YouTube
    buildQuery('youtube.com', 'plus size swimwear', YT_SKIP),
    // Pinterest
    buildQuery('pinterest.com', 'plus size swimwear', PI_SKIP),
  ],
  boutique: [
    buildQuery('instagram.com', 'handmade swimwear', IG_SKIP),
    buildQuery('instagram.com', 'boutique swimwear', IG_SKIP),
    buildQuery('instagram.com', 'small swimwear brand', IG_SKIP),
    // Facebook
    buildQuery('facebook.com', 'boutique swimwear', FB_SKIP),
    buildQuery('facebook.com', 'handmade fashion', FB_SKIP),
    buildQuery('facebook.com', 'small fashion brand', FB_SKIP),
    // TikTok
    buildQuery('tiktok.com', 'handmade swimwear', TT_SKIP),
    buildQuery('tiktok.com', 'small business fashion', TT_SKIP),
    // Pinterest
    buildQuery('pinterest.com', 'handmade swimwear', PI_SKIP),
  ],
  fashion: [
    buildQuery('instagram.com', 'swimwear', IG_SKIP, '"fashion brand"'),
    buildQuery('instagram.com', 'bikini', IG_SKIP, '"fashion brand"'),
    // Facebook
    buildQuery('facebook.com', 'fashion brand', FB_SKIP),
    buildQuery('facebook.com', 'clothing brand', FB_SKIP),
    buildQuery('facebook.com', 'fashion designer', FB_SKIP),
    // LinkedIn
    buildQuery('linkedin.com', 'fashion brand', LI_SKIP),
    buildQuery('linkedin.com', 'fashion designer', LI_SKIP),
    buildQuery('linkedin.com', 'clothing brand', LI_SKIP),
    // TikTok
    buildQuery('tiktok.com', 'swimwear', TT_SKIP, '"fashion"'),
    buildQuery('tiktok.com', 'fashion brand', TT_SKIP),
    // Pinterest
    buildQuery('pinterest.com', 'swimwear', PI_SKIP, '"fashion"'),
    buildQuery('pinterest.com', 'fashion brand', PI_SKIP),
    // YouTube
    buildQuery('youtube.com', 'swimwear', YT_SKIP, '"fashion brand"'),
    buildQuery('youtube.com', 'fashion brand', YT_SKIP),
    // Twitter/X
    buildQuery('x.com', 'fashion brand', TW_SKIP),
    buildQuery('x.com', 'clothing brand', TW_SKIP),
  ],
  hashtag: [
    buildQuery('instagram.com', '#swimwear', IG_SKIP),
    buildQuery('instagram.com', '#bikini', IG_SKIP),
    buildQuery('instagram.com', '#beachwear', IG_SKIP),
    // TikTok
    buildQuery('tiktok.com', '#swimwear', TT_SKIP),
    buildQuery('tiktok.com', '#bikini', TT_SKIP),
    buildQuery('tiktok.com', '#fashion', TT_SKIP),
    // Facebook
    buildQuery('facebook.com', '#swimwear', FB_SKIP),
    buildQuery('facebook.com', '#fashion', FB_SKIP),
    // Twitter/X
    buildQuery('x.com', '#swimwear', TW_SKIP),
    buildQuery('x.com', '#fashion', TW_SKIP),
    // Pinterest
    buildQuery('pinterest.com', '#swimwear', PI_SKIP),
  ],
  shipping: [
    buildQuery('instagram.com', 'swimwear', IG_SKIP, '"free shipping"'),
    buildQuery('instagram.com', 'swimwear', IG_SKIP, '"worldwide shipping"'),
    buildQuery('instagram.com', 'swimwear', IG_SKIP, '"dm to order"'),
    // Facebook
    buildQuery('facebook.com', 'swimwear', FB_SKIP, '"free shipping"'),
    buildQuery('facebook.com', 'fashion', FB_SKIP, '"worldwide shipping"'),
    buildQuery('facebook.com', 'fashion brand', FB_SKIP, '"order now"'),
    // TikTok
    buildQuery('tiktok.com', 'fashion', TT_SKIP, '"free shipping"'),
    // Pinterest
    buildQuery('pinterest.com', 'swimwear', PI_SKIP, '"free shipping"'),
  ],
  product: [
    buildQuery('instagram.com', 'one piece swimsuit', IG_SKIP),
    buildQuery('instagram.com', 'bikini set', IG_SKIP, '"brand"'),
    buildQuery('instagram.com', 'triangle bikini', IG_SKIP),
    // Facebook
    buildQuery('facebook.com', 'bikini set', FB_SKIP),
    buildQuery('facebook.com', 'one piece swimsuit', FB_SKIP),
    // TikTok
    buildQuery('tiktok.com', 'bikini set', TT_SKIP),
    buildQuery('tiktok.com', 'one piece swimsuit', TT_SKIP),
    // Pinterest
    buildQuery('pinterest.com', 'bikini set', PI_SKIP),
    buildQuery('pinterest.com', 'one piece swimsuit', PI_SKIP),
  ],

  // ─── Cross-platform general niches ─────────────────────────
  fitness: [
    buildQuery('instagram.com', 'fitness coach', IG_SKIP, '"DM"'),
    buildQuery('instagram.com', 'personal trainer', IG_SKIP, '"email"'),
    // Facebook
    buildQuery('facebook.com', 'fitness trainer', FB_SKIP),
    buildQuery('facebook.com', 'personal trainer', FB_SKIP, '"contact"'),
    buildQuery('facebook.com', 'gym', FB_SKIP, '"contact" OR "phone"'),
    // LinkedIn
    buildQuery('linkedin.com', 'fitness coach', LI_SKIP),
    buildQuery('linkedin.com', 'personal trainer', LI_SKIP),
    // TikTok
    buildQuery('tiktok.com', 'fitness coach', TT_SKIP),
    buildQuery('tiktok.com', 'personal trainer', TT_SKIP),
    // YouTube
    buildQuery('youtube.com', 'fitness coach', YT_SKIP),
    buildQuery('youtube.com', 'personal trainer', YT_SKIP),
  ],
  jewelry: [
    buildQuery('instagram.com', 'jewelry brand', IG_SKIP),
    buildQuery('instagram.com', 'handmade jewelry', IG_SKIP),
    // Facebook
    buildQuery('facebook.com', 'jewelry brand', FB_SKIP),
    buildQuery('facebook.com', 'handmade jewelry', FB_SKIP),
    buildQuery('facebook.com', 'jewelry shop', FB_SKIP),
    // LinkedIn
    buildQuery('linkedin.com', 'jewelry brand', LI_SKIP),
    buildQuery('linkedin.com', 'jewelry manufacturer', LI_SKIP),
    // TikTok
    buildQuery('tiktok.com', 'jewelry brand', TT_SKIP),
    buildQuery('tiktok.com', 'handmade jewelry', TT_SKIP),
    // Pinterest
    buildQuery('pinterest.com', 'jewelry brand', PI_SKIP),
    buildQuery('pinterest.com', 'handmade jewelry', PI_SKIP),
    // YouTube
    buildQuery('youtube.com', 'jewelry brand', YT_SKIP),
  ],
  beauty: [
    buildQuery('instagram.com', 'beauty brand', IG_SKIP),
    buildQuery('instagram.com', 'skincare brand', IG_SKIP),
    // Facebook
    buildQuery('facebook.com', 'beauty brand', FB_SKIP),
    buildQuery('facebook.com', 'skincare brand', FB_SKIP),
    buildQuery('facebook.com', 'makeup brand', FB_SKIP),
    buildQuery('facebook.com', 'cosmetics brand', FB_SKIP),
    // LinkedIn
    buildQuery('linkedin.com', 'beauty brand', LI_SKIP),
    buildQuery('linkedin.com', 'skincare company', LI_SKIP),
    // TikTok
    buildQuery('tiktok.com', 'beauty brand', TT_SKIP),
    buildQuery('tiktok.com', 'skincare brand', TT_SKIP),
    // YouTube
    buildQuery('youtube.com', 'beauty brand', YT_SKIP),
    buildQuery('youtube.com', 'skincare brand', YT_SKIP),
    // Pinterest
    buildQuery('pinterest.com', 'beauty brand', PI_SKIP),
  ],
  food: [
    buildQuery('instagram.com', 'restaurant', IG_SKIP, '"order"'),
    buildQuery('instagram.com', 'food brand', IG_SKIP),
    // Facebook
    buildQuery('facebook.com', 'restaurant', FB_SKIP),
    buildQuery('facebook.com', 'food brand', FB_SKIP),
    buildQuery('facebook.com', 'catering', FB_SKIP, '"contact" OR "order"'),
    buildQuery('facebook.com', 'bakery', FB_SKIP),
    buildQuery('facebook.com', 'cafe', FB_SKIP, '"order"'),
    // LinkedIn
    buildQuery('linkedin.com', 'food brand', LI_SKIP),
    buildQuery('linkedin.com', 'restaurant owner', LI_SKIP),
    // TikTok
    buildQuery('tiktok.com', 'food brand', TT_SKIP),
    buildQuery('tiktok.com', 'restaurant', TT_SKIP),
    // YouTube
    buildQuery('youtube.com', 'food brand', YT_SKIP),
  ],

  // ═══════════════════════════════════════════════════════════════
  //  PLATFORM-DEDICATED CATEGORIES
  // ═══════════════════════════════════════════════════════════════
  facebook_leads: [
    // ── Facebook Pages / Business Discovery ──
    'site:facebook.com "fashion" "About" "Page" "Contact" ' + FB_SKIP,
    'site:facebook.com "swimwear" "About" "Send Message" ' + FB_SKIP,
    'site:facebook.com "fashion brand" "Shop" "Contact Info" ' + FB_SKIP,
    buildQuery('facebook.com', 'fashion brand', FB_SKIP, '"email" OR "@gmail.com"'),
    buildQuery('facebook.com', 'clothing brand', FB_SKIP, '"email"'),
    buildQuery('facebook.com', 'boutique', FB_SKIP, '"email" OR "contact"'),
    buildQuery('facebook.com', 'fashion designer', FB_SKIP, '"email"'),
    buildQuery('facebook.com', 'online shop', FB_SKIP, '"fashion" "contact"'),
    // ── Facebook Groups & Communities ──
    'site:facebook.com "fashion" "Group" "Public" "members" ' + FB_SKIP,
    'site:facebook.com "wholesale fashion" "Group" ' + FB_SKIP,
    // ── Facebook Marketplace sellers ──
    buildQuery('facebook.com', 'clothing', FB_SKIP, '"seller" "contact"'),
    // ── Facebook intitle dorks ──
    'intitle:"fashion brand" site:facebook.com "contact" "email"',
    'intitle:"boutique" site:facebook.com "shop" "contact"',
    'intitle:"designer" site:facebook.com "fashion" "email"',
    'intitle:"swimwear" site:facebook.com "order" "contact"',
  ],
  linkedin_leads: [
    // ── LinkedIn People (Founders/CEOs) ──
    'inurl:in site:linkedin.com "fashion brand" "founder" ' + LI_SKIP,
    'inurl:in site:linkedin.com "fashion" "CEO" ' + LI_SKIP,
    'inurl:in site:linkedin.com "clothing brand" "founder" ' + LI_SKIP,
    'inurl:in site:linkedin.com "fashion designer" "email" ' + LI_SKIP,
    buildQuery('linkedin.com', 'fashion brand owner', LI_SKIP),
    buildQuery('linkedin.com', 'fashion entrepreneur', LI_SKIP),
    // ── LinkedIn Companies ──
    'inurl:company site:linkedin.com "fashion" "swimwear"',
    'inurl:company site:linkedin.com "clothing" "apparel"',
    'inurl:company site:linkedin.com "fashion brand"',
    buildQuery('linkedin.com', 'fashion company', LI_SKIP, '"employees"'),
    // ── LinkedIn B2B specific ──
    buildQuery('linkedin.com', 'wholesale fashion', LI_SKIP),
    buildQuery('linkedin.com', 'fashion buyer', LI_SKIP),
    buildQuery('linkedin.com', 'fashion sourcing', LI_SKIP),
    // ── LinkedIn intitle dorks ──
    'intitle:"founder" site:linkedin.com "fashion" OR "swimwear" OR "clothing"',
    'intitle:"CEO" site:linkedin.com "fashion brand" OR "apparel"',
  ],
  twitter_leads: [
    // ── Twitter/X Brand Discovery ──
    buildQuery('x.com', 'fashion brand', TW_SKIP),
    buildQuery('x.com', 'clothing brand', TW_SKIP),
    buildQuery('x.com', 'swimwear brand', TW_SKIP),
    buildQuery('x.com', 'fashion brand', TW_SKIP, '"DM" OR "email"'),
    buildQuery('x.com', 'fashion brand', TW_SKIP, '"shop" OR "store"'),
    buildQuery('x.com', 'indie fashion', TW_SKIP),
    // ── Twitter advanced ──
    'site:x.com "fashion brand" "email" OR "@gmail.com" ' + TW_SKIP,
    'site:x.com "small business" "fashion" "shop" ' + TW_SKIP,
    'site:twitter.com "fashion brand" "collab" "DM" ' + TW_SKIP,
    'site:twitter.com "swimwear" "brand" "email" ' + TW_SKIP,
  ],

  // ─── ADVANCED CATEGORIES (Pro-level dorks) ──────────────────
  influencer: [
    // Instagram
    buildQuery('instagram.com', 'influencer', IG_SKIP, '"collab" "DM"'),
    buildQuery('instagram.com', 'micro influencer', IG_SKIP, '"email"'),
    buildQuery('instagram.com', 'brand ambassador', IG_SKIP),
    buildQuery('instagram.com', 'content creator', IG_SKIP, '"email" OR "@gmail.com"'),
    // Facebook
    buildQuery('facebook.com', 'influencer', FB_SKIP, '"collab"'),
    buildQuery('facebook.com', 'content creator', FB_SKIP, '"email"'),
    buildQuery('facebook.com', 'brand ambassador', FB_SKIP),
    // TikTok
    buildQuery('tiktok.com', 'content creator', TT_SKIP, '"collab"'),
    buildQuery('tiktok.com', 'influencer', TT_SKIP, '"brand"'),
    // YouTube
    buildQuery('youtube.com', 'influencer', YT_SKIP, '"collab" OR "sponsor"'),
    buildQuery('youtube.com', 'content creator', YT_SKIP, '"email"'),
    // LinkedIn
    buildQuery('linkedin.com', 'influencer marketing', LI_SKIP),
    buildQuery('linkedin.com', 'content creator', LI_SKIP),
    // Twitter/X
    buildQuery('x.com', 'influencer', TW_SKIP, '"collab"'),
    // Nano influencer
    'site:instagram.com "1K followers" OR "2K followers" OR "5K followers" "collab" ' + IG_SKIP,
  ],
  b2b: [
    // LinkedIn — primary B2B platform
    buildQuery('linkedin.com', 'CEO', LI_SKIP, '"fashion" OR "apparel"'),
    buildQuery('linkedin.com', 'founder', LI_SKIP, '"brand" "fashion"'),
    buildQuery('linkedin.com', 'wholesale', LI_SKIP, '"fashion"'),
    buildQuery('linkedin.com', 'supplier', LI_SKIP, '"clothing" OR "apparel"'),
    buildQuery('linkedin.com', 'buyer', LI_SKIP, '"fashion" "retail"'),
    buildQuery('linkedin.com', 'director', LI_SKIP, '"fashion" OR "retail"'),
    buildQuery('linkedin.com', 'head of buying', LI_SKIP, '"fashion"'),
    // Facebook
    buildQuery('facebook.com', 'wholesale', FB_SKIP, '"fashion" "supplier"'),
    buildQuery('facebook.com', 'wholesale fashion', FB_SKIP, '"contact"'),
    // Instagram
    buildQuery('instagram.com', 'dropshipping', IG_SKIP, '"supplier"'),
    // Advanced: intitle + inurl
    'intitle:"wholesale" site:linkedin.com "fashion" "email"',
    'intitle:"supplier" site:linkedin.com "swimwear" OR "clothing"',
    'intitle:"buyer" site:linkedin.com "fashion" "retail"',
    'inurl:company site:linkedin.com "fashion brand" "CEO" OR "founder"',
  ],
  collab_pr: [
    // Instagram
    buildQuery('instagram.com', 'PR', IG_SKIP, '"collab" "brand"'),
    buildQuery('instagram.com', 'sponsorship', IG_SKIP, '"DM"'),
    buildQuery('instagram.com', 'affiliate', IG_SKIP, '"link" "code"'),
    buildQuery('instagram.com', 'gifted', IG_SKIP, '"brand" "collab"'),
    // Facebook
    buildQuery('facebook.com', 'brand ambassador', FB_SKIP, '"apply"'),
    buildQuery('facebook.com', 'collab', FB_SKIP, '"fashion" "brand"'),
    // TikTok
    buildQuery('tiktok.com', 'sponsor', TT_SKIP, '"brand" OR "collab"'),
    // YouTube
    buildQuery('youtube.com', 'sponsored', YT_SKIP, '"brand"'),
    // LinkedIn
    buildQuery('linkedin.com', 'influencer relations', LI_SKIP),
    // Advanced: OR chains
    'site:instagram.com "open to collabs" OR "PR friendly" OR "gifted" ' + IG_SKIP,
    'site:instagram.com "send PR" OR "send products" "DM" ' + IG_SKIP,
    'site:facebook.com "brand ambassador" "apply" OR "contact" ' + FB_SKIP,
  ],
  startup: [
    buildQuery('instagram.com', 'new brand', IG_SKIP, '"launching" OR "launched"'),
    buildQuery('instagram.com', 'indie brand', IG_SKIP),
    buildQuery('instagram.com', 'startup', IG_SKIP, '"fashion" OR "beauty"'),
    buildQuery('instagram.com', 'emerging designer', IG_SKIP),
    // Facebook
    buildQuery('facebook.com', 'new brand', FB_SKIP, '"launching"'),
    buildQuery('facebook.com', 'startup', FB_SKIP, '"fashion"'),
    // TikTok
    buildQuery('tiktok.com', 'new brand', TT_SKIP, '"small business"'),
    // LinkedIn
    buildQuery('linkedin.com', 'startup', LI_SKIP, '"fashion" "founded"'),
    // Advanced
    'site:instagram.com "just launched" OR "grand opening" "brand" ' + IG_SKIP,
    'site:facebook.com "just launched" OR "grand opening" "brand" ' + FB_SKIP,
  ],
  local_biz: [
    // Instagram — cities
    'site:instagram.com "fashion" "New York" "shop" ' + IG_SKIP,
    'site:instagram.com "fashion" "Los Angeles" "brand" ' + IG_SKIP,
    'site:instagram.com "fashion" "London" "shop" ' + IG_SKIP,
    'site:instagram.com "fashion" "Dubai" "brand" ' + IG_SKIP,
    'site:instagram.com "fashion" "Miami" "boutique" ' + IG_SKIP,
    // Facebook — cities (key for local biz!)
    'site:facebook.com "fashion boutique" "New York" ' + FB_SKIP,
    'site:facebook.com "fashion boutique" "Los Angeles" ' + FB_SKIP,
    'site:facebook.com "fashion boutique" "London" ' + FB_SKIP,
    'site:facebook.com "boutique" "Dubai" "fashion" ' + FB_SKIP,
    'site:facebook.com "boutique" "Miami" "fashion" ' + FB_SKIP,
    'site:facebook.com "clothing store" "New York" ' + FB_SKIP,
    'site:facebook.com "clothing store" "Los Angeles" ' + FB_SKIP,
    // LinkedIn — cities
    'site:linkedin.com "fashion" "New York" "founder" ' + LI_SKIP,
    'site:linkedin.com "fashion" "London" "founder" ' + LI_SKIP,
  ],
  agency: [
    // LinkedIn — agencies
    buildQuery('linkedin.com', 'marketing agency', LI_SKIP, '"fashion"'),
    buildQuery('linkedin.com', 'talent management', LI_SKIP, '"influencer"'),
    buildQuery('linkedin.com', 'PR agency', LI_SKIP, '"fashion"'),
    buildQuery('linkedin.com', 'digital agency', LI_SKIP, '"fashion" OR "ecommerce"'),
    // Facebook
    buildQuery('facebook.com', 'marketing agency', FB_SKIP, '"fashion"'),
    buildQuery('facebook.com', 'PR agency', FB_SKIP, '"fashion"'),
    // Instagram
    buildQuery('instagram.com', 'agency', IG_SKIP, '"talent" "management"'),
    // Advanced
    'intitle:"agency" site:linkedin.com "fashion" "influencer" "contact"',
    'intitle:"PR agency" site:linkedin.com "fashion"',
  ],
  tech_saas: [
    buildQuery('linkedin.com', 'SaaS', LI_SKIP, '"founder" "CEO"'),
    buildQuery('linkedin.com', 'startup', LI_SKIP, '"tech" "founder"'),
    buildQuery('linkedin.com', 'SaaS company', LI_SKIP),
    // Facebook
    buildQuery('facebook.com', 'SaaS', FB_SKIP, '"founder"'),
    buildQuery('facebook.com', 'tech startup', FB_SKIP),
    // Twitter/X
    buildQuery('x.com', 'SaaS founder', TW_SKIP),
    buildQuery('x.com', 'indie hacker', TW_SKIP, '"building"'),
    buildQuery('x.com', 'tech startup', TW_SKIP),
    // YouTube
    buildQuery('youtube.com', 'SaaS', YT_SKIP, '"demo" OR "review"'),
  ],
  real_estate: [
    buildQuery('instagram.com', 'real estate agent', IG_SKIP, '"DM"'),
    buildQuery('instagram.com', 'realtor', IG_SKIP, '"email" OR "call"'),
    // Facebook — very strong for real estate!
    buildQuery('facebook.com', 'real estate agent', FB_SKIP),
    buildQuery('facebook.com', 'realtor', FB_SKIP, '"contact"'),
    buildQuery('facebook.com', 'real estate', FB_SKIP, '"buy" OR "sell"'),
    buildQuery('facebook.com', 'real estate broker', FB_SKIP),
    // LinkedIn — professional agents
    buildQuery('linkedin.com', 'real estate broker', LI_SKIP),
    buildQuery('linkedin.com', 'real estate agent', LI_SKIP),
    buildQuery('linkedin.com', 'property manager', LI_SKIP),
    // TikTok
    buildQuery('tiktok.com', 'realtor', TT_SKIP),
    buildQuery('tiktok.com', 'real estate agent', TT_SKIP),
    // YouTube
    buildQuery('youtube.com', 'real estate agent', YT_SKIP),
  ],
  travel: [
    buildQuery('instagram.com', 'travel agency', IG_SKIP, '"book" OR "DM"'),
    buildQuery('instagram.com', 'hotel', IG_SKIP, '"book" "resort"'),
    // Facebook — strong for travel
    buildQuery('facebook.com', 'travel agency', FB_SKIP),
    buildQuery('facebook.com', 'hotel', FB_SKIP, '"book"'),
    buildQuery('facebook.com', 'resort', FB_SKIP, '"contact"'),
    buildQuery('facebook.com', 'tour operator', FB_SKIP),
    // LinkedIn
    buildQuery('linkedin.com', 'travel agency', LI_SKIP),
    buildQuery('linkedin.com', 'hotel manager', LI_SKIP),
    // TikTok
    buildQuery('tiktok.com', 'travel agency', TT_SKIP),
    // YouTube
    buildQuery('youtube.com', 'travel vlog', YT_SKIP, '"contact"'),
    buildQuery('youtube.com', 'hotel review', YT_SKIP),
  ],
  education: [
    buildQuery('instagram.com', 'online course', IG_SKIP, '"DM" OR "enroll"'),
    buildQuery('instagram.com', 'coach', IG_SKIP, '"mentorship" "DM"'),
    // Facebook — courses & coaching
    buildQuery('facebook.com', 'online course', FB_SKIP, '"enroll"'),
    buildQuery('facebook.com', 'coaching', FB_SKIP, '"contact"'),
    buildQuery('facebook.com', 'tutor', FB_SKIP, '"contact"'),
    // LinkedIn — professional education
    buildQuery('linkedin.com', 'online course', LI_SKIP, '"instructor"'),
    buildQuery('linkedin.com', 'business coach', LI_SKIP),
    buildQuery('linkedin.com', 'career coach', LI_SKIP),
    // YouTube
    buildQuery('youtube.com', 'online course', YT_SKIP, '"enroll"'),
    buildQuery('youtube.com', 'tutorial', YT_SKIP, '"subscribe"'),
    // TikTok
    buildQuery('tiktok.com', 'tutor', TT_SKIP, '"DM"'),
    buildQuery('tiktok.com', 'coaching', TT_SKIP),
  ],

  // ═══════════════════════════════════════════════════════════════
  //  ADVANCED OPERATORS: intext, allintext, allintitle, wildcard,
  //  after, filetype, allinurl — Pro-level lead discovery
  // ═══════════════════════════════════════════════════════════════

  deep_email: [
    // ── intext: Email inside page body (strongest email finder) ──
    'intext:"@gmail.com" site:instagram.com "fashion brand" ' + IG_SKIP,
    'intext:"@gmail.com" site:instagram.com "swimwear" ' + IG_SKIP,
    'intext:"@gmail.com" site:instagram.com "boutique" ' + IG_SKIP,
    'intext:"@yahoo.com" OR "@outlook.com" site:instagram.com "brand" ' + IG_SKIP,
    'intext:"@hotmail.com" site:instagram.com "fashion" ' + IG_SKIP,
    // Facebook
    'intext:"@gmail.com" site:facebook.com "fashion brand" ' + FB_SKIP,
    'intext:"@gmail.com" site:facebook.com "boutique" "contact" ' + FB_SKIP,
    'intext:"email" site:facebook.com "fashion" "contact us" ' + FB_SKIP,
    // LinkedIn
    'intext:"@gmail.com" site:linkedin.com "fashion" "founder" ' + LI_SKIP,
    'intext:"email" site:linkedin.com "CEO" "fashion" ' + LI_SKIP,
    'intext:"@" site:linkedin.com "swimwear" "contact" ' + LI_SKIP,
    // TikTok
    'intext:"@gmail.com" site:tiktok.com "brand" "fashion" ' + TT_SKIP,
    'intext:"email" site:tiktok.com "business" "brand" ' + TT_SKIP,
    // Twitter/X
    'intext:"@gmail.com" site:x.com "fashion brand" ' + TW_SKIP,
    // allintext — all words must be in body
    'allintext: fashion brand email contact instagram',
    'allintext: swimwear brand gmail contact',
    'allintext: clothing brand email wholesale supplier',
    'allintext: boutique fashion email order contact',
  ],

  deep_phone: [
    // ── intext: Phone/WhatsApp/Telegram inside page body ──
    'intext:"+1" site:instagram.com "brand" "fashion" ' + IG_SKIP,
    'intext:"+44" site:instagram.com "brand" "UK" ' + IG_SKIP,
    'intext:"+971" site:instagram.com "brand" "Dubai" ' + IG_SKIP,
    'intext:"+61" site:instagram.com "brand" "Australia" ' + IG_SKIP,
    'intext:"+49" site:instagram.com "brand" "Germany" ' + IG_SKIP,
    // WhatsApp links
    'intext:"wa.me" site:instagram.com "brand" ' + IG_SKIP,
    'intext:"wa.me" site:facebook.com "fashion" ' + FB_SKIP,
    'intext:"wa.me" site:tiktok.com "brand" ' + TT_SKIP,
    'intext:"whatsapp" site:instagram.com "fashion brand" "order" ' + IG_SKIP,
    'intext:"whatsapp" site:facebook.com "fashion" "contact" ' + FB_SKIP,
    // Telegram links
    'intext:"t.me" site:instagram.com "brand" ' + IG_SKIP,
    'intext:"t.me" site:tiktok.com "brand" ' + TT_SKIP,
    'intext:"telegram" site:instagram.com "brand" "DM" ' + IG_SKIP,
    // Facebook phone
    'intext:"+1" site:facebook.com "fashion" "contact" ' + FB_SKIP,
    'intext:"phone" site:facebook.com "boutique" "contact" ' + FB_SKIP,
    // LinkedIn phone
    'intext:"phone" site:linkedin.com "fashion" "founder" ' + LI_SKIP,
    'intext:"+1" site:linkedin.com "fashion" "CEO" ' + LI_SKIP,
    // allintext combos
    'allintext: fashion brand whatsapp order contact',
    'allintext: boutique phone number contact fashion',
  ],

  fresh_leads: [
    // ── after: Fresh content only (active brands) ──
    'site:instagram.com "fashion brand" "email" after:2025-01-01 ' + IG_SKIP,
    'site:instagram.com "new brand" "DM" after:2025-01-01 ' + IG_SKIP,
    'site:instagram.com "just launched" "brand" after:2025-06-01 ' + IG_SKIP,
    'site:instagram.com "grand opening" after:2025-01-01 ' + IG_SKIP,
    'site:instagram.com "coming soon" "brand" after:2025-01-01 ' + IG_SKIP,
    // Facebook fresh
    'site:facebook.com "fashion brand" "launched" after:2025-01-01 ' + FB_SKIP,
    'site:facebook.com "new collection" "brand" after:2025-01-01 ' + FB_SKIP,
    'site:facebook.com "grand opening" "boutique" after:2025-01-01 ' + FB_SKIP,
    // TikTok fresh
    'site:tiktok.com "new brand" "small business" after:2025-01-01 ' + TT_SKIP,
    'site:tiktok.com "just launched" "fashion" after:2025-06-01 ' + TT_SKIP,
    // LinkedIn fresh
    'site:linkedin.com "founded" "fashion" after:2024-01-01 ' + LI_SKIP,
    'site:linkedin.com "co-founder" "fashion brand" after:2024-06-01 ' + LI_SKIP,
    'site:linkedin.com "startup" "fashion" "launched" after:2024-01-01 ' + LI_SKIP,
    // allintitle — fresh brands with strong titles
    'allintitle: new fashion brand 2025',
    'allintitle: fashion startup founder 2025',
    'allintitle: emerging designer brand',
    'allintitle: indie fashion brand launch',
  ],

  document_leads: [
    // ── filetype: B2B documents with contacts ──
    'filetype:pdf "fashion brands" "email" "contact"',
    'filetype:pdf "fashion brand list" "email"',
    'filetype:pdf "influencer" "media kit" "email" "rates"',
    'filetype:pdf "wholesale" "catalog" "fashion" "email"',
    'filetype:pdf "press" "contact" "fashion brand"',
    'filetype:pdf "brand directory" "fashion" "email"',
    // CSV and Excel
    'filetype:csv "email" "fashion" "brand"',
    'filetype:csv "fashion" "contact" "instagram"',
    'filetype:xlsx "fashion brands" "email"',
    'filetype:xlsx "suppliers" "contact" "clothing"',
    // Specific document types
    'filetype:pdf "swimwear" "contact" "email"',
    'filetype:pdf "brand ambassador" "application" "email"',
    'filetype:doc "fashion" "partnership" "contact" "email"',
    // allinurl — structured URLs with docs
    'allinurl: fashion brands directory contact',
    'allinurl: supplier list clothing wholesale',
    'allinurl: influencer database fashion email',
  ],

  wildcard_discovery: [
    // ── * Wildcard — creative pattern matching ──
    'site:instagram.com "* swimwear" "brand" "@gmail.com" ' + IG_SKIP,
    'site:instagram.com "* fashion" "DM for orders" ' + IG_SKIP,
    'site:instagram.com "founder of *" "fashion" ' + IG_SKIP,
    'site:instagram.com "CEO of *" "brand" ' + IG_SKIP,
    'site:instagram.com "* boutique" "shop" "email" ' + IG_SKIP,
    'site:instagram.com "handmade *" "small business" "DM" ' + IG_SKIP,
    // Facebook wildcards
    'site:facebook.com "* fashion" "About" "Contact" ' + FB_SKIP,
    'site:facebook.com "* boutique" "shop" "contact" ' + FB_SKIP,
    'site:facebook.com "* clothing" "brand" "email" ' + FB_SKIP,
    // LinkedIn wildcards
    'site:linkedin.com "founder of *" "fashion" ' + LI_SKIP,
    'site:linkedin.com "CEO at *" "fashion" OR "apparel" ' + LI_SKIP,
    'site:linkedin.com "head of * at" "fashion brand" ' + LI_SKIP,
    // TikTok wildcards
    'site:tiktok.com "* brand" "small business" "link in bio" ' + TT_SKIP,
    'site:tiktok.com "handmade *" "shop" ' + TT_SKIP,
    // allintitle combos with specificity
    'allintitle: fashion brand owner contact email',
    'allintitle: wholesale clothing supplier contact',
    'allintitle: boutique fashion shop online',
    'allintitle: swimwear brand founder CEO',
  ],

  // ═══════════════════════════════════════════════════════════════
  //  MULTI-LANGUAGE DORKS — 6 tillar
  // ═══════════════════════════════════════════════════════════════

  lang_spanish: [
    'site:instagram.com "marca de moda" ' + IG_SKIP,
    'site:instagram.com "tienda de ropa" "email" ' + IG_SKIP,
    'site:instagram.com "ropa" "envío gratis" ' + IG_SKIP,
    'site:instagram.com "moda" "contacto" "email" ' + IG_SKIP,
    'site:facebook.com "marca de moda" "contacto" ' + FB_SKIP,
    'site:facebook.com "tienda" "ropa" "email" ' + FB_SKIP,
    'site:facebook.com "boutique" "moda" "whatsapp" ' + FB_SKIP,
    'site:linkedin.com "moda" "fundador" ' + LI_SKIP,
    'site:tiktok.com "marca de ropa" "negocio" ' + TT_SKIP,
    'intext:"@gmail.com" site:instagram.com "moda" ' + IG_SKIP,
    'site:instagram.com "joyería" "hecho a mano" ' + IG_SKIP,
    'site:instagram.com "traje de baño" "marca" ' + IG_SKIP,
  ],

  lang_french: [
    'site:instagram.com "marque de mode" ' + IG_SKIP,
    'site:instagram.com "boutique" "mode" "email" ' + IG_SKIP,
    'site:instagram.com "vêtements" "livraison gratuite" ' + IG_SKIP,
    'site:instagram.com "mode" "contact" "email" ' + IG_SKIP,
    'site:facebook.com "marque de mode" "contact" ' + FB_SKIP,
    'site:facebook.com "boutique" "vêtements" "email" ' + FB_SKIP,
    'site:linkedin.com "mode" "fondateur" ' + LI_SKIP,
    'site:tiktok.com "marque de mode" ' + TT_SKIP,
    'intext:"@gmail.com" site:instagram.com "mode" ' + IG_SKIP,
    'site:instagram.com "bijoux" "fait main" ' + IG_SKIP,
    'site:instagram.com "maillot de bain" "marque" ' + IG_SKIP,
  ],

  lang_turkish: [
    'site:instagram.com "moda markası" ' + IG_SKIP,
    'site:instagram.com "giyim" "marka" "email" ' + IG_SKIP,
    'site:instagram.com "butik" "sipariş" "DM" ' + IG_SKIP,
    'site:instagram.com "moda" "iletişim" ' + IG_SKIP,
    'site:facebook.com "moda markası" "iletişim" ' + FB_SKIP,
    'site:facebook.com "butik" "giyim" "email" ' + FB_SKIP,
    'site:linkedin.com "moda" "kurucu" ' + LI_SKIP,
    'site:tiktok.com "moda markası" ' + TT_SKIP,
    'intext:"@gmail.com" site:instagram.com "moda" "marka" ' + IG_SKIP,
    'site:instagram.com "el yapımı" "takı" ' + IG_SKIP,
    'site:instagram.com "mayo" "marka" ' + IG_SKIP,
    'site:instagram.com "giyim" "kargo" "ücretsiz" ' + IG_SKIP,
  ],

  lang_arabic: [
    'site:instagram.com "ماركة أزياء" ' + IG_SKIP,
    'site:instagram.com "متجر" "ملابس" "ايميل" ' + IG_SKIP,
    'site:instagram.com "أزياء" "تواصل" ' + IG_SKIP,
    'site:instagram.com "موضة" "واتساب" ' + IG_SKIP,
    'site:facebook.com "ماركة أزياء" "تواصل" ' + FB_SKIP,
    'site:facebook.com "متجر" "ملابس" ' + FB_SKIP,
    'site:instagram.com "مجوهرات" "يدوي" ' + IG_SKIP,
    'site:instagram.com "ملابس سباحة" ' + IG_SKIP,
    'intext:"@gmail.com" site:instagram.com "أزياء" ' + IG_SKIP,
    'site:tiktok.com "موضة" "ماركة" ' + TT_SKIP,
  ],

  lang_portuguese: [
    'site:instagram.com "marca de moda" ' + IG_SKIP,
    'site:instagram.com "loja" "roupa" "email" ' + IG_SKIP,
    'site:instagram.com "moda" "frete grátis" ' + IG_SKIP,
    'site:instagram.com "moda" "contato" "email" ' + IG_SKIP,
    'site:facebook.com "marca de moda" "contato" ' + FB_SKIP,
    'site:facebook.com "loja" "roupa" "email" ' + FB_SKIP,
    'site:linkedin.com "moda" "fundador" ' + LI_SKIP,
    'site:tiktok.com "marca de moda" ' + TT_SKIP,
    'intext:"@gmail.com" site:instagram.com "moda" "marca" ' + IG_SKIP,
    'site:instagram.com "joias" "artesanal" ' + IG_SKIP,
    'site:instagram.com "biquíni" "marca" ' + IG_SKIP,
  ],

  lang_german: [
    'site:instagram.com "Modemarke" ' + IG_SKIP,
    'site:instagram.com "Bekleidung" "Marke" "email" ' + IG_SKIP,
    'site:instagram.com "Mode" "Kontakt" "email" ' + IG_SKIP,
    'site:instagram.com "Boutique" "Mode" "Bestellung" ' + IG_SKIP,
    'site:facebook.com "Modemarke" "Kontakt" ' + FB_SKIP,
    'site:facebook.com "Boutique" "Mode" "email" ' + FB_SKIP,
    'site:linkedin.com "Mode" "Gründer" ' + LI_SKIP,
    'site:tiktok.com "Modemarke" ' + TT_SKIP,
    'intext:"@gmail.com" site:instagram.com "Mode" "Marke" ' + IG_SKIP,
    'site:instagram.com "Schmuck" "handgemacht" ' + IG_SKIP,
    'site:instagram.com "Bademode" "Marke" ' + IG_SKIP,
  ],
};

/** Returns all queries as a single array */
function getAllQueries() {
  const all = [];
  for (const queries of Object.values(QUERY_CATEGORIES)) {
    all.push(...queries);
  }
  return all;
}

/** Returns queries for a given category */
function getQueriesByCategory(category) {
  return QUERY_CATEGORIES[category] || [];
}

/** Returns category names */
function getCategoryNames() {
  return Object.keys(QUERY_CATEGORIES);
}

/** Eng kuchli 40 ta cross-platform pro query */
function getPriorityQueries() {
  return [
    // ── Instagram ADVANCED ──
    buildQuery('instagram.com', 'swimwear brand', IG_SKIP),
    buildQuery('instagram.com', 'bikini brand', IG_SKIP, '"email"'),
    buildQuery('instagram.com', 'swimwear', IG_SKIP, '"@gmail.com"'),
    buildQuery('instagram.com', 'luxury swimwear', IG_SKIP),
    buildQuery('instagram.com', 'sustainable swimwear', IG_SKIP),
    buildQuery('instagram.com', 'handmade swimwear', IG_SKIP),
    buildQuery('instagram.com', 'swimwear manufacturer', IG_SKIP),
    'site:instagram.com "swimwear" "DM for orders" OR "link in bio" ' + IG_SKIP,
    'site:instagram.com "swimwear" "whatsapp" OR "telegram" ' + IG_SKIP,
    buildQuery('instagram.com', 'content creator', IG_SKIP, '"collab" "fashion"'),
    // ── Facebook ──
    buildQuery('facebook.com', 'swimwear brand', FB_SKIP),
    buildQuery('facebook.com', 'bikini brand', FB_SKIP, '"email"'),
    buildQuery('facebook.com', 'beachwear brand', FB_SKIP),
    // ── TikTok ──
    buildQuery('tiktok.com', 'swimwear brand', TT_SKIP),
    buildQuery('tiktok.com', 'bikini', TT_SKIP, '"small business"'),
    buildQuery('tiktok.com', 'fashion brand', TT_SKIP, '"link in bio"'),
    // ── Twitter/X ──
    buildQuery('x.com', 'swimwear brand', TW_SKIP),
    buildQuery('x.com', 'fashion brand', TW_SKIP, '"DM"'),
    // ── LinkedIn B2B ──
    buildQuery('linkedin.com', 'swimwear', LI_SKIP),
    buildQuery('linkedin.com', 'fashion brand', LI_SKIP, '"founder" OR "CEO"'),
    'intitle:"wholesale" site:linkedin.com "fashion" "email"',
    // ── YouTube ──
    buildQuery('youtube.com', 'swimwear brand', YT_SKIP),
    buildQuery('youtube.com', 'fashion brand', YT_SKIP, '"review"'),
    // ── Pinterest ──
    buildQuery('pinterest.com', 'swimwear brand', PI_SKIP),
    buildQuery('pinterest.com', 'luxury swimwear', PI_SKIP),
    // ── Cross-niche leads ──
    buildQuery('instagram.com', 'fitness coach', IG_SKIP, '"DM"'),
    buildQuery('instagram.com', 'jewelry brand', IG_SKIP, '"email"'),
    buildQuery('instagram.com', 'beauty brand', IG_SKIP, '"collab"'),
    buildQuery('tiktok.com', 'beauty brand', TT_SKIP, '"email"'),
    // ── Advanced intitle/inurl dorks ──
    'intitle:"brand ambassador" site:instagram.com "apply" OR "DM" ' + IG_SKIP,
    'site:instagram.com "small business" "handmade" "@gmail.com" ' + IG_SKIP,
    'site:tiktok.com "small business" "link in bio" "shop" ' + TT_SKIP,
    // ── Influencer discovery ──
    'site:instagram.com "open to collabs" OR "PR friendly" ' + IG_SKIP,
    buildQuery('youtube.com', 'content creator', YT_SKIP, '"collab" "email"'),
    // ── Real estate & services ──
    buildQuery('instagram.com', 'real estate', IG_SKIP, '"DM" "contact"'),
    buildQuery('instagram.com', 'travel agency', IG_SKIP, '"book"'),
    // ── Education ──
    buildQuery('instagram.com', 'online course', IG_SKIP, '"DM" "enroll"'),
    buildQuery('youtube.com', 'online course', YT_SKIP, '"sign up"'),
    // ── Startup ──
    buildQuery('instagram.com', 'new brand', IG_SKIP, '"just launched"'),
    'site:instagram.com "indie brand" "handmade" "worldwide shipping" ' + IG_SKIP,
    // ── ADVANCED OPERATORS (intext, filetype, after, wildcard, allintitle) ──
    'intext:"@gmail.com" site:instagram.com "fashion brand" ' + IG_SKIP,
    'intext:"@gmail.com" site:facebook.com "fashion brand" ' + FB_SKIP,
    'intext:"wa.me" site:instagram.com "brand" ' + IG_SKIP,
    'intext:"+1" site:instagram.com "brand" "fashion" ' + IG_SKIP,
    'site:instagram.com "fashion brand" "email" after:2025-01-01 ' + IG_SKIP,
    'filetype:pdf "fashion brands" "email" "contact"',
    'site:instagram.com "* swimwear" "brand" "@gmail.com" ' + IG_SKIP,
    'site:linkedin.com "founder of *" "fashion" ' + LI_SKIP,
    'allintitle: fashion brand founder CEO',
    'intext:"email" site:linkedin.com "CEO" "fashion" ' + LI_SKIP,
  ];
}

