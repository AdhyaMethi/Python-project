# 🖐 GesturePresenter AI - Flask Hand Gesture Presentation App

**GesturePresenter AI** is an interactive, touchless presentation system built with **Flask**, **MediaPipe AI Hand Tracking**, **PyMuPDF**, and **python-pptx**. Presenters can navigate slides, point a virtual laser, draw live notes on top of slides, trigger confetti celebrations, and stream audience reactions using natural hand gestures.

---

## 🌟 Key Features

- **✋ Touchless Slide Navigation**: Advance or rewind slides by pointing or swiping left and right.
- **🎯 Virtual Laser Pointer Overlay**: Point your index finger to cast a glowing red laser dot over presentation slides.
- **🎨 Live On-Slide Drawing Canvas**: Pinch your thumb and index finger to annotate slides live in 5 neon colors (*Laser Red*, *Emerald Green*, *Electric Yellow*, *Indigo*, *Cyan*).
- **🎉 Confetti Celebrations & Reaction Emojis**: Flash a Victory V-sign (`✌️`) for celebratory confetti blasts, or give a Thumbs-Up (`👍`) to fire floating emoji reaction streams (`❤️`, `🔥`, `👏`, `🎉`, `🚀`, `💡`).
- **📄 PDF & PowerPoint (.pptx) Upload Support**: Upload your own presentation files via drag-and-drop. Vector pages and PowerPoint shapes are automatically converted into slide images.
- **⏱️ Interactive Presentation Stopwatch**: Built-in presentation timer with play, pause, and reset controls.
- **🔊 Built-In Web Audio Sound FX**: Native browser Web Audio API synthesizer for slide swooshes, laser chirps, celebration chimes, and emoji pops.
- **🌌 Sleek Glassmorphic Dark UI**: Modern dark glassmorphic design system with responsive scaling and fullscreen presentation mode (`F` key or button).

---

## 🖐 Hand Gesture Controls Cheatsheet

| Gesture | Icon | Action | Description |
| :--- | :---: | :--- | :--- |
| **Point / Swipe Right** | 👉 | **Next Slide** | Advances presentation to the next slide |
| **Point / Swipe Left** | 👈 | **Previous Slide** | Returns to the previous slide |
| **Index Finger Point** | ☝ | **Virtual Laser** | Projects glowing laser dot mapped to index finger coordinates |
| **Pinch Index & Thumb** | 👌 | **Live Slide Draw** | Draws smooth neon ink annotations on active slide |
| **Victory V-Sign** | ✌️ | **Confetti Blast** | Triggers animated confetti explosion & celebration chime |
| **Thumbs Up** | 👍 | **Reaction Stream** | Spawns floating emoji reaction stream across viewport |
| **Closed Fist** | ✊ | **Clear Annotations** | Erases all drawn notes on the current slide |
| **Open Palm** | 🖐 | **Neutral Hold** | Holds gesture detection in neutral state |

---

## ⌨️ Keyboard Shortcuts

- **`Right Arrow` / `Spacebar`**: Next Slide
- **`Left Arrow`**: Previous Slide
- **`F` / `f`**: Toggle Fullscreen Mode
- **`C` / `c`**: Clear Drawing Canvas Notes

---

## 📁 Project Structure

```text
Python-project/
├── app.py                   # Flask backend, slide conversion pipeline (PDF/PPTX) & REST APIs
├── requirements.txt         # Python dependencies (Flask, PyMuPDF, python-pptx, Pillow, etc.)
├── README.md                # Installation and usage instructions
├── templates/
│   └── index.html           # Presentation UI layout, canvas overlays, and modals
└── static/
    ├── css/
    │   └── style.css        # Glassmorphic dark theme design system
    ├── js/
    │   ├── gesture_engine.js # MediaPipe Hand Gesture Recognition Engine
    │   └── app.js           # App controller, audio synthesizer, and canvas handlers
    ├── slides/
    │   └── demo/            # Default 5-slide out-of-the-box presentation deck
    └── uploads/             # Temporary folder for user-uploaded PDF and PPTX files
```

---

## 🛠️ Prerequisites

Make sure you have **Python 3.8+** installed on your system.

Verify your Python version:
```bash
python --version
```

---

## 🚀 Installation & Setup Guide

### Step 1: Clone or Open Project Directory
Navigate to the project root directory:
```bash
cd Python-project
```

### Step 2: Create a Virtual Environment (Optional but Recommended)

**On Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**On macOS / Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Required Dependencies
Install all required packages listed in `requirements.txt`:
```bash
pip install -r requirements.txt
```

*Required packages installed:*
- `Flask`: Web server framework
- `PyMuPDF` (`fitz`): High-DPI PDF page image rendering
- `python-pptx`: PowerPoint file parsing and shape extraction
- `Pillow` (`PIL`): Image processing and slide canvas generation
- `werkzeug`: Secure file uploads
- `numpy`: Landmark calculation utilities

---

## 🏃 Running the Application

Start the Flask development server:
```bash
python app.py
```

You should see output similar to:
```text
Starting Flask Hand Gesture Presentation App on http://127.0.0.1:5000
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
```

Open your browser and navigate to:
```text
http://127.0.0.1:5000
```

---

## 📖 How to Use

1. **Start Camera**:
   - Click the **`📹 Start Camera`** button in the top navigation bar and allow browser camera permissions.
2. **Demo Presentation**:
   - The app loads with a default 5-slide interactive demo presentation out-of-the-box.
3. **Presenting**:
   - Raise your **index finger (☝)** to test the glowing laser pointer.
   - Point **right (👉)** or **left (👈)** to navigate slides.
   - Pinch your **thumb & index finger (👌)** to draw notes on the slide.
   - Flash a **Victory sign (✌️)** for confetti celebrations!
4. **Uploading Custom Presentations**:
   - Click **`📁 Upload Deck`** in the top bar.
   - Drag and drop any `.pdf` or `.pptx` file.
   - The backend automatically extracts and converts slides into high-resolution images.

---

## ❓ Troubleshooting

- **Webcam Access Issues**: Ensure your browser has granted camera permission. Use Google Chrome, Edge, or Firefox for optimal MediaPipe support.
- **MediaPipe CDN Loading**: The app loads MediaPipe JS scripts via CDN (`cdn.jsdelivr.net`). Ensure an active internet connection on first load.
- **PDF/PPTX Upload Error**: Ensure uploaded files do not exceed 32MB.

---

## 📜 License
MIT License. Open source and free for educational and presentation use.
