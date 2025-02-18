# predict.py - Mock inference
def predict(model):
    data = load_mock_data()
    output = model(data.x, data.edge_index)
    print('Mock Predictions:', output)

if __name__ == '__main__':
    trained_model = train()
    predict(trained_model)