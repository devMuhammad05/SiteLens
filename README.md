# SiteLens

**AI-powered construction site inspection and visual assessment assistant.**

SiteLens uses Google's Gemma multimodal models to analyse construction site photographs, identify potentially visible safety and construction quality issues, and generate structured inspection reports with recommended actions.

Designed for engineers, site supervisors, and construction professionals, SiteLens makes preliminary site inspections faster by turning construction site images into actionable insights.

**Built with Gemma 4.**

## Getting started

```bash
npm install
cp .env.example .env   # add your Google AI Studio key to enable Gemma analysis
npm run dev
```

Without `VITE_GEMINI_API_KEY` the app runs in **demo mode** and returns sample findings, so the whole flow can be explored offline.

| Variable | Purpose |
| --- | --- |
| `VITE_GEMINI_API_KEY` | Google AI Studio API key used to call Gemma via the Gemini API |
| `VITE_GEMMA_MODEL` | Gemma model id (default `gemma-4-26b-a4b-it`) |

> The MVP calls the API from the browser, so the key is visible to users. Put a backend proxy in front of it before deploying publicly.

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
