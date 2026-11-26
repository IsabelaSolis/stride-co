// Mejora progresiva: mostrar u ocultar la contraseña. Sin JavaScript el formulario funciona igual.
(function () {
  var button = document.getElementById('togglePassword');
  var input = document.getElementById('password');
  if (!button || !input) return;
  button.hidden = false;
  button.addEventListener('click', function () {
    var show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    button.querySelector('i').className = show ? 'bi bi-eye-slash' : 'bi bi-eye';
  });
})();