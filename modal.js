// Abrir e fechar o modal de ajuda
const helpButton = document.getElementById("help-button");
const helpModal = document.getElementById("help-modal");
const closeModal = document.getElementsByClassName("close")[0];

helpButton.onclick = function () {
  helpModal.style.display = "block";
};

closeModal.onclick = function () {
  helpModal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target === helpModal) {
    helpModal.style.display = "none";
  }
};
