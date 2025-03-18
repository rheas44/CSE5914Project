import torch
import torch.nn.functional as F
import torch.optim as optim
from sklearn.metrics import classification_report, confusion_matrix
from graph_model import GAT
from data_loader import load_recipe_graph
from recipe_modifier import suggest_modifications, adjust_category_weights

# FDA reference values for denormalization
FDA_VALUES = {
    "calories": 2000,   # kcal
    "protein": 50,      # g
    "sugar": 50,        # g
    "carbs": 275,       # g
    "sodium": 2300      # mg
}

# 🚨 **Hard Filter: Max Calories Allowed**
MAX_CALORIES = 2000  

def train():
    # Load Data
    data = load_recipe_graph("data.txt")

    print("\n Number of Recipes (Before Filtering):", data.x.shape[0])
    
    # **Denormalize Calories to Apply Hard Filter**
    actual_calories = data.x[:, 0] * FDA_VALUES["calories"]
    valid_indices = (actual_calories <= MAX_CALORIES).nonzero(as_tuple=True)[0]  # Keep only valid recipes

    # **Filter Data**
    data.x = data.x[valid_indices]
    data.recipe_names = [data.recipe_names[i] for i in valid_indices]
    
    print(" Number of Recipes (After Filtering ≤ 2000 kcal):", data.x.shape[0])

    # User Preference Input
    user_priority = input("Enter your health priority (e.g., 'low sugar, high protein'): ").strip().lower()
    category_weights = adjust_category_weights(user_priority)
    
    # 🚨 **Manually Ensure Calories Are Penalized**
    if category_weights["calories"] > 0:
        category_weights["calories"] *= -1  

    print(f" Adjusted Category Weights: {category_weights}")

    # Extract Features & Compute Health Scores
    health_scores = (
        data.x[:, 0] * category_weights["calories"] +  
        data.x[:, 1] * category_weights["protein"] +  
        data.x[:, 2] * category_weights["sugar"] +  
        data.x[:, 3] * category_weights["carbs"] +  
        data.x[:, 4] * category_weights["sodium"]  
    )

    # Normalize Scores
    min_score, max_score = health_scores.min(), health_scores.max()
    if max_score - min_score > 0:
        health_scores = (health_scores - min_score) / (max_score - min_score)
    else:
        health_scores = torch.zeros_like(health_scores)

    print(f"\n Health Scores - Min: {health_scores.min():.4f}, Max: {health_scores.max():.4f}, Mean: {health_scores.mean():.4f}, Std Dev: {health_scores.std():.4f}")

    # **Sort & Get Top 10 Healthiest Recipes**
    top_10_indices = torch.argsort(health_scores, descending=True)[:10]

    print("\n **Top 10 Healthiest Recipes (≤ 2000 kcal):**")
    for i, idx in enumerate(top_10_indices):
        cal   = data.x[idx, 0].item() * FDA_VALUES["calories"]
        prot  = data.x[idx, 1].item() * FDA_VALUES["protein"]
        sug   = data.x[idx, 2].item() * FDA_VALUES["sugar"]
        carb  = data.x[idx, 3].item() * FDA_VALUES["carbs"]
        sod   = data.x[idx, 4].item() * FDA_VALUES["sodium"]
        
        print(f"[{i+1}] {data.recipe_names[idx]}")
        print(f"    Calories: {cal:.1f} kcal | Protein: {prot:.1f}g | Sugar: {sug:.1f}g | Carbs: {carb:.1f}g | Sodium: {sod:.1f}mg")

    # **Ask the User to Select a Recipe for Modification**
    try:
        choice = int(input("\nEnter the number of the recipe you'd like to modify (1-10): ")) - 1
        if choice < 0 or choice >= 10:
            raise ValueError("Invalid selection. Please choose a valid number.")
    except ValueError as e:
        print(f"⚠️ {e}")
        return

    # **Retrieve Selected Recipe**
    selected_idx = top_10_indices[choice]
    selected_recipe = data.recipe_names[selected_idx]
    ingredients = data.recipe_ingredients[selected_idx] if hasattr(data, "recipe_ingredients") else []
    macros = {
        "calories": data.x[selected_idx, 0].item() * FDA_VALUES["calories"],
        "protein_g": data.x[selected_idx, 1].item() * FDA_VALUES["protein"],
        "sugar_g": data.x[selected_idx, 2].item() * FDA_VALUES["sugar"],
        "carbohydrates_total_g": data.x[selected_idx, 3].item() * FDA_VALUES["carbs"],
        "sodium_mg": data.x[selected_idx, 4].item() * FDA_VALUES["sodium"]
    }

    # ✅ Call LLM to suggest modifications for the selected recipe
    modifications = suggest_modifications(selected_recipe, ingredients, macros, user_priority)
    print(f"\n Suggested Modifications for Selected Recipe:\n{modifications}")

    return None, None

if __name__ == '__main__':
    trained_model, graph_data = train()
