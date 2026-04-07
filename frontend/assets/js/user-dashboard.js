/* ═══════════════════════════════════════════════════
   NeatNest — sidebar.js
   Shared sidebar builder used on ALL dashboard pages
   ═══════════════════════════════════════════════════ */
'use strict';

const API = 'http://localhost:5000/api';

/* ── Sidebar nav items per role ── */
const NAV_ITEMS = {
  resident: [
    { label: 'Main Menu', type: 'section' },
    { icon: '🏠', label: 'Dashboard',        href: 'user-dashboard.html' },
    { icon: '💳', label: 'Bills & Payments', href: 'user-bills.html' },
    { icon: '🗓️', label: 'My Schedule',      href: 'user-schedule.html' },
    { icon: '🚛', label: 'Book a Truck',      href: 'user-bookings.html' },
    { icon: '💬', label: 'Feedback',          href: 'user-feedback.html' },
    { label: 'Account', type: 'section' },
    { icon: '👤', label: 'My Profile',        href: 'user-profile.html' },
  ],
  driver: [
    { label: 'Main Menu', type: 'section' },
    { icon: '🏠', label: 'Dashboard',         href: 'collector-dashboard.html' },
    { icon: '🗺️', label: 'My Routes',         href: 'collector-routes.html' },
    { icon: '📋', label: 'Assigned Jobs',      href: 'collector-jobs.html' },
    { icon: '🗓️', label: 'My Schedule',       href: 'collector-schedule.html' },
    { label: 'Account', type: 'section' },
    { icon: '👤', label: 'My Profile',         href: 'collector-profile.html' },
  ],
  admin: [
    { label: 'Admin Panel', type: 'section' },
    { icon: '📊', label: 'Dashboard',          href: 'admin-dashboard.html' },
    { icon: '👥', label: 'Residents',           href: 'admin-users.html' },
    { icon: '🚛', label: 'Drivers',             href: 'admin-drivers.html' },
    { icon: '🗓️', label: 'Schedules',          href: 'admin-schedules.html' },
    { icon: '💰', label: 'Payments',            href: 'admin-payments.html' },
    { icon: '🗺️', label: 'Routes',             href: 'admin-routes.html' },
    { icon: '💬', label: 'Feedback',            href: 'admin-feedback.html' },
  ],
};

/* ── Build sidebar ── */
function buildSidebar(user) {
  // Set avatar & user info
  const avatar = document.getElementById('sidebarAvatar');
  const name   = document.getElementById('sidebarName');
  const role   = document.getElementById('sidebarRole');
  if (avatar) avatar.textContent = initials(user.name);
  if (name)   name.textContent   = user.name;
  if (role)   role.textContent   = capitalize(user.role === 'resident' ? 'Resident' : user.role === 'driver' ? 'Driver' : 'Admin');

  // Also set topbar avatar
  const topAvatar = document.getElementById('topbarAvatar');
  if (topAvatar) topAvatar.textContent = initials(user.name);

  // Build nav
  const nav   = document.getElementById('sidebarNav');
  if (!nav) return;
  const items = NAV_ITEMS[user.role] || [];
  const current = window.location.pathname.split('/').pop();

  nav.innerHTML = items.map(item => {
    if (item.type === 'section') {
      return `<div class="sidebar-section-label">${item.label}</div>`;
    }
    const isActive = current === item.href ? 'active' : '';
    return `<a href="${item.href}" class="nav-item ${isActive}">
      <span class="nav-icon">${item.icon}</span>
      ${item.label}
    </a>`;
  }).join('');
}

/* ── Topbar page title ── */
function setPageTitle(title) {
  const el = document.getElementById('topbarTitle');
  if (el) el.textContent = title;
  document.title = `${title} — NeatNest`;
}

/* ── Logout ── */
function logout() {
  clearAuth();
  showToast('Logged out successfully.', 'success');
  setTimeout(() => { window.location.href = '../pages/login.html'; }, 600);
}

/* ── Mobile sidebar toggle ── */
function initSidebarToggle() {
  const toggle  = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  if (!toggle || !sidebar) return;

  toggle.addEventListener('click', () => sidebar.classList.toggle('open'));

  // Close on outside click
  document.addEventListener('click', e => {
    if (sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) &&
        e.target !== toggle) {
      sidebar.classList.remove('open');
    }
  });
}

/* ── API helper with auth token ── */
async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const res = await fetch(`${API}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  // Token expired
  if (res.status === 401) {
    clearAuth();
    window.location.href = '../pages/login.html';
    return null;
  }

  return res.json();
}

/* ── Init dashboard page ── */
function initDashboard(allowedRoles = []) {
  const user = getUser();
  if (!user || !getToken()) {
    window.location.href = '../pages/login.html';
    return null;
  }
  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    window.location.href = '../pages/login.html';
    return null;
  }
  buildSidebar(user);
  initSidebarToggle();
  return user;
}