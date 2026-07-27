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
function checkGameStatus(guessedPlayer) {
  if (guessedPlayer.id === secretPlayer.id) {
    stopTimer();
    winnerDialog.textContent =
      "Felicidades! Adivinaste al jugador en " +
      currentSession.attempts +
      " intentos.";
    winnerDialog.showModal();
    searchInput.disabled = true;
    //Detener temporizador
    return;
  }

  if (currentSession.attempts >= 8) {
    stopTimer();
    loserDialog.textContent =
      "Perdiste. El jugador secreto era: " + secretPlayer.name;
    loserDialog.showModal();
    searchInput.disabled = true;
    //Detener tempo
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
      console.log("Jugador secreto obtenido con éxito: " + secretPlayer.name);
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
