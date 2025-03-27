import ollama
import json

def adjust_category_weights(user_priority):
    """
    Uses Ollama to determine category weights based on user health priorities.
    """
    prompt = f"""
    The user wants to prioritize: {user_priority}.
    Return a JSON object with weights for the following categories:
    - calories
    - protein
    - sugar
    - carbs
    - sodium

    If a category should be **increased**, give it a **positive weight**.
    If a category should be **decreased**, give it a **negative weight**.
    Ensure that the **absolute sum of all weights adds up to 1.0**.

    Example format:
    {{
        "calories": -0.3,
        "protein": 0.4,
        "sugar": -0.2,
        "carbs": 0.1,
        "sodium": 0.0
    }}
    Only return JSON with no extra text.
    """

    try:
        response = ollama.chat(model="mistral", messages=[{"role": "user", "content": prompt}])
        parsed_response = json.loads(response["message"]["content"])  # Try parsing as JSON

        if isinstance(parsed_response, dict) and all(key in parsed_response for key in ["calories", "protein", "sugar", "carbs", "sodium"]):
            # Normalize to ensure sum of absolute values is 1.0
            abs_sum = sum(abs(v) for v in parsed_response.values())
            parsed_response = {k: v / abs_sum for k, v in parsed_response.items()}
            return parsed_response  # ✅ Success
        else:
            print("⚠️ Ollama returned an unexpected format. Using default weights.")

    except (json.JSONDecodeError, KeyError, TypeError):
        print("⚠️ Failed to parse Ollama's response. Using default weights.")

    # Default balanced weights ensuring sum of absolute values is 1.0
    default_weights = {"calories": -0.3, "protein": 0.4, "sugar": -0.2, "carbs": 0.1, "sodium": 0.0}
    abs_sum = sum(abs(v) for v in default_weights.values())
    return {k: v / abs_sum for k, v in default_weights.items()}

def suggest_modifications(recipe_name, ingredients, macros, user_priority):
    """
    Uses Ollama to suggest personalized modifications based on user preferences and the actual recipe.
    """
    prompt = f"""
    The user wants to prioritize: {user_priority}.
    
    Here is the recipe they are trying to modify:

    🥘 **Recipe Name:** {recipe_name}

    🍽 **Ingredients:**
    {", ".join([f"{ingredient['name']} ({ingredient['qty']} {ingredient['unit']})" for ingredient in ingredients])}

    🔍 **Nutritional Breakdown:**
    - Calories: {macros["calories"]} kcal
    - Protein: {macros["protein_g"]} g
    - Sugar: {macros["sugar_g"]} g
    - Carbs: {macros["carbohydrates_total_g"]} g
    - Sodium: {macros["sodium_mg"]} mg

    📝 **Task:** Suggest modifications to make this recipe align with the user's health goals while preserving taste. 
    Return a list of **3-5 specific modifications** based on the recipe ingredients.
    """

    response = ollama.chat(model="mistral", messages=[{"role": "user", "content": prompt}])
    return response["message"]["content"]

