import torch
import torch.nn.functional as F
import torch.optim as optim
from sklearn.metrics import classification_report, confusion_matrix
from graph_model import GAT  # Use GAT instead of GCN
from data_loader import load_recipe_data
from recipe_modifier import suggest_modifications, adjust_category_weights

def train():
    # Load Data
    data = load_recipe_data("data.txt")

    print("\n🔹 Number of Nodes:", data.x.shape[0])
    print("🔹 Node Features Shape:", data.x.shape)
    print("🔹 Edge Index Shape:", data.edge_index.shape)

    # User Preference Input
    user_priority = input("Enter your health priority (e.g., 'low sugar, high protein'): ").strip().lower()
    category_weights = adjust_category_weights(user_priority)
    print(f"🔄 Updated Category Weights: {category_weights}")

    # Extract Features
    calories = data.x[:, 0]
    protein = data.x[:, 1]
    sugar = data.x[:, 2]
    carbs = data.x[:, 3]
    sodium = data.x[:, 4]

    # Weighted Health Score Calculation
    health_scores = (
        (calories * category_weights["calories"]) +
        (protein * category_weights["protein"]) +
        (sugar * category_weights["sugar"]) +
        (carbs * category_weights["carbs"]) +
        (sodium * category_weights["sodium"])
    )

    # Normalize Scores (higher is worse)
    health_scores = (health_scores - health_scores.min()) / (health_scores.max() - health_scores.min())

    # Define Classification Labels
    threshold = 0.5  # User-defined threshold for "healthy" vs. "unhealthy"
    labels = (health_scores > threshold).long()

    print("\n📊 Unique Labels:", torch.unique(labels))
    print("📊 Label Counts:", torch.bincount(labels))

    # 🔹 Get indices for healthy recipes
    healthy_indices = (labels == 0).nonzero(as_tuple=True)[0]
    healthy_recipes = data.x[healthy_indices]

    # Print healthy recipes
    print("\n✅ Healthy Recipes:")
    for i, recipe in enumerate(healthy_recipes):
        print(f"[{i}] Calories: {recipe[0]:.1f} | Protein: {recipe[1]:.1f}g | Sugar: {recipe[2]:.1f}g | Carbs: {recipe[3]:.1f}g | Sodium: {recipe[4]:.1f}mg")

    # Ask the user to select a recipe for modification
    try:
        choice = int(input("\nEnter the number of the recipe you'd like to modify: "))
        if choice < 0 or choice >= len(healthy_recipes):
            raise ValueError("Invalid selection. Please choose a valid number.")
    except ValueError as e:
        print(f"⚠️ {e}")
        return

    # Get the selected recipe
    selected_recipe = healthy_recipes[choice]

    # ✅ Call LLM to suggest modifications for the selected recipe
    modifications = suggest_modifications(selected_recipe)
    print(f"\n🛠 Suggested Modifications for Selected Recipe:\n{modifications}")

    # ✅ Filter Data to Only Keep Valid Nodes
    valid_indices = health_scores.nonzero(as_tuple=True)[0]  # Keep only valid recipes
    data.x = data.x[valid_indices]
    labels = labels[valid_indices]  # ✅ Ensure labels match filtered nodes

    # ✅ Create mapping from old to new indices
    old_to_new = {int(old_idx): new_idx for new_idx, old_idx in enumerate(valid_indices.tolist())}

    # ✅ Filter and remap edges
    new_edges = [
        [old_to_new[src], old_to_new[dst]] for src, dst in data.edge_index.t().tolist()
        if src in old_to_new and dst in old_to_new
    ]
    data.edge_index = torch.tensor(new_edges, dtype=torch.long).t().contiguous()

    print("✅ Edge index successfully remapped!")

    # ✅ Handle Class Imbalance
    class_counts = torch.bincount(labels, minlength=2).float()
    class_weights = 1.0 / (class_counts + 1e-6)
    class_weights /= class_weights.sum()
    print("\n⚖️ Class Weights:", class_weights)

    # ✅ Define Model
    model = GAT(input_dim=5, hidden_dim=8, output_dim=2)
    optimizer = optim.Adam(model.parameters(), lr=0.01)
    criterion = torch.nn.CrossEntropyLoss(weight=class_weights.to(torch.float32))

    # ✅ Training Loop
    for epoch in range(200):
        optimizer.zero_grad()
        output = model(data.x, data.edge_index)
        
        # ✅ Ensure batch sizes match
        if output.shape[0] != labels.shape[0]:
            print(f"❌ Error: Model output size {output.shape[0]} does not match labels {labels.shape[0]}")
            return

        loss = criterion(output, labels)
        loss.backward()
        optimizer.step()

        acc = (output.argmax(dim=1) == labels).float().mean().item()
        print(f"📌 Epoch {epoch:3d} | Loss: {loss:.4f} | Accuracy: {acc:.4f}")

    print("\n✅ Model trained successfully.")

    # ✅ Evaluation
    preds = output.argmax(dim=1).cpu().numpy()
    true_labels = labels.cpu().numpy()
    print("\n📊 **Classification Report:**")
    print(classification_report(true_labels, preds, digits=4))
    print("\n🧩 **Confusion Matrix:**")
    print(confusion_matrix(true_labels, preds))

    return model, data

if __name__ == '__main__':
    try:
        trained_model, graph_data = train()
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        torch.cuda.empty_cache()
