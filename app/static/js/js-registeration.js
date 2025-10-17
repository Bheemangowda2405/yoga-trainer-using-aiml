// Username validation function
function validateUsername(username) {
    const errors = [];
    
    // Check minimum length
    if (username.length < 3) {
        errors.push('Username must be at least 3 characters long');
    }
    
    // Check maximum length (15-20 characters)
    if (username.length > 20) {
        errors.push('Username must not exceed 20 characters');
    }
    
    // Must start with a letter
    if (!/^[a-zA-Z]/.test(username)) {
        errors.push('Username must start with a letter');
    }
    
    // Check for prohibited characters (only letters, numbers, and underscores allowed)
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(username)) {
        errors.push('Username can only contain letters, numbers, and underscores');
    }
    
    // If numbers are present, they should typically be at the end (optional strict rule)
    // This checks if there are numbers in the middle followed by letters
    if (/\d+[a-zA-Z]+/.test(username)) {
        errors.push('Numbers should be at the end of the username');
    }
    
    return errors;
}

// Real-time username validation feedback
const usernameInput = document.getElementById('username');
let usernameHelpText = null;

if (usernameInput) {
    // Create help text element
    usernameHelpText = document.createElement('div');
    usernameHelpText.style.marginTop = '0.5rem';
    usernameHelpText.style.fontSize = '0.875rem';
    usernameInput.parentElement.appendChild(usernameHelpText);
    
    usernameInput.addEventListener('input', function() {
        const username = this.value;
        
        if (username.length === 0) {
            usernameHelpText.innerHTML = '';
            return;
        }
        
        const errors = validateUsername(username);
        
        if (errors.length === 0) {
            usernameHelpText.innerHTML = '<span style="color: #51cf66;">✓ Valid username</span>';
        } else {
            usernameHelpText.innerHTML = '<span style="color: #ff6b6b;">✗ ' + errors[0] + '</span>';
        }
    });
}

// Form validation
document.querySelector('form').addEventListener('submit', function(e) {
    const password = document.getElementById('password').value;
    const username = document.getElementById('username').value;
    
    // Validate username
    const usernameErrors = validateUsername(username);
    if (usernameErrors.length > 0) {
        alert('Username validation failed:\n\n' + usernameErrors.join('\n'));
        e.preventDefault();
        return;
    }
    
    // Validate password
    if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        e.preventDefault();
        return;
    }
});

// Password visibility toggle
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleButton = document.querySelector('.password-toggle');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleButton.textContent = '🔒';
    } else {
        passwordInput.type = 'password';
        toggleButton.textContent = '👁️';
    }
}

// Escape key to go back to login page
document.addEventListener('keydown', function(e) {
    console.log('Key pressed:', e.key); // Debug log
    if (e.key === 'Escape' || e.keyCode === 27) {
        e.preventDefault();
        window.location.href = '/login';
    }
});
