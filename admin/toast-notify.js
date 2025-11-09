/**
 * Módulo de Notificação Toast
 * Exibe uma mensagem flutuante no canto da tela.
 */
export function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  const icon = document.createElement('span');
  icon.className = 'toast-icon';
  if (type === 'success') icon.textContent = '✅';
  else if (type === 'error') icon.textContent = '❌';
  else icon.textContent = 'ℹ️';
  toast.prepend(icon);

  document.body.appendChild(toast);

  // Animação de entrada
  setTimeout(() => { toast.classList.add('show'); }, 50);

  // Remoção após 3s
  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => toast.remove());
  }, 3000);
}

