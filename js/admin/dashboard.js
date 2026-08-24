/**
 * MUNify - Admin Dashboard JavaScript
 * Handles authentication verification, navigation, admin profile modal, mobile menu, and explicit logout.
 */

/**
 * Verify current session to protect Admin routes
 */
function verifyAdminSession() {
  const sessionStr = localStorage.getItem('munify_session');
  if (!sessionStr) {
    // Unauthenticated user -> Redirect to Login
    const isInsideAdminDir = window.location.pathname.includes('/views/admin/');
    window.location.href = isInsideAdminDir ? '../user/login.html' : 'views/user/login.html';
    return null;
  }

  try {
    const session = JSON.parse(sessionStr);
    const role = (session.role || '').toLowerCase();
    
    // Check if role is admin or organiser
    if (role !== 'admin' && role !== 'organiser') {
      const isInsideAdminDir = window.location.pathname.includes('/views/admin/');
      if (role === 'chair') {
        window.location.href = isInsideAdminDir ? '../chair/dashboard.html' : 'views/chair/dashboard.html';
      } else {
        window.location.href = isInsideAdminDir ? '../user/dashboard.html' : 'views/user/dashboard.html';
      }
      return null;
    }
    return session;
  } catch (err) {
    localStorage.removeItem('munify_session');
    const isInsideAdminDir = window.location.pathname.includes('/views/admin/');
    window.location.href = isInsideAdminDir ? '../user/login.html' : 'views/user/login.html';
    return null;
  }
}

/**
 * Render and attach Admin Profile Modal
 */
function setupAdminProfileModal(session) {
  const profileLink = document.getElementById('adminProfileLink');
  if (!profileLink) return;

  const adminName = session?.name || 'Admin Organiser';
  const adminEmail = session?.email || 'admin@gmail.com';
  const adminRole = (session?.role === 'admin' || session?.role === 'organiser') ? 'Organiser / Administrator' : (session?.role || 'Admin');
  const initial = adminName.charAt(0).toUpperCase();

  // Create modal markup if it does not already exist
  let modalOverlay = document.getElementById('adminProfileModalOverlay');
  if (!modalOverlay) {
    modalOverlay = document.createElement('div');
    modalOverlay.id = 'adminProfileModalOverlay';
    modalOverlay.className = 'admin-profile-modal-overlay';
    modalOverlay.innerHTML = `
      <div class="admin-profile-modal" id="adminProfileModal" role="dialog" aria-modal="true" aria-labelledby="adminProfileModalTitle">
        <div class="admin-profile-modal-header">
          <h2 class="admin-profile-modal-title" id="adminProfileModalTitle">
            <svg style="width:22px;height:22px;fill:currentColor;" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
            Admin Profile
          </h2>
          <button type="button" class="admin-profile-modal-close" id="closeProfileModalBtn" aria-label="Close Profile Modal">&times;</button>
        </div>
        <div class="admin-profile-modal-body">
          <div class="admin-profile-avatar-row">
            <div class="admin-profile-avatar">${initial}</div>
            <div class="admin-profile-name-group">
              <h3 id="profileModalAdminName">${adminName}</h3>
              <span class="admin-profile-badge" id="profileModalAdminRole">${adminRole}</span>
            </div>
          </div>
          <div class="admin-profile-field">
            <span class="admin-profile-field-label">Email Address</span>
            <span class="admin-profile-field-value" id="profileModalAdminEmail">${adminEmail}</span>
          </div>
          <div class="admin-profile-field">
            <span class="admin-profile-field-label">Account Role</span>
            <span class="admin-profile-field-value">Administrator</span>
          </div>
          <div class="admin-profile-field">
            <span class="admin-profile-field-label">Authentication Status</span>
            <span class="admin-profile-field-value" style="color:#059669;">&bull; Active Session</span>
          </div>
          <div class="admin-profile-field">
            <span class="admin-profile-field-label">Permissions</span>
            <span class="admin-profile-field-value">Full Platform Access</span>
          </div>
        </div>
        <div class="admin-profile-modal-footer">
          <button type="button" class="btn-profile-close" id="dismissProfileModalBtn">Close Profile</button>
        </div>
      </div>
    `;
    document.body.appendChild(modalOverlay);

    // Event listeners to close modal
    const closeBtn = document.getElementById('closeProfileModalBtn');
    const dismissBtn = document.getElementById('dismissProfileModalBtn');

    const closeModal = () => {
      modalOverlay.classList.remove('active');
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (dismissBtn) dismissBtn.addEventListener('click', closeModal);

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        closeModal();
      }
    });
  }

  // Open modal on profile link click (prevents page redirect or reload)
  profileLink.addEventListener('click', (e) => {
    e.preventDefault();
    modalOverlay.classList.add('active');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. Verify and enforce authentication protection for Admin Dashboard
  const activeSession = verifyAdminSession();
  if (!activeSession) {
    return; // Redirection handled in verifyAdminSession
  }

  // 2. Setup Admin Profile Modal interaction
  setupAdminProfileModal(activeSession);

  // 3. Mobile Navigation Toggle
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

  // 4. Handle Explicit Logout Action (ONLY explicit Logout clears authentication)
  const logoutBtn = document.getElementById('adminLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Clear authenticated session only on explicit logout
      localStorage.removeItem('munify_session');
      
      // Direct navigation to user login
      const isInsideAdminDir = window.location.pathname.includes('/views/admin/');
      window.location.href = isInsideAdminDir ? '../user/login.html' : 'views/user/login.html';
    });
  }

  // 5. Render Dynamic MUN Cards from Storage
  renderAdminMunCards();
});

/**
 * Render all MUNs from persistent storage into Dashboard Cards Grid
 */
function renderAdminMunCards() {
  const container = document.getElementById('munCardsContainer');
  if (!container) return;

  const defaultMuns = [
    {
      id: 'mun_walchand_1',
      name: 'Walchand MUN',
      conferenceDate: '2026-10-15',
      registrationDeadline: '2026-09-30',
      location: 'Sangli, Maharashtra',
      description: 'xyz',
      image: '',
      createdAt: '2026-01-01T00:00:00.000Z',
      createdBy: 'admin@gmail.com'
    }
  ];

  let muns = defaultMuns;
  const storedStr = localStorage.getItem('munify_muns_db');
  if (storedStr) {
    try {
      const parsed = JSON.parse(storedStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        muns = parsed;
      } else {
        localStorage.setItem('munify_muns_db', JSON.stringify(defaultMuns));
      }
    } catch (e) {
      localStorage.setItem('munify_muns_db', JSON.stringify(defaultMuns));
    }
  } else {
    localStorage.setItem('munify_muns_db', JSON.stringify(defaultMuns));
  }

  // Clear existing static placeholder and render dynamic cards
  container.innerHTML = '';
  muns.forEach((mun, idx) => {
    const card = document.createElement('div');
    card.className = 'mun-card';
    card.id = `munCard_${mun.id || idx}`;

    card.innerHTML = `
      <h2 class="mun-card-title" id="munTitle_${mun.id || idx}">${escapeHtml(mun.name || 'MUN Conference')}</h2>
      <p class="mun-card-desc" id="munDesc_${mun.id || idx}">${escapeHtml(mun.description || '')}</p>
      <a href="mun-dashboard.html?munId=${encodeURIComponent(mun.id || 'mun_walchand_1')}" class="btn-open-dashboard" id="btnOpenDashboard_${mun.id || idx}">Open Dashboard</a>
    `;

    container.appendChild(card);
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

