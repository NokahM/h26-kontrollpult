// H26 — status på oppgaver og kapitler.
//
// Fire statuser: ikke gjort (standard), gjort og forstått, gjort men må
// repeteres, gjort men ikke forstått. Lagres i nettleseren (localStorage)
// under 'h26-status', og kan eksporteres/importeres som fil fra forsiden.
//
// Nøkler:  kapittel/uke   'mos/guides/03-ble'
//          oppgave        'statistikk/oppgaver/05-normalfordeling#mai2026'
//
// Setter status:  oppgavebokser (.task) og kapittelsider (track: 'page')
// Viser status:   sidemeny, høyrekolonne, emnesidens «Status», forsiden
(function () {
  var STORE = 'h26-status';

  var STATES = [
    { id: 'uklart',     label: 'Ikke forstått', long: 'Gjort, men ikke forstått' },
    { id: 'repeter',    label: 'Må repeteres',  long: 'Gjort, men må repeteres' },
    { id: 'ikke-gjort', label: 'Ikke gjort',    long: 'Ikke gjort' },
    { id: 'forstatt',   label: 'Forstått',      long: 'Gjort og forstått' }
  ];
  // Rekkefølgen i velgeren følger arbeidsflyten
  var PICKER_ORDER = ['ikke-gjort', 'forstatt', 'repeter', 'uklart'];
  var BY_ID = {};
  STATES.forEach(function (s) { BY_ID[s.id] = s; });

  /* ---- lagring ---------------------------------------------------------- */

  var storageOk = true;
  function load() {
    try {
      var d = JSON.parse(localStorage.getItem(STORE) || 'null');
      if (d && typeof d.items === 'object') return d;
    } catch (e) { storageOk = false; }
    return { version: 1, items: {} };
  }
  var data = load();

  function persist() {
    try { localStorage.setItem(STORE, JSON.stringify(data)); storageOk = true; }
    catch (e) { storageOk = false; }
  }

  function stateOf(key) {
    var r = data.items[key];
    return r && BY_ID[r.s] ? r.s : 'ikke-gjort';
  }

  var listeners = [];
  function onChange(fn) { listeners.push(fn); }
  function emit() { listeners.forEach(function (fn) { fn(); }); }

  function setState(key, state, info) {
    if (state === 'ikke-gjort') delete data.items[key];
    else data.items[key] = { s: state, t: new Date().toISOString(), label: info.label || '', title: info.title || '' };
    persist();
    emit();
  }

  // Endringer fra en annen fane
  window.addEventListener('storage', function (e) {
    if (e.key === STORE) { data = load(); emit(); }
  });

  /* ---- telling ---------------------------------------------------------- */

  function emptyCounts() { return { uklart: 0, repeter: 0, 'ikke-gjort': 0, forstatt: 0, total: 0 }; }

  // Antall per status for én side i emnelisten. For oppgavesider brukes det
  // faktiske antallet på siden når vi står på den, ellers tallet i emnelisten.
  function pageCounts(H, item, liveTotal) {
    var c = emptyCounts();
    var key = H.pageKey(item.href);
    if (item.track === 'page') {
      c.total = 1;
      c[stateOf(key)] += 1;
      return c;
    }
    c.total = liveTotal != null ? liveTotal : (item.tasks || 0);
    var prefix = key + '#';
    Object.keys(data.items).forEach(function (k) {
      if (k.indexOf(prefix) === 0) c[stateOf(k)] += 1;
    });
    c['ikke-gjort'] = Math.max(0, c.total - c.uklart - c.repeter - c.forstatt);
    return c;
  }

  function trackedItems(subject) {
    var out = [];
    subject.groups.forEach(function (g) {
      g.items.forEach(function (it) { if (it.track) out.push(it); });
    });
    return out;
  }

  function subjectCounts(H, subject) {
    var c = emptyCounts();
    trackedItems(subject).forEach(function (it) {
      var pc = pageCounts(H, it);
      Object.keys(c).forEach(function (k) { c[k] += pc[k]; });
    });
    return c;
  }

  /* ---- byggeklosser ----------------------------------------------------- */

  // Delt stolpe: én bit per status, bredde etter andel
  function bar(H, counts, cls) {
    var el = H.h('div.statusbar' + (cls ? '.' + cls : ''), {
      role: 'img',
      'aria-label': STATES.map(function (s) { return counts[s.id] + ' ' + s.label.toLowerCase(); }).join(', ')
    });
    ['forstatt', 'repeter', 'uklart', 'ikke-gjort'].forEach(function (id) {
      if (!counts[id]) return;
      el.appendChild(H.h('span.statusbar__seg', { 'data-state': id, style: 'flex-grow:' + counts[id] }));
    });
    return el;
  }

  function picker(H, key, info, ariaLabel) {
    var group = H.h('div.status-picker', { role: 'group', 'aria-label': ariaLabel, 'data-key': key });
    PICKER_ORDER.forEach(function (id) {
      var st = BY_ID[id];
      var btn = H.h('button.status-picker__opt', { type: 'button', 'data-state': id, title: st.long }, [
        H.h('span.status-dot', { 'data-state': id, 'aria-hidden': 'true' }),
        id === 'ikke-gjort' ? 'Ikke gjort' : st.label
      ]);
      btn.addEventListener('click', function () { setState(key, id, info); });
      group.appendChild(btn);
    });
    function sync() {
      var cur = stateOf(key);
      group.setAttribute('data-current', cur);
      [].forEach.call(group.children, function (b) {
        b.setAttribute('aria-pressed', b.getAttribute('data-state') === cur ? 'true' : 'false');
      });
    }
    sync();
    onChange(sync);
    return group;
  }

  /* ---- på en oppgaveside ------------------------------------------------ */

  function decorateTasks(H, item) {
    var key = H.pageKey(item.href);
    var tasks = [].slice.call(document.querySelectorAll('.task[id]'));

    tasks.forEach(function (task) {
      var taskKey = key + '#' + task.id;
      var src = task.querySelector('.task__src');
      var title = task.querySelector('.task__title');
      var info = {
        label: src ? src.textContent.trim() : task.id,
        title: title ? title.textContent.trim() : ''
      };
      // Hold lagret navn oppdatert, så oversikten kan vise det uten å hente siden
      var rec = data.items[taskKey];
      if (rec && (rec.label !== info.label || rec.title !== info.title)) {
        rec.label = info.label; rec.title = info.title; persist();
      }

      var row = H.h('div.task__status', {}, [
        H.h('span.task__status-label', { text: 'Status' }),
        picker(H, taskKey, info, 'Status for ' + info.label)
      ]);
      var head = task.querySelector('.task__head');
      if (head) head.insertAdjacentElement('afterend', row);
      else task.insertBefore(row, task.firstChild);

      var syncTask = function () { task.setAttribute('data-state', stateOf(taskKey)); };
      syncTask();
      onChange(syncTask);
    });

    // Høyrekolonnen: fremdrift for siden, filter og markører i innholdslisten
    var rail = document.querySelector('.rail');
    if (!rail || !tasks.length) return;

    var toc = rail.querySelector('.toc__list');
    var box = H.h('section.progress', { 'aria-label': 'Fremdrift på siden' });
    var titleblock = rail.querySelector('.titleblock');
    titleblock.insertAdjacentElement('afterend', box);

    var filter = null;
    function render() {
      var c = pageCounts(H, item, tasks.length);
      box.innerHTML = '';
      box.appendChild(H.h('p.progress__label', { text: 'Fremdrift' }));
      box.appendChild(bar(H, c));
      var legend = H.h('ul.progress__legend');
      STATES.forEach(function (st) {
        var b = H.h('button.progress__item', {
          type: 'button',
          'data-state': st.id,
          'aria-pressed': filter === st.id ? 'true' : 'false',
          title: filter === st.id ? 'Vis alle oppgaver' : 'Vis bare «' + st.label.toLowerCase() + '» i listen under'
        }, [
          H.h('span.status-dot', { 'data-state': st.id, 'aria-hidden': 'true' }),
          H.h('span.progress__name', { text: st.label }),
          H.h('span.progress__count', { text: String(c[st.id]) })
        ]);
        b.addEventListener('click', function () {
          filter = filter === st.id ? null : st.id;
          render();
        });
        legend.appendChild(H.h('li', {}, [b]));
      });
      box.appendChild(legend);

      if (toc) {
        toc.setAttribute('data-filter', filter || '');
        [].forEach.call(toc.querySelectorAll('[data-task]'), function (li) {
          var st = stateOf(key + '#' + li.getAttribute('data-task'));
          li.setAttribute('data-state', st);
          li.hidden = !!filter && st !== filter;
        });
      }

      var sheet = titleblock.querySelector('.titleblock__cell--sheet');
      if (sheet) {
        sheet.querySelector('dt').textContent = 'Forstått';
        sheet.querySelector('dd').textContent = c.forstatt + ' av ' + c.total;
      }
    }
    render();
    onChange(render);
  }

  /* ---- på en kapittelside ----------------------------------------------- */

  function decorateChapter(H, item) {
    var key = H.pageKey(item.href);
    var info = { label: item.part || '', title: item.title };
    var main = document.querySelector('.content__main') || document.querySelector('.content');

    var top = H.h('div.page-status', {}, [
      H.h('span.page-status__label', { text: 'Status for ' + (item.part || 'siden').toLowerCase() }),
      picker(H, key, info, 'Status for ' + (item.part || 'siden'))
    ]);
    var anchor = main.querySelector('.sourcebar') || main.querySelector('.page-header');
    if (anchor) anchor.insertAdjacentElement('afterend', top);

    var nav = main.querySelector('.chapter-nav');
    if (nav) {
      var bottom = H.h('div.page-status.page-status--end', {}, [
        H.h('span.page-status__label', { text: 'Ferdig med ' + (item.part || 'siden').toLowerCase() + '?' }),
        picker(H, key, info, 'Status for ' + (item.part || 'siden'))
      ]);
      nav.insertAdjacentElement('beforebegin', bottom);
    }

    var sheet = document.querySelector('.titleblock__cell--sheet');
    if (sheet) {
      var sync = function () {
        sheet.querySelector('dt').textContent = 'Status';
        sheet.querySelector('dd').textContent = BY_ID[stateOf(key)].label;
      };
      sync();
      onChange(sync);
    }
  }

  /* ---- sidemenyen ------------------------------------------------------- */

  function decorateSidebar(H) {
    var links = [].slice.call(document.querySelectorAll('.navlink[data-key]'));
    if (!links.length || !H.subject) return;
    var items = {};
    trackedItems(H.subject).forEach(function (it) { items[H.pageKey(it.href)] = it; });

    function render() {
      links.forEach(function (a) {
        var it = items[a.getAttribute('data-key')];
        if (!it) return;
        var old = a.querySelector('.statusbar');
        if (old) old.remove();
        var liveTotal = H.isHere(it.href) && it.track === 'tasks' ? document.querySelectorAll('.task[id]').length : null;
        var c = pageCounts(H, it, liveTotal);
        a.appendChild(bar(H, c, 'statusbar--nav'));
        if (it.track === 'page') a.setAttribute('data-state', stateOf(H.pageKey(it.href)));
      });
    }
    render();
    onChange(render);
  }

  /* ---- emnesiden: hvilke oppgaver står hvor ----------------------------- */

  // Henter oppgavesidene for å kjenne alle oppgavene, også de uten status.
  // Virker over http (localhost, GitHub Pages); fra file:// faller vi tilbake
  // på det som er lagret.
  function fetchTasks(H, item) {
    return fetch(H.abs(item.href), { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        return [].map.call(doc.querySelectorAll('.task[id]'), function (t) {
          var src = t.querySelector('.task__src'), title = t.querySelector('.task__title');
          return {
            key: H.pageKey(item.href) + '#' + t.id,
            href: item.href + '#' + t.id,
            label: src ? src.textContent.trim() : t.id,
            title: title ? title.textContent.trim() : '',
            group: item.title
          };
        });
      });
  }

  function buildSubjectStatus(H) {
    var subject = H.subject;
    var main = document.querySelector('.content__main');
    var header = main && main.querySelector('.page-header');
    var tracked = trackedItems(subject);
    if (!header || !tracked.length) return;

    var section = H.h('section.section.status-overview', { 'aria-labelledby': 'status-oversikt' });
    header.insertAdjacentElement('afterend', section);

    var entries = null;      // alle oppgaver/kapitler når de er hentet
    var partial = false;     // true hvis noen sider ikke kunne hentes
    var expanded = {};
    var open = false;        // oppgavelistene er skjult til du ber om dem
    function toggle(e) {
      // Behold tastaturfokus på knappen du trykket, selv om seksjonen tegnes på nytt
      var col = e.currentTarget.closest('.status-col');
      var sel = col ? '.status-col[data-state="' + col.getAttribute('data-state') + '"] .status-col__toggle' : '.status-overview__toggle';
      open = !open;
      render();
      var again = section.querySelector(sel);
      if (again) again.focus();
    }

    function fromStore() {
      // Kapitler kjenner vi fra emnelisten, oppgaver med status fra lagringen
      var out = [];
      tracked.forEach(function (it) {
        if (it.track === 'page') {
          out.push({ key: H.pageKey(it.href), href: it.href, label: it.part, title: it.title, group: '' });
        } else {
          var prefix = H.pageKey(it.href) + '#';
          Object.keys(data.items).forEach(function (k) {
            if (k.indexOf(prefix) !== 0) return;
            var r = data.items[k];
            out.push({ key: k, href: it.href + '#' + k.slice(prefix.length), label: r.label, title: r.title, group: it.title });
          });
        }
      });
      return out;
    }

    function render() {
      var list = entries || fromStore();
      var c = subjectCounts(H, subject);
      section.innerHTML = '';

      var toggleBtn = H.h('button.status-overview__toggle', {
        type: 'button', 'aria-expanded': String(open), 'aria-controls': 'status-cols',
        text: open ? 'Skjul oppgavene' : 'Vis oppgavene'
      });
      toggleBtn.addEventListener('click', toggle);
      section.appendChild(H.h('div.status-overview__head', {}, [
        H.h('h2.section__label', { id: 'status-oversikt', text: 'Status' }),
        H.h('p.status-overview__sum', { text: c.forstatt + ' av ' + c.total + ' forstått' }),
        toggleBtn
      ]));
      section.appendChild(bar(H, c, 'statusbar--wide'));

      var cols = H.h('div.status-cols', { id: 'status-cols', 'data-open': String(open) });
      STATES.forEach(function (st) {
        var items = list.filter(function (e) { return stateOf(e.key) === st.id; });
        var titleBtn = H.h('button.status-col__toggle', { type: 'button', 'aria-expanded': String(open), 'aria-controls': 'status-cols' }, [
          H.h('span.status-dot', { 'data-state': st.id, 'aria-hidden': 'true' }),
          st.label,
          H.h('span.status-col__count', { text: String(c[st.id]) })
        ]);
        titleBtn.addEventListener('click', toggle);
        var col = H.h('div.status-col', { 'data-state': st.id }, [
          H.h('h3.status-col__title', {}, [titleBtn])
        ]);
        cols.appendChild(col);
        if (!open) return;

        if (!items.length) {
          var emptyText = st.id === 'ikke-gjort' && !entries && c[st.id]
            ? (partial ? 'Kunne ikke hente oppgavelisten. Åpne siden via localhost eller GitHub Pages.' : 'Henter oppgaver …')
            : 'Ingen.';
          col.appendChild(H.h('p.status-col__empty', { text: emptyText }));
        } else {
          var limit = 10;
          var showAll = expanded[st.id] || items.length <= limit + 2;
          var ul = H.h('ul.status-col__list');
          (showAll ? items : items.slice(0, limit)).forEach(function (e) {
            ul.appendChild(H.h('li', {}, [H.h('a', { href: H.abs(e.href) }, [
              H.h('span.status-col__label', { text: e.label + (e.group ? ', ' + e.group.toLowerCase() : '') }),
              H.h('span.status-col__item', { text: e.title })
            ])]));
          });
          col.appendChild(ul);
          if (!showAll) {
            var more = H.h('button.status-col__more', { type: 'button', text: 'Vis alle ' + items.length });
            more.addEventListener('click', function () { expanded[st.id] = true; render(); });
            col.appendChild(more);
          }
        }
      });
      section.appendChild(cols);
    }

    render();
    onChange(render);

    var taskPages = tracked.filter(function (it) { return it.track === 'tasks'; });
    if (!taskPages.length) { entries = fromStore(); render(); return; }
    Promise.all(taskPages.map(function (it) {
      return fetchTasks(H, it).catch(function () { partial = true; return null; });
    })).then(function (results) {
      if (partial) { render(); return; }
      var all = [];
      tracked.forEach(function (it) {
        if (it.track === 'page') {
          all.push({ key: H.pageKey(it.href), href: it.href, label: it.part, title: it.title, group: '' });
        } else {
          all = all.concat(results[taskPages.indexOf(it)] || []);
        }
      });
      entries = all;
      render();
    });
  }

  /* ---- forsiden: fremdrift per emne + sikkerhetskopi -------------------- */

  function buildLanding(H) {
    var hosts = [].slice.call(document.querySelectorAll('[data-progress]'));
    function render() {
      hosts.forEach(function (host) {
        var s = H.SUBJECTS.filter(function (x) { return x.id === host.getAttribute('data-progress'); })[0];
        host.innerHTML = '';
        if (!s || !trackedItems(s).length) return;
        var c = subjectCounts(H, s);
        host.appendChild(bar(H, c));
        var legend = H.h('ul.subject__legend');
        STATES.forEach(function (st) {
          if (st.id === 'ikke-gjort') return;
          legend.appendChild(H.h('li', { title: st.long }, [
            H.h('span.status-dot', { 'data-state': st.id, 'aria-hidden': 'true' }),
            H.h('b', { text: String(c[st.id]) }),
            st.label.toLowerCase()
          ]));
        });
        host.appendChild(legend);
      });
    }
    render();
    onChange(render);

    var content = document.querySelector('.content');
    if (!content) return;
    var fileInput = H.h('input', { type: 'file', accept: 'application/json,.json', hidden: 'hidden' });
    var msg = H.h('p.backup__msg', { role: 'status' });
    var exportBtn = H.h('button.btn.btn--ghost', { type: 'button', text: 'Last ned statusfil' });
    var importBtn = H.h('button.btn.btn--ghost', { type: 'button', text: 'Hent statusfil' });

    exportBtn.addEventListener('click', function () {
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'h26-status-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      msg.textContent = 'Lastet ned ' + Object.keys(data.items).length + ' statuser.';
    });
    importBtn.addEventListener('click', function () { fileInput.click(); });
    fileInput.addEventListener('change', function () {
      var file = fileInput.files[0];
      if (!file) return;
      file.text().then(function (text) {
        var d = JSON.parse(text);
        if (!d || typeof d.items !== 'object') throw new Error('format');
        var n = Object.keys(d.items).length, cur = Object.keys(data.items).length;
        if (!confirm('Erstatte ' + cur + ' lagrede statuser med ' + n + ' fra filen?')) return;
        data = { version: 1, items: d.items };
        persist();
        emit();
        msg.textContent = 'Hentet ' + n + ' statuser fra ' + file.name + '.';
      }).catch(function () {
        msg.textContent = 'Filen er ikke en statusfil fra H26. Velg en fil lastet ned med «Last ned statusfil».';
      }).then(function () { fileInput.value = ''; });
    });

    content.appendChild(H.h('section.backup', { 'aria-labelledby': 'backup-title' }, [
      H.h('h2.backup__title', { id: 'backup-title', text: 'Sikkerhetskopi av statusene' }),
      H.h('p.backup__text', { text: 'Statusene lagres bare i denne nettleseren, og localhost og GitHub Pages har hver sin lagring. Last ned en statusfil for å ta vare på dem eller flytte dem til en annen PC eller adresse.' }),
      H.h('div.backup__actions', {}, [exportBtn, importBtn, fileInput]),
      msg
    ]));
  }

  /* ---- start ------------------------------------------------------------ */

  function warnIfNotSaved(H) {
    var shown = null;
    onChange(function () {
      if (storageOk || shown) return;
      shown = H.h('p.status-warning', { role: 'alert', text: 'Statusen kunne ikke lagres i denne nettleseren (lagring er blokkert). Endringene forsvinner når du lukker siden.' });
      var main = document.querySelector('.content__main') || document.querySelector('.content');
      if (main) main.insertBefore(shown, main.firstChild);
    });
  }

  function start() {
    var H = window.H26;
    if (!H) return;
    warnIfNotSaved(H);
    decorateSidebar(H);
    if (!H.subject) { buildLanding(H); return; }
    if (H.page && H.page.track === 'tasks') decorateTasks(H, H.page);
    else if (H.page && H.page.track === 'page') decorateChapter(H, H.page);
    else if (H.isHere(H.subject.href)) buildSubjectStatus(H);
  }

  if (window.H26 && window.H26.ready) start();
  else document.addEventListener('h26:ready', start);
})();
