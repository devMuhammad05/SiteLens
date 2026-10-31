# Contributing to SiteLens

Thanks for helping. This guide covers how to set up the project, where things live, the conventions the code follows, and what to check before you open a pull request.

## Ways to contribute

- **Report a bug** in [GitHub Issues](https://github.com/devMuhammad05/SiteLens/issues). Include the steps to reproduce it, what you expected, what happened, your browser and device, and a screenshot if it's visual. **Never paste your AI key** into an issue, screenshot or log.
- **Suggest a feature** in Issues. Describe the problem it solves on site, not just the solution.
- **Fix something or build a feature** with a pull request. For anything bigger than a small fix, open an issue first so we can agree on the approach before you spend time on it.

## Setting up

You need **Node.js 18, 20 or 22+** and **npm**.

```bash
git clone https://github.com/devMuhammad05/SiteLens.git
cd SiteLens
npm install
npm run dev
```

Open http://localhost:5173 (landing page) and http://localhost:5173/app (workspace).

You don't need an AI key to work on most of the app. Without one, both tools return the example data in `src/lib/demo.js`. To test real AI output, add your own key with **Add AI key** in the workspace (see the [README](README.md#getting-an-ai-key)). It's stored only in your browser and is never part of the code.

## Making a change

1. Fork the repository and create a branch from `main` with a short descriptive name, for example `fix-upload-validation` or `add-voice-notes`.
2. Make your change, following the conventions below.
3. Run through the [checklist](#before-you-open-a-pull-request).
4. Open a pull request against `main`. Say what you changed, why, and how you checked it. Add screenshots for anything visual, in light and dark mode.

Keep pull requests focused: one fix or feature each.

## Where things live

| To change… | Look in |
| --- | --- |
| What the photo inspection asks the AI, and how its answer is cleaned up | `src/lib/analyse.js` (`PROMPT`, `normaliseResult`) |
| What the daily report asks the AI, and how its answer is cleaned up | `src/lib/diary.js` (`SCHEMA`, `buildPrompt`, `normaliseDiary`) |
| AI tidy-up of notes | `tidyNote` in `src/lib/diary.js` |
| How requests are sent to the Gemini API | `src/lib/gemma.js` |
| Example results shown without a key | `src/lib/demo.js` |
| Buttons, fields, chips, icons and report sections | `src/components/ui.jsx` |
| Colours, fonts, light and dark themes | `src/styles.css` |
| The two workflows | `src/views/InspectionView.jsx`, `src/views/DiaryView.jsx` |
| The reports | `src/components/Results.jsx`, `src/components/DiaryReport.jsx`, `src/components/DiaryDraft.jsx` |
| Landing page | `src/pages/LandingPage.jsx` |
| Offline support | `public/sw.js`, `src/lib/pwa.js` |

The full file map is in the [README](README.md#project-structure).

## Conventions

### Code

- React function components and hooks. Plain JavaScript (`.js` / `.jsx`), no TypeScript.
- Match the surrounding code: 2-space indentation, single quotes, semicolons. There is no formatter or linter configured, so please keep formatting consistent by hand.
- Files that contain JSX must use the `.jsx` extension. Vite won't parse JSX in `.js` files.
- **No new dependencies without discussion.** The app currently depends only on React, Vite and Tailwind. Browser APIs (speech recognition, service workers, `localStorage`) are used directly. If you think a package is worth adding, raise it in an issue first.
- Keep comments for the *why*, not the *what*.

### Styling

- Style with Tailwind utility classes in the JSX.
- **Use the design tokens, not hard-coded colours.** Colours are CSS variables in `src/styles.css` (`--paper`, `--ink`, `--heading`, `--muted`, `--line`, `--amber`, `--low`, `--medium`, `--high`, `--critical` and others), exposed to Tailwind as `bg-paper`, `text-heading`, `border-line`, `bg-amber` and so on. Using them keeps light mode, dark mode and print correct automatically.
- Reuse the building blocks in `src/components/ui.jsx` (`Button`, `Field`, `Input`, `Chip`, `DocSection`, `Icon` and others) before writing new ones.
- Anything that shouldn't print gets the `no-print` class. Report content should print cleanly on white.

### Writing

All text in the app is for people on a construction site, so:

- Use plain language and sentence case. Name things by what they do for the user ("Create report", "Check this photo"), not by how they're built.
- Error messages say what went wrong and what to do next, without apologising and without technical detail. Put technical detail in `console.error` for developers.
- Use British English spelling, to match the existing text ("colour", "analyse", "labour").

### AI prompts

The prompts are the core of the product, so changes need extra care:

- **Never let the AI invent facts.** Existing prompts tell the model to use only what is in the photo or notes, and to leave fields empty rather than guess. Keep those rules.
- **If you change the JSON shape** a prompt asks for, update all three together: the prompt or `SCHEMA`, the `normalise…` function, and the example data in `src/lib/demo.js`. The demo data goes through the same normaliser, so a mismatch shows up immediately without a key.
- Test prompt changes with a real key on several inputs, including messy notes and poor photos, and describe the results in your pull request.

### Stored data and offline cache

- Saved data lives in `localStorage` under versioned keys such as `sitelens.diaries.v1`. If you change the shape of what's stored, either keep reading the old shape or move to a new key (`…v2`) and migrate, so people don't lose their saved reports.
- If you change `public/sw.js`, the icons or `public/manifest.webmanifest`, bump `VERSION` in `public/sw.js` so installed apps refresh their cache.
- The service worker only runs in production builds. Use `npm run build` then `npm run preview` to test offline behaviour.

## Before you open a pull request

There are no automated tests yet, so these checks are manual. Please go through the ones that apply:

- [ ] `npm run build` finishes without errors.
- [ ] No errors in the browser console on the pages you touched.
- [ ] Both tools still work end to end without a key (example results): photo inspection and daily report, including **Download PDF** (print preview).
- [ ] If you touched AI code: tested with a real key, results described in the pull request.
- [ ] Looks right in **light and dark mode** (toggle in the header).
- [ ] Works at **phone width** (375 px): nothing cut off, no sideways scrolling, buttons easy to tap.
- [ ] Usable with the **keyboard**: everything reachable with Tab, focus visible.
- [ ] No secrets in the code, commits or screenshots. `.env` is git-ignored; keep it that way.
- [ ] README updated if you changed setup, configuration, behaviour users would notice, or the file structure.

## Commit messages

Follow the style of the existing history:

- A short summary line in the imperative mood, under about 70 characters: "Add voice dictation to daily report", not "Added…" or "Adds…".
- If more explanation helps, leave a blank line, then a few bullet points on what changed and why.

## License

By contributing, you agree that your contributions are licensed under the project's [MIT License](LICENSE).
