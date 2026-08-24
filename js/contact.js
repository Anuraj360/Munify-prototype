/**
 * MUNify - Contact Us Page JavaScript
 * Handles contact form submission, mobile navbar toggle, and active session preservation
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check active session
  const sessionStr = localStorage.getItem('munify_session');
  let session = null;
  if (sessionStr) {
    try {
      session = JSON.parse(sessionStr);
    } catch (e) {}
  }

  // Update navbar based on authentication state
  const navbarActions = document.querySelector('.navbar-actions');
  const navOverview = document.getElementById('navOverview');
  const brandLogo = document.getElementById('brandLogo');

  if (session && session.role) {
    const role = (session.role || '').toLowerCase();
    const isDelegate = role === 'delegate';
    const isInsideUserDir = window.location.pathname.includes('/views/user/');
    
    let targetDashboard = isDelegate ? 'dashboard.html' : (role === 'chair' ? '../chair/dashboard.html' : '../admin/dashboard.html');
    if (!isInsideUserDir) {
      targetDashboard = isDelegate ? 'user/dashboard.html' : (role === 'chair' ? 'chair/dashboard.html' : 'admin/dashboard.html');
    }

    if (navOverview) {
      navOverview.href = targetDashboard;
    }
    if (brandLogo) {
      brandLogo.href = targetDashboard;
    }

    if (navbarActions) {
      navbarActions.innerHTML = `
        <a href="${targetDashboard}#profile" class="nav-profile-link" id="navProfile" style="display:inline-flex; align-items:center; gap:8px; color:#ffffff; font-size:15px; font-weight:600; text-decoration:none; padding:6px 12px; border-radius:6px;">
          <span class="profile-icon">👤</span> Profile
        </a>
        <button type="button" class="btn-logout" id="btnLogout" style="background-color:#dc2626; color:#ffffff; font-size:15px; font-weight:700; padding:8px 22px; border-radius:6px; border:none; cursor:pointer;">Logout</button>
      `;

      const btnLogout = document.getElementById('btnLogout');
      if (btnLogout) {
        btnLogout.addEventListener('click', () => {
          localStorage.removeItem('munify_session');
          const loginTarget = isInsideUserDir ? 'login.html' : 'views/user/login.html';
          window.location.href = loginTarget;
        });
      }
    }
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

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target) && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Contact Form Submission Handler
  const contactForm = document.getElementById('contactForm');
  const nameInput = document.getElementById('contactName');
  const emailInput = document.getElementById('contactEmail');
  const messageInput = document.getElementById('contactMessage');
  const statusMessage = document.getElementById('formStatusMessage');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const message = messageInput ? messageInput.value.trim() : '';

      // Reset previous status
      if (statusMessage) {
        statusMessage.className = 'form-status-message';
        statusMessage.textContent = '';
        statusMessage.style.display = 'none';
      }

      // Basic Validation
      if (!name) {
        if (statusMessage) {
          statusMessage.textContent = 'Please enter your name.';
          statusMessage.className = 'form-status-message error';
          statusMessage.style.display = 'block';
        }
        if (nameInput) nameInput.focus();
        return;
      }

      if (!email) {
        if (statusMessage) {
          statusMessage.textContent = 'Please enter your email.';
          statusMessage.className = 'form-status-message error';
          statusMessage.style.display = 'block';
        }
        if (emailInput) emailInput.focus();
        return;
      }

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

      if (!message) {
        if (statusMessage) {
          statusMessage.textContent = 'Please enter your message.';
          statusMessage.className = 'form-status-message error';
          statusMessage.style.display = 'block';
        }
        if (messageInput) messageInput.focus();
        return;
      }

      // Successful submission
      if (statusMessage) {
        statusMessage.textContent = 'Thank you! Your message has been sent successfully.';
        statusMessage.className = 'form-status-message success';
        statusMessage.style.display = 'block';
      }

      // Clear the form fields
      contactForm.reset();
    });
  }
});
