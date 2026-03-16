"""Regex fix testlari."""
import sys
sys.path.insert(0, '.')
from google_dorker import GoogleDorker

d = GoogleDorker()
passed = 0
failed = 0

def check(name, actual, expected):
    global passed, failed
    ok = actual == expected
    status = "✅" if ok else "❌"
    print(f"  {status} {name}: {actual!r} (kutilgan: {expected!r})")
    if ok:
        passed += 1
    else:
        failed += 1

print("=== PHONE REGEX TESTLARI ===")
check("Ish vaqti 12.00-18.00", d._extract_phones("12.00-18.00"), [])
check("Tax ID 682-024-678", d._extract_phones("682-024-678"), [])
check("Tax TRN 682-249-157", d._extract_phones("TRN. 682-249-157"), [])
check("Real phone +1 555-123-4567", len(d._extract_phones("+1 555-123-4567")) > 0, True)
check("Real phone +90 212 555 1234", len(d._extract_phones("+90 212 555 1234")) > 0, True)

print("\n=== FOLLOWER REGEX TESTLARI ===")
check("Yil 2023. M", d._extract_followers("2023. M"), "")
check("Yil 2026. M", d._extract_followers("2026. M"), "")
check("Real 10.4K", d._extract_followers("10.4K"), "10.4K")
check("Real 433K", "433K" in d._extract_followers("433K followers"), True)
check("Real 204.2K", d._extract_followers("204.2K"), "204.2K")
check("Real 7890 Followers", "7890 Followers" in d._extract_followers("7890 Followers"), True)
check("Real 1.3K", d._extract_followers("1.3K"), "1.3K")
check("Real 5.9K", d._extract_followers("5.9K+"), "5.9K")
check("Real 29K", d._extract_followers("29K followers"), "29K followers")

print("\n=== QUERY DIVERSITY ===")
from queries import get_priority_queries
queries = get_priority_queries()
check("Query soni >= 30", len(queries) >= 30, True)
email_queries = [q for q in queries if "email" in q or "@gmail" in q or "@hotmail" in q]
check("Email querylar >= 5", len(email_queries) >= 5, True)
# Email querylar birinchi 6 tasi bo'lishi kerak
first_6 = queries[:6]
email_first = all("email" in q or "@gmail" in q or "@hotmail" in q for q in first_6)
check("Email querylar birinchi", email_first, True)

print(f"\n{'='*50}")
print(f"NATIJA: {passed} passed, {failed} failed")
if failed == 0:
    print("🎉 ALL TESTS PASSED!")
else:
    print("⚠️ BA'ZI TESTLAR FAIL BO'LDI")
