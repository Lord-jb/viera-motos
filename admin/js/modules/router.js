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
    // Ativa link (suporta data-view e data-section)
    const links = menu.querySelectorAll('a[data-view], a[data-section]');
    links.forEach(a => {
      const attr = a.hasAttribute('data-view') ? 'data-view' : 'data-section';
      const val = a.getAttribute(attr);
      a.classList.toggle('active-view', val === viewName);
    });
  }

  menu.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-view], a[data-section]');
    if (!link) return;
    e.preventDefault();
    const view = link.getAttribute('data-view') || link.getAttribute('data-section');
    showView(view);
  });

  return { showView };
}
