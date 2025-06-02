import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';

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
const googleProvider = new GoogleAuthProvider();

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
  initRegistration();
  initLogin();
  checkAuthState();
});

// Auth State Check
function checkAuthState() {
  onAuthStateChanged(auth, user => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.querySelector('.search-button');
    
    if (user) {
      console.log('User logged in:', user);
      if (searchInput) searchInput.disabled = false;
      if (searchButton) searchButton.disabled = false;
    } else {
      console.log('User signed out');
      if (searchInput) {
        searchInput.disabled = true;
        searchInput.placeholder = "Please login to search for salons";
      }
      if (searchButton) {
        searchButton.disabled = true;
        searchButton.onclick = () => window.location.href = 'signin.html';
      }
    }
  });
}

// Registration System
function initRegistration() {
  const registerForm = document.getElementById('registerForm');
  if (!registerForm) return;

  // Password visibility toggles
  const registerPasswordToggle = document.getElementById('registerPasswordToggle');
  const registerPasswordField = document.getElementById('registerPassword');
  const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
  const confirmPasswordField = document.getElementById('confirmPassword');

  registerPasswordToggle?.addEventListener('click', () => 
    togglePasswordVisibility(registerPasswordField, registerPasswordToggle));
  
  confirmPasswordToggle?.addEventListener('click', () => 
    togglePasswordVisibility(confirmPasswordField, confirmPasswordToggle));

  // Password strength indicator
  const passwordStrengthBar = document.getElementById('passwordStrengthBar');
  const passwordStrengthText = document.getElementById('passwordStrengthText');

  registerPasswordField?.addEventListener('input', () => 
    updatePasswordStrength(registerPasswordField.value, passwordStrengthBar, passwordStrengthText));

  // Form submission
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleRegistration();
  });

  // Google Sign-In
  document.getElementById('googleSignIn')?.addEventListener('click', signInWithGoogle);
}

async function handleRegistration() {
  try {
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validation
    if (!email || !password || !confirmPassword) {
      throw new Error('Please fill in all fields');
    }

    if (password !== confirmPassword) {
      throw new Error("Passwords don't match!");
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Create user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save additional user data to Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      displayName: user.displayName || "",
      photoURL: user.photoURL || ""
    });

    console.log('User registered and data saved:', user.uid);
    window.location.href = 'index.html';
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
    
    alert(`Registration failed: ${errorMessage}`);
  }
}

// Login System
function initLogin() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  const passwordToggle = document.getElementById('loginPasswordToggle');
  const passwordField = document.getElementById('loginPassword');

  passwordToggle?.addEventListener('click', () => 
    togglePasswordVisibility(passwordField, passwordToggle));

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleLogin();
  });

  document.getElementById('googleSignIn')?.addEventListener('click', signInWithGoogle);
}

async function handleLogin() {
  try {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
      throw new Error('Please fill in all fields');
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update last login timestamp
    await setDoc(doc(db, "users", user.uid), {
      lastLogin: serverTimestamp()
    }, { merge: true });

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
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Save/update user data in Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      lastLogin: serverTimestamp(),
      createdAt: serverTimestamp()
    }, { merge: true });

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
  field.type = field.type === 'password' ? 'text' : 'password';
  toggle.innerHTML = field.type === 'password' 
    ? '<i class="fas fa-eye"></i>' 
    : '<i class="fas fa-eye-slash"></i>';
}

function updatePasswordStrength(password, strengthBar, strengthText) {
  if (!password || !strengthBar || !strengthText) return;
  
  let strength = 0;
  if (password.length >= 8) strength += 25;
  if (/[A-Z]/.test(password)) strength += 25;
  if (/[0-9]/.test(password)) strength += 25;
  if (/[^A-Za-z0-9]/.test(password)) strength += 25;

  strengthBar.style.width = `${strength}%`;
  
  let strengthLabel = '';
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
