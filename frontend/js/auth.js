// Common authentication functionality for all pages
document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    
    if (token) {
        try {
            // Check if token is valid and get user data
            if (isTokenExpired(token)) {
                // If token is expired, show login/signup buttons
                document.getElementById('auth-buttons').style.display = 'block';
                document.getElementById('user-account-section').style.display = 'none';
            } else {
                // If token is valid, get user data and show account section
                const userData = await getUserProfile();
                
                if (userData) {
                    // Display user name
                    document.getElementById('user-name').textContent = userData.name || 'User';
                    
                    // Show user account section, hide login/signup buttons
                    document.getElementById('user-account-section').style.display = 'block';
                    document.getElementById('auth-buttons').style.display = 'none';
                } else {
                    // If no user data, show login/signup buttons
                    document.getElementById('auth-buttons').style.display = 'block';
                    document.getElementById('user-account-section').style.display = 'none';
                }
            }
        } catch (error) {
            console.error('Error checking authentication:', error);
            // On error, show login/signup buttons
            document.getElementById('auth-buttons').style.display = 'block';
            document.getElementById('user-account-section').style.display = 'none';
        }
    } else {
        // If no token, show login/signup buttons
        document.getElementById('auth-buttons').style.display = 'block';
        document.getElementById('user-account-section').style.display = 'none';
    }
}); 