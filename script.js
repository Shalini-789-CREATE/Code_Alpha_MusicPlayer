// Sample playlist with categories
const playlist = [
    {
        title: "Sample Song 1",
        artist: "Artist 1",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        cover: "https://via.placeholder.com/300",
        category: "Pop"
    },
    {
        title: "Sample Song 2",
        artist: "Artist 2",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        cover: "https://via.placeholder.com/300",
        category: "Rock"
    },
    {
        title: "Sample Song 3",
        artist: "Artist 3",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        cover: "https://via.placeholder.com/300",
        category: "Jazz"
    }
];

// DOM Elements
const audio = new Audio();
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const shuffleBtn = document.getElementById('shuffle');
const repeatBtn = document.getElementById('repeat');
const title = document.getElementById('title');
const artist = document.getElementById('artist');
const cover = document.getElementById('cover');
const progress = document.querySelector('.progress');
const progressBar = document.querySelector('.progress-bar');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const volumeSlider = document.getElementById('volume');
const playlistContainer = document.getElementById('playlist-items');
const searchInput = document.querySelector('.search-box input');
const categoryItems = document.querySelectorAll('.categories li');

// Modal Elements
const addSongBtn = document.getElementById('add-song-btn');
const modal = document.getElementById('add-song-modal');
const closeBtn = document.querySelector('.close');
const addSongForm = document.getElementById('add-song-form');

// Player state
let currentSongIndex = 0;
let isShuffled = false;
let repeatMode = 'none'; // none, one, all
let filteredPlaylist = [...playlist];

// Modal Functions
function openModal() {
    modal.classList.add('show');
}

function closeModal() {
    modal.classList.remove('show');
    addSongForm.reset();
}

// Add new song
function addNewSong(e) {
    e.preventDefault();

    const songTitle = document.getElementById('song-title').value;
    const songArtist = document.getElementById('song-artist').value;
    const songCategory = document.getElementById('song-category').value;
    const songFile = document.getElementById('song-file').files[0];
    const coverFile = document.getElementById('cover-file').files[0];

    // Create object URLs for the files
    const songUrl = URL.createObjectURL(songFile);
    const coverUrl = URL.createObjectURL(coverFile);

    // Create new song object
    const newSong = {
        title: songTitle,
        artist: songArtist,
        src: songUrl,
        cover: coverUrl,
        category: songCategory
    };

    // Add to playlist
    playlist.push(newSong);
    filteredPlaylist = [...playlist];

    // Update display
    updatePlaylistDisplay(filteredPlaylist);

    // Reset form and close modal
    closeModal();

    // Show success message
    showNotification('Song added successfully!');
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize playlist display
function initializePlaylist() {
    updatePlaylistDisplay(playlist);
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            categoryItems.forEach(cat => cat.classList.remove('active'));
            item.classList.add('active');
            filterPlaylist(item.textContent);
        });
    });
}

// Update playlist display
function updatePlaylistDisplay(songs) {
    playlistContainer.innerHTML = songs.map((song, index) => `
        <li class="${index === currentSongIndex ? 'active' : ''}" data-index="${index}">
            ${song.title} - ${song.artist}
        </li>
    `).join('');

    // Add click events to playlist items
    playlistContainer.querySelectorAll('li').forEach(item => {
        item.addEventListener('click', () => {
            currentSongIndex = parseInt(item.dataset.index);
            loadSong(filteredPlaylist[currentSongIndex]);
            playSong();
        });
    });
}

// Filter playlist by category
function filterPlaylist(category) {
    if (category === 'All Songs') {
        filteredPlaylist = [...playlist];
    } else {
        filteredPlaylist = playlist.filter(song => song.category === category);
    }
    updatePlaylistDisplay(filteredPlaylist);
    if (filteredPlaylist.length > 0) {
        currentSongIndex = 0;
        loadSong(filteredPlaylist[0]);
    }
}

// Search functionality
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const searchResults = playlist.filter(song => 
        song.title.toLowerCase().includes(searchTerm) ||
        song.artist.toLowerCase().includes(searchTerm)
    );
    updatePlaylistDisplay(searchResults);
});

// Initialize
function loadSong(song) {
    title.textContent = song.title;
    artist.textContent = song.artist;
    cover.src = song.cover;
    audio.src = song.src;
}

function playSong() {
    audio.play();
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
}

function pauseSong() {
    audio.pause();
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
}

function prevSong() {
    if (isShuffled) {
        currentSongIndex = Math.floor(Math.random() * filteredPlaylist.length);
    } else {
        currentSongIndex--;
        if (currentSongIndex < 0) {
            currentSongIndex = filteredPlaylist.length - 1;
        }
    }
    loadSong(filteredPlaylist[currentSongIndex]);
    playSong();
    updatePlaylistDisplay(filteredPlaylist);
}

function nextSong() {
    if (isShuffled) {
        currentSongIndex = Math.floor(Math.random() * filteredPlaylist.length);
    } else {
        currentSongIndex++;
        if (currentSongIndex > filteredPlaylist.length - 1) {
            currentSongIndex = 0;
        }
    }
    loadSong(filteredPlaylist[currentSongIndex]);
    playSong();
    updatePlaylistDisplay(filteredPlaylist);
}

function updateProgress(e) {
    const { duration, currentTime } = e.srcElement;
    const progressPercent = (currentTime / duration) * 100;
    progress.style.width = `${progressPercent}%`;
    
    currentTimeEl.textContent = formatTime(currentTime);
    durationEl.textContent = formatTime(duration);
}

function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    audio.currentTime = (clickX / width) * duration;
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function setVolume() {
    audio.volume = volumeSlider.value / 100;
}

function toggleShuffle() {
    isShuffled = !isShuffled;
    shuffleBtn.style.color = isShuffled ? '#3498db' : '#7f8c8d';
}

function toggleRepeat() {
    switch(repeatMode) {
        case 'none':
            repeatMode = 'one';
            repeatBtn.style.color = '#3498db';
            break;
        case 'one':
            repeatMode = 'all';
            repeatBtn.innerHTML = '<i class="fas fa-redo"></i>';
            break;
        case 'all':
            repeatMode = 'none';
            repeatBtn.style.color = '#7f8c8d';
            break;
    }
}

// Event Listeners
playBtn.addEventListener('click', () => {
    if (audio.paused) {
        playSong();
    } else {
        pauseSong();
    }
});

prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);
shuffleBtn.addEventListener('click', toggleShuffle);
repeatBtn.addEventListener('click', toggleRepeat);

audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('ended', () => {
    switch(repeatMode) {
        case 'one':
            audio.currentTime = 0;
            playSong();
            break;
        case 'all':
            nextSong();
            break;
        default:
            if (currentSongIndex === filteredPlaylist.length - 1) {
                pauseSong();
                audio.currentTime = 0;
            } else {
                nextSong();
            }
    }
});

progressBar.addEventListener('click', setProgress);
volumeSlider.addEventListener('input', setVolume);

// Event Listeners for Modal
addSongBtn.addEventListener('click', openModal);
closeBtn.addEventListener('click', closeModal);
addSongForm.addEventListener('submit', addNewSong);

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Initialize the player
initializePlaylist();
loadSong(playlist[currentSongIndex]); 