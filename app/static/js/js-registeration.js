
// Simple form validation
document.querySelector('form').addEventListener('submit', function(e) {
    const password = document.getElementById('password').value;
    const username = document.getElementById('username').value;
    
    if (username.length < 3) {
        alert('Username must be at least 3 characters long');
        e.preventDefault();
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        e.preventDefault();
        return;
    }
});
