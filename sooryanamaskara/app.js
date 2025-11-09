const poses = [
  { name: 'Pranamasana', sub: 'Prayer pose', img: 'pranamasana_500px.jpg' },
  { name: 'Hastauttanasana', sub: 'Raised arms pose', img: 'HASTAUTTANASANA_resized.jpg' },
  { name: 'Hastapadasana', sub: 'Standing forward bend', img: 'PADAHASTASANA2_500px.jpg' },
  { name: 'Ashwa Sanchalanasana', sub: 'Equestrian pose', img: 'public/ASHWASANCHALANASANA .jpeg' },
  { name: 'Dandasana', sub: 'Stick pose', img: 'public/PARVATASANA2.jpeg' },
  { name: 'Ashtanga Namaskara', sub: 'Salute with eight parts', img: 'public/ASHTANGANAMASKARA .jpeg' },
  { name: 'Bhujangasana', sub: 'Cobra pose', img: 'public/bhujagasana.jpg' },
  { name: 'Adho Mukha Svanasana', sub: 'Downward facing dog', img: 'public/parvatasana.jpeg' },
  { name: 'Ashwa Sanchalanasana', sub: 'Equestrian pose', img: 'public/ASHWASANCHALANASANA2 .jpeg' },
  { name: 'Hastapadasana', sub: 'Standing forward bend', img: 'PADAHASTASANA2_500px.jpg' },
  { name: 'Hastauttanasana', sub: 'Raised arms pose', img: 'HASTAUTTANASANA_resized.jpg' },
  { name: 'Pranamasana', sub: 'Prayer pose', img: 'pranamasana_500px.jpg' }
];

function renderPoseCard(p){
  const card = document.createElement('div');
  card.className = 'pose-card';
  card.innerHTML = `
    <img class="thumb" src="${p.img}" alt="${p.name}">
    <div class="label">
      <div class="name">${p.name}</div>
      <div class="sub">(${p.sub})</div>
    </div>
  `;
  return card;
}

function mountGrids(){
  const grid = document.getElementById('poses-grid');
  const scrollStrip = document.getElementById('poses-scroll');
  if(grid){
    poses.forEach((p, idx)=>{
      const card = renderPoseCard(p);
      const badge = document.createElement('span');
      badge.className = 'step-badge';
      badge.textContent = String(idx + 1);
      if(idx === 0) card.classList.add('first');
      if(idx === poses.length - 1) card.classList.add('last');
      card.appendChild(badge);
      card.classList.add('reveal');
      grid.appendChild(card);
    });
  }
  if(scrollStrip){
    poses.forEach(p=>scrollStrip.appendChild(renderPoseCard(p)));
  }
}

function setupTabs(){
  const tabs = Array.from(document.querySelectorAll('.tab'));
  const screens = Array.from(document.querySelectorAll('.screen'));
  tabs.forEach(btn=>btn.addEventListener('click',()=>{
    tabs.forEach(t=>t.classList.remove('active'));
    btn.classList.add('active');
    const target = btn.dataset.target;
    screens.forEach(s=>{
      s.classList.toggle('active', s.id === target);
    });
  }));
}

function setupScrollArrows(){
  // Removed with Sequence strip
}

function setupPosesGridArrows(){
  // arrows removed as per latest request
}

// ----- Setup screen: Level presets by speed -----
const LEVEL_PRESETS = {
  soft: [
    { value: 'beginner', name: 'Beginner', rounds: 12, duration: '~19 Min' },
    { value: 'intermediate', name: 'Intermediate', rounds: 51, duration: '~82 Min' },
    { value: 'custom', name: 'Custom (1 to 500)', rounds: 5, duration: '~8 Min' }
  ],
  regular: [
    { value: 'beginner', name: 'Beginner', rounds: 12, duration: '~12 Min' },
    { value: 'intermediate', name: 'Intermediate', rounds: 51, duration: '~51 Min' },
    { value: 'custom', name: 'Custom (1 to 500)', rounds: 5, duration: '~5 Min' }
  ],
  accelerated: [
    { value: 'beginner', name: 'Beginner', rounds: 12, duration: '~7 Min' },
    { value: 'intermediate', name: 'Intermediate', rounds: 51, duration: '~31 Min' },
    { value: 'custom', name: 'Custom (1 to 500)', rounds: 5, duration: '~3 Min' }
  ]
};

function renderLevelsForSpeed(speed){
  const preset = LEVEL_PRESETS[speed] || LEVEL_PRESETS.regular;
  const body = document.querySelector('.level-table-body');
  if(!body) return;
  updateRoundTimeNote(speed);
  body.innerHTML = preset.map((lvl, idx)=>{
    return `
            <label class="level-row${idx===0?' selected':''}">
              <input type="radio" name="level" value="${lvl.value}" ${idx===0?'checked':''}>
              <div class="level-col">
                <span class="radio-btn"></span>
                <span class="level-name">${lvl.name}</span>
              </div>
              <div class="rounds-col">${lvl.rounds}</div>
              <div class="duration-col">${lvl.duration}</div>
            </label>`;
  }).join('');
  attachLevelRowHandlers();
}

function attachLevelRowHandlers(){
  const levelRows = document.querySelectorAll('.level-row');
  levelRows.forEach(row => {
    if (!row.classList.contains('locked')) {
      row.addEventListener('click', () => {
        levelRows.forEach(r => r.classList.remove('selected'));
        row.classList.add('selected');
        const radio = row.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
        // Show/hide custom input when selecting Custom
        if(radio && radio.value === 'custom'){
          showCustomRoundsInput(row);
        } else {
          removeCustomRoundsInput();
        }
      });
    }
  });
}

function removeCustomRoundsInput(){
  const existing = document.querySelector('.custom-rounds-input');
  if(existing && existing.parentElement){
    existing.parentElement.removeChild(existing);
  }
}

function showCustomRoundsInput(parentRow){
  removeCustomRoundsInput();
  const container = document.createElement('div');
  container.className = 'custom-rounds-input';
  container.style.margin = '8px 0 0 52px';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.gap = '8px';
  container.innerHTML = `
    <label for="customRounds" style="font-weight:600">Enter rounds:</label>
    <input id="customRounds" type="number" min="1" max="500" value="5" style="width:90px;padding:6px 8px;border-radius:8px;border:1px solid #ccc;" />
  `;
  parentRow.appendChild(container);
  const input = container.querySelector('#customRounds');
  if(input){
    setTimeout(()=>input.focus(), 0);
  }
}

function init(){
  mountGrids();
  setupTabs();
  setupScrollArrows();
  setupPosesGridArrows();
  const navStartBtn = document.getElementById('navStartBtn');
  if(navStartBtn){
    navStartBtn.addEventListener('click',()=>{
      // Show setup screen instead of poses
      document.getElementById('setup').classList.add('active');
      document.getElementById('home').classList.remove('active');
      // Show back button (header adjusts automatically)
      document.getElementById('backBtn').classList.add('show');
    });
  }

  // Learn card → navigate to poses
  const learnCard = document.getElementById('learnCard');
  if(learnCard){
    const goToPoses = () => {
      document.querySelector('.tab[data-target="poses"]').click();
    };
    learnCard.addEventListener('click', goToPoses);
    learnCard.addEventListener('keypress', (e)=>{
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        goToPoses();
      }
    });
  }

  // Setup screen interactions
  const speedBtns = document.querySelectorAll('.speed-btn');
  speedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      speedBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      // Re-render level table for chosen speed
      const speed = btn.dataset.speed;
      renderLevelsForSpeed(speed);
    });
  });

  // Attach handlers to default rendered rows and ensure default is 'regular'
  renderLevelsForSpeed('regular');

  const setupStartBtn = document.getElementById('setupStartBtn');
  if(setupStartBtn){
    setupStartBtn.addEventListener('click', () => {
      unlockAudioAndSpeech();
      // Get selected options
      const selectedSpeed = document.querySelector('.speed-btn.selected')?.dataset.speed || 'regular';
      const selectedLevel = document.querySelector('input[name="level"]:checked')?.value || 'beginner';
      const recoveryIntervals = document.getElementById('recoveryIntervals')?.checked || false;
      const customRounds = selectedLevel === 'custom' ? Math.max(1, Math.min(500, parseInt(document.getElementById('customRounds')?.value || '5', 10))) : null;
      
      console.log('Starting practice with:', { selectedSpeed, selectedLevel, customRounds, recoveryIntervals });
      // Launch practice with all selected options
      startGuidedPractice({ 
        speed: selectedSpeed, 
        level: selectedLevel, 
        customRounds: customRounds, 
        recoveryIntervals: recoveryIntervals 
      });
    });
  }

  const posesStartBtn = document.getElementById('posesStartBtn');
  if(posesStartBtn){
    posesStartBtn.addEventListener('click', ()=>{
      // Open setup to choose speed/levels before practice
      document.getElementById('setup').classList.add('active');
      document.getElementById('poses').classList.remove('active');
      document.querySelector('.tab.active').classList.remove('active');
      document.querySelector('.tab[data-target="home"]').classList.add('active');
      document.getElementById('backBtn').classList.add('show');
    });
  }

  // Home CTA start button
  const homeStartBtn = document.getElementById('homeStartBtn');
  if(homeStartBtn){
    homeStartBtn.addEventListener('click', ()=>{
      document.getElementById('setup').classList.add('active');
      document.getElementById('home').classList.remove('active');
      document.querySelector('.tab.active').classList.remove('active');
      document.querySelector('.tab[data-target="home"]').classList.add('active');
      document.getElementById('backBtn').classList.add('show');
    });
  }

  // Back button functionality
  const backBtn = document.getElementById('backBtn');
  if(backBtn){
    backBtn.addEventListener('click', () => {
      // If practice overlay is open, close it first
      const practice = document.getElementById('practice');
      if(practice && practice.classList.contains('show')){
        practice.classList.remove('show');
        clearTimeout(practiceState.timerId);
        practiceState.running = false;
      }
      // Hide setup screen and show home
      document.getElementById('setup').classList.remove('active');
      document.getElementById('home').classList.add('active');
      // Hide back button (title auto-centers with flexbox)
      backBtn.classList.remove('show');
    });
  }

  // Title is centered by default with flexbox

  // reveal-on-scroll
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  },{threshold:0.1});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
}

// Exit / Resume confirm behavior (Back button)
document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('backBtn');
  const practiceEl = document.getElementById('practice');
  const exitConfirm = document.getElementById('exitConfirm');

  if (!backBtn) return;

  // show back button when practice panel becomes visible
  const updateBack = () => {
    const visible = !!(practiceEl && (practiceEl.classList.contains('show') || practiceEl.classList.contains('active')));
    if (visible) backBtn.classList.remove('hidden');
    else backBtn.classList.add('hidden');
  };
  updateBack();

  // observe class changes on practice panel
  if (practiceEl) {
    const mo = new MutationObserver(updateBack);
    mo.observe(practiceEl, { attributes: true, attributeFilter: ['class'] });
  }

  // click: if practice open -> show confirm overlay (if present) else go home
  backBtn.addEventListener('click', (e) => {
    if (practiceEl && (practiceEl.classList.contains('show') || practiceEl.classList.contains('active'))) {
      e.preventDefault();
      if (exitConfirm) {
        exitConfirm.hidden = false;
        exitConfirm.classList.add('show');
        // pause practice while asking
        try { pausePractice(); } catch (_) {}
      } else {
        // fallback: simply hide practice and return home
        practiceEl.classList.remove('show','active');
        document.getElementById('home')?.classList.add('active');
      }
      return;
    }
    // default back navigation
    document.getElementById('setup')?.classList.remove('active');
    document.getElementById('home')?.classList.add('active');
  });
});

document.addEventListener('DOMContentLoaded', init);

// ----- Helpers: round time note and dynamic duration updates -----
const ROUND_TIME_BY_SPEED = {
  soft: 96,          // 1m 36s
  regular: 60,       // 1m
  accelerated: 36    // 36s
};

function updateRoundTimeNote(speed){
  const el = document.getElementById('roundTimeNote');
  if(!el) return;
  const seconds = ROUND_TIME_BY_SPEED[speed] ?? ROUND_TIME_BY_SPEED.regular;
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  const minPart = min > 0 ? `${min} minute${min>1?'s':''}` : '';
  const sep = min > 0 && sec > 0 ? ' and ' : '';
  const secPart = sec > 0 ? `${sec} second${sec>1?'s':''}` : '';
  el.textContent = `1 Surya namaskar round = ${minPart}${sep}${secPart}`;
}

// Optional: live update duration when custom rounds change
document.addEventListener('input', (e)=>{
  if(e.target && e.target.id === 'customRounds'){
    const speed = document.querySelector('.speed-btn.selected')?.dataset.speed || 'regular';
    const rounds = Math.max(1, Math.min(500, parseInt(e.target.value || '1', 10)));
    const secondsPerRound = ROUND_TIME_BY_SPEED[speed] ?? 60;
    const totalSeconds = rounds * secondsPerRound;
    const minutes = Math.round(totalSeconds / 60);
    // Update the Custom row duration cell
    const customRow = e.target.closest('.level-row');
    const durationCell = customRow?.querySelector('.duration-col');
    if(durationCell){
      durationCell.textContent = `~${minutes} Min`;
    }
    // Update rounds column to reflect typed rounds
    const roundsCell = customRow?.querySelector('.rounds-col');
    if(roundsCell){
      roundsCell.textContent = String(rounds);
    }
  }
});

// ---------------- Guided Practice ----------------
const PRACTICE_STEPS = [
  { name: 'Pranamasana', file: 'public/pranamasana.jpeg', mantra: 'ॐ मित्राय नमः', audio: 'public/voice_preview_surya namaskar voice (1).mp3' },
  { name: 'Hastauttanasana', file: 'public/HASTAUTTANASANA 2.jpeg', mantra: 'ॐ रवये नमः', audio: 'public/voice_preview_surya namaskar voice_[cut_2sec].mp3' },
  { name: 'Hastapadasana', file: 'public/PADAHASTASANA.jpeg', mantra: 'ॐ सूर्याय नमः', audio: 'public/voice_preview_surya namaskar voice_[cut_2sec] (1).mp3' },
  { name: 'Ashwa Sanchalanasana', file: 'public/ASHWASANCHALANASANA .jpeg', mantra: 'ॐ भानवे नमः', audio: 'public/voice_preview_surya namaskar voice_[cut_2sec] (2).mp3' },
  { name: 'Dandasana', file: 'public/PARVATASANA2.jpeg', mantra: 'ॐ खगाय नमः', audio: 'public/voice_preview_surya namaskar voice_[cut_2sec] (3).mp3' },
  { name: 'Ashtanga Namaskara', file: 'public/ASHTANGANAMASKARA .jpeg', mantra: 'ॐ पुष्णे नमः', audio: 'public/voice_preview_surya namaskar voice_[cut_2sec] (4).mp3' },
  { name: 'Bhujangasana', file: 'public/bhujagasana.jpg', mantra: 'ॐ हिरण्यगर्भाय नमः', audio: 'public/voice_preview_surya namaskar voice_[cut_2sec] (5).mp3' },
  { name: 'Adho Mukha Svanasana', file: 'public/parvatasana.jpeg', mantra: 'ॐ मरिचये नमः', audio: 'public/voice_preview_surya namaskar voice_[cut_2sec] (6).mp3' },
  { name: 'Ashwa Sanchalanasana', file: 'public/ASHWASANCHALANASANA2 .jpeg', mantra: 'ॐ आदित्याय नमः', audio: 'public/voice_preview_surya namaskar voice_[cut_2sec] (7).mp3' },
  { name: 'Hastapadasana', file: 'public/PADAHASTASANA.jpeg', mantra: 'ॐ सावित्रे नमः', audio: 'public/voice_preview_surya namaskar voice_[cut_2sec] (8).mp3' },
  { name: 'Hastauttanasana', file: 'public/HASTAUTTANASANA 2.jpeg', mantra: 'ॐ अर्काय नमः', audio: 'public/voice_preview_surya namaskar voice_[cut_2sec] (9).mp3' },
  { name: 'Pranamasana', file: 'public/pranamasana.jpeg', mantra: 'ॐ भास्कराय नमः', audio: 'public/voice_preview_surya namaskar voice_[cut_2sec] (10).mp3' }
];

const SPEED_TO_SECONDS = { soft: 6, regular: 4, accelerated: 3 };

let practiceState = {
  idx: 0,
  timerId: null,
  running: false,
  paused: false,
  secondsPerPose: SPEED_TO_SECONDS.regular,
  preloaded: [],
  voiceEnabled: false,
  countdownTimerId: null,
  totalRounds: 12,
  currentRound: 1,
  recoveryIntervals: false,
  totalSteps: 144, // 12 rounds * 12 poses
  currentAudio: null,
  userInteracted: false,
  audioCtx: null,
  // minimal additions for pause/resume
  remainingMs: 0,
  stepEndsAt: 0,
  // new: whether sound (mp3 mantras) is allowed
  soundEnabled: true
};

function preloadPracticeImages(){
  practiceState.preloaded = PRACTICE_STEPS.map(step=>{
    const img = new Image();
    img.src = step.file;
    return img;
  });
}

function unlockAudioAndSpeech(){
  if(practiceState.userInteracted) return;
  practiceState.userInteracted = true;
  try{
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if(Ctx && !practiceState.audioCtx){
      practiceState.audioCtx = new Ctx();
    }
    practiceState.audioCtx?.resume?.();
  }catch(_){ }
  try{
    window.speechSynthesis?.getVoices?.();
    window.speechSynthesis?.resume?.();
  }catch(_){ }
}

function playMantraAudio(audioPath){
  // Respect user-controlled sound toggle
  if(!practiceState.soundEnabled) return;
  if(practiceState.currentAudio){
    try{
      practiceState.currentAudio.pause();
      practiceState.currentAudio.currentTime = 0;
      practiceState.currentAudio = null;
    }catch(e){}
  }
  if(!audioPath) return;
  const encodedPath = audioPath.split('/').map(p=>p.replace(/ /g,'%20')).join('/');
  try{
    const audio = new Audio(encodedPath);
    audio.volume = 1;
    audio.preload = 'auto';
    practiceState.currentAudio = audio;
    const pp = audio.play();
    if(pp && pp.catch){
      pp.catch(()=>{
        try{ const fb = new Audio(audioPath); practiceState.currentAudio = fb; fb.play().catch(()=>{}); }catch(_){}
      });
    }
  }catch(_){}
}

function speakPose(text, fallbackAudioPath){
  if(!practiceState.voiceEnabled) return;
  if(!('speechSynthesis' in window)) return;

  const speakWithVoices = () => {
    try{
      const voices = window.speechSynthesis.getVoices?.() || [];
      // Prefer Hindi/Sanskrit/Indic voices for Devanagari text; fallback to en-IN; then any
      const preferredLangs = ['hi-IN','sa-IN','mr-IN','bn-IN','en-IN'];
      let chosenVoice = null;
      for(const pref of preferredLangs){
        const v = voices.find(v=> (v.lang || '').toLowerCase().startsWith(pref.toLowerCase()));
        if(v){ chosenVoice = v; break; }
      }
      if(!chosenVoice && voices.length){ chosenVoice = voices[0]; }

      const u = new SpeechSynthesisUtterance(text);
      let started = false;
      u.onstart = () => { started = true; };
      u.onerror = () => { started = false; };
      u.onend = () => {
        // no-op; let the next step proceed
      };
      u.rate = 0.95;
      u.pitch = 1;
      if(chosenVoice){
        u.voice = chosenVoice;
        u.lang = chosenVoice.lang || u.lang;
      } else {
        u.lang = 'hi-IN';
      }
      // Try to recover from paused state on some browsers
      try{ window.speechSynthesis.cancel(); }catch(_){}
      try{ window.speechSynthesis.resume?.(); }catch(_){}
      window.speechSynthesis.speak(u);
      // Fallback to mp3 if speech didn't start
      setTimeout(()=>{
        if(!started && practiceState.voiceEnabled && fallbackAudioPath){
          playMantraAudio(fallbackAudioPath);
        }
      }, 700);
    }catch(e){
      // no-op
    }
  };

  // Some browsers populate voices asynchronously
  const voices = window.speechSynthesis.getVoices?.() || [];
  if(!voices || voices.length === 0){
    const once = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', once);
      speakWithVoices();
    };
    try{ window.speechSynthesis.addEventListener('voiceschanged', once); }catch(_){}
    // As a fallback, try speaking anyway
    setTimeout(speakWithVoices, 200);
  } else {
    speakWithVoices();
  }
}

function updatePracticeUI(){
  const poseInRound = practiceState.idx % PRACTICE_STEPS.length;
  const step = PRACTICE_STEPS[poseInRound];
  const imgEl = document.getElementById('practiceImage');
  const titleEl = document.getElementById('practiceTitle');
  const stepEl = document.getElementById('practiceStep');
  const progress = document.getElementById('progressBar');
  const fadeLayer = document.getElementById('fadeLayer');

  if(!step || !imgEl || !titleEl || !stepEl || !progress || !fadeLayer) return;

  // Calculate current round
  practiceState.currentRound = Math.floor(practiceState.idx / PRACTICE_STEPS.length) + 1;
  const currentPoseInRound = poseInRound + 1;

  // Fade out
  imgEl.classList.remove('show');
  fadeLayer.classList.add('fade');

  setTimeout(()=>{
    imgEl.src = step.file;
    imgEl.alt = step.name;
    titleEl.textContent = step.mantra || step.name;
    stepEl.textContent = `Round ${practiceState.currentRound}/${practiceState.totalRounds} · Pose ${currentPoseInRound}/12`;
    imgEl.onerror = ()=>{ /* keep area blank if missing */ };
    // Fade in
    fadeLayer.classList.remove('fade');
    requestAnimationFrame(()=>imgEl.classList.add('show'));
    // Always play mantra audio after UI is visible
    if(step.audio){
      setTimeout(()=>{
        const checkIdx = practiceState.idx % PRACTICE_STEPS.length;
        if(PRACTICE_STEPS[checkIdx] === step){
          playMantraAudio(step.audio);
        }
      }, 120);
    }
  }, 220);

  // Ensure breath box updates when a new pose starts
  updateBreathBox(poseInRound);

  const pct = ((practiceState.idx) / practiceState.totalSteps) * 100;
  progress.style.width = Math.min(pct, 100) + '%';

  // Audio only (voice assistant removed)
}

function showPracticeOverlay(show){
  const el = document.getElementById('practice');
  if(!el) return;
  if(show){
    el.classList.add('show');
    document.getElementById('backBtn')?.classList.add('show');
  }else{
    el.classList.remove('show');
  }
}

function showPose(index){
  practiceState.idx = index;
  updatePracticeUI();
}

function runNextStep(){
  if(!practiceState.running || practiceState.paused) return;
  const nextIndex = practiceState.idx + 1;
  
  // Check if we've completed all rounds
  if(nextIndex >= practiceState.totalSteps){
    clearTimeout(practiceState.timerId);
    practiceState.running = false;
    document.getElementById('practiceComplete')?.classList.add('show');
    document.getElementById('progressBar').style.width = '100%';
    return;
  }
  
  // Check if we're between rounds and need recovery interval
  const poseInRound = nextIndex % PRACTICE_STEPS.length;
  const currentRound = Math.floor(nextIndex / PRACTICE_STEPS.length) + 1;
  const isRoundTransition = poseInRound === 0 && currentRound > 1;
  
  if(isRoundTransition && practiceState.recoveryIntervals && currentRound <= practiceState.totalRounds){
    // Show recovery interval with countdown (same as initial countdown)
    practiceState.paused = true;
    const countdownText = document.querySelector('.countdown-text');
    if(countdownText) {
      countdownText.textContent = 'Recovery Time';
    }
    startCountdown(5, () => {
      practiceState.paused = false;
      if(countdownText) {
        countdownText.textContent = 'Get Ready';
      }
      showPose(nextIndex);
      // schedule next step and set stepEndsAt
      practiceState.stepEndsAt = Date.now() + practiceState.secondsPerPose * 1000;
      practiceState.timerId = setTimeout(runNextStep, practiceState.secondsPerPose * 1000);
    });
  } else {
    showPose(nextIndex);
    // schedule next step and set stepEndsAt
    practiceState.stepEndsAt = Date.now() + practiceState.secondsPerPose * 1000;
    practiceState.timerId = setTimeout(runNextStep, practiceState.secondsPerPose * 1000);
  }
}

function startGuidedPractice({ speed = 'regular', level = 'beginner', customRounds = null, recoveryIntervals = false } = {}){
  preloadPracticeImages();
  
  // Get rounds based on level
  const speedPreset = LEVEL_PRESETS[speed] || LEVEL_PRESETS.regular;
  let rounds = 12; // default
  
  if(level === 'custom' && customRounds !== null){
    rounds = Math.max(1, Math.min(500, customRounds));
  } else {
    const levelData = speedPreset.find(l => l.value === level);
    if(levelData) rounds = levelData.rounds;
  }
  
  practiceState.totalRounds = rounds;
  practiceState.totalSteps = rounds * PRACTICE_STEPS.length;
  practiceState.currentRound = 1;
  practiceState.running = false;
  practiceState.paused = false;
  practiceState.secondsPerPose = SPEED_TO_SECONDS[speed] ?? SPEED_TO_SECONDS.regular;
  practiceState.recoveryIntervals = recoveryIntervals;
  
  document.getElementById('practiceComplete')?.classList.remove('show');
  // Initialize bottom info UI counters
  const totalPosesEl = document.getElementById('totalPoses');
  if(totalPosesEl) totalPosesEl.textContent = String(POSE_DATA.length);
  showPracticeOverlay(true);
  
  startCountdown(5, ()=>{
    practiceState.idx = 0;
    practiceState.running = true;
    showPose(0);
    clearTimeout(practiceState.timerId);
    practiceState.timerId = setTimeout(runNextStep, practiceState.secondsPerPose * 1000);
  });
}

function startCountdown(seconds, onComplete){
  const cd = document.getElementById('practiceCountdown');
  const overlay = document.getElementById('countdownOverlay');
  if(!cd || !overlay){ onComplete?.(); return; }
  
  overlay.classList.add('show');
  cd.classList.add('show');
  
  let current = seconds;
  cd.textContent = String(current);
  
  // Initial scale animation
  cd.style.transform = 'scale(0)';
  setTimeout(() => {
    cd.style.transform = 'scale(1)';
  }, 50);
  
  clearInterval(practiceState.countdownTimerId);
  practiceState.countdownTimerId = setInterval(()=>{
    current -= 1;
    
    if(current <= 0){
      clearInterval(practiceState.countdownTimerId);
      // Animate out
      cd.style.transform = 'scale(0)';
      setTimeout(() => {
        cd.classList.remove('show');
        overlay.classList.remove('show');
        cd.textContent = '';
        onComplete?.();
      }, 300);
      return;
    }
    
    // Pulse animation for each number change
    cd.style.transform = 'scale(0.8)';
    setTimeout(() => {
      cd.textContent = String(current);
      cd.style.transform = 'scale(1)';
    }, 150);
  }, 1000);
}

function pausePractice(){
  practiceState.paused = true;
  // store remaining ms for current step if scheduled
  if(practiceState.stepEndsAt){
    practiceState.remainingMs = Math.max(0, practiceState.stepEndsAt - Date.now());
  } else {
    practiceState.remainingMs = 0;
  }
  clearTimeout(practiceState.timerId);
  practiceState.timerId = null;

  // Also clear countdown if it's showing (during recovery)
  if(practiceState.countdownTimerId){
    clearInterval(practiceState.countdownTimerId);
    const cd = document.getElementById('practiceCountdown');
    const overlay = document.getElementById('countdownOverlay');
    if(cd && overlay && overlay.classList.contains('show')){
      cd.classList.remove('show');
      overlay.classList.remove('show');
      cd.textContent = '';
      const countdownText = document.querySelector('.countdown-text');
      if(countdownText) {
        countdownText.textContent = 'Get Ready';
      }
    }
  }
}

function resumePractice(){
  if(!practiceState.running) return;
  if(!practiceState.paused) return;
  practiceState.paused = false;
  clearTimeout(practiceState.timerId);
  // use remainingMs if present else full duration
  const delay = practiceState.remainingMs && practiceState.remainingMs > 0
    ? practiceState.remainingMs
    : practiceState.secondsPerPose * 1000;
  practiceState.stepEndsAt = Date.now() + delay;
  practiceState.timerId = setTimeout(runNextStep, delay);
  practiceState.remainingMs = 0;
}

function restartPractice(){
  // Restart with same settings
  const selectedSpeed = document.querySelector('.speed-btn.selected')?.dataset.speed || 'regular';
  const selectedLevel = document.querySelector('input[name="level"]:checked')?.value || 'beginner';
  const customRounds = selectedLevel === 'custom' ? Math.max(1, Math.min(500, parseInt(document.getElementById('customRounds')?.value || '5', 10))) : null;
  const recoveryIntervals = document.getElementById('recoveryIntervals')?.checked || false;
  
  // reset breathing display to first pose (Exhale)
  updateBreathBox(0);

  startGuidedPractice({ 
    speed: selectedSpeed, 
    level: selectedLevel, 
    customRounds: customRounds, 
    recoveryIntervals: recoveryIntervals 
  });
}

// Wire controls
document.addEventListener('DOMContentLoaded', ()=>{
  const btnStart = document.getElementById('btnStart');
  const btnPause = document.getElementById('btnPause');
  const btnResume = document.getElementById('btnResume');
  const btnRestart = document.getElementById('btnRestart');
  const soundToggle = document.getElementById('soundToggle');

  // initialize sound flag from checkbox
  if(soundToggle){
    practiceState.soundEnabled = !!soundToggle.checked;
    soundToggle.addEventListener('change', ()=>{
      practiceState.soundEnabled = !!soundToggle.checked;
      // if user disabled sound, stop any playing mantra immediately
      if(!practiceState.soundEnabled && practiceState.currentAudio){
        try{ practiceState.currentAudio.pause(); practiceState.currentAudio = null; }catch(_){}
      }
    });
  }

  btnStart?.addEventListener('click', ()=>{
    unlockAudioAndSpeech();
    const selectedSpeed = document.querySelector('.speed-btn.selected')?.dataset.speed || 'regular';
    const selectedLevel = document.querySelector('input[name="level"]:checked')?.value || 'beginner';
    const customRounds = selectedLevel === 'custom' ? Math.max(1, Math.min(500, parseInt(document.getElementById('customRounds')?.value || '5', 10))) : null;
    const recoveryIntervals = document.getElementById('recoveryIntervals')?.checked || false;
    
    startGuidedPractice({ 
      speed: selectedSpeed, 
      level: selectedLevel, 
      customRounds: customRounds, 
      recoveryIntervals: recoveryIntervals 
    });
  });
  btnPause?.addEventListener('click', pausePractice);
  btnResume?.addEventListener('click', resumePractice);
  btnRestart?.addEventListener('click', restartPractice);
});

// Breath sequence mapping
const BREATH_SEQUENCE = [
  'Exhale', 'Inhale', 'Exhale', 'Inhale', 'Hold', 'Exhale',
  'Inhale', 'Exhale', 'Inhale', 'Exhale', 'Inhale', 'Exhale'
];

// Update breathing display
function updateBreathBox(poseIndex) {
  const breathBox = document.getElementById('breathBox');
  if (!breathBox) return;
  
  const breath = BREATH_SEQUENCE[poseIndex % 12];
  breathBox.textContent = breath;
  
  // Update colors
  breathBox.classList.remove('inhale', 'exhale', 'hold');
  breathBox.classList.add(breath.toLowerCase());
}

// Wire controls and exit button
document.addEventListener('DOMContentLoaded', () => {
  const btnPause = document.getElementById('btnPause');
  const btnResume = document.getElementById('btnResume');
  const btnRestart = document.getElementById('btnRestart');
  const exitBtn = document.getElementById('exitBtn');
  const practiceSection = document.getElementById('practice');
  const breathBox = document.getElementById('breathBox');

  // Initialize breath box
  if (breathBox) {
    updateBreathBox(0);
  }

  // Wire exit button
  if (exitBtn && practiceSection) {
    exitBtn.addEventListener('click', () => {
      // Only handle if in practice mode
      if (!practiceSection.classList.contains('show')) return;

      const wasRunning = practiceState?.running && !practiceState?.paused;
      
      // Pause while confirming
      if (wasRunning) {
        try { pausePractice(); } catch (_) {}
      }

      if (confirm('Do you want to exit?')) {
        // Stop practice
        if (practiceState) {
          clearTimeout(practiceState.timerId);
          practiceState.running = false;
          practiceState.paused = false;
        }
        
        // Return to previous screen
        practiceSection.classList.remove('show');
        document.getElementById('setup')?.classList.remove('active');
        document.getElementById('home')?.classList.add('active');
      } else {
        // Resume if it was running
        if (wasRunning) {
          try { resumePractice(); } catch (_) {}
        }
      }
    });
  }

  // Update practice UI to include breathing
  const originalUpdateUI = updatePracticeUI;
  updatePracticeUI = function() {
    originalUpdateUI.apply(this, arguments);
    // Update breathing after pose changes
    const poseInRound = practiceState.idx % poses.length;
    updateBreathBox(poseInRound);
  };
});

// Handle restart
function restartPractice() {
  // Reset breathing to first pose
  updateBreathBox(0);
  
  // Existing restart logic
  const selectedSpeed = document.querySelector('.speed-btn.selected')?.dataset.speed || 'regular';
  const selectedLevel = document.querySelector('input[name="level"]:checked')?.value || 'beginner';
  const customRounds = selectedLevel === 'custom' ? 
    Math.max(1, Math.min(500, parseInt(document.getElementById('customRounds')?.value || '5', 10))) : null;
  const recoveryIntervals = document.getElementById('recoveryIntervals')?.checked || false;
  
  startGuidedPractice({ 
    speed: selectedSpeed, 
    level: selectedLevel, 
    customRounds: customRounds, 
    recoveryIntervals: recoveryIntervals 
  });
}

