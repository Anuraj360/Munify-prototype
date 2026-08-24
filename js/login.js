/**
 * MUNify - User Login Page JavaScript
 * Handles login validation, secure credential verification, role-based session establishment, and redirection.
 */

// Salt for password hashing simulation
const MUNIFY_SALT = '_munify_salt_2026';

/**
 * Hash password using standard Web Crypto SHA-256
 */
async function hashPassword(password) {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + MUNIFY_SALT);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return 'fallback_hash_' + Math.abs(hash);
  }
}

/**
 * Initialize default seed accounts in database if not yet present
 */
async function initializeUsersDatabase() {
  const seedUsers = [
    {
      name: 'Delegate User',
      email: 'user@gmail.com',
      password: 'user123',
      role: 'delegate'
    },
    {
      name: 'Admin Organiser',
      email: 'admin@gmail.com',
      password: 'admin123',
      role: 'admin'
    },
    {
      name: 'Committee Chair',
      email: 'chair@gmail.com',
      password: 'chair123',
      role: 'chair'
    }
  ];

  let users = [];
  const existing = localStorage.getItem('munify_users_db');
  if (existing) {
    try {
      users = JSON.parse(existing);
    } catch (e) {
      users = [];
    }
  }

  let updated = false;
  for (const seed of seedUsers) {
    const found = users.find(u => u.email.toLowerCase() === seed.email.toLowerCase());
    if (!found) {
      const passwordHash = await hashPassword(seed.password);
      users.push({
        id: 'seed_' + seed.role,
        name: seed.name,
        email: seed.email.toLowerCase(),
        passwordHash: passwordHash,
        role: seed.role,
        createdAt: new Date().toISOString()
      });
      updated = true;
    }
  }

  if (updated || !existing) {
    localStorage.setItem('munify_users_db', JSON.stringify(users));
  }
}

/**
 * Calculate role-based dashboard destination path based on current page URL
 */
function getRoleDashboardPath(role) {
  const path = window.location.pathname;
  const isInsideUserSubdir = path.includes('/views/user/');
  const isInsideAdminSubdir = path.includes('/views/admin/');
  const isInsideChairSubdir = path.includes('/views/chair/');
  const isInsideViewsDirect = path.includes('/views/') && !isInsideUserSubdir && !isInsideAdminSubdir && !isInsideChairSubdir;

  const normalizedRole = (role === 'organiser' ? 'admin' : role).toLowerCase();

  if (isInsideUserSubdir) {
    if (normalizedRole === 'delegate') return 'dashboard.html';
    if (normalizedRole === 'admin') return '../admin/dashboard.html';
    if (normalizedRole === 'chair') return '../chair/dashboard.html';
  } else if (isInsideAdminSubdir) {
    if (normalizedRole === 'delegate') return '../user/dashboard.html';
    if (normalizedRole === 'admin') return 'dashboard.html';
    if (normalizedRole === 'chair') return '../chair/dashboard.html';
  } else if (isInsideChairSubdir) {
    if (normalizedRole === 'delegate') return '../user/dashboard.html';
    if (normalizedRole === 'admin') return '../admin/dashboard.html';
    if (normalizedRole === 'chair') return 'dashboard.html';
  } else if (isInsideViewsDirect) {
    if (normalizedRole === 'delegate') return 'user/dashboard.html';
    if (normalizedRole === 'admin') return 'admin/dashboard.html';
    if (normalizedRole === 'chair') return 'chair/dashboard.html';
  } else {
    // Root level fallback
    if (normalizedRole === 'delegate') return 'views/user/dashboard.html';
    if (normalizedRole === 'admin') return 'views/admin/dashboard.html';
    if (normalizedRole === 'chair') return 'views/chair/dashboard.html';
  }
  return 'views/user/dashboard.html';
}

document.addEventListener('DOMContentLoaded', async () => {
  // Ensure default accounts exist
  await initializeUsersDatabase();

  // If already authenticated and navigating to login, allow smooth automatic redirect to active dashboard
  const sessionStr = localStorage.getItem('munify_session');
  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr);
      if (session && session.role) {
        const path = window.location.pathname;
        const isInsideAdminDir = path.includes('/views/admin/');
        const role = (session.role || '').toLowerCase();
        
        // If on admin login page and already logged in as admin/organiser
        if (isInsideAdminDir && (role === 'admin' || role === 'organiser')) {
          window.location.href = 'dashboard.html';
          return;
        }
      }
    } catch (err) {}
  }

  // Mobile Navigation Toggle
  const mobileToggle = document.getElementById('mobileNavToggle');
  const navMenu = document.getElementById('navbarLinks');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const isExpanded = navMenu.classList.contains('active');
      mobileToggle.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    });

    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target) && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Login Form Submission Handling (works for delegate login or organiser login)
  const loginForm = document.getElementById('loginForm') || document.getElementById('adminLoginForm');
  const emailInput = document.getElementById('loginEmail') || document.getElementById('adminEmail');
  const passwordInput = document.getElementById('loginPassword') || document.getElementById('adminPassword');
  const statusMessage = document.getElementById('formStatusMessage');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = emailInput ? emailInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value : '';

      // Reset previous status
      if (statusMessage) {
        statusMessage.className = 'form-status-message';
        statusMessage.textContent = '';
        statusMessage.style.display = 'none';
      }

      // 1. Validate Email Presence
      if (!email) {
        if (statusMessage) {
          statusMessage.textContent = 'Please enter your email.';
          statusMessage.className = 'form-status-message error';
          statusMessage.style.display = 'block';
        }
        if (emailInput) emailInput.focus();
        return;
      }

      // 2. Validate Basic Email Format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        if (statusMessage) {
          statusMessage.textContent = 'Please enter a valid email address.';
          statusMessage.className = 'form-status-message error';
          statusMessage.style.display = 'block';
        }
        if (emailInput) emailInput.focus();
        return;
      }

      // 3. Validate Password Presence
      if (!password) {
        if (statusMessage) {
          statusMessage.textContent = 'Please enter your password.';
          statusMessage.className = 'form-status-message error';
          statusMessage.style.display = 'block';
        }
        if (passwordInput) passwordInput.focus();
        return;
      }

      // 4. Authenticate User against Database
      const normalizedEmail = email.toLowerCase();
      let users = [];
      try {
        users = JSON.parse(localStorage.getItem('munify_users_db') || '[]');
      } catch (err) {
        users = [];
      }

      const user = users.find(u => u.email.toLowerCase() === normalizedEmail);
      if (!user) {
        if (statusMessage) {
          statusMessage.textContent = 'Wrong email or password.';
          statusMessage.className = 'form-status-message error';
          statusMessage.style.display = 'block';
        }
        return;
      }

      // Verify Password Hash
      const enteredHash = await hashPassword(password);
      if (user.passwordHash !== enteredHash) {
        if (statusMessage) {
          statusMessage.textContent = 'Wrong email or password.';
          statusMessage.className = 'form-status-message error';
          statusMessage.style.display = 'block';
        }
        return;
      }

      // 5. Establish Authenticated Session
      const session = {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: 'munify_token_' + Math.random().toString(36).substring(2) + Date.now(),
        authenticatedAt: new Date().toISOString()
      };
      localStorage.setItem('munify_session', JSON.stringify(session));

      // 6. Navigate to user's assigned role dashboard
      const targetPath = getRoleDashboardPath(user.role);
      window.location.href = targetPath;
    });
  }
});
