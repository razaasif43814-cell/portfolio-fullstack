/* ═══════════════════════════════════════════════════════
   auth.js — Login, Signup, Forgot Password, Reset Password
═══════════════════════════════════════════════════════ */

/* ── Helpers ── */
function showFeedback(id, message, type) {
  var el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.className = 'auth-feedback ' + type;
}

function clearFeedback(id) {
  var el = document.getElementById(id);
  if (el) { el.textContent = ''; el.className = 'auth-feedback'; }
}

async function apiCall(url, data) {
  var res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'same-origin',
  });
  var json = await res.json();
  return { ok: res.ok, data: json };
}

/* ── Password Toggle ── */
function initPasswordToggle() {
  document.querySelectorAll('.toggle-password').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var wrapper = btn.closest('.input-icon-wrapper');
      var input = wrapper.querySelector('input[type="password"], input[type="text"]');
      if (!input) return;
      var isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.querySelector('i').className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
    });
  });
}

/* ── Password Strength ── */
function checkPasswordStrength(password) {
  var score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  var bar = document.getElementById('strength-bar');
  var hint = document.getElementById('pwd-hint');
  if (!bar) return;

  bar.className = 'strength-bar';
  if (score <= 1) { bar.classList.add('weak'); if (hint) hint.textContent = 'Weak password'; }
  else if (score === 2) { bar.classList.add('fair'); if (hint) hint.textContent = 'Fair — add uppercase or special chars'; }
  else if (score === 3) { bar.classList.add('good'); if (hint) hint.textContent = 'Good password'; }
  else { bar.classList.add('strong'); if (hint) hint.textContent = 'Strong password ✓'; }
}

/* ══════════════════════════════════════════════════════
   LOGIN FORM
══════════════════════════════════════════════════════ */
function initLoginForm(redirectTo) {
  initPasswordToggle();

  var form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    clearFeedback('login-feedback');

    var email = document.getElementById('login-email').value.trim();
    var password = document.getElementById('login-password').value;
    var btn = document.getElementById('login-btn');

    if (!email || !password) {
      showFeedback('login-feedback', 'Please fill all fields', 'error');
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';

    try {
      var result = await apiCall('/api/auth/login', { email: email, password: password });

      if (result.ok) {
        // Store token in localStorage as backup
        if (result.data.token) {
          localStorage.setItem('token', result.data.token);
          localStorage.setItem('user', JSON.stringify(result.data.user));
        }
        showFeedback('login-feedback', '✅ Login successful! Redirecting...', 'success');
        setTimeout(function() {
          window.location.href = redirectTo || '/portfolio';
        }, 800);
      } else {
        showFeedback('login-feedback', result.data.message || 'Login failed', 'error');
      }
    } catch (err) {
      showFeedback('login-feedback', 'Network error. Please try again.', 'error');
    }

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
  });
}

/* ══════════════════════════════════════════════════════
   SIGNUP FORM
══════════════════════════════════════════════════════ */
function initSignupForm() {
  initPasswordToggle();

  var pwdInput = document.getElementById('signup-password');
  if (pwdInput) {
    pwdInput.addEventListener('input', function() {
      checkPasswordStrength(pwdInput.value);
    });
  }

  var form = document.getElementById('signup-form');
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    clearFeedback('signup-feedback');

    var name = document.getElementById('signup-name').value.trim();
    var email = document.getElementById('signup-email').value.trim();
    var password = document.getElementById('signup-password').value;
    var confirm = document.getElementById('signup-confirm').value;
    var btn = document.getElementById('signup-btn');

    if (!name || !email || !password || !confirm) {
      showFeedback('signup-feedback', 'Please fill all fields', 'error');
      return;
    }

    if (password.length < 6) {
      showFeedback('signup-feedback', 'Password must be at least 6 characters', 'error');
      return;
    }

    if (password !== confirm) {
      showFeedback('signup-feedback', 'Passwords do not match', 'error');
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';

    try {
      var result = await apiCall('/api/auth/signup', {
        name: name, email: email, password: password
      });

      if (result.ok) {
        if (result.data.token) {
          localStorage.setItem('token', result.data.token);
          localStorage.setItem('user', JSON.stringify(result.data.user));
        }
        showFeedback('signup-feedback', '✅ Account created! Redirecting...', 'success');
        setTimeout(function() { window.location.href = '/'; }, 1000);
      } else {
        showFeedback('signup-feedback', result.data.message || 'Signup failed', 'error');
      }
    } catch (err) {
      showFeedback('signup-feedback', 'Network error. Please try again.', 'error');
    }

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
  });
}

/* ══════════════════════════════════════════════════════
   FORGOT PASSWORD FORM
══════════════════════════════════════════════════════ */
function initForgotForm() {
  var form = document.getElementById('forgot-form');
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    clearFeedback('forgot-feedback');

    var email = document.getElementById('forgot-email').value.trim();
    var btn = document.getElementById('forgot-btn');

    if (!email) {
      showFeedback('forgot-feedback', 'Please enter your email', 'error');
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    try {
      var result = await apiCall('/api/auth/forgot-password', { email: email });
      showFeedback('forgot-feedback', result.data.message || 'Reset link sent!', 'success');
    } catch (err) {
      showFeedback('forgot-feedback', 'Network error. Please try again.', 'error');
    }

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Reset Link';
  });
}

/* ══════════════════════════════════════════════════════
   RESET PASSWORD FORM
══════════════════════════════════════════════════════ */
function initResetForm() {
  var form = document.getElementById('reset-form');
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    clearFeedback('reset-feedback');

    var token = document.getElementById('reset-token').value;
    var newPwd = document.getElementById('new-password').value;
    var confirmPwd = document.getElementById('confirm-password').value;
    var btn = document.getElementById('reset-btn');

    if (!newPwd || !confirmPwd) {
      showFeedback('reset-feedback', 'Please fill all fields', 'error');
      return;
    }

    if (newPwd.length < 6) {
      showFeedback('reset-feedback', 'Password must be at least 6 characters', 'error');
      return;
    }

    if (newPwd !== confirmPwd) {
      showFeedback('reset-feedback', 'Passwords do not match', 'error');
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resetting...';

    try {
      var result = await apiCall('/api/auth/reset-password', {
        token: token, new_password: newPwd
      });

      if (result.ok) {
        showFeedback('reset-feedback', '✅ Password reset! Redirecting to login...', 'success');
        setTimeout(function() { window.location.href = '/login'; }, 1500);
      } else {
        showFeedback('reset-feedback', result.data.message || 'Reset failed', 'error');
      }
    } catch (err) {
      showFeedback('reset-feedback', 'Network error. Please try again.', 'error');
    }

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-key"></i> Reset Password';
  });
}
