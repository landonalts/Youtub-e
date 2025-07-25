import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCSPbpq4adknnpsLaGLwykbIvi8-L1kHEQ",
  authDomain: "lantube-9f26a.firebaseapp.com",
  projectId: "lantube-9f26a",
  storageBucket: "lantube-9f26a.appspot.com",
  messagingSenderId: "546111963485",
  appId: "1:546111963485:web:a8459b0f4eed24250ee8b4",
  measurementId: "G-052TJ84HYE"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);

export { storage, ref, uploadBytes, getDownloadURL, db, collection, addDoc, getDocs };
