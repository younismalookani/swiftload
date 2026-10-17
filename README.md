# SwiftLoad 🚀

**Fast, free video downloader powered by Cloudflare Pages.**

YouTube, TikTok, Facebook, Instagram, Twitter aur aur kai platforms se videos download karein — ultra-fast Cloudflare CDN ke through.

---

## 📁 Project Structure

```
video-downloader/
├── public/
│   ├── index.html          ← Main website page
│   ├── styles.css          ← Premium dark mode styles
│   └── script.js           ← Frontend JavaScript
├── functions/
│   └── api/
│       └── download.js     ← Cloudflare Pages Function (API)
├── wrangler.toml           ← Cloudflare configuration
├── package.json
└── .github/
    └── workflows/
        └── deploy.yml      ← Auto GitHub → Cloudflare deploy
```

---

## 🚀 Deployment Guide (Step by Step)

### Step 1: GitHub Repository Banayein

1. [github.com](https://github.com) par jayein
2. **New repository** banayein (e.g., `swiftload`)
3. Is code ko upload karein:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: SwiftLoad video downloader"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/swiftload.git
   git push -u origin main
   ```

### Step 2: Cloudflare Account Setup

1. [dash.cloudflare.com](https://dash.cloudflare.com) par sign up karein (free)
2. **My Profile → API Tokens** par jayein
3. **Create Token** → **Edit Cloudflare Workers** template choose karein
4. `CLOUDFLARE_API_TOKEN` copy karein
5. Dashboard URL mein se `CLOUDFLARE_ACCOUNT_ID` copy karein

### Step 3: GitHub Secrets Add Karein

GitHub repository mein:
1. **Settings → Secrets and variables → Actions**
2. Yeh 2 secrets add karein:
   - `CLOUDFLARE_API_TOKEN` = (Step 2 mein copy ki hui token)
   - `CLOUDFLARE_ACCOUNT_ID` = (aapka Cloudflare Account ID)

### Step 4: Cloudflare Pages Project Banayein

1. Cloudflare Dashboard → **Pages → Create a project**
2. **Connect to Git** → GitHub → apna repo choose karein
3. Settings:
   - **Framework preset:** None
   - **Build command:** (empty)
   - **Build output directory:** `public`
4. **Save and Deploy**

### Step 5: Auto-Deploy Ready! 🎉

Ab jab bhi aap `git push` karein, website automatically update ho jayegi!

---

## 🛠️ Local Development

```bash
# Dependencies install karein
npm install

# Local dev server start karein
npm run dev

# Browser mein khulega:
# http://localhost:8788
```

---

## ✅ Supported Platforms

| Platform | Video | Audio |
|----------|-------|-------|
| YouTube | ✅ up to 4K | ✅ MP3 |
| TikTok | ✅ Watermark-free | ✅ |
| Facebook | ✅ Public videos | ❌ |
| Instagram | ✅ Reels + Posts | ✅ |
| Twitter/X | ✅ | ❌ |
| Reddit | ✅ | ❌ |
| Vimeo | ✅ | ✅ |
| SoundCloud | ❌ | ✅ |
| Twitch | ✅ Clips | ✅ |
| Pinterest | ✅ | ❌ |

---

## ⚠️ Disclaimer

Sirf wo videos download karein jinhe aap download karne ke legally authorized hain. Copyrighted content ko download karna creators ki consent ke bina ethical nahin hai.

---

## 📄 License

MIT License — Free to use and modify.
