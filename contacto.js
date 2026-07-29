"use strict";

var contactForm = document.getElementById("contactForm");
var contactName = document.getElementById("contactName");
var contactEmail = document.getElementById("contactEmail");
var contactMessage = document.getElementById("contactMessage");
var contactError = document.getElementById("contactError");

function isValidAlphanumeric(text) {
  var regex = /^[a-zA-Z0-9\s]+$/;
  return regex.test(text);
}
function isValidEmail(email) {
  var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

//Event Handler
function handleContactSubmit(event) {
  var name = contactName.value.trim();
  var email = contactEmail.value.trim();
  var message = contactMessage.value.trim();
  var mailtoLink;

  event.preventDefault();

  contactError.textContent = "";

  if (name === "" || !isValidAlphanumeric(name)) {
    contactError.textContent =
      "El nombre no puede estar vacío y debe ser alfanumérico.";
    return;
  } else if (email === "" || !isValidEmail(email)) {
    contactError.textContent =
      "Por favor, ingresa una dirección de correo electrónico válida.";
    return;
  } else if (message.length <= 5) {
    contactError.textContent =
      "El mensaje es demasiado corto. Debe contener más de 5 caracteres.";
    return;
  }

  mailtoLink =
    "mailto:marelloluciano62@gmail.com" +
    "?subject=" +
    encodeURIComponent("Consulta Futbolle - " + name) +
    "&body=" +
    encodeURIComponent(message + "\n\nEnviado por: " + email);

  window.location.href = mailtoLink;

  contactForm.reset();
}

contactForm.addEventListener("submit", handleContactSubmit);
