# Findings Log

## Discovery Phase
- **Project Name**: PotVolGoesting
- **Platform**: Web (Mobile-First), Static (GitHub Pages)
- **Data Source**: Local `recipes.json`
- **User Constraints**:
  - No external APIs.
  - "Bomma" style language.
  - "Frietjes" on Fridays.
  - Smart Matching via tags.
  - "Full Dish" handling (merging 3 columns).

## Blueprint Phase
- Defined JSON schema details in `gemini.md`.
- Identified need for "Smart Match" algorithm: Set Intersection on `tags`.
