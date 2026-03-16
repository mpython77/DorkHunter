<p align="center">
  <img src="logo.png" alt="DorkHunter" width="200">
</p>

<h1 align="center">DorkHunter</h1>

<p align="center">
  <strong>Advanced Google Dorking & Lead Generation Toolkit</strong><br>
  Chrome Extension + Python Scraper + Rust Email Verifier
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10+-blue?logo=python" alt="Python">
  <img src="https://img.shields.io/badge/Rust-1.70+-orange?logo=rust" alt="Rust">
  <img src="https://img.shields.io/badge/Chrome-Extension-green?logo=googlechrome" alt="Chrome">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License">
</p>

---

## 🔍 What is DorkHunter?

DorkHunter is a professional-grade lead generation toolkit that uses **Google Dorking** to discover business profiles, extract contact information, and verify emails — all from one integrated system.

### ⚡ Key Features

- **🔎 Smart Google Dorking** — 800+ pre-built queries across 22+ categories
- **📧 7-Layer Email Verification** — Syntax → Disposable → Role → Provider Trust → MX → SMTP → Social Proof
- **🤖 AI Query Generator** — Enter a niche, get 20+ optimized dork queries instantly
- **📊 Dashboard** — Real-time analytics with charts and statistics
- **🏷️ Lead Tagging** — Hot, Warm, Cold, Contacted, Favorite tags
- **📥 Export** — CSV and JSON export with one click
- **🌓 Dark Mode** — Beautiful UI with dark/light theme support
- **⏰ Scheduler** — Automated dorking with smart delays and CAPTCHA handling

---

## 🏗️ Architecture

```
┌──────────────────────┐     ┌──────────────────────┐
│  Chrome Extension    │     │  Python Scraper       │
│  (popup.html/js/css) │     │  (google_dorker.py)   │
│                      │     │                       │
│  • Search UI         │     │  • Selenium-based     │
│  • Results table     │     │  • CAPTCHA handling   │
│  • Dashboard charts  │     │  • Cookie management  │
│  • Email verify UI   │     │  • Multi-platform     │
└──────┬───────────────┘     └───────────────────────┘
       │
       │ Native Messaging (stdio)
       │
┌──────▼───────────────┐
│  Rust Email Verifier  │
│  (dorker_verify.exe)  │
│                       │
│  7-Layer PRO Engine:  │
│  1. Syntax (RFC 5322) │
│  2. Role Detection    │
│  3. Disposable Check  │
│  4. Provider Intel    │
│  5. MX Record (DNS)   │
│  6. SMTP Ping         │
│  7. Social Proof      │
└───────────────────────┘
```

---

## 📦 Installation

### 1. Chrome Extension

```bash
# Clone the repo
git clone https://github.com/mpython77/DorkHunter.git
cd DorkHunter

# Load in Chrome:
# 1. Open chrome://extensions
# 2. Enable "Developer Mode"
# 3. Click "Load unpacked" → select the extension/ folder
```

### 2. Python Scraper (Optional)

```bash
pip install -r requirements.txt
python google_dorker.py
```

### 3. Email Verifier (Optional — boosts accuracy to 99%)

```bash
# Build from source (requires Rust)
cd dorker_verify
cargo build --release

# Install native messaging host
install_verifier.bat
```

---

## 🛡️ Email Verification — 7-Layer PRO Engine

The built-in email verifier uses a multi-layer scoring system:

| Layer | Check | Points | Description |
|-------|-------|--------|-------------|
| 1 | Syntax | 10 | RFC 5322 regex validation |
| 2 | Role Detection | 5 | Detects info@, admin@, noreply@ etc. |
| 3 | Disposable | 15 | 500+ known throwaway domains |
| 4 | Provider Intelligence | 15 | Trust database for 30+ providers |
| 5 | MX Record | 20 | DNS mail server verification |
| 6 | SMTP Ping | 25 | Direct mailbox existence check |
| 7 | Social Proof | 10 | Provider signup strictness scoring |

### Scoring Tiers

| Score | Tier | Meaning |
|-------|------|---------|
| 85-100 | 🟢 Trusted | Safe to send — high confidence |
| 65-84 | 🟢 Standard | Likely valid |
| 40-64 | 🟡 Risky | May bounce |
| 0-39 | 🔴 Invalid | Do not send |

### Provider Trust Database

| Provider | Trust Score | SMTP Available |
|----------|------------|----------------|
| Gmail | 95% | ❌ (trust-based) |
| Outlook | 92% | ❌ (trust-based) |
| ProtonMail | 98% | ❌ (trust-based) |
| iCloud | 95% | ❌ (trust-based) |
| .edu domains | 90% | ✅ Usually open |
| .gov domains | 96% | ✅ Usually open |
| Custom domains | 50% | ✅ SMTP verified |

---

## 📁 Project Structure

```
DorkHunter/
├── extension/                  # Chrome Extension
│   ├── manifest.json           # Extension config
│   ├── popup.html              # UI layout
│   ├── popup.js                # UI logic
│   ├── popup.css               # Styles
│   ├── background.js           # Search engine + verifier bridge
│   ├── content.js              # Page scraping
│   └── queries.js              # 800+ dork queries
├── dorker_verify/              # Rust Email Verifier
│   ├── src/
│   │   ├── main.rs             # Native messaging host
│   │   ├── verifier.rs         # 7-layer verification engine
│   │   └── disposable.rs       # 500+ disposable domain list
│   ├── Cargo.toml              # Rust dependencies
│   ├── install_verifier.bat    # Windows installer
│   └── uninstall_verifier.bat  # Uninstaller
├── google_dorker.py            # Python scraper (Selenium)
├── queries.py                  # Python query database
├── requirements.txt            # Python dependencies
├── logo.png                    # Project logo
└── README.md                   # This file
```

---

## 🚀 Usage

### Chrome Extension
1. Click the DorkHunter icon in Chrome
2. Enter your search query or use AI Generator
3. Click **▶ Start** to begin dorking
4. View results in the **Results** tab
5. Click **📧 Verify All Emails** to check email validity
6. Export results as CSV/JSON

### Python Scraper
```bash
python google_dorker.py --niche "swimwear" --pages 5
```

---

## ⚙️ Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Extension | JavaScript, HTML, CSS | Chrome UI & search orchestration |
| Scraper | Python, Selenium | Automated Google scraping |
| Verifier | Rust, Tokio | High-performance email verification |
| DNS | trust-dns-resolver | MX record lookups |
| Protocol | Chrome Native Messaging | Extension ↔ Verifier IPC |

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  <strong>Made with ❤️ for the OSINT community</strong>
</p>
