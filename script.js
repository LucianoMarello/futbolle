"use strict";
//Global variables
var secretPlayer = null;
var searchTimeout = null;
var currentSession = {
  userName: "",
  difficulty: "",
  attempts: 0,
};
//DOM elements
var startForm = document.getElementById("startForm");
var startView = document.getElementById("startView");
var gameView = document.getElementById("gameView");
var winnerDialog = document.getElementById("winnerDialog");
var loserDialog = document.getElementById("loserDialog");
var searchInput = document.getElementById("searchInput");
var autocompleteList = document.getElementById("autocompleteList");
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
function renderAutocompleteResults(playersData) {
  clearAutocompleteList();

  if (playersData.length === 0) {
    return;
  }

  console.log("Datos recibidos para renderizar:", playersData);

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
      console.log("Jugador secreto obtenido con éxito.");
      showGameView();
    })
    .catch(function (error) {
      console.error("Error al obtener el jugador secreto: ", error);
      console.log("Mostrar con dialog luego.");
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
