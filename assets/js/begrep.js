// Begrepsforklaringer i løpende tekst.
//
// <a class="term" href="#b-navn">ord</a> får en stiplet strek under seg (main.css,
// .term). Et klikk viser forklaringen i en boble ved ordet. Teksten hentes fra
// ordlisten på samme side, <dl class="terms"> med <dt id="b-navn"> og en <dd>
// rett etter, så den skrives bare ett sted. Uten skriptet er lenken en vanlig
// ankerlenke ned til ordlisten.
//
// Boblen lukkes med Esc, med et klikk utenfor eller med et nytt klikk på ordet.
// Lenker til andre begrep inne i boblen åpner det begrepet i stedet.
(function () {
  var pop = null;
  var current = null;

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

  function open(a) {
    var dt = document.getElementById(a.getAttribute('href').slice(1));
    var dd = dt && dt.nextElementSibling;
    if (!dd || dd.tagName !== 'DD') return false;
    if (!pop) build();
    if (current) current.setAttribute('aria-expanded', 'false');
    current = a;
    a.setAttribute('aria-expanded', 'true');
    pop.querySelector('.term-pop__title').textContent = dt.firstChild.textContent.trim();
    pop.querySelector('.term-pop__body').innerHTML = dd.innerHTML;
    pop.querySelector('.term-pop__more').setAttribute('href', '#' + dt.id);
    pop.classList.remove('is-open');
    pop.style.display = 'block';
    place();
    void pop.offsetWidth;
    pop.classList.add('is-open');
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
