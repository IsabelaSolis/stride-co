// Mejora progresiva donde pide confirmacion antes de enviar un formulario con data-confirm
//Sin JavaScript el formulario se envia igual.
document.addEventListener('submit', function (event) {
  var message = event.target.getAttribute('data-confirm');
  if (message && !window.confirm(message)) event.preventDefault();
});