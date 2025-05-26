// Variables
let startTime = 0;
let elapsedTime = 0;
let timerInterval = null;
let running = false;
let laps = [];
let showMillis = false;
let countdownMode = false;
let countdownDuration = 0; // in milliseconds
let countdownEndTime = 0;

const display = document.getElementById('display');
const startBtn = document.getElementById('startBtn');
const lapBtn = document.getElementById('lapBtn');
const resetBtn = document.getElementById('resetBtn');
const exportBtn = document.getElementById('exportBtn');
const copyBtn = document.getElementById('copyBtn');
const showMillisCheckbox = document.getElementById('showMillis');
const themeToggle = document.getElementById('themeToggle');
const modeToggle = document.getElementById('modeToggle');
const countdownInputContainer = document.getElementById('countdownInputContainer');
const countdownMinutesInput = document.getElementById('countdownMinutes');
const countdownSecondsInput = document.getElementById('countdownSeconds');
const setCountdownBtn = document.getElementById('setCountdownBtn');
const lapSound = document.getElementById('lapSound');

function formatTime(ms) {
  let milliseconds = ms % 1000;
  let totalSeconds = Math.floor(ms / 1000);
  let hours = Math.floor(totalSeconds / 3600);
  let minutes = Math.floor((totalSeconds - hours * 3600) / 60);
  let seconds = totalSeconds % 60;

  let hStr = hours.toString().padStart(2, '0');
  let mStr = minutes.toString().padStart(2, '0');
  let sStr = seconds.toString().padStart(2, '0');
  let msStr = milliseconds.toString().padStart(3, '0');

  if (showMillis) {
    return `${hStr}:${mStr}:${sStr}.${msStr}`;
  } else {
    return `${hStr}:${mStr}:${sStr}`;
  }
}

function updateDisplay() {
  let timeToShow;

  if (countdownMode) {
    const now = performance.now();
    let diff = countdownEndTime - now;
    if (diff < 0) diff = 0;
    timeToShow = diff;
    if (diff === 0) {
      stopTimer();
      alert("Countdown finished!");
    }
  } else {
    timeToShow = elapsedTime;
  }

  display.innerText = formatTime(timeToShow);
  display.classList.add('active');
  setTimeout(() => display.classList.remove('active'), 150);
}

function startTimer() {
  if (running) return;
  running = true;
  startTime = performance.now() - elapsedTime;

  if (countdownMode && countdownEndTime === 0) {
    // if countdown is active but no countdown time set, prevent start
    alert('Please set countdown time first!');
    running = false;
    return;
  }

  if (countdownMode) {
    countdownEndTime = performance.now() + countdownDuration - elapsedTime;
  }

  timerInterval = setInterval(() => {
    if (countdownMode) {
      const now = performance.now();
      elapsedTime = countdownDuration - (countdownEndTime - now);
      if (elapsedTime > countdownDuration) elapsedTime = countdownDuration;
      if (now >= countdownEndTime) {
        elapsedTime = countdownDuration;
        stopTimer();
        alert('Countdown finished!');
      }
    } else {
      elapsedTime = performance.now() - startTime;
    }
    updateDisplay();
  }, showMillis ? 50 : 250);

  startBtn.innerText = 'Pause';
  startBtn.style.backgroundColor = '#dc3545';
  lapBtn.disabled = false;
  resetBtn.disabled = false;
  exportBtn.disabled = laps.length === 0;
  copyBtn.disabled = laps.length === 0;
}

function stopTimer() {
  if (!running) return;
  running = false;
  clearInterval(timerInterval);
  startBtn.innerText = 'Start';
  startBtn.style.backgroundColor = '#007bff';
  lapBtn.disabled = true;
}

function toggleStart() {
  if (running) {
    stopTimer();
  } else {
    startTimer();
  }
}

function resetTimer() {
  stopTimer();
  elapsedTime = 0;
  countdownEndTime = 0;
  laps = [];
  updateDisplay();
  lapBtn.disabled = true;
  exportBtn.disabled = true;
  copyBtn.disabled = true;
  document.getElementById('laps').innerHTML = '';
}

function recordLap() {
  if (!running) return;
  const lapTime = formatTime(elapsedTime);
  laps.push(lapTime);
  const lapList = document.getElementById('laps');
  const li = document.createElement('li');
  li.innerText = `Lap ${laps.length}: ${lapTime}`;
  lapList.appendChild(li);
  exportBtn.disabled = false;
  copyBtn.disabled = false;
  lapSound.play();
}

function exportLaps() {
  if (laps.length === 0) return;
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Lap Number,Lap Time\n";
  laps.forEach((lap, i) => {
    csvContent += `${i + 1},${lap}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'lap_times.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function copyLaps() {
  if (laps.length === 0) return;
  let text = laps.map((lap, i) => `Lap ${i + 1}: ${lap}`).join('\n');
  navigator.clipboard.writeText(text).then(() => {
    alert("Lap times copied to clipboard!");
  });
}

function toggleShowMillis() {
  showMillis = showMillisCheckbox.checked;
  updateDisplay();
  if (running) {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (countdownMode) {
        const now = performance.now();
        let diff = countdownEndTime - now;
        if (diff < 0) diff = 0;
        elapsedTime = countdownDuration - diff;
        if (elapsedTime > countdownDuration) elapsedTime = countdownDuration;
        if (now >= countdownEndTime) {
          stopTimer();
          alert('Countdown finished!');
        }
      } else {
        elapsedTime = performance.now() - startTime;
      }
      updateDisplay();
    }, showMillis ? 50 : 250);
  }
}

function toggleTheme() {
  if (themeToggle.checked) {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
}

function toggleMode() {
  countdownMode = modeToggle.checked;
  resetTimer();
  if (countdownMode) {
    countdownInputContainer.style.display = 'block';
  } else {
    countdownInputContainer.style.display = 'none';
  }
}

// Set countdown time
function setCountdown() {
  let mins = parseInt(countdownMinutesInput.value) || 0;
  let secs = parseInt(countdownSecondsInput.value) || 0;
  if (mins < 0 || secs < 0 || secs > 59) {
    alert("Please enter valid time values.");
    return;
  }
  countdownDuration = (mins * 60 + secs) * 1000;
  elapsedTime = 0;
  countdownEndTime = 0;
  updateDisplay();
}

// Keyboard shortcuts: Space - start/pause, L - lap, R - reset
window.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') return; // Ignore typing in inputs
  if (e.code === 'Space') {
    e.preventDefault();
    toggleStart();
  } else if (e.key.toLowerCase() === 'l') {
    e.preventDefault();
    recordLap();
  } else if (e.key.toLowerCase() === 'r') {
    e.preventDefault();
    resetTimer();
  }
});

// Event listeners
startBtn.addEventListener('click', toggleStart);
lapBtn.addEventListener('click', recordLap);
resetBtn.addEventListener('click', resetTimer);
exportBtn.addEventListener('click', exportLaps);
copyBtn.addEventListener('click', copyLaps);
showMillisCheckbox.addEventListener('change', toggleShowMillis);
themeToggle.addEventListener('change', toggleTheme);
modeToggle.addEventListener('change', toggleMode);
setCountdownBtn.addEventListener('click', setCountdown);

// Initial display update
updateDisplay();
function formatTime(timeInMilliseconds) {
    const date = new Date(timeInMilliseconds);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds();
    const milliseconds = date.getUTCMilliseconds();
  
    // For 3 digits milliseconds (e.g., 123)
    // return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${padMillis(milliseconds)}`;
  
    // For 2 digits milliseconds (e.g., 12)
    const shortMillis = Math.floor(milliseconds / 10); // Dividing by 10 and flooring gives 2-digit ms
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${padTwoDigits(shortMillis)}`;
  }
  
  function pad(num) {
    return num.toString().padStart(2, "0");
  }
  
  function padTwoDigits(num) {
    return num.toString().padStart(2, "0");
  }
  let shortMs = Math.floor(milliseconds / 10);
  shortMs = shortMs < 10 ? "0" + shortMs : shortMs;
  display.innerText = `${h}:${m}:${s}.${shortMs}`;
    