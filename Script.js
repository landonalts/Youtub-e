// Import modular Firebase functions from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";

// Your Firebase config (use your actual config here)
const firebaseConfig = {
  apiKey: "AIzaSyCSPbpq4adknnpsLaGLwykbIvi8-L1kHEQ",
  authDomain: "lantube-9f26a.firebaseapp.com",
  projectId: "lantube-9f26a",
  storageBucket: "lantube-9f26a.appspot.com",
  messagingSenderId: "546111963485",
  appId: "1:546111963485:web:a8459b0f4eed24250ee8b4",
  measurementId: "G-052TJ84HYE"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const videoList = document.getElementById("videoList");

// Load videos from Firestore and display
async function loadVideos() {
  videoList.innerHTML = "";
  const videosCol = collection(db, "videos");
  const q = query(videosCol, orderBy("uploadedAt", "desc"));
  const snapshot = await getDocs(q);

  snapshot.forEach(doc => {
    const video = doc.data();
    const card = document.createElement("div");
    card.className = "video-card";
    card.innerHTML = `
      <img class="video-thumb" src="${video.thumbURL}" alt="${video.title}">
      <div class="video-info">
        <h4>${video.title}</h4>
        <p>${video.channel} • ${video.views || 0} views</p>
      </div>
    `;
    videoList.appendChild(card);
  });
}

// Call loadVideos on page load
loadVideos();

// Dark mode toggle
document.getElementById("darkToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// Upload form handler
document.getElementById("uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("videoTitle").value.trim();
  const videoFile = document.getElementById("videoFile").files[0];
  const thumbnailFile = document.getElementById("thumbnailFile").files[0];
  const channel = document.getElementById("videoChannel").value.trim();

  if (!title || !videoFile || !thumbnailFile || !channel) {
    alert("Please fill in all fields and select files.");
    return;
  }

  try {
    // Upload video
    const videoRef = ref(storage, `videos/${Date.now()}_${videoFile.name}`);
    await uploadBytes(videoRef, videoFile);
    const videoURL = await getDownloadURL(videoRef);

    // Upload thumbnail
    const thumbRef = ref(storage, `thumbnails/${Date.now()}_${thumbnailFile.name}`);
    await uploadBytes(thumbRef, thumbnailFile);
    const thumbURL = await getDownloadURL(thumbRef);

    // Save video metadata to Firestore
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

  } catch (error) {
    console.error("Upload failed:", error);
    alert("Upload failed: " + error.message);
  }
});

// Search filter
document.getElementById("searchBar").addEventListener("input", function () {
  const search = this.value.toLowerCase();
  const cards = document.querySelectorAll(".video-card");
  cards.forEach(card => {
    const title = card.querySelector("h4").textContent.toLowerCase();
    card.style.display = title.includes(search) ? "block" : "none";
  });
});
