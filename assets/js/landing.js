/* ═══════════════════════════════════════════════════
   NeatNest — landing.js
   JS only for index.html (landing page)
   ═══════════════════════════════════════════════════ */
'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ── If already logged in redirect to dashboard ── */
  const user = getUser();
  if (user && getToken()) redirectByRole(user.role);

  /* ── Navbar scroll ── */
  const navbar = document.getElementById('mainNav');
  window.addEventListener('scroll', () => navbar?.classList.toggle('scrolled', window.scrollY > 20), { passive: true });

  /* ── Hamburger ── */
  const burger = document.getElementById('hamburger');
  const mMenu  = document.getElementById('mobileMenu');
  burger?.addEventListener('click', () => {
    const open = !mMenu.classList.contains('hidden');
    mMenu.classList.toggle('hidden');
    burger.classList.toggle('open', !open);
  });
  mMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mMenu.classList.add('hidden'); burger.classList.remove('open');
  }));

  /* ── Smooth scroll anchors ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ── Hero progress bar ── */
  setTimeout(() => {
    const fill = document.querySelector('.hv-prog-fill');
    if (fill) fill.style.width = '78%';
  }, 600);

  /* ── Counter animation ── */
  function animateCount(el, target, suffix, duration = 1800) {
    const start = performance.now();
    const update = now => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const v = Math.floor(ease * target);
      el.textContent = (target >= 1000 ? Math.floor(v / 1000) + 'K' : v) + suffix;
      if (p < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  const statEls  = document.querySelectorAll('.stat-number');
  const targets  = [30, 300, 20];
  const suffixes = ['K+', '+', '+'];
  if (statEls.length >= 3) {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        statEls.forEach((el, i) => { if (targets[i]) animateCount(el, targets[i], suffixes[i]); });
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    const container = statEls[0].closest('.hero-stats');
    if (container) obs.observe(container);
  }
});