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

const registerForm = document.getElementById('registerForm');
const registerError = document.getElementById('registerError');

registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const name = document.getElementById('regName').value;
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            // Store user data in database
            return database.ref('users/' + user.uid).set({
                email: user.email,
                name: name,
                createdAt: new Date().toISOString()
            });
        })
        .then(() => {
            window.location.href = 'login.html'; // Redirect to login after registration
        })
        .catch((error) => {
            registerError.textContent = error.message;
        });
});
