import os
import cv2
import numpy as np
from flask import Flask, render_template, request, jsonify, send_file, redirect, url_for, flash
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.utils import secure_filename
import tensorflow as tf
from tensorflow.keras.models import load_model
import pickle
import google.generativeai as genai
from dotenv import load_dotenv
import threading
import time
import base64
import json
from datetime import datetime

# Import from new structure
from config import config
from utils.database import db
from utils.user import User, get_user_sessions
from utils.pose_utils import PoseUtils
from services.tts_service import AdvancedIndianTTSSystem

# Initialize Flask app with CORRECT paths
app = Flask(__name__, 
           template_folder="app/templates", 
           static_folder="app/static")
app.config['UPLOAD_FOLDER'] = 'app/static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Configuration
app.config.from_object(config['development'])

# Initialize extensions
db.init_app(app)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'bmp'}

load_dotenv('.env')

# Load model and utilities
model = None
le = None
pose_utils = PoseUtils()

# Configure Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'YOUR_GEMINI_API_KEY_HERE')
genai.configure(api_key=GEMINI_API_KEY)
gemini_model = genai.GenerativeModel('gemini-2.5-flash')

# Initialize TTS system
tts_system = AdvancedIndianTTSSystem()

# Load asana data
asana_data = None

def load_asana_data():
    """Load asana data from JSON file"""
    global asana_data
    try:
        with open('app/static/asana_data.json', 'r', encoding='utf-8') as f:  # Updated path
            asana_data = json.load(f)
        print("Asana data loaded successfully")
    except Exception as e:
        print(f"Error loading asana data: {e}")
        asana_data = {}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def load_model_and_encoder():
    """Load the trained model and label encoder"""
    global model, le
    try:
        model = load_model('models/yoga_pose_dnn_model.h5')
        with open('models/label_encoder_dnn.pkl', 'rb') as f:
            le = pickle.load(f)
        print("Model and encoder loaded successfully")
    except Exception as e:
        print(f"Error loading model: {e}")
        model = None
        le = None

# Traditional Sanskrit pose names mapping
traditional_names = {
    "Akarna_Dhanurasana": "Akarna Dhanurasana",
    "Bharadvajas_Twist_pose_or_Bharadvajasana_I_": "Bharadvajasana I",
    "Boat_Pose_or_Paripurna_Navasana_": "Paripurna Navasana",
    "Bound_Angle_Pose_or_Baddha_Konasana_": "Baddha Konasana",
    "Bow_Pose_or_Dhanurasana_": "Dhanurasana",
    "Bridge_Pose_or_Setu_Bandha_Sarvangasana_": "Setu Bandha Sarvangasana",
    "Camel_Pose_or_Ustrasana_": "Ustrasana",
    "Cat_Cow_Pose_or_Marjaryasana_": "Marjaryasana",
    "Chair_Pose_or_Utkatasana_": "Utkatasana",
    "Child_Pose_or_Balasana_": "Balasana",
    "Cobra_Pose_or_Bhujangasana_": "Bhujangasana",
    "Cockerel_Pose": "Kukkutasana",
    "Corpse_Pose_or_Savasana_": "Savasana",
    "Cow_Face_Pose_or_Gomukhasana_": "Gomukhasana",
    "Crane_(Crow)_Pose_or_Bakasana_": "Bakasana",
    "Dolphin_Plank_Pose_or_Makara_Adho_Mukha_Svanasana_": "Makara Adho Mukha Svanasana",
    "Dolphin_Pose_or_Ardha_Pincha_Mayurasana_": "Ardha Pincha Mayurasana",
    "Downward-Facing_Dog_pose_or_Adho_Mukha_Svanasana_": "Adho Mukha Svanasana",
    "Eagle_Pose_or_Garudasana_": "Garudasana",
    "Eight-Angle_Pose_or_Astavakrasana_": "Astavakrasana",
    "Extended_Puppy_Pose_or_Uttana_Shishosana_": "Uttana Shishosana",
    "Extended_Revolved_Side_Angle_Pose_or_Utthita_Parsvakonasana_": "Utthita Parsvakonasana",
    "Extended_Revolved_Triangle_Pose_or_Utthita_Trikonasana_": "Utthita Trikonasana",
    "Feathered_Peacock_Pose_or_Pincha_Mayurasana_": "Pincha Mayurasana",
    "Firefly_Pose_or_Tittibhasana_": "Tittibhasana",
    "Fish_Pose_or_Matsyasana_": "Matsyasana",
    "Four-Limbed_Staff_Pose_or_Chaturanga_Dandasana_": "Chaturanga Dandasana",
    "Frog_Pose_or_Bhekasana": "Bhekasana",
    "Garland_Pose_or_Malasana_": "Malasana",
    "Gate_Pose_or_Parighasana_": "Parighasana",
    "Half_Lord_of_the_Fishes_Pose_or_Ardha_Matsyendrasana_": "Ardha Matsyendrasana",
    "Half_Moon_Pose_or_Ardha_Chandrasana_": "Ardha Chandrasana",
    "Handstand_pose_or_Adho_Mukha_Vrksasana_": "Adho Mukha Vrksasana",
    "Happy_Baby_Pose_or_Ananda_Balasana_": "Ananda Balasana",
    "Head-to-Knee_Forward_Bend_pose_or_Janu_Sirsasana_": "Janu Sirsasana",
    "Heron_Pose_or_Krounchasana_": "Krounchasana",
    "Intense_Side_Stretch_Pose_or_Parsvottanasana_": "Parsvottanasana",
    "Legs-Up-the-Wall_Pose_or_Viparita_Karani_": "Viparita Karani",
    "Locust_Pose_or_Salabhasana_": "Salabhasana",
    "Lord_of_the_Dance_Pose_or_Natarajasana_": "Natarajasana",
    "Low_Lunge_pose_or_Anjaneyasana_": "Anjaneyasana",
    "Noose_Pose_or_Pasasana_": "Pasasana",
    "Peacock_Pose_or_Mayurasana_": "Mayurasana",
    "Pigeon_Pose_or_Kapotasana_": "Kapotasana",
    "Plank_Pose_or_Kumbhakasana_": "Kumbhakasana",
    "Plow_Pose_or_Halasana_": "Halasana",
    "Pose_Dedicated_to_the_Sage_Koundinya_or_Eka_Pada_Koundinyanasana_I_and_II": "Eka Pada Koundinyanasana",
    "Rajakapotasana": "Rajakapotasana",
    "Reclining_Hand-to-Big-Toe_Pose_or_Supta_Padangusthasana_": "Supta Padangusthasana",
    "Revolved_Head-to-Knee_Pose_or_Parivrtta_Janu_Sirsasana_": "Parivrtta Janu Sirsasana",
    "Scale_Pose_or_Tolasana_": "Tolasana",
    "Scorpion_pose_or_vrischikasana": "Vrischikasana",
    "Seated_Forward_Bend_pose_or_Paschimottanasana_": "Paschimottanasana",
    "Shoulder-Pressing_Pose_or_Bhujapidasana_": "Bhujapidasana",
    "Side-Reclining_Leg_Lift_pose_or_Anantasana_": "Anantasana",
    "Side_Crane_(Crow)_Pose_or_Parsva_Bakasana_": "Parsva Bakasana",
    "Side_Plank_Pose_or_Vasisthasana_": "Vasisthasana",
    "Sitting pose 1 (normal)": "Sukhasana",
    "Split pose": "Hanumanasana",
    "Staff_Pose_or_Dandasana_": "Dandasana",
    "Standing_Forward_Bend_pose_or_Uttanasana_": "Uttanasana",
    "Standing_Split_pose_or_Urdhva_Prasarita_Eka_Padasana_": "Urdhva Prasarita Eka Padasana",
    "Standing_big_toe_hold_pose_or_Utthita_Padangusthasana": "Utthita Padangusthasana",
    "Supported_Headstand_pose_or_Salamba_Sirsasana_": "Salamba Sirsasana",
    "Supported_Shoulderstand_pose_or_Salamba_Sarvangasana_": "Salamba Sarvangasana",
    "Supta_Baddha_Konasana_": "Supta Baddha Konasana",
    "Supta_Virasana_Vajrasana": "Supta Virasana",
    "Tortoise_Pose": "Kurmasana",
    "Tree_Pose_or_Vrksasana_": "Vrksasana",
    "Upward_Bow_(Wheel)_Pose_or_Urdhva_Dhanurasana_": "Urdhva Dhanurasana",
    "Upward_Facing_Two-Foot_Staff_Pose_or_Dwi_Pada_Viparita_Dandasana_": "Dwi Pada Viparita Dandasana",
    "Upward_Plank_Pose_or_Purvottanasana_": "Purvottanasana",
    "Virasana_or_Vajrasana": "Vajrasana",
    "Warrior_III_Pose_or_Virabhadrasana_III_": "Virabhadrasana III",
    "Warrior_II_Pose_or_Virabhadrasana_II_": "Virabhadrasana II",
    "Warrior_I_Pose_or_Virabhadrasana_I_": "Virabhadrasana I",
    "Wide-Angle_Seated_Forward_Bend_pose_or_Upavistha_Konasana_": "Upavistha Konasana",
    "Wide-Legged_Forward_Bend_pose_or_Prasarita_Padottanasana_": "Prasarita Padottanasana",
    "Wild_Thing_pose_or_Camatkarasana_": "Camatkarasana",
    "Wind_Relieving_pose_or_Pawanmuktasana": "Pawanmuktasana",
    "Yogic_sleep_pose": "Yoga Nidra",
    "viparita_virabhadrasana_or_reverse_warrior_pose": "Viparita Virabhadrasana"
}


def get_traditional_name(pose_name):
    """Get traditional Sanskrit name for a pose"""
    return traditional_names.get(pose_name, pose_name)

def get_pose_instructions_and_feedback(pose_name, language="en"):
    """Get instructions and feedback for a yoga pose using Gemini API"""
    try:
        traditional_name = get_traditional_name(pose_name)
        
        if not gemini_model:
            fallback_instructions = f"""
            - Arms extended overhead
            - Legs hip-width apart
            - Head neutral
            - Engage core
            - Breathe steadily
            """
            fallback_feedback = f"Focus on your breathing and maintain steady alignment while performing {traditional_name}."
            return fallback_instructions, fallback_feedback
        
        language_names = {
            "en": "Indian English",
            "hi": "Hindi",
            "kn": "Kannada", 
            "ta": "Tamil",
            "te": "Telugu",
            "mr": "Marathi"
        }
        
        target_lang_name = language_names.get(language, "Indian English")
        
        instructions_prompt = f"""
        Provide very brief, key-point instructions for the yoga pose: {traditional_name}
        Language: {target_lang_name}
        
        Focus ONLY on the most essential elements:
        - Arms position (up, down, extended, etc.)
        - Legs position (straight, bent, apart, etc.) 
        - Head position (neutral, looking up/down, etc.)
        - Core engagement
        - Breathing
        
        Format as simple bullet points. Keep each point under 8 words.
        Make it suitable for text-to-speech - clear and concise.
        
        Example format:
        - Arms extended overhead
        - Legs hip-width apart
        - Head neutral
        - Engage core
        - Breathe steadily
        """
        
        feedback_prompt = f"""
        Provide a very brief feedback tip for the yoga pose: {traditional_name}
        Language: {target_lang_name}
        
        Give ONE key tip focusing on the most common mistake or important alignment point.
        Keep it under 15 words and make it encouraging.
        
        Example: "Keep your spine straight and shoulders relaxed"
        """
        instructions_response = gemini_model.generate_content(instructions_prompt)
        feedback_response = gemini_model.generate_content(feedback_prompt)
        
        instructions_text = instructions_response.text
        feedback_text = feedback_response.text
        
        # Clean up the responses
        if "INSTRUCTIONS:" in instructions_text:
            instructions_text = instructions_text.split("INSTRUCTIONS:")[1].strip()
        if "FEEDBACK:" in feedback_text:
            feedback_text = feedback_text.split("FEEDBACK:")[1].strip()
            
        return instructions_text, feedback_text
        
          
    except Exception as e:
        print(f"Error getting Gemini response: {e}")
        fallback_instructions = f"""
        - Arms extended overhead
        - Legs hip-width apart
        - Head neutral
        - Engage core
        - Breathe steadily
        """
        fallback_feedback = f"Focus on your breathing and maintain steady alignment while performing {traditional_name}."
        return fallback_instructions, fallback_feedback

# Flask-Login setup
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return User.find_by_id(user_id)

# ==================== AUTHENTICATION ROUTES ====================

@app.route('/')
def index():
    """Render the main page"""
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        
        # Check if user exists
        if User.find_by_username(username) or User.find_by_email(email):
            flash('Username or email already exists', 'error')
            return render_template('register.html')
        
        # Create new user
        User.create_user(username, email, password)
        flash('Registration successful! Please login.', 'success')
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        user = User.find_by_username(username)
        
        if user and user.check_password(password):
            login_user(user)
            user.update_login_stats()
            
            flash('Login successful!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid username or password', 'error')
    
    return render_template('login.html')

@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html', user=current_user)

@app.route('/api/user/progress')
@login_required
def user_progress():
    user_sessions = get_user_sessions(current_user.id)
    return jsonify(user_sessions)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('login'))

# ==================== YOGA POSE DETECTION ROUTES ====================

@app.route('/predict', methods=['POST'])
def predict():
    """Handle image upload and prediction"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'})
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'})
    
    if file and allowed_file(file.filename):
        # Save the uploaded file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Read and process the image
        image = cv2.imread(filepath)
        if image is None:
            return jsonify({'error': 'Could not read image'})
        
        # Extract landmarks only (DNN model uses only landmarks)
        landmarks, results = pose_utils.extract_landmarks(image)
        if landmarks is None:
            return jsonify({'error': 'No pose detected in the image'})
        
        # Prepare landmarks for prediction
        landmarks = np.expand_dims(landmarks, axis=0)
        
        # Make prediction using only landmarks
        prediction = model.predict(landmarks)
        class_idx = np.argmax(prediction)
        confidence = prediction[0][class_idx]
        pose_name = le.inverse_transform([class_idx])[0]
        
        # Draw landmarks on image
        annotated_image = pose_utils.draw_landmarks(image, results)
        annotated_filename = f"annotated_{filename}"
        annotated_filepath = os.path.join(app.config['UPLOAD_FOLDER'], annotated_filename)
        cv2.imwrite(annotated_filepath, annotated_image)
        
        # Return results
        return jsonify({
            'pose': pose_name,
            'confidence': float(confidence),
            'image_url': f"/static/uploads/{annotated_filename}"
        })
    
    return jsonify({'error': 'Invalid file type'})

@app.route('/get_instructions', methods=['POST'])
def get_instructions():
    """Get instructions and feedback for a pose"""
    data = request.get_json()
    pose_name = data.get('pose_name', '')
    language = data.get('language', 'en')
    
    if not pose_name:
        return jsonify({'error': 'No pose name provided'})
    
    instructions, feedback = get_pose_instructions_and_feedback(pose_name, language)
    
    return jsonify({
        'instructions': instructions,
        'feedback': feedback
    })

@app.route('/webcam')
def webcam():
    """Webcam pose detection page"""
    return render_template('webcam.html')

@app.route('/test')
def test():
    """Test button functionality"""
    return send_file('test_button.html')

# Add this to handle MongoDB connection errors gracefully
@app.before_request
def check_db_connection():
    """Check if database is connected before each request"""
    if request.endpoint and request.endpoint not in ['static', 'index']:
        if db.db is None:
            flash('Database connection unavailable. Some features may not work.', 'warning')

if __name__ == '__main__':
    # Load model before starting the server
    load_model_and_encoder()
    
    # Load asana data
    load_asana_data()
    
    # Create upload directory if it doesn't exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Run the Flask app
    app.run(debug=True, host='0.0.0.0', port=5000)