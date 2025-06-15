// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBRnhLxFWh0Y1_qz5WC75N-lo8AiWiuNS4",
  authDomain: "indinn-fab2a.firebaseapp.com",
  projectId: "indinn-fab2a",
  storageBucket: "indinn-fab2a.appspot.com",
  messagingSenderId: "404167208141",
  appId: "1:404167208141:web:07a8358044d4338d17cd84",
  measurementId: "G-163EKKPTDJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export them for use in other parts of the app
export { app, auth, db, storage };
