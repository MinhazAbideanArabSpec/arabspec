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

(function () {
    var canvas = document.querySelector('.hero-canvas');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var band = document.querySelector('.hero-band');
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var particles = [];
    var pulses = [];
    var W = 0, H = 0;
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var maxDist = 130;
    var rafId = null;

    function resize() {
      var rect = band.getBoundingClientRect();
      W = rect.width; H = rect.height;
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function initParticles() {
      var count = Math.min(60, Math.max(20, Math.round((W * H) / 16000)));
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          r: Math.random() < 0.12 ? 2.6 : 1.5
        });
      }
      pulses = [];
    }

    function frame() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x <= 0 || p.x >= W) p.vx *= -1;
        if (p.y <= 0 || p.y >= H) p.vy *= -1;
        p.x = Math.max(0, Math.min(W, p.x));
        p.y = Math.max(0, Math.min(H, p.y));
      }
      var active = [];
      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var a = particles[i], b = particles[j];
          var dx = a.x - b.x, dy = a.y - b.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            var alpha = (1 - dist / maxDist) * 0.38;
            ctx.strokeStyle = 'rgba(198,232,166,' + alpha.toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
            active.push([a, b]);
          }
        }
      }
      if (!reduceMotion && active.length && Math.random() < 0.05 && pulses.length < 5) {
        var pair = active[Math.floor(Math.random() * active.length)];
        pulses.push({ a: pair[0], b: pair[1], t: 0 });
      }
      for (var k = pulses.length - 1; k >= 0; k--) {
        var pu = pulses[k];
        pu.t += 0.02;
        if (pu.t >= 1) { pulses.splice(k, 1); continue; }
        var px = pu.a.x + (pu.b.x - pu.a.x) * pu.t;
        var py = pu.a.y + (pu.b.y - pu.a.y) * pu.t;
        ctx.fillStyle = 'rgba(214,242,120,0.95)';
        ctx.beginPath();
        ctx.arc(px, py, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduceMotion) rafId = requestAnimationFrame(frame);
    }

    function start() {
      resize();
      initParticles();
      if (rafId) cancelAnimationFrame(rafId);
      frame();
    }

    start();
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(start, 150);
    });
  })();