# 🤟 SignSpeak — Sign Language Recognition

A real-time sign language recognition web application that uses **MediaPipe** for hand landmark detection and an **LSTM neural network** for temporal sign classification. Recognizes 10 common signs and converts them to text and speech.

![Tech Stack](https://img.shields.io/badge/React-18-blue?logo=react)
![Tech Stack](https://img.shields.io/badge/FastAPI-0.115-green?logo=fastapi)
![Tech Stack](https://img.shields.io/badge/PyTorch-2.0-red?logo=pytorch)
![Tech Stack](https://img.shields.io/badge/MediaPipe-Hands-orange?logo=google)

---

## ✨ Features

- **Real-time hand detection** — MediaPipe Hands runs in your browser for instant landmark detection
- **LSTM-based classification** — Temporal model recognizes dynamic signs from 30-frame sequences
- **10 supported signs** — Hello, Thank You, Yes, No, Help, Good, Bad, Water, Food, Stop
- **Text-to-speech** — Hear the recognized sign spoken aloud via browser Speech Synthesis API
- **Detection history** — Track all recognized signs with timestamps and confidence scores
- **Dark mode** — Premium dark UI with glassmorphism design (light mode also available)
- **Confidence scores** — Real-time probability from LSTM softmax output
- **Responsive design** — Works on desktop, tablet, and mobile

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                   BROWSER                       │
│                                                 │
│  ┌──────────┐    ┌────────────┐    ┌─────────┐  │
│  │ Webcam   │───▶│ MediaPipe  │───▶│ Frame   │  │
│  │ Feed     │    │ Hands      │    │ Buffer  │  │
│  └──────────┘    │ (WASM)     │    │ (30     │  │
│                  └────────────┘    │ frames) │  │
│       ┌──────────────────────────┐ └────┬────┘  │
│       │ Hand Landmark Canvas     │      │       │
│       │ (visual overlay)         │      │       │
│       └──────────────────────────┘      │       │
│                                         │       │
│  ┌──────────┐    ┌────────────┐         │       │
│  │ Speech   │◀───│ Sign       │◀────────┘       │
│  │ Synthesis│    │ Display    │  POST /api/     │
│  └──────────┘    └────────────┘  recognize/     │
│                                  sequence       │
└───────────────────────┬─────────────────────────┘
                        │ landmarks (63 floats × 30 frames)
                        ▼
┌─────────────────────────────────────────────────┐
│                 FASTAPI SERVER                  │
│                                                 │
│  ┌──────────────┐   ┌──────────────────────┐    │
│  │ Feature      │──▶│ LSTM Model           │    │
│  │ Engineering  │   │ (2-layer, 128 hidden)│    │
│  │ - normalize  │   │                      │    │
│  │ - deltas     │   │ Input: (30, 126)     │    │
│  └──────────────┘   │ Output: 10 classes   │    │
│                     └──────────────────────┘    │
└─────────────────────────────────────────────────┘
```

### How It Works (For Beginners)

1. **Hand Detection (Browser)** — MediaPipe Hands is a pre-trained AI model by Google that runs in your browser. It finds **21 key points** (landmarks) on your hand — wrist, finger joints, and fingertips. Each point has x, y, z coordinates, giving us **63 numbers per frame**.

2. **Frame Buffering (Browser)** — Instead of analyzing one frame, we collect a **sliding window of 30 consecutive frames** (~1 second of video). This captures how your hand *moves* over time — which is crucial because signs like "Hello" (waving) and "Thank You" (chin to forward) involve motion.

3. **Feature Engineering (Server)** — We normalize the landmarks (center on wrist, scale by palm size) and compute **inter-frame deltas** — how much each landmark moved between consecutive frames. This gives the model explicit motion information. Each frame becomes **126 features** (63 raw + 63 deltas).

4. **LSTM Classification (Server)** — An **LSTM (Long Short-Term Memory)** is a type of neural network designed for sequences. It "remembers" earlier frames while processing later ones. Our LSTM reads the 30-frame sequence and outputs probabilities for each of the 10 signs.

5. **Speech Output (Browser)** — The recognized sign text is spoken aloud using the browser's built-in Speech Synthesis API.

---

## 📁 Project Structure

```
Hackathon/
├── frontend/                        # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/              # UI components
│   │   │   ├── Webcam/              # Webcam feed + landmark canvas
│   │   │   ├── Recognition/         # Sign display + history
│   │   │   ├── Speech/              # Text-to-speech button
│   │   │   ├── Layout/              # Header + Footer
│   │   │   └── UI/                  # Reusable UI components
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── services/                # API client
│   │   └── utils/                   # Utilities
│   ├── .env                         # VITE_API_URL
│   └── package.json
│
├── backend/                         # FastAPI + PyTorch
│   ├── app/
│   │   ├── main.py                  # FastAPI app entry
│   │   ├── routers/                 # API routes
│   │   ├── services/                # Business logic
│   │   ├── models/                  # Pydantic + PyTorch models
│   │   └── utils/                   # Utilities
│   ├── training/                    # LSTM training pipeline
│   │   ├── generate_synthetic_data.py
│   │   ├── train_lstm.py
│   │   └── data/                    # Generated training data
│   ├── saved_models/                # Trained model weights
│   ├── requirements.txt
│   └── .env
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **pip** (Python package manager)
- A webcam

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Hackathon
```

### 2. Set Up the Backend

```bash
# Navigate to backend
cd backend

# Create and activate virtual environment (recommended)
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
# source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### 3. Train the LSTM Model

```bash
# Still in the backend/ directory

# Step 1: Generate synthetic training data
python -m training.generate_synthetic_data
# This creates training/data/X_train.npy and y_train.npy (~5000 samples)

# Step 2: Train the LSTM model
python -m training.train_lstm
# This trains for 50 epochs and saves the best model to saved_models/sign_lstm.pth
# Expected accuracy: 85-95% on synthetic data
```

### 4. Start the Backend Server

```bash
# Still in the backend/ directory
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`. Check health: `http://localhost:8000/api/health`

### 5. Set Up the Frontend

```bash
# Open a new terminal, navigate to frontend
cd frontend

# Install Node.js dependencies
npm install
```

### 6. Start the Frontend

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### 7. Use the App

1. Open `http://localhost:5173` in your browser
2. **Allow webcam access** when prompted
3. Wait for MediaPipe to load (loading spinner will appear)
4. **Hold your hand in front of the camera**
5. Make one of the 10 supported signs
6. The app will display the recognized sign with a confidence score
7. Click the **speaker button** to hear the sign spoken aloud

---

## 📡 API Reference

### `POST /api/recognize/sequence`

Classify a sequence of hand landmark frames.

**Request:**
```json
{
  "frames": [
    {
      "landmarks": [
        {"x": 0.5, "y": 0.3, "z": -0.02},
        // ... 21 landmarks per frame
      ]
    }
    // ... 30 frames
  ],
  "handedness": "Right"
}
```

**Response:**
```json
{
  "sign": "Hello",
  "confidence": 0.92,
  "all_scores": {"Hello": 0.92, "Thank You": 0.04, ...},
  "timestamp": "2026-06-06T10:45:00Z",
  "frames_received": 30
}
```

### `GET /api/health`

Health check.

**Response:** `{"status": "healthy", "model_loaded": true, "supported_signs": 10}`

### `GET /api/signs`

List supported signs.

**Response:** `[{"name": "Hello", "description": "Open palm wave"}, ...]`

---

## 🌐 Deployment

### Frontend → Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com), import your repository
3. Set **Root Directory** to `frontend`
4. Set **Build Command** to `npm run build`
5. Set **Output Directory** to `dist`
6. Add environment variable:
   - `VITE_API_URL` = `https://your-backend.onrender.com`
7. Deploy!

### Backend → Render

1. Go to [render.com](https://render.com), create a new **Web Service**
2. Connect your GitHub repository
3. Set **Root Directory** to `backend`
4. Set **Build Command** to:
   ```bash
   pip install -r requirements.txt && python -m training.generate_synthetic_data && python -m training.train_lstm
   ```
5. Set **Start Command** to:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
6. Add environment variables:
   - `CORS_ORIGINS` = `https://your-frontend.vercel.app`
   - `MODEL_PATH` = `saved_models/sign_lstm.pth`
7. Deploy!

> **Note:** Render's free tier may have cold start delays. The first request after inactivity may take 30-60 seconds.

---

## 🤝 Supported Signs

| Sign | Gesture | Description |
|------|---------|-------------|
| 👋 Hello | Open palm wave | All fingers extended, hand waves side to side |
| 🙏 Thank You | Flat hand from chin | Flat hand moves from chin forward and down |
| ✅ Yes | Fist nod | Closed fist moves up and down |
| ❌ No | Two finger wave | Index + middle finger extended, wave side to side |
| 🆘 Help | Thumbs up lift | Fist with thumb up, lifts upward |
| 👍 Good | Thumbs up | Thumb up, other fingers curled |
| 👎 Bad | Thumbs down | Thumb down, other fingers curled |
| 💧 Water | W-shape tap | Index + middle + ring extended, tapping motion |
| 🍽️ Food | Pinch to mouth | All fingertips pinched together, toward mouth |
| ✋ Stop | Flat palm push | Open palm, pushes forward |

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 18, Vite, Tailwind CSS 3 |
| Backend | FastAPI, Uvicorn |
| ML Model | PyTorch LSTM |
| Hand Detection | MediaPipe Hands (browser WASM) |
| Speech | Web Speech Synthesis API |
| Deployment | Vercel (frontend) + Render (backend) |

---

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.
