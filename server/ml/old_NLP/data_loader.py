import torch
import json
from torch_geometric.data import Data

FDA_DAILY_VALUES = {
    "calories": 2000,
    "protein_g": 50,
    "sugar_g": 50,
    "carbohydrates_total_g": 275,
    "sodium_mg": 2300
}

def normalize_value(value, key):
    return value / FDA_DAILY_VALUES[key] if key in FDA_DAILY_VALUES and FDA_DAILY_VALUES[key] else 0

def load_recipe_graph(file_path="data.txt"):
    with open(file_path, 'r', encoding='utf-8') as f:
        recipes = [json.loads(line) for line in f]

    node_features = []
    edges = []
    recipe_names = []
    ingredient_nodes = {}

    recipe_idx = 0
    ingredient_idx = len(recipes)  # Start ingredient nodes after recipes

    for recipe in recipes:
        source = recipe["_source"]
        recipe_names.append(source["title"])

        # Normalize nutrition data
        macros = source.get("macros", {})
        calories = normalize_value(macros.get("calories", 0), "calories")
        protein = normalize_value(macros.get("protein_g", 0), "protein_g")
        sugar = normalize_value(macros.get("sugar_g", 0), "sugar_g")
        carbs = normalize_value(macros.get("carbohydrates_total_g", 0), "carbohydrates_total_g")
        sodium = normalize_value(macros.get("sodium_mg", 0), "sodium_mg")

        node_features.append([calories, protein, sugar, carbs, sodium])

        # Add ingredient connections
        for ingredient in source.get("ingredients", []):
            ingredient_name = ingredient["name"].lower()
            if ingredient_name not in ingredient_nodes:
                ingredient_nodes[ingredient_name] = ingredient_idx
                ingredient_idx += 1

            edges.append([recipe_idx, ingredient_nodes[ingredient_name]])

        recipe_idx += 1

    edge_index = torch.tensor(edges, dtype=torch.long).t().contiguous()
    node_features = torch.tensor(node_features, dtype=torch.float)

    data = Data(x=node_features, edge_index=edge_index)
    data.recipe_names = recipe_names
    return data
