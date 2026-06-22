/* ==========================================================================
   ByteCare — Motion layer (GSAP + ScrollTrigger + Lenis)
   - Smooth scrolling (Lenis) synced to ScrollTrigger
   - Hero: animated abstract "healthcare network" canvas
   - Hero: intro timeline + scroll parallax
   Progressive enhancement: degrades gracefully and respects reduced motion.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // If GSAP didn't load (e.g. offline + vendor missing), reveal pre-hidden
  // hero content by dropping the `.js` flag, then stop.
  if (!window.gsap) {
    root.classList.remove("js");
    return;
  }

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger || null;
  if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------------------------------------------------------------------- *
   * 1. Smooth scrolling (Lenis) + ScrollTrigger sync
   * ---------------------------------------------------------------------- */
  var lenis = null;
  if (!prefersReduced && window.Lenis) {
    lenis = new window.Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
    });
    if (ScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
    }
    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000); // gsap ticker = seconds, Lenis wants ms
    });
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------------------------------------------------------------------- *
   * 2. Smooth anchor links (account for fixed header height)
   * ---------------------------------------------------------------------- */
  var header = document.getElementById("header");
  function headerOffset() {
    return (header ? header.offsetHeight : 72) + 12;
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(target, { offset: -headerOffset() });
      } else {
        var y =
          target.getBoundingClientRect().top +
          window.pageYOffset -
          headerOffset();
        window.scrollTo({
          top: y,
          behavior: prefersReduced ? "auto" : "smooth",
        });
      }
    });
  });

  /* ---------------------------------------------------------------------- *
   * 3. Animated abstract healthcare network (canvas)
   * ---------------------------------------------------------------------- */
  function initHeroCanvas() {
    var canvas = document.querySelector(".hero__canvas");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");

    var PURPLE = "124,58,237"; // --bc-purple
    var ACCENT = "168,85,247"; // --bc-purple-accent
    var INK = "13,13,15"; // --bc-black
    var NODE = INK; // node base color (theme-aware, "R,G,B")

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0;
    var H = 0;
    var nodes = [];
    var caps = [];
    var maxDist = 140;
    var running = false;
    var inView = true;
    var rafId = null;

    var pointer = { x: 0.5, y: 0.4, tx: 0.5, ty: 0.4 };

    function rand(min, max) {
      return Math.random() * (max - min) + min;
    }

    function build() {
      var count = Math.max(14, Math.min(46, Math.round((W * H) / 26000)));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: rand(-0.18, 0.18),
          vy: rand(-0.18, 0.18),
          r: rand(1.2, 2.8),
          glow: Math.random() < 0.18,
        });
      }
      var capCount = W < 640 ? 3 : 6;
      caps = [];
      for (var c = 0; c < capCount; c++) {
        caps.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: rand(-0.12, 0.12),
          vy: rand(-0.12, 0.12),
          len: rand(22, 48),
          th: rand(9, 15),
          a: rand(0, Math.PI),
          va: rand(-0.003, 0.003),
          op: rand(0.05, 0.1),
        });
      }
    }

    function size() {
      var rect = canvas.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width = Math.max(1, Math.floor(W * dpr));
      canvas.height = Math.max(1, Math.floor(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    function wrap(p) {
      var m = 40;
      if (p.x < -m) p.x = W + m;
      else if (p.x > W + m) p.x = -m;
      if (p.y < -m) p.y = H + m;
      else if (p.y > H + m) p.y = -m;
    }

    function roundRect(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    function drawCapsule(x, y, len, th, ang, op) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(ang);
      var r = th / 2;
      var hw = len / 2;
      var grad = ctx.createLinearGradient(-hw, 0, hw, 0);
      grad.addColorStop(0, "rgba(" + PURPLE + "," + op + ")");
      grad.addColorStop(1, "rgba(" + ACCENT + "," + op + ")");
      ctx.fillStyle = grad;
      roundRect(-hw, -r, len, th, r);
      ctx.fill();
      // subtle pill "split" line
      ctx.strokeStyle = "rgba(255,255,255," + (op * 1.4).toFixed(3) + ")";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(0, r);
      ctx.stroke();
      ctx.restore();
    }

    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);

      // eased pointer parallax offset
      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;
      var ox = (pointer.x - 0.5) * 26;
      var oy = (pointer.y - 0.5) * 26;

      // floating capsule motifs (behind the network)
      for (var c = 0; c < caps.length; c++) {
        var p = caps[c];
        p.x += p.vx;
        p.y += p.vy;
        p.a += p.va;
        wrap(p);
        drawCapsule(p.x + ox * 1.5, p.y + oy * 1.5, p.len, p.th, p.a, p.op);
      }

      // connective links
      for (var i = 0; i < nodes.length; i++) {
        var a = nodes[i];
        for (var j = i + 1; j < nodes.length; j++) {
          var b = nodes[j];
          var dx = a.x - b.x;
          var dy = a.y - b.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < maxDist) {
            var al = (1 - d / maxDist) * 0.16;
            ctx.strokeStyle = "rgba(" + PURPLE + "," + al.toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x + ox, a.y + oy);
            ctx.lineTo(b.x + ox, b.y + oy);
            ctx.stroke();
          }
        }
      }

      // nodes
      for (var k = 0; k < nodes.length; k++) {
        var n = nodes[k];
        n.x += n.vx;
        n.y += n.vy;
        wrap(n);
        var px = n.x + ox;
        var py = n.y + oy;
        if (n.glow) {
          var g = ctx.createRadialGradient(px, py, 0, px, py, n.r * 6);
          g.addColorStop(0, "rgba(" + ACCENT + ",0.30)");
          g.addColorStop(1, "rgba(" + ACCENT + ",0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(px, py, n.r * 6, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = n.glow
          ? "rgba(" + PURPLE + ",0.9)"
          : "rgba(" + NODE + ",0.55)";
        ctx.beginPath();
        ctx.arc(px, py, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = requestAnimationFrame(frame);
    }

    function start() {
      if (running) return;
      running = true;
      rafId = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    }
    function update() {
      if (inView && !document.hidden) start();
      else stop();
    }

    // Pointer parallax
    window.addEventListener(
      "pointermove",
      function (e) {
        var rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        pointer.tx = (e.clientX - rect.left) / rect.width;
        pointer.ty = (e.clientY - rect.top) / rect.height;
      },
      { passive: true }
    );

    // Pause when hero scrolls out of view / tab hidden (performance)
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        function (entries) {
          inView = entries[0].isIntersecting;
          update();
        },
        { threshold: 0 }
      ).observe(canvas);
    }
    document.addEventListener("visibilitychange", update);

    // Debounced resize
    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        size();
      }, 200);
    });

    function readNodeColor() {
      var v = getComputedStyle(document.documentElement)
        .getPropertyValue("--bc-node")
        .trim();
      if (v) NODE = v;
    }
    readNodeColor();
    window.addEventListener("themechange", readNodeColor);

    size();
    start();
  }

  /* ---------------------------------------------------------------------- *
   * 4. Hero intro timeline + scroll parallax
   * ---------------------------------------------------------------------- */
  function initHero() {
    var hero = document.querySelector(".hero");
    if (!hero) return;

    if (prefersReduced) {
      // Make sure everything is visible; skip motion.
      gsap.set(hero.querySelectorAll("[data-anim]"), { opacity: 1, y: 0 });
      gsap.set(hero.querySelectorAll(".word"), {
        opacity: 1,
        y: 0,
        yPercent: 0,
      });
      return;
    }

    // Intro timeline
    var tl = gsap.timeline({
      defaults: { ease: "power3.out", duration: 0.85 },
    });

    tl.from(
      ".header .nav__logo",
      { y: -14, opacity: 0, duration: 0.7 },
      0
    )
      .from(
        ".header .nav__menu > *, .header .nav__actions > *",
        { y: -10, opacity: 0, stagger: 0.05, duration: 0.5 },
        0.1
      )
      .fromTo(
        ".hero .badge",
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1 },
        0.15
      )
      .fromTo(
        ".hero__title .word",
        { yPercent: 115, opacity: 0 },
        { yPercent: 0, opacity: 1, stagger: 0.08, duration: 0.95 },
        0.25
      )
      .fromTo(
        ".hero__sub",
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1 },
        "-=0.4"
      )
      .fromTo(
        ".hero__cta",
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1 },
        "-=0.45"
      )
      .fromTo(
        ".hero__trust",
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1 },
        "-=0.45"
      )
      .fromTo(
        ".hero__scroll",
        { opacity: 0 },
        { opacity: 1, duration: 0.6 },
        "-=0.2"
      );

    // Scroll parallax (depth) — only with ScrollTrigger
    if (ScrollTrigger) {
      gsap.to(".hero__canvas", {
        yPercent: 16,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
      gsap.to(".hero__bg", {
        yPercent: 10,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
      gsap.to(".hero__inner", {
        yPercent: -6,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "60% top",
          scrub: true,
        },
      });
    }
  }

  /* ---------------------------------------------------------------------- *
   * Boot
   * ---------------------------------------------------------------------- */
  initHero();
  if (!prefersReduced) initHeroCanvas();

  // Recalculate ScrollTrigger positions once fonts/images settle.
  if (ScrollTrigger) {
    window.addEventListener("load", function () {
      ScrollTrigger.refresh();
    });
  }
})();
