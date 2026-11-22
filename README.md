# 🎛️ DevControl — Mission Control & Zero-Touch HUD for Antigravity

**DevControl** is a native-feeling Mission Control desktop dashboard and floating HUD built with **Electron**, **React 19**, **Vite**, and **Express** for orchestrating multi-project AI agent workflows in Antigravity.

## ✨ Key Capabilities

- **Zero-Touch Floating HUD ("The Orb"):** Port-less Electron IPC architecture loading directly from local assets with a 0% network footprint and zero port collisions.
- **Ghost Finger Automation:** Automated pulse control (`1.5s` loop via `scripts/trigger_continue.vbs`) guarded by an explicit `AUTOPILOT_ACTIVE.tmp` safety lock and active Antigravity window detection.
- **Instruction Sync Bridge:** Broadcasts global directives across configured local project roots by writing `.antigravity-instructions.md` to every workspace in one click.
- **Standalone Widget or Full Manager:** Launch as a dedicated floating widget or full desktop control center, with Windows NSIS packaging support.

## 🛠️ Tech Stack

- **Desktop Runtime:** Electron (`electron/main.cjs`)
- **Frontend:** React 19, Vite, Lucide Icons, React Markdown
- **Backend / Sync:** Express 5, Multer, Node.js

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run web frontend + Express backend
npm run dev

# Launch full Electron Mission Control app
npm run electron:dev

# Launch standalone Zero-Touch Orb widget
npm run electron:widget

# Build Windows installer (dist-electron)
npm run dist
```

📖 For architecture details, see [DOCUMENTATION.md](https://github.com/Viguru24/DevControl/blob/main/DOCUMENTATION.md).

## 📄 License

Released under the [MIT License](LICENSE). © 2026 Louis De Souza ([Viguru24](https://github.com/Viguru24)).

---

<!-- VIGURU24-ECOSYSTEM-START -->
## 🌟 The Viguru24 Ecosystem

Explore the full suite of local-first applications by **[Viguru24](https://github.com/Viguru24)** ([Showcase Portal](https://viguru24.github.io)):
- 🌌 **[Cosmo Symphony](https://github.com/Viguru24/Video)** — GPU-accelerated video & photo orchestrator, AI 4K/8K upscaler & local Wi-Fi phone-to-PC sharing for Windows.
- 🎙️ **[CosmoWhisper Native](https://github.com/Viguru24/CosmoWhisper-Native)** — High-performance, 100% local AI voice dictation & transcription for Windows & macOS.
- 🎬 **[Vixz YouTube Player (Android)](https://github.com/Viguru24/YouTube)** — Ad-free YouTube player with SponsorBlock, AI summaries, offline downloads & fluid gestures.
- 🖥️ **[Vixz Desktop (Windows)](https://github.com/Viguru24/VixzDesktop)** — Glassmorphic desktop YouTube player & AI Copilot for Windows.
- 🛰️ **[Kin-Tracker](https://github.com/Viguru24/Kin-Tracker)** — Private, 24/7 real-time family safety radar & GPS transit network for Android.
- 📖 **[Cosmo Compendium](https://github.com/Viguru24/cosmo-compendium)** — Smart tactile recipe & craft formula keeper for Android & iOS with AI scanning & Cook Mode.
- 🗣️ **[FluencyAI](https://github.com/Viguru24/FluencyAI)** — AI-powered English language tutoring PWA with interactive roleplay & voice immersion.
- 🌌 **[OmniDownloader](https://github.com/Viguru24/Video-downloader)** — Universal video & audio studio Progressive Web App with glassmorphic UI.
<!-- VIGURU24-ECOSYSTEM-END -->
