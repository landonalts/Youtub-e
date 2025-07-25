import {
  storage,
  ref,
  uploadBytes,
  getDownloadURL,
  db,
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc
} from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
  const uploadForm = document.getElementById('uploadForm');
  const videoInput = document.getElementById('videoFile');
  const videoTitle = document.getElementById('videoTitle');
  const videoContainer = document.getElementById('videoContainer');
  const darkModeToggle = document.getElementById('darkModeToggle');
  const searchInput = document.getElementById('searchInput');
  const homeTab = document.getElementById('homeTab');
  const uploadTab = document.getElementById('uploadTab');
  const homeSection = document.getElementById('homeSection');
  const uploadSection = document.getElementById('uploadSection');

  // Toggle dark mode
  darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
  });

  // Tab switching
  homeTab.addEventListener('click', () => {
    homeSection.style.display = 'block';
    uploadSection.style.display = 'none';
  });

  uploadTab.addEventListener('click', () => {
    homeSection.style.display = 'none';
    uploadSection.style.display = 'block';
  });

  // Upload video
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = videoInput.files[0];
    const title = videoTitle.value.trim();
    if (!file || !title) return alert('Please add a title and select a file.');

    const fileRef = ref(storage, `videos/${file.name}`);
    try {
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);

      await addDoc(collection(db, 'videos'), {
        title,
        url: downloadURL,
        timestamp: Date.now(),
        likes: 0,
        comments: []
      });

      uploadForm.reset();
      loadVideos();
    } catch (err) {
      console.error(err);
      alert('Failed to upload video.');
    }
  });

  // Load videos
  async function loadVideos(searchTerm = '') {
    videoContainer.innerHTML = '';
    const querySnapshot = await getDocs(collection(db, 'videos'));
    let videos = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        videos.push({ id: docSnap.id, ...data });
      }
    });

    videos.sort((a, b) => b.timestamp - a.timestamp);

    videos.forEach((video) => {
      const videoEl = document.createElement('div');
      videoEl.className = 'video-item';
      videoEl.innerHTML = `
        <h3>${video.title}</h3>
        <video controls src="${video.url}" width="480"></video>
        <p>Likes: <span id="likes-${video.id}">${video.likes}</span></p>
        <button onclick="likeVideo('${video.id}')">👍 Like</button>
        <button onclick="deleteVideo('${video.id}')">🗑 Delete</button>
        <div class="comment-section">
          <input type="text" id="comment-${video.id}" placeholder="Add a comment...">
          <button onclick="addComment('${video.id}')">Post</button>
          <ul id="comment-list-${video.id}"></ul>
        </div>
      `;
      videoContainer.appendChild(videoEl);

      // Load existing comments
      const commentList = document.getElementById(`comment-list-${video.id}`);
      if (video.comments && video.comments.length) {
        video.comments.forEach(c => {
          const li = document.createElement('li');
          li.textContent = c;
          commentList.appendChild(li);
        });
      }
    });
  }

  // Search
  searchInput.addEventListener('input', (e) => {
    loadVideos(e.target.value);
  });

  // Load videos on start
  loadVideos();
});

// Global for buttons
window.likeVideo = async (id) => {
  const videosRef = collection(db, 'videos');
  const allDocs = await getDocs(videosRef);
  const docData = allDocs.docs.find((d) => d.id === id);

  if (docData) {
    const data = docData.data();
    await deleteDoc(doc(db, 'videos', id));
    await addDoc(collection(db, 'videos'), {
      ...data,
      likes: (data.likes || 0) + 1,
      timestamp: Date.now()
    });
    document.getElementById(`likes-${id}`).textContent = (data.likes || 0) + 1;
  }
};

window.deleteVideo = async (id) => {
  await deleteDoc(doc(db, 'videos', id));
  location.reload();
};

window.addComment = async (id) => {
  const input = document.getElementById(`comment-${id}`);
  const comment = input.value.trim();
  if (!comment) return;

  const videosRef = collection(db, 'videos');
  const allDocs = await getDocs(videosRef);
  const docData = allDocs.docs.find((d) => d.id === id);

  if (docData) {
    const data = docData.data();
    const updatedComments = [...(data.comments || []), comment];

    await deleteDoc(doc(db, 'videos', id));
    await addDoc(collection(db, 'videos'), {
      ...data,
      comments: updatedComments,
      timestamp: Date.now()
    });

    input.value = '';
    location.reload();
  }
};
