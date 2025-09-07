(() => {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const statusEl = document.getElementById('status');
  const statusIndicator = document.getElementById('statusIndicator');
  const poseNameEl = document.getElementById('poseName');
  const poseNameOverlay = document.getElementById('poseNameOverlay');
  const confidenceBar = document.getElementById('confidenceBar');
  const confidenceValue = document.getElementById('confidenceValue');
  const confidenceValueBottom = document.getElementById('confidenceValueBottom');
  const instructionsList = document.getElementById('instructionsList');
  const feedbackText = document.getElementById('feedbackText');
  const annotatedImg = document.getElementById('annotated');

  let stream = null;
  let loopHandle = null;
  let lastPose = null;
  let currentPose = null;
  let poseConfirmationCount = 0;
  let countdownHandle = null;
  let sessionStartTime = null;
  let totalPosesDetected = 0;
  let poseStartTime = null;
  let lastAnnouncedPose = null;
  let availableLanguages = [];
  let currentLanguage = 'en-in';
  
  const CAPTURE_MS = 5000; // send a frame every 5 seconds (reduced from 10)
  const POSE_CONFIRMATION_REQUIRED = 1; // require 1 detection (5 seconds total)
  const COUNTDOWN_DURATION = 3; // 3 seconds countdown (reduced from 5)

  // Load available languages on page load
  async function loadLanguages() {
    try {
      const response = await fetch('/get_languages');
      const data = await response.json();
      if (data.languages) {
        availableLanguages = data.languages;
        currentLanguage = data.current || 'en-in';
        console.log('🌍 Available languages:', availableLanguages);
        console.log('🎤 Current language:', currentLanguage);
      }
    } catch (error) {
      console.error('Error loading languages:', error);
    }
  }

  async function startCamera() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } 
      });
      video.srcObject = stream;
      await video.play();
      updateStatus('Camera started', 'active');
      return true;
    } catch (err) {
      console.error('Failed to start camera', err);
      updateStatus('Camera error', 'error');
      return false;
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Camera track stopped:', track.kind);
      });
      stream = null;
    }
    if (video.srcObject) {
      video.srcObject = null;
    }
    updateStatus('Camera stopped', 'inactive');
    if (countdownHandle) {
      clearInterval(countdownHandle);
      countdownHandle = null;
    }
  }

  function updateStatus(text, type = 'inactive') {
    statusEl.textContent = text;
    statusIndicator.className = `status-indicator ${type}`;
  }

  // Speak feedback using Python TTS system
  async function speakFeedback(poseName, feedback) {
    if (!feedback || !poseName) return;
    
    console.log('🎤 Speaking feedback via Python TTS:', poseName, feedback);
    
    try {
      const response = await fetch('/speak_feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pose_name: poseName,
          feedback: feedback,
          language: currentLanguage
        })
      });
      
      const data = await response.json();
      if (data.success) {
        console.log('✅ Feedback spoken successfully');
        updateStatus('Speaking feedback...', 'active');
      } else {
        console.error('❌ Failed to speak feedback:', data.message);
        updateStatus('Speech error', 'error');
      }
    } catch (error) {
      console.error('❌ Error speaking feedback:', error);
      updateStatus('Speech error', 'error');
    }
  }

  // Speak welcome message
  async function speakWelcome() {
    console.log('🎤 Speaking welcome message...');
    
    try {
      const response = await fetch('/speak_welcome', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: currentLanguage
        })
      });
      
      const data = await response.json();
      if (data.success) {
        console.log('✅ Welcome message spoken successfully');
        updateStatus('Welcome to yoga session', 'active');
      } else {
        console.error('❌ Failed to speak welcome:', data.message);
      }
    } catch (error) {
      console.error('❌ Error speaking welcome:', error);
    }
  }

  // Set TTS language
  async function setLanguage(language) {
    try {
      const response = await fetch('/set_language', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language: language })
      });
      
      const data = await response.json();
      if (data.success) {
        currentLanguage = language;
        console.log('🎤 Language set to:', language);
        updateStatus(`Language: ${language}`, 'active');
      } else {
        console.error('❌ Failed to set language:', data.message);
      }
    } catch (error) {
      console.error('❌ Error setting language:', error);
    }
  }

  function startCountdown() {
    let timeLeft = COUNTDOWN_DURATION;
    updateStatus(`Next prediction in ${timeLeft} seconds...`, 'active');
    
    countdownHandle = setInterval(() => {
      timeLeft--;
      if (timeLeft > 0) {
        updateStatus(`Next prediction in ${timeLeft} seconds...`, 'active');
      } else {
        clearInterval(countdownHandle);
        countdownHandle = null;
        updateStatus('Detecting...', 'active');
      }
    }, 1000);
  }

  async function getInstructionsAndFeedback(poseName) {
    try {
      const response = await fetch('/get_instructions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          pose_name: poseName,
          language: currentLanguage
        })
      });
      
      const data = await response.json();
      if (data.error) {
        console.error('Error getting instructions:', data.error);
        return null;
      }
      
      return {
        instructions: data.instructions,
        feedback: data.feedback
      };
    } catch (error) {
      console.error('Error fetching instructions:', error);
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

  function updateFeedback(feedback) {
    if (feedback) {
      feedbackText.textContent = feedback;
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
      "Corpse_Pose_or_Savasana_": "Shavasana",
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
      "Handstand_pose_or_Adho_Mukha_Vrikshasana_": "Adho Mukha Vrikshasana",
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
      "Tree_Pose_or_Vrikshasana_": "Vrikshasana",
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

  function updatePoseDisplay(poseName, confidence) {
    // Get traditional name for the pose
    const traditionalName = getTraditionalName(poseName);
    
    // Update main pose name with traditional Sanskrit name
    poseNameEl.textContent = traditionalName;
    poseNameOverlay.textContent = traditionalName;
    
    // Update confidence
    const confidencePercent = Math.round(confidence * 100);
    confidenceValue.textContent = confidencePercent + '%';
    confidenceValueBottom.textContent = confidencePercent + '%';
    confidenceBar.style.width = confidencePercent + '%';
  }

  function addPoseToHistory(poseName, confidence) {
    totalPosesDetected++;
    console.log(`Pose detected: ${poseName} (${Math.round(confidence * 100)}%) - Total: ${totalPosesDetected}`);
  }

  async function captureAndPredict() {
    if (!video.videoWidth || !video.videoHeight) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
    const form = new FormData();
    form.append('file', new File([blob], 'frame.jpg', { type: 'image/jpeg' }));

    try {
      const res = await fetch('/predict', { method: 'POST', body: form });
      const data = await res.json();
      if (data.error) {
        updateStatus(data.error, 'error');
        return;
      }
      
      // Update pose display
      updatePoseDisplay(data.pose, data.confidence);
      addPoseToHistory(data.pose, data.confidence);
      
      // Update annotated image
      if (data.image_url) {
        annotatedImg.src = data.image_url + `?t=${Date.now()}`;
      }
      
      // Pose confirmation logic - check if same pose for 5 seconds
      if (data.pose === currentPose) {
        poseConfirmationCount++;
        // Check if we've been doing the same pose for 5 seconds
        if (poseStartTime && (Date.now() - poseStartTime) >= 5000) {
          // 5 seconds have passed, announce the pose
          if (data.pose !== lastAnnouncedPose && data.confidence >= 0.60) {
            console.log('🎯 5 seconds passed, announcing pose:', data.pose);
            lastAnnouncedPose = data.pose;
            
            // Get instructions and feedback from Gemini
            const instructionsData = await getInstructionsAndFeedback(data.pose);
            if (instructionsData) {
              updateInstructions(instructionsData.instructions);
              updateFeedback(instructionsData.feedback);
              
              // Speak ONLY the feedback (not instructions)
              if (instructionsData.feedback) {
                speakFeedback(data.pose, instructionsData.feedback);
              }
            }
            
            // Reset the timer
            poseStartTime = Date.now();
          }
        }
      } else {
        // New pose detected, reset timer
        currentPose = data.pose;
        poseConfirmationCount = 1;
        poseStartTime = Date.now();
        lastAnnouncedPose = null; // Reset so we can announce the new pose
        console.log('🔄 New pose detected, resetting timer:', data.pose);
      }
      
      // Start countdown for next prediction
      startCountdown();
      
    } catch (e) {
      console.error(e);
      updateStatus('Network error', 'error');
    }
  }

  function startLoop() {
    if (loopHandle) return;
    updateStatus('Detecting...', 'active');
    sessionStartTime = new Date();
    totalPosesDetected = 0;
    poseStartTime = Date.now();
    lastAnnouncedPose = null;
    
    // Start with an immediate prediction
    captureAndPredict();
    // Then continue with the interval
    loopHandle = setInterval(captureAndPredict, CAPTURE_MS);
  }

  function stopLoop() {
    if (loopHandle) {
      clearInterval(loopHandle);
      loopHandle = null;
    }
    if (countdownHandle) {
      clearInterval(countdownHandle);
      countdownHandle = null;
    }
    updateStatus('Detection stopped', 'inactive');
  }

  function resetUI() {
    poseNameEl.textContent = '—';
    poseNameOverlay.textContent = '—';
    confidenceValue.textContent = '—';
    confidenceValueBottom.textContent = '—';
    confidenceBar.style.width = '0%';
    instructionsList.innerHTML = '<li>Start detection to see pose instructions</li>';
    feedbackText.textContent = 'Start detection to receive pose feedback';
    if (annotatedImg) {
      annotatedImg.src = '';
    }
    totalPosesDetected = 0;
    poseStartTime = null;
    lastAnnouncedPose = null;
  }

  function setButtonLoading(button, loading) {
    const spinner = button.querySelector('.loading-spinner');
    const text = button.querySelector('span');
    
    if (loading) {
      button.classList.add('loading');
      button.disabled = true;
      if (text) text.textContent = 'Starting...';
    } else {
      button.classList.remove('loading');
      button.disabled = false;
      if (text) text.textContent = button.id === 'startBtn' ? 'Start Session' : 'End Session';
    }
  }

  startBtn.addEventListener('click', async () => {
    setButtonLoading(startBtn, true);
    
    if (!stream) {
      const cameraStarted = await startCamera();
      if (!cameraStarted) {
        setButtonLoading(startBtn, false);
        return;
      }
    }
    
    // Speak welcome message when session starts
    await speakWelcome();
    
    startLoop();
    setButtonLoading(startBtn, false);
    startBtn.disabled = true;
    stopBtn.disabled = false;
  });

  stopBtn.addEventListener('click', () => {
    stopLoop();
    stopCamera();
    resetUI();
    startBtn.disabled = false;
    stopBtn.disabled = true;
  });

  // Initialize with default state
  stopBtn.disabled = true;
  updateStatus('Ready to start', 'inactive');
  
  // Load languages on page load (removed test voice)
  loadLanguages();
})();
