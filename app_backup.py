import os
import cv2
import numpy as np
from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
import tensorflow as tf
from tensorflow.keras.models import load_model
import pickle
from utils.pose_utils import PoseUtils

# Initialize Flask app
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'app/static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'bmp'}

# Load model and utilities
model = None
le = None
pose_utils = PoseUtils()

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
        
        # Extract landmarks and preprocess image
        landmarks, results = pose_utils.extract_landmarks(image)
        if landmarks is None:
            return jsonify({'error': 'No pose detected in the image'})
        
        processed_image = pose_utils.preprocess_image(image)
        processed_image = np.expand_dims(processed_image, axis=0)
        landmarks = np.expand_dims(landmarks, axis=0)
        
        # Make prediction
        prediction = model.predict([processed_image, landmarks])
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