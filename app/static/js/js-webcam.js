// Global variables
let stream = null;
let loopHandle = null;
let currentPose = null;
let poseStartTime = null;
let lastAnnouncedPose = null;
let currentLanguage = 'en';
let timerInterval = null;
let asanaData = null;
let lastSpokenPose = null;
let isSpeaking = false;
let currentUserId = window.currentUserId || null;
let poseDetectionCount = 0;

// Session tracking variables
let sessionActive = false;
let sessionId = null;
let sessionStartTime = null;
let detectedPoses = new Map(); // Track poses and their durations

const CAPTURE_MS = 1500; // Reduced to 1.5 seconds for faster detection
const POSE_CONFIRMATION_TIME = 1500; // Reduced to 1.5 seconds for faster voice feedback
const MIN_CONFIDENCE_FOR_LOGGING = 0.85; // Only log poses with 85%+ confidence



// Full pose names with Sanskrit names, benefits, and contraindications
const poseNames = {
    'Tree_Pose_or_Vrksasana_': {
        english: 'Tree Pose',
        sanskrit: 'Vrksasana (वृक्षासन)',
        full: 'Tree Pose (Vrksasana)',
        benefits: 'Strengthens legs, improves balance, stretches hips and thighs, enhances focus and concentration',
        contraindications: 'Avoid if you have low blood pressure, ankle or knee injuries, or severe balance issues',
        timing: 'Best done on empty stomach, early morning or evening. Hold for 30-60 seconds per side.'
    },
    'Downward-Facing_Dog_pose_or_Adho_Mukha_Svanasana_': {
        english: 'Downward-Facing Dog',
        sanskrit: 'Adho Mukha Svanasana (अधो मुख श्वानासन)',
        full: 'Downward-Facing Dog (Adho Mukha Svanasana)',
        benefits: 'Strengthens arms and legs, stretches spine, improves circulation, energizes the body',
        contraindications: 'Avoid if you have carpal tunnel syndrome, high blood pressure, or wrist injuries',
        timing: 'Best on empty stomach. Hold for 1-3 minutes. Can be done anytime of day.'
    },
    'Warrior_I_Pose_or_Virabhadrasana_I_': {
        english: 'Warrior I',
        sanskrit: 'Virabhadrasana I (वीरभद्रासन प्रथम)',
        full: 'Warrior I (Virabhadrasana I)',
        benefits: 'Strengthens legs, opens hips and chest, improves balance, builds stamina',
        contraindications: 'Avoid if you have knee or ankle injuries, high blood pressure, or heart problems',
        timing: 'Best on empty stomach. Hold for 30-60 seconds per side. Morning or evening.'
    },
    'Warrior_II_Pose_or_Virabhadrasana_II_': {
        english: 'Warrior II',
        sanskrit: 'Virabhadrasana II (वीरभद्रासन द्वितीय)',
        full: 'Warrior II (Virabhadrasana II)',
        benefits: 'Strengthens legs and arms, improves stamina, stretches groin and chest',
        contraindications: 'Avoid if you have knee or ankle injuries, or severe arthritis',
        timing: 'Best on empty stomach. Hold for 30-60 seconds per side. Any time of day.'
    },
    'Child_Pose_or_Balasana_': {
        english: 'Child Pose',
        sanskrit: 'Balasana (बालासन)',
        full: 'Child Pose (Balasana)',
        benefits: 'Calms the mind, relieves stress, stretches hips and thighs, gentle back stretch',
        contraindications: 'Avoid if you have knee injuries or are pregnant (modify with props)',
        timing: 'Can be done anytime, even after meals. Hold for 1-3 minutes or longer.'
    },
    'Cobra_Pose_or_Bhujangasana_': {
        english: 'Cobra Pose',
        sanskrit: 'Bhujangasana (भुजंगासन)',
        full: 'Cobra Pose (Bhujangasana)',
        benefits: 'Strengthens spine, opens chest, improves posture, stimulates abdominal organs',
        contraindications: 'Avoid if you have back injuries, carpal tunnel syndrome, or are pregnant',
        timing: 'Best on empty stomach. Hold for 15-30 seconds. Morning or evening.'
    },
    'Plank_Pose_or_Kumbhakasana_': {
        english: 'Plank Pose',
        sanskrit: 'Kumbhakasana (कुम्भकासन)',
        full: 'Plank Pose (Kumbhakasana)',
        benefits: 'Strengthens core, arms, and shoulders, improves posture, builds endurance',
        contraindications: 'Avoid if you have carpal tunnel syndrome, shoulder injuries, or high blood pressure',
        timing: 'Best on empty stomach. Hold for 30-60 seconds. Any time of day.'
    },
    'Bridge_Pose_or_Setu_Bandha_Sarvangasana_': {
        english: 'Bridge Pose',
        sanskrit: 'Setu Bandha Sarvangasana (सेतु बन्ध सर्वांगासन)',
        full: 'Bridge Pose (Setu Bandha Sarvangasana)',
        benefits: 'Strengthens back and legs, opens chest, improves spinal flexibility, calms the mind',
        contraindications: 'Avoid if you have neck injuries, high blood pressure, or severe back problems',
        timing: 'Best on empty stomach. Hold for 30-60 seconds. Morning or evening.'
    },
    'Corpse_Pose_or_Savasana_': {
        english: 'Corpse Pose',
        sanskrit: 'Savasana (शवासन)',
        full: 'Corpse Pose (Savasana)',
        benefits: 'Deep relaxation, reduces stress, lowers blood pressure, improves sleep quality',
        contraindications: 'No contraindications - suitable for everyone',
        timing: 'Can be done anytime. Hold for 5-15 minutes. Best at the end of practice.'
    },
    'Chair_Pose_or_Utkatasana_': {
        english: 'Chair Pose',
        sanskrit: 'Utkatasana (उत्कटासन)',
        full: 'Chair Pose (Utkatasana)',
        benefits: 'Strengthens legs and core, improves balance, tones glutes and thighs',
        contraindications: 'Avoid if you have knee injuries, low blood pressure, or severe arthritis',
        timing: 'Best on empty stomach. Hold for 30-60 seconds. Morning or evening.'
    },
    'Mountain_Pose_or_Tadasana_': {
        english: 'Mountain Pose',
        sanskrit: 'Tadasana (ताडासन)',
        full: 'Mountain Pose (Tadasana)'
    },
    'Forward_Fold_or_Uttanasana_': {
        english: 'Forward Fold',
        sanskrit: 'Uttanasana (उत्तानासन)',
        full: 'Forward Fold (Uttanasana)'
    },
    'Triangle_Pose_or_Trikonasana_': {
        english: 'Triangle Pose',
        sanskrit: 'Trikonasana (त्रिकोणासन)',
        full: 'Triangle Pose (Trikonasana)'
    },
    'Half_Moon_Pose_or_Ardha_Chandrasana_': {
        english: 'Half Moon Pose',
        sanskrit: 'Ardha Chandrasana (अर्ध चन्द्रासन)',
        full: 'Half Moon Pose (Ardha Chandrasana)'
    },
    'Eagle_Pose_or_Garudasana_': {
        english: 'Eagle Pose',
        sanskrit: 'Garudasana (गरुडासन)',
        full: 'Eagle Pose (Garudasana)'
    },
    'Camel_Pose_or_Ustrasana_': {
        english: 'Camel Pose',
        sanskrit: 'Ustrasana (उष्ट्रासन)',
        full: 'Camel Pose (Ustrasana)'
    },
    'Fish_Pose_or_Matsyasana_': {
        english: 'Fish Pose',
        sanskrit: 'Matsyasana (मत्स्यासन)',
        full: 'Fish Pose (Matsyasana)'
    },
    'Lotus_Pose_or_Padmasana_': {
        english: 'Lotus Pose',
        sanskrit: 'Padmasana (पद्मासन)',
        full: 'Lotus Pose (Padmasana)'
    },
    'Seated_Forward_Bend_or_Paschimottanasana_': {
        english: 'Seated Forward Bend',
        sanskrit: 'Paschimottanasana (पश्चिमोत्तानासन)',
        full: 'Seated Forward Bend (Paschimottanasana)'
    },
    'Revolved_Triangle_or_Parivrtta_Trikonasana_': {
        english: 'Revolved Triangle',
        sanskrit: 'Parivrtta Trikonasana (परिवृत्त त्रिकोणासन)',
        full: 'Revolved Triangle (Parivrtta Trikonasana)'
    }
};

// DOM elements
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const poseNameEl = document.getElementById('poseName');
const confidenceValueBottom = document.getElementById('confidenceValueBottom');
const detectionAccuracy = document.getElementById('detectionAccuracy');
const instructionsList = document.getElementById('instructionsList');
const instructionsPanel = document.getElementById('instructionsPanel');
const togglePanelBtn = document.getElementById('togglePanelBtn');
const poseNameFull = document.getElementById('poseNameFull');
const sanskritName = document.getElementById('sanskritName');
const confidenceValueAnalysis = document.getElementById('confidenceValueAnalysis');
const confidenceBarAnalysis = document.getElementById('confidenceBarAnalysis');

// Body measurement elements
const spineAngle = document.getElementById('spineAngle');
const kneeAngle = document.getElementById('kneeAngle');
const hipAngle = document.getElementById('hipAngle');
const shoulderAngle = document.getElementById('shoulderAngle');
const armSpan = document.getElementById('armSpan');
const legLength = document.getElementById('legLength');
const torsoLength = document.getElementById('torsoLength');
const balanceScore = document.getElementById('balanceScore');
const benefitsText = document.getElementById('benefitsText');
const contraindicationsText = document.getElementById('contraindicationsText');
const benefitsContent = document.getElementById('benefitsContent');
const contraindicationsContent = document.getElementById('contraindicationsContent');
const benefitsBtn = document.getElementById('benefitsBtn');
const panelTitle = document.getElementById('panelTitle');
const languageSelect = document.getElementById('languageSelect');

// Load asana data from JSON file
async function loadAsanaData() {
    try {
        const response = await fetch('/static/asana_data.json');
        if (!response.ok) {
            throw new Error('Failed to load asana data');
        }
        asanaData = await response.json();
        console.log('Asana data loaded successfully');
        console.log('Available poses:', Object.keys(asanaData));
        
        // Test with a known pose
        const testPose = 'Tree_Pose_or_Vrksasana_';
        if (asanaData[testPose]) {
            console.log('Test pose data:', asanaData[testPose]);
        }
    } catch (error) {
        console.error('Error loading asana data:', error);
        asanaData = null;
    }
}

// Debug function to test pose matching
window.testPoseMatching = function(poseName) {
    console.log('Testing pose matching for:', poseName);
    const result = getPoseDataFromJSON(poseName);
    console.log('Result:', result);
    return result;
};

// Debug function to test warnings display
window.testWarningsDisplay = function(poseName) {
    console.log('Testing warnings display for:', poseName);
    const jsonData = getPoseDataFromJSON(poseName);
    console.log('JSON data:', jsonData);
    if (jsonData && jsonData.warnings) {
        console.log('Warnings found:', jsonData.warnings);
        const formatted = formatAsBulletPoints(jsonData.warnings);
        console.log('Formatted warnings:', formatted);
        return formatted;
    } else {
        console.log('No warnings found in JSON data');
        return null;
    }
};

// Debug function to show all available poses
window.showAllPoses = function() {
    if (asanaData) {
        console.log('All available poses:', Object.keys(asanaData));
        return Object.keys(asanaData);
    } else {
        console.log('Asana data not loaded');
        return null;
    }
};


// Initialization moved to end of file


async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: 'user'
            } 
        });
        video.srcObject = stream;
        video.style.display = 'block'; // Make video visible
        await video.play();
        
        // Video setup complete
        
        return true;
    } catch (err) {
        console.error('Failed to start camera', err);
        return false;
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    if (video.srcObject) {
        video.srcObject = null;
    }
    video.style.display = 'none'; // Hide video when stopped
}




async function getInstructionsAndFeedback(poseName) {
    try {
        const response = await fetch('/get_instructions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                pose_name: poseName,
                language: 'en'
            })
        });
        
        const data = await response.json();
        if (data.error) return null;
        
        return {
            instructions: data.instructions,
            feedback: data.feedback
        };
    } catch (error) {
        console.error('Error fetching instructions:', error);
        return null;
    }
}

async function getPoseBenefits(poseName) {
    try {
        console.log('Fetching benefits via Gemini for pose:', poseName);
        const response = await fetch('/get_pose_benefits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                pose_name: poseName,
                language: 'en'
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Gemini API response:', data);
        
        if (data.error) {
            console.error('API error:', data.error);
            return null;
        }
        
        return {
            benefits: data.benefits,
            contraindications: data.contraindications
        };
    } catch (error) {
        console.error('Error fetching pose benefits from Gemini:', error);
        return null;
    }
}

async function getBodyMeasurements(poseName, landmarks) {
    try {
        const response = await fetch('/get_body_measurements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                pose_name: poseName,
                landmarks: landmarks
            })
        });
        
        const data = await response.json();
        if (data.error) return null;
        
        return data;
    } catch (error) {
        console.error('Error fetching body measurements:', error);
        return null;
    }
}

function updateInstructions(instructions) {
    if (instructions) {
        const lines = instructions.split('\n').filter(line => line.trim());
        instructionsList.innerHTML = '';
        
        lines.forEach(line => {
            if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
                const li = document.createElement('li');
                li.textContent = line.trim().substring(1).trim();
                instructionsList.appendChild(li);
            } else if (line.trim()) {
                const li = document.createElement('li');
                li.textContent = line.trim();
                instructionsList.appendChild(li);
            }
        });
    }
}


function getPoseInfo(poseName) {
    return poseNames[poseName] || {
        english: poseName,
        sanskrit: poseName,
        full: poseName
    };
}

// Get pose data from asana_data.json
function getPoseDataFromJSON(poseName) {
    if (!asanaData) {
        console.log('Asana data not loaded yet');
        return null;
    }
    
    console.log('Looking for pose:', poseName);
    console.log('Available poses:', Object.keys(asanaData));
    
    // Try to find the pose in the JSON data with better matching
    for (const [key, data] of Object.entries(asanaData)) {
        const keyLower = key.toLowerCase();
        const poseLower = poseName.toLowerCase();
        
        // Extract key parts for better matching
        const keyParts = keyLower.split(/[_\s-]+/);
        const poseParts = poseLower.split(/[_\s-]+/);
        
        // Check for exact match first
        if (keyLower === poseLower) {
            console.log('Exact match found:', key);
            return data;
        }
        
        // Check if any key part matches any pose part
        const hasMatchingPart = keyParts.some(keyPart => 
            poseParts.some(posePart => 
                keyPart.includes(posePart) || posePart.includes(keyPart)
            )
        );
        
        // More flexible matching
        if (keyLower.includes(poseLower) || 
            poseLower.includes(keyLower) ||
            keyLower.replace(/[_\s-]/g, '').includes(poseLower.replace(/[_\s-]/g, '')) ||
            poseLower.replace(/[_\s-]/g, '').includes(keyLower.replace(/[_\s-]/g, '')) ||
            hasMatchingPart) {
            console.log('Found matching pose:', key);
            return data;
        }
    }
    
    console.log('No matching pose found for:', poseName);
    return null;
}

// Format benefits and warnings as bullet points
function formatAsBulletPoints(items) {
    if (!items || !Array.isArray(items)) return 'No information available.';
    
    return items.map(item => `• ${item}`).join('\n');
}

// Voice feedback functions
async function speakPoseName(poseName, language = 'en') {
    if (isSpeaking || poseName === lastSpokenPose) {
        return; // Don't speak if already speaking or same pose
    }
    
    const traditionalName = getTraditionalName(poseName);
    console.log(`🎤 Speaking pose: ${traditionalName} in ${language}`);
    
    try {
        isSpeaking = true;
        lastSpokenPose = poseName;
        
        const response = await fetch('/speak_pose_name', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                pose_name: poseName,
                language: language
            })
        });
        
        const data = await response.json();
        if (data.success) {
            console.log('✅ Pose name spoken successfully');
        } else {
            console.error('❌ Failed to speak pose name:', data.message);
        }
    } catch (error) {
        console.error('❌ Error speaking pose name:', error);
    } finally {
        // Reset speaking flag after a delay
        setTimeout(() => {
            isSpeaking = false;
        }, 2000);
    }
}

// Get traditional Sanskrit name for a pose (matches Python backend mapping)
function getTraditionalName(poseName) {
    const traditionalNames = {
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
    };
    
    return traditionalNames[poseName] || poseName;
}

async function updatePoseDisplay(poseName, confidence, landmarks = null) {
    const poseInfo = getPoseInfo(poseName);
    const confidencePercent = Math.round(confidence * 100);
    
    // Always update analysis box with current data
    confidenceValueAnalysis.textContent = confidencePercent + '%';
    confidenceBarAnalysis.style.width = confidencePercent + '%';
    
    // Update body angles - try to get real measurements if landmarks available
    if (landmarks && confidence >= 0.85) {
        try {
            const measurements = await getBodyMeasurements(poseName, landmarks);
            if (measurements) {
                updateBodyAngles(poseName, confidence, measurements);
            } else {
    updateBodyAngles(poseName, confidence);
            }
        } catch (error) {
            console.error('Error getting body measurements:', error);
            updateBodyAngles(poseName, confidence);
        }
    } else {
        updateBodyAngles(poseName, confidence);
    }
    
    // Only show pose names if accuracy is 85% and above
    if (confidence >= 0.85) {
        // Get traditional name from the backend mapping
        const traditionalName = getTraditionalName(poseName);
        
        // Update main pose name with traditional Sanskrit name only
        poseNameEl.textContent = traditionalName;
        
        // Update analysis box - show English name in analysis box
        poseNameFull.textContent = poseInfo.english || poseName;
        sanskritName.textContent = traditionalName;
        
        // Set current pose for info buttons - use the original pose name for JSON matching
        currentPoseForInfo = poseName;
        console.log('Current pose set for info:', currentPoseForInfo);
        
        // Update benefits information
        updateBenefitsInfo(poseInfo);
        
        // Show accuracy in bottom bar
        confidenceValueBottom.textContent = confidencePercent + '%';
        detectionAccuracy.style.display = 'flex';
        
        // Immediate voice feedback for pose detection
        if (poseName !== lastSpokenPose) {
            speakPoseName(poseName, currentLanguage);
        }
    } else {
        // Hide pose names and accuracy when below 85%
        poseNameEl.textContent = '—';
        poseNameFull.textContent = '—';
        sanskritName.textContent = '—';
        detectionAccuracy.style.display = 'none';
        
        // Clear benefits info
        benefitsText.textContent = 'Start session to see pose benefits';
        contraindicationsText.style.display = 'none';
        currentPoseForInfo = null;
    }
}

function updateBodyAngles(poseName, confidence, measurements = null) {
    if (measurements) {
        // Use real measurements from API
        spineAngle.textContent = measurements.spine_angle + '°';
        kneeAngle.textContent = measurements.knee_angle + '°';
        hipAngle.textContent = measurements.hip_angle + '°';
        shoulderAngle.textContent = measurements.shoulder_angle + '°';
        armSpan.textContent = measurements.arm_span + ' cm';
        legLength.textContent = measurements.leg_length + ' cm';
        torsoLength.textContent = measurements.torso_length + ' cm';
        balanceScore.textContent = measurements.balance_score + '%';
    } else {
        // Fallback to simulated measurements
    const angles = calculateBodyAngles(poseName, confidence);
    spineAngle.textContent = angles.spine + '°';
    kneeAngle.textContent = angles.knee + '°';
    hipAngle.textContent = angles.hip + '°';
    shoulderAngle.textContent = angles.shoulder + '°';
        armSpan.textContent = angles.arm_span + ' cm';
        legLength.textContent = angles.leg_length + ' cm';
        torsoLength.textContent = angles.torso_length + ' cm';
        balanceScore.textContent = angles.balance_score + '%';
    }
}

function calculateBodyAngles(poseName, confidence) {
    // Simulate angle calculations based on pose type
    const baseAngles = {
        spine: Math.round(180 + (Math.random() - 0.5) * 20),
        knee: Math.round(90 + (Math.random() - 0.5) * 30),
        hip: Math.round(90 + (Math.random() - 0.5) * 20),
        shoulder: Math.round(90 + (Math.random() - 0.5) * 15),
        arm_span: Math.round(150 + (Math.random() - 0.5) * 20),
        leg_length: Math.round(80 + (Math.random() - 0.5) * 15),
        torso_length: Math.round(50 + (Math.random() - 0.5) * 10),
        balance_score: Math.round(85 + (Math.random() - 0.5) * 15)
    };
    
    // Adjust based on pose type
    if (poseName.includes('Tree') || poseName.includes('Vrksasana')) {
        baseAngles.knee = Math.round(45 + Math.random() * 20);
        baseAngles.hip = Math.round(60 + Math.random() * 20);
        baseAngles.balance_score = Math.round(70 + Math.random() * 20);
    } else if (poseName.includes('Warrior')) {
        baseAngles.knee = Math.round(90 + Math.random() * 30);
        baseAngles.hip = Math.round(45 + Math.random() * 30);
        baseAngles.balance_score = Math.round(80 + Math.random() * 15);
    } else if (poseName.includes('Child') || poseName.includes('Balasana')) {
        baseAngles.spine = Math.round(90 + Math.random() * 20);
        baseAngles.knee = Math.round(45 + Math.random() * 15);
        baseAngles.balance_score = Math.round(90 + Math.random() * 10);
    }
    
    return baseAngles;
}

function updateBenefitsInfo(poseInfo) {
    // Update current pose for info buttons
    currentPoseForInfo = poseInfo.english || poseInfo.full || poseInfo.sanskrit;
    
    // Store pose info for later use - use local data for instant availability
    if (poseInfo.benefits) {
        benefitsText.textContent = poseInfo.benefits;
    }
    if (poseInfo.contraindications) {
        contraindicationsText.textContent = poseInfo.contraindications;
    }
}


async function captureAndPredict() {
    if (!video.videoWidth || !video.videoHeight) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.7));
    const form = new FormData();
    form.append('file', new File([blob], 'frame.jpg', { type: 'image/jpeg' }));

    try {
        const res = await fetch('/predict', { method: 'POST', body: form });
        const data = await res.json();
        if (data.error) {
            console.error(data.error);
            return;
        }
        
        // Update current pose for info buttons
        if (data.confidence >= 0.85) {
            console.log(`🎯 Detected pose: ${data.pose} with ${Math.round(data.confidence * 100)}% confidence`)
            
            // Log the activity to database
            await logPoseDetection(data.pose, data.confidence);
        
        // For now, we'll use simulated landmarks since we need to extract them from MediaPipe
        // In a real implementation, you would extract landmarks from the MediaPipe results
            const simulatedLandmarks = generateSimulatedLandmarks(data.pose, data.confidence);
            await updatePoseDisplay(data.pose, data.confidence, simulatedLandmarks);

            currentPoseForInfo = data.pose;
        }
        // Optimized pose confirmation logic - only show when accuracy >= 85%
        if (data.pose === currentPose) {
            if (poseStartTime && (Date.now() - poseStartTime) >= POSE_CONFIRMATION_TIME) {
                if (data.pose !== lastAnnouncedPose && data.confidence >= 0.85) {
                    lastAnnouncedPose = data.pose;
                    
                    // Get instructions and feedback in parallel for speed
                    const instructionsData = await getInstructionsAndFeedback(data.pose);
                    if (instructionsData) {
                        updateInstructions(instructionsData.instructions);
                    }
                    
                    // Reset timer for next pose
                    poseStartTime = Date.now();
                }
            }
        } else {
            // New pose detected, reset timer
            currentPose = data.pose;
            poseStartTime = Date.now();
            lastAnnouncedPose = null;
        }
        
    } catch (e) {
        console.error(e);
    }
}

function generateSimulatedLandmarks(poseName, confidence) {
    // Generate simulated landmarks for testing
    // In a real implementation, these would come from MediaPipe pose detection
    const landmarks = [];
    for (let i = 0; i < 33; i++) {
        landmarks.push([
            Math.random() * 2 - 1,  // x coordinate
            Math.random() * 2 - 1,  // y coordinate
            Math.random() * 2 - 1   // z coordinate
        ]);
    }
    return landmarks.flat();
}

function startLoop() {
    if (loopHandle) return;
    poseStartTime = Date.now();
    lastAnnouncedPose = null;
    
    captureAndPredict();
    loopHandle = setInterval(captureAndPredict, CAPTURE_MS);
}

function stopLoop() {
    if (loopHandle) {
        clearInterval(loopHandle);
        loopHandle = null;
    }
}

function resetUI() {
    poseNameEl.textContent = '—';
    poseNameFull.textContent = '—';
    sanskritName.textContent = '—';
    confidenceValueBottom.textContent = '—';
    confidenceValueAnalysis.textContent = '—';
    confidenceBarAnalysis.style.width = '0%';
    detectionAccuracy.style.display = 'none';
    instructionsList.innerHTML = '<li>Start session to see pose instructions</li>';
    
    // Reset body measurements
    spineAngle.textContent = '—';
    kneeAngle.textContent = '—';
    hipAngle.textContent = '—';
    shoulderAngle.textContent = '—';
    armSpan.textContent = '—';
    legLength.textContent = '—';
    torsoLength.textContent = '—';
    balanceScore.textContent = '—';
    
    // Reset panel content
    benefitsContent.style.display = 'none';
    contraindicationsContent.style.display = 'none';
    instructionsList.style.display = 'block';
    panelTitle.textContent = '📋 Pose Instructions';
    
    // Reset button states
    benefitsBtn.classList.remove('active');
    
    // Reset visibility states
    benefitsVisible = false;
    
    poseStartTime = null;
    lastAnnouncedPose = null;
    currentPoseForInfo = null;
}

startBtn.addEventListener('click', async () => {
    // Start camera first
    const cameraStarted = await startCamera();
    if (cameraStarted) {
        // Initialize session tracking
        sessionActive = true;
        sessionId = generateSessionId();
        sessionStartTime = new Date();
        detectedPoses.clear();
        poseDetectionCount = 0;
        
        console.log('🎯 Session started:', sessionId);
        
        startLoop();
        startBtn.disabled = true;
        stopBtn.disabled = false;
    }
});

stopBtn.addEventListener('click', async () => {
    stopLoop();
    stopCamera(); // Stop the webcam when end session is pressed
    
    // Save session data before resetting
    if (sessionActive) {
        await saveSessionData();
        sessionActive = false;
        console.log('✅ Session ended and saved');
    }
    
    resetUI();
    // Enable start button for restart
    startBtn.disabled = false;
    stopBtn.disabled = true;
});

// Toggle panel functionality
let panelVisible = false;

togglePanelBtn.addEventListener('click', () => {
    panelVisible = !panelVisible;
    if (panelVisible) {
        instructionsPanel.classList.add('show');
        togglePanelBtn.textContent = 'Hide Instructions';
        
        // Show instructions by default
        instructionsList.style.display = 'block';
        benefitsContent.style.display = 'none';
        contraindicationsContent.style.display = 'none';
        panelTitle.textContent = '📋 Pose Instructions';
        
        // Reset button states
        benefitsBtn.classList.remove('active');
        benefitsVisible = false;
    } else {
        instructionsPanel.classList.remove('show');
        togglePanelBtn.textContent = 'Show Instructions';
    }
});

// Info buttons functionality
let benefitsVisible = false;
let currentPoseForInfo = null;

benefitsBtn.addEventListener('click', async () => {
    benefitsVisible = !benefitsVisible;
    if (benefitsVisible) {
        // Show instructions panel
        instructionsPanel.classList.add('show');
        panelVisible = true;
        togglePanelBtn.textContent = 'Hide Instructions';
        
        // Hide other content
        instructionsList.style.display = 'none';
        contraindicationsContent.style.display = 'none';
        
        // Show benefits content
        benefitsContent.style.display = 'block';
        panelTitle.textContent = '💪 Pose Benefits';
        
        if (currentPoseForInfo) {
            try {
                console.log('Fetching benefits for pose:', currentPoseForInfo);
                benefitsText.textContent = 'Loading benefits...';
                
                // First try to get data from asana_data.json
                const jsonData = getPoseDataFromJSON(currentPoseForInfo);
                console.log('JSON data for benefits:', jsonData);
                if (jsonData && jsonData.benefits && jsonData.benefits.length > 0) {
                    console.log('Using JSON benefits:', jsonData.benefits);
                    benefitsText.textContent = formatAsBulletPoints(jsonData.benefits);
                } else {
                    // Fallback to Gemini API
                    const benefitsData = await getPoseBenefits(currentPoseForInfo);
                    console.log('Benefits data received:', benefitsData);
                    if (benefitsData && benefitsData.benefits) {
                        benefitsText.textContent = benefitsData.benefits;
                    } else {
                        // Fallback to local data
                        const poseInfo = getPoseInfo(currentPoseForInfo);
                        if (poseInfo.benefits) {
                            benefitsText.textContent = poseInfo.benefits;
                        } else {
                            benefitsText.textContent = 'No benefits information available.';
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading benefits:', error);
                // Fallback to local data
                const poseInfo = getPoseInfo(currentPoseForInfo);
                if (poseInfo.benefits) {
                    benefitsText.textContent = poseInfo.benefits;
                } else {
                    benefitsText.textContent = 'Error loading benefits. Please try again.';
                }
            }
        } else {
            console.log('No current pose for info');
            benefitsText.textContent = 'No pose detected. Please start a session.';
        }
        benefitsBtn.classList.add('active');
    } else {
        benefitsContent.style.display = 'none';
        benefitsBtn.classList.remove('active');
    }
});




// Language selection event listener
languageSelect.addEventListener('change', (e) => {
    currentLanguage = e.target.value;
    console.log('Language changed to:', currentLanguage);
});

// Initialize with default state
startBtn.disabled = false;
stopBtn.disabled = true;

// Add these variables at the top



// Generate unique session ID
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Save session data to database
async function saveSessionData() {
    if (!currentUserId || !sessionId) {
        console.warn('Cannot save session: missing user ID or session ID');
        return;
    }
    
    try {
        const sessionDuration = Math.floor((new Date() - sessionStartTime) / 1000); // in seconds
        const uniquePoses = detectedPoses.size;
        const totalDetections = poseDetectionCount;
        
        console.log('💾 Saving session data:', {
            sessionId,
            duration: sessionDuration,
            uniquePoses,
            totalDetections,
            poses: Array.from(detectedPoses.keys())
        });
        
        // Session data is already logged via individual pose detections
        // This is just a summary log
        console.log(`✅ Session summary: ${totalDetections} poses detected, ${uniquePoses} unique poses, ${sessionDuration}s duration`);
        
    } catch (error) {
        console.error('Error saving session data:', error);
    }
}

// Set current user ID (called from webcam.html)
function setCurrentUserId(userId) {
    currentUserId = userId;
    console.log('Webcam session started for user:', userId);
}

// Function to log pose detection
async function logPoseDetection(poseName, confidence, landmarks = null) {
    if (!currentUserId || !sessionActive) {
        console.warn('Cannot log pose: session not active or user not logged in');
        return;
    }
    
    // Only log poses with sufficient confidence
    if (confidence < MIN_CONFIDENCE_FOR_LOGGING) {
        return;
    }
    
    // Track pose in session
    if (!detectedPoses.has(poseName)) {
        detectedPoses.set(poseName, {
            firstDetected: new Date(),
            count: 0,
            totalConfidence: 0
        });
    }
    
    const poseData = detectedPoses.get(poseName);
    poseData.count++;
    poseData.totalConfidence += confidence;
    poseDetectionCount++;
    
    // Calculate duration since first detection of this pose
    const duration = Math.floor((new Date() - poseData.firstDetected) / 1000);
    
    try {
        const response = await fetch('/api/log_activity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pose_name: poseName,
                confidence: confidence,
                duration_seconds: Math.max(duration, 1),
                session_id: sessionId
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log(`✅ Activity logged (${poseDetectionCount}): ${poseName} - ${Math.round(confidence * 100)}%`);
            showActivityIndicator(poseName, confidence);
        } else {
            console.error('Failed to log activity:', response.status);
        }
    } catch (error) {
        console.error('Error logging activity:', error);
    }
}

function showActivityIndicator(poseName, confidence) {
    let indicator = document.getElementById('activity-indicator');
    
    if (!indicator) {
        // Create indicator if it doesn't exist
        indicator = document.createElement('div');
        indicator.id = 'activity-indicator';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #51cf66, #40c057);
            color: white;
            padding: 10px 15px;
            border-radius: 8px;
            z-index: 1000;
            box-shadow: 0 4px 15px rgba(81, 207, 102, 0.3);
            font-weight: 500;
            animation: slideInRight 0.3s ease;
        `;
        document.body.appendChild(indicator);
        
        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    const traditionalName = getTraditionalName(poseName);
    indicator.textContent = `✅ Logged: ${traditionalName} (${Math.round(confidence * 100)}%)`;
    indicator.style.display = 'block';
    
    // Hide after 3 seconds
    setTimeout(() => {
        indicator.style.display = 'none';
    }, 1000);
}

// Load asana data from JSON file
async function loadAsanaData() {
    try {
        const response = await fetch('/static/asana_data.json');
        if (!response.ok) {
            throw new Error('Failed to load asana data');
        }
        asanaData = await response.json();
        console.log('Asana data loaded successfully');
        console.log('Available poses:', Object.keys(asanaData));
        
        // Test with a known pose
        const testPose = 'Tree_Pose_or_Vrksasana_';
        if (asanaData[testPose]) {
            console.log('Test pose data:', asanaData[testPose]);
        }
    } catch (error) {
        console.error('Error loading asana data:', error);
        asanaData = null;
    }
}

// Load user profile data
async function loadUserProfile() {
    try {
        const response = await fetch('/api/current_user');
        if (response.ok) {
            const userData = await response.json();
            
            // Update user profile display
            const userNameElement = document.getElementById('userNameWebcam');
            const userEmailElement = document.getElementById('userEmailWebcam');
            const userAvatarElement = document.getElementById('userAvatarWebcam');
            
            if (userNameElement) {
                userNameElement.textContent = userData.username || 'User';
            }
            if (userEmailElement) {
                userEmailElement.textContent = userData.email || 'user@example.com';
            }
            if (userAvatarElement) {
                if (userData.avatar && userData.avatar.trim() !== '') {
                    userAvatarElement.innerHTML = `<img src="${userData.avatar}" alt="Avatar" class="avatar-img">`;
                } else {
                    // Keep the placeholder but update it with user initials if available
                    const initials = userData.username ? userData.username.charAt(0).toUpperCase() : '👤';
                    userAvatarElement.innerHTML = `<div class="avatar-placeholder">${initials}</div>`;
                }
            }
            
            console.log('User profile loaded:', userData.username, 'Avatar:', userData.avatar);
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
        // Set default values on error
        const userNameElement = document.getElementById('userNameWebcam');
        const userEmailElement = document.getElementById('userEmailWebcam');
        if (userNameElement) userNameElement.textContent = 'User';
        if (userEmailElement) userEmailElement.textContent = 'user@example.com';
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    // Load asana data
    loadAsanaData();
    // Load user profile
    loadUserProfile();
    // Application is ready
    console.log('Yoga AI Trainer initialized');
    console.log('Use testPoseMatching("pose_name") to test pose matching');
});