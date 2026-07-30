"use strict";

//Global variables
{
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
}

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
  var btnRestartGame = document.getElementById("btnRestartGame");
  var winnerMessage = document.getElementById("winnerMessage");
  var loserMessage = document.getElementById("loserMessage");
  var photoHintContainer = document.getElementById("photoHintContainer");
  var secretPlayerPhoto = document.getElementById("secretPlayerPhoto");
  var textHintContainer = document.getElementById("textHintContainer");
  var statsDialog = document.getElementById("statsDialog");
  var btnOpenStats = document.getElementById("btnOpenStats");
  var btnCloseStats = document.getElementById("btnCloseStats");
  var statsBody = document.getElementById("statsBody");
  var sortStatsInput = document.getElementById("sortStatsInput");
  var errorDialog = document.getElementById("errorDialog");
  var errorMessage = document.getElementById("errorMessage");
  var btnCloseError = document.getElementById("btnCloseError");
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
    saveMatchResult(score);
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
    saveMatchResult(0);
    loserMessage.textContent = "El jugador secreto era: " + secretPlayer.name;
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
function saveMatchResult(finalScore) {
  var stats = JSON.parse(localStorage.getItem("futbolle_stats")) || [];
  var now = new Date();
  var matchData = {
    name: currentSession.userName,
    result: finalScore > 0 ? "Ganó" : "Perdió",
    attempts: currentSession.attempts,
    duration: formatTime(secondsElapsed),
    dateString: now.toLocaleDateString() + " " + now.toLocaleTimeString(),
    time: now.getTime(),
    score: finalScore,
  };
  stats.push(matchData);
  localStorage.setItem("futbolle_stats", JSON.stringify(stats));
}
function createTableCell(text) {
  var td = document.createElement("td");
  td.textContent = text;
  td.className = "tdStats";
  return td;
}
function renderStats() {
  var stats = JSON.parse(localStorage.getItem("futbolle_stats")) || [];
  var sortValue = sortStatsInput.value;
  var i, tr;

  stats.sort(function (a, b) {
    if (sortValue === "dateDesc") return b.time - a.time;
    if (sortValue === "dateAsc") return a.time - b.time;
    if (sortValue === "attemptsAsc") return a.attempts - b.attempts;
    if (sortValue === "attemptsDesc") return b.attempts - a.attempts;
    if (sortValue === "scoreDesc") return b.score - a.score;
    return 0;
  });

  while (statsBody.firstChild) {
    statsBody.removeChild(statsBody.firstChild);
  }

  for (i = 0; i < stats.length; i++) {
    tr = document.createElement("tr");

    tr.appendChild(createTableCell(stats[i].name));
    tr.appendChild(createTableCell(stats[i].result));
    tr.appendChild(createTableCell(stats[i].attempts));
    tr.appendChild(createTableCell(stats[i].duration));
    tr.appendChild(createTableCell(stats[i].dateString));
    tr.appendChild(createTableCell(stats[i].score));

    statsBody.appendChild(tr);
  }
}
function openStatsModal() {
  renderStats();
  statsDialog.showModal();
}
function closeStatsModal() {
  statsDialog.close();
}
function closeOnBackdropClick(event) {
  var dialog = event.currentTarget;
  var rect = dialog.getBoundingClientRect();
  var isInDialog =
    rect.top <= event.clientY &&
    event.clientY <= rect.top + rect.height &&
    rect.left <= event.clientX &&
    event.clientX <= rect.left + rect.width;
  if (!isInDialog) {
    dialog.close();
  }
}
function showErrorModal(message) {
  errorMessage.textContent = message;
  errorDialog.showModal();
}
function closeErrorModal() {
  errorDialog.close();
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
      showErrorModal(
        "No se pudo conectar con el servidor para iniciar la partida. Verifica tu conexión o intenta nuevamente más tarde.",
      );
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
      showErrorModal("Error de red al buscar jugadores. Intenta de nuevo.");
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

{
  startForm.addEventListener("submit", handleStartSubmit);
  searchInput.addEventListener("input", handleSearchInput);
  btnRestartWin.addEventListener("click", resetGame);
  btnRestartLose.addEventListener("click", resetGame);
  btnRestartGame.addEventListener("click", resetGame);
  btnOpenStats.addEventListener("click", openStatsModal);
  btnCloseStats.addEventListener("click", closeStatsModal);
  sortStatsInput.addEventListener("change", renderStats);
  statsDialog.addEventListener("click", closeOnBackdropClick);
  winnerDialog.addEventListener("click", closeOnBackdropClick);
  loserDialog.addEventListener("click", closeOnBackdropClick);
  errorDialog.addEventListener("click", closeOnBackdropClick);
  btnCloseError.addEventListener("click", closeErrorModal);
}
