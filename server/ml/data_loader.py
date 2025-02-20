import torch
import json
from torch_geometric.data import Data

def load_recipe_data(file_path="data.txt"):
    with open(file_path, 'r', encoding='utf-8') as f:
        recipes = [json.loads(line) for line in f]

    node_features = []
    edges = []

    for recipe in recipes:
        macros = recipe["_source"].get("macros", {})
        calories = macros.get("calories", 0)
        protein = macros.get("protein_g", 0)
        sugar = macros.get("sugar_g", 0)
        carbs = macros.get("carbohydrates_total_g", 0)
        sodium = macros.get("sodium_mg", 0)

        node_features.append([calories, protein, sugar, carbs, sodium])

        # Add edges based on ingredient relationships
        for ingredient in recipe["_source"].get("ingredients", []):
            edges.append([len(node_features) - 1, len(node_features)])

    edge_index = torch.tensor(edges, dtype=torch.long).t().contiguous()
    node_features = torch.tensor(node_features, dtype=torch.float)

    print(f"\n🔹 Loaded {len(node_features)} nodes")
    print(f"🔹 Feature matrix shape: {node_features.shape}")
    print(f"🔹 Edge index shape: {edge_index.shape}")

    return Data(x=node_features, edge_index=edge_index)
