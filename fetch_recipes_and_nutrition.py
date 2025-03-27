import os
import requests
import json

# Replace these with your actual API keys
API_NINJAS_API_KEY = "xJCEWqku3gm6PbyLpKz81Q==7hFcpjBgXa4psXtB"
# NUTRITIONIX_APP_ID = "1d6df5d9" brianfoster03junk
# NUTRITIONIX_APP_KEY = "ee31f1a820b00d168a9c5258f6674bf8" brianfoster03junk

NUTRITIONIX_APP_ID = "38befff8" #brianfoster03
NUTRITIONIX_APP_KEY = "f2ac636a2bfb8b6ab91552bcbbf5b2dc" #brianfoster03

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
    cleaned = raw_ingredients.replace(";", "")
    parsed = cleaned.replace("|", ", ")
    return parsed

def get_recipes(query):
    """
    Calls the API Ninjas recipe API with the given query and returns the first 5 recipes.
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
        return recipes[:5]
    else:
        print("Error fetching recipes:", response.status_code, response.text)
        return []

def get_nutrition(ingredients_string):
    """
    Calls the Nutritionix API with the provided ingredients string.
    Aggregates nutrients:
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
    # "Chicken", "Beef", "Pork", "Fish", "Shrimp", "Tofu", "Egg", "Cheese",  "Tomato", "Onion", "Garlic", "Mushroom", "Spinach", "Broccoli", "Avocado", "Italian", "Mexican", "Chinese", "Indian", "Thai", "Greek", "French", "Japanese", "Korean", "Mediterranean", "Soup", "Salad", "Stew", "Stir-fry", "Casserole", "Pasta", "Sandwich", "Wrap", "Curry", "Bowl", "Pizza", "Tacos", "Burrito", "Pie", "Cake", "Baked", 
    # recipe_words = ["Roasted", "Grilled", "Fried", "Steamed", 
    #     "Boiled", "Sautéed", "Slow-cooked", "Smoked", "Glazed", "Spicy", "Sweet", 
    #     "Creamy", "Crispy", "Savory", "Juicy", "Tender", "Crunchy", "Zesty", "Hearty", 
    #     "Vegan", "Vegetarian", "Gluten-Free", "Low-Carb", "Dairy-Free", "High-Protein",
        #     "Egg", "Cheese", "Tomato", "Onion",
        # "Garlic", "Mushroom", "Spinach",
        # "Broccoli", "Avocado", "Rice", "Pasta", "Quinoa", "Lentils", "Beans",
        # "Potatoes", "Carrots", "Celery", "Bell pepper", "Zucchini", "Eggplant", "Kale", "Cabbage", "Corn", "Apple",
        # "Banana", "Strawberry", "Blueberry", "Orange", "Lemon", "Lime", "Coconut", "Almond", "Walnut", "Pistachio",
        # "Oatmeal", "Yogurt", "Bread", "Burger", "Soup", "Salad", "Curry", "Stew", "Pie", "Cake",
        # "Chicken and rice", "Beef and broccoli", "Pork and beans", "Shrimp pasta", 
    # ]
    # 50 standalone keywords (ingredients, dish types, or food items)
    
    #TODO: Add these when API calls reset (3/25/25)
    recipe_words = [ "Tofu stir-fry",
        "Egg salad", "Cheese pizza", "Tomato soup", "Onion rings", "Garlic bread",
        "Mushroom risotto", "Spinach salad", "Broccoli cheddar soup", "Avocado toast", "Rice pudding",
        "Pasta primavera", "Quinoa salad", "Lentil stew", "Bean chili", "Potato gratin",
        "Carrot cake", "Celery soup", "Bell pepper stir-fry", "Zucchini noodles", "Eggplant parmesan",
        "Kale smoothie", "Cabbage rolls", "Corn chowder", "Apple pie", "Banana bread",
        "Strawberry shortcake", "Blueberry muffins", "Orange chicken", "Lemon garlic fish", "Lime cilantro rice",
        "Coconut curry", "Almond butter cookies", "Walnut brownies", "Pistachio ice cream", "Oatmeal raisin cookies",
        "Yogurt parfait", "Bread pudding", "Burger sliders", "Chicken curry", "Beef tacos",
        "Pork ribs", "Shrimp scampi", "Tofu curry", "Egg fried rice", "Cheese omelette"
    ]

    
#     recipe_words = [
#     "BBQ Chicken",
#     "Slow Cooker Beef",
#     "Grilled Pork",
#     "Roasted Vegetables",
#     "Fried Tofu",
#     "Thai Curry",
#     "Indian Korma",
#     "Japanese Ramen",
#     "Mediterranean Salad",
#     "Italian Pasta",
#     "Breakfast Smoothie",
#     "Lunch Wrap",
#     "Dinner Stew",
#     "Snack Bars",
#     "Dessert Cake",
#     "Gluten-Free Bread",
#     "Vegan Burger",
#     "Keto Pizza",
#     "Low-Carb Salad",
#     "High-Protein Bowl",
#     "Spicy Stir-fry",
#     "Creamy Soup",
#     "Crispy Appetizer",
#     "Sweet and Savory Dish",
#     "Herb-Crusted Recipe",
#     "Spicy Thai Curry",
#     "Low-Carb Vegan Wrap"
# ]

    
    # Use all keywords for aggregation
    keywords_to_test = recipe_words
    new_recipes = []
    
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
                
                if not raw_ingredients.strip():
                    print(f"Recipe '{title}' for keyword '{keyword}' has no ingredients; discarding recipe.")
                    continue
                
                parsed_ingredients = parse_ingredients(raw_ingredients)
                nutrition = get_nutrition(parsed_ingredients)
                
                aggregated_recipe = {
                    "keyword": keyword,
                    "title": title,
                    "ingredients": parsed_ingredients,
                    "servings": servings,
                    "instructions": instructions,
                    "nutrition": nutrition
                }
                new_recipes.append(aggregated_recipe)
    except UsageLimitExceededException as e:
        print("\nUsage limits have been exceeded. Saving the recipes processed so far.")
    
    # Load existing recipes from final_recipes_v2.json if available
    output_file = "final_recipes_v2.json"
    if os.path.exists(output_file):
        try:
            with open(output_file, "r") as infile:
                existing_recipes = json.load(infile)
            # Build a set of normalized titles for duplicate checking
            existing_titles = {recipe.get("title", "").strip().lower() for recipe in existing_recipes}
        except Exception as e:
            print("Error reading existing JSON file:", e)
            existing_recipes = []
            existing_titles = set()
    else:
        existing_recipes = []
        existing_titles = set()

    # Append new recipes to the existing list, skipping duplicates
    for new_recipe in new_recipes:
        title = new_recipe.get("title", "").strip().lower()
        if title not in existing_titles:
            existing_recipes.append(new_recipe)
            existing_titles.add(title)
        else:
            print(f"Recipe '{new_recipe.get('title')}' already exists; skipping duplicate.")

    # Write the combined list back to the JSON file
    with open(output_file, "w") as outfile:
        json.dump(existing_recipes, outfile, indent=2)

    
    print(f"\nFinal recipes have been appended to {output_file}")

if __name__ == "__main__":
    main()
