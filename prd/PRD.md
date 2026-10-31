Product overview
SiteLens is an AI-assisted construction site inspection tool that uses image understanding to help construction professionals identify potentially visible safety hazards, workmanship concerns and site conditions from photographs.

Instead of manually documenting every observation, users upload a photograph and receive an AI-generated inspection report containing:
- Identified construction elements.
- Potential safety hazards.
- Visible workmanship concerns.
- Severity and confidence assessments.
- Recommended corrective actions.
- A downloadable inspection report.
SiteLens is designed to support preliminary visual inspections, not replace professional engineering judgement or physical site assessments.
2. Problem statement
Construction site inspections involve observing site conditions, identifying potential hazards, documenting defects and preparing inspection reports.

These processes can be time-consuming, especially when observations are manually recorded and reports prepared separately.

SiteLens aims to simplify the initial documentation process by using multimodal AI to interpret construction site photographs and organise observations into structured inspection reports.
3. Product objectives
1. Enable users to analyse construction site photographs within seconds.
2. Identify potentially visible safety and workmanship issues.
3. Generate structured inspection reports automatically.
4. Provide actionable recommendations for identified issues.
5. Make preliminary inspection documentation easier and faster.
4. Target users
User	Primary need
Site engineers	Document visible site issues
Site supervisors	Monitor site conditions
HSE officers	Identify potential safety hazards
Civil engineering students	Learn visual site inspection
Construction managers	Review inspection observations

5. Core features and functional requirements
The MVP should have five main features.
5.1 Image upload and inspection initiation
P0 — Must have
Users should be able to upload construction site photographs for analysis.

Requirements:
- Support JPG, JPEG, PNG and WEBP.
- Provide drag-and-drop and file selection.
- Display an image preview before submission.
- Allow users to remove or replace uploaded images.
- Provide an Analyse Site button.
- Show loading feedback while analysis is running.
5.2 AI-powered visual analysis
P0 — Must have
This is the core functionality of SiteLens.

Gemma 4 should analyse the uploaded photograph and identify:
Analysis category	Examples
Construction elements	Columns, beams, slabs, reinforcement, scaffolding
Safety hazards	Missing visible PPE, unsafe access, exposed hazards
Workmanship concerns	Visible cracks, honeycombing, poor concrete finish
Site conditions	Poor housekeeping, material storage, debris
General observations	Construction activities and visible site conditions