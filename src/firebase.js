import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDW3-HKnauE5gmVlnbnjgpvLT2uAT2V5E4",
    authDomain: "ozodbek-santexnik.firebaseapp.com",
    projectId: "ozodbek-santexnik",
    storageBucket: "ozodbek-santexnik.firebasestorage.app",
    messagingSenderId: "687974175477",
    appId: "1:687974175477:web:66c100d021e0fd1c9f6bbc"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
