import requests
import json

# Replace these with your actual API keys
API_NINJAS_API_KEY = "xJCEWqku3gm6PbyLpKz81Q==7hFcpjBgXa4psXtB"
NUTRITIONIX_APP_ID = "1d6df5d9"
NUTRITIONIX_APP_KEY = "ee31f1a820b00d168a9c5258f6674bf8"

API_NINJAS_RECIPE_URL = "https://api.api-ninjas.com/v1/recipe?query="
NUTRITIONIX_URL = "https://trackapi.nutritionix.com/v2/natural/nutrients"

# Define a custom exception for usage limit issues
class UsageLimitExceededException(Exception):
    pass

def parse_ingredients(raw_ingredients):
    """
    Parse the raw ingredients string by removing semicolons and replacing pipes with commas.
    For example:
      "1/4 c Olive oil|2 Chicken breasts|...|2 tb Tarragon; chopped|..."
    becomes:
      "1/4 c Olive oil, 2 Chicken breasts, ..., 2 tb Tarragon chopped, ..."
    """
    # Remove semicolons
    cleaned = raw_ingredients.replace(";", "")
    # Replace pipes with a comma and a space
    parsed = cleaned.replace("|", ", ")
    return parsed

def get_recipes(query):
    """
    Calls the API Ninjas recipe API with the given query and returns the first 10 recipes.
    """
    url = API_NINJAS_RECIPE_URL + query
    print("Requesting:", url)
    headers = {"X-Api-Key": API_NINJAS_API_KEY}
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        if isinstance(data, dict) and "items" in data:
            recipes = data["items"]
        elif isinstance(data, list):
            recipes = data
        else:
            recipes = []
        return recipes[:5]  # Use only the first 10 recipes for testing
    else:
        print("Error fetching recipes:", response.status_code, response.text)
        return []

def get_nutrition(ingredients_string):
    """
    Calls the Nutritionix API with the provided ingredients string.
    Aggregates the following nutrients:
      - Calories, Total fat, Saturated fat, Trans fat,
        Polyunsaturated fat, Monounsaturated fat, Cholesterol,
        Sodium, Total carbs, Fiber, Sugar, and Protein.
    All units (except calories) are assumed to be in grams.
    """
    headers = {
        "Content-Type": "application/json",
        "x-app-id": NUTRITIONIX_APP_ID,
        "x-app-key": NUTRITIONIX_APP_KEY
    }
    data = {"query": ingredients_string}
    response = requests.post(NUTRITIONIX_URL, headers=headers, json=data)
    if response.status_code == 200:
        nutrition_data = response.json()
        # Initialize aggregated nutrition values
        aggregated = {
            "Calories": 0.0,
            "Total fat": 0.0,
            "Saturated fat": 0.0,
            "Trans fat": 0.0,
            "Polyunsaturated fat": 0.0,
            "Monounsaturated fat": 0.0,
            "Cholesterol": 0.0,
            "Sodium": 0.0,
            "Total carbs": 0.0,
            "Fiber": 0.0,
            "Sugar": 0.0,
            "Protein": 0.0
        }
        nutrition_fields = {
            "Calories": "nf_calories",
            "Total fat": "nf_total_fat",
            "Saturated fat": "nf_saturated_fat",
            "Trans fat": "nf_trans_fat",
            "Polyunsaturated fat": "nf_polyunsaturated_fat",
            "Monounsaturated fat": "nf_monounsaturated_fat",
            "Cholesterol": "nf_cholesterol",
            "Sodium": "nf_sodium",
            "Total carbs": "nf_total_carbohydrate",
            "Fiber": "nf_dietary_fiber",
            "Sugar": "nf_sugars",
            "Protein": "nf_protein"
        }
        foods = nutrition_data.get("foods", [])
        for food in foods:
            for key, api_field in nutrition_fields.items():
                aggregated[key] += float(food.get(api_field) or 0)
        return aggregated
    elif response.status_code == 401 and "usage limits exceeded" in response.text:
        print("Error fetching nutrition:", response.status_code, response.text)
        raise UsageLimitExceededException("Nutritionix usage limits exceeded")
    else:
        print("Error fetching nutrition:", response.status_code, response.text)
        return {}

def main():
    # Define a list of recipe keywords
    recipe_words = [
        # Main Ingredients
        "Chicken", "Beef", "Pork", "Fish", "Shrimp", "Tofu", "Egg", "Cheese", 
        "Tomato", "Onion", "Garlic", "Mushroom", "Spinach", "Broccoli", "Avocado",
        # Cuisine Types
        "Italian", "Mexican", "Chinese", "Indian", "Thai", "Greek", "French", 
        "Japanese", "Korean", "Mediterranean",
        # Dish Types
        "Soup", "Salad", "Stew", "Stir-fry", "Casserole", "Pasta", "Sandwich", 
        "Wrap", "Curry", "Bowl", "Pizza", "Tacos", "Burrito", "Pie", "Cake",
        # Cooking Methods
        "Baked", "Roasted", "Grilled", "Fried", "Steamed", "Boiled", "Sautéed", 
        "Slow-cooked", "Smoked", "Glazed",
        # Descriptive Words
        "Spicy", "Sweet", "Creamy", "Crispy", "Savory", "Juicy", "Tender", 
        "Crunchy", "Zesty", "Hearty",
        # Dietary Labels
        "Vegan", "Vegetarian", "Gluten-Free", "Low-Carb", 
        "Dairy-Free", "High-Protein"
    ]
    
    # For testing, use only the first 3 keywords
    keywords_to_test = recipe_words
    aggregated_recipes = []
    
    try:
        for keyword in keywords_to_test:
            print(f"\nProcessing keyword: {keyword}")
            recipes = get_recipes(keyword)
            if not recipes:
                print(f"No recipes found for {keyword}")
                continue
            
            for recipe in recipes:
                title = recipe.get("title", "")
                raw_ingredients = recipe.get("ingredients", "")
                servings = recipe.get("servings", "")
                instructions = recipe.get("instructions", "")
                
                # Discard the recipe entirely if the ingredients field is empty
                if not raw_ingredients.strip():
                    print(f"Recipe '{title}' for keyword '{keyword}' has no ingredients; discarding recipe.")
                    continue
                
                # Parse the ingredients string
                parsed_ingredients = parse_ingredients(raw_ingredients)
                
                # Get aggregated nutrition data for these ingredients
                nutrition = get_nutrition(parsed_ingredients)
                
                # Create the aggregated recipe object
                aggregated_recipe = {
                    "keyword": keyword,
                    "title": title,
                    "ingredients": parsed_ingredients,
                    "servings": servings,
                    "instructions": instructions,
                    "nutrition": nutrition
                }
                aggregated_recipes.append(aggregated_recipe)
    except UsageLimitExceededException as e:
        print("\nUsage limits have been exceeded. Saving the recipes processed so far.")
    
    # Write the final aggregated recipes to a JSON file
    with open("final_recipes_v2.json", "w") as outfile:
        json.dump(aggregated_recipes, outfile, indent=2)
    
    print("\nFinal recipes have been written to final_recipes_v2.json")

if __name__ == "__main__":
    main()
