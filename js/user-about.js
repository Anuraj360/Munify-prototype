/**
 * MUNify - User About Page JavaScript
 * Handles mobile responsive menu toggle and active session navbar preservation
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
    const targetDashboard = isDelegate ? 'dashboard.html' : (role === 'chair' ? '../chair/dashboard.html' : '../admin/dashboard.html');

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
          window.location.href = 'login.html';
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
});
