// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAyIhHPp6Hx2qSFHjSquzGVrG5Sk8sXpZM",
    authDomain: "cowe-c29c2.firebaseapp.com",
    projectId: "cowe-c29c2",
    storageBucket: "cowe-c29c2.firebasestorage.app",
    messagingSenderId: "195477983983",
    appId: "1:195477983983:web:b7b05930aa3a776751011a",
    measurementId: "G-VR51ZLV6ZB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// @ts-ignore
const analytics = getAnalytics(app);
export const auth = getAuth(app);