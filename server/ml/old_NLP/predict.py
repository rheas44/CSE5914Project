from server.ml.old_NLP.train import train
from server.ml.old_NLP.data_loader import load_recipe_graph

# predict.py - Mock inference
def predict(model):
    data = load_recipe_graph("data.txt")  # ✅ Ensure correct data file
    output = model(data.x, data.edge_index)
    
    # ✅ Convert predictions to a readable format
    predicted_labels = output.argmax(dim=1).tolist()
    
    print("\n **Predicted Labels for Recipes:**")
    for i, label in enumerate(predicted_labels):
        print(f"Recipe {i+1}: {data.recipe_names[i]} → {'Healthy' if label == 1 else 'Not Healthy'}")

if __name__ == '__main__':
    trained_model, graph_data = train()  # ✅ Fix model assignment
    predict(trained_model)  # ✅ Pass the correct trained model
