# SignSpeak — Sign Language Recognition

## Project Overview

SignSpeak is a real-time web application that recognizes common hand signs and displays them as text, confidence scores, and speech output.

It combines:
- **Browser-based gesture detection** using **MediaPipe Hands / GestureRecognizer**
- **Client-side sign mapping** and enhanced detection logic in React
- **Server-side logging and metadata** with **FastAPI**
- **LSTM model training support** using **PyTorch**

## Key Features

- **Real-time sign detection** through webcam input
- **10 supported signs**: Hello, Thank You, Yes, No, Help, Good, Bad, Water, Food, Stop
- **Enhanced detection** using both MediaPipe gesture categories and custom landmark geometry rules
- **History panel** that logs detected signs, timestamps, and confidence
- **Text-to-speech** output via browser Speech Synthesis API
- **Responsive modern UI** with a dark theme and visual landmark overlay
- **Backend health check** and sign metadata API

## Architecture

### Frontend (React + Vite)
- `frontend/src/App.jsx`: central app state for current sign, confidence, and history
- `frontend/src/components/Webcam/WebcamFeed.jsx`: captures webcam video, loads MediaPipe, and runs detection
- `frontend/src/hooks/useSignRecognition.js`: maps MediaPipe gestures to app signs, applies stability filtering, computes confidence, and logs recognized gestures to backend
- `frontend/src/components/Recognition/SignDisplay.jsx`: shows the current sign, confidence badge, and top prediction scores
- `frontend/src/components/Recognition/HistoryPanel.jsx`: displays detection history
- `frontend/src/services/api.js`: backend API calls for gesture logging, health, and supported signs

### Backend (FastAPI + PyTorch)
- `backend/app/main.py`: FastAPI app setup, CORS, and health endpoint
- `backend/app/routers/recognition.py`: API routes for gesture logging and supported sign metadata
- `backend/app/models/schemas.py`: request/response schemas for API validation
- `backend/saved_models/sign_lstm.pth`: pre-trained LSTM model weights

### Training Pipeline
- `backend/training/generate_synthetic_data.py`: synthesize training sequences
- `backend/training/train_lstm.py`: train the LSTM model on generated sequences

## How It Works

1. **User opens the app** and grants webcam access.
2. **MediaPipe Hands** detects hand landmarks in the browser.
3. The app uses **MediaPipe GestureRecognizer** output and custom landmark heuristics to determine the sign.
4. A sign is only accepted after **stability filtering** (two consecutive detections).
5. Detected signs are displayed with a **confidence score** and saved in the **history panel**.
6. Recognized gesture details may be logged to the backend for analytics.

## Supported Signs and Logic

- MediaPipe gestures are mapped to app signs:
  - `Open_Palm` → Hello
  - `Closed_Fist` → Yes
  - `Victory` → No
  - `Thumb_Up` → Good
  - `Thumb_Down` → Bad
  - `Pointing_Up` → Stop
  - `ILoveYou` → Help

- Additional signs detected via landmark geometry:
  - `Thank You`: open palm near upper half of frame
  - `Water`: index + middle + ring extended, thumb and pinky curled
  - `Food`: all fingertips clustered tightly together

## Presentation-Friendly Slide Suggestions

1. **Title Slide**: SignSpeak — Real-Time Sign Language Recognition
2. **Problem Statement**: Accessibility, communication for hearing-impaired users, and gesture-to-text/speech conversion
3. **Solution**: Browser-based sign recognition with live feedback and speech
4. **Architecture**: Frontend detection + backend logging + optional LSTM training
5. **Features**: 10 signs, history, confidence, speech, responsive UI
6. **Demo / Flow**: webcam → detection → display → speech
7. **Tech Stack**: React, Vite, Tailwind CSS, FastAPI, Python, PyTorch, MediaPipe
8. **Next Steps**: Add dynamic sentence building, more gesture classes, multilingual speech, model accuracy improvement

## Quick Start for Demo

1. Start backend:
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
2. Start frontend:
```bash
cd frontend
npm install
npm run dev
```
3. Open the browser at `http://localhost:5173`
4. Allow camera access and show a supported sign.

## Notes

- The browser performs recognition locally using **MediaPipe**; the backend is used for **metadata and logging only**.
- This architecture minimizes latency and preserves privacy by keeping media processing client-side.
- The LSTM training pipeline is available if you want to expand or retrain the gesture model.
