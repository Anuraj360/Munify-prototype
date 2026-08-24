/**
 * MUNify - Create New MUN Page JavaScript
 * Handles authentication verification, form validation, date consistency checks,
 * image reading, persistent storage in localStorage, and navigation back to Admin Dashboard.
 */

/**
 * Verify current session to protect Admin routes
 */
function verifyAdminSession() {
  const sessionStr = localStorage.getItem('munify_session');
  if (!sessionStr) {
    const isInsideAdminDir = window.location.pathname.includes('/views/admin/');
    window.location.href = isInsideAdminDir ? '../user/login.html' : 'views/user/login.html';
    return null;
  }

  try {
    const session = JSON.parse(sessionStr);
    const role = (session.role || '').toLowerCase();
    
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

  profileLink.addEventListener('click', (e) => {
    e.preventDefault();
    modalOverlay.classList.add('active');
  });
}

/**
 * Get all existing MUNs or initialize with default Walchand MUN
 */
function getExistingMuns() {
  const existingStr = localStorage.getItem('munify_muns_db');
  if (existingStr) {
    try {
      const parsed = JSON.parse(existingStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      // Fallback
    }
  }

  // Initial seed
  const initialMuns = [
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
  localStorage.setItem('munify_muns_db', JSON.stringify(initialMuns));
  return initialMuns;
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. Verify Admin Session
  const activeSession = verifyAdminSession();
  if (!activeSession) return;

  // 2. Setup Profile Modal
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

  // 4. Handle Explicit Logout
  const logoutBtn = document.getElementById('adminLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('munify_session');
      const isInsideAdminDir = window.location.pathname.includes('/views/admin/');
      window.location.href = isInsideAdminDir ? '../user/login.html' : 'views/user/login.html';
    });
  }

  // 5. Handle Form Submission
  const createMunForm = document.getElementById('createMunForm');
  const errorAlert = document.getElementById('formAlertError');

  function showError(msg) {
    if (errorAlert) {
      errorAlert.textContent = msg;
      errorAlert.classList.add('active');
      errorAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      alert(msg);
    }
  }

  function hideError() {
    if (errorAlert) {
      errorAlert.textContent = '';
      errorAlert.classList.remove('active');
    }
  }

  if (createMunForm) {
    createMunForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideError();

      const nameInput = document.getElementById('munName');
      const confDateInput = document.getElementById('conferenceDate');
      const regDateInput = document.getElementById('registrationDeadline');
      const locationInput = document.getElementById('munLocation');
      const descInput = document.getElementById('munDescription');
      const imageInput = document.getElementById('munImage');

      const name = nameInput ? nameInput.value.trim() : '';
      const confDate = confDateInput ? confDateInput.value.trim() : '';
      const regDate = regDateInput ? regDateInput.value.trim() : '';
      const location = locationInput ? locationInput.value.trim() : '';
      const description = descInput ? descInput.value.trim() : '';

      // Frontend Validations
      if (!name) {
        showError('Please enter the MUN Name.');
        if (nameInput) nameInput.focus();
        return;
      }

      if (!confDate) {
        showError('Please select the Conference Date.');
        if (confDateInput) confDateInput.focus();
        return;
      }

      if (!regDate) {
        showError('Please select the Registration Deadline.');
        if (regDateInput) regDateInput.focus();
        return;
      }

      // Logical Date Validation: Registration deadline should not be after Conference Date
      const parsedConfDate = new Date(confDate);
      const parsedRegDate = new Date(regDate);

      if (parsedRegDate > parsedConfDate) {
        showError('Registration Deadline cannot be after the Conference Date.');
        if (regDateInput) regDateInput.focus();
        return;
      }

      if (!location) {
        showError('Please enter the Location.');
        if (locationInput) locationInput.focus();
        return;
      }

      if (!description) {
        showError('Please enter a description for the conference.');
        if (descInput) descInput.focus();
        return;
      }

      // Read image file if uploaded
      let imageData = '';
      if (imageInput && imageInput.files && imageInput.files[0]) {
        const file = imageInput.files[0];
        try {
          imageData = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => resolve('');
            reader.readAsDataURL(file);
          });
        } catch (fileErr) {
          imageData = '';
        }
      }

      // Create new MUN record
      const newMun = {
        id: 'mun_' + Date.now(),
        name: name,
        conferenceDate: confDate,
        registrationDeadline: regDate,
        location: location,
        description: description,
        image: imageData,
        createdAt: new Date().toISOString(),
        createdBy: activeSession.email || 'admin@gmail.com'
      };

      // Save to existing database
      const existingMuns = getExistingMuns();
      existingMuns.push(newMun);
      localStorage.setItem('munify_muns_db', JSON.stringify(existingMuns));

      // Successfully created -> Navigate back to Admin Dashboard with active session preserved
      window.location.href = 'dashboard.html';
    });
  }
});
