# SiteLens

AI site inspections and daily reports for site engineers, supervisors and construction managers.

SiteLens has two tools:

- **Site photo inspection.** Upload a photo of a construction site. SiteLens identifies what is in it and lists visible safety hazards, defects and quality issues, and site conditions. Each finding has a severity (Low to Critical), a confidence score and a recommended action. You get a printable report with the actions ordered by urgency.
- **Daily site report.** Write the day's notes in your own words, or dictate them. SiteLens turns them into a structured daily site report: summary, work completed, labour and equipment, deliveries and visitors, site conditions, problems and delays, safety, recommended actions and the plan for tomorrow. It also tells you what a daily report normally needs that your notes left out.

The AI is Google's Gemma, called through the Gemini API with your own key. SiteLens runs entirely in the browser. There is no backend and no account.

SiteLens is free and open source under the [MIT License](LICENSE).

---

## Contents

- [Quick start](#quick-start)
- [Getting an AI key](#getting-an-ai-key)
- [Using SiteLens](#using-sitelens)
- [Configuration](#configuration)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [How it works](#how-it-works)
- [Data and privacy](#data-and-privacy)
- [Deployment](#deployment)
- [Browser support](#browser-support)
- [Limitations](#limitations)
- [Contributing](#contributing)
- [License](#license)

---

## Quick start

Requirements: **Node.js 18, 20 or 22+** (required by Vite 6) and **npm**.

```bash
git clone https://github.com/devMuhammad05/SiteLens.git
cd SiteLens
npm install
npm run dev
```

Open http://localhost:5173. The landing page is at `/` and the workspace is at `/app`.

Without an AI key, SiteLens returns built-in **example results** so you can try every screen. To get real analysis, add a key (next section).

## Getting an AI key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey) and create an API key. Creating one is free; Google's usage limits for your key apply.
2. In SiteLens, open the workspace (`/app`) and select **Add AI key** in the header.
3. Paste the key and select **Save key**. SiteLens checks it with Google first (by listing models, which costs nothing) and only saves it if Google accepts it.

The key is stored in your browser's `localStorage`, on that device only. To remove it, open the same panel and select **Remove**. The header shows **AI connected** with a green dot while a key is saved.

## Using SiteLens

### Site photo inspection (`/app#inspect`)

1. Drag a photo into the drop area or choose a file. JPG, PNG and WEBP up to 15 MB are accepted.
2. Optionally add the site name, your name and the date. They appear at the top of the report.
3. Select **Check this photo**.
4. Review the report: summary, what is in the photo, findings grouped into safety hazards, defects and quality issues, and site conditions and activities, then recommended actions ordered by severity.
5. Select **Download PDF** to open the browser's print dialog, then choose "Save as PDF". **Download report data (JSON)** exports the raw result.

Use a clear, well-lit photo taken close to the area of concern, and check one area per photo.

### Daily site report (`/app#diary`)

1. Fill in the sections that apply: project information, weather and site conditions, work progress, labour and equipment, deliveries and visitors, problems and delays, health and safety, and planned activities for tomorrow. Shorthand is fine, and empty sections are skipped.
2. Optional helpers:
   - **Dictate** records your voice into a section (see [Browser support](#browser-support)).
   - **Tidy up with AI** rewrites a section into clear, professional wording without adding facts. **Undo tidy-up** restores your text.
   - **Fill in from my location** adds today's weather.
   - **Use example notes** fills the form with sample notes.
3. The right-hand panel shows a **live draft** of the report as you type.
4. Select **Create report**. SiteLens writes the formal report and saves it under **Past reports**.
5. Share it with **Download PDF**, **Copy** (plain text for email or WhatsApp) or **Share** (the device's share sheet; where there isn't one, it copies the text instead).

If you edit your notes after creating a report, the preview shows **Notes changed** and an **Update report** link. Up to 60 reports are kept, newest date first.

### Installing on a phone or computer

SiteLens is a Progressive Web App. In Chrome and Edge, an **Install app** button appears in the workspace header. On iPhone and iPad, open the site in Safari and use **Share → Add to Home Screen**. Installing only works on the built app served over HTTPS or `localhost` (see [Deployment](#deployment)).

When offline, you can still open the app, write notes and read past reports. Checking photos, creating reports, tidying notes, dictation and the weather lookup all need a connection.

## Configuration

| Setting | Where | Purpose |
| --- | --- | --- |
| AI key | In the app: **Add AI key** | Google AI Studio key used for all AI requests. Saved per browser. Never set at build time. |
| `VITE_GEMMA_MODEL` | `.env` (optional) | Gemma model id. Default: `gemma-4-26b-a4b-it`. |

To change the model, copy `.env.example` to `.env` and edit the value. Vite reads it when `npm run dev` or `npm run build` starts, so restart the dev server after changing it.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the Vite dev server with hot reload at http://localhost:5173. The service worker is **not** registered in development. |
| `npm run build` | Builds the production app into `dist/`. |
| `npm run preview` | Serves `dist/` locally to check the production build, including the service worker. |

There is no test suite or linter yet. See [CONTRIBUTING.md](CONTRIBUTING.md) for how changes are checked.

## Project structure

```
index.html                 Entry HTML: fonts, PWA meta tags, early theme script
netlify.toml               Netlify build, SPA routing and cache headers
public/
  manifest.webmanifest     PWA manifest (name, icons, shortcuts)
  sw.js                    Service worker (offline support)
  .htaccess                Apache routing and cache headers
  icons/                   App icons (192, 512, maskable, Apple touch)
src/
  main.jsx                 Mounts React, registers the service worker
  App.jsx                  Chooses the page: "/" or "/app"
  styles.css               Tailwind setup, design tokens (colours, fonts), light and dark themes
  pages/
    LandingPage.jsx        Product introduction
    WorkspacePage.jsx      Workspace header, tool switcher, AI key panel, offline notice
  views/
    InspectionView.jsx     Photo inspection workflow
    DiaryView.jsx          Daily report workflow and past reports
  components/
    ui.jsx                 Shared building blocks: buttons, fields, chips, report sections, icons
    Results.jsx            Photo inspection report
    DiaryReport.jsx        Finished daily report
    DiaryDraft.jsx         Live draft preview built from the notes
    NoteField.jsx          Notes box with dictation and AI tidy-up
    UploadZone.jsx         Photo drop area and validation
    AiKeyPanel.jsx         Add, check and remove the AI key
    ThemeToggle.jsx        Light and dark mode switch
    Brand.jsx              Logo, tool list, GitHub link
    HeroDemo.jsx           Landing page: animated notes-to-report demo
    Showcase.jsx           Landing page: workspace window and example inspection output
  lib/
    gemma.js               Gemini API client: requests, retries, JSON parsing
    aiKey.js               Reading, saving and checking the AI key
    analyse.js             Photo inspection prompt and result normalising
    diary.js               Daily report prompt, tidy-up, weather, saved reports, text export
    demo.js                Example results used when no key is set
    speech.js              Voice dictation (browser speech recognition)
    router.jsx             Minimal routing for "/" and "/app"
    pwa.js                 Service worker registration, install prompt, online status
    format.js              Date formatting, file names, JSON download
prd/PRD.md                 Product requirements
TODO.md                    PRD breakdown and status
```

## How it works

- **No backend.** The app is static files. AI requests go straight from the browser to `https://generativelanguage.googleapis.com/v1beta/models/<model>:generateContent`, with the key in the `x-goog-api-key` header.
- **Structured output.** Each prompt asks Gemma for a JSON object with a fixed shape (`SCHEMA` in `src/lib/diary.js`, `PROMPT` in `src/lib/analyse.js`). `gemma.js` extracts the JSON from the reply, and `normaliseResult` and `normaliseDiary` fill in defaults and clamp values, so the UI doesn't depend on the model returning perfect data.
- **Photos** are downscaled to at most 2048 px on the longest side and re-encoded as JPEG before upload.
- **Retries and fallback.** Server errors (HTTP 5xx) and rate limits (HTTP 429) are retried. If you set `VITE_GEMMA_MODEL` to another model and it fails with one of those errors, SiteLens falls back to `gemma-4-26b-a4b-it`. Requests use `temperature: 0.2` for consistent output.
- **Example mode.** With no key saved, `analyseImage` and `generateDiary` return the sample data in `src/lib/demo.js`, and the reports say they are examples.
- **Routing.** `/` is the landing page and `/app` is the workspace; the hash picks the tool (`#inspect` or `#diary`). Older links such as `/#diary` redirect to `/app#diary`. Once opened, the workspace stays mounted, so going back to the landing page doesn't lose unsaved notes.
- **Offline.** `public/sw.js` caches the app shell, built assets, icons and fonts. Pages are network-first with the cached shell as a fallback, and `/assets/*` is cache-first. AI and weather requests are never cached.

## Data and privacy

| What | Where it goes |
| --- | --- |
| Photos you check | Sent to Google's Gemini API with your key. |
| Notes, when you create a report or tidy a section | Sent to Google's Gemini API with your key. |
| Your voice, when dictating | Handled by the browser's speech recognition. Chrome and Edge send the audio to their own speech service. |
| Your location, when you fill in the weather | Your coordinates are sent to [Open-Meteo](https://open-meteo.com/) to look up the forecast. |
| AI key, saved reports, last project and name, theme | Stored only in your browser, under the `localStorage` keys `sitelens-ai-key`, `sitelens.diaries.v1`, `sitelens.profile.v1` and `sitelens-theme`. |

Nothing is sent to a SiteLens server; there isn't one. Clearing the site's data in your browser deletes your key and saved reports.

## Deployment

Build with `npm run build` and serve the `dist/` folder from the site root. Serve it over **HTTPS** (or `localhost`) so the service worker and install prompt work.

Every host needs a **single-page-app fallback**: requests for paths that aren't files, such as `/app`, must return `index.html`.

### Netlify

`netlify.toml` already contains the build settings, the fallback and the cache headers. In Netlify, connect the GitHub repository and check that the build settings match:

| Setting | Value |
| --- | --- |
| Base directory | *(empty)* |
| Build command | `npm run build` |
| Publish directory | `dist` |

No environment variables are needed. Set `VITE_GEMMA_MODEL` only if you want a different default model.

### Apache (including Laragon)

`public/.htaccess` is copied into `dist/` by the build. It adds the fallback to `index.html` and stops `sw.js` and the manifest from being cached. It needs `mod_rewrite` enabled. Point the site's document root at `dist/`.

### Other static hosts

Set up the equivalent of these rules:

- Rewrite unknown paths to `/index.html` with status 200.
- Serve `/sw.js` and `/manifest.webmanifest` with `Cache-Control: no-cache`.
- Serve `/assets/*` with a long cache (`max-age=31536000, immutable`); the file names are content-hashed.

### Updating installed apps

When you change `public/sw.js`, the icons or the manifest, bump `VERSION` in `public/sw.js` (for example from `sitelens-v2` to `sitelens-v3`) so installed copies replace their old cache.

## Browser support

SiteLens uses Tailwind CSS 4, which needs **Chrome or Edge 111+, Safari 16.4+ or Firefox 128+**.

| Feature | Works in |
| --- | --- |
| Voice dictation | Chrome, Edge and Safari. Not Firefox, where **Dictate** is disabled with an explanation. |
| **Install app** button | Chrome and Edge. On iOS, use **Share → Add to Home Screen** in Safari. |
| **Share** button | Browsers with a share sheet (most mobile browsers). Elsewhere it copies the report text. |

Dictation uses your device language if it is a form of English, otherwise British English.

## Limitations

- Photo findings are a first look based on a single image. They don't replace an on-site inspection or professional judgement.
- Saved reports live in one browser on one device. There is no sync or sharing between people.
- With no backend, the AI key is used directly from the browser. That suits a personal key, not a shared organisation key.
- There are no automated tests yet.

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) for setup, conventions and the pull request checklist. Report bugs and suggest ideas in [GitHub Issues](https://github.com/devMuhammad05/SiteLens/issues).

## License

[MIT](LICENSE) © 2026 Muhammad Yahaya
