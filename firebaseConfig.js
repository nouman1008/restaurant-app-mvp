import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "my-app-1b90e.firebaseapp.com",
  projectId: "my-app-1b90e",
  storageBucket: "my-app-1b90e.firebasestorage.app",
  messagingSenderId: "89549726688",
  appId: "1:89549726688:web:0b6a663646b9772a710185",
  measurementId: "G-LY7MR5DCP0"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);