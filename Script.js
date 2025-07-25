import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import {
  getStorage, ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";

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
const db = getFirestore(app);
const storage = getStorage(app);
const videoList = document.getElementById("videoList");

window.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");
  console.log("uploadForm exists:", !!document.getElementById("uploadForm"));
  console.log("darkToggle exists:", !!document.getElementById("darkToggle"));
  console.log("sidebar links:", document.querySelectorAll(".sidebar a").length);

  document.getElementById("darkToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark");
  });

  document.querySelectorAll(".sidebar a").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      alert(`Clicked on "${link.textContent}" tab`);
    });
  });

  document.getElementById("uploadForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Upload form submit triggered");
    const title = document.getElementById("videoTitle").value.trim();
    const videoFile = document.getElementById("videoFile").files[0];
    const thumbnailFile = document.getElementById("thumbnailFile").files[0];
    const channel = document.getElementById("videoChannel").value.trim();

    if (!title || !videoFile || !thumbnailFile || !channel) {
      alert("Please fill in all fields and select files.");
      return;
    }

    try {
      const videoRef = ref(storage, `videos/${Date.now()}_${videoFile.name}`);
      await uploadBytes(videoRef, videoFile);
      const videoURL = await getDownloadURL(videoRef);

      const thumbRef = ref(storage, `thumbnails/${Date.now()}_${thumbnailFile.name}`);
      await uploadBytes(thumbRef, thumbnailFile);
      const thumbURL = await getDownloadURL(thumbRef);

      const videosCol = collection(db, "videos");
      await addDoc(videosCol, {
        title,
        channel,
        videoURL,
        thumbURL,
        views: 0,
        uploadedAt: serverTimestamp()
      });

      alert("Upload successful!");
      e.target.reset();
      loadVideos();
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload error: " + err.message);
    }
  });

  loadVideos();
});

async function loadVideos() {
  videoList.innerHTML = "";
  const videosCol = collection(db, "videos");
  const q = query(videosCol, orderBy("uploadedAt", "desc"));
  try {
    const snapshot = await getDocs(q);
    snapshot.forEach(doc => {
      const v = doc.data();
      const card = document.createElement("div");
      card.className = "video-card";
      card.innerHTML = `
        <img class="video-thumb" src="${v.thumbURL}" alt="${v.title}">
        <div class="video-info">
          <h4>${v.title}</h4>
          <p>${v.channel} • ${v.views || 0} views</p>
        </div>
      `;
      videoList.appendChild(card);
    });
  } catch (err) {
    console.error("Failed to load videos:", err);
  }
}
