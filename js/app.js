document.addEventListener('DOMContentLoaded', async () => {
    // --- APP LOGIC ---
    const DOM = {
        slider: document.getElementById('healthSlider'),
        healthDisplay: document.getElementById('healthDisplay'),
        btnSmart: document.getElementById('btnSmart'),
        btnChaos: document.getElementById('btnChaos'),
        emptyState: document.getElementById('emptyState'),
        resultArea: document.getElementById('resultArea'),
        spinnerView: document.getElementById('spinnerView'),
        spinnerCarousel: document.getElementById('spinnerCarousel'),
        mixerView: document.getElementById('mixerView'),
        mixerSlots: document.getElementById('mixerSlots'),
        mixerFullOverlay: document.getElementById('mixerFullOverlay'),
        bommaTipContainer: document.getElementById('bommaTipContainer'),
        bommaTipText: document.getElementById('bommaTipText'),
        fridayToggle: document.getElementById('fridayToggle'),
        fridayEmoji: document.getElementById('fridayEmoji'),
        fridayText: document.getElementById('fridayText'),
        cookingAnimation: document.getElementById('cookingAnimation'),
        potSvg: document.getElementById('potSvg'),
        potLid: document.getElementById('potLid'),
        tagFilterToggle: document.getElementById('tagFilterToggle'),
        tagFilterContent: document.getElementById('tagFilterContent'),
        tagFilterIcon: document.getElementById('tagFilterIcon')
    };

    let engine = null;
    let currentPinned = [null, null, null]; // [protein, veg, carb]
    window.tagState = {}; // { '#Tag': 0/1/2 } 0=neutral, 1=require, 2=exclude

    // Load Data & Initialize Engine
    try {
        const response = await fetch('recepten.json');
        if (!response.ok) throw new Error('Data load failed');
        const recipes = await response.json();

        if (typeof RecipeEngine !== 'undefined') {
            engine = new RecipeEngine(recipes);
            console.log("PotVolGoesting Engine Started.");
            initTags(engine.recipes);
        } else {
            console.error("RecipeEngine class not found.");
        }
    } catch (e) {
        console.error("Critical Error:", e);
    }

    function initTags(recipes) {
        const tagSet = new Set();
        recipes.forEach(r => (r.tags || []).forEach(t => tagSet.add(t)));
        const sortedTags = Array.from(tagSet).sort();

        const container = document.getElementById('tagFilterContainer');
        if (!container) return;

        const groups = {
            'Dieet': [],
            'Seizoen': [],
            'Bereidingstijd': [],
            'Budget': [],
            'Soort': []
        };

        sortedTags.forEach(tag => {
            if (tag === 'Vegetarisch') groups['Dieet'].push(tag);
            else if (tag.startsWith('Seizoen:')) groups['Seizoen'].push(tag);
            else if (tag.startsWith('Tijd:')) groups['Bereidingstijd'].push(tag);
            else if (tag.startsWith('Budget:')) groups['Budget'].push(tag);
            else groups['Soort'].push(tag);
        });

        let html = '';
        for (const [groupName, tags] of Object.entries(groups)) {
            if (tags.length === 0) continue;

            html += `<div class="w-full mb-3 last:mb-0">`;
            html += `<h4 class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">${groupName}</h4>`;
            html += `<div class="flex flex-wrap gap-2 px-1">`;
            html += tags.map(tag => {
                let displayTag = tag;
                if (tag.startsWith('Seizoen: ')) displayTag = tag.replace('Seizoen: ', '');
                if (tag.startsWith('Tijd: ')) displayTag = displayTag.replace('Tijd: ', '');
                if (tag.startsWith('Budget: ')) displayTag = displayTag.replace('Budget: ', '');

                return `
                <button class="tag-chip px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200 transition-colors whitespace-nowrap" data-tag="${tag}" data-display="${displayTag}" onclick="window.toggleTag('${tag}', this)">
                    ${displayTag}
                </button>
                `;
            }).join('');
            html += `</div></div>`;
        }

        container.innerHTML = html;

        sortedTags.forEach(t => window.tagState[t] = 0);
    }

    window.toggleTag = (tag, btnEl) => {
        let state = window.tagState[tag];
        state = (state + 1) % 3;
        window.tagState[tag] = state;

        const displayTag = btnEl.getAttribute('data-display') || tag;

        btnEl.classList.remove('bg-gray-100', 'text-gray-500', 'border-gray-200', 'bg-green-100', 'text-green-800', 'border-green-300', 'bg-red-100', 'text-red-800', 'border-red-300');

        if (state === 0) {
            btnEl.classList.add('bg-gray-100', 'text-gray-500', 'border-gray-200');
            btnEl.innerHTML = displayTag;
        } else if (state === 1) {
            btnEl.classList.add('bg-green-100', 'text-green-800', 'border-green-300');
            btnEl.innerHTML = `✅ ${displayTag}`;
        } else {
            btnEl.classList.add('bg-red-100', 'text-red-800', 'border-red-300');
            btnEl.innerHTML = `❌ ${displayTag}`;
        }
    };

    // Friday Logic
    window.isFridayForce = false;
    if (DOM.fridayToggle) {
        DOM.fridayToggle.addEventListener('click', () => {
            window.isFridayForce = !window.isFridayForce;
            if (window.isFridayForce) {
                DOM.fridayToggle.classList.add('bg-orange-50', 'border-orange-200', 'text-orange-600');
                DOM.fridayToggle.classList.remove('bg-gray-50', 'border-gray-100', 'text-gray-400');
                DOM.fridayEmoji.classList.remove('grayscale', 'opacity-50');
                DOM.fridayText.textContent = "Frietdag (Aan!)";
            } else {
                DOM.fridayToggle.classList.remove('bg-orange-50', 'border-orange-200', 'text-orange-600');
                DOM.fridayToggle.classList.add('bg-gray-50', 'border-gray-100', 'text-gray-400');
                DOM.fridayEmoji.classList.add('grayscale', 'opacity-50');
                DOM.fridayText.textContent = "Frietdag (Uit)";
            }
        });
    }

    // Tag Filter Accordion Logic
    if (DOM.tagFilterToggle && DOM.tagFilterContent) {
        DOM.tagFilterToggle.addEventListener('click', () => {
            const isHidden = DOM.tagFilterContent.classList.contains('hidden');
            if (isHidden) {
                DOM.tagFilterContent.classList.remove('hidden');
                DOM.tagFilterIcon.classList.add('rotate-180');
            } else {
                DOM.tagFilterContent.classList.add('hidden');
                DOM.tagFilterIcon.classList.remove('rotate-180');
            }
        });
    }

    // Health slider display updates
    DOM.slider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        let text = "";
        let colorClass = "";
        let thumbColor = "";
        if (val === 0) {
            text = `Maakt nie uit (Toon Alles)`;
            colorClass = "bg-gray-100 text-gray-500";
            thumbColor = "#9ca3af"; // Gray
        } else if (val <= 3) {
            text = `Lekker vettig (${val})`;
            colorClass = "bg-red-100 text-red-800";
            thumbColor = "#d32f2f"; // Bomma Red
        } else if (val <= 6) {
            text = `Goe gebalanceerd (${val})`;
            colorClass = "bg-orange-100 text-orange-800";
            thumbColor = "#f57c00"; // Orange
        } else {
            text = `Super gezond (${val})`;
            colorClass = "bg-green-100 text-green-800";
            thumbColor = "#388e3c"; // Green
        }
        DOM.healthDisplay.textContent = text;
        DOM.healthDisplay.className = `${colorClass} text-xs px-2 py-1 rounded-full font-bold`;
        DOM.slider.style.setProperty('--slider-thumb-color', thumbColor);
    });

    // Initialize slider text and color
    DOM.slider.dispatchEvent(new Event('input'));

    // Event Listeners
    DOM.btnSmart.addEventListener('click', () => startSpinner());
    DOM.btnChaos.addEventListener('click', () => startMixer());

    function startSpinner() {
        if (!engine) return;
        const healthMin = parseInt(DOM.slider.value);
        playCookingAnimation(() => {
            const suggestions = engine.generateSuggestions(5, { healthMin, tags: window.tagState });
            renderSpinner(suggestions);
        });
    }

    function startMixer(specificSlot = -1) {
        if (!engine) return;
        const healthMin = parseInt(DOM.slider.value);

        // If clicking the big button, we roll everything not pinned
        // If specificSlot is passed, we just roll that one (not yet used, but for reroll icons)

        const meal = engine.generateMeal({
            healthMin,
            pinned: currentPinned,
            type: 'split',
            tags: window.tagState
        });

        DOM.emptyState.classList.add('hidden');
        DOM.spinnerView.classList.add('hidden');
        DOM.bommaTipContainer.classList.add('hidden');

        if (meal) renderMixer(meal);
        else showEmptyError();
    }

    function playCookingAnimation(onComplete) {
        DOM.emptyState.classList.add('hidden');
        DOM.spinnerView.classList.add('hidden');
        DOM.mixerView.classList.add('hidden');
        DOM.bommaTipContainer.classList.add('hidden');

        DOM.cookingAnimation.classList.remove('hidden');
        DOM.cookingAnimation.classList.add('flex');
        DOM.potLid.classList.remove('animate-fly-off');
        DOM.potSvg.classList.add('animate-shake');

        setTimeout(() => {
            if (navigator.vibrate) navigator.vibrate([30, 30, 30, 30, 30, 30]);
            DOM.potSvg.classList.remove('animate-shake');
            DOM.potLid.classList.add('animate-fly-off');
            if (navigator.vibrate) navigator.vibrate([200]);

            setTimeout(() => {
                DOM.cookingAnimation.classList.add('hidden');
                DOM.cookingAnimation.classList.remove('flex');
                onComplete();
            }, 600);
        }, 1200);
    }

    function renderSpinner(suggestions) {
        DOM.spinnerView.classList.remove('hidden');
        DOM.spinnerCarousel.innerHTML = suggestions.map((s, i) => {
            const animationDelay = `delay-${(i % 3) + 1}`;
            if (s.type === 'full') {
                const item = s.items[0];
                return createCardHTML(item, 'Volledig Gerecht', animationDelay, true, true);
            } else {
                return createComboCardHTML(s, animationDelay);
            }
        }).join('');

        // Show tips for the first suggestion
        if (suggestions[0]) showBommaTip(suggestions[0].items, suggestions[0].type === 'split');
    }

    function renderMixer(meal) {
        DOM.mixerView.classList.remove('hidden');

        if (meal.type === 'full') {
            DOM.mixerSlots.classList.add('hidden');
            DOM.mixerFullOverlay.classList.remove('hidden');
            const item = meal.items[0];
            DOM.mixerFullOverlay.innerHTML = `
                <div class="space-y-4">
                    ${createCardHTML(item, "Hoofdgerecht", "delay-1", true)}
                    <button class="w-full py-3 bg-gray-100 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition-colors" onclick="location.reload()">
                        🔄 Terug naar de Mixer
                    </button>
                </div>
            `;
        } else {
            DOM.mixerSlots.classList.remove('hidden');
            DOM.mixerFullOverlay.classList.add('hidden');

            // We render in order: Protein (0), Carb (2), Veg (1) based on user request "[🍖 Eiwit] [🥔 Koolhydraat] [🥦 Groente]"
            const displayOrder = [0, 2, 1]; // Indices in meal.items

            displayOrder.forEach((itemIndex, domIndex) => {
                const item = meal.items[itemIndex];
                const slotEl = document.getElementById(`slot-${domIndex}`);
                if (!currentPinned[domIndex]) {
                    slotEl.innerHTML = createSlotHTML(item, itemIndex, domIndex);
                }
            });
        }
        showBommaTip(meal.items, meal.type === 'split');
    }

    function createSlotHTML(item, engineIndex, domIndex) {
        const labels = { 0: "Eiwit", 1: "Groente", 2: "Koolhydraat" };
        const icons = { 0: "🍖", 1: "🥦", 2: "🥔" };
        const icon = item.emoji || icons[engineIndex];
        const score = item.Gezond_Score || 0;
        const scoreColor = score > 6 ? 'text-green-600' : (score > 3 ? 'text-orange-600' : 'text-red-600');

        return `
            <div class="slot-icon text-2xl mb-1 cursor-pointer transition-transform hover:scale-110" onclick="window.openMixerModal(${domIndex}, ${engineIndex})">${icon}</div>
            <div class="flex-grow flex items-center justify-between w-full min-h-[60px] cursor-pointer group" onclick="window.openMixerModal(${domIndex}, ${engineIndex})">
                <div class="flex flex-col justify-center items-center flex-grow h-full min-w-0 px-1 transition-colors group-hover:bg-orange-50/50 rounded-lg">
                    <p class="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-wider truncate w-full text-center">${labels[engineIndex]}</p>
                    <h3 class="text-[11px] sm:text-xs font-bold text-gray-800 leading-tight my-1 text-center line-clamp-2 w-full break-words group-hover:text-orange-600 transition-colors">${item.Naam}</h3>
                    <p class="text-[9px] sm:text-[10px] ${scoreColor} font-black mt-1">Gez: ${score}</p>
                </div>
            </div>
            <div class="slot-controls flex flex-col gap-1.5 mt-2 border-t border-gray-100 pt-3 w-full justify-center">
                <button onclick="window.togglePin(${domIndex}, ${engineIndex})" class="w-full flex items-center justify-center gap-1.5 py-2 px-1 text-[10px] sm:text-[11px] font-bold rounded-lg transition-all border ${currentPinned[domIndex] ? 'text-orange-600 bg-orange-50 border-orange-200 shadow-sm' : 'text-gray-500 bg-gray-50 border-gray-200 hover:bg-gray-100 hover:text-gray-700'}" title="Pin dit">
                    <span>📌</span> <span>${currentPinned[domIndex] ? 'Vastgezet' : 'Vastzetten'}</span>
                </button>
                <button onclick="window.rerollSlot(${domIndex}, ${engineIndex})" class="w-full flex items-center justify-center gap-1.5 py-2 px-1 text-[10px] sm:text-[11px] font-bold rounded-lg transition-all border border-gray-200 text-gray-500 bg-gray-50 hover:bg-gray-100 hover:text-gray-700 ${currentPinned[domIndex] ? 'hidden' : ''}" title="Herrol enkel dit">
                    <span>🎲</span> <span>Iets anders</span>
                </button>
                <button onclick="window.openMixerModal(${domIndex}, ${engineIndex})" class="w-full flex items-center justify-center gap-1.5 py-2 px-1 text-[10px] sm:text-[11px] font-bold rounded-lg transition-all border border-gray-200 text-gray-500 bg-gray-50 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 ${currentPinned[domIndex] ? 'hidden' : ''}" title="Kies zelf">
                    <span>🔍</span> <span>Kies zelf</span>
                </button>
            </div>
        `;
    }

    const modalDOM = {
        overlay: document.getElementById('mixerModal'),
        content: document.getElementById('mixerModalContent'),
        list: document.getElementById('mixerModalList'),
        closeBtn: document.getElementById('closeMixerModal'),
        title: document.getElementById('mixerModalTitle')
    };

    if (modalDOM.closeBtn) {
        modalDOM.closeBtn.addEventListener('click', closeMixerModal);
    }

    function closeMixerModal() {
        modalDOM.content.classList.add('translate-y-full');
        setTimeout(() => {
            modalDOM.overlay.classList.add('hidden');
        }, 300); // Wait for transition
    }

    window.openMixerModal = (domIndex, engineIndex) => {
        if (!engine || currentPinned[domIndex]) return; // Don't open if pinned

        const labels = { 0: "Kies een Eiwit", 1: "Kies een Groente", 2: "Kies een Koolhydraat" };
        modalDOM.title.textContent = labels[engineIndex];

        const healthMin = parseInt(DOM.slider.value);
        const validOptions = engine.getValidOptionsForSlot(engineIndex, { healthMin, tags: window.tagState });

        // Sort by health score
        validOptions.sort((a, b) => b.Gezond_Score - a.Gezond_Score);

        modalDOM.list.innerHTML = validOptions.map(item => {
            const score = item.Gezond_Score || 0;
            const scoreColor = score > 6 ? 'text-green-600 bg-green-50 border-green-200' : (score > 3 ? 'text-orange-600 bg-orange-50 border-orange-200' : 'text-red-600 bg-red-50 border-red-200');

            return `
                <div class="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:border-orange-300 hover:shadow-md transition-all" onclick="window.selectMixerItem(${domIndex}, ${engineIndex}, '${item.ID}')">
                    <div class="text-3xl shrink-0">${item.emoji || '🍴'}</div>
                    <div class="flex-grow">
                        <h4 class="font-bold text-gray-800 text-sm leading-tight">${item.Naam}</h4>
                        <div class="flex flex-wrap gap-1 mt-1">
                            ${(item.tags || []).slice(0, 3).map(t => `<span class="text-[9px] text-gray-500 bg-gray-100 px-1 rounded">${t}</span>`).join('')}
                        </div>
                    </div>
                    <div class="shrink-0 flex flex-col items-center justify-center w-10 h-10 rounded-full border ${scoreColor}">
                        <span class="text-[9px] font-bold">Gez.</span>
                        <span class="font-black leading-none text-sm">${score}</span>
                    </div>
                </div>
            `;
        }).join('');

        modalDOM.overlay.classList.remove('hidden');
        // Small delay to allow display:block to apply before animating transform
        setTimeout(() => {
            modalDOM.content.classList.remove('translate-y-full');
        }, 10);
    };

    window.selectMixerItem = (domIndex, engineIndex, itemId) => {
        const healthMin = parseInt(DOM.slider.value);
        const validOptions = engine.getValidOptionsForSlot(engineIndex, { healthMin, tags: window.tagState });
        const selectedItem = validOptions.find(i => i.ID === itemId);

        if (selectedItem) {
            lastMixerItems[engineIndex] = selectedItem;
            const slotEl = document.getElementById(`slot-${domIndex}`);
            if (slotEl) slotEl.innerHTML = createSlotHTML(selectedItem, engineIndex, domIndex);
            closeMixerModal();
        }
    };

    window.togglePin = (domIndex, engineIndex) => {
        if (currentPinned[domIndex]) {
            currentPinned[domIndex] = null;
        } else {
            currentPinned[domIndex] = lastMixerItems[engineIndex];
        }

        const slotEl = document.getElementById(`slot-${domIndex}`);
        if (slotEl && lastMixerItems[engineIndex]) {
            slotEl.innerHTML = createSlotHTML(lastMixerItems[engineIndex], engineIndex, domIndex);
        }
    };

    let lastMixerItems = [null, null, null];
    function renderMixerItems(items) {
        lastMixerItems = items;
    }

    // Overriding renderMixer slightly to capture items
    const originalRenderMixer = renderMixer;
    renderMixer = (meal) => {
        if (meal.type === 'split') lastMixerItems = meal.items;
        originalRenderMixer(meal);
    }

    window.rerollSlot = (domIndex, engineIndex) => {
        if (!engine) return;
        const healthMin = parseInt(DOM.slider.value);

        // Ensure other slots are temporarily "pinned" in the engine logic to only roll this one, OR
        // just roll a new meal keeping current layout pinned items.
        // Actually, we need to guarantee ONLY this slot changes.
        // We can do this by creating a temp pinned array for the engine that has everything pinned EXCEPT the rerolled slot.
        const tempPinned = [null, null, null];
        tempPinned[0] = lastMixerItems[0];
        tempPinned[1] = lastMixerItems[1];
        tempPinned[2] = lastMixerItems[2];
        tempPinned[engineIndex] = null; // Free this specific slot to be rolled

        const meal = engine.generateMeal({ healthMin, pinned: tempPinned, type: 'split', tags: window.tagState });
        if (meal && meal.type === 'split') {
            lastMixerItems[engineIndex] = meal.items[engineIndex];
            const slotEl = document.getElementById(`slot-${domIndex}`);
            // Unpin if it was pinned
            if (currentPinned[domIndex]) window.togglePin(domIndex, engineIndex);

            // Render new
            if (slotEl) slotEl.innerHTML = createSlotHTML(meal.items[engineIndex], engineIndex, domIndex);
            showBommaTip([meal.items[engineIndex]]);
        }
    };

    function createCardHTML(item, label, animationDelay, isFullDish = false, showTime = false) {
        const score = item.Gezond_Score || 0;
        const scoreColor = score > 6 ? 'text-green-600 bg-green-50 border-green-200' :
            (score > 3 ? 'text-orange-600 bg-orange-50 border-orange-200' : 'text-red-600 bg-red-50 border-red-200');
        const icon = item.emoji || (isFullDish ? '🥘' : '🍴');

        return `
            <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 animate-pop opacity-0 ${animationDelay}">
                <div class="text-4xl bg-orange-50 w-16 h-16 rounded-xl flex items-center justify-center shrink-0 border border-orange-100">
                    ${icon}
                </div>
                <div class="flex-grow">
                    <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">${label}</p>
                    <h3 class="text-lg font-bold text-gray-800">${isFullDish ? '🥘 ' : ''}${item.Naam}</h3>
                    ${item.Bereidingstijd ? `<p class="text-[10px] text-gray-500 font-bold mt-1">⏱ ${item.Bereidingstijd}</p>` : ''}
                </div>
                <div class="shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-full border-2 ${scoreColor}">
                    <span class="text-xs font-bold">Gez.</span>
                    <span class="font-black leading-none">${score}</span>
                </div>
            </div>
        `;
    }

    function createComboCardHTML(meal, animationDelay) {
        const [protein, veg, carb] = meal.items;
        const validItems = [protein, veg, carb].filter(i => i);
        if (validItems.length === 0) return '';

        const sumHealth = validItems.reduce((sum, item) => sum + (item.Gezond_Score || 0), 0);
        const avgHealth = Math.round(sumHealth / validItems.length) || 0;
        const scoreColor = avgHealth > 6 ? 'text-green-600 bg-green-50 border-green-200' :
            (avgHealth > 3 ? 'text-orange-600 bg-orange-50 border-orange-200' : 'text-red-600 bg-red-50 border-red-200');

        const icons = { 0: "🍖", 1: "🥦", 2: "🥔" };
        const displayOrder = [0, 2, 1]; // Eiwit, Koolhydraat, Groente explicitly requested
        const comboIcons = displayOrder.map(idx => meal.items[idx]?.emoji || icons[idx] || '🍴').join(' ');

        return `
            <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3 animate-pop opacity-0 ${animationDelay} transition-all hover:shadow-md hover:border-orange-200 cursor-pointer" onclick="const details = this.querySelector('.combo-details'); details.classList.toggle('hidden');">
                <div class="flex items-center gap-2 sm:gap-4">
                    <div class="text-sm sm:text-xl bg-orange-50 px-2 flex items-center justify-center h-14 sm:h-16 rounded-xl shrink-0 border border-orange-100 gap-1">
                        <span class="tracking-widest">${comboIcons}</span>
                    </div>
                    <div class="flex-grow min-w-0">
                        <p class="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Mix & Match</p>
                        <h3 class="text-base sm:text-lg font-bold text-gray-800 leading-tight break-words">Zelf samengesteld</h3>
                        <p class="text-[9px] sm:text-[10px] text-orange-400 italic">Klik voor details ⬇️</p>
                    </div>
                    <div class="shrink-0 flex flex-col items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 ${scoreColor}">
                        <span class="text-[10px] sm:text-xs font-bold">Gez.</span>
                        <span class="font-black leading-none text-sm sm:text-base">${avgHealth}</span>
                    </div>
                </div>

                <div class="combo-details hidden flex flex-col gap-2 mt-2 pt-3 border-t border-gray-100">
                    ${displayOrder.map(engineIndex => {
            const item = meal.items[engineIndex];
            if (!item) return '';
            return `
                        <div class="flex flex-col gap-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <div class="flex items-center gap-3">
                                <span class="text-2xl">${item.emoji || icons[engineIndex] || '🍴'}</span>
                                <div class="flex-grow">
                                    <span class="font-bold text-sm text-gray-800">${item.Naam}</span>
                                </div>
                                <span class="text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">Gez: ${item.Gezond_Score || 0}</span>
                            </div>
                            ${item.Bomma_Tip ? `<p class="text-[11px] text-gray-500 italic ml-10 border-l-2 border-orange-200 pl-2">" ${item.Bomma_Tip} "</p>` : ''}
                        </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;
    }

    function showBommaTip(items, forceGeneric = false) {
        if (forceGeneric) {
            const genericTips = [
                "Vergeet uw zout ni hé!",
                "Een goei klontje boter maakt alles beter.",
                "Liefde gaat door de maag, schatteke.",
                "Niet vergeten proeven tussendoor!",
                "As 't ni smaakt, doe der wa kaas over.",
                "Goe roeren, da 't ni aanbakt!",
                "Met liefde gemaakt smaakt altijd beter."
            ];
            const randomTip = genericTips[Math.floor(Math.random() * genericTips.length)];
            DOM.bommaTipText.textContent = `"${randomTip}"`;
            DOM.bommaTipContainer.classList.remove('hidden');
            return;
        }

        const tips = items.map(i => i.Bomma_Tip).filter(t => t);
        if (tips.length > 0) {
            const randomTip = tips[Math.floor(Math.random() * tips.length)];
            DOM.bommaTipText.textContent = `"${randomTip}"`;
            DOM.bommaTipContainer.classList.remove('hidden');
        }
    }

    function showEmptyError() {
        DOM.resultArea.innerHTML = `< div class="bg-red-50 text-red-600 p-4 rounded-xl text-center font-bold" > Oei! Niks gevonden met deze filters.</div > `;
        DOM.resultArea.classList.remove('hidden');
    }
});
