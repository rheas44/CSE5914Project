from train import train
from data_loader import load_recipe_data

# predict.py - Mock inference
def predict(model):
    data = load_recipe_data()
    output = model(data.x, data.edge_index)
    print('Mock Predictions:', output)

if __name__ == '__main__':
    trained_gat, trained_gcn = train()
    predict(trained_gat) 