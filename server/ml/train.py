# train.py - Trains a mock GCN model
from graph_model import GCN
from data_loader import load_mock_data

def train():
    data = load_mock_data()
    
    print("Node Features (x):")
    print(data.x)  # Prints the feature matrix

    print("\nEdge Index:")
    print(data.edge_index)  # Prints the adjacency list (edges)

    model = GCN(input_dim=4, hidden_dim=8, output_dim=2)
    optimizer = torch.optim.Adam(model.parameters(), lr=0.01)

    for epoch in range(100):
        optimizer.zero_grad()
        output = model(data.x, data.edge_index)
        loss = torch.mean((output - torch.rand_like(output))**2)  # Mock loss
        loss.backward()
        optimizer.step()
        if epoch % 10 == 0:
            print(f'Epoch {epoch}, Loss: {loss.item()}')
    return model