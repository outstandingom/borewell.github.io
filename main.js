import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Firebase configuration
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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Add Google Auth Provider
const googleProvider = new GoogleAuthProvider();

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
    onAuthStateChanged(auth, user => {
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

function checkAuthState() {
    onAuthStateChanged(auth, user => {
        const searchInput = document.getElementById('searchInput');
        const searchButton = document.querySelector('.search-button');
        
        if (user) {
            // User is signed in
            console.log('User logged in:', user);
            // Enable search functionality
            if (searchInput) searchInput.disabled = false;
            if (searchButton) searchButton.disabled = false;
        } else {
            // User is signed out
            console.log('User signed out');
            // Disable search functionality and show login prompt
            if (searchInput) {
                searchInput.disabled = true;
                searchInput.placeholder = "Please login to search for salons";
            }
            if (searchButton) {
                searchButton.disabled = true;
                searchButton.onclick = function() {
                    window.location.href = 'signin.html';
                };
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Registration functionality
    if (document.getElementById('registerForm')) {
        initRegistration();
    }
    
    // Login functionality
    if (document.getElementById('loginForm')) {
        initLogin();
    }
    
    // Check auth state for all pages
    checkAuthState();
});

function initRegistration() {
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

    const passwordStrengthBar = document.getElementById('passwordStrengthBar');
    const passwordStrengthText = document.getElementById('passwordStrengthText');

    registerPasswordField?.addEventListener('input', function() {
        updatePasswordStrength(this.value, passwordStrengthBar, passwordStrengthText);
    });

    document.getElementById('registerForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        handleRegistration();
    });

    document.getElementById('googleSignIn')?.addEventListener('click', function() {
        signInWithGoogle();
    });
}

function initLogin() {
    const passwordToggle = document.getElementById('loginPasswordToggle');
    const passwordField = document.getElementById('loginPassword');

    passwordToggle?.addEventListener('click', function() {
        togglePasswordVisibility(passwordField, passwordToggle);
    });

    document.getElementById('loginForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });
    
    document.getElementById('googleSignIn')?.addEventListener('click', function() {
        signInWithGoogle();
    });
}

async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        // This gives you a Google Access Token
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info
        const user = result.user;
        console.log('Google sign-in successful', user);
        
        // Redirect or update UI
        window.location.href = 'index.html';
    } catch (error) {
        // Handle Errors here
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error('Google sign-in error', errorCode, errorMessage);
        
        // Show error to user
        alert(`Google sign-in failed: ${errorMessage}`);
    }
}

async function handleRegistration() {
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert("Passwords don't match!");
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('User registered:', user);
        
        await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            createdAt: serverTimestamp()
        });
        
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Registration error:', error.code, error.message);
        alert(`Registration failed: ${error.message}`);
    }
}

async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('User logged in:', user);
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Login error:', error.code, error.message);
        alert(`Login failed: ${error.message}`);
    }
}

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
