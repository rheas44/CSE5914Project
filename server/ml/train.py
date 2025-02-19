import torch
import torch.nn.functional as F
import torch.optim as optim
from sklearn.metrics import classification_report, confusion_matrix
from graph_model import GCN
from data_loader import load_recipe_data

def train():
    # Load Data
    data = load_recipe_data("data.txt")

    print("\n🔹 Number of Nodes:", data.x.shape[0])
    print("🔹 Node Features Shape:", data.x.shape)
    print("🔹 Edge Index Shape:", data.edge_index.shape)
    print("🔹 Sample Edge Index:", data.edge_index[:, :10])

    # Extract protein values from the feature matrix
    protein_values = data.x[:, 1]  # Assuming second column is protein

    # 🔹 Filter out recipes with 0g protein
    valid_indices = (protein_values > 0).nonzero(as_tuple=True)[0]
    filtered_protein_values = protein_values[valid_indices]
    filtered_x = data.x[valid_indices]

    # Apply classification threshold (adjust if needed)
    protein_threshold = 100  # Classifies recipes as unhealthy if > 50g protein
    labels = (filtered_protein_values > protein_threshold).long()

    # Debugging
    print("\n🔍 Min Protein (Filtered):", torch.min(filtered_protein_values).item())
    print("🔍 Max Protein (Filtered):", torch.max(filtered_protein_values).item())
    print("\n📊 Unique Labels:", torch.unique(labels))
    print("📊 Label Counts:", torch.bincount(labels))

    # 🔹 Filter the graph edges to match the valid indices
    mask = torch.isin(data.edge_index, valid_indices).all(dim=0)
    filtered_edges = data.edge_index[:, mask]

    # Update dataset with filtered values
    data.x = filtered_x
    data.edge_index = filtered_edges

    # Handle class imbalance
    num_classes = 2
    class_counts = torch.bincount(labels, minlength=num_classes).float()
    class_weights = 1.0 / (class_counts + 1e-6)
    class_weights /= class_weights.sum()  # Normalize

    print("\n⚖️ Class Weights:", class_weights)

    # Define Model
    model = GCN(input_dim=4, hidden_dim=8, output_dim=2)
    optimizer = optim.Adam(model.parameters(), lr=0.01)
    criterion = torch.nn.CrossEntropyLoss(weight=class_weights.to(torch.float32))

    # Training Loop
    best_loss = float("inf")
    patience = 20  # Early stopping patience
    patience_counter = 0

    for epoch in range(200):
        optimizer.zero_grad()
        output = model(data.x, data.edge_index)
        loss = criterion(output, labels)
        loss.backward()
        optimizer.step()

        acc = (output.argmax(dim=1) == labels).float().mean().item()
        print(f"📌 Epoch {epoch:3d} | Loss: {loss:.4f} | Accuracy: {acc:.4f}")

        # Early stopping
        if loss < best_loss:
            best_loss = loss
            patience_counter = 0
        else:
            patience_counter += 1

        if patience_counter >= patience:
            print(f"⏹️ Early stopping at epoch {epoch}")
            break

    print("\n✅ Model trained successfully.")

    # 🔍 Evaluation
    preds = output.argmax(dim=1).cpu().numpy()
    true_labels = labels.cpu().numpy()
    
    print("\n📊 **Classification Report:**")
    print(classification_report(true_labels, preds, digits=4))

    print("\n🧩 **Confusion Matrix:**")
    print(confusion_matrix(true_labels, preds))

    return model, data

if __name__ == '__main__':
    trained_model, graph_data = train()
