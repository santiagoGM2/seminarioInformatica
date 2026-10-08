(() => {
  'use strict';
  const body = document.body;
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionButton = document.querySelector('#motion-toggle');
  let reduced = preference.matches;
  function applyMotion() {
    body.classList.toggle('reduced-motion', reduced);
    motionButton.setAttribute('aria-pressed', String(reduced));
    motionButton.setAttribute('aria-label', reduced ? 'Activar animaciones' : 'Pausar animaciones');
    motionButton.title = reduced ? 'Activar animaciones' : 'Pausar animaciones';
    motionButton.querySelector('span').textContent = reduced ? '▶' : 'Ⅱ';
    updateScroll();
  }
  motionButton.addEventListener('click', () => { reduced = !reduced; applyMotion(); });
  preference.addEventListener('change', e => { reduced = e.matches; applyMotion(); });
  // Content remains visible when JavaScript or IntersectionObserver is unavailable.
  if ('IntersectionObserver' in window) {
    body.classList.add('motion-ready');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -25px 0px' });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }
  const reading = document.querySelector('.reading-reveal');
  const readingText = reading.textContent.trim();
  reading.setAttribute('aria-label', readingText);
  reading.replaceChildren(...readingText.split(/\s+/).flatMap((word, i) => {
    const span = document.createElement('span'); span.textContent = word; span.setAttribute('aria-hidden','true');
    return i ? [document.createTextNode(' '), span] : [span];
  }));
  const words = [...reading.querySelectorAll('span')];
  const sections = [...document.querySelectorAll('main > section[id]')];
  const navLinks = [...document.querySelectorAll('.header nav a')];
  const header = document.querySelector('.header');
  const progress = document.querySelector('.page-progress');
  const trends = document.querySelector('.trends');
  const track = document.querySelector('.trend-track');
  const meter = document.querySelector('.trend-meter span');
  const count = document.querySelector('.trend-count');
  const heroComposition = document.querySelector('.hero-composition');
  const desktop = window.matchMedia('(min-width: 761px) and (min-height: 641px)');
  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  let scheduled = false;
  function updateScroll() {
    scheduled = false;
    const y = window.scrollY, h = window.innerHeight;
    const maxY = document.documentElement.scrollHeight - h;
    progress.style.transform = `scaleX(${maxY > 0 ? clamp(y / maxY) : 0})`;
    header.classList.toggle('scrolled', y > 40);
    let current = '';
    for (const section of sections) if (section.getBoundingClientRect().top <= h * .4) current = section.id;
    navLinks.forEach(link => { const active = link.hash === '#' + current; link.classList.toggle('active', active); if (active) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current'); });
    const readingRect = reading.getBoundingClientRect();
    const readProgress = reduced ? 1 : clamp((h * .88 - readingRect.top) / (h * .48));
    words.forEach((word, i) => word.classList.toggle('lit', reduced || i / words.length <= readProgress));
    if (desktop.matches) {
      const rect = trends.getBoundingClientRect();
      const p = clamp(-rect.top / Math.max(1, rect.height - h));
      const overflow = Math.max(0, track.scrollWidth - window.innerWidth);
      track.style.transform = `translate3d(${-overflow * p}px,0,0)`;
      meter.style.transform = `scaleX(${p})`;
      count.textContent = `${String(Math.min(7, Math.floor(p * 7) + 1)).padStart(2, '0')} — 07`;
    } else { track.style.transform = ''; meter.style.transform = ''; }
    heroComposition.style.transform = reduced ? '' : `translate3d(0,${Math.min(y, h) * .09}px,0)`;
  }
  function scheduleScroll() { if (!scheduled) { scheduled = true; requestAnimationFrame(updateScroll); } }
  window.addEventListener('scroll', scheduleScroll, { passive: true });
  window.addEventListener('resize', scheduleScroll, { passive: true });
  desktop.addEventListener('change', scheduleScroll);
  document.fonts?.ready.then(scheduleScroll);
  // In-page anchors keep the trend that was selected visible on desktop.
  function handleHash() {
    const target = document.querySelector(location.hash ? location.hash.replace(/[^#\w-]/g, '') : '#inicio');
    if (!target) return;
    const m = location.hash.match(/^#tendencia-(\d)$/);
    if (m && desktop.matches) {
      const index = Number(m[1]) - 1;
      const distance = trends.offsetHeight - innerHeight;
      const top = trends.offsetTop + (index / 6) * distance;
      window.scrollTo({ top, behavior: reduced ? 'instant' : 'smooth' });
    }
    if (target.matches('details')) target.open = true;
    if (target.classList.contains('reveal')) target.classList.add('visible');
    scheduleScroll();
  }
  window.addEventListener('hashchange', handleHash);
  track.addEventListener('focusin', event => {
    const card = event.target.closest('.trend-card');
    if (!card || !desktop.matches) return;
    const overflow = Math.max(1, track.scrollWidth - innerWidth);
    const p = clamp((card.offsetLeft - innerWidth * .06) / overflow);
    window.scrollTo({ top: trends.offsetTop + p * (trends.offsetHeight - innerHeight), behavior: 'instant' });
  });
  document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', () => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target?.matches('details')) target.open = true;
  }));
  const clock = document.querySelector('#clock');
  function tick() { clock.textContent = new Intl.DateTimeFormat('es-CO', { timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date()) + ' CO'; }
  tick(); setInterval(tick, 1000);
  const cursor = document.querySelector('.cursor');
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let tx = -100, ty = -100, cx = -100, cy = -100, frame = null;
    function drawCursor() {
      cx += (tx - cx) * .2; cy += (ty - cy) * .2;
      cursor.style.transform = `translate3d(${cx}px,${cy}px,0) translate(-50%,-50%)`;
      if (Math.abs(tx-cx) + Math.abs(ty-cy) > .2) frame = requestAnimationFrame(drawCursor); else frame = null;
    }
    window.addEventListener('pointermove', event => { if (reduced) return; tx = event.clientX; ty = event.clientY; cursor.style.opacity = '1'; cursor.classList.toggle('is-link', !!event.target.closest('a,button,summary')); if (!frame) frame = requestAnimationFrame(drawCursor); }, { passive: true });
    document.addEventListener('pointerleave', () => { cursor.style.opacity = '0'; });
  }
  // Printing includes the full action plan, including collapsed entries.
  let printState = [];
  window.addEventListener('beforeprint', () => { printState = [...document.querySelectorAll('details')].map(el => [el, el.open]); printState.forEach(([el]) => el.open = true); });
  window.addEventListener('afterprint', () => printState.forEach(([el, open]) => el.open = open));
  applyMotion(); if (location.hash) handleHash();
})();
