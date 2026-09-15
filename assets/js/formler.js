// H26 — formelpanel og festede regler.
//
// Emner med `formulas` i SUBJECTS (main.js) får en Σ-knapp i toppfeltet. Den
// åpner et panel fra høyre med innholdet i emnets formelfil (f.eks.
// subjects/statistikk/formler.html). Panelet blokkerer ikke siden bak.
//
// Klikk på en regel i panelet: panelet lukkes, og regelen blir liggende i et
// flytende kort (oppe til høyre, kan dras dit du vil, lukkes med ×). Festede
// kort og posisjonene deres huskes per emne mellom sidene.
//
// Tastatur: F åpner/lukker panelet, Esc lukker. En regel festes med Enter.
// Et kort flyttes med piltastene når overskriften har fokus (Shift = større steg).
(function () {
  var OPEN_KEY = 'h26-formler-open';
  var SCROLL_KEY = 'h26-formler-scroll-';
  var PINS_KEY = 'h26-formler-pins-';

  var ICON_SIGMA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.5 5.5h-11l6.2 6.5-6.2 6.5h11"/></svg>';
  var ICON_CLOSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg>';
  var ICON_PIN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4h6l-1 5 3 3v2H7v-2l3-3-1-5zM12 14v6"/></svg>';

  function storeGet(k, session) {
    try { return (session ? sessionStorage : localStorage).getItem(k); } catch (e) { return null; }
  }
  function storeSet(k, v, session) {
    try { (session ? sessionStorage : localStorage).setItem(k, v); } catch (e) { /* lagring blokkert */ }
  }

  function slug(text) {
    return text.toLowerCase()
      .replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'regel';
  }

  // MathJax lastes bare på sider med formler; last den ved behov
  function ensureMathJax(H) {
    function ready() { return window.MathJax && window.MathJax.startup && window.MathJax.startup.promise; }
    if (ready()) return window.MathJax.startup.promise;
    if (!document.getElementById('MathJax-script') && !document.querySelector('script[src*="assets/js/math.js"]')) {
      var s = document.createElement('script');
      s.src = H.abs('assets/js/math.js?v=13');
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
    bar.insertBefore(btn, bar.querySelector('.theme-switch'));

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
      H.h('p.fp-hint', { text: 'Klikk på en regel for å feste den på skjermen.' }),
      toc,
      body
    ]);
    document.body.appendChild(panel);

    var rules = {};   // regel-id → .rule-elementet i panelet

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
            var link = H.h('a', {
              href: '#' + h2.parentNode.id,
              text: h2.parentNode.getAttribute('data-short') || h2.textContent,
              title: h2.textContent
            });
            link.addEventListener('click', function (e) {
              e.preventDefault();
              body.scrollTo({ top: h2.parentNode.offsetTop - 8, behavior: 'smooth' });
            });
            toc.appendChild(link);
          });

          // Hver regel kan festes. Id-en bygger på seksjon + overskrift.
          [].forEach.call(body.querySelectorAll('section[id] .rule'), function (rule) {
            var h3 = rule.querySelector('h3');
            var title = h3 ? h3.textContent.trim() : 'Regel';
            var id = rule.closest('section').id + '--' + slug(title);
            while (rules[id]) id += '-2';
            rules[id] = rule;
            rule.setAttribute('data-rule', id);
            rule.setAttribute('tabindex', '0');
            rule.setAttribute('role', 'button');
            rule.setAttribute('aria-label', 'Fest regelen ' + title);
            var mark = H.h('span.rule__pin', { 'aria-hidden': 'true' });
            mark.innerHTML = ICON_PIN + '<span>Fest</span>';
            rule.appendChild(mark);
          });

          return ensureMathJax(H).then(function () {
            // Lastet vi MathJax selv, har oppstarten allerede satt formlene i panelet
            if (body.querySelector('mjx-container')) return;
            if (window.MathJax && window.MathJax.typesetPromise) return window.MathJax.typesetPromise([body]);
          });
        })
        .then(function () {
          body.scrollTop = +storeGet(SCROLL_KEY + subject.id, true) || 0;
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
      storeSet(OPEN_KEY, '1');
      load();
      if (opts.focus) body.focus({ preventScroll: true });
      if (opts.instant) requestAnimationFrame(function () { requestAnimationFrame(function () { panel.classList.remove('no-anim'); }); });
    }

    function close(opts) {
      panel.classList.remove('is-open');
      panel.setAttribute('inert', '');
      btn.setAttribute('aria-expanded', 'false');
      storeSet(OPEN_KEY, '0');
      if (opts && opts.returnFocus) btn.focus();
    }

    btn.addEventListener('click', function (e) {
      if (isOpen()) close();
      // Tastaturklikk (detail === 0) flytter fokus inn i panelet, museklikk lar deg lese videre
      else open({ focus: e.detail === 0 });
    });
    closeBtn.addEventListener('click', function () { close({ returnFocus: true }); });

    /* ---- festede kort --------------------------------------------------- */

    var pins = [];    // { id, x, y, el }
    try { pins = JSON.parse(storeGet(PINS_KEY + subject.id) || '[]').filter(function (p) { return p && p.id; }); }
    catch (e) { pins = []; }

    function savePins() {
      storeSet(PINS_KEY + subject.id, JSON.stringify(pins.map(function (p) { return { id: p.id, x: p.x, y: p.y }; })));
    }

    function clamp(p) {
      var el = p.el;
      var w = el.offsetWidth, hgt = el.offsetHeight;
      var vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight;
      var maxX = Math.max(0, vw - w - 4);
      var maxY = Math.max(0, vh - Math.min(hgt, 48) - 4);
      p.x = Math.min(Math.max(4, p.x), maxX);
      p.y = Math.min(Math.max(4, p.y), maxY);
      el.style.left = p.x + 'px';
      el.style.top = p.y + 'px';
    }

    function defaultPosition(el) {
      // Oppe til høyre under toppfeltet, forskjøvet litt for hvert kort som allerede ligger der
      var n = pins.filter(function (p) { return p.el; }).length;
      var top = bar.getBoundingClientRect().bottom + 12;
      return { x: document.documentElement.clientWidth - el.offsetWidth - 20 - n * 24, y: top + n * 24 };
    }

    function renderPin(p) {
      var rule = rules[p.id];
      if (!rule) return false;   // regelen finnes ikke lenger i formelfila
      var h3 = rule.querySelector('h3');
      var title = h3 ? h3.textContent.trim() : 'Regel';

      var content = rule.cloneNode(true);
      content.removeAttribute('tabindex');
      content.removeAttribute('role');
      content.removeAttribute('aria-label');
      content.removeAttribute('data-rule');
      [].forEach.call(content.querySelectorAll('h3, .rule__pin'), function (n) { n.remove(); });
      content.className = 'pin-card__body rule';

      var x = H.h('button.pin-card__close', { type: 'button', 'aria-label': 'Fjern ' + title, title: 'Fjern' });
      x.innerHTML = ICON_CLOSE;
      var handle = H.h('div.pin-card__head', { tabindex: '0', title: 'Dra for å flytte (eller bruk piltastene)' }, [
        H.h('span.pin-card__title', { text: title }),
        x
      ]);
      var el = H.h('section.pin-card', { 'aria-label': 'Festet regel: ' + title }, [handle, content]);
      document.body.appendChild(el);
      p.el = el;

      if (p.x == null || p.y == null) {
        var d = defaultPosition(el);
        p.x = d.x; p.y = d.y;
      }
      clamp(p);

      x.addEventListener('click', function () { unpin(p); });

      // Dra med mus/penn
      var drag = null;
      handle.addEventListener('pointerdown', function (e) {
        if (e.button !== 0 || e.target.closest('.pin-card__close')) return;
        drag = { dx: e.clientX - p.x, dy: e.clientY - p.y, id: e.pointerId };
        handle.setPointerCapture(e.pointerId);
        el.classList.add('is-dragging');
        bringToFront(p);
        e.preventDefault();
      });
      handle.addEventListener('pointermove', function (e) {
        if (!drag || e.pointerId !== drag.id) return;
        p.x = e.clientX - drag.dx;
        p.y = e.clientY - drag.dy;
        clamp(p);
      });
      function endDrag(e) {
        if (!drag || e.pointerId !== drag.id) return;
        drag = null;
        el.classList.remove('is-dragging');
        savePins();
      }
      handle.addEventListener('pointerup', endDrag);
      handle.addEventListener('pointercancel', endDrag);

      // Flytt med piltastene
      handle.addEventListener('keydown', function (e) {
        var step = e.shiftKey ? 40 : 10;
        var moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
        if (moves[e.key]) {
          p.x += moves[e.key][0]; p.y += moves[e.key][1];
          clamp(p); savePins(); e.preventDefault();
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
          unpin(p); e.preventDefault();
        }
      });
      el.addEventListener('pointerdown', function () { bringToFront(p); });
      return true;
    }

    var zTop = 30;
    function bringToFront(p) { p.el.style.zIndex = ++zTop; }

    function pin(id) {
      var existing = pins.filter(function (p) { return p.id === id; })[0];
      close();
      if (existing && existing.el) {
        bringToFront(existing);
        existing.el.classList.remove('is-flash');
        void existing.el.offsetWidth;   // start blinkingen på nytt
        existing.el.classList.add('is-flash');
        existing.el.querySelector('.pin-card__head').focus({ preventScroll: true });
        return;
      }
      var p = { id: id, x: null, y: null };
      pins.push(p);
      if (renderPin(p)) {
        bringToFront(p);
        p.el.classList.add('is-new');
        p.el.querySelector('.pin-card__head').focus({ preventScroll: true });
      }
      savePins();
    }

    function unpin(p) {
      if (p.el) p.el.remove();
      pins = pins.filter(function (q) { return q !== p; });
      savePins();
    }

    body.addEventListener('click', function (e) {
      if (e.target.closest('a, button')) return;
      var rule = e.target.closest('.rule[data-rule]');
      if (!rule) return;
      // Ikke fest når du markerer tekst
      var sel = window.getSelection && window.getSelection();
      if (sel && String(sel).length > 0 && rule.contains(sel.anchorNode)) return;
      pin(rule.getAttribute('data-rule'));
    });
    body.addEventListener('keydown', function (e) {
      var rule = e.target.closest && e.target.closest('.rule[data-rule]');
      if (rule && e.target === rule && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        pin(rule.getAttribute('data-rule'));
      }
    });

    window.addEventListener('resize', function () {
      pins.forEach(function (p) { if (p.el) clamp(p); });
    });

    if (pins.length) {
      load().then(function () {
        pins = pins.filter(function (p) { return renderPin(p); });
        savePins();
      });
    }

    /* ---- tastatur ------------------------------------------------------- */

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
