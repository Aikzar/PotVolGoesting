import csv
import json
import uuid
import sys
import os

def convert_csv_to_json(csv_path, json_path):
    recipes = []
    
    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Basic cleaning and validation
                if not row.get('name'):
                    continue

                recipe = {
                    "id": str(uuid.uuid4()),
                    "name": row.get('name', 'Unknown').strip(),
                    "type": row.get('type', 'protein').strip().lower(), # protein, vegetable, carbohydrate, full_dish
                    "tags": [t.strip().lower() for t in row.get('tags', '').split(',') if t.strip()],
                    "health_score": int(row.get('health_score', 5)),
                    "bomma_tip": row.get('bomma_tip', '').strip(),
                    "is_fry_friendly": row.get('is_fry_friendly', 'false').lower() == 'true',
                    "associations": [] # logic for forced pairs can be added here
                }
                recipes.append(recipe)

        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(recipes, f, indent=2, ensure_ascii=False)
        
        print(f"Successfully converted {len(recipes)} items to {json_path}")
        return True

    except Exception as e:
        print(f"Error converting data: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python convert_data.py <input.csv> <output.json>")
        # Create a dummy CSV if none exists for testing
        if not os.path.exists("ingredients.csv"):
            print("No input provided. Creating dummy 'ingredients.csv' for testing...")
            with open("ingredients.csv", "w", encoding='utf-8') as f:
                f.write("name,type,tags,health_score,bomma_tip,is_fry_friendly\n")
                f.write("Stoofvlees,protein,classic/rich/winter,4,Gebruik bruin bier,true\n")
                f.write("Wortelstoemp,vegetable,winter/classic,8,Muskaatnoot is essentieel,false\n")
                f.write("Frietjes,carbohydrate,crispy/salty,2,Dubbel bakken!,true\n")
            print("Created ingredients.csv. Try running: python convert_data.py ingredients.csv recepten.json")
    else:
        convert_csv_to_json(sys.argv[1], sys.argv[2])
