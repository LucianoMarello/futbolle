"use strict";
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
  var attemptsDisplay = document.getElementById("attemptsDisplay");
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
function updateHints(difficulty, attempts, heightCm, age, overall) {
  var blurValue;
  if (difficulty === "easy") {
    blurValue = 8 - attempts;
    if (blurValue < 0) {
      blurValue = 0;
    }
    secretPlayerPhoto.className = "blurLevel" + blurValue;
  } else if (difficulty === "normal") {
    if (attempts === 3) {
      textHintContainer.textContent =
        "Pista 1: Su altura es " + heightCm + " cm.";
    } else if (attempts === 5) {
      textHintContainer.textContent =
        "Pista 1: Altura " + heightCm + " cm | Pista 2: Edad " + age + " años.";
    } else if (attempts === 7) {
      textHintContainer.textContent =
        "Altura: " + heightCm + " cm | Edad: " + age + " | Overall: " + overall;
    }
  }
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
    li.addEventListener(
      "click",
      processPlayerSelection.bind(null, modifiedPlayer),
    );
    autocompleteList.appendChild(li);
  }
  autocompleteList.classList.remove("hidden");
}
function initializeHints(difficulty, photoUrl) {
  if (difficulty === "easy") {
    secretPlayerPhoto.src = photoUrl;
    secretPlayerPhoto.className = "blurLevel8";
    photoHintContainer.classList.remove("hidden");
    textHintContainer.classList.add("hidden");
  } else if (difficulty === "normal") {
    photoHintContainer.classList.add("hidden");
    textHintContainer.textContent =
      "Pistas adicionales aparecerán si te equivocas...";
    textHintContainer.classList.remove("hidden");
  } else {
    photoHintContainer.classList.add("hidden");
    textHintContainer.classList.add("hidden");
  }
}
function createTableCell(text) {
  var td = document.createElement("td");
  td.textContent = text;
  td.className = "tdStats";
  return td;
}
function renderStats(statsArray) {
  var i, tr;
  while (statsBody.firstChild) {
    statsBody.removeChild(statsBody.firstChild);
  }
  for (i = 0; i < statsArray.length; i++) {
    tr = document.createElement("tr");
    tr.appendChild(createTableCell(statsArray[i].name));
    tr.appendChild(createTableCell(statsArray[i].result));
    tr.appendChild(createTableCell(statsArray[i].attempts));
    tr.appendChild(createTableCell(statsArray[i].duration));
    tr.appendChild(createTableCell(statsArray[i].dateString));
    tr.appendChild(createTableCell(statsArray[i].score));
    statsBody.appendChild(tr);
  }
}
function openStatsModal() {
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
function updateTimerUI(timeString) {
  timerDisplay.textContent = timeString;
}
function updateAttemptsUI(intentosRestantes) {
  attemptsDisplay.textContent = "Intentos: " + intentosRestantes;
}
function toggleStartButton(isDisabled, text) {
  btnStart.disabled = isDisabled;
  btnStart.textContent = text;
}
function disableSearchInput(isDisabled) {
  searchInput.disabled = isDisabled;
}
function showWinnerUI(message) {
  winnerMessage.textContent = message;
  winnerDialog.showModal();
}
function showLoserUI(message) {
  loserMessage.textContent = message;
  loserDialog.showModal();
}
function resetGameUI() {
  attemptsDisplay.textContent = "Intentos: 8";
  timerDisplay.textContent = "00:00";
  searchInput.value = "";
  searchInput.disabled = false;
  while (attemptsContainer.firstChild) {
    attemptsContainer.removeChild(attemptsContainer.firstChild);
  }
  winnerDialog.close();
  loserDialog.close();
}
