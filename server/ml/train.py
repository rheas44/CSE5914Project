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

    if not category_weights:
        print("⚠️ Failed to parse Ollama's response. Using default weights.")
        category_weights = {"calories": 1.0, "protein": 1.0, "sugar": 1.0, "carbs": 1.0, "sodium": 1.0}

    print(f"🔄 Updated Category Weights: {category_weights}")

    # Extract Features
    feature_names = ["calories", "protein", "sugar", "carbs", "sodium"]
    features = {name: data.x[:, i] for i, name in enumerate(feature_names)}

    # Normalize Data (Avoid divide-by-zero errors)
    mean_vals = data.x.mean(dim=0)
    std_vals = data.x.std(dim=0) + 1e-6  # Prevent division by zero
    z_scores = (data.x - mean_vals) / std_vals  # Standardize features

    # **Dynamically Adjust Scoring Based on User Preferences**
    health_scores = torch.zeros_like(data.x[:, 0])  # Initialize scores to zero

    for feature, weight in category_weights.items():
        idx = feature_names.index(feature)
        health_scores += z_scores[:, idx] * weight

    # Normalize Scores (Avoid divide-by-zero)
    min_score, max_score = health_scores.min(), health_scores.max()
    if max_score - min_score > 0:
        health_scores = (health_scores - min_score) / (max_score - min_score)
    else:
        health_scores = torch.zeros_like(health_scores)

    print(f"\n📊 Health Scores - Min: {health_scores.min():.4f}, Max: {health_scores.max():.4f}, Mean: {health_scores.mean():.4f}, Std Dev: {health_scores.std():.4f}")

    # **Determine Adaptive Threshold Based on User Preferences**
    mean_score = health_scores.mean().item()
    std_dev = health_scores.std().item()
    threshold = max(0.2, min(mean_score + (0.25 * std_dev), 0.9))

    # Define Classification Labels
    labels = (health_scores > threshold).long()

    print(f"\n📏 Adaptive Healthiness Threshold: {threshold:.4f}")
    print("\n📊 Unique Labels:", torch.unique(labels))
    print("📊 Label Counts:", torch.bincount(labels))

    # 🔹 Filter out "empty" recipes
    valid_indices = health_scores.nonzero(as_tuple=True)[0]
    data.x = data.x[valid_indices]
    labels = labels[valid_indices]  # Ensure labels match filtered nodes

    ## ✅ Fix for valid index mapping
    old_to_new = {int(old_idx): new_idx for new_idx, old_idx in enumerate(valid_indices.tolist())}

    # ✅ Remap the edge index using the updated node mapping
    mask = torch.tensor(
        [(src in old_to_new and dst in old_to_new) for src, dst in data.edge_index.t().tolist()],
        dtype=torch.bool
    )
    data.edge_index = data.edge_index[:, mask]  # Remove edges not in valid_indices

    # ✅ Convert old indices to new ones
    data.edge_index = torch.tensor(
        [[old_to_new[src.item()], old_to_new[dst.item()]] for src, dst in data.edge_index.t()],
        dtype=torch.long
    ).t().contiguous()

    print("✅ Edge index successfully remapped!")

    # Handle Class Imbalance
    class_counts = torch.bincount(labels, minlength=2).float()
    class_weights = torch.log(1.0 + (1.0 / (class_counts + 1e-6)))
    class_weights /= class_weights.sum()
    print("\n⚖️ Class Weights:", class_weights)

    # Define Model
    model = GAT(input_dim=5, hidden_dim=8, output_dim=2)  # Using GAT instead of GCN
    optimizer = optim.Adam(model.parameters(), lr=0.01)
    criterion = torch.nn.CrossEntropyLoss(weight=class_weights.to(torch.float32))

    # Training Loop
    for epoch in range(200):
        optimizer.zero_grad()
        output = model(data.x, data.edge_index)

        if output.shape[0] != labels.shape[0]:
            print(f"❌ Error: Mismatch in batch sizes: output={output.shape}, labels={labels.shape}")
            break  # Avoid crashing, exit gracefully

        loss = criterion(output, labels)
        loss.backward()
        optimizer.step()

        acc = (output.argmax(dim=1) == labels).float().mean().item()
        print(f"📌 Epoch {epoch:3d} | Loss: {loss:.4f} | Accuracy: {acc:.4f}")

    print("\n✅ Model trained successfully.")

    # 🔍 Evaluation
    preds = output.argmax(dim=1).cpu().numpy()
    true_labels = labels.cpu().numpy()
    print("\n📊 **Classification Report:**")
    print(classification_report(true_labels, preds, digits=4))
    print("\n🧩 **Confusion Matrix:**")
    print(confusion_matrix(true_labels, preds))

    # Suggest recipe modifications for unhealthy recipes
    for i, recipe in enumerate(data.x):
        if preds[i] == 1:
            recipe_name = data.recipe_names[i] if hasattr(data, "recipe_names") else f"Recipe {i}"
            ingredients = data.recipe_ingredients[i] if hasattr(data, "recipe_ingredients") else []
            macros = {
                "calories": recipe[0].item(),
                "protein_g": recipe[1].item(),  # Match expected key
                "sugar_g": recipe[2].item(),    # Match expected key
                "carbohydrates_total_g": recipe[3].item(),  # Match expected key
                "sodium_mg": recipe[4].item()   # Match expected key
            }
            modifications = suggest_modifications(recipe_name, ingredients, macros, user_priority)

            print(f"\n🛠 Suggested Modifications for '{recipe_name}': {modifications}")

    return model, data

if __name__ == '__main__':
    trained_model, graph_data = train()
    exit()
