/**
 * MUNify - User Signup Page JavaScript
 * Handles signup form validation, secure account creation, automatic authentication, and role-based redirection.
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
    // Fallback hashing if crypto subtle is restricted
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
  // Ensure seed accounts exist in user database
  await initializeUsersDatabase();

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

  // Signup Form Submission Handling
  const signupForm = document.getElementById('signupForm');
  const nameInput = document.getElementById('signupName');
  const emailInput = document.getElementById('signupEmail');
  const passwordInput = document.getElementById('signupPassword');
  const accountTypeSelect = document.getElementById('signupAccountType');
  const statusMessage = document.getElementById('formStatusMessage');

  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value : '';
      const accountType = accountTypeSelect ? accountTypeSelect.value : '';

      // Reset previous status messages
      if (statusMessage) {
        statusMessage.className = 'form-status-message';
        statusMessage.innerHTML = '';
        statusMessage.style.display = 'none';
      }

      // 1. Validate Full Name
      if (!name) {
        if (statusMessage) {
          statusMessage.textContent = 'Please enter your full name.';
          statusMessage.className = 'form-status-message error';
          statusMessage.style.display = 'block';
        }
        if (nameInput) nameInput.focus();
        return;
      }

      // 2. Validate Email Presence
      if (!email) {
        if (statusMessage) {
          statusMessage.textContent = 'Please enter your email.';
          statusMessage.className = 'form-status-message error';
          statusMessage.style.display = 'block';
        }
        if (emailInput) emailInput.focus();
        return;
      }

      // 3. Validate Email Format
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

      // 4. Validate Password
      if (!password) {
        if (statusMessage) {
          statusMessage.textContent = 'Please enter a password.';
          statusMessage.className = 'form-status-message error';
          statusMessage.style.display = 'block';
        }
        if (passwordInput) passwordInput.focus();
        return;
      }

      if (password.length < 6) {
        if (statusMessage) {
          statusMessage.textContent = 'Password must be at least 6 characters long.';
          statusMessage.className = 'form-status-message error';
          statusMessage.style.display = 'block';
        }
        if (passwordInput) passwordInput.focus();
        return;
      }

      // 5. Validate Account Type
      if (!accountType) {
        if (statusMessage) {
          statusMessage.textContent = 'Please choose an account type.';
          statusMessage.className = 'form-status-message error';
          statusMessage.style.display = 'block';
        }
        if (accountTypeSelect) accountTypeSelect.focus();
        return;
      }

      // 6. Check if Account already exists (normalized email)
      const normalizedEmail = email.toLowerCase();
      let users = [];
      try {
        users = JSON.parse(localStorage.getItem('munify_users_db') || '[]');
      } catch (err) {
        users = [];
      }

      const existingAccount = users.find(u => u.email.toLowerCase() === normalizedEmail);
      if (existingAccount) {
        if (statusMessage) {
          const isInsideViewsSubdir = window.location.pathname.includes('/views/user/');
          const loginPath = isInsideViewsSubdir ? 'login.html' : 'user/login.html';
          statusMessage.innerHTML = `An account with this email already exists. <a href="${loginPath}" style="font-weight:700; color:#991b1b; text-decoration:underline;">Please login</a>.`;
          statusMessage.className = 'form-status-message error';
          statusMessage.style.display = 'block';
        }
        if (emailInput) emailInput.focus();
        return;
      }

      // 7. Hash password and save new user in database
      const passwordHash = await hashPassword(password);
      const normalizedRole = (accountType === 'organiser' ? 'admin' : accountType).toLowerCase();

      const newUser = {
        id: 'user_' + Date.now(),
        name: name,
        email: normalizedEmail,
        passwordHash: passwordHash,
        role: normalizedRole,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem('munify_users_db', JSON.stringify(users));

      // 8. Automatically Authenticate the User (store session state)
      const session = {
        userId: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        token: 'munify_token_' + Math.random().toString(36).substring(2) + Date.now(),
        authenticatedAt: new Date().toISOString()
      };
      localStorage.setItem('munify_session', JSON.stringify(session));

      // 9. Read role and redirect directly to role dashboard
      const targetDashboard = getRoleDashboardPath(normalizedRole);
      window.location.href = targetDashboard;
    });
  }
});
