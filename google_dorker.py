"""
Google Dorking Instagram Scraper — Playwright bilan.

Google qidiruvidan Instagram swimwear brendlarini avtomatik topib,
username, email, telefon, bio ma'lumotlarini yig'adi.

Usage:
    python google_dorker.py                        # Prioritet 25 ta query
    python google_dorker.py --category email        # Faqat email querylar
    python google_dorker.py --category all          # Barcha querylar
    python google_dorker.py --query "swimwear brand" --max-pages 3
"""

import asyncio
import argparse
import csv
import json
import logging
import random
import re
import sys
import urllib.parse
from dataclasses import dataclass, field, asdict
from datetime import datetime
from pathlib import Path

from playwright.async_api import async_playwright, Page, Browser, BrowserContext

# ─── Logging setup ─────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s │ %(levelname)-7s │ %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("dorker")


# ─── Data Models ───────────────────────────────────────────────────────
@dataclass
class ProfileResult:
    """Bitta Instagram profil natijasi."""
    username: str = ""
    profile_url: str = ""
    display_name: str = ""
    bio_snippet: str = ""
    emails: list[str] = field(default_factory=list)
    phones: list[str] = field(default_factory=list)
    follower_text: str = ""
    source_query: str = ""
    category: str = ""
    found_at: str = ""

    def to_dict(self) -> dict:
        d = asdict(self)
        d["emails"] = ", ".join(d["emails"])
        d["phones"] = ", ".join(d["phones"])
        return d


@dataclass
class DorkerConfig:
    """Scraper sozlamalari."""
    max_pages_per_query: int = 5
    min_delay: float = 5.0
    max_delay: float = 12.0
    query_delay_min: float = 15.0
    query_delay_max: float = 30.0
    batch_size: int = 10
    batch_pause_min: float = 120.0     # 2 daqiqa
    batch_pause_max: float = 300.0     # 5 daqiqa
    headless: bool = False
    output_dir: str = "results"
    output_format: str = "both"        # csv, json, both
    viewport_width: int = 1280
    viewport_height: int = 800
    cookie_file: str = "google_cookies.json"  # Google cookie fayli
    use_chrome: bool = False            # Tizim Chrome'ini ishlatish
    chrome_profile_dir: str = ""        # Chrome user profile papkasi


# ─── Regex Patterns ───────────────────────────────────────────────────
EMAIL_REGEX = re.compile(
    r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}',
    re.IGNORECASE
)

PHONE_REGEX = re.compile(
    r'(?:\+?\d{1,4}[\s\-.]?)?\(?\d{1,4}\)?[\s\-.]?\d{2,4}[\s\-.]?\d{2,4}[\s\-.]?\d{0,4}',
)

# Ish vaqtlari va boshqa false positive patternlar
TIME_PATTERN = re.compile(
    r'^\d{1,2}[.:.]\d{2}\s*[-–—]\s*\d{1,2}[.:.]\d{2}$'
)
TAX_ID_PATTERN = re.compile(
    r'^\d{3}-\d{3}-\d{3}$'  # Tax/TRN formatdagi raqamlar
)

USERNAME_REGEX = re.compile(
    r'instagram\.com/([a-zA-Z0-9_.]+)/?'
)

FOLLOWER_REGEX = re.compile(
    r'(\d[\d,]*(?:\.\d+)?\s*(?:K|M|ming\+?|followers|obunachi))',
    re.IGNORECASE
)

# ─── User-Agent Pool ──────────────────────────────────────────────────
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.0.0",
]


# ─── Google Dorker Class ──────────────────────────────────────────────
class GoogleDorker:
    """Google Dorking orqali Instagram profillarini scrape qiladi."""

    GOOGLE_SEARCH_URL = "https://www.google.com/search"

    # DOM Selektorlar (browser research bilan aniqlangan)
    SEL_RESULT_CONTAINER = "div.MjjYud"
    SEL_LINK = 'a[href*="instagram.com"]'
    SEL_TITLE = "h3"
    SEL_SNIPPET = "div.VwiC3b"
    SEL_NEXT_PAGE = "a#pnnext"
    SEL_RESULT_STATS = "#result-stats"
    SEL_CAPTCHA = "#captcha-form"

    def __init__(self, config: DorkerConfig | None = None):
        self.config = config or DorkerConfig()
        self.browser: Browser | None = None
        self.context: BrowserContext | None = None
        self.page: Page | None = None
        self.seen_usernames: set[str] = set()
        self.all_results: list[ProfileResult] = []
        self.stats = {
            "total_queries": 0,
            "total_pages_scraped": 0,
            "total_results": 0,
            "duplicates_skipped": 0,
            "captcha_hits": 0,
            "errors": 0,
        }
        self._output_dir = Path(self.config.output_dir)
        self._output_dir.mkdir(parents=True, exist_ok=True)

    # ─── Browser Lifecycle ────────────────────────────────────────────
    async def start(self):
        """Brauzerni ishga tushirish."""
        self._pw = await async_playwright().start()
        ua = random.choice(USER_AGENTS)

        if self.config.use_chrome and self.config.chrome_profile_dir:
            # Tizim Chrome + user profili (to'liq autentifikatsiya)
            log.info("🌐 Tizim Chrome + user profili ishlatilmoqda...")
            self.context = await self._pw.chromium.launch_persistent_context(
                user_data_dir=self.config.chrome_profile_dir,
                channel="chrome",
                headless=self.config.headless,
                viewport={
                    "width": self.config.viewport_width,
                    "height": self.config.viewport_height,
                },
                args=[
                    "--disable-blink-features=AutomationControlled",
                    "--no-sandbox",
                ],
            )
            self.browser = None  # persistent context'da browser alohida emas
            self.page = self.context.pages[0] if self.context.pages else await self.context.new_page()
            self._consent_handled = True  # Chrome profilda consent allaqachon qabul qilingan
            log.info("🚀 Tizim Chrome ishga tushdi (profil: %s)", self.config.chrome_profile_dir[:50])
            return

        elif self.config.use_chrome:
            # Tizim Chrome (cookie injeksiya bilan)
            log.info("🌐 Tizim Chrome ishlatilmoqda...")
            self.browser = await self._pw.chromium.launch(
                channel="chrome",
                headless=self.config.headless,
                args=[
                    "--disable-blink-features=AutomationControlled",
                    "--no-sandbox",
                ],
            )
        else:
            # Playwright Chromium (default)
            self.browser = await self._pw.chromium.launch(
                headless=self.config.headless,
                args=[
                    "--disable-blink-features=AutomationControlled",
                    "--no-sandbox",
                ],
            )

        self.context = await self.browser.new_context(
            user_agent=ua,
            viewport={
                "width": self.config.viewport_width,
                "height": self.config.viewport_height,
            },
            locale="en-US",
            timezone_id="America/New_York",
        )
        # Automation belgilarini yashirish
        await self.context.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
        """)
        # Cookie'larni yuklash
        await self._load_cookies()

        self.page = await self.context.new_page()
        self._consent_handled = False
        log.info("🚀 Brauzer ishga tushdi (UA: %s...)", ua[:50])

        # Cookie warmup — avval Google bosh sahifasiga borib cookie'larni faollashtirish
        await self._warmup()

    async def _load_cookies(self):
        """Cookie faylidan Google cookie'larni brauzerga inject qilish."""
        cookie_path = Path(self.config.cookie_file)
        if not cookie_path.exists():
            log.warning("⚠️ Cookie fayl topilmadi: %s", cookie_path)
            return

        try:
            with open(cookie_path, "r", encoding="utf-8") as f:
                raw_cookies = json.load(f)

            # Playwright formatiga konvert qilish
            pw_cookies = []
            for c in raw_cookies:
                cookie = {
                    "name": c["name"],
                    "value": c["value"],
                    "domain": c["domain"],
                    "path": c.get("path", "/"),
                }
                if c.get("secure"):
                    cookie["secure"] = True
                if c.get("httpOnly"):
                    cookie["httpOnly"] = True
                # sameSite mapping
                ss = c.get("sameSite", "")
                if ss == "None":
                    cookie["sameSite"] = "None"
                elif ss == "Lax":
                    cookie["sameSite"] = "Lax"
                elif ss == "Strict":
                    cookie["sameSite"] = "Strict"
                pw_cookies.append(cookie)

            await self.context.add_cookies(pw_cookies)
            log.info("🍪 %d ta Google cookie yuklandi: %s", len(pw_cookies), cookie_path.name)
        except Exception as e:
            log.error("❌ Cookie yuklash xatosi: %s", e)

    async def stop(self):
        """Brauzerni xavfsiz yopish."""
        try:
            if self.context:
                await self.context.close()
            if self.browser:
                await self.browser.close()
            if self._pw:
                await self._pw.stop()
        except Exception:
            pass
        log.info("🛑 Brauzer yopildi")

    async def _warmup(self):
        """Google bosh sahifasiga borib cookie'larni faollashtirish.
        
        Cookie'lar inject bo'lgandan keyin, brauzer avval Google'ga
        borib cookie'larni 'qizdirishi' kerak. Aks holda birinchi
        search request'da CAPTCHA chiqadi.
        """
        try:
            log.info("🔥 Cookie warmup — Google bosh sahifasiga borilmoqda...")
            await self.page.goto("https://www.google.com", wait_until="domcontentloaded", timeout=15000)
            await asyncio.sleep(2)

            # Consent sahifasini handle qilish
            await self._handle_consent()
            await asyncio.sleep(1)

            # Oddiy qidiruv bilan cookie'larni faollashtirish
            log.info("🔥 Test qidiruv — cookie'lar faollashtirilmoqda...")
            await self.page.goto(
                "https://www.google.com/search?q=instagram",
                wait_until="domcontentloaded",
                timeout=15000,
            )
            await asyncio.sleep(3)

            # Consent yana chiqsa handle qilish
            await self._handle_consent()

            # CAPTCHA tekshirish
            if await self._check_captcha():
                log.warning("⚠️ Warmup'da CAPTCHA chiqdi — 30s kutilmoqda...")
                await asyncio.sleep(30)

            log.info("✅ Cookie warmup muvaffaqiyatli!")
        except Exception as e:
            log.warning("⚠️ Warmup xatosi (davom etilmoqda): %s", e)

    # ─── Google Consent / Cookie Page ─────────────────────────────────
    async def _handle_consent(self):
        """Google cookie/consent sahifasini avtomatik qabul qilish."""
        if self._consent_handled:
            return
        try:
            # Google consent dialog turli variantlari
            consent_selectors = [
                'button[id="L2AGLb"]',       # "I agree" / "Qabul qilaman"
                'button[id="W0wltc"]',       # "Reject all" button
                'button:has-text("Accept all")',
                'button:has-text("Barchasini qabul")',
                'button:has-text("Qabul qilaman")',
                'button:has-text("I agree")',
                'form[action*="consent"] button',
            ]
            for sel in consent_selectors:
                try:
                    btn = await self.page.query_selector(sel)
                    if btn:
                        await btn.click()
                        log.info("🍪 Google consent qabul qilindi")
                        self._consent_handled = True
                        await asyncio.sleep(2)
                        return
                except Exception:
                    continue

            # URL orqali consent aniqlash
            current_url = self.page.url
            if "consent.google" in current_url:
                # Consent formidagi birinchi buttonni bosish
                btns = await self.page.query_selector_all("button")
                for btn in btns:
                    text = (await btn.inner_text()).strip().lower()
                    if any(w in text for w in ["agree", "accept", "qabul", "barcha"]):
                        await btn.click()
                        log.info("🍪 Consent sahifasi — button bosildi: %s", text)
                        self._consent_handled = True
                        await asyncio.sleep(2)
                        return

        except Exception as e:
            log.debug("Consent handle xatosi: %s", e)

    # ─── URL Builder ──────────────────────────────────────────────────
    def _build_search_url(self, query: str, start: int = 0) -> str:
        """Google search URL yasash."""
        params = {"q": query, "num": "10"}
        if start > 0:
            params["start"] = str(start)
        return f"{self.GOOGLE_SEARCH_URL}?{urllib.parse.urlencode(params)}"

    # ─── Delay ────────────────────────────────────────────────────────
    async def _random_delay(self, min_s: float, max_s: float, label: str = ""):
        """Random kutish — anti-detection."""
        delay = random.uniform(min_s, max_s)
        if label:
            log.debug("⏳ %s: %.1f soniya kutilmoqda...", label, delay)
        await asyncio.sleep(delay)

    # ─── CAPTCHA Detection ────────────────────────────────────────────
    async def _check_captcha(self) -> bool:
        """CAPTCHA yoki unusual traffic xabarini tekshirish.
        
        Consent sahifasini CAPTCHA deb xato aniqlashdan saqlanadi.
        """
        try:
            # Avval consent sahifasini tekshirish
            current_url = self.page.url
            if "consent.google" in current_url:
                await self._handle_consent()
                return False  # Bu CAPTCHA emas, consent sahifasi

            captcha = await self.page.query_selector(self.SEL_CAPTCHA)
            if captcha:
                log.warning("🚫 CAPTCHA aniqlandi!")
                self.stats["captcha_hits"] += 1
                return True

            content = await self.page.content()
            lower = content.lower()
            
            # Consent sahifasi belgilari — bu CAPTCHA emas
            if "consent.google" in lower or "before you continue" in lower:
                await self._handle_consent()
                return False

            if "unusual traffic" in lower or "are not a robot" in lower:
                log.warning("🚫 'Unusual traffic' xabari aniqlandi!")
                self.stats["captcha_hits"] += 1
                return True
        except Exception:
            pass
        return False

    # ─── Parse Result ─────────────────────────────────────────────────
    def _extract_username(self, url: str) -> str:
        """Instagram URL dan username ajratish."""
        match = USERNAME_REGEX.search(url)
        if match:
            username = match.group(1).lower().rstrip("/")
            # Noto'g'ri username'larni filtrlash
            if username in ("p", "reel", "explore", "stories", "tv", "about"):
                return ""
            return username
        return ""

    def _extract_emails(self, text: str) -> list[str]:
        """Matndan email manzillarni ajratish."""
        if not text:
            return []
        found = EMAIL_REGEX.findall(text)
        # Noto'g'ri emaillarni filtrlash
        blocked_domains = {"example.com", "email.com", "domain.com", "sentry.io"}
        return [
            e.lower() for e in set(found)
            if not any(bd in e.lower() for bd in blocked_domains)
        ]

    def _extract_phones(self, text: str) -> list[str]:
        """Matndan telefon raqamlarni ajratish."""
        if not text:
            return []
        found = PHONE_REGEX.findall(text)
        result = []
        for p in set(found):
            p = p.strip()
            digit_count = sum(c.isdigit() for c in p)
            # Faqat 7+ raqamli sonlarni qabul qilish
            if digit_count < 7:
                continue
            # Ish vaqtlarini filtrlash (12.00-18.00, 9:00-17:00)
            if TIME_PATTERN.match(p):
                continue
            # Tax ID / TRN raqamlarini filtrlash (682-024-678)
            if TAX_ID_PATTERN.match(p):
                continue
            # Yil rangeli raqamlarni filtrlash (2023, 2024, 2025, 2026)
            digits_only = ''.join(c for c in p if c.isdigit())
            if digit_count <= 8 and digits_only[:4] in ('2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027'):
                continue
            result.append(p)
        return result

    def _extract_followers(self, text: str) -> str:
        """Matndan follower sonini ajratish."""
        if not text:
            return ""
        match = FOLLOWER_REGEX.search(text)
        if not match:
            return ""
        value = match.group(0).strip()
        # Yillarni filtrlash (2020-2027 oralig'idagi sonlar)
        num_part = re.match(r'([\d,.]+)', value)
        if num_part:
            num_str = num_part.group(1)
            # Faqat butun sonlarni tekshirish (decimal bo'lmagan: 2023, 2026)
            # 204.2K kabi decimal sonlarni O'TKAZIB YUBORISH
            int_part = num_str.split('.')[0].replace(',', '')
            if '.' not in num_str and int_part.isdigit() and len(int_part) == 4:
                if 2000 <= int(int_part) <= 2099:
                    return ""
        return value

    async def _parse_results(self, query: str, category: str) -> list[ProfileResult]:
        """Joriy sahifadagi barcha natijalarni parse qilish."""
        results = []
        try:
            containers = await self.page.query_selector_all(self.SEL_RESULT_CONTAINER)
            if not containers:
                # Fallback selektor
                containers = await self.page.query_selector_all("div.g")

            for container in containers:
                try:
                    # Instagram linkini topish
                    link_el = await container.query_selector(self.SEL_LINK)
                    if not link_el:
                        continue

                    href = await link_el.get_attribute("href") or ""

                    # Faqat Instagram profil sahifalarini olish
                    if "instagram.com" not in href:
                        continue
                    if any(skip in href for skip in ["/p/", "/reel/", "/explore/", "/stories/", "/tv/"]):
                        continue

                    username = self._extract_username(href)
                    if not username:
                        continue

                    # Duplicate tekshirish
                    if username in self.seen_usernames:
                        self.stats["duplicates_skipped"] += 1
                        continue
                    self.seen_usernames.add(username)

                    # Title
                    title_el = await container.query_selector(self.SEL_TITLE)
                    display_name = ""
                    if title_el:
                        display_name = (await title_el.inner_text()).strip()

                    # Snippet
                    snippet_el = await container.query_selector(self.SEL_SNIPPET)
                    snippet = ""
                    if snippet_el:
                        snippet = (await snippet_el.inner_text()).strip()

                    # Konteyner to'liq matni (qo'shimcha ma'lumot uchun)
                    full_text = (await container.inner_text()).strip()

                    # Ma'lumotlarni ajratish
                    combined_text = f"{display_name} {snippet} {full_text}"
                    emails = self._extract_emails(combined_text)
                    phones = self._extract_phones(snippet)
                    followers = self._extract_followers(combined_text)

                    # Bo'sh profillarni skip qilish (display_name va bio yo'q)
                    if not display_name and not snippet:
                        log.debug("⏩ Bo'sh profil skip: %s", username)
                        continue

                    profile = ProfileResult(
                        username=username,
                        profile_url=f"https://www.instagram.com/{username}/",
                        display_name=display_name,
                        bio_snippet=snippet[:500],
                        emails=emails,
                        phones=phones,
                        follower_text=followers,
                        source_query=query,
                        category=category,
                        found_at=datetime.now().isoformat(),
                    )
                    results.append(profile)

                except Exception as e:
                    log.debug("Natija parse xatosi: %s", e)
                    continue

        except Exception as e:
            log.error("Parse xatosi: %s", e)
            self.stats["errors"] += 1

        return results

    # ─── Pagination ───────────────────────────────────────────────────
    async def _has_next_page(self) -> bool:
        """Keyingi sahifa borligini tekshirish."""
        next_btn = await self.page.query_selector(self.SEL_NEXT_PAGE)
        return next_btn is not None

    async def _get_next_page_url(self) -> str | None:
        """Keyingi sahifa URL'ini olish."""
        next_btn = await self.page.query_selector(self.SEL_NEXT_PAGE)
        if next_btn:
            return await next_btn.get_attribute("href")
        return None

    # ─── Core Scraping ────────────────────────────────────────────────
    async def scrape_query(self, query: str, category: str = "unknown") -> list[ProfileResult]:
        """Bitta query uchun barcha sahifalarni scrape qilish."""
        log.info("🔍 Query: %s", query[:80])
        self.stats["total_queries"] += 1
        query_results = []

        url = self._build_search_url(query)

        for page_num in range(1, self.config.max_pages_per_query + 1):
            try:
                log.info("   📄 Sahifa %d...", page_num)

                await self.page.goto(url, wait_until="domcontentloaded", timeout=30000)
                await self._random_delay(2, 4, "Sahifa yuklandi")

                # Consent sahifasini handle qilish (birinchi marta)
                await self._handle_consent()

                # CAPTCHA tekshirish
                if await self._check_captcha():
                    log.warning("   ⚠️ CAPTCHA — query to'xtatildi, 60s kutilmoqda...")
                    await asyncio.sleep(60)
                    # CAPTCHA'dan keyin sahifani qayta yuklash
                    await self.page.goto(url, wait_until="domcontentloaded", timeout=30000)
                    await self._random_delay(3, 5)
                    if await self._check_captcha():
                        log.error("   ❌ CAPTCHA hal bo'lmadi — keyingi query'ga o'tilmoqda")
                        break

                # Natijalar borligini tekshirish
                result_stats = await self.page.query_selector(self.SEL_RESULT_STATS)
                if result_stats:
                    stats_text = await result_stats.inner_text()
                    log.info("   📊 %s", stats_text.strip())

                # Parse
                results = await self._parse_results(query, category)
                query_results.extend(results)
                self.stats["total_pages_scraped"] += 1

                log.info("   ✅ %d ta yangi profil topildi (jami: %d)",
                         len(results), len(self.seen_usernames))

                # Keyingi sahifa
                if page_num < self.config.max_pages_per_query:
                    if not await self._has_next_page():
                        log.info("   📌 Oxirgi sahifa — keyingi query'ga o'tilmoqda")
                        break

                    next_href = await self._get_next_page_url()
                    if next_href:
                        if next_href.startswith("/"):
                            url = f"https://www.google.com{next_href}"
                        else:
                            url = next_href
                    else:
                        break

                    await self._random_delay(
                        self.config.min_delay,
                        self.config.max_delay,
                        f"Sahifa {page_num} → {page_num + 1}"
                    )

            except Exception as e:
                log.error("   ❌ Sahifa %d xatosi: %s", page_num, e)
                self.stats["errors"] += 1
                break

        self.stats["total_results"] += len(query_results)
        return query_results

    async def run(self, queries: list[str], category: str = "mixed"):
        """Barcha querylarni ketma-ket ishlatish (batch logic bilan)."""
        total = len(queries)
        log.info("=" * 60)
        log.info("🏁 DORKING BOSHLANMOQDA — %d ta query", total)
        log.info("=" * 60)

        await self.start()

        try:
            for i, query in enumerate(queries, 1):
                log.info("─" * 50)
                log.info("📋 [%d/%d] Query ishlanmoqda...", i, total)

                results = await self.scrape_query(query, category)
                self.all_results.extend(results)

                # Har query'dan keyin natijalarni saqlash (crash-safe)
                if results:
                    self._save_incremental()

                # Batch pause — har N querydan keyin uzoqroq kutish
                if i % self.config.batch_size == 0 and i < total:
                    pause = random.uniform(
                        self.config.batch_pause_min,
                        self.config.batch_pause_max,
                    )
                    log.info(
                        "🔄 Batch pauza — %d query bajarildi, %.0f soniya kutilmoqda...",
                        i, pause,
                    )
                    await asyncio.sleep(pause)
                elif i < total:
                    # Oddiy query orasidagi delay
                    await self._random_delay(
                        self.config.query_delay_min,
                        self.config.query_delay_max,
                        "Query orasidagi kutish"
                    )

        except KeyboardInterrupt:
            log.warning("\n⚠️ Ctrl+C — to'xtatilmoqda...")
        finally:
            await self.stop()
            self.save_results()
            self._print_summary()

    # ─── Save Results ─────────────────────────────────────────────────
    def _save_incremental(self):
        """Har bir query'dan keyin natijalarni saqlash (crash-safe)."""
        ts = datetime.now().strftime("%Y%m%d")
        path = self._output_dir / f"dorking_{ts}_incremental.json"
        data = [r.to_dict() for r in self.all_results]
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def save_results(self):
        """Barcha natijalarni CSV va/yoki JSON ga yozish."""
        if not self.all_results:
            log.warning("⚠️ Hech qanday natija topilmadi!")
            return

        ts = datetime.now().strftime("%Y%m%d_%H%M%S")

        if self.config.output_format in ("csv", "both"):
            csv_path = self._output_dir / f"dorking_{ts}.csv"
            fieldnames = [
                "username", "profile_url", "display_name", "bio_snippet",
                "emails", "phones", "follower_text", "source_query",
                "category", "found_at",
            ]
            with open(csv_path, "w", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                for r in self.all_results:
                    writer.writerow(r.to_dict())
            log.info("💾 CSV saqlandi: %s (%d ta natija)", csv_path, len(self.all_results))

        if self.config.output_format in ("json", "both"):
            json_path = self._output_dir / f"dorking_{ts}.json"
            data = [r.to_dict() for r in self.all_results]
            with open(json_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            log.info("💾 JSON saqlandi: %s (%d ta natija)", json_path, len(self.all_results))

    def _print_summary(self):
        """Yakuniy statistikani chiqarish."""
        log.info("=" * 60)
        log.info("📊 YAKUNIY STATISTIKA")
        log.info("=" * 60)
        log.info("   Querylar:         %d", self.stats["total_queries"])
        log.info("   Sahifalar:        %d", self.stats["total_pages_scraped"])
        log.info("   Topilgan:         %d ta unikal profil", len(self.seen_usernames))
        log.info("   Email borlar:     %d", sum(1 for r in self.all_results if r.emails))
        log.info("   Telefon borlar:   %d", sum(1 for r in self.all_results if r.phones))
        log.info("   Dublikatlar:      %d ta skip", self.stats["duplicates_skipped"])
        log.info("   CAPTCHA:          %d marta", self.stats["captcha_hits"])
        log.info("   Xatolar:          %d", self.stats["errors"])
        log.info("=" * 60)


# ─── CLI Entry Point ──────────────────────────────────────────────────
def parse_args():
    parser = argparse.ArgumentParser(
        description="Google Dorking Instagram Scraper",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Misollar:
  python google_dorker.py                           # Eng kuchli 25 ta query
  python google_dorker.py --category email          # Faqat email querylar
  python google_dorker.py --category all            # Barcha 100+ query
  python google_dorker.py --categories basic_brand email luxury
  python google_dorker.py --query "swimwear brand"  # Bitta maxsus query
  python google_dorker.py --max-pages 3 --headless  # 3 sahifa, headless mode
  python google_dorker.py --list-categories         # Kategoriyalar ro'yxati
        """,
    )
    parser.add_argument("--query", type=str, help="Bitta maxsus dork query")
    parser.add_argument("--category", type=str, help="Query kategoriyasi (yoki 'all')")
    parser.add_argument("--categories", nargs="+", help="Bir nechta kategoriya")
    parser.add_argument("--max-pages", type=int, default=5, help="Har query uchun max sahifalar (default: 5)")
    parser.add_argument("--headless", action="store_true", help="Headless mode")
    parser.add_argument("--output", type=str, default="results", help="Output papkasi")
    parser.add_argument("--format", choices=["csv", "json", "both"], default="both", help="Output formati")
    parser.add_argument("--min-delay", type=float, default=5.0, help="Min sahifa delay (soniya)")
    parser.add_argument("--max-delay", type=float, default=12.0, help="Max sahifa delay (soniya)")
    parser.add_argument("--batch-size", type=int, default=10, help="Batch hajmi")
    parser.add_argument("--cookies", type=str, default="google_cookies.json", help="Google cookie fayli (default: google_cookies.json)")
    parser.add_argument("--chrome", action="store_true", help="Tizim Chrome brauzerini ishlatish (CAPTCHA'siz)")
    parser.add_argument("--chrome-profile", type=str, default="", help="Chrome user profil papkasi (masalan: %%LOCALAPPDATA%%/Google/Chrome/User Data)")
    parser.add_argument("--list-categories", action="store_true", help="Kategoriyalar ro'yxatini ko'rsatish")
    return parser.parse_args()


async def main():
    from queries import (
        get_all_queries,
        get_queries_by_category,
        get_category_names,
        get_priority_queries,
        QUERY_CATEGORIES,
    )

    args = parse_args()

    # Kategoriyalar ro'yxati
    if args.list_categories:
        print("\n📋 Mavjud kategoriyalar:\n")
        for name, queries in QUERY_CATEGORIES.items():
            print(f"   {name:20s} — {len(queries)} ta query")
        total = sum(len(q) for q in QUERY_CATEGORIES.values())
        print(f"\n   {'JAMI':20s} — {total} ta query")
        print(f"   {'prioritet':20s} — 25 ta query (eng kuchlilari)")
        return

    # Config
    config = DorkerConfig(
        max_pages_per_query=args.max_pages,
        min_delay=args.min_delay,
        max_delay=args.max_delay,
        headless=args.headless,
        output_dir=args.output,
        output_format=args.format,
        batch_size=args.batch_size,
        cookie_file=args.cookies,
        use_chrome=args.chrome,
        chrome_profile_dir=args.chrome_profile,
    )

    # Querylarni tanlash
    queries = []
    category = "mixed"

    if args.query:
        # Bitta maxsus query
        raw = args.query.strip()
        if not raw.startswith("site:"):
            raw = f'site:instagram.com "{raw}" -"/p/" -"/reel/" -"/explore/"'
        queries = [raw]
        category = "custom"

    elif args.categories:
        # Bir nechta kategoriya
        for cat in args.categories:
            cat_queries = get_queries_by_category(cat)
            if cat_queries:
                queries.extend(cat_queries)
            else:
                log.warning("⚠️ Kategoriya topilmadi: %s", cat)
        category = "+".join(args.categories)

    elif args.category:
        if args.category == "all":
            queries = get_all_queries()
            category = "all"
        else:
            queries = get_queries_by_category(args.category)
            category = args.category
            if not queries:
                log.error("❌ Kategoriya topilmadi: %s", args.category)
                log.info("   Mavjud kategoriyalar: %s", ", ".join(get_category_names()))
                return

    else:
        # Default — eng kuchli 25 ta query
        queries = get_priority_queries()
        category = "priority"

    if not queries:
        log.error("❌ Hech qanday query topilmadi!")
        return

    log.info("📋 %d ta query tanlandi (kategoriya: %s)", len(queries), category)

    # Run
    dorker = GoogleDorker(config)
    await dorker.run(queries, category)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        log.info("\n👋 Dastur to'xtatildi (Ctrl+C)")
        sys.exit(0)
