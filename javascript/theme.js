"use strict";
var themeToggle = document.getElementById("themeToggle");
function handleThemeToggle() {
  document.body.classList.toggle("light-theme");
  //Save Reference to localStorage
  if (document.body.classList.contains("light-theme")) {
    localStorage.setItem("futbolle_theme", "light");
  } else {
    localStorage.setItem("futbolle_theme", "dark");
  }
}
if (localStorage.getItem("futbolle_theme") === "light") {
  document.body.classList.add("light-theme");
}
if (themeToggle) {
  themeToggle.addEventListener("click", handleThemeToggle);
}
