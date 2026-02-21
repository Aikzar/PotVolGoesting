import json
import sys
import os

def verify_json_link(file_path):
    print(f"Verifying {file_path}...")
    try:
        if not os.path.exists(file_path):
            print("❌ FILE NOT FOUND")
            sys.exit(1)
            
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        if not isinstance(data, list):
            print("❌ ROOT INVALID: Expected JSON Array")
            sys.exit(1)
            
        if len(data) == 0:
            print("❌ DATA EMPTY: No recipes found")
            sys.exit(1)
            
        # Check first item schema
        first = data[0]
        required_keys = ["id", "name", "type", "tags"]
        for k in required_keys:
            if k not in first:
                print(f"❌ SCHEMA INVALID: Missing key '{k}'")
                sys.exit(1)
                
        print(f"✅ LINK VERIFIED: Loaded {len(data)} items successfully.")
        
        # Check specific constraints
        fry_friendly = len([x for x in data if x.get('is_fry_friendly')])
        print(f"   - Fry Friendly Items: {fry_friendly}")
        
    except json.JSONDecodeError:
        print("❌ JSON ERROR: Could not parse file")
        sys.exit(1)
    except Exception as e:
        print(f"❌ UNKNOWN ERROR: {e}")
        sys.exit(1)

if __name__ == "__main__":
    verify_json_link('recepten.json')
