import json
import ollama

# Load recipes from the JSON file
def load_recipes(filename):
    with open(filename, "r", encoding="utf-8") as f:
        return json.load(f)

# Find a recipe by name
def find_recipe(recipes, recipe_name):
    for recipe in recipes:
        if recipe["title"].lower() == recipe_name.lower():
            return recipe
    return None

# Suggest modifications using Ollama
def suggest_modifications(recipe, user_priority):
    prompt = f"""
    The user wants to prioritize: {user_priority}.
    
    Here is the recipe they are trying to modify:

    🥘 **Recipe Name:** {recipe["title"]}

    🍽 **Ingredients:**
    {recipe["ingredients"]}

    🔍 **Nutritional Breakdown:**
    - Calories: {recipe["nutrition"]["Calories"]} kcal
    - Protein: {recipe["nutrition"]["Protein"]} g
    - Sugar: {recipe["nutrition"]["Sugar"]} g
    - Carbs: {recipe["nutrition"]["Total carbs"]} g
    - Sodium: {recipe["nutrition"]["Sodium"]} mg

    📝 **Task:** Suggest modifications to make this recipe align with the user's health goals while preserving taste. 
    Return a list of **3-5 specific modifications** based on the recipe ingredients.
    """

    response = ollama.chat(model="mistral", messages=[{"role": "user", "content": prompt}])
    return response["message"]["content"]

if __name__ == "__main__":
    # Load recipe data
    recipes = load_recipes("final_recipes_v2.json")

    # Get user input for recipe selection
    recipe_name = input("Enter the name of the recipe you want to modify: ").strip()
    recipe = find_recipe(recipes, recipe_name)

    if recipe:
        print(f"\n✅ Found Recipe: {recipe['title']}")
        print(f"📖 Instructions: {recipe['instructions']}\n")

        # Get user input for modifications
        user_priority = input("Enter your health priority (e.g., 'low sugar, high protein'): ").strip().lower()
        
        # Get suggested modifications
        modifications = suggest_modifications(recipe, user_priority)
        print("\n🛠 Suggested Modifications:")
        print(modifications)
    else:
        print("❌ Recipe not found. Please try again.")
