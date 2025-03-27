import json
import re

def extract_serving_count(servings_str):
    """
    Extracts the first integer from a servings string.
    For example, "4 Servings" returns 4, "1 Serving" returns 1.
    """
    match = re.search(r'(\d+)', servings_str)
    return int(match.group(1)) if match else None

def clean_recipes(input_file, output_file):
    # Load recipes from the input file
    with open(input_file, "r", encoding="utf-8") as f:
        recipes = json.load(f)
    
    cleaned_recipes = []
    seen_titles = set()  # To track duplicate titles (normalized)

    for recipe in recipes:
        # Get nutrition data and calories
        nutrition = recipe.get("nutrition", {})
        calories = nutrition.get("Calories", 0)
        
        # Skip if calories are 0
        if calories == 0:
            continue

        # Extract serving count from the 'servings' string
        servings_str = recipe.get("servings", "")
        serving_count = extract_serving_count(servings_str)
        # If it's a 1-serving recipe and calories exceed 2000, skip it
        if serving_count == 1 and calories > 2000:
            continue

        # Normalize the title for duplicate checking
        title = recipe.get("title", "").strip().lower()
        if title in seen_titles:
            continue  # Duplicate found; skip it.
        seen_titles.add(title)

        # If recipe passes all filters, include it in the cleaned list
        cleaned_recipes.append(recipe)
    
    # Write the cleaned recipes to the new JSON file without overwriting the old file.
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(cleaned_recipes, f, indent=2)
    
    print(f"Cleaned data written to {output_file}")

if __name__ == "__main__":
    input_file = "final_recipes_v2.json"
    output_file = "final_recipes_v2_clean.json"
    clean_recipes(input_file, output_file)
