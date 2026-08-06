"use strict";
//Variables
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
//Functions
var tickTimer = function () {
  secondsElapsed++;
  updateTimerUI(formatTime(secondsElapsed));
};
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
  timerInterval = setInterval(tickTimer, 1000);
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
function checkGameStatus(guessedPlayer) {
  var score = 0;
  var winMessage = "";
  var loseMessage = "";
  if (guessedPlayer.id === secretPlayer.id) {
    stopTimer();
    score = calculateScore();
    saveMatchResult(score);
    winMessage =
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
    showWinnerUI(winMessage);
    disableSearchInput(true);
    return;
  }
  if (currentSession.attempts >= 8) {
    stopTimer();
    saveMatchResult(0);
    loseMessage = "El jugador secreto era: " + secretPlayer.name;
    showLoserUI(loseMessage);
    disableSearchInput(true);
  }
}
function processPlayerSelection(selectedPlayer) {
  var attemptAnalysis;
  var intentosRestantes;
  if (currentSession.attemptedIds.indexOf(selectedPlayer.id) !== -1) {
    searchInput.value = "";
    clearAutocompleteList();
    return;
  }
  currentSession.attemptedIds.push(selectedPlayer.id);
  currentSession.attempts++;
  intentosRestantes = 8 - currentSession.attempts;
  updateAttemptsUI(intentosRestantes);
  if (currentSession.attempts === 1) {
    startTimer();
  }
  searchInput.value = "";
  clearAutocompleteList();
  attemptAnalysis = analyzeAttempt(selectedPlayer, secretPlayer);
  renderAttemptCard(attemptAnalysis);
  updateHints(
    currentSession.difficulty,
    currentSession.attempts,
    secretPlayer.heightCm,
    secretPlayer.age,
    secretPlayer.overall,
  );
  checkGameStatus(selectedPlayer);
}
function getSortedStats(sortValue) {
  var stats = JSON.parse(localStorage.getItem("futbolle_stats")) || [];
  var sortFunction = function (a, b) {
    if (sortValue === "dateDesc") return b.time - a.time;
    if (sortValue === "dateAsc") return a.time - b.time;
    if (sortValue === "attemptsAsc") return a.attempts - b.attempts;
    if (sortValue === "attemptsDesc") return b.attempts - a.attempts;
    if (sortValue === "scoreDesc") return b.score - a.score;
    return 0;
  };
  stats.sort(sortFunction);
  return stats;
}
