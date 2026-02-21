# 🍲 PotVolGoesting

**"Wa eten we vandaag, schatteke?"** (What are we eating today, honey?)

PotVolGoesting is a playful, interactive, and highly customizable recipe randomizer designed to solve the daily dilemma of deciding what to cook. Built with a cozy "Bomma Chic" (Grandma Chic) aesthetic, it combines modern web technologies with a warm, Flemish personality to suggest meals based on your actual cravings, health goals, and available ingredients.

## ✨ Features

- **🎯 Twee Zoekmodi (Two Search Modes):**
  - **Zoek met Goesting:** Generates 5 curated, complete meal suggestions (both full recipes and slot-machine style 3-part meals) that perfectly match your current mood.
  - **Gij Beslist! (De Mixer):** A customizable slot machine where you lock in specific components (e.g., specific protein, veg, or carb) and let the engine intelligently fill in the rest with compatible ingredients.
- **🎚️ Gezondheidsmeter (Health Slider):** Dial in exactly how healthy (or deliciously unhealthy) you want to eat today. From "Lekker vettig" (1) to "Super gezond" (10). Or turn it off entirely with the '0' setting.
- **🍟 Frietdag Toggle:** Because every Friday should be fry-day. Flipping this toggle enforces that any generated meal *must* be compatible with (or explicitly include) fries.
- **🏷️ Dieet & Voorkeuren (Advanced Tag Filtering):** A collapsible accordion that lets you require (✅) or exclude (❌) specific tags across distinct categories:
  - **Dieet:** Vegetarisch, etc.
  - **Seizoen:** Zomer, Winter, etc.
  - **Bereidingstijd:** Snel, Traag, etc.
  - **Budget:** €, €€€, etc.
  - **Soort:** ComfortFood, Pasta, Oosters, etc.
- **👵🏼 De Bomma Spreekt:** Enjoy localized, sassy Flemish cooking quotes from the "Bomma" (Grandma) character as you search for meals, replacing a boring loading spinner.

## 🛠️ Tech Stack

- **Frontend:** Vanilla HTML5, JavaScript (ES6+), and CSS.
- **Styling:** Custom Tailwind utility classes combined with bespoke CSS for animations, glassmorphism, and the "Bomma Chic" theme.
- **Data Engine:** A custom, client-side JavaScript matching engine (`js/engine.js`) that scores ingredients based on tag overlap, health proximity, and user-defined constraints (Friday rules).
- **Data Source:** Pulls directly from a `recepten.json` file. 

## 🚀 Deployment / Setup

1. **Host:** This project is entirely static. You can host it on GitHub Pages, Netlify, Vercel, or any standard web server.
2. **Data Updates:** To update the recipe database, simply modify `recepten.json`. The engine automatically parses new tags, recalculates health scores, and maps categories.
   
## 🤝 Author
Created for everyone who spends more time deciding what to eat than actually cooking it. Smakelijk!
