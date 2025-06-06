// Firebase configuration and initialization
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
const googleProvider = new firebase.auth.GoogleAuthProvider();

// DOM Ready Handler
document.addEventListener('DOMContentLoaded', function() {
    // Initialize based on current page
    if (document.getElementById('registerForm')) {
        initRegistration();
    }
    if (document.getElementById('loginForm')) {
        initLogin();
    }
    
    // Check auth state for all pages
    checkAuthState();
    
    // Initialize location selector if on index page
    if (document.getElementById('locationModal')) {
        initLocationSelector();
    }
});

// Initialize Registration Page
function initRegistration() {
    // Password visibility toggles
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

// Initialize Login Page
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

// Initialize Location Selector
function initLocationSelector() {
    const locationOptions = document.querySelectorAll('.location-option');
    const locationText = document.querySelector('.location-text');
    
    locationOptions.forEach(option => {
        option.addEventListener('click', function() {
            const selectedLocation = this.getAttribute('data-location');
            locationText.textContent = selectedLocation;
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('locationModal'));
            modal.hide();
            
            // You could save this preference to Firestore for the user
        });
    });
}

// Check Authentication State
unction checkAuthState() {
    auth.onAuthStateChanged(user => {
        const searchInput = document.getElementById('searchInput');
        const searchButton = document.querySelector('.search-button');
        
        if (user) {
            // User is signed in
            console.log('User logged in:', user);
            
            // Enable search functionality on index page
            if (searchInput) searchInput.disabled = false;
            if (searchButton) searchButton.disabled = false;
            
            // If on auth pages, redirect to home
            if (window.location.pathname.includes('register.html') || 
                window.location.pathname.includes('signin.html')) {
                window.location.href = 'index.html';
            }
        } else {
            // User is signed out
            console.log('User signed out');
            
            // Disable search functionality on index page
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
            
            // If on protected pages, redirect to login
            if (window.location.pathname.includes('userprofile.html') || 
                window.location.pathname.includes('userbookings.html')) {
                window.location.href = 'signin.html';
            }
        }
    });
}

// Handle Registration
async function handleRegistration() {
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const fullName = document.getElementById('fullName')?.value.trim() || '';
    const termsAgree = document.getElementById('termsAgree').checked;

    // Reset error messages
    resetErrorMessages();

    // Validation
    if (!fullName) {
        showError('nameError', 'Please enter your full name');
        return;
    }
    if (!email) {
        showError('emailError', 'Please enter your email');
        return;
    }
    if (!password) {
        showError('passwordError', 'Please create a password');
        return;
    }
    if (password.length < 8 {
        showError('passwordError', 'Password must be at least 6 characters');
        return;
    }
    if (password !== confirmPassword) {
        showError('confirmPasswordError', "Passwords don't match");
        return;
    }
    if (!termsAgree) {
        showError('termsError', 'You must agree to the terms and conditions');
        return;
    }

    try {
        // Create user with email/password
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Save additional user data to Firestore
        await db.collection('users').doc(user.uid).set({
            uid: user.uid,
            email: user.email,
            displayName: fullName,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            preferences: {}
        });

        console.log('User registered and data saved:', user.uid);
        
        // Show success message
        document.getElementById('successMessage').textContent = 'Registration successful! Redirecting...';
        document.getElementById('successMessage').style.display = 'block';
        
        // Redirect after short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);

    } catch (error) {
        console.error('Registration error:', error);
        let errorMessage = error.message;
        
        // More user-friendly error messages
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'This email is already registered. Please use another email.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Please enter a valid email address.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Password should be at least 6 characters.';
        }
        
        showError('emailError', errorMessage);
    }
}

// Handle Login
async function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe')?.checked || false;

    try {
        // Set persistence based on "remember me" selection
        const persistence = rememberMe ? 
            firebase.auth.Auth.Persistence.LOCAL : 
            firebase.auth.Auth.Persistence.SESSION;
        
        await auth.setPersistence(persistence);

        // Sign in with email/password
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Update last login timestamp in Firestore
        await db.collection('users').doc(user.uid).update({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log('User logged in:', user.uid);
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Login error:', error);
        let errorMessage = error.message;

        if (error.code === 'auth/user-not-found') {
            errorMessage = 'No account found with this email.';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Incorrect password. Please try again.';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Too many failed attempts. Please try again later.';
        }

        alert(`Login failed: ${errorMessage}`);
    }
}

// Google Sign-In
async function signInWithGoogle() {
    try {
        const result = await auth.signInWithPopup(googleProvider);
        const user = result.user;

        // Check if user is new or existing
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (!userDoc.exists) {
            // Save user data to Firestore for new users
            await db.collection('users').doc(user.uid).set({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                preferences: {}
            });
        } else {
            // Update last login for existing users
            await db.collection('users').doc(user.uid).update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        console.log('Google sign-in successful', user.uid);
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Google sign-in error:', error);
        alert(`Google sign-in failed: ${error.message}`);
    }
}

// Helper Functions
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

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

function resetErrorMessages() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => {
        msg.textContent = '';
        msg.style.display = 'none';
    });
      }
