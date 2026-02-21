class RecipeEngine {
    constructor(recipes) {
        this.recipes = recipes.map(r => {
            let tags = r.Tags ? r.Tags.split(',').map(t => t.trim()) : [];

            // Clean up dirty raw tags from the CSV
            tags = tags.filter(t => {
                const lower = String(t).toLowerCase();
                if (lower === 'carb' || lower === 'eiwit' || lower === 'groente' || lower === 'volledig') return false;
                if (String(t).match(/^\d+$/)) return false; // Ignore pure numbers like '6'
                return true;
            });

            if (r.Seizoen && r.Seizoen !== 'Altijd' && !String(r.Seizoen).match(/^\d+$/)) tags.push(`Seizoen: ${r.Seizoen}`);
            if (r.Bereidingstijd && r.Bereidingstijd !== 'Altijd') tags.push(`Tijd: ${r.Bereidingstijd}`);
            if (r.Budget && r.Budget !== 'Gemiddeld') tags.push(`Budget: ${r.Budget}`);
            if (r.Vegetarisch === 'Ja') tags.push('Vegetarisch');

            // Map Categorie to CSS-friendly type
            let type = '';
            if (r.Categorie === 'Eiwit') type = 'protein';
            else if (r.Categorie === 'Groente') type = 'vegetable';
            else if (r.Categorie === 'Carb') type = 'carbohydrate';
            else if (r.Categorie === 'Volledig') type = 'full_dish';

            return { ...r, tags, type };
        });

        this.proteins = this.recipes.filter(r => r.type === 'protein');
        this.vegetables = this.recipes.filter(r => r.type === 'vegetable');
        this.carbs = this.recipes.filter(r => r.type === 'carbohydrate');
        this.fullDishes = this.recipes.filter(r => r.type === 'full_dish');
    }

    generateSuggestions(count = 5, filters = {}) {
        const suggestions = [];
        const seenIds = new Set();
        const healthTarget = filters.healthMin;
        const tagsFilter = filters.tags || {};

        // Determine how many full dishes vs split meals to generate.
        // E.g., for 5 items, let's do randomly 2 full, 3 split, or vice versa
        const fullDishTarget = Math.floor(Math.random() * 2) + 2; // 2 or 3 full dishes
        const splitTarget = count - fullDishTarget;

        let suitableFull = this._filterByTags(this.fullDishes, tagsFilter);
        if (this._isFriday()) {
            suitableFull = suitableFull.filter(d => d.Naam.toLowerCase().includes('friet'));
        }
        if (healthTarget) {
            let filteredFull = suitableFull.filter(d => Math.abs(d.Gezond_Score - healthTarget) <= 2.0);
            if (filteredFull.length > 0) {
                suitableFull = filteredFull;
            }
        }
        suitableFull = [...suitableFull].sort(() => Math.random() - 0.5);

        // Generate full dishes
        for (const dish of suitableFull) {
            if (suggestions.length >= fullDishTarget) break;
            suggestions.push({ type: 'full', items: [dish] });
            seenIds.add(dish.ID);
        }

        // Fill the rest with split meals
        while (suggestions.length < count) {
            const meal = this.generateMeal({ ...filters, type: 'split' });
            if (meal && meal.type === 'split') {
                suggestions.push(meal);
            } else {
                break; // Prevent infinite loop if generation fails entirely
            }
        }

        // Shuffle the final array so it's a random mix of full/split in the UI
        return suggestions.sort(() => Math.random() - 0.5);
    }

    generateMeal(filters = {}) {
        const isFriday = this._isFriday();
        const healthTarget = filters.healthMin;
        const tagsFilter = filters.tags || {};
        const pinned = filters.pinned || [null, null, null]; // [protein, veg, carb]

        // 1. Roll for Full Dish (only if no components are pinned and split is not explicitly requested)
        const isAnyPinned = pinned.some(p => p !== null);
        if (!isAnyPinned && filters.type !== 'split' && (Math.random() < 0.3 || filters.type === 'full')) {
            let suitableFullDishes = this._filterByTags(this.fullDishes, tagsFilter);
            if (isFriday) {
                suitableFullDishes = suitableFullDishes.filter(d => d.Naam.toLowerCase().includes('friet'));
            }
            if (healthTarget) {
                let filteredFullDishes = suitableFullDishes.filter(d =>
                    Math.abs(d.Gezond_Score - healthTarget) <= 1.5
                );
                if (filteredFullDishes.length > 0) {
                    suitableFullDishes = filteredFullDishes;
                }
            }
            if (suitableFullDishes.length > 0) {
                const dish = this._getRandom(suitableFullDishes);
                if (dish) return { type: 'full', items: [dish] };
            }
        }

        // 2. Select Components (Slot Machine Style)
        let protein = pinned[0];
        let veg = pinned[1];
        let carb = pinned[2];

        // Tag matching pool based on pinned items
        const pinnedItems = [protein, veg, carb].filter(p => p);
        const sourceTags = new Set(pinnedItems.flatMap(i => i.tags || []));

        // Protein
        if (!protein) {
            let suitableProteins = this.getValidOptionsForSlot(0, filters);
            if (isFriday) {
                const fried = suitableProteins.filter(p => p.tags.includes('#FrietVriendelijk'));
                if (fried.length > 0 && Math.random() < 0.6) suitableProteins = fried;
            }

            if (suitableProteins.length > 0) {
                // Smart Match if other things are pinned
                if (sourceTags.size > 0) {
                    protein = this._findCompatible(pinnedItems, suitableProteins) || this._getRandom(suitableProteins);
                } else {
                    protein = this._getRandom(suitableProteins);
                }
            }
        }

        if (!protein) protein = this._getRandom(this.proteins); // extreme fallback

        // Veg
        if (!veg) {
            let suitableVeg = this.getValidOptionsForSlot(1, filters);

            if (suitableVeg.length > 0) {
                // Try smart match with protein + pinned carb
                veg = this._findCompatible([protein, carb].filter(i => i), suitableVeg) || this._getRandom(suitableVeg);

                // Healthy fallback prevention
                if (healthTarget <= 3 && veg && veg.Gezond_Score > 6) {
                    const greasyVeg = suitableVeg.filter(v => v.Gezond_Score <= 6);
                    if (greasyVeg.length > 0) veg = this._getRandom(greasyVeg);
                }
            }
        }

        if (!veg) veg = this._getRandom(this.vegetables); // extreme fallback

        // Carb
        if (!carb) {
            if (isFriday) {
                const frietjes = this.carbs.filter(c => c.Naam.toLowerCase().includes('friet'));
                if (frietjes.length > 0) carb = this._getRandom(frietjes);
            }
            if (!carb) {
                let suitableCarbs = this.getValidOptionsForSlot(2, filters);
                if (suitableCarbs.length > 0) {
                    carb = this._findCompatible([protein, veg].filter(i => i), suitableCarbs) || this._getRandom(suitableCarbs);
                }
            }
        }

        if (!carb) carb = this._getRandom(this.carbs); // extreme fallback

        return {
            type: 'split',
            items: [protein, veg, carb]
        };
    }

    _findCompatible(sources, candidates) {
        const sourceArray = Array.isArray(sources) ? sources : [sources];
        const sourceTags = new Set(sourceArray.flatMap(s => s.tags));

        // Score candidates by intersection count
        const scored = candidates.map(c => {
            const intersection = c.tags.filter(t => sourceTags.has(t)).length;
            return { item: c, score: intersection };
        });

        // Filter valid matches (score > 0)
        const matches = scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score);

        if (matches.length === 0) return null;

        const topScore = matches[0].score;
        // Relax matching to include near-top scorers for significantly more variety
        const topTier = matches.filter(m => m.score >= topScore - 1);

        return this._getRandom(topTier.map(m => m.item));
    }

    _filterByTags(items, tagsFilter) {
        if (!tagsFilter || Object.keys(tagsFilter).length === 0) return items;

        const requiredTags = Object.keys(tagsFilter).filter(t => tagsFilter[t] === 1);
        const excludedTags = Object.keys(tagsFilter).filter(t => tagsFilter[t] === 2);

        return items.filter(item => {
            const itemTags = item.tags || [];
            if (requiredTags.length > 0) {
                const hasRequired = requiredTags.every(rt => itemTags.includes(rt));
                if (!hasRequired) return false;
            }
            if (excludedTags.length > 0) {
                const hasExcluded = excludedTags.some(et => itemTags.includes(et));
                if (hasExcluded) return false;
            }
            return true;
        });
    }

    getValidOptionsForSlot(slotIndex, filters = {}) {
        const healthTarget = filters.healthMin;
        const tagsFilter = filters.tags || {};

        let sourceList = slotIndex === 0 ? this.proteins : (slotIndex === 1 ? this.vegetables : this.carbs);

        // Apply tag filtering first
        let valid = this._filterByTags(sourceList, tagsFilter);

        // Try apply health filter gracefully
        if (healthTarget) {
            let healthFiltered = valid.filter(item => Math.abs(item.Gezond_Score - healthTarget) <= 2.5);
            if (healthFiltered.length > 0) valid = healthFiltered;
        }

        return valid;
    }

    _getRandom(arr) {
        if (!arr || arr.length === 0) return null;
        return arr[Math.floor(Math.random() * arr.length)];
    }

    _isFriday() {
        return window.isFridayForce === true;
    }
}
