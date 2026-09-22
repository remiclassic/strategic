(() => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('#primary-nav');
  const closeMenu = () => { nav?.classList.remove('open'); toggle?.setAttribute('aria-expanded', 'false'); };
  toggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav?.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav?.classList.contains('open')) { closeMenu(); toggle.focus(); }
  });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
  const desktop = matchMedia('(min-width:801px)');
  desktop.addEventListener('change', closeMenu);
  const motion = document.querySelector('.motion-toggle');
  if (motion) {
    motion.hidden = false;
    motion.addEventListener('click', () => {
      const paused = document.body.classList.toggle('is-paused');
      motion.setAttribute('aria-pressed', String(paused));
      motion.textContent = paused ? 'Play motion ▷' : 'Pause motion Ⅱ';
    });
    const hero = document.querySelector('.hero-canvas');
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        hero.style.setProperty('--visible', entries[0].isIntersecting ? 'running' : 'paused');
      }).observe(hero);
    }
  }
  const filters = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('[data-status]')];
  function filterProducts(value) {
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === value)));
    cards.forEach(card => { card.hidden = value !== 'all' && card.dataset.status !== value; });
    const status = document.querySelector('#filter-status');
    if (status) status.textContent = `${cards.filter(card => !card.hidden).length} ${cards.filter(card => !card.hidden).length === 1 ? "tool" : "tools"} shown`;
  }
  filters.forEach(button => button.addEventListener('click', () => filterProducts(button.dataset.filter)));
  window.addEventListener('hashchange', () => { if (location.hash === '#map-editor') filterProducts('all'); });
})();

// Reuse the original hero's organic photo trail in the studio call to action.
(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const photoURL = new URL("images/contact-sloth.webp?v=low-poly-cube", document.currentScript.src).href;
  const bindContactReveal = (hero) => {
    const canvas = document.createElement("canvas");
    canvas.className = "contact-reveal";
    canvas.setAttribute("aria-hidden", "true");
    const art = hero;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches || reduced.matches) return;
    hero.prepend(canvas);

    const ctx = canvas.getContext("2d");
    const stamp = document.createElement("canvas");
    const stampCtx = stamp.getContext("2d");
    const collage = document.createElement("canvas");
    const collageCtx = collage.getContext("2d");
    if (!ctx || !stampCtx || !collageCtx) return;

    const sources = [photoURL];
    const photos = sources.map((src) => {
      const image = new Image();
      image.src = src;
      return image;
    });

    let raf = 0;
    let last = 0;
    let seen = 0;
    let speed = 0;
    let phase = 0;
    let previous = null;
    let nextPoint = null;
    const blobs = [];

    const cover = (context, image, x, y, w, h, ox = 0.7, oy = 0.42) => {
      if (!image.naturalWidth || !image.naturalHeight) return;
      const scale = Math.max(w / image.naturalWidth, h / image.naturalHeight);
      const dw = image.naturalWidth * scale;
      const dh = image.naturalHeight * scale;
      context.drawImage(image, x + (w - dw) * ox, y + (h - dh) * oy, dw, dh);
    };

    const layout = () => {
      const rect = art.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.round(rect.width * dpr));
      const height = Math.max(1, Math.round(rect.height * dpr));
      if (width < 2 || height < 2) return;
      canvas.width = collage.width = width;
      canvas.height = collage.height = height;
      stamp.width = Math.max(1, Math.round(rect.width / 3));
      stamp.height = Math.max(1, Math.round(rect.height / 3));
      collageCtx.clearRect(0, 0, collage.width, collage.height);
      cover(collageCtx, photos[0], 0, 0, collage.width, collage.height, 0.5, 0.28);
      // Fine paired diagonal strokes, revealed and faded with the photo.
      collageCtx.save();
      collageCtx.scale(dpr, dpr);
      collageCtx.lineWidth = 0.8;
      for (const [offset, color] of [[0, 'rgba(65, 96, 65, 0.42)'], [1, 'rgba(245, 244, 239, 0.25)']]) {
        collageCtx.strokeStyle = color;
        collageCtx.beginPath();
        for (let x = -rect.height + offset; x < rect.width; x += 5) {
          collageCtx.moveTo(x, 0);
          collageCtx.lineTo(x + rect.height, rect.height);
        }
        collageCtx.stroke();
      }
      collageCtx.restore();
    };

    const clear = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
      previous = nextPoint = null;
      speed = phase = 0;
      blobs.length = 0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const paint = (now) => {
      stampCtx.clearRect(0, 0, stamp.width, stamp.height);
      stampCtx.save();
      stampCtx.filter = "blur(3px)";
      for (let i = blobs.length - 1; i >= 0; i -= 1) {
        const blob = blobs[i];
        const age = (now - blob.born) / 1700;
        if (age >= 1) {
          blobs.splice(i, 1);
          continue;
        }
        const grow = 1 - Math.exp(-(4.2 * age));
        const wobblePhase = blob.phase + 2.4 * age;
        const drift = grow * blob.speed * 14;
        const sway = Math.sin(blob.phase + 3.5 * age) * grow * 13;
        const x = blob.x + Math.cos(blob.angle) * drift - Math.sin(blob.angle) * sway;
        const y = blob.y + Math.sin(blob.angle) * drift + Math.cos(blob.angle) * sway;
        const radius = blob.radius * (0.09 + 1.4 * grow);
        stampCtx.save();
        stampCtx.translate(x, y);
        stampCtx.rotate(blob.angle);
        stampCtx.scale(1 + 0.35 * blob.speed, 1 - 0.18 * blob.speed);
        stampCtx.beginPath();
        for (let step = 0; step <= 72; step += 1) {
          const turn = (step / 72) * Math.PI * 2;
          const wobble = 1
            + 0.22 * Math.sin(3 * turn + wobblePhase)
            + 0.14 * Math.cos(5 * turn - 1.3 * wobblePhase)
            + 0.08 * Math.sin(7 * turn + 0.7 * wobblePhase);
          const px = Math.cos(turn) * radius * wobble;
          const py = Math.sin(turn) * radius * wobble;
          if (step === 0) stampCtx.moveTo(px, py);
          else stampCtx.lineTo(px, py);
        }
        stampCtx.closePath();
        const fade = Math.max(0, (age - 0.2) / 0.8);
        stampCtx.fillStyle = `rgba(255,255,255,${(0.65 * (1 - fade) ** 2).toFixed(3)})`;
        stampCtx.fill();
        stampCtx.restore();
      }
      stampCtx.restore();

      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(collage, 0, 0);
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(stamp, 0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "source-over";
    };

    const frame = (now) => {
      raf = 0;
      const dt = last ? Math.min(now - last, 100) : 16;
      last = now;
      if (nextPoint) {
        const from = previous || nextPoint;
        const distance = Math.hypot(nextPoint.x - from.x, nextPoint.y - from.y);
        speed += (Math.min(1, (3 * distance) / Math.max(dt, 1)) - speed) * 0.25;
        const angle = Math.atan2(nextPoint.y - from.y, nextPoint.x - from.x);
        const steps = Math.min(6, Math.max(1, Math.ceil(distance / 14)));
        const width = art.getBoundingClientRect().width;
        for (let step = 1; step <= steps; step += 1) {
          phase += (distance / steps) * 0.025;
          blobs.push({
            x: from.x + ((nextPoint.x - from.x) * step) / steps,
            y: from.y + ((nextPoint.y - from.y) * step) / steps,
            born: now,
            angle,
            speed,
            phase,
            radius: Math.min(100 + 35 * speed, 0.13 * width) / 3
          });
        }
        if (blobs.length > 120) blobs.splice(0, blobs.length - 120);
        previous = nextPoint;
        nextPoint = null;
      }
      paint(now);
      if (now - seen < 2400) raf = requestAnimationFrame(frame);
      else clear();
    };

    const onMove = (event) => {
      if (event.pointerType === "touch" || document.hidden || reduced.matches || !fine.matches) return;
      const rect = art.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      if (canvas.width !== Math.round(rect.width * dpr) || canvas.height !== Math.round(rect.height * dpr)) layout();
      const now = performance.now();
      if (now - seen > 140) {
        previous = null;
        speed = 0;
      }
      nextPoint = {
        x: (event.clientX - rect.left) / 3,
        y: (event.clientY - rect.top) / 3
      };
      seen = now;
      if (!raf) raf = requestAnimationFrame(frame);
    };

    layout();
    photos.forEach((image) => image.addEventListener("load", layout));
    new ResizeObserver(layout).observe(art);
    hero.addEventListener("pointermove", onMove);
    hero.addEventListener("pointerleave", clear);
    hero.addEventListener("pointercancel", clear);
    reduced.addEventListener("change", clear);
    fine.addEventListener("change", clear);
    document.addEventListener("visibilitychange", clear);
    window.addEventListener("scroll", clear, { passive: true });
    window.addEventListener("resize", () => {
      clear();
      layout();
    });
  };

  document.querySelectorAll(".contact-band").forEach(bindContactReveal);
})();

// Keep an enquiry draft locally; an email handoff is not a confirmed send.
(() => {
  const form = document.querySelector('[data-enquiry-form]');
  if (!form) return;
  const key = 'strategicsloth.project-enquiry.v1';
  const fields = [...form.querySelectorAll('input[name], textarea[name]')];
  const status = form.querySelector('[data-draft-status]');
  const sendStatus = form.querySelector('[data-send-status]');
  const clear = form.querySelector('[data-clear-draft]');
  const email = form.elements.namedItem('email');
  const emailConfirm = form.elements.namedItem('emailConfirm');
  const humanConfirm = form.querySelector('[data-human-confirm]');
  const validateEmails = () => {
    const matches = email.value.trim().toLowerCase() === emailConfirm.value.trim().toLowerCase();
    emailConfirm.setCustomValidity(matches ? '' : 'Please enter the same email address in both fields.');
  };
  // Browsers may restore checkbox state when navigating back; require a fresh check.
  humanConfirm.checked = false;
  window.addEventListener('pageshow', () => { humanConfirm.checked = false; });
  const values = () => Object.fromEntries(fields.map(field => [field.name, field.value]));
  const save = () => {
    try {
      localStorage.setItem(key, JSON.stringify(values()));
      status.textContent = 'Draft saved in this browser.';
    } catch {
      status.textContent = 'This browser couldn’t save your draft. Keep this page open or copy your text before leaving.';
    }
  };
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const draft = JSON.parse(raw);
      if (draft && typeof draft === 'object' && !Array.isArray(draft)) {
        fields.forEach(field => {
          if (typeof draft[field.name] === 'string') field.value = draft[field.name].slice(0, field.maxLength);
        });
        status.textContent = 'Your saved draft has been restored.';
      }
    }
  } catch {
    status.textContent = 'Your saved draft couldn’t be loaded. Keep a copy of your text before leaving.';
  }
  fields.forEach(field => {
    field.addEventListener('input', save);
    field.addEventListener('change', save);
  });
  clear.addEventListener('click', () => {
    if (!window.confirm('Clear your saved project enquiry?')) return;
    try {
      localStorage.removeItem(key);
    } catch {
      status.textContent = 'This browser couldn’t clear the saved draft. Your text has been kept.';
      return;
    }
    form.reset();
    status.textContent = 'Draft cleared.';
    sendStatus.textContent = 'Review and send your enquiry in your email app.';
    fields[0].focus();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    fields.forEach(field => field.setCustomValidity(field.value.trim() ? '' : 'Please fill out this field.'));
    validateEmails();
    if (!form.reportValidity()) return;
    save();
    const draft = values();
    const subject = '[StrategicSloth] ' + draft.subject.trim().replace(/[\r\n]+/g, ' ');
    const body = `Name: ${draft.name.trim()}\nEmail: ${draft.email.trim()}\n\n${draft.message.trim()}`;
    sendStatus.textContent = 'Your email draft is ready to open. Send it from your email app; your browser draft is still saved. If no app opens, copy your details and email privacy@strategicsloth.com.';
    window.location.href = `mailto:privacy@strategicsloth.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
  fields.forEach(field => field.addEventListener('input', () => {
    field.setCustomValidity('');
    if (field === email || field === emailConfirm) validateEmails();
  }));
  form.querySelector('button[type="submit"]').disabled = false;
  clear.disabled = false;
})();
