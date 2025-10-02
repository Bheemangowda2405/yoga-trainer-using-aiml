
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

// Load user statistics
async function loadUserStats() {
    try {
        const response = await fetch('/api/user/stats?days=30');
        const stats = await response.json();
        
        // Update basic stats
        document.getElementById('totalAsanas').textContent = stats.total_asanas;
        document.getElementById('uniqueAsanas').textContent = stats.unique_asanas;
        document.getElementById('currentStreak').textContent = stats.current_streak;
        document.getElementById('userLevel').textContent = stats.user_level;
        
        // Update daily activity
        updateDailyActivity(stats.daily_activity);
        
        // Update top asanas
        updateTopAsanas(stats.top_asanas);
        
    } catch (error) {
        console.error('Error loading user stats:', error);
    }
}

function updateDailyActivity(dailyData) {
    const container = document.getElementById('dailyActivity');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Find the maximum count to scale bars properly
    const maxCount = Math.max(...dailyData.map(d => d.count), 1);
    const maxBarHeight = 100; // Maximum height in pixels
    
    dailyData.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'day-activity';
        
        // Scale bar height: if count is 0, show 5px; otherwise scale proportionally
        const barHeight = day.count === 0 ? 5 : Math.max((day.count / maxCount) * maxBarHeight, 10);
        
        dayElement.innerHTML = `
            <div class="day-name">${day.day_name}</div>
            <div class="day-bar" style="height: ${barHeight}px"></div>
            <div class="day-count">${day.count}</div>
        `;
        container.appendChild(dayElement);
    });
}

function updateTopAsanas(topAsanas) {
    const container = document.getElementById('topAsanasList');
    container.innerHTML = '';
    
    if (topAsanas.length === 0) {
        container.innerHTML = '<p class="no-data">Start practicing to see your top asanas!</p>';
        return;
    }
    
    topAsanas.forEach((asana, index) => {
        const asanaElement = document.createElement('div');
        asanaElement.className = 'asana-item';
        asanaElement.innerHTML = `
            <span class="asana-rank">${index + 1}</span>
            <span class="asana-name">${asana.traditional_name || asana._id}</span>
            <span class="asana-count">${asana.count} times</span>
        `;
        container.appendChild(asanaElement);
    });
}

// Load stats when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadUserStats();
    
    // Refresh stats every 30 seconds if needed
    setInterval(loadUserStats, 30000);
});

function refreshStats() {
    console.log('Refreshing yoga statistics...');
    loadUserStats();
}

// ==================== USER STATISTICS ====================

async function loadUserStats() {
    try {
        const response = await fetch('/api/user/stats?days=30');
        const stats = await response.json();
        
        // Update basic stats
        updateBasicStats(stats);
        
        // Update daily activity
        updateDailyActivity(stats.daily_activity);
        
        // Update top asanas
        updateTopAsanas(stats.top_asanas);
        
    } catch (error) {
        console.error('Error loading user stats:', error);
    }
}

function updateBasicStats(stats) {
    const totalElement = document.getElementById('totalAsanas');
    const uniqueElement = document.getElementById('uniqueAsanas');
    const streakElement = document.getElementById('currentStreak');
    const levelElement = document.getElementById('userLevel');
    
    if (totalElement) totalElement.textContent = stats.total_asanas || 0;
    if (uniqueElement) uniqueElement.textContent = stats.unique_asanas || 0;
    if (streakElement) streakElement.textContent = stats.current_streak || 0;
    if (levelElement) levelElement.textContent = stats.user_level || 'New Yogi 🎯';
}

function updateDailyActivity(dailyData) {
    const container = document.getElementById('dailyActivity');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Find the maximum count to scale bars properly
    const maxCount = Math.max(...dailyData.map(d => d.count), 1);
    const maxBarHeight = 100; // Maximum height in pixels
    
    dailyData.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'day-activity';
        
        // Scale bar height: if count is 0, show 5px; otherwise scale proportionally
        const barHeight = day.count === 0 ? 5 : Math.max((day.count / maxCount) * maxBarHeight, 10);
        
        dayElement.innerHTML = `
            <div class="day-name">${day.day_name}</div>
            <div class="day-bar" style="height: ${barHeight}px"></div>
            <div class="day-count">${day.count}</div>
        `;
        container.appendChild(dayElement);
    });
}

function updateTopAsanas(topAsanas) {
    const container = document.getElementById('topAsanasList');
    if (!container) return;
    
    container.innerHTML = '';
    topAsanas.forEach((asana, index) => {
        const asanaElement = document.createElement('div');
        asanaElement.className = 'asana-item';
        asanaElement.innerHTML = `
            <span class="asana-rank">${index + 1}</span>
            <span class="asana-name">${asana.traditional_name || asana._id}</span>
            <span class="asana-count">${asana.count} times</span>
        `;
        container.appendChild(asanaElement);
    });
}

function refreshStats() {
    loadUserStats();
}

// Load stats when page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(loadUserStats, 1000);
});
