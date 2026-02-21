# 🍲 PotVolGoesting
**"Watte eten we vandaag, schatteke?"**

PotVolGoesting is een speelse, interactieve en volledig aanpasbare maaltijd-randomizer, ontworpen om het dagelijkse dilemma "wat gaan we koken?" voorgoed op te lossen. Met een gezellige "Bomma Chic" esthetiek combineert het moderne webtechnologie met een warme, Vlaamse persoonlijkheid. De app suggereert maaltijden op basis van je goesting, gezondheidsdoelen en de ingrediënten die je al in huis hebt.

## ✨ Functies

* **🎯 Twee Zoekmodi:**
* **Zoek met Goesting:** Genereert 5 zorgvuldig geselecteerde maaltijdsuggesties (zowel volledige gerechten als samengestelde maaltijden) die perfect passen bij je huidige gemoedstoestand.
* **Gij Beslist! (De Mixer):** Een aanpasbare "slot machine" waarbij je specifieke onderdelen (bijv. een bepaald type vlees, groente of koolhydraat) kunt vastzetten, waarna de computer intelligent de rest aanvult met passende ingrediënten.

* **🎚️ Gezondheidsmeter:** Stel precies in hoe gezond (of heerlijk ongezond) je vandaag wilt eten. Van "Lekker vettig" (1) tot "Super gezond" (10). Of zet de filter volledig uit op stand '0'.
* **🍟 Frietdag Toggle:** Omdat elke vrijdag frietdag zou moeten zijn. Deze schakelaar zorgt ervoor dat elke gegenereerde maaltijd móét passen bij (of expliciet bestaat uit) frietjes.
* **🏷️ Dieet & Voorkeuren (Geavanceerde Filters):** Een handig menu waarmee je specifieke tags kunt vereisen (✅) of uitsluiten (❌) binnen verschillende categorieën:
* **Dieet:** Vegetarisch, enz.
* **Seizoen:** Zomer, Winter, enz.
* **Bereidingstijd:** Snel, Traag, enz.
* **Budget:** €, €€€, enz.
* **Soort:** Comfortfood, Pasta, Oosters, enz.

* **👵🏼 De Bomma Spreekt:** Geen saaie laadbalkjes hier! Terwijl de app zoekt, krijg je gevatte Vlaamse kooktips en uitspraken van "De Bomma" te zien.

## 🛠️ Tech Stack
* **Frontend:** Vanilla HTML5, JavaScript (ES6+) en CSS.
* **Styling:** Custom Tailwind utility classes gecombineerd met op maat gemaakte CSS voor animaties, glassmorphism en het "Bomma Chic" thema.
* **Data Engine:** Een eigen JavaScript matching-engine (`js/engine.js`) die ingrediënten scoort op basis van tag-overlap, gezondheidsscore en door de gebruiker gedefinieerde regels (zoals de Frietdag-modus).
* **Data Source:** Werkt rechtstreeks vanuit een `recepten.json` bestand.

## 🚀 Hosting
**Host:** Bezoek de volgende, door Github gehoste, website om het te gebruiken: https://aikzar.github.io/PotVolGoesting/
