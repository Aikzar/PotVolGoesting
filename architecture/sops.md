# Architecture & Logic SOPs

## 1. Smart Match Algorithm
**Goal**: Deterministically find a valid 3-part combination (Protein + Veg + Carb).

**Inputs**:
- `recipes`: Full list of ingredients.
- `filters`: { `health_min`: int, `exclude_ids`: list }

**Logic Flow**:
1. **Filter Candidates**:
   - Filter out `ingredients` where `health_score < filters.health_min`.
   - Filter out `type` mismatch.
2. **Step A: Select Protein**
   - Pick random `protein` from candidates.
3. **Step B: Select Vegetable**
   - Get `protein.tags`.
   - Score all vegetables: `score = Intersection(veg.tags, protein.tags).length`.
   - Filter `vegetables` where `score > 0`.
   - If no match: Relax constraint (pick random healthy veg).
   - Else: Pick random from top matches.
4. **Step C: Select Carb**
   - Get `protein.tags` AND `vegetable.tags`.
   - Score all carbs: `score = Intersection(carb.tags, protein_tags + veg_tags).length`.
   - Apply **Friday Rule**: If `Day == Friday` -> Force `tags.includes('crispy')` OR `id == 'frietjes'`.
   - Pick random from matching carbs.

## 2. Full Dish Logic
- If `Random() < 0.3` (30% chance) OR `User requested "Snel"`:
  - Select from `type == 'full_dish'`.
  - Skip Veg/Carb selection.

## 3. Bomma Tips
- Display `bomma_tip` from the **Protein** (or Full Dish) chosen.
- If empty, fallback to a generic pool of tips.
