(() => {
  'use strict';
  document.documentElement.classList.remove('no-js');
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionButton = $('#motion');
  let savedMotion;
  try { savedMotion = localStorage.getItem('seminario-motion'); } catch (_) { /* Privacy mode keeps the system preference. */ }
  let motionOn = !reduced.matches && savedMotion !== 'off';
  let context, media, trendTrigger, opportunityTrigger;
  let trendActive = -1, opportunityActive = -1;
  const pinnedState = { trend: false, opportunity: false };
  const trendPanels = $$('.trend-panel');
  const opportunityPanels = $$('.opportunity-panel');
  const sceneTargets = new Map();
  const navLinks = $$('.header nav a');
  let keyboardNavigation = false;
  let navigationUsed = false;
  window.addEventListener('keydown', () => { keyboardNavigation = true; navigationUsed = true; });
  window.addEventListener('pointerdown', () => { keyboardNavigation = false; navigationUsed = true; });

  function setScene(kind, index, pinned = false) {
    const panels = kind === 'trend' ? trendPanels : opportunityPanels;
    if ((kind === 'trend' ? trendActive : opportunityActive) === index && pinnedState[kind] === pinned) return;
    pinnedState[kind] = pinned;
    if (kind === 'trend') trendActive = index; else opportunityActive = index;
    $(`#${kind}-count`).textContent = String(index + 1).padStart(2, '0');
    $$(`[data-${kind}]`).forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    panels.forEach((panel, i) => {
      // Only the scene presently visible participates in keyboard and screen-reader navigation.
      panel.inert = pinned && i !== index;
      if (pinned && i !== index) panel.setAttribute('aria-hidden', 'true');
      else panel.removeAttribute('aria-hidden');
    });
  }
  function resetScenes() {
    sceneTargets.clear(); trendTrigger = opportunityTrigger = null;
    $$('.is-pinned').forEach(el => el.classList.remove('is-pinned'));
    [...trendPanels, ...opportunityPanels].forEach(panel => { panel.inert = false; panel.removeAttribute('aria-hidden'); });
    trendActive = opportunityActive = -1;
    setScene('trend', 0); setScene('opportunity', 0);
  }
  function scrollToTarget(target, smooth = true) {
    const element = document.getElementById(target);
    if (!element) return;
    if (element.matches('details')) element.open = true;
    const scene = sceneTargets.get(target);
    const offset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header')) || 86;
    const top = scene ? scene() : element.getBoundingClientRect().top + window.scrollY - offset - 16;
    window.scrollTo({ top: Math.max(0, top), behavior: motionOn && smooth ? 'smooth' : 'instant' });
    if (!smooth && window.ScrollTrigger) {
      ScrollTrigger.update();
      // Keyboard jumps render the destination immediately, without a scrub delay.
      ScrollTrigger.getAll().forEach(trigger => {
        if (!trigger.vars.scrub) return;
        const tween = trigger.getTween();
        if (tween && typeof tween.progress === 'function') tween.progress(1);
        trigger.animation?.progress(trigger.progress);
      });
    }
    if (!smooth) {
      element.setAttribute('tabindex', '-1'); element.focus({ preventScroll: true });
    }
  }
  $$('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
    const target = link.getAttribute('href').slice(1);
    if (!document.getElementById(target)) return;
    event.preventDefault();
    scrollToTarget(target, event.detail !== 0 && !keyboardNavigation);
    history.replaceState(null, '', `#${target}`);
    if (event.detail === 0 || keyboardNavigation) {
      const el = document.getElementById(target);
      // Scene visibility changes synchronously when keyboard navigation jumps to a pin.
      if (sceneTargets.has(target)) ScrollTrigger.update();
      el.setAttribute('tabindex', '-1'); el.focus({ preventScroll: true });
    }
  }));
  $$('[data-trend]').forEach(button => button.addEventListener('click', () => scrollToTarget(`trend-${Number(button.dataset.trend) + 1}`, false)));
  $$('[data-opportunity]').forEach(button => button.addEventListener('click', () => scrollToTarget(`opportunity-${Number(button.dataset.opportunity) + 1}`, false)));

  // Full keyboard behavior for the profile's diagnostic tabs.
  const tabs = $$('[role=tab]');
  function activateTab(index) {
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1;
      $(`#${tab.getAttribute('aria-controls')}`).hidden = !active;
    });
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(index));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault(); activateTab(next); tabs[next].focus();
    });
  });

  // Split only short narrative leads. Text order and semantic content remain intact.
  $$('.profile-lead .lead, .section-intro .lead').forEach(lead => {
    const nodes = [...lead.childNodes];
    nodes.forEach(node => {
      if (node.nodeType !== Node.TEXT_NODE) return;
      const fragment = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(word => {
        if (/^\s*$/.test(word)) fragment.append(document.createTextNode(word));
        else { const span = document.createElement('span'); span.className = 'word'; span.textContent = word; fragment.append(span); }
      });
      node.replaceWith(fragment);
    });
  });

  function buildMotion() {
    if (media) media.revert();
    if (context) context.revert();
    resetScenes();
    document.body.classList.toggle('motion-off', !motionOn);
    motionButton.setAttribute('aria-pressed', String(motionOn));
    motionButton.setAttribute('aria-label', motionOn ? 'Animaciones activadas. Desactivar animaciones' : 'Animaciones desactivadas. Activar animaciones');
    if (!window.gsap || !window.ScrollTrigger || !motionOn) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    context = gsap.context(() => {
      $$('.display-title').forEach(title => {
        gsap.fromTo(title.children[0], { xPercent: -8 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: title, start: 'top 90%', end: 'bottom 45%', scrub: 1 } });
        gsap.fromTo(title.children[1], { xPercent: 8 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: title, start: 'top 90%', end: 'bottom 45%', scrub: 1 } });
      });
      $$('.profile-lead .lead, .section-intro .lead').forEach(lead => gsap.fromTo(lead.querySelectorAll('.word'), { opacity: .25 }, { opacity: 1, stagger: .08, ease: 'none', scrollTrigger: { trigger: lead, start: 'top 88%', end: 'bottom 45%', scrub: .5 } }));
      $$('.competencies article, .source-list details, .future-route li').forEach((row, index) => gsap.fromTo(row, { y: 35, opacity: .45 }, { y: 0, opacity: 1, duration: .85, ease: 'expo.out', scrollTrigger: { trigger: row, start: 'top 94%', toggleActions: 'play none none reverse' } }));
    });
    media = gsap.matchMedia();
    media.add('(min-width: 960px) and (min-height: 680px)', () => {
      $('.trend-stage').classList.add('is-pinned');
      $('.opportunity-stage').classList.add('is-pinned');
      $('.future-stage').classList.add('is-pinned');
      const identity = gsap.timeline({ scrollTrigger: { trigger: '.identity-stage', start: 'top top', end: () => `+=${innerHeight * .85}`, pin: true, scrub: 1, anticipatePin: 1 } });
      identity.to('.identity-first', { xPercent: -18, opacity: .08, duration: 1, ease: 'none' }, 0).to('.identity-second', { xPercent: 18, opacity: .08, duration: 1, ease: 'none' }, 0).to('.identity-star', { rotation: 120, duration: 1, ease: 'none' }, 0).to('.identity-ghost', { opacity: 1, y: -20, duration: .6, ease: 'none' }, .4);
      gsap.set(trendPanels.slice(1), { yPercent: 100 });
      trendPanels.forEach((panel, i) => { panel.style.zIndex = i + 1; });
      const trendTimeline = gsap.timeline({ scrollTrigger: { trigger: '.trend-stage', start: 'top top', end: () => `+=${innerHeight * 5}`, pin: true, scrub: .8, anticipatePin: 1 } });
      trendPanels.slice(1).forEach((panel, i) => {
        const at = .9 + i * 1.4;
        trendTimeline.to(panel, { yPercent: 0, duration: .8, ease: 'none' }, at);
        trendTimeline.fromTo(panel.querySelector('.scene-art'), { rotation: -25, scale: .8 }, { rotation: 0, scale: 1, duration: 1, ease: 'none' }, at);
      });
      trendTimeline.to({}, { duration: .3 }, 6.1);
      trendTimeline.eventCallback('onUpdate', () => {
        const index = Math.min(4, Math.max(0, Math.floor((trendTimeline.time() + .1) / 1.4)));
        setScene('trend', index, true);
      });
      trendTrigger = trendTimeline.scrollTrigger;
      trendPanels.forEach((panel, i) => sceneTargets.set(panel.id, () => trendTrigger.start + ((i === 0 ? .1 : 1.85 + (i - 1) * 1.4) / 6.4) * (trendTrigger.end - trendTrigger.start)));
      setScene('trend', 0, true);
      const opportunityTween = gsap.to('.opportunity-track', { xPercent: -400, ease: 'none', scrollTrigger: { trigger: '.opportunity-stage', start: 'top top', end: () => `+=${innerHeight * 4}`, pin: true, scrub: .8, anticipatePin: 1 } });
      opportunityTween.eventCallback('onUpdate', () => setScene('opportunity', Math.min(4, Math.round(opportunityTween.progress() * 4)), true));
      opportunityTrigger = opportunityTween.scrollTrigger;
      opportunityPanels.forEach((panel, i) => sceneTargets.set(panel.id, () => opportunityTrigger.start + i / 4 * (opportunityTrigger.end - opportunityTrigger.start)));
      setScene('opportunity', 0, true);
      gsap.to('.year-track', { yPercent: -100 * 5 / 6, ease: 'none', scrollTrigger: { trigger: '.future-stage', start: 'top top', end: () => `+=${innerHeight * 1.6}`, pin: true, scrub: 1, anticipatePin: 1 } });
      gsap.to('.future-star', { rotation: 150, ease: 'none', scrollTrigger: { trigger: '.future-stage', start: 'top top', end: () => `+=${innerHeight * 1.6}`, scrub: 1 } });
      return () => resetScenes();
    });
    media.add('(max-width: 959px), (max-height: 679px)', () => {
      gsap.to('.identity-first', { xPercent: -8, ease: 'none', scrollTrigger: { trigger: '.identity-stage', start: 'top top', end: 'bottom top', scrub: .5 } });
      gsap.to('.identity-second', { xPercent: 8, ease: 'none', scrollTrigger: { trigger: '.identity-stage', start: 'top top', end: 'bottom top', scrub: .5 } });
      gsap.to('.identity-star', { rotation: 90, ease: 'none', scrollTrigger: { trigger: '.identity-stage', start: 'top top', end: 'bottom top', scrub: .5 } });
      trendPanels.forEach(panel => gsap.fromTo(panel.querySelector('.scene-art'), { rotation: -20 }, { rotation: 20, ease: 'none', scrollTrigger: { trigger: panel, start: 'top bottom', end: 'bottom top', scrub: 1 } }));
      gsap.to('.year-track', { yPercent: -100 * 5 / 6, ease: 'none', scrollTrigger: { trigger: '.future-stage', start: 'top 80%', end: 'bottom 45%', scrub: .6 } });
    });
    ScrollTrigger.refresh();
  }
  function readingDestination() {
    const current = $$('.chapter').filter(chapter => chapter.getBoundingClientRect().top <= innerHeight * .6).pop() || $('#quien');
    if (current.id === 'tendencias' && trendTrigger?.isActive) return `trend-${trendActive + 1}`;
    if (current.id === 'oportunidades' && opportunityTrigger?.isActive) return `opportunity-${opportunityActive + 1}`;
    return current.id;
  }
  motionButton.addEventListener('click', () => {
    const destination = readingDestination(); motionOn = !motionOn;
    try { localStorage.setItem('seminario-motion', motionOn ? 'on' : 'off'); } catch (_) { /* Optional preference persistence. */ }
    buildMotion(); scrollToTarget(destination, false);
    motionButton.focus({ preventScroll: true });
  });
  reduced.addEventListener('change', event => {
    if (event.matches) { const destination = readingDestination(); motionOn = false; buildMotion(); scrollToTarget(destination, false); }
  });
  // Native progress/navigation work with animation disabled or vendor scripts unavailable.
  let scheduled = false;
  function updateReading() {
    scheduled = false;
    const maxScroll = document.documentElement.scrollHeight - innerHeight;
    $('.reading-progress span').style.transform = `scaleX(${maxScroll > 0 ? scrollY / maxScroll : 0})`;
    const active = $$('.chapter').filter(chapter => chapter.getBoundingClientRect().top <= innerHeight * .45).pop() || $('#quien');
    navLinks.forEach(link => { if (link.hash === `#${active.id}`) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
    if (!trendTrigger) {
      const index = trendPanels.findLastIndex(panel => panel.getBoundingClientRect().top < innerHeight * .5);
      if (index >= 0) setScene('trend', index);
    }
    if (!opportunityTrigger) {
      const index = opportunityPanels.findLastIndex(panel => panel.getBoundingClientRect().top < innerHeight * .5);
      if (index >= 0) setScene('opportunity', index);
    }
  }
  window.addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateReading); } }, { passive: true });
  $$('.source-list details').forEach(detail => detail.addEventListener('toggle', () => { if (window.ScrollTrigger) ScrollTrigger.refresh(); }));
  buildMotion(); updateReading();
  if (location.hash) requestAnimationFrame(() => { if (!navigationUsed) scrollToTarget(location.hash.slice(1), false); });
  // Loading a font refreshes dimensions; it must not rebuild the route or undo a user's navigation.
  document.fonts.ready.then(() => { if (window.ScrollTrigger) ScrollTrigger.refresh(); updateReading(); });
})();
