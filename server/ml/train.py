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

    # Normalize Scores (Avoid divide-by-zero)
    min_score, max_score = health_scores.min(), health_scores.max()
    if max_score - min_score > 0:
        health_scores = (health_scores - min_score) / (max_score - min_score)
    else:
        health_scores = torch.zeros_like(health_scores)

    # Define Classification Labels
    threshold = 0.5  # User-defined threshold for "healthy" vs. "unhealthy"
    labels = (health_scores > threshold).long()

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
    class_weights = 1.0 / (class_counts + 1e-6)
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
            modifications = suggest_modifications(recipe)
            print(f"\n🛠 Suggested Modifications for Recipe {i}: {modifications}")

    return model, data

if __name__ == '__main__':
    trained_model, graph_data = train()
    exit()
