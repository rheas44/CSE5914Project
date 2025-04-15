from ml.recipe_modifier import suggest_modifications

# Mock recipe data
mock_recipe = {
    "title": "Spicy Chicken Bowl",
    "ingredients": [
        {"name": "chicken breast", "qty": 1, "unit": "lb"},
        {"name": "brown rice", "qty": 1, "unit": "cup"},
        {"name": "broccoli", "qty": 1.5, "unit": "cups"},
        {"name": "sriracha", "qty": 2, "unit": "tbsp"}
    ],
    "nutrition": {
        "Calories": 600,
        "Protein": 45,
        "Sugar": 8,
        "Total carbs": 50,
        "Sodium": 800
    }
}

mock_goals = "high protein, low sugar"

# Build macros dictionary the same way as your Flask route does
macros = {
    "calories": mock_recipe["nutrition"].get("Calories", 0),
    "protein_g": mock_recipe["nutrition"].get("Protein", 0),
    "sugar_g": mock_recipe["nutrition"].get("Sugar", 0),
    "carbohydrates_total_g": mock_recipe["nutrition"].get("Total carbs", 0),
    "sodium_mg": mock_recipe["nutrition"].get("Sodium", 0)
}

# Run and print result
if __name__ == "__main__":
    result = suggest_modifications(
        recipe_name=mock_recipe["title"],
        ingredients=mock_recipe["ingredients"],
        macros=macros,
        user_priority=mock_goals
    )
    print("=== MODIFICATION SUGGESTIONS ===")
    print(result)
