// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Check if the token is expired based on jwt payload
function isTokenExpired(token) {
    if (!token) return true;
    
    try {
        // Get the payload part of the JWT token (the middle part)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        // Check if the token has an expiration time
        if (payload.exp) {
            // Convert expiration time from seconds to milliseconds
            const expirationTime = payload.exp * 1000;
            const currentTime = Date.now();
            
            // Compare expiration time with current time
            return currentTime >= expirationTime;
        }
        
        return false; // No expiration time in token
    } catch (error) {
        console.error('Error parsing token:', error);
        return true; // If there's an error, consider token expired
    }
}

// Authentication Functions
async function login(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/user/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email, password }),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed');
        }
        
        const data = await response.json();
        if (data.success) {
            localStorage.setItem('token', data.token);
            
            // Always redirect to user profile page after login
            window.location.href = '/userProfile.html';
        } else {
            throw new Error(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert(error.message || 'Login failed. Please try again.');
    }
}

async function register(userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/user/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(userData),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Registration failed');
        }
        
        const data = await response.json();
        if (data.success) {
            alert('Registration successful! Please login to continue.');
            window.location.href = '/login.html';
        } else {
            throw new Error(data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert(error.message || 'Registration failed. Please try again.');
    }
}

// Problem Management Functions
async function submitProblem(problemData) {
    try {
        const token = localStorage.getItem('token');
        
        // Check if token is expired
        if (isTokenExpired(token)) {
            alert('Your session has expired. Please login again.');
            logout();
            return;
        }
        
        const response = await fetch(`${API_BASE_URL}/problems`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(problemData),
        });
        const data = await response.json();
        
        if (response.ok) {
            alert('Problem submitted successfully!');
        } else {
            if (data.expired) {
                alert('Your session has expired. Please login again.');
                logout();
                return;
            }
            throw new Error(data.message || 'Failed to submit problem');
        }
    } catch (error) {
        console.error('Submit problem error:', error);
        alert(error.message);
    }
}

async function getProblems() {
    try {
        const token = localStorage.getItem('token');
        
        // Check if token is expired
        if (isTokenExpired(token)) {
            alert('Your session has expired. Please login again.');
            logout();
            throw new Error('Session expired');
        }
        
        const response = await fetch(`${API_BASE_URL}/problems`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        const data = await response.json();
        
        if (response.ok) {
            return data;
        } else {
            if (data.expired) {
                alert('Your session has expired. Please login again.');
                logout();
                throw new Error('Session expired');
            }
            throw new Error(data.message || 'Failed to fetch problems');
        }
    } catch (error) {
        console.error('Get problems error:', error);
        throw error;
    }
}

// Feedback Functions
async function submitFeedback(feedbackData) {
    try {
        const token = localStorage.getItem('token');
        
        // Check if token is expired
        if (isTokenExpired(token)) {
            alert('Your session has expired. Please login again.');
            logout();
            return;
        }
        
        const response = await fetch(`${API_BASE_URL}/feedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(feedbackData),
        });
        const data = await response.json();
        
        if (response.ok) {
            alert('Feedback submitted successfully!');
        } else {
            if (data.expired) {
                alert('Your session has expired. Please login again.');
                logout();
                return;
            }
            throw new Error(data.message || 'Failed to submit feedback');
        }
    } catch (error) {
        console.error('Submit feedback error:', error);
        alert(error.message);
    }
}

// Admin Functions
async function adminLogin(username, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ username, password }),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Admin login failed');
        }
        
        const data = await response.json();
        if (data.success) {
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminUser', JSON.stringify(data.user));
            window.location.href = '/admin/dashboard';
        } else {
            throw new Error(data.message || 'Admin login failed');
        }
    } catch (error) {
        console.error('Admin login error:', error);
        alert(error.message || 'Admin login failed. Please try again.');
    }
}

// New Admin Dashboard Functions
async function getAdminAllUsers() {
    try {
        const token = localStorage.getItem('adminToken');
        
        // Check if token is expired
        if (isTokenExpired(token)) {
            alert('Your admin session has expired. Please login again.');
            logout();
            throw new Error('Session expired');
        }
        
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        const data = await response.json();
        
        if (response.ok && data.success) {
            return data.users;
        } else {
            if (data.expired) {
                alert('Your admin session has expired. Please login again.');
                logout();
                throw new Error('Session expired');
            }
            throw new Error(data.message || 'Failed to fetch users');
        }
    } catch (error) {
        console.error('Get users error:', error);
        throw error;
    }
}

async function getAdminAllProblems() {
    try {
        const token = localStorage.getItem('adminToken');
        
        // Check if token is expired
        if (isTokenExpired(token)) {
            alert('Your admin session has expired. Please login again.');
            logout();
            throw new Error('Session expired');
        }
        
        const response = await fetch(`${API_BASE_URL}/admin/problems`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        const data = await response.json();
        
        if (response.ok && data.success) {
            return data.problems;
        } else {
            if (data.expired) {
                alert('Your admin session has expired. Please login again.');
                logout();
                throw new Error('Session expired');
            }
            throw new Error(data.message || 'Failed to fetch problems');
        }
    } catch (error) {
        console.error('Get problems error:', error);
        throw error;
    }
}

async function updateProblemStatus(problemId, status) {
    try {
        const token = localStorage.getItem('adminToken');
        
        // Check if token is expired
        if (isTokenExpired(token)) {
            alert('Your admin session has expired. Please login again.');
            logout();
            throw new Error('Session expired');
        }
        
        const response = await fetch(`${API_BASE_URL}/admin/problems/${problemId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ status }),
        });
        const data = await response.json();
        
        if (response.ok && data.success) {
            return true;
        } else {
            if (data.expired) {
                alert('Your admin session has expired. Please login again.');
                logout();
                throw new Error('Session expired');
            }
            throw new Error(data.message || 'Failed to update problem status');
        }
    } catch (error) {
        console.error('Update problem status error:', error);
        throw error;
    }
}

async function getAdminAllSolutions() {
    try {
        const token = localStorage.getItem('adminToken');
        
        // Check if token is expired
        if (isTokenExpired(token)) {
            alert('Your admin session has expired. Please login again.');
            logout();
            throw new Error('Session expired');
        }
        
        const response = await fetch(`${API_BASE_URL}/admin/solutions`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        const data = await response.json();
        
        if (response.ok && data.success) {
            return data.solutions;
        } else {
            if (data.expired) {
                alert('Your admin session has expired. Please login again.');
                logout();
                throw new Error('Session expired');
            }
            throw new Error(data.message || 'Failed to fetch solutions');
        }
    } catch (error) {
        console.error('Get solutions error:', error);
        throw error;
    }
}

async function addSolution(solutionData) {
    try {
        const token = localStorage.getItem('adminToken');
        
        // Check if token is expired
        if (isTokenExpired(token)) {
            alert('Your admin session has expired. Please login again.');
            logout();
            throw new Error('Session expired');
        }
        
        const response = await fetch(`${API_BASE_URL}/admin/solutions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(solutionData),
        });
        const data = await response.json();
        
        if (response.ok && data.success) {
            return true;
        } else {
            if (data.expired) {
                alert('Your admin session has expired. Please login again.');
                logout();
                throw new Error('Session expired');
            }
            throw new Error(data.message || 'Failed to add solution');
        }
    } catch (error) {
        console.error('Add solution error:', error);
        throw error;
    }
}

async function deleteSolution(solutionId) {
    try {
        const token = localStorage.getItem('adminToken');
        
        // Check if token is expired
        if (isTokenExpired(token)) {
            alert('Your admin session has expired. Please login again.');
            logout();
            throw new Error('Session expired');
        }
        
        const response = await fetch(`${API_BASE_URL}/admin/solutions/${solutionId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        const data = await response.json();
        
        if (response.ok && data.success) {
            return true;
        } else {
            if (data.expired) {
                alert('Your admin session has expired. Please login again.');
                logout();
                throw new Error('Session expired');
            }
            throw new Error(data.message || 'Failed to delete solution');
        }
    } catch (error) {
        console.error('Delete solution error:', error);
        throw error;
    }
}

// Utility Functions
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return false;
    }
    
    // Check if token is expired
    if (isTokenExpired(token)) {
        alert('Your session has expired. Please login again.');
        logout();
        return false;
    }
    
    return true;
}

function checkAdminAuth() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = '/admin/login';
        return false;
    }
    
    // Check if token is expired
    if (isTokenExpired(token)) {
        alert('Your admin session has expired. Please login again.');
        logout();
        return false;
    }
    
    return true;
}

function logout() {
    const isAdmin = localStorage.getItem('adminToken') !== null;
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    
    if (isAdmin) {
        window.location.href = '/admin/login';
    } else {
        // For regular users, redirect to Homepage instead of login
        window.location.href = '/Homepage.html';
    }
}

// OAuth Functions
function initiateGoogleAuth() {
    const clientId = '905887431725-67n0svn3ev5oeg628p16sufm9nif4ko0.apps.googleusercontent.com';
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const scope = 'email profile';
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent(scope)}` +
        `&access_type=offline` +
        `&prompt=consent`;
    
    window.location.href = authUrl;
}

function initiateGithubAuth() {
    const clientId = 'Ov23li827o1rNLbTDvsL';
    const redirectUri = `${window.location.origin}/auth/github/callback`;
    const scope = 'user:email';
    
    const authUrl = `https://github.com/login/oauth/authorize?` +
        `client_id=${clientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=${encodeURIComponent(scope)}`;
    
    window.location.href = authUrl;
}

// Update the social login handlers
function handleGoogleLogin() {
    initiateGoogleAuth();
}

function handleGithubLogin() {
    initiateGithubAuth();
}

function handleGoogleSignup() {
    initiateGoogleAuth();
}

function handleGithubSignup() {
    initiateGithubAuth();
}

async function getSolutions() {
    try {
        const token = localStorage.getItem('token');
        
        // Check if token is expired
        if (isTokenExpired(token)) {
            alert('Your session has expired. Please login again.');
            logout();
            throw new Error('Session expired');
        }
        
        const response = await fetch(`${API_BASE_URL}/solutions/all`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        const data = await response.json();
        
        if (response.ok && data.success) {
            return data.solutions;
        } else {
            if (data.expired) {
                alert('Your session has expired. Please login again.');
                logout();
                throw new Error('Session expired');
            }
            throw new Error(data.message || 'Failed to fetch solutions');
        }
    } catch (error) {
        console.error('Get solutions error:', error);
        throw error;
    }
}

async function getUserProfile() {
    try {
        const token = localStorage.getItem('token');
        
        // Check if token is expired
        if (isTokenExpired(token)) {
            alert('Your session has expired. Please login again.');
            logout();
            throw new Error('Session expired');
        }
        
        const response = await fetch(`${API_BASE_URL}/user/get-profile`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        const data = await response.json();
        
        if (response.ok && data.success) {
            return data.userData;
        } else {
            if (data.expired) {
                alert('Your session has expired. Please login again.');
                logout();
                throw new Error('Session expired');
            }
            throw new Error(data.message || 'Failed to fetch user profile');
        }
    } catch (error) {
        console.error('Get user profile error:', error);
        throw error;
    }
}

async function updateUserProfile(profileData) {
    try {
        const token = localStorage.getItem('token');
        
        // Check if token is expired
        if (isTokenExpired(token)) {
            alert('Your session has expired. Please login again.');
            logout();
            throw new Error('Session expired');
        }
        
        // Create form data if there's a file to upload
        let requestOptions = {};
        
        if (profileData.profileImage instanceof File) {
            const formData = new FormData();
            Object.keys(profileData).forEach(key => {
                if (key === 'profileImage' && profileData[key] instanceof File) {
                    formData.append('image', profileData[key]);
                } else {
                    formData.append(key, profileData[key]);
                }
            });
            
            requestOptions = {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            };
        } else {
            requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(profileData),
            };
        }
        
        const response = await fetch(`${API_BASE_URL}/user/update-profile`, requestOptions);
        const data = await response.json();
        
        if (response.ok && data.success) {
            return true;
        } else {
            if (data.expired) {
                alert('Your session has expired. Please login again.');
                logout();
                throw new Error('Session expired');
            }
            throw new Error(data.message || 'Failed to update profile');
        }
    } catch (error) {
        console.error('Update profile error:', error);
        throw error;
    }
}

async function getSolutionDetails(solutionId) {
    try {
        const token = localStorage.getItem('token');
        
        // Check if token is expired
        if (isTokenExpired(token)) {
            alert('Your session has expired. Please login again.');
            logout();
            throw new Error('Session expired');
        }
        
        // For now, just get all solutions and find the specific one
        // In a production environment, you would have a dedicated endpoint
        const solutions = await getSolutions();
        return solutions.find(solution => solution._id === solutionId);
    } catch (error) {
        console.error('Get solution details error:', error);
        throw error;
    }
}

// Get all solutions without requiring authentication - for public Solutions page
async function getPublicSolutions() {
    try {
        const response = await fetch(`${API_BASE_URL}/solutions/public`);
        const data = await response.json();
        
        if (response.ok && data.success) {
            return data.solutions;
        } else {
            throw new Error(data.message || 'Failed to fetch public solutions');
        }
    } catch (error) {
        console.error('Get public solutions error:', error);
        throw error;
    }
} 