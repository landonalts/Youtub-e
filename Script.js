// === script.js ===
import { storage, ref, uploadBytes, getDownloadURL, db, collection, addDoc, getDocs } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
  const uploadForm = document.getElementById('uploadForm');
  const videoInput = document.getElementById('videoFile');
  const videoTitle = document.getElementById('videoTitle');
  const videoContainer = document.getElementById('videoContainer');
  const darkModeToggle = document.getElementById('darkModeToggle');

  // Toggle dark mode
  darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
  });

  // Upload video
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = videoInput.files[0];
    const title = videoTitle.value;
    if (!file || !title) return alert('Provide both title and file');

    const fileRef = ref(storage, `videos/${file.name}`);
    await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(fileRef);

    await addDoc(collection(db, 'videos'), {
      title: title,
      url: downloadURL
    });

    uploadForm.reset();
    loadVideos();
  });

  // Load videos
  async function loadVideos() {
    videoContainer.innerHTML = '';
    const querySnapshot = await getDocs(collection(db, 'videos'));
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const videoEl = document.createElement('div');
      videoEl.className = 'video-item';
      videoEl.innerHTML = `
        <h3>${data.title}</h3>
        <video src="${data.url}" controls width="480"></video>
      `;
      videoContainer.appendChild(videoEl);
    });
  }

  // Initial load
  loadVideos();
});
