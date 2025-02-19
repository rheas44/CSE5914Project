import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.nn import GCNConv

class GCN(nn.Module):
    def __init__(self, input_dim, hidden_dim, output_dim):
        super(GCN, self).__init__()
        self.conv1 = GCNConv(input_dim, hidden_dim)
        self.conv2 = GCNConv(hidden_dim, output_dim)

        self.reset_parameters()  # Xavier Initialization

    def reset_parameters(self):
        nn.init.xavier_uniform_(self.conv1.lin.weight)
        nn.init.xavier_uniform_(self.conv2.lin.weight)

    def forward(self, x, edge_index):
        x = self.conv1(x, edge_index)
        x = F.relu(x)
        x = self.conv2(x, edge_index)
        return x




class GAT(torch.nn.Module):
    def __init__(self, input_dim, hidden_dim, output_dim):
        super().__init__()
        self.conv1 = GATConv(input_dim, hidden_dim)
        self.bn1 = BatchNorm1d(hidden_dim)  # Batch Normalization
        self.conv2 = GATConv(hidden_dim, output_dim)

        self.reset_parameters()  # Apply Xavier Initialization

    def reset_parameters(self):
        """ Apply Xavier initialization to all layers """
        for layer in self.children():
            if hasattr(layer, 'reset_parameters'):
                layer.reset_parameters()
            elif isinstance(layer, torch.nn.Linear):  # Additional check for FC layers
                torch.nn.init.xavier_uniform_(layer.weight)

    def forward(self, x, edge_index):
        x = self.conv1(x, edge_index)
        x = self.bn1(x)  # Normalize activations
        x = F.relu(x)
        x = self.conv2(x, edge_index)
        return x
