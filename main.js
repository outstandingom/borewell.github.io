document.addEventListener('DOMContentLoaded', function () {
    // Initialize Bootstrap modal (only if the element exists)
    const locationModalElement = document.getElementById('locationModal');
    if (locationModalElement) {
        const locationModal = new bootstrap.Modal(locationModalElement);

        // Location selection functionality
        document.querySelectorAll('.location-option').forEach(option => {
            option.addEventListener('click', function () {
                const location = this.getAttribute('data-location');
                const locationText = document.querySelector('.location-text');
                if (locationText) {
                    locationText.textContent = location;
                }
                locationModal.hide();

                // Show confirmation
                const event = new CustomEvent('locationChanged', { detail: location });
                document.dispatchEvent(event);
            });
        });
    }

    // Search button functionality
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');

    if (searchButton && searchInput) {
        searchButton.addEventListener('click', function () {
            const searchTerm = searchInput.value;
            if (searchTerm.trim() !== '') {
                alert(`Searching for: ${searchTerm}`);
                // Add API call here
            } else {
                searchInput.focus();
            }
        });

        // Trigger search on pressing Enter
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                searchButton.click();
            }
        });
    }

    // Category selection
    const categories = document.querySelectorAll('.category');
    if (categories.length > 0) {
        categories.forEach(category => {
            category.addEventListener('click', function () {
                categories.forEach(cat => cat.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }
});


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
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Password visibility toggle
const registerPasswordToggle = document.getElementById('registerPasswordToggle');
const registerPasswordField = document.getElementById('registerPassword');
const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
const confirmPasswordField = document.getElementById('confirmPassword');

registerPasswordToggle.addEventListener('click', function() {
    if (registerPasswordField.type === 'password') {
        registerPasswordField.type = 'text';
        registerPasswordToggle.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        registerPasswordField.type = 'password';
        registerPasswordToggle.innerHTML = '<i class="fas fa-eye"></i>';
    }
});

confirmPasswordToggle.addEventListener('click', function() {
    if (confirmPasswordField.type === 'password') {
        confirmPasswordField.type = 'text';
        confirmPasswordToggle.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        confirmPasswordField.type = 'password';
        confirmPasswordToggle.innerHTML = '<i class="fas fa-eye"></i>';
    }
});

// Password strength indicator
registerPasswordField.addEventListener('input', function() {
    const password = this.value;
    const strengthBar = document.getElementById('passwordStrength');
    let strength = 0;

    // Check password criteria
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;

    // Update strength bar
    strengthBar.style.width = `${strength}%`;

    // Update color
    if (strength < 50) {
        strengthBar.style.backgroundColor = '#FF5722';
    } else if (strength < 75) {
        strengthBar.style.backgroundColor = '#FFC107';
    } else {
        strengthBar.style.backgroundColor = '#4CAF50';
    }
});

// Form validation
function validateForm() {
    let isValid = true;
    const name = document.getElementById('fullName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const termsAgreed = document.getElementById('termsAgree').checked;

    // Reset error messages
    document.querySelectorAll('.error-message').forEach(el => {
        el.style.display = 'none';
        el.textContent = '';
    });

    // Validate name
    if (name === '') {
        document.getElementById('nameError').textContent = 'Full name is required';
        document.getElementById('nameError').style.display = 'block';
        isValid = false;
    }

    // Validate email
    if (email === '') {
        document.getElementById('emailError').textContent = 'Email is required';
        document.getElementById('emailError').style.display = 'block';
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        document.getElementById('emailError').textContent = 'Please enter a valid email';
        document.getElementById('emailError').style.display = 'block';
        isValid = false;
    }

    // Validate password
    if (password === '') {
        document.getElementById('passwordError').textContent = 'Password is required';
        document.getElementById('passwordError').style.display = 'block';
        isValid = false;
    } else if (password.length < 8) {
        document.getElementById('passwordError').textContent = 'Password must be at least 8 characters';
        document.getElementById('passwordError').style.display = 'block';
        isValid = false;
    } else if (!/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
        document.getElementById('passwordError').textContent = 'Password must contain uppercase, number, and special character';
        document.getElementById('passwordError').style.display = 'block';
        isValid = false;
    }

    // Validate confirm password
    if (confirmPassword === '') {
        document.getElementById('confirmPasswordError').textContent = 'Please confirm your password';
        document.getElementById('confirmPasswordError').style.display = 'block';
        isValid = false;
    } else if (password !== confirmPassword) {
        document.getElementById('confirmPasswordError').textContent = 'Passwords do not match';
        document.getElementById('confirmPasswordError').style.display = 'block';
        isValid = false;
    }

    // Validate terms
    if (!termsAgreed) {
        document.getElementById('termsError').textContent = 'You must agree to the terms';
        document.getElementById('termsError').style.display = 'block';
        isValid = false;
    }

    return isValid;
}

// Form submission
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();

    if (!validateForm()) {
        return;
    }

    const name = document.getElementById('fullName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const registerButton = document.getElementById('registerButton');

    // Disable button to prevent multiple submissions
    registerButton.disabled = true;
    registerButton.textContent = 'Creating Account...';

    // Create user with Firebase Auth
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // User created successfully
            const user = userCredential.user;

            // Save additional user data to Firestore
            return db.collection('users').doc(user.uid).set({
                name: name,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            // Show success message
            document.getElementById('successMessage').textContent = 'Account created successfully! Redirecting...';
            document.getElementById('successMessage').style.display = 'block';

            // Reset form
            document.getElementById('registerForm').reset();

            // Redirect to index.html after 2 seconds
            setTimeout(() => {
                window.location.href = 'https://outstandingom.github.io/pro.github.io/index.html';
            }, 2000);
        })
        .catch((error) => {
            // Handle errors
            registerButton.disabled = false;
            registerButton.textContent = 'Create Account';

            let errorMessage = 'An error occurred. Please try again.';

            switch(error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'This email is already registered.';
                    document.getElementById('emailError').textContent = errorMessage;
                    document.getElementById('emailError').style.display = 'block';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'The email address is invalid.';
                    document.getElementById('emailError').textContent = errorMessage;
                    document.getElementById('emailError').style.display = 'block';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'The password is too weak.';
                    document.getElementById('passwordError').textContent = errorMessage;
                    document.getElementById('passwordError').style.display = 'block';
                    break;
                default:
                    alert(errorMessage);
            }
        });
});

// Social login handlers
document.getElementById('googleSignIn').addEventListener('click', function() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            // Handle successful login
            const user = result.user;
            return db.collection('users').doc(user.uid).set({
                name: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                provider: 'google',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        })
        .then(() => {
            window.location.href = 'https://outstandingom.github.io/pro.github.io/index.html'; // Redirect to dashboard
        })
        .catch((error) => {
            console.error('Google sign in error:', error);
            alert('Google sign in failed: ' + error.message);
        });
});

document.getElementById('facebookSignIn').addEventListener('click', function() {
    const provider = new firebase.auth.FacebookAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            // Handle successful login
            const user = result.user;
            return db.collection('users').doc(user.uid).set({
                name: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                provider: 'facebook',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        })
        .then(() => {
            window.location.href = 'https://outstandingom.github.io/pro.github.io/index.html'; // Redirect to dashboard
        })
        .catch((error) => {
            console.error('Facebook sign in error:', error);
            alert('Facebook sign in failed: ' + error.message);
        });
});

// login page 
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
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Password visibility toggle
const passwordToggle = document.getElementById('loginPasswordToggle');
const passwordField = document.getElementById('loginPassword');

passwordToggle.addEventListener('click', function () {
  if (passwordField.type === 'password') {
    passwordField.type = 'text';
    passwordToggle.innerHTML = '<i class="fas fa-eye-slash"></i>';
  } else {
    passwordField.type = 'password';
    passwordToggle.innerHTML = '<i class="fas fa-eye"></i>';
  }
});

// Login form submission
// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Handle login form submit
document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  const successMessage = document.getElementById('successMessage');
  const errorMessage = document.getElementById('loginError');

  // Clear previous messages
  successMessage.style.display = 'none';
  errorMessage.style.display = 'none';

  if (email && password) {
    auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // Login successful
        successMessage.textContent = 'Login successful! Redirecting...';
        successMessage.style.display = 'block';

        setTimeout(() => {
          window.location.href = 'https://outstandingom.github.io/pro.github.io/index.html';
        }, 1500);
      })
      .catch((error) => {
        errorMessage.textContent = error.message;
        errorMessage.style.display = 'block';
      });
  } else {
    errorMessage.textContent = 'Please fill in all fields';
    errorMessage.style.display = 'block';
  }
});

// Animate inputs on focus/blur
document.querySelectorAll('.form-control').forEach(input => {
  input.addEventListener('focus', function () {
    this.style.boxShadow = '0 0 0 3px rgba(18, 18, 18, 0.1)';
  });

  input.addEventListener('blur', function () {
    this.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.03)';
  });
});
