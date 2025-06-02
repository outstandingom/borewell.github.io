// Firebase configuration (only once)
const firebaseConfig = {
    apiKey: "AIzaSyCsJR-aYy0VGSPvb7pXHaK3EmGsJWcvdDo",
    authDomain: "login-fa2eb.firebaseapp.com",
    projectId: "login-fa2eb",
    storageBucket: "login-fa2eb.appspot.com",
    messagingSenderId: "1093052500996",
    appId: "1:1093052500996:web:05a13485172c455e93b951",
    measurementId: "G-9TC2J0YQ3R"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', function() {
    // Registration functionality
    if (document.getElementById('registerForm')) {
        initRegistration();
    }
    
    // Login functionality
    if (document.getElementById('loginForm')) {
        initLogin();
    }
});

function initRegistration() {
    // Password visibility toggle
    const registerPasswordToggle = document.getElementById('registerPasswordToggle');
    const registerPasswordField = document.getElementById('registerPassword');
    const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
    const confirmPasswordField = document.getElementById('confirmPassword');

    registerPasswordToggle?.addEventListener('click', function() {
        togglePasswordVisibility(registerPasswordField, registerPasswordToggle);
    });

    confirmPasswordToggle?.addEventListener('click', function() {
        togglePasswordVisibility(confirmPasswordField, confirmPasswordToggle);
    });

    // Password strength indicator
    const passwordStrengthBar = document.getElementById('passwordStrengthBar');
    const passwordStrengthText = document.getElementById('passwordStrengthText');

    registerPasswordField?.addEventListener('input', function() {
        updatePasswordStrength(this.value, passwordStrengthBar, passwordStrengthText);
    });

    // Form submission
    document.getElementById('registerForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        handleRegistration();
    });

    // Social login
    document.getElementById('googleSignIn')?.addEventListener('click', function() {
        socialSignIn(new firebase.auth.GoogleAuthProvider());
    });

    document.getElementById('facebookSignIn')?.addEventListener('click', function() {
        socialSignIn(new firebase.auth.FacebookAuthProvider());
    });
}

function initLogin() {
    // Password visibility toggle
    const passwordToggle = document.getElementById('loginPasswordToggle');
    const passwordField = document.getElementById('loginPassword');

    passwordToggle?.addEventListener('click', function() {
        togglePasswordVisibility(passwordField, passwordToggle);
    });

    // Form submission
    document.getElementById('loginForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });
}

// Helper functions
function togglePasswordVisibility(field, toggle) {
    if (!field || !toggle) return;
    
    if (field.type === 'password') {
        field.type = 'text';
        toggle.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        field.type = 'password';
        toggle.innerHTML = '<i class="fas fa-eye"></i>';
    }
}

function updatePasswordStrength(password, strengthBar, strengthText) {
    if (!password || !strengthBar || !strengthText) return;
    
    let strength = 0;
    let strengthLabel = '';

    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;

    strengthBar.style.width = `${strength}%`;

    if (strength < 50) {
        strengthBar.style.backgroundColor = '#FF5722';
        strengthLabel = 'Weak';
        strengthText.className = 'password-strength-text strength-weak';
    } else if (strength < 75) {
        strengthBar.style.backgroundColor = '#FFC107';
        strengthLabel = 'Medium';
        strengthText.className = 'password-strength-text strength-medium';
    } else {
        strengthBar.style.backgroundColor = '#4CAF50';
        strengthLabel = 'Strong';
        strengthText.className = 'password-strength-text strength-strong';
    }
    
    strengthText.textContent = strengthLabel;
}

// [Rest of your functions like handleRegistration, handleLogin, socialSignIn, etc.]
// Continue with the rest of your existing JavaScript logic
