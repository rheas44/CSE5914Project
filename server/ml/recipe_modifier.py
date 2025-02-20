import ollama

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

    The weights should sum to 1.0. Example format:
    {{
        "calories": 0.3,
        "protein": 0.2,
        "sugar": 0.1,
        "carbs": 0.2,
        "sodium": 0.2
    }}
    Only return JSON with no extra text.
    """

    try:
        response = ollama.chat(model="mistral", messages=[{"role": "user", "content": prompt}])
        parsed_response = json.loads(response["message"]["content"])  # Try parsing as JSON

        if isinstance(parsed_response, dict) and all(key in parsed_response for key in ["calories", "protein", "sugar", "carbs", "sodium"]):
            return parsed_response  # ✅ Success
        else:
            print("⚠️ Ollama returned an unexpected format. Using default weights.")

    except (json.JSONDecodeError, KeyError, TypeError):
        print("⚠️ Failed to parse Ollama's response. Using default weights.")

    # Default equal weights if parsing fails
    return {"calories": 1.0, "protein": 1.0, "sugar": 1.0, "carbs": 1.0, "sodium": 1.0}


def suggest_modifications(recipe):
    """
    Uses Ollama to suggest modifications for unhealthy recipes.
    """
    prompt = f"""
    The following recipe has high values in some nutritional aspects:

    - Calories: {recipe[0]} kcal
    - Protein: {recipe[1]} g
    - Sugar: {recipe[2]} g
    - Carbs: {recipe[3]} g
    - Sodium: {recipe[4]} mg

    Suggest healthier modifications while maintaining taste and balance.
    Provide a short list of modifications.
    """

    response = ollama.chat(model="mistral", messages=[{"role": "user", "content": prompt}])
    return response["message"]["content"]
