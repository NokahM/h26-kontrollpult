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
  chtml: { scale: 0.98 }
};
(function () {
  var s = document.createElement('script');
  s.id = 'MathJax-script';
  s.async = true;
  s.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
  document.head.appendChild(s);
})();
