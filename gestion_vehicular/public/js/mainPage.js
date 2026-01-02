//BLUR DE HEADER AL HACER SCROLL
var header = document.getElementById("header");

window.addEventListener('scroll', () => {
  var scroll = window.scrollY;

  if (scroll > 10) {
    header.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
    header.style.backdropFilter = 'blur(7px)'
  } else {
    header.style.backgroundColor = 'transparent';
  }
});
