"use strict";
var parsePlayerResponse = function (response) {
  if (!response.ok) {
    throw new Error("Fallo en la respuesta del servidor");
  }
  return response.json();
};
var initSecretPlayer = function (data) {
  secretPlayer = data;
  initializeHints(currentSession.difficulty, secretPlayer.photo);
  showGameView();
};
var handlePlayerFetchError = function (error) {
  console.error("Error al obtener el jugador secreto: ", error);
  showErrorModal(
    "No se pudo conectar con el servidor para iniciar la partida. Verifica tu conexión o intenta nuevamente más tarde.",
  );
  toggleStartButton(false, "Iniciar Juego");
};
var parseSearchResponse = function (response) {
  if (!response.ok) {
    throw new Error("Error al buscar jugadores");
  }
  return response.json();
};
var handleSearchError = function (error) {
  console.error("Fallo en el autocompletado:", error);
  showErrorModal("Error de red al buscar jugadores. Intenta de nuevo.");
};
function fetchSecretPlayer() {
  var url = "https://futbolle-daw-uai-2026.onrender.com/api/players/random";
  fetch(url)
    .then(parsePlayerResponse)
    .then(initSecretPlayer)
    .catch(handlePlayerFetchError);
}
function fetchAutocompletePlayers(query) {
  var url =
    "https://futbolle-daw-uai-2026.onrender.com/api/players/search?q=" +
    encodeURIComponent(query);
  fetch(url)
    .then(parseSearchResponse)
    .then(renderAutocompleteResults)
    .catch(handleSearchError);
}
