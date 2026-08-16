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

    // animated count-up stats
    var counters = document.querySelectorAll('[data-count]');
    function animateCounter(node) {
      var target = parseFloat(node.dataset.count);
      if (reduce) { node.textContent = target; return; }
      var start = null, dur = 1300;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        node.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(step); else node.textContent = target;
      }
      requestAnimationFrame(step);
    }
    if (counters.length) {
      if ('IntersectionObserver' in window) {
        var cio = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) { animateCounter(entry.target); cio.unobserve(entry.target); }
          });
        }, { threshold: 0.4 });
        counters.forEach(function (c) { cio.observe(c); });
      } else {
        counters.forEach(function (c) { c.textContent = c.dataset.count; });
      }
    }

    // hero particle network — a moving graphic tying nodes together, echoing the regional map
    var canvas = document.getElementById('hero-canvas');
    if (canvas && canvas.getContext) {
      var ctx = canvas.getContext('2d');
      var band = canvas.closest('.hero-band');
      var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
      var particles = [];
      var COUNT = 46;
      var LINK_DIST = 140;

      function resize() {
        W = band.clientWidth; H = band.clientHeight;
        canvas.width = W * dpr; canvas.height = H * dpr;
        canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      function seed() {
        particles = [];
        for (var i = 0; i < COUNT; i++) {
          particles.push({
            x: Math.random() * W, y: Math.random() * H,
            vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22
          });
        }
      }
      function frame() {
        ctx.clearRect(0, 0, W, H);
        for (var i = 0; i < particles.length; i++) {
          var p = particles[i];
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > W) p.vx *= -1;
          if (p.y < 0 || p.y > H) p.vy *= -1;
          for (var j = i + 1; j < particles.length; j++) {
            var q = particles[j];
            var dx = p.x - q.x, dy = p.y - q.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < LINK_DIST) {
              ctx.strokeStyle = 'rgba(27,74,12,' + (0.22 * (1 - dist / LINK_DIST)) + ')';
              ctx.lineWidth = 1;
              ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
            }
          }
          ctx.fillStyle = 'rgba(27,74,12,0.5)';
          ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2); ctx.fill();
        }
        if (!reduce) requestAnimationFrame(frame);
      }

      resize(); seed(); frame();
      window.addEventListener('resize', function () { resize(); seed(); if (reduce) frame(); });
    }
  })();