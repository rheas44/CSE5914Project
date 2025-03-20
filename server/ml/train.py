import torch
import torch.nn.functional as F
import torch.optim as optim
from sklearn.metrics import classification_report, confusion_matrix
from graph_model import GCN, GAT
from data_loader import load_recipe_graph
from recipe_modifier import suggest_modifications, adjust_category_weights
import numpy as np

# FDA values for denormalization (must match those in data_loader)
FDA_VALUES = {
    "calories": 2000,
    "total_fat": 70,
    "saturated_fat": 20,
    "cholesterol": 300,
    "sodium": 2300,
    "total_carbs": 275,
    "fiber": 28,
    "sugar": 50,
    "protein": 50
}

def train_model(model, data, labels, num_recipes, epochs=100, lr=0.01):
    optimizer = optim.Adam(model.parameters(), lr=lr, weight_decay=5e-4)
    model.train()
    for epoch in range(epochs):
        optimizer.zero_grad()
        out = model(data.x, data.edge_index)
        # Only compute loss on recipe nodes
        loss = F.cross_entropy(out[:num_recipes], labels)
        loss.backward()
        optimizer.step()
        if epoch % 10 == 0:
            print(f"Epoch {epoch}: Loss {loss.item():.4f}")
    return model

def train():
    data = load_recipe_graph("final_recipes_v2.json")
    num_recipes = data.num_recipes
    print("\nNumber of Recipes:", num_recipes)
    
    # Obtain user health priority and adjust category weights via the LLM-based modifier
    user_priority = input("Enter your health priority (e.g., 'low sugar, high protein'): ").strip().lower()
    category_weights = adjust_category_weights(user_priority)
    # Ensure calories are penalized if necessary
    if category_weights.get("calories", 0) > 0:
        category_weights["calories"] *= -1
    print(f"Adjusted Category Weights: {category_weights}")
    
    # Our node features (first num_recipes nodes) are in order:
    # [calories, total_fat, saturated_fat, cholesterol, sodium, total_carbs, fiber, sugar, protein]
    weights = torch.tensor([
        category_weights.get("calories", 0),
        category_weights.get("total fat", 0),
        category_weights.get("saturated fat", 0),
        category_weights.get("cholesterol", 0),
        category_weights.get("sodium", 0),
        category_weights.get("total carbs", 0),
        category_weights.get("fiber", 0),
        category_weights.get("sugar", 0),
        category_weights.get("protein", 0)
    ], dtype=torch.float)
    
    # Compute composite health scores for recipe nodes only
    recipe_health_scores = (data.x[:num_recipes] * weights).sum(dim=1)
    median_score = recipe_health_scores.median()
    labels = (recipe_health_scores > median_score).long()
    print(f"Label distribution: {torch.bincount(labels)}")
    
    # Split recipe nodes into training and test sets (80/20 split)
    num_nodes = num_recipes
    indices = torch.randperm(num_nodes)
    split = int(0.8 * num_nodes)
    train_idx = indices[:split]
    test_idx = indices[split:]
    train_mask = torch.zeros(num_nodes, dtype=torch.bool)
    test_mask = torch.zeros(num_nodes, dtype=torch.bool)
    train_mask[train_idx] = True
    test_mask[test_idx] = True
    # Save masks in data (for recipes only)
    data.train_mask = train_mask
    data.test_mask = test_mask
    
    num_features = data.x.shape[1]
    num_classes = 2  # healthy vs. not healthy
    
    # --- Train GCN model ---
    print("\nTraining GCN model...")
    gcn_model = GCN(num_features, hidden_channels=16, num_classes=num_classes)
    gcn_model = train_model(gcn_model, data, labels, num_recipes, epochs=100, lr=0.01)
    gcn_model.eval()
    out = gcn_model(data.x, data.edge_index)
    preds = out[:num_recipes].argmax(dim=1)
    
    # Evaluate GCN on the test set
    test_labels = labels[test_mask].cpu().numpy()
    test_preds = preds[test_mask].cpu().numpy()
    print("\nGCN Model Evaluation on Test Set:")
    print(classification_report(test_labels, test_preds, digits=4))
    print("Confusion Matrix:")
    print(confusion_matrix(test_labels, test_preds))
    
    # --- Train GAT model ---
    print("\nTraining GAT model...")
    gat_model = GAT(num_features, hidden_channels=16, num_classes=num_classes, heads=4)
    gat_model = train_model(gat_model, data, labels, num_recipes, epochs=100, lr=0.005)
    gat_model.eval()
    out_gat = gat_model(data.x, data.edge_index)
    preds_gat = out_gat[:num_recipes].argmax(dim=1)
    test_preds_gat = preds_gat[test_mask].cpu().numpy()
    print("\nGAT Model Evaluation on Test Set:")
    print(classification_report(test_labels, test_preds_gat, digits=4))
    print("Confusion Matrix:")
    print(confusion_matrix(test_labels, test_preds_gat))
    
    # List healthy recipes from the test set (GAT predictions)
    print("\nHealthy recipes from test set (GAT):")
    healthy_indices = (preds_gat == 1).nonzero(as_tuple=True)[0]
    for i in healthy_indices:
        if i in test_idx:
            print(f"Recipe {i}: {data.recipe_names[i]}")
    
    # Let the user select a recipe (by index among recipe nodes) for LLM-based modification suggestion
    try:
        choice = int(input("\nEnter the index of the recipe you'd like to modify (from the above list): "))
    except ValueError as e:
        print("Invalid input.")
        return None, data
    
    selected_recipe = data.recipe_names[choice]
    ingredients = data.recipe_ingredients[choice] if hasattr(data, "recipe_ingredients") else []
    macros = {
        "calories": data.x[choice, 0].item() * FDA_VALUES["calories"],
        "total_fat": data.x[choice, 1].item() * FDA_VALUES["total_fat"],
        "saturated_fat": data.x[choice, 2].item() * FDA_VALUES["saturated_fat"],
        "cholesterol": data.x[choice, 3].item() * FDA_VALUES["cholesterol"],
        "sodium": data.x[choice, 4].item() * FDA_VALUES["sodium"],
        "total_carbs": data.x[choice, 5].item() * FDA_VALUES["total_carbs"],
        "fiber": data.x[choice, 6].item() * FDA_VALUES["fiber"],
        "sugar": data.x[choice, 7].item() * FDA_VALUES["sugar"],
        "protein": data.x[choice, 8].item() * FDA_VALUES["protein"]
    }
    
    try:
        modifications = suggest_modifications(selected_recipe, ingredients, macros, user_priority)
        print(f"\nSuggested Modifications for {selected_recipe}:\n{modifications}")
    except Exception as e:
        print("Error in LLM modification suggestion:", e)
    
    return None, data

if __name__ == '__main__':
    trained_model, graph_data = train()
