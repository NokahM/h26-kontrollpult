// Strømanimasjon i kretsskjemaer (Fysikk 2).
//
// Strømbanene i en figur er tegnet i referanseretningen med fargene f01, f02 …
// (assets/tikz/krets.tex), og build.py gjør dem om til <path class="flow f01">.
// CSS (main.css, .stromfig) tegner banene som prikker som glir langs stien.
// Dette skriptet setter farten ut fra strømstyrken og snur retningen når
// strømmen er negativ, for hver tilstand (knapp) i figuren.
//
// <div class="stromfig" data-hidden data-scale="0.9" data-modes='{"b": {"view": "a",
//      "i": {"f01": 33, "f02": -12}, "tekst": "…"}}'>
//   <div class="stromfig__view" data-view="a"> <svg …> </div>
//   <div class="stromfig__bar"> <button data-mode="b">…</button> <button class="stromfig__toggle">…</button> </div>
//   <p class="stromfig__cap"></p>
// </div>
//
// data-scale er fart i pt/s per enhet strøm, og strøm 0 skjuler banen.
// data-hidden: strømmen er skjult til «Vis strøm» trykkes (standard på
// oppgavesidene, så svaret ikke vises før man vil). assets/tikz/strom.py lager
// innpakningen på oppgavesidene.
(function () {
  var GAP = 8;  // avstand mellom prikkene i pt (samme som stroke-dasharray i CSS)

  function setup(fig) {
    var modes;
    try { modes = JSON.parse(fig.getAttribute('data-modes')); } catch (e) { return; }
    var scale = parseFloat(fig.getAttribute('data-scale')) || 1;
    var buttons = fig.querySelectorAll('[data-mode]');
    var views = fig.querySelectorAll('.stromfig__view');
    var cap = fig.querySelector('.stromfig__cap');
    var toggle = fig.querySelector('.stromfig__toggle');

    function show(name) {
      var m = modes[name];
      if (!m) return;
      views.forEach(function (v) { v.hidden = v.getAttribute('data-view') !== m.view; });
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-mode') === name ? 'true' : 'false'); });
      fig.querySelectorAll('.stromfig__view:not([hidden]) .flow').forEach(function (p) {
        var key = (p.getAttribute('class').match(/\bf\d\d\b/) || [])[0];
        var i = (m.i && key in m.i) ? m.i[key] : 0;
        if (!i) { p.classList.add('is-off'); return; }
        p.classList.remove('is-off');
        p.style.animationDuration = (GAP / (scale * Math.abs(i))).toFixed(3) + 's';
        p.style.animationDirection = i < 0 ? 'reverse' : 'normal';
      });
      if (cap) cap.textContent = m.tekst || '';
    }

    function setHidden(hidden) {
      if (hidden) fig.setAttribute('data-hidden', ''); else fig.removeAttribute('data-hidden');
      if (toggle) {
        toggle.textContent = hidden ? 'Vis strøm' : 'Skjul strøm';
        toggle.setAttribute('aria-pressed', hidden ? 'false' : 'true');
      }
    }

    buttons.forEach(function (b) {
      b.addEventListener('click', function () { show(b.getAttribute('data-mode')); });
    });
    if (toggle) toggle.addEventListener('click', function () { setHidden(!fig.hasAttribute('data-hidden')); });

    // Med «reduser bevegelse» i systemet starter alle figurene skjult
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    setHidden(fig.hasAttribute('data-hidden') || reduce);
    var first = buttons.length ? buttons[buttons.length - 1].getAttribute('data-mode') : Object.keys(modes)[0];
    show(fig.getAttribute('data-start') || first);
  }

  function start() { document.querySelectorAll('.stromfig').forEach(setup); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
