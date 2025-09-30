
// Load progress when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadProgress();
});

// Load user progress from API
async function loadProgress() {
    try {
        const response = await fetch('/api/user/progress');
        const sessions = await response.json();
        
        const progressList = document.getElementById('progress-list');
        
        if (sessions.length === 0) {
            progressList.innerHTML = '<div class="no-sessions">No sessions found. Create your first session!</div>';
            return;
        }
        
        progressList.innerHTML = sessions.map(session => `
            <div class="progress-item">
                <div class="progress-info">
                    <h4>${session.session_type.charAt(0).toUpperCase() + session.session_type.slice(1)} Session</h4>
                    <p>Created: ${new Date(session.created_at).toLocaleDateString()}</p>
                </div>
                <div class="progress-percentage">
                    ${session.progress.percentage || 0}%
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading progress:', error);
        document.getElementById('progress-list').innerHTML = '<div class="no-sessions">Error loading sessions</div>';
    }
}

// Create sample session
async function createSampleSession() {
    try {
        const response = await fetch('/api/session/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'learning',
                progress: Math.floor(Math.random() * 100),
                current_module: 'Module ' + (Math.floor(Math.random() * 5) + 1),
                score: Math.floor(Math.random() * 50) + 50
            })
        });
        
        const result = await response.json();
        if (result.status === 'created') {
            alert('Sample session created successfully!');
            loadProgress(); // Refresh the progress list
        }
    } catch (error) {
        console.error('Error creating session:', error);
        alert('Error creating session');
    }
}

// View progress in console
function viewProgress() {
    console.log('View progress clicked');
    loadProgress();
}
