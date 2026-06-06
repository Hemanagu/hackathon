"""
Train the LSTM model for sign language recognition.

Loads synthetic data, creates train/val split, trains the model,
and saves the best checkpoint based on validation accuracy.

Usage:
    python -m training.train_lstm
"""

import os
import sys
import time

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, random_split

# Add parent directory to path so we can import from app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.lstm_model import SignLanguageLSTM
from training.dataset import SignDataset


# Sign labels (must match order in feature_engineering.py)
SIGN_LABELS = [
    "Hello", "Thank You", "Yes", "No", "Help",
    "Good", "Bad", "Water", "Food", "Stop",
]


def train() -> None:
    """Run the complete training pipeline."""
    print("=" * 60)
    print("LSTM Sign Language Model Training")
    print("=" * 60)

    # ---- Configuration ----
    data_dir = os.path.join(os.path.dirname(__file__), "data")
    x_path = os.path.join(data_dir, "X_train.npy")
    y_path = os.path.join(data_dir, "y_train.npy")

    save_dir = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "saved_models"
    )
    os.makedirs(save_dir, exist_ok=True)
    save_path = os.path.join(save_dir, "sign_lstm.pth")

    batch_size = 64
    num_epochs = 50
    learning_rate = 0.001
    val_split = 0.2

    # ---- Device ----
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"\nUsing device: {device}")

    # ---- Load Dataset ----
    if not os.path.exists(x_path) or not os.path.exists(y_path):
        print(f"\nERROR: Training data not found at {data_dir}")
        print("Please run: python -m training.generate_synthetic_data")
        sys.exit(1)

    full_dataset = SignDataset(x_path, y_path)
    print(f"Total samples: {len(full_dataset)}")

    # ---- Train/Val Split ----
    val_size = int(len(full_dataset) * val_split)
    train_size = len(full_dataset) - val_size

    generator = torch.Generator().manual_seed(42)
    train_dataset, val_dataset = random_split(
        full_dataset, [train_size, val_size], generator=generator
    )

    print(f"Training samples: {train_size}")
    print(f"Validation samples: {val_size}")

    train_loader = DataLoader(
        train_dataset, batch_size=batch_size, shuffle=True, num_workers=0
    )
    val_loader = DataLoader(
        val_dataset, batch_size=batch_size, shuffle=False, num_workers=0
    )

    # ---- Initialize Model ----
    model = SignLanguageLSTM(
        input_size=126,
        hidden_size=128,
        num_layers=2,
        num_classes=len(SIGN_LABELS),
        dropout=0.3,
    ).to(device)

    print(f"\nModel architecture:")
    print(model)

    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"\nTotal parameters: {total_params:,}")
    print(f"Trainable parameters: {trainable_params:,}")

    # ---- Loss and Optimizer ----
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)

    # ---- Training Loop ----
    best_val_acc = 0.0
    best_epoch = 0

    print(f"\n{'=' * 60}")
    print(f"Starting training for {num_epochs} epochs...")
    print(f"{'=' * 60}")

    start_time = time.time()

    for epoch in range(1, num_epochs + 1):
        # ---- Training Phase ----
        model.train()
        train_loss = 0.0
        train_correct = 0
        train_total = 0

        for batch_x, batch_y in train_loader:
            batch_x = batch_x.to(device)  # (B, 30, 126)
            batch_y = batch_y.to(device)  # (B,)

            # Forward pass
            outputs = model(batch_x)  # (B, num_classes)
            loss = criterion(outputs, batch_y)

            # Backward pass
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            # Track metrics
            train_loss += loss.item() * batch_x.size(0)
            _, predicted = torch.max(outputs, 1)
            train_total += batch_y.size(0)
            train_correct += (predicted == batch_y).sum().item()

        train_loss /= train_total
        train_acc = train_correct / train_total

        # ---- Validation Phase ----
        model.eval()
        val_loss = 0.0
        val_correct = 0
        val_total = 0

        with torch.no_grad():
            for batch_x, batch_y in val_loader:
                batch_x = batch_x.to(device)
                batch_y = batch_y.to(device)

                outputs = model(batch_x)
                loss = criterion(outputs, batch_y)

                val_loss += loss.item() * batch_x.size(0)
                _, predicted = torch.max(outputs, 1)
                val_total += batch_y.size(0)
                val_correct += (predicted == batch_y).sum().item()

        val_loss /= val_total
        val_acc = val_correct / val_total

        # ---- Save Best Model ----
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            best_epoch = epoch
            torch.save(model.state_dict(), save_path)

        # ---- Print Progress ----
        if epoch % 5 == 0 or epoch == 1:
            print(
                f"Epoch [{epoch:3d}/{num_epochs}] | "
                f"Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.4f} | "
                f"Val Loss: {val_loss:.4f} | Val Acc: {val_acc:.4f}"
                f"{' *' if val_acc >= best_val_acc else ''}"
            )

    elapsed = time.time() - start_time

    # ---- Final Summary ----
    print(f"\n{'=' * 60}")
    print(f"Training Complete!")
    print(f"{'=' * 60}")
    print(f"Total training time: {elapsed:.1f}s")
    print(f"Best validation accuracy: {best_val_acc:.4f} (epoch {best_epoch})")
    print(f"Final training accuracy: {train_acc:.4f}")
    print(f"Final validation accuracy: {val_acc:.4f}")
    print(f"Model saved to: {save_path}")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    train()
