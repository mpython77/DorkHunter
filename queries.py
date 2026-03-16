"""
Google Dorking query'lari — Instagram swimwear lead topish uchun.
full_guido.txt dan olingan va kategoriya bo'yicha guruhlangan.
"""

# ─── Asosiy dork shablon ───────────────────────────────────────────────
BASE_DORK = 'site:instagram.com "{keyword}" -"/p/" -"/reel/" -"/explore/"'
BASE_DORK_2 = 'site:instagram.com "{keyword}" "{signal}" -"/p/" -"/reel/" -"/explore/"'


# ─── A) Asosiy swimwear brand leadlar ──────────────────────────────────
BASIC_BRAND_QUERIES = [
    'site:instagram.com "swimwear brand" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "bikini brand" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimsuit brand" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "beachwear brand" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "resortwear brand" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swim brand" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "bikini label" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear label" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "beach brand" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "vacation wear brand" -"/p/" -"/reel/" -"/explore/"',
]

# ─── B) Email bor swimwear leadlar ────────────────────────────────────
EMAIL_QUERIES = [
    'site:instagram.com "swimwear brand" "email" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "bikini brand" "email" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "beachwear brand" "email" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "resortwear brand" "email" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimsuit brand" "email" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear" "@gmail.com" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "bikini" "@gmail.com" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear" "@hotmail.com" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear" "@outlook.com" -"/p/" -"/reel/" -"/explore/"',
]

# ─── C) Website bor brandlar ──────────────────────────────────────────
WEBSITE_QUERIES = [
    'site:instagram.com "swimwear brand" ".com" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "bikini brand" ".com" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "luxury swimwear" ".com" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "sustainable swimwear" ".com" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "beachwear brand" ".com" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "resortwear brand" ".com" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimsuit brand" ".com" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "bikini label" ".com" -"/p/" -"/reel/" -"/explore/"',
]

# ─── D) Shop/store bor brandlar ───────────────────────────────────────
SHOP_QUERIES = [
    'site:instagram.com "swimwear brand" "shop" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "bikini brand" "shop" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "beachwear brand" "shop" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear brand" "store" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "bikini brand" "store" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear" "shop now" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "bikini" "shop now" -"/p/" -"/reel/" -"/explore/"',
]

# ─── E) Premium / luxury segment ──────────────────────────────────────
LUXURY_QUERIES = [
    'site:instagram.com "luxury swimwear" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "premium swimwear" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "designer swimwear" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "designer bikini" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "high end swimwear" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "exclusive swimwear" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "luxury beachwear" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "luxury resortwear" -"/p/" -"/reel/" -"/explore/"',
]

# ─── F) Sustainable / eco segment ─────────────────────────────────────
ECO_QUERIES = [
    'site:instagram.com "sustainable swimwear" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "ethical swimwear" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "eco swimwear" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "recycled swimwear" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "sustainable bikini" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "ethical bikini brand" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "slow fashion swimwear" -"/p/" -"/reel/" -"/explore/"',
]

# ─── G) Women's segment ───────────────────────────────────────────────
WOMEN_QUERIES = [
    'site:instagram.com "women\'s swimwear" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "women swimwear brand" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "women\'s bikini brand" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "ladies swimwear" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "women\'s beachwear" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "women\'s resortwear" -"/p/" -"/reel/" -"/explore/"',
]

# ─── H) Niche segmentlar ──────────────────────────────────────────────
NICHE_QUERIES = [
    'site:instagram.com "plus size swimwear" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "modest swimwear" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "maternity swimwear" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "kids swimwear" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "men\'s swimwear" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "surf swimwear" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "active swimwear" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "competition swimwear" -"/p/" -"/reel/" -"/explore/"',
]

# ─── I) Handmade / boutique ───────────────────────────────────────────
BOUTIQUE_QUERIES = [
    'site:instagram.com "handmade swimwear" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "boutique swimwear" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "independent swimwear brand" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "small swimwear brand" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "artisan swimwear" -"/p/" -"/reel/" -"/explore/"',
]

# ─── J) Manufacturer / wholesale ──────────────────────────────────────
MANUFACTURER_QUERIES = [
    'site:instagram.com "swimwear manufacturer" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "bikini manufacturer" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear wholesale" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "private label swimwear" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear supplier" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "beachwear wholesale" -"/p/" -"/reel/" -"/explore/"',
]

# ─── K) Contact-driven qidiruvlar ─────────────────────────────────────
CONTACT_QUERIES = [
    'site:instagram.com "swimwear" "contact us" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "bikini brand" "contact" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear brand" "dm for orders" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "bikini brand" "whatsapp" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear" "order now" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear" "worldwide shipping" -"/p/" -"/reel/" -"/explore/"',
]

# ─── L) Fashion crossover ─────────────────────────────────────────────
FASHION_QUERIES = [
    'site:instagram.com "swimwear" "fashion brand" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "bikini" "fashion brand" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "beachwear" "fashion" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "resortwear" "fashion brand" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear" "clothing brand" -"/p/" -"/reel/" -"/explore/"',
]

# ─── M) Shopify / ecommerce signal ────────────────────────────────────
ECOMMERCE_QUERIES = [
    'site:instagram.com "swimwear" "shopify" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "bikini brand" "shopify" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear brand" "online store" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "bikini brand" "online store" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear" "available online" -"/p/" -"/reel/" -"/explore/"',
]

# ─── N) Geolocation bo'yicha ──────────────────────────────────────────
GEO_QUERIES = [
    'site:instagram.com "swimwear brand" "usa" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear brand" "uk" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear brand" "australia" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear brand" "miami" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "bikini brand" "los angeles" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "beachwear brand" "dubai" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "resortwear brand" "bali" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear" "brazil" -"/p/" -"/reel/" -"/explore/"',
]

# ─── O) Hashtag bilan ─────────────────────────────────────────────────
HASHTAG_QUERIES = [
    'site:instagram.com "#swimwear" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "#bikini" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "#beachwear" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "#resortwear" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "#swimsuit" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "#swimwearbrand" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "#bikinibrand" -"/p/" -"/reel/" -"/explore/"',
]

# ─── P) Kuchaytiruvchi variantlar (6-bo'lim) ──────────────────────────
EXTRA_QUERIES = [
    'site:instagram.com "swimwear label" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "bikini boutique" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "beachwear store" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "resortwear label" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear" "shopping & retail" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear official" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "bikini official" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear collection" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "bikini collection" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "new collection" "swimwear" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "new collection" "bikini" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "beachwear label" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimsuit label" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swim shop" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear store" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "bikini store" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear designer" -"/p/" -"/reel/" -"/explore/"',
]

# ─── Q) Product keywordlar (3-bo'lim: Product keywords) ───────────────
PRODUCT_QUERIES = [
    'site:instagram.com "one piece swimwear" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "one piece swimsuit" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "two piece swimwear" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "triangle bikini" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "bikini set" "brand" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "bikini set" "shop" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swim set" "brand" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "bathing suit brand" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "bathing suit" "shop" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "monokini" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "beach set" "brand" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "cover up" "swimwear" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "sarong" "brand" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "one piece" "brand" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "two piece" "brand" -"/p/" -"/reel/" -"/explore/"',
]

# ─── R) Category signal keywordlar (3-bo'lim) ─────────────────────────
CATEGORY_SIGNAL_QUERIES = [
    'site:instagram.com "swimwear" "product/service" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "bikini" "product/service" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear" "clothing brand" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "bikini" "clothing brand" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear" "clothing (brand)" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "bikini" "clothing (brand)" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear" "women\'s clothing store" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "beachwear" "clothing brand" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "beachwear" "product/service" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "resortwear" "product/service" -"/p/" -"/reel/" -"/explore/"',
]

# ─── S) Qo'shimcha email providerlar ──────────────────────────────────
EMAIL_EXTRA_QUERIES = [
    'site:instagram.com "bikini" "@hotmail.com" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "bikini" "@outlook.com" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear" "@yahoo.com" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "bikini" "@yahoo.com" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear" "@icloud.com" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "beachwear" "@gmail.com" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "resortwear" "@gmail.com" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "beachwear" "email" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "resortwear" "email" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimsuit" "email" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "bathing suit" "email" -"/p/" -"/reel/" -"/explore/"',
]

# ─── T) Qo'shimcha geo lokatsiyalar ───────────────────────────────────
GEO_EXTRA_QUERIES = [
    'site:instagram.com "swimwear brand" "california" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear brand" "hawaii" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear brand" "spain" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear brand" "italy" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear brand" "france" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear brand" "mexico" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear brand" "thailand" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear brand" "portugal" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear brand" "greece" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear brand" "turkey" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear brand" "india" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear brand" "south africa" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "bikini brand" "miami" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "bikini brand" "australia" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "bikini brand" "brazil" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "bikini brand" "california" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "beachwear brand" "usa" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "beachwear brand" "uk" -"/p/" -"/reel/" -"/explore/"',
]

# ─── U) Qo'shimcha hashtag variantlar ─────────────────────────────────
HASHTAG_EXTRA_QUERIES = [
    'site:instagram.com "#swimweardesigner" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "#bikinilover" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "#swimwearfashion" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "#luxuryswimwear" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "#sustainableswimwear" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "#bikinilife" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "#swimwearline" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "#bikinishop" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "#swimwearstore" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "#beachwearfashion" -"/p/" -"/reel/" -"/explore/"',
]

# ─── V) Shipping / DM signal qidiruvlar ───────────────────────────────
SHIPPING_QUERIES = [
    'site:instagram.com "swimwear" "free shipping" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "bikini" "free shipping" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear" "shipping worldwide" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear" "dm to order" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "bikini" "dm to order" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear" "link in bio" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "bikini" "link in bio" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "swimwear" "made to order" -"/p/" -"/reel/" -"/explore/"',
    'site:instagram.com "bikini" "custom order" -"/p/" -"/reel/" -"/explore/"',
]


# ─── Kategoriyalar ro'yxati ────────────────────────────────────────────
QUERY_CATEGORIES = {
    "basic_brand":     BASIC_BRAND_QUERIES,
    "email":           EMAIL_QUERIES,
    "email_extra":     EMAIL_EXTRA_QUERIES,
    "website":         WEBSITE_QUERIES,
    "shop":            SHOP_QUERIES,
    "luxury":          LUXURY_QUERIES,
    "eco":             ECO_QUERIES,
    "women":           WOMEN_QUERIES,
    "niche":           NICHE_QUERIES,
    "boutique":        BOUTIQUE_QUERIES,
    "manufacturer":    MANUFACTURER_QUERIES,
    "contact":         CONTACT_QUERIES,
    "fashion":         FASHION_QUERIES,
    "ecommerce":       ECOMMERCE_QUERIES,
    "product":         PRODUCT_QUERIES,
    "category_signal": CATEGORY_SIGNAL_QUERIES,
    "geo":             GEO_QUERIES,
    "geo_extra":       GEO_EXTRA_QUERIES,
    "hashtag":         HASHTAG_QUERIES,
    "hashtag_extra":   HASHTAG_EXTRA_QUERIES,
    "shipping":        SHIPPING_QUERIES,
    "extra":           EXTRA_QUERIES,
}


def get_all_queries() -> list[str]:
    """Barcha kategoriyalardagi querylarni bitta listga yig'adi."""
    all_q = []
    for queries in QUERY_CATEGORIES.values():
        all_q.extend(queries)
    return all_q


def get_queries_by_category(category: str) -> list[str]:
    """Berilgan kategoriya bo'yicha querylarni qaytaradi."""
    return QUERY_CATEGORIES.get(category, [])


def get_category_names() -> list[str]:
    """Barcha kategoriya nomlarini qaytaradi."""
    return list(QUERY_CATEGORIES.keys())


def get_priority_queries() -> list[str]:
    """Eng samarali 30 ta query — diversifikatsiya qilingan.
    
    Tartib: email-focused → brand → luxury → geo → shop → eco → niche
    Email querylar birinchi yuboriladi — email rate oshirish uchun.
    """
    return [
        # ── 1-guruh: EMAIL-FOCUSED (eng muhim — contact topish) ──
        'site:instagram.com "swimwear brand" "email" -"/p/" -"/reel/" -"/explore/"',
        'site:instagram.com "bikini brand" "email" -"/p/" -"/reel/" -"/explore/"',
        'site:instagram.com "swimwear" "@gmail.com" -"/p/" -"/reel/" -"/explore/"',
        'site:instagram.com "bikini" "@gmail.com" -"/p/" -"/reel/" -"/explore/"',
        'site:instagram.com "beachwear brand" "email" -"/p/" -"/reel/" -"/explore/"',
        'site:instagram.com "swimwear" "@hotmail.com" -"/p/" -"/reel/" -"/explore/"',

        # ── 2-guruh: ASOSIY BRAND ──
        'site:instagram.com "swimwear brand" -"/p/" -"/reel/" -"/explore/"',
        'site:instagram.com "bikini brand" -"/p/" -"/reel/" -"/explore/"',
        'site:instagram.com "swimsuit brand" -"/p/" -"/reel/" -"/explore/"',
        'site:instagram.com "beachwear brand" -"/p/" -"/reel/" -"/explore/"',
        'site:instagram.com "resortwear brand" -"/p/" -"/reel/" -"/explore/"',

        # ── 3-guruh: WEBSITE / SHOP (jiddiy brandlar) ──
        'site:instagram.com "swimwear brand" ".com" -"/p/" -"/reel/" -"/explore/"',
        'site:instagram.com "bikini brand" ".com" -"/p/" -"/reel/" -"/explore/"',
        'site:instagram.com "swimwear brand" "shop" -"/p/" -"/reel/" -"/explore/"',
        'site:instagram.com "swimwear" "online store" -"/p/" -"/reel/" -"/explore/"',

        # ── 4-guruh: LUXURY / PREMIUM ──
        'site:instagram.com "luxury swimwear" -"/p/" -"/reel/" -"/explore/"',
        'site:instagram.com "premium swimwear" -"/p/" -"/reel/" -"/explore/"',
        'site:instagram.com "designer bikini" -"/p/" -"/reel/" -"/explore/"',

        # ── 5-guruh: ECO / SUSTAINABLE ──
        'site:instagram.com "sustainable swimwear" -"/p/" -"/reel/" -"/explore/"',
        'site:instagram.com "ethical swimwear" -"/p/" -"/reel/" -"/explore/"',

        # ── 6-guruh: GEO (turli davlatlar) ──
        'site:instagram.com "swimwear brand" "usa" -"/p/" -"/reel/" -"/explore/"',
        'site:instagram.com "swimwear brand" "australia" -"/p/" -"/reel/" -"/explore/"',
        'site:instagram.com "bikini brand" "miami" -"/p/" -"/reel/" -"/explore/"',

        # ── 7-guruh: NICHE / BOUTIQUE ──
        'site:instagram.com "handmade swimwear" -"/p/" -"/reel/" -"/explore/"',
        'site:instagram.com "boutique swimwear" -"/p/" -"/reel/" -"/explore/"',
        'site:instagram.com "women\'s swimwear" -"/p/" -"/reel/" -"/explore/"',

        # ── 8-guruh: CONTACT / SHIPPING ──
        'site:instagram.com "swimwear" "worldwide shipping" -"/p/" -"/reel/" -"/explore/"',
        'site:instagram.com "swimwear" "shopping & retail" -"/p/" -"/reel/" -"/explore/"',
        'site:instagram.com "swimwear manufacturer" -"/p/" -"/reel/" -"/explore/"',
        'site:instagram.com "bikini brand" "whatsapp" -"/p/" -"/reel/" -"/explore/"',
    ]
