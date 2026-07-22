//Global variables
var secretPlayer = null;
var currentSession = {
  userName: "",
  difficulty: "",
  attempts: 0,
};

//DOM elements
var startForm = document.getElementById("startForm");
var startView = document.getElementById("startView");
var gameView = document.getElementById("gameView");
var dialogoGanador = document.getElementById("dialogoGanador");
var dialogoPerdedor = document.getElementById("dialogoPerdedor");

//Functions
function showGameView() {
  startView.classList.add("hidden");
  gameView.classList.remove("hidden");
}

//Api call to fetch a random player from the backend
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

//Event listeners
function handleStartSubmit(event) {
  var inputName;
  var inputDifficulty;

  event.preventDefault();

  inputName = startForm.elements["playerName"].value;
  inputDifficulty = startForm.elements["level"].value;

  currentSession.userName = inputName;
  currentSession.difficulty = inputDifficulty;

  console.log("Nombre del jugador: " + currentSession.userName);
  console.log("Nivel de dificultad: " + currentSession.difficulty);
  fetchSecretPlayer();
}

startForm.addEventListener("submit", handleStartSubmit);
