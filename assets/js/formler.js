// H26 — formelpanel.
//
// Emner med `formulas` i SUBJECTS (main.js) får en Σ-knapp i toppfeltet. Den
// åpner et panel fra høyre med innholdet i emnets formelfil (f.eks.
// subjects/statistikk/formler.html). Panelet blokkerer ikke siden bak: du kan
// scrolle og jobbe med oppgaven mens det er åpent.
//
// Tastatur: F åpner/lukker, Esc lukker. Åpen/lukket huskes mellom sidene, og
// scrollposisjonen i panelet huskes i fanen.
(function () {
  var OPEN_KEY = 'h26-formler-open';
  var SCROLL_KEY = 'h26-formler-scroll-';

  var ICON_SIGMA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.5 5.5h-11l6.2 6.5-6.2 6.5h11"/></svg>';
  var ICON_CLOSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg>';

  function storeGet(k, session) {
    try { return (session ? sessionStorage : localStorage).getItem(k); } catch (e) { return null; }
  }
  function storeSet(k, v, session) {
    try { (session ? sessionStorage : localStorage).setItem(k, v); } catch (e) { /* lagring blokkert */ }
  }

  // MathJax lastes bare på sider med formler; last den ved behov
  function ensureMathJax(H) {
    function ready() { return window.MathJax && window.MathJax.startup && window.MathJax.startup.promise; }
    if (ready()) return window.MathJax.startup.promise;
    if (!document.getElementById('MathJax-script') && !document.querySelector('script[src*="assets/js/math.js"]')) {
      var s = document.createElement('script');
      s.src = H.abs('assets/js/math.js?v=11');
      document.head.appendChild(s);
    }
    return new Promise(function (resolve) {
      var tries = 0;
      (function wait() {
        if (ready()) { window.MathJax.startup.promise.then(resolve); return; }
        if (tries++ > 300) { resolve(); return; }
        setTimeout(wait, 50);
      })();
    });
  }

  function start() {
    var H = window.H26;
    if (!H || !H.subject || !H.subject.formulas) return;
    var subject = H.subject;
    var bar = document.querySelector('.topbar');
    if (!bar) return;

    /* ---- knapp ---------------------------------------------------------- */

    var btn = H.h('button.formula-btn', {
      type: 'button', 'aria-controls': 'formelpanel', 'aria-expanded': 'false',
      'aria-label': 'Formler', title: 'Formler (F)'
    });
    btn.innerHTML = ICON_SIGMA;
    var themeSwitch = bar.querySelector('.theme-switch');
    bar.insertBefore(btn, themeSwitch);

    /* ---- panel ---------------------------------------------------------- */

    var closeBtn = H.h('button.fp-close', { type: 'button', 'aria-label': 'Lukk formler', title: 'Lukk (Esc)' });
    closeBtn.innerHTML = ICON_CLOSE;
    var toc = H.h('nav.fp-toc', { 'aria-label': 'Emner i formelpanelet' });
    var body = H.h('div.fp-body', { tabindex: '-1' }, [H.h('p.fp-status', { text: 'Henter formler …' })]);
    var panel = H.h('aside.formula-panel', { id: 'formelpanel', 'aria-label': 'Formler for ' + subject.name, inert: '' }, [
      H.h('header.fp-head', {}, [
        H.h('div.fp-title', {}, [
          H.h('h2', { text: 'Formler' }),
          H.h('span', { text: subject.course + ' ' + subject.name })
        ]),
        closeBtn
      ]),
      toc,
      body
    ]);
    document.body.appendChild(panel);

    var loaded = null;
    function load() {
      if (loaded) return loaded;
      loaded = fetch(H.abs(subject.formulas), { cache: 'no-cache' })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
        .then(function (html) {
          var doc = new DOMParser().parseFromString(html, 'text/html');
          var content = doc.querySelector('.fp-content');
          if (!content) throw new Error('mangler .fp-content');
          body.innerHTML = '';
          body.appendChild(document.importNode(content, true));

          [].forEach.call(body.querySelectorAll('a[data-site-href]'), function (a) {
            a.href = H.abs(a.getAttribute('data-site-href'));
          });

          // Hopp-lenker fra seksjonene
          [].forEach.call(body.querySelectorAll('section[id] > h2'), function (h2) {
            var link = H.h('a', { href: '#' + h2.parentNode.id, text: h2.parentNode.getAttribute('data-short') || h2.textContent, title: h2.textContent });
            link.addEventListener('click', function (e) {
              e.preventDefault();
              body.scrollTo({ top: h2.parentNode.offsetTop - 8, behavior: 'smooth' });
            });
            toc.appendChild(link);
          });

          return ensureMathJax(H).then(function () {
            // Lastet vi MathJax selv, har oppstarten allerede satt formlene i panelet
            if (body.querySelector('mjx-container')) return;
            if (window.MathJax && window.MathJax.typesetPromise) return window.MathJax.typesetPromise([body]);
          });
        })
        .then(function () {
          var y = +storeGet(SCROLL_KEY + subject.id, true) || 0;
          body.scrollTop = y;
        })
        .catch(function () {
          body.innerHTML = '';
          body.appendChild(H.h('p.fp-status', { text: 'Kunne ikke hente formlene. Åpne siden via localhost eller GitHub Pages, ikke direkte som fil.' }));
        });
      return loaded;
    }

    var scrollTick = null;
    body.addEventListener('scroll', function () {
      clearTimeout(scrollTick);
      scrollTick = setTimeout(function () { storeSet(SCROLL_KEY + subject.id, String(body.scrollTop), true); }, 150);
    }, { passive: true });

    function isOpen() { return panel.classList.contains('is-open'); }

    function open(opts) {
      opts = opts || {};
      if (opts.instant) panel.classList.add('no-anim');
      panel.classList.add('is-open');
      panel.removeAttribute('inert');
      btn.setAttribute('aria-expanded', 'true');
      document.documentElement.classList.add('formulas-open');
      storeSet(OPEN_KEY, '1');
      load();
      if (opts.focus) body.focus({ preventScroll: true });
      if (opts.instant) requestAnimationFrame(function () { requestAnimationFrame(function () { panel.classList.remove('no-anim'); }); });
    }

    function close(opts) {
      panel.classList.remove('is-open');
      panel.setAttribute('inert', '');
      btn.setAttribute('aria-expanded', 'false');
      document.documentElement.classList.remove('formulas-open');
      storeSet(OPEN_KEY, '0');
      if (opts && opts.returnFocus) btn.focus();
    }

    btn.addEventListener('click', function (e) {
      if (isOpen()) close();
      // Tastaturklikk (detail === 0) flytter fokus inn i panelet, museklikk lar deg lese videre
      else open({ focus: e.detail === 0 });
    });
    closeBtn.addEventListener('click', function () { close({ returnFocus: true }); });

    document.addEventListener('keydown', function (e) {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
      var t = e.target;
      var typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
      if (e.key === 'Escape' && isOpen()) {
        close({ returnFocus: panel.contains(document.activeElement) });
      } else if (!typing && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        if (isOpen()) close({ returnFocus: panel.contains(document.activeElement) });
        else open({ focus: true });
      }
    });

    if (storeGet(OPEN_KEY) === '1') open({ instant: true });
  }

  if (window.H26 && window.H26.ready) start();
  else document.addEventListener('h26:ready', start);
})();
