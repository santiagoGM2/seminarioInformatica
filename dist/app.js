(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const systemMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const motionButton = $('#motion');
  const sceneTargets = new Map();
  const stackPanels = $$('.stack-copy');
  let preference;
  try { preference = localStorage.getItem('sg-motion'); } catch (_) { /* Optional persistence. */ }
  let motionOn = !systemMotion.matches && preference !== 'off';
  let media, general, identityTimeline, stackTimeline, futureTimeline;
  let stackIndex = -1, stackPinned = false;
  let keyboardNavigation = false, navigationUsed = false, refreshTimer;
  document.documentElement.classList.remove('no-js');
  window.addEventListener('keydown', () => { keyboardNavigation = true; navigationUsed = true; });
  window.addEventListener('pointerdown', () => { keyboardNavigation = false; navigationUsed = true; });
  const headerHeight = () => $('.header').getBoundingClientRect().height;
  const stageHeight = () => Math.max(200, innerHeight - headerHeight());
  const padding = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--pad')) || $('.hero-meta').getBoundingClientRect().left;

  function setStack(index, pinned = true) {
    if (stackIndex === index && stackPinned === pinned) return;
    stackIndex = index; stackPinned = pinned;
    $$('[data-stack]').forEach((button, i) => button.setAttribute('aria-pressed', String(index === i)));
    stackPanels.forEach((panel, i) => {
      panel.inert = pinned && index !== i;
      if (pinned && index !== i) panel.setAttribute('aria-hidden', 'true');
      else panel.removeAttribute('aria-hidden');
    });
  }
  function finishScrubs() {
    if (!window.ScrollTrigger) return;
    ScrollTrigger.update();
    ScrollTrigger.getAll().forEach(trigger => {
      if (!trigger.vars.scrub) return;
      const tween = trigger.getTween();
      if (tween && typeof tween.progress === 'function') tween.progress(1);
      trigger.animation?.progress(trigger.progress);
    });
  }
  function showReferences(category = 'all') {
    let count = 0;
    $$('.reference').forEach(card => { card.hidden = category !== 'all' && card.dataset.category !== category; if (!card.hidden) count++; });
    $$('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
    $('#reference-count').textContent = `${count} ${count === 1 ? 'referente' : 'referentes'}`;
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }
  function scrollToTarget(id, { smooth = true, focus = false } = {}) {
    const target = document.getElementById(id);
    if (!target) return;
    if (target.matches('.reference') && target.hidden) showReferences();
    const calculateScene = sceneTargets.get(id);
    const top = calculateScene ? calculateScene() : target.getBoundingClientRect().top + scrollY - headerHeight() - 18;
    window.scrollTo({ top: Math.max(0, top), behavior: motionOn && smooth ? 'smooth' : 'instant' });
    if (!smooth) finishScrubs();
    if (focus) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
  }
  $$('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
    const id = link.hash.slice(1);
    if (!document.getElementById(id)) return;
    event.preventDefault(); navigationUsed = true;
    const keyboard = keyboardNavigation || event.detail === 0;
    scrollToTarget(id, { smooth: !keyboard, focus: keyboard });
    history.replaceState(null, '', `#${id}`);
  }));
  $$('[data-stack]').forEach(button => button.addEventListener('click', () => {
    navigationUsed = true;
    scrollToTarget(`stack-${Number(button.dataset.stack) + 1}`, { smooth: false, focus: true });
  }));
  $$('[data-filter]').forEach(button => button.addEventListener('click', () => showReferences(button.dataset.filter)));

  const tabs = $$('[role=tab]');
  function selectTab(index) {
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
    });
    requestRefresh();
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(i));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (i + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); selectTab(next); tabs[next].focus(); }
    });
  });

  $$('.word-reveal').forEach(element => {
    const words = element.textContent.split(/(\s+)/);
    element.replaceChildren(...words.map(word => {
      if (/^\s*$/.test(word)) return document.createTextNode(word);
      const span = document.createElement('span'); span.className = 'word'; span.textContent = word; return span;
    }));
  });

  function fitYear() {
    const scene = $('.future-scene');
    if (!scene.classList.contains('is-pinned')) { $('.year-display').style.removeProperty('font-size'); return; }
    const display = $('.year-display');
    const maxWidth = display.clientWidth * .31;
    const maxHeight = display.clientHeight * .92;
    display.style.fontSize = `${Math.max(50, Math.min(maxWidth, maxHeight))}px`;
  }
  function requestRefresh() {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => { fitYear(); if (window.ScrollTrigger) ScrollTrigger.refresh(); updateReading(); }, 120);
  }
  function clearScenes() {
    sceneTargets.clear(); identityTimeline = stackTimeline = futureTimeline = undefined;
    $$('.is-pinned').forEach(scene => scene.classList.remove('is-pinned'));
    $('.year-display').style.removeProperty('font-size');
    stackIndex = -1; setStack(0, false);
  }

  function makeIdentity(narrow) {
    const stage = $('.identity-stage'); stage.classList.add('is-pinned');
    const portrait = $('.portrait-motion');
    const finalScale = narrow ? .58 : 1.02;
    const finalX = () => padding() + 12 + portrait.clientWidth * finalScale / 2 - stage.clientWidth / 2;
    const finalY = () => narrow ? headerHeight() + 62 + portrait.clientWidth * finalScale / 2 - stage.clientHeight * .51 : 0;
    const tl = gsap.timeline({ scrollTrigger: { id: 'identity', trigger: stage, start: 'top top', end: () => `+=${Math.max(550, stage.clientHeight * 1.6)}`, pin: true, scrub: .65, anticipatePin: 1, invalidateOnRefresh: true } });
    tl.addLabel('intro', 0)
      .to('.given-name', { x: () => -innerWidth * .16, opacity: .025, duration: 1, ease: 'none' }, .18)
      .to('.family-name', { x: () => innerWidth * .16, opacity: .025, duration: 1, ease: 'none' }, .18)
      .to(portrait, { x: finalX, y: finalY, scale: finalScale, rotation: narrow ? -2 : -3, duration: 1.15, ease: 'power2.inOut' }, .18)
      .to('.hero-bottom', { autoAlpha: 0, duration: .35, ease: 'none' }, .3)
      .fromTo('.hero-story', { autoAlpha: 0, x: 24 }, { autoAlpha: 1, x: 0, duration: .65, ease: 'none' }, .75)
      .to('.circuit-trace', { strokeDashoffset: -1600, duration: 2.25, ease: 'none' }, 0)
      .addLabel('story', 1.5).to({}, { duration: .85 }, 1.5);
    identityTimeline = tl;
    sceneTargets.set('hero-story', () => tl.scrollTrigger.start + tl.labels.story / tl.duration() * (tl.scrollTrigger.end - tl.scrollTrigger.start));
  }
  function makeCube(narrow) {
    const stage = $('.stack-scene'); stage.classList.add('is-pinned');
    gsap.set(stackPanels.slice(1), { autoAlpha: 0, x: 20 });
    gsap.set('.skill-cube', { rotationX: -18, rotationY: -30, rotationZ: -3, transformPerspective: 1000 });
    const tl = gsap.timeline({ scrollTrigger: { id: 'stack', trigger: stage, start: () => `top ${headerHeight()}`, end: () => `+=${Math.max(1000, stageHeight() * 3.5)}`, pin: true, scrub: .7, anticipatePin: 1, invalidateOnRefresh: true } });
    tl.addLabel('data', .25)
      .to('.cube-travel', { x: () => stage.clientWidth * (narrow ? -.35 : -.4), duration: 1.15, ease: 'power2.inOut' }, 1.0)
      .to('.skill-cube', { rotationY: 150, rotationX: 20, rotationZ: 5, duration: 1.4, ease: 'none' }, .8)
      .to(stackPanels[0], { autoAlpha: 0, x: -24, duration: .35, ease: 'none' }, 1.05)
      .to(stackPanels[1], { autoAlpha: 1, x: 0, duration: .5, ease: 'none' }, 1.4)
      .addLabel('software', 2.3)
      .to('.cube-travel', { x: 0, duration: 1.15, ease: 'power2.inOut' }, 3.0)
      .to('.skill-cube', { rotationY: 345, rotationX: -26, rotationZ: -4, duration: 1.4, ease: 'none' }, 2.8)
      .to(stackPanels[1], { autoAlpha: 0, x: 24, duration: .35, ease: 'none' }, 3.05)
      .to(stackPanels[2], { autoAlpha: 1, x: 0, duration: .5, ease: 'none' }, 3.4)
      .addLabel('people', 4.4).to({}, { duration: .8 }, 4.4);
    tl.eventCallback('onUpdate', () => setStack(tl.time() < 1.4 ? 0 : tl.time() < 3.4 ? 1 : 2, true));
    ['data','software','people'].forEach((label, i) => sceneTargets.set(`stack-${i+1}`, () => tl.scrollTrigger.start + tl.labels[label] / tl.duration() * (tl.scrollTrigger.end - tl.scrollTrigger.start)));
    stackTimeline = tl; setStack(0, true);
  }
  function makeFuture() {
    const scene = $('.future-scene'); scene.classList.add('is-pinned'); fitYear();
    gsap.set('.year-track', { yPercent: 0 });
    gsap.set('.future-year-progress b', { scaleX: 0 });
    const tl = gsap.timeline({ scrollTrigger: { id: 'future', trigger: scene, start: () => `top ${headerHeight()}`, end: () => `+=${Math.max(650, stageHeight() * 2.3)}`, pin: true, scrub: .65, anticipatePin: 1, invalidateOnRefresh: true } });
    tl.to('.year-track', { yPercent: -100 * 5 / 6, ease: 'none', duration: 5 }, .2)
      .to('.future-orbit', { rotation: 180, ease: 'none', duration: 5 }, .2)
      .to('.future-year-progress b', { scaleX: 1, ease: 'none', duration: 5 }, .2)
      .addLabel('2031', 5.2).to({}, { duration: 1 }, 5.2);
    futureTimeline = tl;
    sceneTargets.set('futuro', () => tl.scrollTrigger.start);
    sceneTargets.set('year-2031', () => tl.scrollTrigger.start + 5.3 / tl.duration() * (tl.scrollTrigger.end - tl.scrollTrigger.start));
  }
  function buildMotion() {
    media?.revert(); general?.revert(); clearScenes();
    if (!window.gsap || !window.ScrollTrigger) motionOn = false;
    document.body.classList.toggle('motion-off', !motionOn);
    motionButton.setAttribute('aria-pressed', String(motionOn));
    motionButton.setAttribute('aria-label', motionOn ? 'Animaciones activadas. Desactivar animaciones' : 'Animaciones desactivadas. Activar animaciones');
    if (!motionOn) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    general = gsap.context(() => {
      $$('.display-title').forEach(title => {
        gsap.fromTo(title.children[0], { xPercent: -5 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: title, start: 'top 94%', end: 'bottom 42%', scrub: .65, invalidateOnRefresh: true } });
        gsap.fromTo(title.children[1], { xPercent: 5 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: title, start: 'top 94%', end: 'bottom 42%', scrub: .65, invalidateOnRefresh: true } });
      });
      $$('.word-reveal').forEach(text => gsap.fromTo(text.querySelectorAll('.word'), { opacity: .35 }, { opacity: 1, stagger: .06, ease: 'none', scrollTrigger: { trigger: text, start: 'top 88%', end: 'bottom 45%', scrub: .5, invalidateOnRefresh: true } }));
      $$('.reference-photo').forEach(photo => gsap.fromTo(photo.querySelector('img'), { scale: 1.13, yPercent: 3 }, { scale: 1, yPercent: 0, ease: 'none', scrollTrigger: { trigger: photo, start: 'top bottom', end: 'bottom 40%', scrub: .6, invalidateOnRefresh: true } }));
      $$('.trend-visual').forEach((visual, i) => {
        gsap.fromTo(visual.querySelector('img'), { y: 28, rotation: i % 2 ? -3 : 3, scale: .94 }, { y: -12, rotation: 0, scale: 1.025, ease: 'none', scrollTrigger: { trigger: visual, start: 'top bottom', end: 'bottom top', scrub: .75, invalidateOnRefresh: true } });
        gsap.fromTo(visual.querySelector('.visual-index'), { y: 25 }, { y: -35, ease: 'none', scrollTrigger: { trigger: visual, start: 'top bottom', end: 'bottom top', scrub: .75 } });
      });
      $$('.opportunity, .competence-grid article, .future-route li').forEach(row => gsap.fromTo(row, { y: 24, opacity: .65 }, { y: 0, opacity: 1, duration: .7, ease: 'expo.out', scrollTrigger: { trigger: row, start: 'top 95%', toggleActions: 'play none none reverse' } }));
    });
    media = gsap.matchMedia();
    // Only composition depends on width. Height NEVER disables the photo, cube or year animations.
    media.add({ narrow: '(max-width: 700px)', wide: '(min-width: 701px)' }, context => {
      const narrow = context.conditions.narrow;
      makeIdentity(narrow); makeCube(narrow); makeFuture();
      return () => clearScenes();
    });
    ScrollTrigger.refresh();
  }
  function currentDestination() {
    if (stackTimeline?.scrollTrigger.isActive) return `stack-${stackIndex+1}`;
    if (identityTimeline?.scrollTrigger.isActive && identityTimeline.progress() > .5) return 'perfil';
    if (futureTimeline?.scrollTrigger.isActive) return 'futuro';
    return $$('.chapter').filter(section => section.getBoundingClientRect().top <= innerHeight * .5).pop()?.id || 'quien';
  }
  motionButton.addEventListener('click', () => {
    const destination = currentDestination(); motionOn = !motionOn;
    try { localStorage.setItem('sg-motion', motionOn ? 'on' : 'off'); } catch (_) { /* Optional persistence. */ }
    buildMotion(); scrollToTarget(destination, { smooth: false }); motionButton.focus({ preventScroll: true });
  });
  systemMotion.addEventListener('change', event => {
    if (event.matches) { const destination = currentDestination(); motionOn = false; buildMotion(); scrollToTarget(destination, { smooth: false }); }
  });
  let readingScheduled = false;
  function updateReading() {
    readingScheduled = false;
    const extent = document.documentElement.scrollHeight - innerHeight;
    $('.reading-progress span').style.transform = `scaleX(${extent > 0 ? Math.max(0, Math.min(1, scrollY / extent)) : 0})`;
    const active = $$('.chapter').filter(section => section.getBoundingClientRect().top <= innerHeight * .45).pop() || $('#quien');
    $$('.header nav a').forEach(link => { if (link.hash === `#${active.id}`) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
  }
  window.addEventListener('scroll', () => { if (!readingScheduled) { readingScheduled = true; requestAnimationFrame(updateReading); } }, { passive: true });
  window.addEventListener('resize', requestRefresh, { passive: true });
  window.addEventListener('orientationchange', requestRefresh);
  $$('details').forEach(details => details.addEventListener('toggle', requestRefresh));
  $$('img').forEach(image => { if (!image.complete) image.addEventListener('load', requestRefresh, { once: true }); });
  if (window.ScrollTrigger) ScrollTrigger.addEventListener('refreshInit', fitYear);
  buildMotion(); updateReading();
  if (location.hash) requestAnimationFrame(() => { if (!navigationUsed) scrollToTarget(location.hash.slice(1), { smooth: false }); });
  document.fonts.ready.then(() => { requestRefresh(); document.body.dataset.ready = 'true'; });
})();
