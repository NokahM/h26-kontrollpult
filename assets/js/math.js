// MathJax 3 loader — shared config for the statistikk task pages.
// Loaded from a CDN so the site keeps its no-build-step setup.
//
// NB: the delimiters must be written with DOUBLE backslashes. In a JavaScript
// string literal '\(' collapses to '(' , which would make MathJax treat plain
// parentheses as math delimiters and mangle every formula on the page.
window.MathJax = {
  tex: {
    inlineMath: [['\\(', '\\)']],
    displayMath: [['\\[', '\\]']],
    processEscapes: true
  },
  options: {
    skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
  },
  chtml: { scale: 0.98 },
  startup: {
    // Visningsformler som får plass innenfor tekstbredden, sentreres over teksten
    // i stedet for over hele kolonnen. Alt står i rem, så det holder å sjekke én gang.
    pageReady: function () {
      return MathJax.startup.defaultPageReady().then(function () {
        document.querySelectorAll('.prose > p').forEach(function (p) {
          var m = p.querySelector(':scope > mjx-container[display="true"]');
          if (!m) return;
          p.classList.add('formula-in-measure');
          if (m.scrollWidth > m.clientWidth + 1) p.classList.remove('formula-in-measure');
        });
      });
    }
  }
};
(function () {
  var s = document.createElement('script');
  s.id = 'MathJax-script';
  s.async = true;
  s.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
  document.head.appendChild(s);
})();
