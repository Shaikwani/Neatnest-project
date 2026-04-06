/* ═══════════════════════════════════════════════════
   NeatNest — utils.js
   Shared helpers used across ALL pages
   ═══════════════════════════════════════════════════ */
'use strict';

/* ── Toast ── */
function showToast(message, type = 'success', duration = 4500) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span><button class="toast-close" onclick="this.parentElement.remove()">✕</button>`;
  container.appendChild(toast);
  setTimeout(() => { if (toast.parentElement) toast.remove(); }, duration);
}

/* ── Modal ── */
function openModal(id)  { const m = document.getElementById(id); if (m) { m.classList.remove('hidden'); document.body.style.overflow = 'hidden'; } }
function closeModal(id) { const m = document.getElementById(id); if (m) { m.classList.add('hidden');    document.body.style.overflow = ''; } }
document.addEventListener('click', e => { if (e.target.classList.contains('modal-overlay')) { e.target.classList.add('hidden'); document.body.style.overflow = ''; } });

/* ── Auth helpers ── */
function getToken()       { return localStorage.getItem('nn_token') || ''; }
function setToken(t)      { localStorage.setItem('nn_token', t); }
function getUser()        { try { return JSON.parse(sessionStorage.getItem('nn_user') || 'null'); } catch { return null; } }
function setUser(u)       { sessionStorage.setItem('nn_user', JSON.stringify(u)); }
function clearAuth()      { localStorage.removeItem('nn_token'); sessionStorage.removeItem('nn_user'); }

/* ── Redirect helpers ── */
function redirectByRole(role) {
  const map = { resident: '../pages/user-dashboard.html', driver: '../pages/collector-dashboard.html', admin: '../pages/admin-dashboard.html' };
  if (map[role]) window.location.href = map[role];
}
function requireAuth(roles = []) {
  const user = getUser();
  if (!user || !getToken()) { window.location.href = '../pages/login.html'; return null; }
  if (roles.length && !roles.includes(user.role)) { window.location.href = '../pages/login.html'; return null; }
  return user;
}

/* ── Formatters ── */
function formatINR(n)    { return '₹' + Number(n).toLocaleString('en-IN'); }
function formatDate(d)   { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
function capitalize(s)   { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
function initials(name)  { return (name || '?').split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase(); }

/* ── Scroll reveal ── */
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach((e, i) => { if (e.isIntersecting) { setTimeout(() => e.target.classList.add('visible'), i * 70); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

/* ── DOM ready ── */
document.addEventListener('DOMContentLoaded', initReveal);