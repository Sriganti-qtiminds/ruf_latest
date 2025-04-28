// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBNDZuso7FyU3PdqWsNOlAPmUdAEggsUSw",
  authDomain: "rufrent-d83b1.firebaseapp.com",
  projectId: "rufrent-d83b1",
  storageBucket: "rufrent-d83b1.firebasestorage.app",
  messagingSenderId: "484664317541",
  appId: "1:484664317541:web:e8e855e334a690b2a5188c",
  measurementId: "G-G9RQE72MW1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider(); // Google Auth Provider
