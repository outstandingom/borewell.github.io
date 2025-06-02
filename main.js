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

// Add Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();

document.addEventListener('DOMContentLoaded', function() {
    // Registration functionality
    if (document.getElementById('registerForm')) {
        initRegistration();
    }
    
    // Login functionality
    if (document.getElementById('loginForm')) {
        initLogin();
    }
    
    // Check auth state
    auth.onAuthStateChanged(user => {
        if (user) {
            // User is signed in
            console.log('User logged in:', user);
            // You can redirect or update UI here
        } else {
            // User is signed out
            console.log('User signed out');
        }
    });
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

    // Google Sign-In button
    document.getElementById('googleSignIn')?.addEventListener('click', function() {
        signInWithGoogle();
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
    
    // Google Sign-In button for login page
    document.getElementById('googleSignIn')?.addEventListener('click', function() {
        signInWithGoogle();
    });
}

// Sign in with Google function
function signInWithGoogle() {
    auth.signInWithPopup(googleProvider)
        .then((result) => {
            // This gives you a Google Access Token
            const credential = result.credential;
            const token = credential.accessToken;
            // The signed-in user info
            const user = result.user;
            console.log('Google sign-in successful', user);
            
            // Redirect or update UI
            window.location.href = 'index.html'; // Change to your desired redirect
        })
        .catch((error) => {
            // Handle Errors here
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error('Google sign-in error', errorCode, errorMessage);
            
            // Show error to user
            alert(`Google sign-in failed: ${errorMessage}`);
        });
}

// Email/password registration
function handleRegistration() {
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Basic validation
    if (password !== confirmPassword) {
        alert("Passwords don't match!");
        return;
    }

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed up successfully
            const user = userCredential.user;
            console.log('User registered:', user);
            
            // You can add user data to Firestore here if needed
            return db.collection('users').doc(user.uid).set({
                email: user.email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            // Redirect after successful registration
            window.location.href = 'pro.github.io/index.html'; // Change to your desired redirect
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error('Registration error:', errorCode, errorMessage);
            alert(`Registration failed: ${errorMessage}`);
        });
}

// Email/password login
function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in successfully
            const user = userCredential.user;
            console.log('User logged in:', user);
            
            // Redirect after successful login
            window.location.href = 'index.html'; // Change to your desired redirect
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error('Login error:', errorCode, errorMessage);
            alert(`Login failed: ${errorMessage}`);
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
