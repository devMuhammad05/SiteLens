# SiteLens

**AI-powered construction site inspection and visual assessment assistant.**

SiteLens uses Google's Gemma multimodal models to analyse construction site photographs, identify potentially visible safety and construction quality issues, and generate structured inspection reports with recommended actions.

Designed for engineers, site supervisors, and construction professionals, SiteLens makes preliminary site inspections faster by turning construction site images into actionable insights.

**Built with Gemma 4.**

## Getting started

```bash
npm install
npm run dev
```

Open the workspace and select **Add AI key** in the header. Paste a Google AI Studio key (free to create at https://aistudio.google.com/apikey). SiteLens checks the key with Google, then saves it **only in that browser**. No key is built into the app, so a deployed copy never exposes anyone's key.

Without a key, the app shows **example results**, so the whole flow can still be explored.

| Optional variable | Purpose |
| --- | --- |
| `VITE_GEMMA_MODEL` | Gemma model id (default `gemma-4-26b-a4b-it`) |

> AI requests go from the user's browser straight to Google using their own key, and Google's usage limits for that key apply.

## Pages

- `/`: product introduction (landing page)
- `/app`: the workspace. `/app#inspect` opens photo inspection, `/app#diary` opens the daily site report.

## Installing as an app (PWA)

SiteLens can be installed on phones and desktops and opens offline (past reports and note-taking work offline; photo checks and report creation need a connection).

The service worker only runs in the **built** app, not in `npm run dev`, so development never serves stale code. To try installing:

```bash
npm run build
```

Then serve the `dist/` folder from the site root over HTTPS (or `localhost`). `dist/.htaccess` handles Apache/laragon: it sends `/app` to `index.html` and stops `sw.js` from being cached. On other hosts, configure the same fallback to `index.html`.

When you change `public/sw.js`, bump `VERSION` in it so installed apps pick up the new cache.

See [TODO.md](TODO.md) for the PRD breakdown and status.

## License

SiteLens is free and open source under the [MIT License](LICENSE).
