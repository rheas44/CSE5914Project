import torch
import json
from torch_geometric.data import Data

def load_recipe_data(file_path="data.txt"):
    with open(file_path, 'r', encoding='utf-8') as f:
        recipes = [json.loads(line) for line in f]

    node_names = []
    node_features = []
    node_map = {}  # To map names to node indices
    edges = []

    # Processing nodes
    for recipe in recipes:
        recipe_name = recipe["_source"]["title"]
        recipe_index = len(node_names)
        node_names.append(recipe_name)

        # Extract nutrition info, handling missing values
        macros = recipe["_source"].get("macros", {})
        calories = macros.get("calories", 0)
        protein = macros.get("protein_g", 0)
        fat = macros.get("fat_total_g", 0)
        carbs = macros.get("carbohydrates_total_g", 0)

        node_features.append([calories, protein, fat, carbs])
        node_map[recipe_name] = recipe_index

        # Add ingredients as nodes
        for ingredient in recipe["_source"]["ingredients"]:
            ingredient_name = ingredient["name"].lower()
            if ingredient_name not in node_map:
                node_index = len(node_names)
                node_names.append(ingredient_name)
                node_features.append([0, 0, 0, 0])  # No direct nutrition data for ingredients
                node_map[ingredient_name] = node_index
            else:
                node_index = node_map[ingredient_name]

            # Create edges (ingredient → recipe)
            edges.append([node_index, recipe_index])
    
    edge_index = torch.tensor(edges, dtype=torch.long).t().contiguous()
    node_features = torch.tensor(node_features, dtype=torch.float)

    # Debugging
    print(f"\n🔹 Loaded {len(node_names)} nodes")
    print(f"🔹 Feature matrix shape: {node_features.shape}")
    print(f"🔹 Edge index shape: {edge_index.shape}")

    return Data(x=node_features, edge_index=edge_index)
