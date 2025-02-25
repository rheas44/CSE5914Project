import torch
import torch.nn.functional as F
import torch.optim as optim
import matplotlib.pyplot as plt
from sklearn.metrics import accuracy_score, f1_score, classification_report, confusion_matrix
from graph_model import GAT, GCN  # ✅ Import both models
from data_loader import load_recipe_data
from recipe_modifier import suggest_modifications, adjust_category_weights

def train_model(model, data, labels, model_name):
    """Train a given model and return metrics."""
    optimizer = optim.Adam(model.parameters(), lr=0.01)
    criterion = torch.nn.CrossEntropyLoss()

    loss_history = []

    for epoch in range(200):
        optimizer.zero_grad()
        output = model(data.x, data.edge_index)

        if output.shape[0] != labels.shape[0]:  # Safety check
            print(f"❌ Error: Model output size {output.shape[0]} does not match labels {labels.shape[0]}")
            return None

        loss = criterion(output, labels)
        loss.backward()
        optimizer.step()
        loss_history.append(loss.item())

        acc = (output.argmax(dim=1) == labels).float().mean().item()
        print(f"📌 [{model_name}] Epoch {epoch:3d} | Loss: {loss:.4f} | Accuracy: {acc:.4f}")

    print(f"\n✅ {model_name} trained successfully.")

    # Final Predictions
    preds = output.argmax(dim=1).cpu().numpy()
    true_labels = labels.cpu().numpy()

    # Compute Accuracy & F1-score
    accuracy = accuracy_score(true_labels, preds)
    f1 = f1_score(true_labels, preds, average="weighted")

    print(f"\n📊 **{model_name} Classification Report:**")
    print(classification_report(true_labels, preds, digits=4))

    return model, accuracy, f1, loss_history

def train():
    # Load Data
    data, recipe_names = load_recipe_data("data.txt")  # ✅ Ensure names are returned

    print("\n🔹 Number of Nodes:", data.x.shape[0])
    print("🔹 Node Features Shape:", data.x.shape)
    print("🔹 Edge Index Shape:", data.edge_index.shape)

    # User Preference Input
    user_priority = input("Enter your health priority (e.g., 'low sugar, high protein'): ").strip().lower()
    category_weights = adjust_category_weights(user_priority)
    print(f"🔄 Updated Category Weights: {category_weights}")

    # Compute Health Scores (Including New Macros)
    health_scores = (
        (data.x[:, 0] * category_weights["calories"]) +  
        (data.x[:, 1] * category_weights["protein"]) +
        (data.x[:, 2] * category_weights["sugar"]) +
        (data.x[:, 3] * category_weights["carbs"]) +
        (data.x[:, 4] * category_weights["sodium"]) +
        (data.x[:, 5] * category_weights.get("fat", 1.0)) +  # ✅ NEW: Total Fat
        (data.x[:, 6] * category_weights.get("fiber", 1.0)) +  # ✅ NEW: Fiber
        (data.x[:, 7] * category_weights.get("potassium", 1.0)) +  # ✅ NEW: Potassium
        (data.x[:, 8] * category_weights.get("cholesterol", 1.0))   # ✅ NEW: Cholesterol
    )

    # Normalize Scores
    min_score, max_score = health_scores.min(), health_scores.max()
    if max_score - min_score > 0:
        health_scores = (health_scores - min_score) / (max_score - min_score)
    else:
        health_scores = torch.zeros_like(health_scores)

    threshold = health_scores.mean().item() + (0.25 * health_scores.std().item())
    labels = (health_scores > threshold).long()

    print(f"\n📏 Adaptive Threshold: {threshold:.4f}")
    print("\n📊 Unique Labels:", torch.unique(labels))
    print("📊 Label Counts:", torch.bincount(labels))

    # ✅ Get Healthy Recipes
    healthy_indices = (labels == 0).nonzero(as_tuple=True)[0]
    healthy_recipes = data.x[healthy_indices]
    healthy_recipe_names = [recipe_names[i] for i in healthy_indices.tolist()]  # ✅ Match recipe names

    # ✅ Show Recipes with Names and New Macros
    print("\n✅ Healthy Recipes:")
    for i, (name, recipe) in enumerate(zip(healthy_recipe_names, healthy_recipes)):
        print(
            f"[{i}] {name} | Calories: {recipe[0]:.1f} | Protein: {recipe[1]:.1f}g | Sugar: {recipe[2]:.1f}g | "
            f"Carbs: {recipe[3]:.1f}g | Sodium: {recipe[4]:.1f}mg | Fat: {recipe[5]:.1f}g | "
            f"Fiber: {recipe[6]:.1f}g | Potassium: {recipe[7]:.1f}mg | Cholesterol: {recipe[8]:.1f}mg"
        )

    # ✅ User Chooses a Recipe by Name
    try:
        choice = int(input("\nEnter the number of the recipe you'd like to modify: "))
        if choice < 0 or choice >= len(healthy_recipes):
            raise ValueError("Invalid selection. Please choose a valid number.")
    except ValueError as e:
        print(f"⚠️ {e}")
        return

    selected_recipe = healthy_recipes[choice]
    selected_recipe_name = healthy_recipe_names[choice]  # ✅ Get name of selected recipe

    # ✅ Call LLM to suggest modifications
    modifications = suggest_modifications(selected_recipe_name, selected_recipe, user_priority)
    print(f"\n🛠 Suggested Modifications for **{selected_recipe_name}**:\n{modifications}")

    # ✅ Define Models
    gat_model = GAT(input_dim=9, hidden_dim=8, output_dim=2)  # ✅ Update Input Dim (now 9)
    gcn_model = GCN(input_dim=9, hidden_dim=8, output_dim=2)  # ✅ Update Input Dim (now 9)

    # ✅ Train Both Models
    gat_model, gat_acc, gat_f1, gat_loss = train_model(gat_model, data, labels, "GAT")
    gcn_model, gcn_acc, gcn_f1, gcn_loss = train_model(gcn_model, data, labels, "GCN")

    # ✅ Compare Performance
    print("\n🔎 **Performance Comparison:**")
    print(f"GAT Accuracy: {gat_acc:.4f} | GCN Accuracy: {gcn_acc:.4f}")
    print(f"GAT F1-Score: {gat_f1:.4f} | GCN F1-Score: {gcn_f1:.4f}")

    # ✅ Plot Loss Curves
    plt.figure(figsize=(10, 5))
    plt.plot(gat_loss, label="GAT Loss")
    plt.plot(gcn_loss, label="GCN Loss", linestyle="dashed")
    plt.xlabel("Epochs")
    plt.ylabel("Loss")
    plt.title("Training Loss: GAT vs GCN")
    plt.legend()
    plt.show()

    return gat_model, gcn_model, data

if __name__ == '__main__':
    try:
        trained_gat, trained_gcn, graph_data = train()
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        torch.cuda.empty_cache()
