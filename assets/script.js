(function () {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var targets = document.querySelectorAll('.reveal');
    var supportsScrollTimeline = CSS && CSS.supports && CSS.supports('animation-timeline: view()');
    if (reduce || !('IntersectionObserver' in window)) {
      targets.forEach(function (t) { t.classList.add('is-visible'); });
    } else if (!supportsScrollTimeline) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
        });
      }, { threshold: 0.12 });
      targets.forEach(function (t) { io.observe(t); });
    }
  })();