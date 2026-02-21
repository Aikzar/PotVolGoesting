# Maintenance Log

## Initial Build (v1.0)
- **Architecture**: B.L.A.S.T. Protocol implemented.
- **Engine**: JSON-based logic with Smart Match (Tag Intersection).
- **UI**: "Bomma Chic" theme applied. Mobile-first.
- **Tools**: Python CSV converter included.

## Known Invariants
- `recipes.json` must be a valid JSON Array.
- Images are currently not used; styling relies on CSS and Emoji/Iconography to keep it lightweight.

---
# Project Constitution: PotVolGoesting

## Data Schema (`recipes.json`)

The "Source of Truth" is a JSON array of `Ingredient` objects.

```json
[
  {
    "id": "uuid-string",
    "name": "Stoofvlees",
    "type": "protein", // Enum: "protein", "vegetable", "carbohydrate", "full_dish", "sauce"
    "tags": ["classic", "rich", "winter", "beer"],
    "health_score": 4, // 1-10 (1 = heart attack, 10 = super wholesome)
    "associations": [], // Optional: explicit IDs for forced pairings if needed
    "is_fry_friendly": true, // For Friday rule
    "bomma_tip": "Gebruik een bruine boterham met mosterd voor de binding."
  }
]
```

### Enumerations
- **Type**:
  - `protein` (Vlees/Vis/Veggies, Linker kolom)
  - `vegetable` (Groenten, Midden kolom)
  - `carbohydrate` (Patatjes/Pasta/Rijst, Rechter kolom)
  - `full_dish` (Eenpansgerechten/Ovenschotels - Neemt 3 kolommen in)
  - `sauce` (Optioneel, extra laag)

## Behavioral Rules

### 1. The "Bomma" Tone
- **Voice**: Authentic Flemish, dialect-friendly but readable.
- **Example Phrases**: "Gij beslist", "Wa eten we vandaag?", "Goesting?", "Das goe gerief".

### 2. Smart Match Logic
- **Constraint**: Ingredients in a combination MUST share at least **one** common tag to be considered "compatible".
- **Exception**: "Gij Beslist" button (Chaos Mode) ignores matching rules.
- **Visuals**:
  - If `type` == `full_dish`: The UI renders a single wide card instead of 3 slots.

### 3. Special Temporal Rules
- **Friday Rule**: If `CurrentDay == Friday`:
  - Force `carbohydrate` slot to be "Frietjes" (or distinct fry-friendly option).
  - Or boost probability of `is_fry_friendly` proteins.

### 4. Health Filter
- User input slider (1-10).
- Logic: `avg(health_score) >= UserSetting`.

## Architectural Invariants
1. **No External DB**: Data lives in client-side JSON.
2. **Mobile First**: Layout uses Flexbox/Grid with touch targets > 44px.
3. **Stateless**: No user accounts. Preferences stored in `localStorage` (if needed).
