# SiteLens — MVP Todos

Derived from [prd/PRD.md](prd/PRD.md). The PRD announces five MVP features but only details 5.1 and 5.2;
items marked *(inferred)* come from the product overview (section 1) and objectives (section 3).

Stack: React 18 + Vite, Gemma 4 via the Google Gemini API (`@google/genai`-compatible REST).

## 0. Project setup
- [x] Scaffold React (Vite) app
- [x] Env config: `VITE_GEMINI_API_KEY`, `VITE_GEMMA_MODEL`
- [x] Demo mode with sample results when no API key is set

## 5.1 Image upload and inspection initiation (P0)
- [x] Accept JPG, JPEG, PNG, WEBP only (reject others with a clear message)
- [x] Drag-and-drop zone
- [x] File picker
- [x] Image preview before submission
- [x] Remove / replace uploaded image
- [x] "Analyse Site" button
- [x] Loading feedback while analysis runs

## 5.2 AI-powered visual analysis (P0)
- [x] Send image + structured prompt to Gemma 4
- [x] Request strict JSON output and validate/normalise it
- [x] Categories:
  - [x] Construction elements (columns, beams, slabs, reinforcement, scaffolding)
  - [x] Safety hazards (missing PPE, unsafe access, exposed hazards)
  - [x] Workmanship concerns (cracks, honeycombing, poor concrete finish)
  - [x] Site conditions (housekeeping, material storage, debris)
  - [x] General observations (activities, visible conditions)
- [x] Error handling (network, bad key, unparseable model output)

## 5.3 Severity and confidence assessment *(inferred)*
- [x] Each finding carries severity (Low / Medium / High / Critical)
- [x] Each finding carries a confidence score (0–100%)
- [x] Overall site risk summary + counts by severity

## 5.4 Recommended corrective actions *(inferred)*
- [x] Recommendation per hazard / workmanship issue
- [x] Prioritised action list (by severity)

## 5.5 Downloadable inspection report *(inferred)*
- [x] Inspection metadata (site name, inspector, date)
- [x] Printable report layout including the photo
- [x] Download / save as PDF (browser print)
- [x] Export JSON

## Cross-cutting
- [x] Disclaimer: supports preliminary visual inspection only, not a replacement for professional judgement (PRD §1)
- [x] Responsive layout (site use on phones/tablets)

## Open questions for the PRD owner
- PRD is truncated after §5.2 — confirm features 5.3–5.5 and any non-functional requirements.
- The API key is used client-side in this MVP; production should proxy calls through a backend.
- Exact Gemma 4 model id on the Gemini API (configurable via `VITE_GEMMA_MODEL`).
