import json
import torch
from torch_geometric.data import Data

# FDA Daily Values for the nine nutrients:
FDA_DAILY_VALUES = {
    "calories": 2000,         # kcal
    "total_fat": 70,          # g
    "saturated_fat": 20,      # g
    "cholesterol": 300,       # mg
    "sodium": 2300,           # mg
    "total_carbs": 275,       # g
    "fiber": 28,              # g
    "sugar": 50,              # g
    "protein": 50             # g
}

def normalize_value(value, key):
    if value is None:
        return 0.0
    return float(value) / FDA_DAILY_VALUES[key] if key in FDA_DAILY_VALUES and FDA_DAILY_VALUES[key] != 0 else 0.0

def load_recipe_graph(file_path="final_recipes_v2.json"):
    """
    Loads recipes from the new JSON file and builds a graph:
      - Each recipe becomes a node with 9 features (normalized nutrients).
      - Ingredients are parsed from the "ingredients" string (split by commas) and become additional nodes
        with dummy features (zeros).
      - An edge is created from a recipe node to each ingredient node.
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        recipes = json.load(f)
    
    recipe_features = []   # Features for recipe nodes
    edges = []
    recipe_names = []
    ingredient_nodes = {}  # Map ingredient -> node index
    
    recipe_idx = 0
    # Ingredient nodes will have indices starting after recipe nodes
    ingredient_idx = len(recipes)
    
    for recipe in recipes:
        title = recipe.get("title", "")
        recipe_names.append(title)
        
        nutrition = recipe.get("nutrition", {})
        cal           = normalize_value(nutrition.get("Calories", 0), "calories")
        total_fat     = normalize_value(nutrition.get("Total fat", 0), "total_fat")
        saturated_fat = normalize_value(nutrition.get("Saturated fat", 0), "saturated_fat")
        chol          = normalize_value(nutrition.get("Cholesterol", 0), "cholesterol")
        sodium        = normalize_value(nutrition.get("Sodium", 0), "sodium")
        total_carbs   = normalize_value(nutrition.get("Total carbs", 0), "total_carbs")
        fiber         = normalize_value(nutrition.get("Fiber", 0), "fiber")
        sugar         = normalize_value(nutrition.get("Sugar", 0), "sugar")
        protein       = normalize_value(nutrition.get("Protein", 0), "protein")
        
        recipe_features.append([cal, total_fat, saturated_fat, chol, sodium, total_carbs, fiber, sugar, protein])
        
        # Process ingredients: split by comma, strip whitespace, and lowercase
        ingredients_str = recipe.get("ingredients", "")
        ingredients_list = [ing.strip().lower() for ing in ingredients_str.split(",") if ing.strip()]
        for ing in ingredients_list:
            if ing not in ingredient_nodes:
                ingredient_nodes[ing] = ingredient_idx
                ingredient_idx += 1
            edges.append([recipe_idx, ingredient_nodes[ing]])
        
        recipe_idx += 1
    
    # Total number of recipe nodes and ingredient nodes:
    num_recipes = len(recipes)
    num_ingredient_nodes = ingredient_idx - num_recipes
    
    # Convert recipe features to tensor
    recipe_tensor = torch.tensor(recipe_features, dtype=torch.float)
    # Create ingredient features (dummy zeros)
    ingredient_tensor = torch.zeros((num_ingredient_nodes, 9), dtype=torch.float)
    # Concatenate to form the complete node feature matrix
    x = torch.cat([recipe_tensor, ingredient_tensor], dim=0)
    
    # Build edge_index tensor
    if edges:
        edge_index = torch.tensor(edges, dtype=torch.long).t().contiguous()
    else:
        edge_index = torch.empty((2, 0), dtype=torch.long)
    
    data = Data(x=x, edge_index=edge_index)
    data.recipe_names = recipe_names
    # Store list of ingredients for each recipe (only for recipe nodes)
    data.recipe_ingredients = []
    for recipe in recipes:
        ingredients_str = recipe.get("ingredients", "")
        ingredients_list = [ing.strip() for ing in ingredients_str.split(",") if ing.strip()]
        data.recipe_ingredients.append(ingredients_list)
    
    # Save number of recipe nodes for training/evaluation (first nodes only)
    data.num_recipes = num_recipes
    return data
