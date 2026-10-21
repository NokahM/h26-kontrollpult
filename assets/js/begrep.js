// Begrepsforklaringer i løpende tekst.
//
// <a class="term" href="ordliste.html#b-navn">ord</a> får en stiplet strek under seg
// (main.css, .term). Et klikk viser forklaringen i en boble ved ordet. Teksten hentes
// fra ordlisten, <dl class="terms"> med <dt id="b-navn"> og en <dd> rett etter, så den
// skrives bare ett sted. Hvert emne har én ordliste (guides/ordliste.html) som hentes
// første gang et ord klikkes og deretter holdes i minnet. Står ordlisten på samme side,
// holder det med href="#b-navn". Uten skriptet er lenken en vanlig lenke til ordlisten.
//
// Boblen lukkes med Esc, med et klikk utenfor eller med et nytt klikk på ordet.
// Lenker til andre begrep inne i boblen åpner det begrepet i stedet.
(function () {
  var pop = null;
  var current = null;
  var docs = {};   // ordliste-URL -> Promise<Document>

  function build() {
    pop = document.createElement('div');
    pop.className = 'term-pop';
    pop.setAttribute('role', 'dialog');
    pop.innerHTML = '<div class="term-pop__title"></div><div class="term-pop__body"></div>' +
      '<a class="term-pop__more">Se i ordlisten</a>';
    pop.querySelector('.term-pop__more').addEventListener('click', function () { close(false); });
    document.body.appendChild(pop);
  }

  function place() {
    if (!current) return;
    var r = current.getBoundingClientRect();
    var w = pop.offsetWidth, h = pop.offsetHeight, gap = 10, pad = 16;
    var left = Math.max(pad, Math.min(r.left + r.width / 2 - w / 2, window.innerWidth - w - pad));
    var above = r.bottom + gap + h > window.innerHeight - pad && r.top - gap - h > pad;
    pop.classList.toggle('term-pop--above', above);
    pop.style.left = left + 'px';
    pop.style.top = (above ? r.top - gap - h : r.bottom + gap) + 'px';
    pop.style.setProperty('--arrow-x', Math.max(14, Math.min(r.left + r.width / 2 - left, w - 14)) + 'px');
  }

  // Delt opp i side og anker. page er '' når ordlisten står på denne siden.
  function target(a) {
    var url = new URL(a.getAttribute('href'), location.href);
    var here = url.origin + url.pathname === location.origin + location.pathname;
    return { page: here ? '' : url.origin + url.pathname, id: url.hash.slice(1) };
  }

  function load(page) {
    if (!page) return Promise.resolve(document);
    if (!docs[page]) {
      docs[page] = fetch(page).then(function (res) {
        if (!res.ok) throw new Error(res.status);
        return res.text();
      }).then(function (html) {
        return new DOMParser().parseFromString(html, 'text/html');
      });
      docs[page].catch(function () { delete docs[page]; });
    }
    return docs[page];
  }

  function show(a, t, doc) {
    var dt = doc.getElementById(t.id);
    var dd = dt && dt.nextElementSibling;
    if (!dd || dd.tagName !== 'DD') return false;
    if (!pop) build();
    if (current) current.setAttribute('aria-expanded', 'false');
    current = a;
    a.setAttribute('aria-expanded', 'true');
    var body = pop.querySelector('.term-pop__body');
    pop.querySelector('.term-pop__title').textContent = dt.firstChild.textContent.trim();
    body.innerHTML = dd.innerHTML;
    if (t.page) {
      // Ankere i en hentet ordliste peker inn i den, ikke inn i denne siden.
      body.querySelectorAll('a[href^="#"]').forEach(function (l) {
        l.setAttribute('href', t.page + l.getAttribute('href'));
      });
    }
    var more = pop.querySelector('.term-pop__more');
    more.setAttribute('href', t.page + '#' + dt.id);
    more.classList.toggle('term-pop__more--away', !!t.page);
    pop.classList.remove('is-open');
    pop.style.display = 'block';
    place();
    void pop.offsetWidth;
    pop.classList.add('is-open');
    return true;
  }

  function open(a) {
    var t = target(a);
    if (!t.page) return show(a, t, document);
    // Hentes ordlisten ikke, følges lenken som vanlig.
    load(t.page).then(function (doc) {
      if (!show(a, t, doc)) location.href = a.href;
    }, function () { location.href = a.href; });
    return true;
  }

  function close(refocus) {
    if (!current) return;
    current.setAttribute('aria-expanded', 'false');
    if (refocus) current.focus();
    current = null;
    pop.classList.remove('is-open');
    pop.style.display = 'none';
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a.term');
    if (a) {
      if (e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (a === current) { e.preventDefault(); close(false); }
      else if (open(a)) e.preventDefault();
      return;
    }
    if (current && !pop.contains(e.target)) close(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && current) close(true);
  });
  window.addEventListener('resize', place);
  window.addEventListener('scroll', place, true);

  document.querySelectorAll('a.term').forEach(function (a) {
    a.setAttribute('aria-expanded', 'false');
    a.setAttribute('aria-haspopup', 'dialog');
  });
})();
