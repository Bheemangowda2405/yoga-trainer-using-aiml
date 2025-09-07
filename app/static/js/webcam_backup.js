(() => {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const statusEl = document.getElementById('status');
  const poseNameEl = document.getElementById('poseName');
  const confidenceBar = document.getElementById('confidenceBar');
  const confidenceValue = document.getElementById('confidenceValue');
  const instructionsList = document.getElementById('instructionsList');
  const feedbackText = document.getElementById('feedbackText');
  const annotatedImg = document.getElementById('annotated');

  let stream = null;
  let loopHandle = null;
  let lastPose = null;
  let currentPose = null;
  let poseConfirmationCount = 0;
  let speechSynthesis = window.speechSynthesis;
  let isSpeaking = false;
  let countdownHandle = null;
  const CAPTURE_MS = 7000; // send a frame every 5 seconds
  const POSE_CONFIRMATION_REQUIRED = 4; // require 2 consecutive detections (10 seconds total)
  const COUNTDOWN_DURATION = 5; // 5 seconds countdown

  async function startCamera() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      video.srcObject = stream;
      await video.play();
      statusEl.textContent = 'Camera started';
      return true;
    } catch (err) {
      console.error('Failed to start camera', err);
      statusEl.textContent = 'Camera error';
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
    statusEl.textContent = 'Camera stopped';
    if (countdownHandle) {
      clearInterval(countdownHandle);
      countdownHandle = null;
    }
  }

  function speak(text) {
    if (speechSynthesis && !isSpeaking) {
      isSpeaking = true;
      speechSynthesis.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.7;
      
      utterance.onend = () => {
        isSpeaking = false;
      };
      
      utterance.onerror = () => {
        isSpeaking = false;
      };
      
      speechSynthesis.speak(utterance);
    }
  }

  function startCountdown() {
    let timeLeft = COUNTDOWN_DURATION;
    statusEl.textContent = `Next prediction in ${timeLeft} seconds...`;
    
    countdownHandle = setInterval(() => {
      timeLeft--;
      if (timeLeft > 0) {
        statusEl.textContent = `Next prediction in ${timeLeft} seconds...`;
      } else {
        clearInterval(countdownHandle);
        countdownHandle = null;
        statusEl.textContent = 'Detecting...';
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
        body: JSON.stringify({ pose_name: poseName })
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
      // Split instructions by lines and create list items
      const lines = instructions.split('\n').filter(line => line.trim());
      instructionsList.innerHTML = '';
      
      lines.forEach(line => {
        if (line.trim().startsWith('-')) {
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
        statusEl.textContent = data.error;
        return;
      }
      
      // Update pose name and confidence
      poseNameEl.textContent = data.pose;
      const confidence = Math.round(data.confidence * 100);
      confidenceValue.textContent = confidence + '%';
      confidenceBar.style.width = confidence + '%';
      
      // Update annotated image
      if (data.image_url) {
        annotatedImg.src = data.image_url + `?t=${Date.now()}`;
      }
      
      // Pose confirmation logic
      if (data.pose === currentPose) {
        poseConfirmationCount++;
      } else {
        currentPose = data.pose;
        poseConfirmationCount = 1;
      }
      
      // Only announce pose if it's been confirmed for required duration and we're not already speaking
      if (poseConfirmationCount >= POSE_CONFIRMATION_REQUIRED && 
          data.pose !== lastPose && 
          !isSpeaking) {
        lastPose = data.pose;
        
        // Speak the pose name
        speak(`You are now doing ${data.pose}`);
        
        // Get instructions and feedback from Gemini
        const instructionsData = await getInstructionsAndFeedback(data.pose);
        if (instructionsData) {
          updateInstructions(instructionsData.instructions);
          updateFeedback(instructionsData.feedback);
        }
      }
      
      // Start countdown for next prediction
      startCountdown();
      
    } catch (e) {
      console.error(e);
      statusEl.textContent = 'Network error';
    }
  }

  function startLoop() {
    if (loopHandle) return;
    statusEl.textContent = 'Detecting...';
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
    statusEl.textContent = 'Detection stopped';
    speechSynthesis.cancel(); // Stop any ongoing speech
    isSpeaking = false;
  }

  function resetUI() {
    poseNameEl.textContent = '—';
    confidenceValue.textContent = '—';
    confidenceBar.style.width = '0%';
    instructionsList.innerHTML = '<li>Start detection to see pose instructions</li>';
    feedbackText.textContent = 'Start detection to receive pose feedback';
    if (annotatedImg) {
      annotatedImg.src = '';
    }
  }

  startBtn.addEventListener('click', async () => {
    if (!stream) {
      const cameraStarted = await startCamera();
      if (!cameraStarted) return;
    }
    startLoop();
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
})();
