const exploreBtn = document.getElementById('exploreBtn');
const practiceOptions = document.getElementById('practiceOptions');
const yogaPracticeBtn = document.getElementById('yogaPracticeBtn');
const sooryanamaskarBtn = document.getElementById('sooryanamaskarBtn');
const playPauseButton = document.getElementById('playPauseBtn');
const stopButton = document.getElementById('stopBtn');

let isPlaying = false;
let isExpanded = false;

// Explore button toggle
exploreBtn.addEventListener('click', () => {
    isExpanded = !isExpanded;
    
    if (isExpanded) {
        exploreBtn.textContent = 'Close';
        practiceOptions.classList.remove('hidden');
        practiceOptions.classList.add('expanded');
    } else {
        exploreBtn.textContent = 'Start Your Practice';
        practiceOptions.classList.remove('expanded');
        practiceOptions.classList.add('hidden');
    }
});

// Yoga practice button - Navigate to webcam page
yogaPracticeBtn.addEventListener('click', () => {
    window.location.href = '/webcam';
});

// Sooryanamaskar button - Navigate to sooryanamaskar page
sooryanamaskarBtn.addEventListener('click', () => {
    window.location.href = '../sooryanamaskar.html';
});

// Play/Pause button
playPauseButton.addEventListener('click', () => {
    isPlaying = !isPlaying;
    updatePlayPauseButton();
});

// Stop button
stopButton.addEventListener('click', () => {
    isPlaying = false;
    updatePlayPauseButton();
    // Add functionality to stop the timer or practice here
});

function updatePlayPauseButton() {
    if (isPlaying) {
        playPauseButton.textContent = 'Pause';
        playPauseButton.classList.add('playing');
        playPauseButton.classList.remove('paused');
    } else {
        playPauseButton.textContent = 'Play';
        playPauseButton.classList.add('paused');
        playPauseButton.classList.remove('playing');
    }
}