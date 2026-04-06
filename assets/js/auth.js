/* ═══════════════════════════════════════════════════
   NeatNest — auth.js
   Login & Register logic
   Connects to backend API at localhost:5000
   ═══════════════════════════════════════════════════ */
'use strict';

const API = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {

  /* ── If already logged in go to dashboard ── */
  const user = getUser();
  if (user && getToken()) {
    redirectByRole(user.role);
    return;
  }

  /* ── Password toggle ── */
  document.querySelectorAll('.toggle-pw').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      const isText = input.type === 'text';
      input.type = isText ? 'password' : 'text';
      btn.textContent = isText ? '👁️' : '🙈';
    });
  });

  /* ── LOGIN FORM ── */
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn   = document.getElementById('loginBtn');
      const alert = document.getElementById('loginAlert');

      const email    = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;

      if (!email || !password) {
        showAlert(alert, 'Please fill in all fields.', 'error');
        return;
      }

      setLoading(btn, true, 'Signing in...');
      clearAlert(alert);

      try {
        const res  = await fetch(`${API}/auth/login`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email, password }),
        });
        const data = await res.json();

        if (!res.ok) {
          // Pending account message
          if (data.status === 'pending') {
            showAlert(alert,
              '⏳ Your account is pending admin approval. You will be notified once activated.',
              'warning'
            );
          } else {
            showAlert(alert, data.message || 'Login failed.', 'error');
          }
          return;
        }

        // Save token and user
        setToken(data.token);
        setUser(data.user);
        showToast(`Welcome back, ${data.user.name}! 👋`, 'success');

        // Redirect based on role
        setTimeout(() => redirectByRole(data.user.role), 800);

      } catch (err) {
        showAlert(alert, 'Cannot connect to server. Make sure the backend is running.', 'error');
      } finally {
        setLoading(btn, false, 'Sign In');
      }
    });
  }

  /* ── REGISTER FORM ── */
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {

    // Role selection
    document.querySelectorAll('.role-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        document.getElementById('selectedRole').value = card.dataset.role;

        // Show/hide address fields (only for residents)
        const addrFields = document.getElementById('addressFields');
        if (addrFields) {
          addrFields.style.display = card.dataset.role === 'resident' ? 'block' : 'none';
        }
      });
    });

    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn   = document.getElementById('registerBtn');
      const alert = document.getElementById('registerAlert');

      const name     = document.getElementById('regName').value.trim();
      const email    = document.getElementById('regEmail').value.trim();
      const phone    = document.getElementById('regPhone').value.trim();
      const password = document.getElementById('regPassword').value;
      const confirm  = document.getElementById('regConfirm').value;
      const role     = document.getElementById('selectedRole').value;
      const address  = document.getElementById('regAddress')?.value.trim() || '';
      const ward     = document.getElementById('regWard')?.value.trim()    || '';
      const city     = document.getElementById('regCity')?.value.trim()    || '';

      // Validate
      if (!name || !email || !phone || !password) {
        showAlert(alert, 'Please fill in all required fields.', 'error');
        return;
      }
      if (password.length < 6) {
        showAlert(alert, 'Password must be at least 6 characters.', 'error');
        return;
      }
      if (password !== confirm) {
        showAlert(alert, 'Passwords do not match.', 'error');
        return;
      }

      setLoading(btn, true, 'Creating account...');
      clearAlert(alert);

      try {
        const res  = await fetch(`${API}/auth/register`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ name, email, phone, password, role, address, ward, city }),
        });
        const data = await res.json();

        if (!res.ok) {
          showAlert(alert, data.message || 'Registration failed.', 'error');
          return;
        }

        // Show success pending message
        registerForm.style.display = 'none';
        document.getElementById('pendingMessage').classList.remove('hidden');

      } catch (err) {
        showAlert(alert, 'Cannot connect to server. Make sure the backend is running.', 'error');
      } finally {
        setLoading(btn, false, 'Create Account');
      }
    });
  }
});

/* ── Helpers ── */
function showAlert(el, msg, type) {
  if (!el) return;
  el.className = `alert alert-${type}`;
  el.textContent = msg;
  el.classList.remove('hidden');
}
function clearAlert(el) {
  if (!el) return;
  el.classList.add('hidden');
  el.textContent = '';
}
function setLoading(btn, loading, text) {
  if (!btn) return;
  btn.disabled     = loading;
  btn.textContent  = loading ? text : btn.dataset.default || text;
}

/* ── Redirect by role (pages are inside /pages/ folder) ── */
function redirectByRole(role) {
  const map = {
    resident: 'user-dashboard.html',
    driver:   'collector-dashboard.html',
    admin:    'admin-dashboard.html',
  };
  if (map[role]) window.location.href = map[role];
}