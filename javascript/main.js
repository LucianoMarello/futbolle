"use strict";
//Event listeners
function handleStartSubmit(event) {
  var inputName;
  var inputDifficulty;
  event.preventDefault();
  toggleStartButton(true, "Cargando...");
  inputName = startForm.elements["userName"].value;
  inputDifficulty = startForm.elements["level"].value;
  currentSession.userName = inputName;
  currentSession.difficulty = inputDifficulty;
  fetchSecretPlayer();
}
function handleSearchInput(event) {
  var query = event.target.value.trim();
  var searchFunction = function () {
    fetchAutocompletePlayers(query);
  };
  if (searchTimeout !== null) {
    clearTimeout(searchTimeout);
  }
  if (query.length < 2) {
    clearAutocompleteList();
    return;
  }
  //debounce method to avoid too many requests
  searchTimeout = setTimeout(searchFunction, 300);
}
function resetGame() {
  currentSession.attempts = 0;
  currentSession.attemptedIds = [];
  stopTimer();
  secondsElapsed = 0;
  resetGameUI();
  fetchSecretPlayer();
}
function handleOpenStats() {
  var currentSort = sortStatsInput.value;
  var sortedData = getSortedStats(currentSort);
  renderStats(sortedData);
  openStatsModal();
}
function handleSortChange() {
  var currentSort = sortStatsInput.value;
  var sortedData = getSortedStats(currentSort);
  renderStats(sortedData);
}
{
  startForm.addEventListener("submit", handleStartSubmit);
  searchInput.addEventListener("input", handleSearchInput);
  btnRestartWin.addEventListener("click", resetGame);
  btnRestartLose.addEventListener("click", resetGame);
  btnRestartGame.addEventListener("click", resetGame);
  btnOpenStats.addEventListener("click", handleOpenStats);
  btnCloseStats.addEventListener("click", closeStatsModal);
  sortStatsInput.addEventListener("change", handleSortChange);
  statsDialog.addEventListener("click", closeOnBackdropClick);
  winnerDialog.addEventListener("click", closeOnBackdropClick);
  loserDialog.addEventListener("click", closeOnBackdropClick);
  errorDialog.addEventListener("click", closeOnBackdropClick);
  btnCloseError.addEventListener("click", closeErrorModal);
}
