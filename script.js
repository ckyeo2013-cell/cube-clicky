function toggleMenu() {
  let menu = document.getElementById("menu");
  if (!menu) return;
  menu.classList.toggle("hidden");
}

async function createAccount(username) {
  let res = await fetch("http://localhost:5000/create", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ username })
  });

  return await res.json();
}

document.addEventListener("DOMContentLoaded", function () {

  // ---------------- GAME STATE ----------------
  let score = 0;
  let high_score = 0;
  let timeLeft = 30;
  let countdown;

  let forceMode = "none";
  let boxType = "normal";

  let debugPassword = "DaxtonLikes5Ants";
  let debugUsedThisRun = false;
  let debugEnabled = false;

  let newRecordTriggered = false;

  // ---------------- ELEMENTS ----------------
  let timerElement = document.getElementById("timer");
  let box = document.getElementById("box");
  let scoreDisplay = document.getElementById("score");
  let highScoreDisplay = document.getElementById("high_score");
  let resetbutton = document.getElementById("resetbuttom");
  let gameArea = document.getElementById("gameArea");
  let debugPanel = document.getElementById("debugPanel");

  // ---------------- SOUNDS ----------------
  let clapSound = new Audio("assets/sounds/clap.m4a");
  let sadTrumpet = new Audio("assets/sounds/sadtrumpet.mp3");

  // ---------------- HIGH SCORE LOAD ----------------
  let savedHigh = localStorage.getItem("highScore");
  if (savedHigh !== null) {
    high_score = Number(savedHigh);
  }
  if (highScoreDisplay) {
    highScoreDisplay.innerText = high_score;
  }

  // ---------------- DARK MODE ----------------
  let darkMode = localStorage.getItem("darkMode") === "true";

  function applyTheme() {
    document.body.classList.toggle("dark", darkMode);
  }

  window.toggleDarkMode = function () {
    darkMode = !darkMode;
    localStorage.setItem("darkMode", darkMode);
    applyTheme();
  };

  applyTheme();

  // ---------------- DEBUG ----------------
  window.enterDebug = function () {
    let input = document.getElementById("debugInput");
    if (!input) return;

    let value = input.value.trim();

    if (value === debugPassword) {
      debugUsedThisRun = true;
      debugPanel.style.display = "block";
      alert("Debug unlocked, have fun :)");
    } else {
      alert("Wrong password HAHAHHAHA");
    }

    input.value = "";
  };

  window.toggleDebug = function () {
    debugEnabled = !debugEnabled;
    if (debugEnabled) debugUsedThisRun = true;

    let btn = document.querySelector("#debugPanel button");
    if (btn) {
      btn.innerText = debugEnabled ? "Debug: ON" : "Debug: OFF";
    }
  };

  window.setMode = function (mode) {
    if (!debugEnabled) return;
    forceMode = mode;
  };

  // ---------------- RESET HIGH SCORE ----------------
  window.resetHighScore = function () {
    high_score = 0;
    localStorage.setItem("highScore", "0");

    if (highScoreDisplay) {
      highScoreDisplay.innerText = "0";
    }

    alert("high score reset lol");
  };

  // ---------------- SET HIGH SCORE ----------------
  window.setHighScore = function (value) {
    if (!debugEnabled) return;

    let num = Number(value);

    if (isNaN(num)) {
      alert("not a number bro HAHHAHA");
      return;
    }

    high_score = num;
    localStorage.setItem("highScore", String(num));

    if (highScoreDisplay) {
      highScoreDisplay.innerText = num;
    }

    alert("set high score to " + num);
  };

  // ---------------- CONFETTI ----------------
  function spawnConfetti() {
    const emojis = ["😀", "😎", "🔥", "✨", "🎉", ":)", ":D", ":O"];
    let pieces = [];

    for (let i = 0; i < 80; i++) {
      let confetti = document.createElement("div");

      confetti.innerText =
        emojis[Math.floor(Math.random() * emojis.length)];

      confetti.style.position = "fixed";
      confetti.style.left = Math.random() * window.innerWidth + "px";
      confetti.style.top = "-20px";
      confetti.style.fontSize = (10 + Math.random() * 20) + "px";
      confetti.style.pointerEvents = "none";
      confetti.style.zIndex = "9999";

      document.body.appendChild(confetti);

      pieces.push({
        el: confetti,
        y: -20,
        speed: 2 + Math.random() * 5,
        rot: Math.random() * 360
      });
    }

    function animate() {
      for (let i = pieces.length - 1; i >= 0; i--) {
        let p = pieces[i];

        p.y += p.speed;
        p.rot += 2;

        p.el.style.top = p.y + "px";
        p.el.style.transform = `rotate(${p.rot}deg)`;

        if (p.y > window.innerHeight) {
          p.el.remove();
          pieces.splice(i, 1);
        }
      }

      if (pieces.length > 0) {
        requestAnimationFrame(animate);
      }
    }

    animate();
  }

  // ---------------- NEW RECORD EFFECTS ----------------
  function triggerNewRecordEffects() {
    document.body.classList.add("shake");

    setTimeout(() => {
      document.body.classList.remove("shake");
    }, 300);

    let text = document.getElementById("newRecordText");

    if (text) {
      text.style.display = "block";
      text.classList.remove("hidden");

      setTimeout(() => {
        text.classList.add("hidden");
        text.style.display = "none";
      }, 1200);
    }
  }

  // ---------------- HIGH SCORE LOGIC ----------------
  function updateHighScore() {
    if (debugUsedThisRun) return;

    if (score > high_score) {
      high_score = score;
      localStorage.setItem("highScore", String(high_score));

      if (highScoreDisplay) {
        highScoreDisplay.innerText = high_score;
      }

      if (!newRecordTriggered) {
        spawnConfetti();
        triggerNewRecordEffects();
        newRecordTriggered = true;
      }
    }
  }

  // ---------------- SPAWN BOX ----------------
  function spawnCube() {
    let randomChance = Math.random();

    if (forceMode === "green") randomChance = 0;
    else if (forceMode === "gold") randomChance = 0.02;

    if (!box) return;

    if (randomChance < 0.01) {
      boxType = "green";
      box.style.backgroundColor = "lime";
      box.style.boxShadow = "0 0 20px green";
      box.textContent = ":O";

    } else if (randomChance < 0.04) {
      boxType = "gold";
      box.style.backgroundColor = "gold";
      box.style.boxShadow = "0 0 20px gold";
      box.textContent = ":O";

    } else {
      boxType = "normal";
      box.style.backgroundColor = "blue";
      box.style.boxShadow = "0 0 15px rgba(0,100,255,0.5)";
      box.textContent = ":)";
    }
  }

  // ---------------- TIMER ----------------
  function startTimer() {
    clearInterval(countdown);

    countdown = setInterval(function () {
      timeLeft--;
      if (timerElement) timerElement.innerText = timeLeft;

      if (timeLeft <= 0) {
        clearInterval(countdown);

        if (box) box.style.display = "none";
        if (resetbutton) resetbutton.style.display = "block";

        alert("Time's up! Score: " + score);
      }
    }, 1000);
  }

  // ---------------- RESET ----------------
  function reset() {
    clearInterval(countdown);

    score = 0;
    timeLeft = 30;

    newRecordTriggered = false;

    if (scoreDisplay) scoreDisplay.innerText = score;
    if (timerElement) timerElement.innerText = timeLeft;

    if (box) box.style.display = "flex";
    if (resetbutton) resetbutton.style.display = "none";

    if (box) {
      box.style.left = "0px";
      box.style.top = "0px";
    }

    startTimer();
    spawnCube();
  }

  window.reset = reset;

  // ---------------- CLICK SYSTEM ----------------
  if (gameArea && box) {
    gameArea.addEventListener("click", function (event) {
      if (event.target !== box) {

        box.style.backgroundColor = "red";
        box.style.boxShadow = "0 0 20px red";
        box.textContent = ">:(";

        setTimeout(spawnCube, 1200);

        timeLeft--;
        if (timerElement) timerElement.innerText = timeLeft;

        sadTrumpet.currentTime = 0;
        sadTrumpet.volume = 0.6;
        sadTrumpet.play();
      }
    });

    box.addEventListener("click", function () {

      score++;

      clapSound.currentTime = 0;
      clapSound.play();

      if (boxType === "gold") score += 9;
      if (boxType === "green") {
        score += 19;
        timeLeft += 10;
      }

      if (scoreDisplay) scoreDisplay.innerText = score;
      if (timerElement) timerElement.innerText = timeLeft;

      box.style.left = Math.floor(Math.random() * 350) + "px";
      box.style.top = Math.floor(Math.random() * 350) + "px";

      updateHighScore();
      spawnCube();
    });
  }

  // ---------------- START ----------------
  startTimer();
  spawnCube();
});