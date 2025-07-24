const videos = [
  {
    title: "How to Code",
    channel: "CoderX",
    views: "1.2M views",
    thumb: "https://picsum.photos/300/200?random=1"
  },
  {
    title: "Learn HTML",
    channel: "WebDev 101",
    views: "500k views",
    thumb: "https://picsum.photos/300/200?random=2"
  },
  {
    title: "CSS Crash Course",
    channel: "DesignHub",
    views: "600k views",
    thumb: "https://picsum.photos/300/200?random=3"
  }
];

const videoList = document.getElementById("videoList");

function displayVideos() {
  videoList.innerHTML = "";
  videos.forEach(video => {
    const card = document.createElement("div");
    card.className = "video-card";
    card.innerHTML = `
      <img class="video-thumb" src="${video.thumb}" alt="${video.title}">
      <div class="video-info">
        <h4>${video.title}</h4>
        <p>${video.channel} • ${video.views}</p>
      </div>
    `;
    videoList.appendChild(card);
  });
}

displayVideos();

document.getElementById("searchBar").addEventListener("input", function () {
  const search = this.value.toLowerCase();
  const cards = document.querySelectorAll(".video-card");
  cards.forEach(card => {
    const title = card.querySelector("h4").textContent.toLowerCase();
    card.style.display = title.includes(search) ? "block" : "none";
  });
});

document.getElementById("darkToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

document.getElementById("uploadForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const title = document.getElementById("videoTitle").value;
  const thumb = document.getElementById("videoThumb").value;
  const channel = document.getElementById("videoChannel").value;

  videos.unshift({
    title: title,
    thumb: thumb,
    channel: channel,
    views: "Just now"
  });

  displayVideos();
  this.reset();
});
