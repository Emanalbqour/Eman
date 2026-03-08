(() => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const prepareHeroTitleHover = () => {
    const titles = document.querySelectorAll(".hero__title, .works__title");
    if (titles.length === 0) return;

    titles.forEach((title) => {
      if (title.dataset.splitReady === "true") return;

      let charIndex = 0;

      const splitNode = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const fragment = document.createDocumentFragment();

          Array.from(node.textContent || "").forEach((character) => {
            const span = document.createElement("span");
            span.className = "hero__titleChar";
            span.style.setProperty("--char-index", String(charIndex));
            span.textContent = character;
            fragment.append(span);
            charIndex += 1;
          });

          return fragment;
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
          const clone = node.cloneNode(false);
          node.childNodes.forEach((childNode) => {
            clone.append(splitNode(childNode));
          });
          return clone;
        }

        return document.createTextNode("");
      };

      const fragment = document.createDocumentFragment();
      title.childNodes.forEach((childNode) => {
        fragment.append(splitNode(childNode));
      });

      title.replaceChildren(fragment);
      title.dataset.splitReady = "true";
    });
  };

  prepareHeroTitleHover();

  const createNetworkBackground = () => {
    const canvas = document.createElement("canvas");
    canvas.className = "bg-network";
    canvas.setAttribute("aria-hidden", "true");
    document.body.prepend(canvas);

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) {
      canvas.remove();
      return;
    }

    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let dots = [];

    const getDotCount = () => Math.min(28, Math.max(14, Math.round(window.innerWidth / 90)));

    const makeDot = () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      radius: 2.2 + Math.random() * 2.8,
      pulse: Math.random() * Math.PI * 2,
    });

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      dots = Array.from({ length: getDotCount() }, makeDot);
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);

      const gradient = context.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "rgba(129, 170, 138, 0.09)");
      gradient.addColorStop(0.5, "rgba(145, 184, 154, 0.035)");
      gradient.addColorStop(1, "rgba(129, 170, 138, 0)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      for (let i = 0; i < dots.length; i += 1) {
        const dot = dots[i];
        dot.x += dot.vx;
        dot.y += dot.vy;
        dot.pulse += 0.02;

        if (dot.x < -26 || dot.x > width + 26) dot.vx *= -1;
        if (dot.y < -26 || dot.y > height + 26) dot.vy *= -1;

        for (let j = i + 1; j < dots.length; j += 1) {
          const other = dots[j];
          const dx = other.x - dot.x;
          const dy = other.y - dot.y;
          const distance = Math.hypot(dx, dy);

          if (distance > 240) continue;

          const alpha = (1 - distance / 240) * 0.3;
          context.strokeStyle = `rgba(123, 161, 133, ${alpha})`;
          context.lineWidth = 1.15;
          context.beginPath();
          context.moveTo(dot.x, dot.y);
          context.lineTo(other.x, other.y);
          context.stroke();
        }

        const glow = 0.88 + Math.sin(dot.pulse) * 0.24;
        context.fillStyle = `rgba(137, 178, 147, ${0.42 + glow * 0.24})`;
        context.beginPath();
        context.arc(dot.x, dot.y, dot.radius * glow, 0, Math.PI * 2);
        context.fill();

        context.fillStyle = "rgba(198, 226, 205, 0.95)";
        context.beginPath();
        context.arc(dot.x, dot.y, Math.max(1.2, dot.radius * 0.48), 0, Math.PI * 2);
        context.fill();
      }

      animationFrame = window.requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pagehide", () => window.cancelAnimationFrame(animationFrame), { once: true });
  };

  const homeIntro = {
    section: document.querySelector(".hero[data-reveal]"),
    media: document.querySelector(".hero__media"),
    photoWrap: document.querySelector(".hero__photoWrap"),
    identity: document.querySelector(".hero__identity"),
    title: document.querySelector(".hero__title"),
    subtitleGroup: document.querySelector(".hero__subtitleGroup"),
    meta: document.querySelector(".hero__meta"),
    actions: document.querySelector(".hero__actions"),
  };
  const hasHomeIntroSequence = Object.values(homeIntro).every(Boolean);

  const worksIntro = {
    section: document.querySelector(".works[data-reveal]"),
    card: document.querySelector(".card"),
    media: document.querySelector(".card__media"),
    image: document.querySelector(".card__image"),
    content: document.querySelector(".card__content"),
    text: document.querySelector(".card__text"),
    action: document.querySelector(".card .button"),
  };
  const hasWorksIntroSequence = Object.values(worksIntro).every(Boolean);

  const statCounters = Array.from(document.querySelectorAll(".meta__count[data-count-to]"));

  const setFinalCounterValues = () => {
    statCounters.forEach((counter) => {
      const target = Number(counter.dataset.countTo || counter.textContent || 0);
      const decimals = Number(counter.dataset.countDecimals || 0);
      counter.textContent = target.toFixed(decimals);
      counter.style.transform = "scale(1)";
    });
  };

  const animateStatCounters = () => {
    if (!window.gsap || statCounters.length === 0) return;

    statCounters.forEach((counter) => {
      if (counter.dataset.countAnimated === "true") return;

      counter.dataset.countAnimated = "true";

      const target = Number(counter.dataset.countTo || counter.textContent || 0);
      const decimals = Number(counter.dataset.countDecimals || 0);
      const duration = Number(counter.dataset.countDuration || 1);
      const state = { value: 0 };

      gsap.fromTo(counter, { scale: 0.76, opacity: 0.72 }, { duration: 0.65, scale: 1, opacity: 1, ease: "back.out(1.9)" });
      gsap.to(state, {
        duration,
        value: target,
        ease: "power2.out",
        onUpdate: () => {
          counter.textContent = state.value.toFixed(decimals);
        },
        onComplete: () => {
          counter.textContent = target.toFixed(decimals);
        },
      });
    });
  };

  const showHomeIntroImmediately = () => {
    if (!hasHomeIntroSequence) return;

    homeIntro.section.style.opacity = "1";
    homeIntro.section.style.transform = "none";

    [homeIntro.media, homeIntro.identity, homeIntro.title, homeIntro.subtitleGroup, homeIntro.meta, homeIntro.actions].forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });

    homeIntro.photoWrap.style.opacity = "1";
    homeIntro.photoWrap.style.transform = "none";
    homeIntro.photoWrap.style.filter = "none";
    homeIntro.photoWrap.style.clipPath = "none";
  };

  const showWorksIntroImmediately = () => {
    if (!hasWorksIntroSequence) return;

    worksIntro.section.style.opacity = "1";
    worksIntro.section.style.transform = "none";
    worksIntro.card.style.opacity = "1";
    worksIntro.card.style.transform = "none";
    worksIntro.media.style.opacity = "1";
    worksIntro.media.style.transform = "none";
    worksIntro.content.style.opacity = "1";
    worksIntro.content.style.transform = "none";
    worksIntro.text.style.opacity = "1";
    worksIntro.text.style.transform = "none";
    worksIntro.action.style.opacity = "1";
    worksIntro.action.style.transform = "none";
    worksIntro.image.style.opacity = "1";
    worksIntro.image.style.transform = "none";
    worksIntro.image.style.filter = "none";
    worksIntro.image.style.clipPath = "none";
  };

  const revealAllTargetsImmediately = () => {
    document.querySelectorAll("[data-reveal]").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    showHomeIntroImmediately();
    showWorksIntroImmediately();
  };

  const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    setFinalCounterValues();
    revealAllTargetsImmediately();
    return;
  }

  createNetworkBackground();

  const overlay = document.querySelector(".transition");
  const veil = overlay?.querySelector(".transition__veil");
  const barTop = overlay?.querySelector(".transition__bar--top");
  const barBottom = overlay?.querySelector(".transition__bar--bottom");
  const revealTargets = Array.from(document.querySelectorAll("[data-reveal]"));

  const setOverlayHidden = () => {
    if (!overlay) return;
    overlay.style.pointerEvents = "none";
  };

  const setOverlayBlocking = () => {
    if (!overlay) return;
    overlay.style.pointerEvents = "auto";
  };

  const intro = () => {
    if (!overlay || !veil || !barTop || !barBottom) {
      setFinalCounterValues();
      revealAllTargetsImmediately();
      return;
    }

    gsap.set(overlay, { opacity: 1 });
    gsap.set(veil, { opacity: 1 });
    gsap.set([barTop, barBottom], { y: 0 });

    if (hasHomeIntroSequence) {
      gsap.set(homeIntro.section, { opacity: 1, y: 0 });
    }
    if (hasWorksIntroSequence) {
      gsap.set(worksIntro.section, { opacity: 1, y: 0 });
    }

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        gsap.set(overlay, { opacity: 0 });
        setOverlayHidden();
      },
    });

    // "Opening credits" vibe: quick focus-in + letterbox leaving the frame
    tl.to(veil, { duration: 0.55, opacity: 0, ease: "power2.out" }, 0)
      .to(barTop, { duration: 0.9, y: "-110%", ease: "power4.inOut" }, 0.1)
      .to(barBottom, { duration: 0.9, y: "110%", ease: "power4.inOut" }, 0.1);

    if (hasHomeIntroSequence) {
      tl.to(homeIntro.media, { duration: 0.75, opacity: 1, y: 0, ease: "power3.out" }, 0.34)
        .to(
          homeIntro.photoWrap,
          { duration: 1.05, clipPath: "inset(0% 0% 0% 0% round 0px)", scale: 1, filter: "blur(0px) saturate(1)", ease: "power4.out" },
          0.34,
        )
        .to(homeIntro.identity, { duration: 0.58, opacity: 1, y: 0, ease: "power3.out" }, 0.82)
        .to([homeIntro.title, homeIntro.subtitleGroup], { duration: 0.72, opacity: 1, y: 0, stagger: 0.12, ease: "power3.out" }, 1.02)
        .to(homeIntro.meta, { duration: 0.78, opacity: 1, y: 0, scale: 1, ease: "power3.out" }, 1.24)
        .add(() => {
          animateStatCounters();
        }, 1.34)
        .to(homeIntro.actions, { duration: 0.62, opacity: 1, y: 0, ease: "power3.out" }, 1.42);
    } else if (hasWorksIntroSequence) {
      tl.to(worksIntro.card, { duration: 0.72, opacity: 1, y: 0, ease: "power3.out" }, 0.36)
        .to(worksIntro.media, { duration: 0.68, opacity: 1, x: 0, ease: "power3.out" }, 0.42)
        .to(
          worksIntro.image,
          { duration: 1, clipPath: "inset(0% 0% 0% 0% round 0px)", scale: 1, filter: "blur(0px) saturate(1)", ease: "power4.out" },
          0.42,
        )
        .to(worksIntro.content, { duration: 0.64, opacity: 1, y: 0, ease: "power3.out" }, 0.92)
        .to(worksIntro.text, { duration: 0.66, opacity: 1, y: 0, ease: "power3.out" }, 1.06)
        .to(worksIntro.action, { duration: 0.58, opacity: 1, y: 0, ease: "power3.out" }, 1.24);
    } else {
      tl.to(
        revealTargets,
        { duration: 0.9, opacity: 1, y: 0, stagger: 0.08, ease: "power3.out" },
        0.35,
      );
    }

    // Subtle "cinema" micro-motion
    tl.fromTo(
      document.body,
      { filter: "blur(6px) saturate(1.08)", transform: "scale(1.01)" },
      { duration: 0.9, filter: "blur(0px) saturate(1)", transform: "scale(1)", ease: "power3.out" },
      0,
    );

    return tl;
  };

  const outroAndNavigate = (href) => {
    if (!overlay || !veil || !barTop || !barBottom) {
      window.location.href = href;
      return;
    }

    setOverlayBlocking();
    gsap.set(overlay, { opacity: 1 });
    gsap.set(veil, { opacity: 0 });

    const tl = gsap.timeline({
      defaults: { ease: "power4.inOut" },
      onComplete: () => {
        window.location.href = href;
      },
    });

    tl.to(revealTargets, { duration: 0.35, opacity: 0, y: 8, stagger: 0.04, ease: "power2.in" }, 0)
      .to(veil, { duration: 0.35, opacity: 1, ease: "power2.in" }, 0.08)
      .fromTo(barTop, { y: "-110%" }, { duration: 0.7, y: 0 }, 0.05)
      .fromTo(barBottom, { y: "110%" }, { duration: 0.7, y: 0 }, 0.05);

    gsap.to(document.body, { duration: 0.45, filter: "blur(8px) saturate(1.04)", ease: "power2.in" });

    return tl;
  };

  // Run intro as soon as GSAP is available
  if (window.gsap) {
    intro();
  } else {
    // Very small fallback in case CDN is blocked
    setFinalCounterValues();
    revealAllTargetsImmediately();
    if (overlay) overlay.style.display = "none";
  }

  // Intercept internal navigation to play cinematic outro
  document.addEventListener("click", (e) => {
    const anchor = e.target?.closest?.("a[data-transition]");
    if (!anchor) return;

    const href = anchor.getAttribute("href");
    if (!href) return;

    const isExternal = /^https?:\/\//i.test(href);
    if (isExternal) return;

    // Same-page anchor or same file
    if (href.startsWith("#")) return;
    if (href === window.location.pathname.split("/").pop()) return;

    e.preventDefault();
    outroAndNavigate(href);
  });
})();
