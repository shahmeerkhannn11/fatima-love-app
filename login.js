// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAVWzwX7kOSSfEBrHjdAB7kGaKEusQwuTA",
  authDomain: "loveapp-4d848.firebaseapp.com",
  databaseURL: "https://loveapp-4d848-default-rtdb.firebaseio.com",
  projectId: "loveapp-4d848",
  storageBucket: "loveapp-4d848.firebasestorage.app",
  messagingSenderId: "106357915882",
  appId: "1:106357915882:web:ec0ce212cfddbb89d31793",
  measurementId: "G-7QY4D3D8V1"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // User signed in
            const user = userCredential.user;
            // Store user data in database
            database.ref('users/' + user.uid).set({
                email: user.email,
                lastLogin: new Date().toISOString()
            });
            window.location.href = 'index.html'; // Redirect after login
        })
        .catch((error) => {
            loginError.textContent = error.message;
        });
});
