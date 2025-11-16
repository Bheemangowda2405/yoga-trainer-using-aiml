#  Yoga Trainer using AI/ML

<div align="center">

![Yoga Trainer Banner](https://img.shields.io/badge/AI-Powered-blue?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.8+-green?style=for-the-badge&logo=python)
![Flask](https://img.shields.io/badge/Flask-2.0+-black?style=for-the-badge&logo=flask)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.0+-orange?style=for-the-badge&logo=tensorflow)
![MediaPipe](https://img.shields.io/badge/MediaPipe-0.8.10-00C4B3?style=for-the-badge&logo=google&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**An intelligent AI-driven application that helps users perform yoga poses correctly with real-time feedback**

[Features](#-features) • [Installation](#%EF%B8%8F-installation-guide) • [Usage](#-system-workflow) • [Contributing](#-contribution-guidelines)

</div>

---

##  Overview

Yoga Trainer using Artificial Intelligence and Machine Learning is an innovative application that acts as your personal virtual yoga instructor. Using advanced computer vision and machine learning models, it recognizes yoga postures, evaluates their correctness, and provides real-time verbal feedback to help you perfect your practice.

##  Features

-  **Pose Detection using AI/ML** — Detects human yoga poses through advanced pose estimation models
-  **Real-Time Posture Correction** — Provides instant feedback and highlights incorrect body alignment
-  **Voice-Guided Feedback** — Integrated text-to-speech system for a guided yoga session
-  **Interactive Dashboard** — Clean Flask web interface for uploading yoga images or live webcam use
-  **Configurable Settings** — Modify system paths and model parameters in `config.py`
-  **Logging System** — Records predictions, feedback, and errors for tracking improvements

##  Project Structure

```
yoga-trainer-using-aiml-main/
│
├── app.py                         # Main Flask app entry point
├── app_backup.py                  # Backup version of app
├── app_backup_with_traditional.py # Alternate version using traditional ML
├── predict.py                     # Handles pose prediction logic
├── training_dnn.py                # Deep Neural Network model training
├── training_hybrid.py             # Combines DNN with traditional ML
├── tts_system.py                  # Text-to-speech module
├── config.py                      # Configuration settings
├── asana_data.json                # Yoga pose metadata and descriptions
├── requirements.txt               # Python dependencies
├── server.log                     # Server log for debugging
├── debug.html                     # Debugging HTML interface
│
├── app/
│   ├── static/
│   │   ├── css/                   # Styling (Dashboard, Image Predictor, etc.)
│   │   ├── js/                    # JavaScript scripts
│   │   ├── images/                # Yoga posture images/icons
│   │   └── asana_data.json        # Yoga metadata
│   │
│   └── templates/                 # Flask HTML templates
│
├── LICENSE                        # License information
├── .gitignore                     # Git ignore rules
└── .vscode/settings.json          # VSCode workspace settings
```

## ⚙️ Technologies Used

| Category | Technology |
|----------|-----------|
| **Frontend** | HTML, CSS, JavaScript |
| **Backend** | Python (Flask Framework) |
| **AI / ML** | TensorFlow, Keras, Scikit-learn, OpenCV |
| **Pose Detection** | MediaPipe Pose / OpenPose |
| **Voice System** | pyttsx3 / gTTS (Text-to-Speech) |
| **Dataset** |Yoga82 Dataset from Kaggle |
| **IDE** | Visual Studio Code |
| **Deployment** | Localhost / Cloud Platforms (Heroku, Render, AWS EC2) |

##  System Workflow

### 1️⃣ Data Collection & Labeling
- Collect yoga pose images (Tadasana, Vrikshasana, Bhujangasana, etc.)
- Label them and store metadata in `asana_data.json`

### 2️⃣ Model Training
- Run `training_dnn.py` to train a deep neural network
- Run `training_hybrid.py` to combine DNN + traditional ML models
- Save the trained models for future use

### 3️⃣ Pose Prediction
- `predict.py` loads the trained model
- Extracts body keypoints using OpenCV / MediaPipe
- Predicts the yoga pose and calculates accuracy/confidence

### 4️⃣ Real-Time Feedback
- Uses `tts_system.py` to provide verbal feedback

### 5️⃣ Web Interface
- Flask (`app.py`) serves the UI
- Users can upload yoga pose images or use a webcam stream
- Dashboard displays results: pose name, accuracy, and tips

##  Installation Guide

### Step 1️⃣ — Clone the Repository

```bash
git clone https://github.com/yourusername/yoga-trainer-using-aiml.git
cd yoga-trainer-using-aiml-main
```

### Step 2️⃣ — Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 3️⃣ — Run the Application

```bash
python app.py
```

### Step 4️⃣ — Access the Web Interface

Open your browser and navigate to:

👉 **http://127.0.0.1:5000**

## 📸 Screenshots

| Homepage | Pose Prediction | Dashboard |
|----------|----------------|-----------|
| ![Homepage](screenshots/homepage.png) | ![Prediction](screenshots/prediction.png) | ![Dashboard](screenshots/dashboard.png) |



##  Configuration File: `config.py`

Modify model paths or parameters easily:

```python
MODEL_PATH = "models/yoga_pose_model.h5"
ASANA_DATA = "asana_data.json"
TTS_ENABLED = True
DEBUG_MODE = False
```

##  Data File Example: `asana_data.json`

```json
{
  "Tadasana": {
    "english_name": "Mountain Pose",
    "difficulty": "Easy",
    "benefits": "Improves posture and balance"
  },
  "Vrikshasana": {
    "english_name": "Tree Pose",
    "difficulty": "Medium",
    "benefits": "Improves concentration and stability"
  }
}
```

##  Sample Output

```
Pose Detected: Vrikshasana (Tree Pose)
Confidence: 92.4%
Feedback: Excellent! Maintain your balance.
```

🎧 **Voice Output:** *"Tadasana!"*

##  Logs and Debugging

- All predictions are saved in `server.log`
- `debug.html` can be used for testing and visual debugging

##  Future Enhancements

-  Real-time webcam streaming support
-  Add more yoga poses and difficulty categories
-  User progress tracking and weekly analytics
-  Mobile-friendly responsive design
-  Cloud deployment using Render, AWS, or Azure

##  Contribution Guidelines

Contributions are welcome! 🎉

1. **Fork** the repository
2. Create a new branch for your feature:
   ```bash
   git checkout -b feature-name
   ```
3. **Commit** your changes:
   ```bash
   git commit -m "Added new feature"
   ```
4. **Push** to your fork:
   ```bash
   git push origin feature-name
   ```
5. Create a **Pull Request** on GitHub

##  Author

**Contributors:** 
- Bheemanagowda
- Chetan M I
- Chinmay Naik
- Chinmay Soratur

**Tools Used:** Python, Flask, TensorFlow, Mediapipe, HTML/CSS/JS

**Contact:** chinmay.naik@hotmail.com

##  License

This project is licensed under the **MIT License**.  
See the [LICENSE](LICENSE) file for more information.

##  Acknowledgements

-  TensorFlow & Mediapipe communities for open-source support
-  Kaggle Yoga82 Pose Dataset contributors
-  gTTS & pyttsx3 developers for TTS functionality
-  OpenAI tools for project documentation enhancement

---

<div align="center">

##  Support & Feedback

**If you like this project, please ⭐ star this repository on GitHub!**  
Your support motivates further development. 



</div>
