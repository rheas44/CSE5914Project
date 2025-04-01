import json
import requests

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
        response = requests.post(
            "http://host.docker.internal:11434/api/chat",
            json={
                "model": "mistral",
                "messages": [{"role": "user", "content": prompt}]
            },
            timeout=60
        )

        # Handle single-line JSON (since this prompt expects just one)
        data = json.loads(response.text)
        parsed_response = data["message"]["content"]
        weights = json.loads(parsed_response)

        if isinstance(weights, dict) and all(key in weights for key in ["calories", "protein", "sugar", "carbs", "sodium"]):
            abs_sum = sum(abs(v) for v in weights.values())
            return {k: v / abs_sum for k, v in weights.items()}

    except Exception as e:
        print("⚠️ Failed to parse Ollama's response. Using default weights.")
        print("🔥 Detailed error:", repr(e))

    # Fallback default
    default_weights = {"calories": -0.3, "protein": 0.4, "sugar": -0.2, "carbs": 0.1, "sodium": 0.0}
    abs_sum = sum(abs(v) for v in default_weights.values())
    return {k: v / abs_sum for k, v in default_weights.items()}


def parse_streamed_ollama_response(response_text):
    """
    Parses streamed JSON lines from Ollama and concatenates the assistant's message content.
    """
    content = ""
    for line in response_text.strip().split("\n"):
        try:
            message_obj = json.loads(line)
            content += message_obj.get("message", {}).get("content", "")
        except json.JSONDecodeError:
            continue  # Ignore malformed lines
    return content.strip()


def suggest_modifications(recipe_name, ingredients, macros, user_priority):
    """
    Uses Ollama to suggest personalized modifications based on user preferences and the actual recipe.
    """
    if isinstance(ingredients, str):
        ingredient_text = ingredients
    else:
        ingredient_text = ", ".join(
            [f"{i['name']} ({i['qty']} {i['unit']})" for i in ingredients]
        )

    prompt = f"""
    The user wants to prioritize: {user_priority}.

    Here is the recipe they are trying to modify:

    🥘 **Recipe Name:** {recipe_name}

    🍽 **Ingredients:**
    {ingredient_text}

    🔍 **Nutritional Breakdown:**
    - Calories: {macros["calories"]} kcal
    - Protein: {macros["protein_g"]} g
    - Sugar: {macros["sugar_g"]} g
    - Carbs: {macros["carbohydrates_total_g"]} g
    - Sodium: {macros["sodium_mg"]} mg

    📝 **Task:** Suggest modifications to make this recipe align with the user's health goals while preserving taste. 
    Return a list of **3-5 specific modifications** based on the recipe ingredients.
    """

    try:
        response = requests.post(
            "http://host.docker.internal:11434/api/chat",
            json={
                "model": "mistral",
                "messages": [{"role": "user", "content": prompt}]
            },
            timeout=120
        )

        print("🧾 RAW Ollama response:")
        print(response.text)

        return parse_streamed_ollama_response(response.text)

    except Exception as e:
        print("🔥 Raw HTTP Ollama error:", repr(e))
        raise e
