# 🛡️ Defensive OSINT Checker

A clean, mobile-friendly, personal defensive OSINT tool built for **GitHub Pages**. Check your own digital footprint responsibly using public sources.

**For Personal & Defensive Use Only**

---

## ✨ Features

- **Multiple Search Types**: Email, Username, Domain
- **Image Metadata Analysis**: Upload photos to extract EXIF data locally + direct reverse image search links
- **HIBP Integration**: Official Have I Been Pwned API for breach checking (secure & rate-limited)
- **Advanced Error Handling**: Network issues, rate limits, validation, user-friendly messages
- **Fully Responsive** – Excellent on mobile and desktop
- **Modern UI** with Tailwind CSS + Dark Mode support
- **No Data Storage** – Everything runs client-side
- **Secure API Key Handling** via environment variables

---

## 🚀 Quick Start

1. Fork or clone this repository
2. Enable **GitHub Pages** (Settings → Pages → Deploy from `main` branch)
3. Add your HIBP API key (see Configuration below)
4. Visit: `https://yourusername.github.io/defensive-osint-checker`

---

## Configuration (API Keys)

### Have I Been Pwned (Recommended)
1. Get your free/paid key from [haveibeenpwned.com/keys](https://haveibeenpwned.com/API/Key)
2. **Best method**: Use GitHub Secrets + Vite build (recommended)
3. Or temporarily replace in `script.js` (not recommended for public repos)

```env
VITE_HIBP_KEY=your_actual_key_here
