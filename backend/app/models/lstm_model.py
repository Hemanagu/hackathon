"""PyTorch LSTM model for sign language recognition."""

import torch
import torch.nn as nn


class SignLanguageLSTM(nn.Module):
    """
    LSTM-based model for classifying sign language gestures from
    sequences of hand landmark features.

    Architecture:
        Input -> LSTM (multi-layer, bidirectional=False) -> Dropout ->
        FC(hidden_size, 64) -> ReLU -> FC(64, num_classes)

    Uses the last hidden state from the LSTM sequence for classification.
    """

    def __init__(
        self,
        input_size: int = 126,
        hidden_size: int = 128,
        num_layers: int = 2,
        num_classes: int = 10,
        dropout: float = 0.3,
    ) -> None:
        super(SignLanguageLSTM, self).__init__()

        self.input_size = input_size
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.num_classes = num_classes

        # LSTM layer
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0.0,
        )

        # Dropout layer
        self.dropout = nn.Dropout(p=dropout)

        # Fully connected classifier
        self.fc1 = nn.Linear(hidden_size, 64)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(64, num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Forward pass through the network.

        Args:
            x: Input tensor of shape (batch, seq_len, features).

        Returns:
            Logits tensor of shape (batch, num_classes).
        """
        # LSTM forward pass
        # lstm_out shape: (batch, seq_len, hidden_size)
        # h_n shape: (num_layers, batch, hidden_size)
        lstm_out, (h_n, c_n) = self.lstm(x)

        # Use the last hidden state from the top LSTM layer
        # h_n[-1] shape: (batch, hidden_size)
        last_hidden = h_n[-1]

        # Apply dropout
        out = self.dropout(last_hidden)

        # Classifier
        out = self.fc1(out)
        out = self.relu(out)
        out = self.fc2(out)

        return out
