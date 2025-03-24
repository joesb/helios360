document.addEventListener("DOMContentLoaded", (event) => {
  var hamburger = document.getElementById('hamburger');
  hamburger.addEventListener('click', hamburgerClick);
});

function hamburgerClick(event) {
  event.preventDefault();
  var bodyTag = document.body;
  var hamburger = document.getElementById('hamburger');
  if (bodyTag.classList.contains('open-mobile')) {
    bodyTag.classList.remove('open-mobile'); // .. remove the class..
    hamburger.setAttribute('aria-expanded', 'false');
  }
  else {
    bodyTag.classList.add('open-mobile'); // .. add the open on mobile class..
    hamburger.setAttribute('aria-expanded', 'true');
  }
};