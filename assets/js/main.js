// Sidebar collapse/expand, persisted across page loads.
(function () {
  var root = document.documentElement;
  var KEY = 'h26-sidebar';
  var MOBILE = window.matchMedia('(max-width: 880px)');

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function store(v) {
    try { localStorage.setItem(KEY, v); } catch (e) { /* private mode, ignore */ }
  }

  var initial = stored() || (MOBILE.matches ? 'collapsed' : 'expanded');
  root.setAttribute('data-sidebar', initial);

  function set(state) {
    root.setAttribute('data-sidebar', state);
    store(state);
  }
  function toggle() {
    set(root.getAttribute('data-sidebar') === 'collapsed' ? 'expanded' : 'collapsed');
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-sidebar-toggle]').forEach(function (btn) {
      btn.addEventListener('click', toggle);
    });
    var scrim = document.querySelector('.scrim');
    if (scrim) scrim.addEventListener('click', function () { set('collapsed'); });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && MOBILE.matches) set('collapsed');
    });
  });
})();
