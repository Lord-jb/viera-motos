// Router de views do Admin
// - Mostra/oculta <div class="view" id="*-view">
// - Marca item ativo no menu lateral

export function initViewRouter() {
  const menu = document.getElementById('admin-sidebar-menu');
  if (!menu) return;

  const views = Array.from(document.querySelectorAll('.view'));

  function showView(viewName) {
    views.forEach(v => {
      v.style.display = (v.id === `${viewName}-view`) ? 'block' : 'none';
    });
    // Ativa link
    const links = menu.querySelectorAll('a[data-view]');
    links.forEach(a => a.classList.toggle('active-view', a.getAttribute('data-view') === viewName));
  }

  menu.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-view]');
    if (!link) return;
    e.preventDefault();
    showView(link.getAttribute('data-view'));
  });

  return { showView };
}

