"use strict";

//Global variables
var secretPlayer = null;
var searchTimeout = null;
var currentSession = {
  userName: "",
  difficulty: "",
  attempts: 0,
  attemptedIds: [],
};
var timerInterval = null;
var secondsElapsed = 0;

//DOM elements
{
  var startView = document.getElementById("startView");
  var gameView = document.getElementById("gameView");
  var winnerDialog = document.getElementById("winnerDialog");
  var loserDialog = document.getElementById("loserDialog");
  var startForm = document.getElementById("startForm");
  var btnStart = document.getElementById("startButton");
  var searchInput = document.getElementById("searchInput");
  var autocompleteList = document.getElementById("autocompleteList");
  var attemptsContainer = document.getElementById("attemptsContainer");
  var timerDisplay = document.getElementById("timerDisplay");
  var btnRestarWin = document.getElementById("btnRestartWin");
  var btnRestartLose = document.getElementById("btnRestartLose");
  var winnerMessage = document.getElementById("winnerMessage");
  var loserMessage = document.getElementById("loserMessage");
  var photoHintContainer = document.getElementById("photoHintContainer");
  var secretPlayerPhoto = document.getElementById("secretPlayerPhoto");
  var textHintContainer = document.getElementById("textHintContainer");
}

//Functions
function showGameView() {
  startView.classList.add("hidden");
  gameView.classList.remove("hidden");
}
function clearAutocompleteList() {
  while (autocompleteList.firstChild) {
    autocompleteList.removeChild(autocompleteList.firstChild);
  }
  autocompleteList.classList.add("hidden");
}
function compareString(guessText, secretText) {
  if (guessText.toLowerCase() === secretText.toLowerCase()) {
    return "match";
  }
  return "mismatch";
}
function compareNumber(guessNum, secretNum) {
  if (guessNum === secretNum) {
    return "match";
  } else if (secretNum > guessNum) {
    return "higher";
  } else {
    return "lower";
  }
}
function analyzeAttempt(guessedPlayer, secretPlayer) {
  return {
    playerInfo: guessedPlayer,
    results: {
      nationality: compareString(
        guessedPlayer.nationality,
        secretPlayer.nationality,
      ),
      club: compareString(guessedPlayer.club, secretPlayer.club),
      position: compareString(guessedPlayer.position, secretPlayer.position),
      age: compareNumber(guessedPlayer.age, secretPlayer.age),
      overall: compareNumber(guessedPlayer.overall, secretPlayer.overall),
      heightCm: compareNumber(guessedPlayer.heightCm, secretPlayer.heightCm),
    },
  };
}
function createStatElement(value, status) {
  var span = document.createElement("span");
  var text = value;

  if (status === "higher") {
    text += " ↑";
  } else if (status === "lower") {
    text += " ↓";
  }

  span.textContent = text;
  span.className = "colStat " + status;

  return span;
}
function renderAttemptCard(analysis) {
  var card;
  var nameDiv;
  var statsDiv;

  card = document.createElement("div");
  card.className = "attemptCard";

  nameDiv = document.createElement("div");
  nameDiv.className = "attemptName";
  nameDiv.textContent = analysis.playerInfo.name;

  statsDiv = document.createElement("div");
  statsDiv.className = "attemptStats";

  statsDiv.appendChild(
    createStatElement(
      analysis.playerInfo.nationality,
      analysis.results.nationality,
    ),
  );
  statsDiv.appendChild(
    createStatElement(analysis.playerInfo.club, analysis.results.club),
  );
  statsDiv.appendChild(
    createStatElement(analysis.playerInfo.position, analysis.results.position),
  );
  statsDiv.appendChild(
    createStatElement(analysis.playerInfo.age, analysis.results.age),
  );
  statsDiv.appendChild(
    createStatElement(analysis.playerInfo.overall, analysis.results.overall),
  );
  statsDiv.appendChild(
    createStatElement(analysis.playerInfo.heightCm, analysis.results.heightCm),
  );

  card.appendChild(nameDiv);
  card.appendChild(statsDiv);

  attemptsContainer.appendChild(card);
}
function formatTime(totalSeconds) {
  var minutes = Math.floor(totalSeconds / 60);
  var seconds = totalSeconds % 60;

  var minStr = minutes < 10 ? "0" + minutes : minutes;
  var secStr = seconds < 10 ? "0" + seconds : seconds;

  return minStr + ":" + secStr;
}
function startTimer() {
  if (timerInterval !== null) {
    return;
  }
  timerInterval = setInterval(function () {
    secondsElapsed++;
    timerDisplay.textContent = formatTime(secondsElapsed);
  }, 1000);
}
function stopTimer() {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}
function calculateScore() {
  var baseScore = 0;
  var attemptsPenalty = 0;
  var timeBonus = 0;
  var finalScore = 0;
  if (currentSession.difficulty === "easy") {
    baseScore = 60;
  } else if (currentSession.difficulty === "normal") {
    baseScore = 80;
  } else if (currentSession.difficulty === "hard") {
    baseScore = 100;
  }
  attemptsPenalty = (currentSession.attempts - 1) * 10;
  if (secondsElapsed < 60) {
    timeBonus = 20;
  } else if (secondsElapsed < 120) {
    timeBonus = 10;
  }
  finalScore = baseScore - attemptsPenalty + timeBonus;
  if (finalScore < 10) {
    return 10;
  }
  return finalScore;
}
function checkGameStatus(guessedPlayer) {
  var score = 0;

  if (guessedPlayer.id === secretPlayer.id) {
    stopTimer();
    score = calculateScore();
    winnerMessage.textContent =
      "¡Felicidades " +
      currentSession.userName +
      "! Adivinaste en " +
      currentSession.attempts +
      " intento(s).\n" +
      "Tiempo: " +
      formatTime(secondsElapsed) +
      "\n" +
      "Puntaje Final: " +
      score +
      " pts.";
    winnerDialog.showModal();
    searchInput.disabled = true;
    return;
  }

  if (currentSession.attempts >= 8) {
    stopTimer();
    loserMessage.textContent =
      "Perdiste. El jugador secreto era: " + secretPlayer.name;
    loserDialog.showModal();
    searchInput.disabled = true;
  }
}
function playerSelectHandler(selectedPlayer) {
  return function () {
    var attemptAnalysis;

    if (currentSession.attemptedIds.indexOf(selectedPlayer.id) !== -1) {
      console.warn(
        "Intento bloqueado: El jugador " +
          selectedPlayer.name +
          " ya fue ingresado.",
      );
      searchInput.value = "";
      clearAutocompleteList();
      return;
    }
    currentSession.attemptedIds.push(selectedPlayer.id);
    currentSession.attempts++;
    if (currentSession.attempts === 1) {
      startTimer();
    }
    searchInput.value = "";
    clearAutocompleteList();
    attemptAnalysis = analyzeAttempt(selectedPlayer, secretPlayer);
    renderAttemptCard(attemptAnalysis);
    updateHints();
    checkGameStatus(selectedPlayer);
  };
}
function renderAutocompleteResults(playersData) {
  var i;
  var li;
  var cleanName;
  var modifiedPlayer;

  clearAutocompleteList();

  if (playersData.length === 0) {
    return;
  }

  for (i = 0; i < playersData.length; i++) {
    li = document.createElement("li");
    cleanName = playersData[i].name.replace(/^\d+\s*/, "");
    li.textContent = cleanName;
    li.className = "autocompleteItem";
    modifiedPlayer = playersData[i];
    modifiedPlayer.name = cleanName;
    li.addEventListener("click", playerSelectHandler(modifiedPlayer));
    autocompleteList.appendChild(li);
  }
  autocompleteList.classList.remove("hidden");
}
function resetGame() {
  currentSession.attempts = 0;
  currentSession.attemptedIds = [];
  stopTimer();
  secondsElapsed = 0;
  timerDisplay.textContent = "00:00";
  while (attemptsContainer.firstChild) {
    attemptsContainer.removeChild(attemptsContainer.firstChild);
  }
  searchInput.value = "";
  searchInput.disabled = false;
  winnerDialog.close();
  loserDialog.close();
  fetchSecretPlayer();
}
function initializeHints() {
  if (currentSession.difficulty === "easy") {
    secretPlayerPhoto.src = secretPlayer.photo;
    secretPlayerPhoto.className = "blurLevel8";
    photoHintContainer.classList.remove("hidden");
    textHintContainer.classList.add("hidden");
  } else if (currentSession.difficulty === "normal") {
    photoHintContainer.classList.add("hidden");
    textHintContainer.textContent =
      "Pistas adicionales aparecerán si te equivocas...";
    textHintContainer.classList.remove("hidden");
  } else {
    photoHintContainer.classList.add("hidden");
    textHintContainer.classList.add("hidden");
  }
}
function updateHints() {
  var blurValue;
  if (currentSession.difficulty === "easy") {
    blurValue = 8 - currentSession.attempts;
    if (blurValue < 0) {
      blurValue = 0;
    }
    secretPlayerPhoto.className = "blurLevel" + blurValue;
  } else if (currentSession.difficulty === "normal") {
    if (currentSession.attempts === 3) {
      textHintContainer.textContent =
        "Pista 1: Su altura es " + secretPlayer.heightCm + " cm.";
    } else if (currentSession.attempts === 5) {
      textHintContainer.textContent =
        "Pista 1: Altura " +
        secretPlayer.heightCm +
        " cm | Pista 2: Edad " +
        secretPlayer.age +
        " años.";
    } else if (currentSession.attempts === 7) {
      textHintContainer.textContent =
        "Altura: " +
        secretPlayer.heightCm +
        " cm | Edad: " +
        secretPlayer.age +
        " | Overall: " +
        secretPlayer.overall;
    }
  }
}

//Api call
function fetchSecretPlayer() {
  var url = "https://futbolle-daw-uai-2026.onrender.com/api/players/random";

  fetch(url)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Fallo en la respuesta del servidor");
      }
      return response.json();
    })
    .then(function (data) {
      secretPlayer = data;
      initializeHints();
      console.log("Objeto completo del jugador:", secretPlayer);
      showGameView();
    })
    .catch(function (error) {
      console.error("Error al obtener el jugador secreto: ", error);
      console.log("Mostrar con dialog luego.");
      btnStart.disabled = false;
      btnStart.textContent = "Iniciar Juego";
    });
}
function fetchAutocompletePlayers(query) {
  var url =
    "https://futbolle-daw-uai-2026.onrender.com/api/players/search?q=" +
    encodeURIComponent(query);

  fetch(url)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Error al buscar jugadores");
      }
      return response.json();
    })
    .then(function (playersData) {
      renderAutocompleteResults(playersData);
    })
    .catch(function (error) {
      console.error("Fallo en el autocompletado:", error);
    });
}

//Event listeners
function handleStartSubmit(event) {
  var inputName;
  var inputDifficulty;

  event.preventDefault();

  btnStart.disabled = true;
  btnStart.textContent = "Cargando...";

  inputName = startForm.elements["userName"].value;
  inputDifficulty = startForm.elements["level"].value;

  currentSession.userName = inputName;
  currentSession.difficulty = inputDifficulty;

  console.log("Nombre del jugador: " + currentSession.userName);
  console.log("Nivel de dificultad: " + currentSession.difficulty);
  fetchSecretPlayer();
}
function handleSearchInput(event) {
  var query = event.target.value.trim();
  if (searchTimeout !== null) {
    clearTimeout(searchTimeout);
  }
  if (query.length < 2) {
    clearAutocompleteList();
    return;
  }
  //Se aplica metodo Debounce
  searchTimeout = setTimeout(function () {
    fetchAutocompletePlayers(query);
  }, 300);
}

startForm.addEventListener("submit", handleStartSubmit);
searchInput.addEventListener("input", handleSearchInput);
btnRestartWin.addEventListener("click", resetGame);
btnRestartLose.addEventListener("click", resetGame);
