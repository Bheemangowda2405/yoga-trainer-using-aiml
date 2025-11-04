🧘‍♀️ Yoga Trainer using AI/ML










🧩 Overview

Yoga Trainer using Artificial Intelligence and Machine Learning is an AI-driven application that helps users perform yoga poses correctly.
It uses computer vision and machine learning models to recognize yoga postures, evaluate their correctness, and provide real-time verbal feedback — just like a virtual yoga instructor.

🌟 Features

✅ Pose Detection using AI/ML — Detects human yoga poses through pose estimation models.
✅ Real-Time Posture Correction — Provides instant feedback and highlights incorrect body alignment.
✅ Voice-Guided Feedback — Integrated text-to-speech system for a guided yoga session.
✅ Interactive Dashboard — Clean Flask web interface for uploading yoga images or live webcam use.
✅ Configurable Settings — Modify system paths and model parameters in config.py.
✅ Logging System — Records predictions, feedback, and errors for tracking improvements.

🧱 Project Structure
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

⚙️ Technologies Used
Category	Technology
Frontend	HTML, CSS, JavaScript
Backend	Python (Flask Framework)
AI / ML	TensorFlow, Keras, Scikit-learn, OpenCV
Pose Detection	MediaPipe Pose / OpenPose
Voice System	pyttsx3 / gTTS (Text-to-Speech)
Dataset	Custom yoga pose dataset (JSON-based)
IDE	Visual Studio Code
Deployment	Localhost / Cloud Platforms (Heroku, Render, AWS EC2)
🧠 System Workflow

1️⃣ Data Collection & Labeling

Collect yoga pose images (Tadasana, Vrikshasana, Bhujangasana, etc.).

Label them and store metadata in asana_data.json.

2️⃣ Model Training

Run training_dnn.py to train a deep neural network.

Run training_hybrid.py to combine DNN + traditional ML models.

Save the trained models for future use.

3️⃣ Pose Prediction

predict.py loads the trained model.

Extracts body keypoints using OpenCV / MediaPipe.

Predicts the yoga pose and calculates accuracy/confidence.

4️⃣ Real-Time Feedback

Uses tts_system.py to provide verbal feedback.

Example: “Straighten your back”, “Perfect posture!”.

5️⃣ Web Interface

Flask (app.py) serves the UI.

Users can upload yoga pose images or use a webcam stream.

Dashboard displays results: pose name, accuracy, and tips.

⚙️ Installation Guide
Step 1️⃣ — Clone the Repository
git clone https://github.com/yourusername/yoga-trainer-using-aiml.git
cd yoga-trainer-using-aiml-main

Step 2️⃣ — Install Dependencies
pip install -r requirements.txt

Step 3️⃣ — Run the Application
python app.py

Step 4️⃣ — Access the Web Interface

Open your browser and go to:
👉 http://127.0.0.1:5000

📸 Screenshots (Add your images here)
Homepage	Pose Prediction	Dashboard

	
	

📝 (Store screenshots inside a folder named /screenshots and update paths above.)

⚙️ Configuration File: config.py

Modify model paths or parameters easily here:

MODEL_PATH = "models/yoga_pose_model.h5"
ASANA_DATA = "asana_data.json"
TTS_ENABLED = True
DEBUG_MODE = False

🗂️ Data File Example: asana_data.json
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

🗣️ Sample Output
Pose Detected: Vrikshasana (Tree Pose)
Confidence: 92.4%
Feedback: Excellent! Maintain your balance.


🎧 Voice Output: “Excellent! Maintain your balance.”

📊 Logs and Debugging

All predictions are saved in server.log.

debug.html can be used for testing and visual debugging.

🧭 Future Enhancements

🚀 Real-time webcam streaming support.
🧘 Add more yoga poses and difficulty categories.
📊 User progress tracking and weekly analytics.
📱 Mobile-friendly responsive design.
🌐 Cloud deployment using Render, AWS, or Azure.

🤝 Contribution Guidelines

Contributions are welcome! 🎉

Fork the repository.

Create a new branch for your feature:

git checkout -b feature-name


Commit your changes:

git commit -m "Added new feature"


Push to your fork:

git push origin feature-name


Create a Pull Request on GitHub.

👨‍💻 Author

👤 Developer: Chetan M I

💡 Tools Used: Python, Flask, TensorFlow, OpenCV, HTML/CSS/JS
📧 Contact: [your-email@example.com
]

📜 License

This project is licensed under the MIT License.
See the LICENSE
 file for more information.

🙏 Acknowledgements

💖 TensorFlow & OpenCV communities for open-source support.
🧘 Kaggle Yoga Pose Dataset contributors.
🔊 gTTS & pyttsx3 developers for TTS functionality.
🧠 OpenAI tools for project documentation enhancement.

⭐ Support & Feedback

If you like this project, please ⭐ star this repository on GitHub!
Your support motivates further development. 💪
