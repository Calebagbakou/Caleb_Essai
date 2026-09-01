  /* ---------- Theme toggle (dark / light) ---------- */
  const themeBtn = document.getElementById('themeBtn');
  const themeIcon = document.getElementById('themeIcon');
  const sunPath = '<circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8L6 18M18 6l1.8-1.8"/>';
  const moonPath = '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>';
  themeBtn.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    document.documentElement.setAttribute('data-theme', isLight ? 'dark' : 'light');
    themeIcon.innerHTML = isLight ? sunPath : moonPath;
  });

  /* ---------- Hamburger + nav overlay ---------- */
  const menuBtn = document.getElementById('menuBtn');
  const navOverlay = document.getElementById('navOverlay');
  function closeNav(){
    menuBtn.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    navOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  menuBtn.addEventListener('click', () => {
    const opening = !navOverlay.classList.contains('open');
    menuBtn.classList.toggle('open', opening);
    menuBtn.setAttribute('aria-expanded', String(opening));
    navOverlay.classList.toggle('open', opening);
    document.body.style.overflow = opening ? 'hidden' : '';
  });
  navOverlay.querySelectorAll('[data-nav]').forEach(link => {
    link.addEventListener('click', closeNav);
  });

  /* ---------- Typewriter headline ---------- */
  const twEl = document.getElementById('tw');
  const BR = '\u0001', EM_S = '\u0002', EM_E = '\u0003';
  const fullText = 'Des idées brutes.' + BR + 'Des rendus qui ' + EM_S + 'claquent.' + EM_E;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function renderTyped(n){
    const slice = fullText.slice(0, n);
    const emStart = slice.indexOf(EM_S);
    let html;
    if (emStart === -1){
      html = slice.split(BR).join('<br>');
    } else {
      const before = slice.slice(0, emStart).split(BR).join('<br>');
      const emEnd = slice.indexOf(EM_E);
      const emContent = emEnd === -1 ? slice.slice(emStart + 1) : slice.slice(emStart + 1, emEnd);
      const after = emEnd === -1 ? '' : slice.slice(emEnd + 1);
      html = before + '<em>' + emContent + '</em>' + after;
    }
    twEl.innerHTML = html;
  }

  if (prefersReduced){
    renderTyped(fullText.length);
  } else {
    let n = 0, deleting = false;
    function step(){
      if (!deleting){
        n++;
        renderTyped(n);
        if (n >= fullText.length){
          deleting = true;
          setTimeout(step, 2000);
          return;
        }
        setTimeout(step, 42);
      } else {
        n--;
        renderTyped(n);
        if (n <= 0){
          deleting = false;
          setTimeout(step, 500);
          return;
        }
        setTimeout(step, 22);
      }
    }
    step();
  }

  /* ---------- Timecode discret (hero) ---------- */
  let frames = 24 * 60 + 7;
  const tc = document.getElementById('tc');
  function fmt(n){ return String(n).padStart(2,'0'); }
  setInterval(() => {
    frames++;
    let f = frames % 30;
    let totalSec = Math.floor(frames/30);
    let s = totalSec % 60;
    let m = Math.floor(totalSec/60);
    tc.textContent = `00:${fmt(m)}:${fmt(s)}:${fmt(f)}`;
  }, 1000/30);

  /* ---------- Scroll progress bar ---------- */
  const progress = document.getElementById('progress');
  function updateProgress(){
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const max = h.scrollHeight - h.clientHeight;
    progress.style.width = (max > 0 ? (scrolled / max) * 100 : 0) + '%';
  }
  document.addEventListener('scroll', updateProgress, { passive:true });
  updateProgress();

  /* ---------- Scroll reveal with stagger ---------- */
  const revealTargets = document.querySelectorAll(
    '.sec-head, .stat, .service, .p-card, .card, .contact-item, .faq-item, .empty-state'
  );
  revealTargets.forEach(el => el.classList.add('reveal'));

  // stagger delay based on position among siblings sharing the same parent
  const groups = new Map();
  revealTargets.forEach(el => {
    const parent = el.parentElement;
    if(!groups.has(parent)) groups.set(parent, 0);
    const idx = groups.get(parent);
    el.style.transitionDelay = Math.min(idx * 70, 420) + 'ms';
    groups.set(parent, idx + 1);
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  revealTargets.forEach(el => io.observe(el));

  /* ---------- Stat count-up ---------- */
  const counters = document.querySelectorAll('.num');
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const duration = 1100;
      const start = performance.now();
      function tick(now){
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target);
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach(el => counterIO.observe(el));

  /* ---------- FAQ accordion (animated) ---------- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const panel = item.querySelector('.faq-panel');
    if (item.classList.contains('open')){
      panel.style.maxHeight = panel.scrollHeight + 'px';
    }
    item.querySelector('.faq-q').addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(other => {
        other.classList.remove('open');
        other.querySelector('.faq-panel').style.maxHeight = null;
      });
      if (!isOpen){
        item.classList.add('open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  /* ---------- Portfolio filter (animated) ---------- */
  const buttons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.p-card');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      cards.forEach(card => {
        const match = (f === 'tout' || card.dataset.cat === f);
        if (match){
          card.style.display = '';
          requestAnimationFrame(() => card.classList.remove('hide'));
        } else {
          card.classList.add('hide');
          setTimeout(() => { if (card.classList.contains('hide')) card.style.display = 'none'; }, 300);
        }
      });
    });
  });

  /* ---------- Subtle tilt on portfolio thumbnails (pointer devices only) ---------- */
  if (window.matchMedia('(pointer:fine)').matches){
    document.querySelectorAll('.p-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `translateY(-4px) rotateX(${(-y*4).toFixed(2)}deg) rotateY(${(x*4).toFixed(2)}deg)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }
