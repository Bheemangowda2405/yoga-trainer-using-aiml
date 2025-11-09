const playPauseButton = document.getElementById('play-pause');
const stopButton = document.getElementById('stop');

let isPlaying = false;

playPauseButton.addEventListener('click', () => {
    isPlaying = !isPlaying;
    updatePlayPauseButton();
});

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