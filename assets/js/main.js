// H26 — navigasjon, tittelfelt og innholdsfortegnelse.
//
// Alt som går igjen på tvers av sidene bygges her fra én liste (SUBJECTS):
//   * sidemenyen: på forsiden de fire emnene, inne i et emne kun emnets sider
//   * høyrekolonnen: tittelfelt + «På denne siden» (fra overskriftene)
//   * emneoversikten på forsiden
// Ny side? Legg den til i riktig gruppe under, og lenk den fra emnesiden.
(function () {
  var root = document.documentElement;
  var script = document.currentScript;
  var BASE = script.src.replace(/assets\/js\/main\.js([?#].*)?$/, '');
  var KEY = 'h26-sidebar';

  var SUBJECTS = [
    {
      id: 'mos', code: 'MoS', course: 'VE3270/TSD3050', kind: 'emne', short: 'Maskinvare og sikkerhet',
      name: 'Maskinvare og sikkerhet',
      desc: 'Bootloadere, SWD og UART, Bluetooth Low Energy, MQTT, effektanalyse og spenningsglitching.',
      scope: '6 kapitler med lab',
      href: 'subjects/mos/index.html',
      groups: [
        { label: 'Kapitler', items: [
          { n: '1', title: 'Introduksjon', part: 'Kapittel 1', href: 'subjects/mos/guides/01-intro.html' },
          { n: '2', title: 'Bootloader, SWD og UART', part: 'Kapittel 2', meta: 'lab 1', href: 'subjects/mos/guides/02-bootloader-swd-uart.html' },
          { n: '3', title: 'Bluetooth Low Energy', part: 'Kapittel 3', meta: 'lab 2', href: 'subjects/mos/guides/03-ble.html' },
          { n: '4', title: 'MicroPython og MQTT', part: 'Kapittel 4', meta: 'lab 3', href: 'subjects/mos/guides/04-micropython-mqtt.html' },
          { n: '5', title: 'Effektanalyse', part: 'Kapittel 5', meta: 'lab 4', href: 'subjects/mos/guides/05-effektanalyse.html' },
          { n: '6', title: 'Glitching', part: 'Kapittel 6', meta: 'lab 5', href: 'subjects/mos/guides/06-glitching.html' }
        ] }
      ]
    },
    {
      id: 'tsd3060', code: 'TSD3060', course: 'TSD3060', kind: 'emne', short: 'Sikre webtjenester',
      name: 'Utvikling av sikre webtjenester',
      desc: 'HTTP-tjenere i C, SQL-injeksjon og autentisering, chroot og konteinere.',
      scope: '3 uker og eksamensoversikt',
      href: 'subjects/tsd3060/index.html',
      groups: [
        { label: 'Uker', items: [
          { n: '33', title: 'HTTP, port 80/443 og REST', part: 'Uke 33', href: 'subjects/tsd3060/guides/33-http-rest.html' },
          { n: '34', title: 'SQLite, injeksjon og autentisering', part: 'Uke 34', href: 'subjects/tsd3060/guides/34-sqlite-injeksjon-autentisering.html' },
          { n: '35', title: 'chroot og konteinere', part: 'Uke 35', href: 'subjects/tsd3060/guides/35-chroot-konteinere.html' }
        ] },
        { label: 'Eksamen', items: [
          { title: 'Eksamensoversikt', part: 'Eksamensforberedelse', href: 'subjects/tsd3060/guides/eksamensoversikt.html' }
        ] },
        { label: 'Andre steder', items: [
          { title: 'Kurssystemet', meta: 'debbie', external: true, href: 'https://debbie.usn.no/tsd3060/' }
        ] }
      ]
    },
    {
      id: 'statistikk', code: 'PB2030', course: 'PB2030', kind: 'konte',
      name: 'Statistikk',
      desc: 'Eksamensoppgaver fra 13 tidligere sett, sortert på tema, med løsningsforslag.',
      scope: '88 oppgaver fra 13 sett',
      href: 'subjects/statistikk/index.html',
      groups: [
        { label: 'Start her', items: [
          { title: 'Eksamensoversikt', part: 'Eksamensforberedelse', href: 'subjects/statistikk/oppgaver/00-eksamensoversikt.html' },
          { title: 'Formelsamling og tabeller', part: 'Vedlegg', href: 'subjects/statistikk/oppgaver/10-formelsamling.html' }
        ] },
        { label: 'Oppgaver etter tema', items: [
          { n: '1', title: 'Sannsynlighet og hendelsestre', meta: '10', part: 'Oppgaver med løsning', href: 'subjects/statistikk/oppgaver/01-sannsynlighet.html' },
          { n: '2', title: 'Kombinatorikk og hypergeometrisk', meta: '8', part: 'Oppgaver med løsning', href: 'subjects/statistikk/oppgaver/02-kombinatorikk.html' },
          { n: '3', title: 'Diskrete fordelinger', meta: '12', part: 'Oppgaver med løsning', href: 'subjects/statistikk/oppgaver/03-diskrete-fordelinger.html' },
          { n: '4', title: 'Tetthet og eksponentialfordeling', meta: '7', part: 'Oppgaver med løsning', href: 'subjects/statistikk/oppgaver/04-kontinuerlige-fordelinger.html' },
          { n: '5', title: 'Normalfordeling', meta: '11', part: 'Oppgaver med løsning', href: 'subjects/statistikk/oppgaver/05-normalfordeling.html' },
          { n: '6', title: 'Sentralgrenseteoremet', meta: '10', part: 'Oppgaver med løsning', href: 'subjects/statistikk/oppgaver/06-sentralgrenseteoremet.html' },
          { n: '7', title: 'Konfidensintervall', meta: '12', part: 'Oppgaver med løsning', href: 'subjects/statistikk/oppgaver/07-konfidensintervall.html' },
          { n: '8', title: 'Hypotesetesting', meta: '13', part: 'Oppgaver med løsning', href: 'subjects/statistikk/oppgaver/08-hypotesetesting.html' },
          { n: '9', title: 'Regresjon og korrelasjon', meta: '5', part: 'Oppgaver med løsning', href: 'subjects/statistikk/oppgaver/09-regresjon.html' }
        ] }
      ]
    },
    {
      id: 'fysikk2', code: 'FYS2-EL', course: 'FYS2-EL', kind: 'konte', short: 'Elektrisitetslære',
      name: 'Fysikk 2, elektrisitetslære',
      desc: 'Pensum, øvinger og tidligere eksamenssett legges inn når de er klare.',
      scope: 'Ingen ressurser ennå',
      href: 'subjects/fysikk2/index.html',
      groups: []
    }
  ];

  /* ---- hjelpere --------------------------------------------------------- */

  function abs(href) { return /^https?:/.test(href) ? href : BASE + href; }
  function bare(u) { return decodeURI(u.split('#')[0].split('?')[0]); }
  var HERE = bare(location.href);
  function isHere(href) { return bare(abs(href)) === HERE; }

  // h('a.navlink', {href: …}, [children]) — liten DOM-bygger
  function h(tag, attrs, kids) {
    var parts = tag.split('.');
    var el = document.createElement(parts[0]);
    if (parts.length > 1) el.className = parts.slice(1).join(' ');
    for (var k in attrs || {}) {
      if (attrs[k] == null || attrs[k] === false) continue;
      if (k === 'text') el.textContent = attrs[k];
      else el.setAttribute(k, attrs[k]);
    }
    [].concat(kids || []).forEach(function (c) {
      if (c == null) return;
      el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return el;
  }

  function formatDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    return m ? m[3] + '.' + m[2] + '.' + m[1] : '';
  }

  function slug(text) {
    return text.toLowerCase()
      .replace(/[æ]/g, 'ae').replace(/[ø]/g, 'o').replace(/[å]/g, 'a')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'seksjon';
  }

  var subject = null, page = null;
  SUBJECTS.forEach(function (s) {
    if (HERE.indexOf(bare(abs('subjects/' + s.id + '/'))) === 0) subject = s;
  });
  if (subject) {
    if (isHere(subject.href)) page = { title: 'Oversikt', part: 'Oversikt' };
    subject.groups.forEach(function (g) {
      g.items.forEach(function (it) { if (!it.external && isHere(it.href)) page = it; });
    });
    document.body.setAttribute('data-subject', subject.id);
  }

  var gridIcon = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="1.5" width="5" height="5"/><rect x="9.5" y="1.5" width="5" height="5"/><rect x="1.5" y="9.5" width="5" height="5"/><rect x="9.5" y="9.5" width="5" height="5"/></svg>';

  /* ---- sidemeny --------------------------------------------------------- */

  function navlink(item, subjectId) {
    var current = !item.external && isHere(item.href);
    return h('a.navlink', {
      href: abs(item.href),
      'aria-current': current ? 'page' : null,
      target: item.external ? '_blank' : null,
      rel: item.external ? 'noopener' : null,
      'data-subject': subjectId || null
    }, [
      h('span.navlink__n', { text: item.n || '' }),
      h('span.navlink__title', { text: item.title }),
      item.meta ? h('span.navlink__meta', { text: item.meta }) : null
    ]);
  }

  function buildSidebar(aside) {
    var nav = h('nav.sidebar__nav', { 'aria-label': subject ? subject.name : 'Emner' });

    if (!subject) {
      aside.appendChild(h('a.sidebar__brand', { href: abs('index.html'), 'aria-current': 'page' }, [
        h('span.sidebar__brand-mark', {}, []), 'H26 kontrollpult'
      ]));
      aside.querySelector('.sidebar__brand-mark').innerHTML = gridIcon;
      [['emne', 'Emner'], ['konte', 'Kontefag']].forEach(function (grp) {
        nav.appendChild(h('div.sidebar__group-label', { text: grp[1] }));
        SUBJECTS.filter(function (s) { return s.kind === grp[0]; }).forEach(function (s) {
          nav.appendChild(h('a.navlink.navlink--subject', { href: abs(s.href), 'data-subject': s.id }, [
            h('span.navlink__code', { text: s.code }),
            h('span.navlink__title', { text: s.short || s.name })
          ]));
        });
      });
    } else {
      var home = h('a.sidebar__home', { href: abs('index.html') }, [h('span.sidebar__brand-mark'), 'Alle emner']);
      home.firstChild.innerHTML = gridIcon;
      aside.appendChild(home);

      aside.appendChild(h('div.sidebar__subject', {}, [
        h('span.sidebar__code', {}, [
          subject.code,
          subject.kind === 'konte' ? h('span.sidebar__kind', { text: 'kontefag' }) : null
        ]),
        h('span.sidebar__name', { text: subject.name })
      ]));

      nav.appendChild(navlink({ title: 'Oversikt', href: subject.href }));
      subject.groups.forEach(function (g) {
        nav.appendChild(h('div.sidebar__group-label', { text: g.label }));
        g.items.forEach(function (it) { nav.appendChild(navlink(it)); });
      });
      if (!subject.groups.length) {
        nav.appendChild(h('p.sidebar__empty', { text: 'Ingen sider ennå.' }));
      }
    }
    aside.appendChild(nav);
  }

  /* ---- høyrekolonne: tittelfelt + innhold ------------------------------- */

  function cell(label, value, cls) {
    return h('div.titleblock__cell' + (cls ? '.' + cls : ''), {}, [
      h('dt', { text: label }),
      value.nodeType ? h('dd', {}, [value]) : h('dd', { text: value })
    ]);
  }

  function buildRail(content) {
    var mainCol = h('div.content__main');
    while (content.firstChild) mainCol.appendChild(content.firstChild);
    content.appendChild(mainCol);
    content.classList.add('has-rail');

    var statusEl = content.querySelector('.page-header__status');
    var scope = statusEl ? statusEl.textContent.trim() : '';
    var updated = formatDate(document.body.getAttribute('data-updated'));

    // «Blad 5 av 12»: sidens plass blant emnets sider, oversikten medregnet
    var sheets = [subject.href];
    subject.groups.forEach(function (g) {
      g.items.forEach(function (it) { if (!it.external) sheets.push(it.href); });
    });
    var sheetNo = 0;
    sheets.forEach(function (href, i) { if (isHere(href)) sheetNo = i + 1; });
    var sheet = sheetNo ? sheetNo + ' av ' + sheets.length : '–';

    var block = h('dl.titleblock', {}, [
      cell('Emne', h('span', {}, [
        h('span.titleblock__code', { text: subject.course }),
        h('span.titleblock__name', { text: subject.name })
      ]), 'titleblock__cell--wide'),
      cell('Del', page ? page.part : '', 'titleblock__cell--wide'),
      cell('Omfang', scope || subject.scope, 'titleblock__cell--wide'),
      cell('Blad', sheet),
      cell('Oppdatert', updated || '–')
    ]);

    // Innholdsfortegnelse: seksjoner, nummererte avsnitt og oppgaver
    var targets = [].slice.call(mainCol.querySelectorAll('.section__label, .prose h2, .task'));
    var list = h('ol.toc__list');
    var entries = [];
    var sectionNo = 0;
    var used = {};
    targets.forEach(function (t) {
      var level = 1, label, num = '';
      if (t.classList.contains('task')) {
        level = 2;
        var src = t.querySelector('.task__src');
        var title = t.querySelector('.task__title');
        label = (title ? title.textContent : '') ;
        num = src ? src.textContent.replace(/\s*&.*$/, '') : '';
      } else if (t.tagName === 'H2') {
        sectionNo += 1;
        num = String(sectionNo);
        label = t.textContent;
      } else {
        label = t.textContent;
      }
      if (!t.id) {
        var id = slug(label), base = id, i = 2;
        while (used[id] || document.getElementById(id)) id = base + '-' + i++;
        t.id = id;
      }
      used[t.id] = true;
      var a = h('a.toc__link', { href: '#' + t.id }, [
        num ? h('span.toc__num', { text: num }) : null,
        h('span.toc__text', { text: label.trim() })
      ]);
      list.appendChild(h('li.toc__item.toc__item--l' + level, {}, [a]));
      entries.push({ target: t, link: a });
    });

    var rail = h('aside.rail', { 'aria-label': 'Om siden' }, [block]);
    if (entries.length > 1) {
      rail.appendChild(h('nav.toc', { 'aria-label': 'På denne siden' }, [
        h('p.toc__label', { text: 'På denne siden' }), list
      ]));
    }
    content.appendChild(rail);

    // Marker avsnittet du leser
    if (entries.length > 1) {
      var ticking = false;
      var spy = function () {
        ticking = false;
        var line = 120, current = entries[0];
        entries.forEach(function (e) { if (e.target.getBoundingClientRect().top <= line) current = e; });
        entries.forEach(function (e) {
          if (e === current) e.link.setAttribute('aria-current', 'true');
          else e.link.removeAttribute('aria-current');
        });
      };
      window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; requestAnimationFrame(spy); }
      }, { passive: true });
      spy();
    }
  }

  /* ---- forside: emneoversikt -------------------------------------------- */

  function buildOverview(host) {
    SUBJECTS.forEach(function (s) {
      var items = [];
      s.groups.forEach(function (g) {
        g.items.forEach(function (it) { if (!it.external) items.push(it); });
      });
      var list = items.length
        ? h('ol.subject__list', {}, items.map(function (it) {
            return h('li', {}, [h('a', { href: abs(it.href) }, [
              h('span.subject__n', { text: it.n || '' }),
              h('span.subject__item', { text: it.title })
            ])]);
          }))
        : h('p.subject__empty', { text: 'Ingen sider ennå.' });

      host.appendChild(h('section.subject', { 'data-subject': s.id, 'aria-labelledby': 'emne-' + s.id }, [
        h('p.subject__code', {}, [
          h('span', { text: s.course }),
          h('span.subject__kind', { text: s.kind === 'konte' ? 'Kontefag' : 'Emne' })
        ]),
        h('h2.subject__name', { id: 'emne-' + s.id }, [h('a', { href: abs(s.href), text: s.name })]),
        h('p.subject__desc', { text: s.desc }),
        h('p.subject__scope', { text: s.scope }),
        list
      ]));
    });
  }

  /* ---- sidepanel skjul/vis ---------------------------------------------- */

  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function store(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* privat modus */ } }

  root.setAttribute('data-sidebar', stored() || 'expanded');

  function init() {
    var aside = document.querySelector('.sidebar');
    if (aside && !aside.children.length) buildSidebar(aside);

    var overview = document.querySelector('[data-overview]');
    if (overview) buildOverview(overview);

    var content = document.querySelector('.content');
    if (content && subject) buildRail(content);

    document.querySelectorAll('[data-sidebar-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var next = root.getAttribute('data-sidebar') === 'collapsed' ? 'expanded' : 'collapsed';
        root.setAttribute('data-sidebar', next);
        store(next);
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
