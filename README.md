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
| `VITE_GEMMA_MODEL` | Gemma model id (default `gemma-4-31b-it`) |

> The MVP calls the API from the browser, so the key is visible to users. Put a backend proxy in front of it before deploying publicly.

See [TODO.md](TODO.md) for the PRD breakdown and status.
