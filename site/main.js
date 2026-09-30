// Single restrained reveal: section headings fade up once on first entry.
// No scroll hijacking, no pinning, no parallax, no custom cursor.
// Fully disabled under prefers-reduced-motion (also handled in CSS).

(function () {
  "use strict";

  var headings = Array.prototype.slice.call(
    document.querySelectorAll("main .section h2")
  );

  if (!headings.length) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  // If the visitor prefers reduced motion, do not set up any observer at all.
  if (reduce.matches) return;

  headings.forEach(function (el) {
    el.classList.add("reveal");
  });

  if (!("IntersectionObserver" in window)) {
    headings.forEach(function (el) {
      el.classList.add("is-in");
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
  );

  headings.forEach(function (el) {
    observer.observe(el);
  });
})();
