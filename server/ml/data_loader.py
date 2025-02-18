# data_loader.py - Generates mock graph data
import torch
from torch_geometric.data import Data

def load_mock_data():
    # Nodes (0 = Chicken, 1 = Protein, 2 = Salad Recipe, 3 = Olive Oil, 4 = Fat)
    node_names = ["chicken", "protein", "grilled_chicken_salad", "olive oil", "fat"]
    print("in load data")
    # Example Edges:
    # Chicken → Protein (Ingredient contains nutrient)
    # Protein → Grilled Chicken Salad (Recipe contains protein)
    # Olive Oil → Fat (Ingredient contains fat)
    # Fat → Grilled Chicken Salad (Recipe contains fat)
    edge_index = torch.tensor([[0, 1, 2, 3], [1, 2, 3, 4]], dtype=torch.long)

    # Manually created feature vectors (Example: Calories, Carbs, Protein, Fat)
    node_features = torch.tensor([
        [120, 0, 27, 3],  # Chicken (120 cal, 0 carbs, 27g protein, 3g fat)
        [0, 0, 1, 0],      # Protein (No calories, standalone nutrient)
        [300, 20, 35, 12], # Grilled Chicken Salad (Recipe)
        [119, 0, 0, 14],   # Olive Oil (Mostly fat)
        [0, 0, 0, 1]       # Fat (Standalone nutrient)
    ], dtype=torch.float)

    return Data(x=node_features, edge_index=edge_index)
