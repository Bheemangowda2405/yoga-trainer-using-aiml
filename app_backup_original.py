import os
import cv2
import numpy as np
from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
import tensorflow as tf
from tensorflow.keras.models import load_model
import pickle
from utils.pose_utils import PoseUtils
import google.generativeai as genai
from dotenv import load_dotenv

# Initialize Flask app
app = Flask(__name__, template_folder="app/templates", static_folder="app/static")
app.config['UPLOAD_FOLDER'] = 'app/static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'bmp'}

load_dotenv('/home/chinmay/coding-ubuntu/hybrid_approach/.env')  # will read .env in current working directory

# Load model and utilities
model = None
le = None
pose_utils = PoseUtils()

# Configure Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'YOUR_GEMINI_API_KEY_HERE')
genai.configure(api_key=GEMINI_API_KEY)
gemini_model = genai.GenerativeModel('gemini-2.5-flash')

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

def get_pose_instructions_and_feedback(pose_name):
    """Get instructions and feedback for a yoga pose using Gemini API"""
    try:
        instructions_prompt = f"""
        Provide detailed step-by-step instructions for the yoga pose: {pose_name}
        
        Format the response as:
        INSTRUCTIONS:
        - Step 1
        - Step 2
        - Step 3
        etc.
        
        Keep instructions clear, concise, and beginner-friendly. Focus on proper body alignment and positioning.
        """
        
        feedback_prompt = f"""
        Provide helpful feedback and tips for improving the yoga pose: {pose_name}
        
        Format the response as:
        FEEDBACK:
        [Provide 2-3 sentences of constructive feedback focusing on common mistakes, alignment tips, and how to improve the pose]
        
        Keep feedback encouraging and educational.
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
        # Fallback instructions
        fallback_instructions = f"""
        - Stand in a comfortable position
        - Focus on your breathing
        - Maintain proper alignment
        - Hold the pose for 10 seconds
        - Listen to your body and adjust as needed
        """
        fallback_feedback = f"Focus on your breathing and maintain steady alignment while performing {pose_name}. Listen to your body and adjust the pose as needed."
        return fallback_instructions, fallback_feedback

@app.route('/')
def index():
    """Render the main page"""
    return render_template('index.html')

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
    
    if not pose_name:
        return jsonify({'error': 'No pose name provided'})
    
    instructions, feedback = get_pose_instructions_and_feedback(pose_name)
    
    return jsonify({
        'instructions': instructions,
        'feedback': feedback
    })

@app.route('/webcam')
def webcam():
    """Webcam pose detection page"""
    return render_template('webcam.html')

if __name__ == '__main__':
    # Load model before starting the server
    load_model_and_encoder()
    
    # Create upload directory if it doesn't exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Run the Flask app
    app.run(debug=True, host='0.0.0.0', port=5000)
