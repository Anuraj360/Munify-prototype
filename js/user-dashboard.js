/**
 * MUNify - Delegate Dashboard JavaScript
 * Handles dynamic MUN rendering, registration state, country assignment display,
 * interactive modals, and strictly preserves authentication session across navigation.
 */

// Format Date string (e.g., "2026-09-13" -> "Sep 13, 2026")
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

// Get or Initialize Session
function getActiveSession() {
  const sessionStr = localStorage.getItem('munify_session');
  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr);
      if (session && session.role) {
        const role = (session.role || '').toLowerCase();
        // If wrong role arrives on delegate dashboard, route them properly
        if (role === 'admin' || role === 'organiser') {
          window.location.href = '../admin/dashboard.html';
          return null;
        } else if (role === 'chair') {
          window.location.href = '../chair/dashboard.html';
          return null;
        }
        return session;
      }
    } catch (e) {}
  }

  // Default seed delegate session to match initial state in screenshots
  const defaultSession = {
    userId: 'del_user_anuraj',
    name: 'Anuraj Deshmukh',
    email: 'anurajdeshmukh360@gmail.com',
    role: 'delegate',
    authenticatedAt: new Date().toISOString()
  };
  localStorage.setItem('munify_session', JSON.stringify(defaultSession));
  return defaultSession;
}

// Get or Seed MUNs Database
function getAllMuns() {
  const defaultMuns = [
    {
      id: 'mun_kit_1',
      name: 'KIT MUN',
      subtitle: "Kolhapur's Top MUN",
      conferenceDate: '2026-09-13',
      registrationDeadline: '2026-09-03',
      location: 'Kolhapur',
      description: "Kolhapur's premier Model United Nations conference featuring competitive committees and international diplomacy debates.",
      posterUrl: '../../assets/images/security-council.jpg',
      delegatesCount: 4,
      createdAt: '2026-01-02T00:00:00.000Z'
    },
    {
      id: 'mun_walchand_1',
      name: 'Walchand MUN',
      subtitle: 'xyz',
      conferenceDate: '2026-10-15',
      registrationDeadline: '2026-10-01',
      location: 'Sangli, Maharashtra',
      description: 'Walchand Model United Nations Annual Conference - xyz edition.',
      posterUrl: '', // Coming soon
      delegatesCount: 4,
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'mun_dyp_1',
      name: 'DYP MUN',
      subtitle: 'D.Y. Patil Model United Nations - Sangli',
      conferenceDate: '2026-10-10',
      registrationDeadline: '2026-10-01',
      location: 'Sangli',
      description: 'D.Y. Patil Model United Nations - Sangli edition fostering world-class debates.',
      posterUrl: '../../assets/images/unep.jpg',
      delegatesCount: 2,
      createdAt: '2026-01-03T00:00:00.000Z'
    }
  ];

  const storedStr = localStorage.getItem('munify_muns_db');
  if (storedStr) {
    try {
      const parsed = JSON.parse(storedStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure subtitles, locations and formatted dates exist
        return parsed.map(mun => ({
          ...mun,
          location: mun.id === 'mun_walchand_1' && mun.location === 'Sangli' ? 'Sangli, Maharashtra' : mun.location,
          conferenceDate: mun.id === 'mun_walchand_1' && mun.conferenceDate === '2026-08-31' ? '2026-10-15' : mun.conferenceDate,
          subtitle: mun.subtitle || (mun.id === 'mun_walchand_1' ? 'xyz' : mun.id === 'mun_kit_1' ? "Kolhapur's Top MUN" : mun.description || 'Annual Conference'),
          posterUrl: mun.posterUrl !== undefined ? mun.posterUrl : (mun.id === 'mun_kit_1' ? '../../assets/images/security-council.jpg' : '')
        }));
      }
    } catch (e) {}
  }

  localStorage.setItem('munify_muns_db', JSON.stringify(defaultMuns));
  return defaultMuns;
}

// Get or Seed Delegates Database
function getDelegatesDatabase() {
  const defaultDelegates = [
    {
      id: 'del_kit_1',
      munId: 'mun_kit_1',
      name: 'Anuraj Deshmukh',
      email: 'anurajdeshmukh360@gmail.com',
      phone: '+91 98765 43210',
      committee: 'UNHRC',
      country: 'Australia',
      status: 'Assigned',
      registeredAt: '2026-08-10'
    },
    {
      id: 'del_walchand_1',
      munId: 'mun_walchand_1',
      name: 'Anuraj Deshmukh',
      email: 'anurajdeshmukh360@gmail.com',
      phone: '+91 98765 43210',
      committee: 'UNHRC',
      country: 'Australia',
      status: 'Assigned',
      registeredAt: '2026-08-10'
    },
    {
      id: 'del_kit_2',
      munId: 'mun_kit_1',
      name: 'Priya Patil',
      email: 'priya.patil@example.com',
      phone: '+91 98234 56781',
      committee: 'UNSC',
      country: 'Japan',
      status: 'Assigned',
      registeredAt: '2026-08-11'
    },
    {
      id: 'del_walchand_2',
      munId: 'mun_walchand_1',
      name: 'Sneha Joshi',
      email: 'sneha.joshi@example.com',
      phone: '+91 99123 45678',
      committee: 'UNGA',
      country: 'France',
      status: 'Assigned',
      registeredAt: '2026-08-14'
    }
  ];

  const storedStr = localStorage.getItem('munify_delegates_db');
  if (storedStr) {
    try {
      const parsed = JSON.parse(storedStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // If walchand delegate assignment is missing for Anuraj, ensure it exists
        const hasWalchand = parsed.some(d => d.munId === 'mun_walchand_1' && (d.email === 'anurajdeshmukh360@gmail.com' || d.name === 'Anuraj Deshmukh'));
        if (!hasWalchand) {
          parsed.push({
            id: 'del_walchand_1',
            munId: 'mun_walchand_1',
            name: 'Anuraj Deshmukh',
            email: 'anurajdeshmukh360@gmail.com',
            phone: '+91 98765 43210',
            committee: 'UNHRC',
            country: 'Australia',
            status: 'Assigned',
            registeredAt: '2026-08-10'
          });
          localStorage.setItem('munify_delegates_db', JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch (e) {}
  }

  localStorage.setItem('munify_delegates_db', JSON.stringify(defaultDelegates));
  return defaultDelegates;
}

// Save Delegates Database
function saveDelegatesDatabase(delegates) {
  localStorage.setItem('munify_delegates_db', JSON.stringify(delegates));
}

// Global modal state
let pendingRegisterMunId = null;

document.addEventListener('DOMContentLoaded', () => {
  const session = getActiveSession();
  if (!session) return;

  // 1. Update Welcome Name
  const delegateNameElem = document.getElementById('delegateName');
  if (delegateNameElem) {
    delegateNameElem.textContent = session.name || 'Anuraj Deshmukh';
  }

  // 2. Mobile Nav Toggle
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

  // 3. Navigation Links (Overview, About, Contact Us, Profile)
  // Ensure clicking them preserves authentication session
  const navOverview = document.getElementById('navOverview');
  if (navOverview) {
    navOverview.addEventListener('click', (e) => {
      // Stays on delegate dashboard
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  const brandLogo = document.getElementById('brandLogo');
  if (brandLogo) {
    brandLogo.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 4. Logout Handler (ONLY Logout button clears session)
  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem('munify_session');
      window.location.href = 'login.html';
    });
  }

  // 5. Profile Modal Handlers
  const navProfile = document.getElementById('navProfile');
  const profileModal = document.getElementById('profileModal');
  const closeProfileModal = document.getElementById('closeProfileModal');
  const btnDoneProfileModal = document.getElementById('btnDoneProfileModal');
  const modalProfileName = document.getElementById('modalProfileName');
  const modalProfileEmail = document.getElementById('modalProfileEmail');
  const modalProfileCount = document.getElementById('modalProfileCount');

  function openProfile() {
    if (modalProfileName) modalProfileName.textContent = session.name || 'Anuraj Deshmukh';
    if (modalProfileEmail) modalProfileEmail.textContent = session.email || 'anurajdeshmukh360@gmail.com';
    
    const delegates = getDelegatesDatabase();
    const myRegistrations = delegates.filter(d => 
      (d.email && d.email.toLowerCase() === (session.email || '').toLowerCase()) ||
      (d.name && d.name.toLowerCase() === (session.name || '').toLowerCase())
    );
    if (modalProfileCount) modalProfileCount.textContent = myRegistrations.length.toString();

    if (profileModal) profileModal.classList.add('active');
  }

  function closeProfile() {
    if (profileModal) profileModal.classList.remove('active');
  }

  if (navProfile) {
    navProfile.addEventListener('click', (e) => {
      e.preventDefault();
      openProfile();
    });
  }
  if (closeProfileModal) closeProfileModal.addEventListener('click', closeProfile);
  if (btnDoneProfileModal) btnDoneProfileModal.addEventListener('click', closeProfile);

  // 6. Notice Modal Handlers
  const noticeModal = document.getElementById('noticeModal');
  const closeNoticeModal = document.getElementById('closeNoticeModal');
  const btnAckNotice = document.getElementById('btnAckNotice');
  const noticeModalMessage = document.getElementById('noticeModalMessage');

  function showNotice(message) {
    if (noticeModalMessage) noticeModalMessage.textContent = message;
    if (noticeModal) noticeModal.classList.add('active');
  }

  function hideNotice() {
    if (noticeModal) noticeModal.classList.remove('active');
  }

  if (closeNoticeModal) closeNoticeModal.addEventListener('click', hideNotice);
  if (btnAckNotice) btnAckNotice.addEventListener('click', hideNotice);

  // 7. Details Modal Handlers
  const detailsModal = document.getElementById('detailsModal');
  const closeDetailsModal = document.getElementById('closeDetailsModal');
  const btnCloseDetailsModalAction = document.getElementById('btnCloseDetailsModalAction');
  const detailsModalTitle = document.getElementById('detailsModalTitle');
  const detailsModalBody = document.getElementById('detailsModalBody');

  function showMunDetails(munId) {
    const allMuns = getAllMuns();
    const mun = allMuns.find(m => m.id === munId) || allMuns[0];
    const delegates = getDelegatesDatabase();
    const myReg = delegates.find(d => 
      d.munId === mun.id && (
        (d.email && d.email.toLowerCase() === (session.email || '').toLowerCase()) ||
        (d.name && d.name.toLowerCase() === (session.name || '').toLowerCase())
      )
    );

    if (detailsModalTitle) detailsModalTitle.textContent = mun.name + ' - Overview';
    if (detailsModalBody) {
      detailsModalBody.innerHTML = `
        <div class="modal-body-detail"><strong>Conference:</strong> ${mun.name}</div>
        <div class="modal-body-detail"><strong>Tagline:</strong> ${mun.subtitle || mun.description || ''}</div>
        <div class="modal-body-detail"><strong>Date:</strong> ${formatDate(mun.conferenceDate)}</div>
        <div class="modal-body-detail"><strong>Location:</strong> ${mun.location}</div>
        <div class="modal-body-detail"><strong>Registration Deadline:</strong> ${formatDate(mun.registrationDeadline)}</div>
        ${myReg ? `
          <div class="modal-body-detail" style="margin-top:16px; padding:12px; background:#d1fae5; border-radius:6px;">
            <strong style="color:#166534;">Your Assignment:</strong><br>
            Committee: <strong>${myReg.committee || 'UNHRC'}</strong><br>
            Assigned Country: <strong>${myReg.country || 'Pending'}</strong><br>
            Status: <strong>${myReg.status || 'Assigned'}</strong>
          </div>
        ` : `
          <div class="modal-body-detail" style="margin-top:14px; padding:10px; background:#eff6ff; border-radius:6px; color:#1e40af;">
            You are not registered for this conference yet. Click "Register Now" on the dashboard to participate.
          </div>
        `}
      `;
    }

    if (detailsModal) detailsModal.classList.add('active');
  }

  function hideMunDetails() {
    if (detailsModal) detailsModal.classList.remove('active');
  }

  if (closeDetailsModal) closeDetailsModal.addEventListener('click', hideMunDetails);
  if (btnCloseDetailsModalAction) btnCloseDetailsModalAction.addEventListener('click', hideMunDetails);

  // 8. Register Modal Handlers
  const registerModal = document.getElementById('registerModal');
  const closeRegisterModal = document.getElementById('closeRegisterModal');
  const btnCancelRegister = document.getElementById('btnCancelRegister');
  const btnConfirmRegister = document.getElementById('btnConfirmRegister');
  const registerMunName = document.getElementById('registerMunName');
  const regModalDelegateName = document.getElementById('regModalDelegateName');
  const regModalDelegateEmail = document.getElementById('regModalDelegateEmail');
  const regCommitteeSelect = document.getElementById('regCommitteeSelect');

  function openRegisterModal(munId) {
    const allMuns = getAllMuns();
    const mun = allMuns.find(m => m.id === munId);
    if (!mun) return;

    pendingRegisterMunId = munId;
    if (registerMunName) registerMunName.textContent = mun.name;
    if (regModalDelegateName) regModalDelegateName.textContent = session.name || 'Anuraj Deshmukh';
    if (regModalDelegateEmail) regModalDelegateEmail.textContent = session.email || 'anurajdeshmukh360@gmail.com';

    if (registerModal) registerModal.classList.add('active');
  }

  function hideRegisterModal() {
    if (registerModal) registerModal.classList.remove('active');
    pendingRegisterMunId = null;
  }

  if (closeRegisterModal) closeRegisterModal.addEventListener('click', hideRegisterModal);
  if (btnCancelRegister) btnCancelRegister.addEventListener('click', hideRegisterModal);

  if (btnConfirmRegister) {
    btnConfirmRegister.addEventListener('click', () => {
      if (!pendingRegisterMunId) return;

      const delegates = getDelegatesDatabase();
      const committee = regCommitteeSelect ? regCommitteeSelect.value : 'UNHRC';

      const newRegistration = {
        id: 'del_' + pendingRegisterMunId.replace('mun_', '') + '_' + Date.now(),
        munId: pendingRegisterMunId,
        name: session.name || 'Anuraj Deshmukh',
        email: session.email || 'anurajdeshmukh360@gmail.com',
        phone: '+91 98765 43210',
        committee: committee,
        country: 'Pending',
        status: 'Pending',
        registeredAt: new Date().toISOString().split('T')[0]
      };

      delegates.push(newRegistration);
      saveDelegatesDatabase(delegates);
      hideRegisterModal();
      renderDashboard();
    });
  }

  // 9. Unregister Handler
  function handleUnregister(munId) {
    const allMuns = getAllMuns();
    const mun = allMuns.find(m => m.id === munId);
    const munName = mun ? mun.name : 'this MUN';

    const delegates = getDelegatesDatabase();
    const myReg = delegates.find(d => 
      d.munId === munId && (
        (d.email && d.email.toLowerCase() === (session.email || '').toLowerCase()) ||
        (d.name && d.name.toLowerCase() === (session.name || '').toLowerCase())
      )
    );

    if (myReg && myReg.country && myReg.country !== 'Pending' && myReg.status === 'Assigned') {
      showNotice(`You cannot unregister after country assignment. Contact the organizer if you need to withdraw from ${munName}.`);
    } else {
      if (confirm(`Are you sure you want to unregister from ${munName}?`)) {
        const updated = delegates.filter(d => d !== myReg);
        saveDelegatesDatabase(updated);
        renderDashboard();
      }
    }
  }

  // 10. Render Full Dashboard (My MUNs & Available MUNs)
  function renderDashboard() {
    const allMuns = getAllMuns();
    const delegates = getDelegatesDatabase();

    // Find all registrations for this delegate
    const myRegistrations = delegates.filter(d => 
      (d.email && d.email.toLowerCase() === (session.email || '').toLowerCase()) ||
      (d.name && d.name.toLowerCase() === (session.name || '').toLowerCase())
    );

    const registeredMunIds = new Set(myRegistrations.map(r => r.munId));

    // Render "My MUNs" Grid
    const myMunsGrid = document.getElementById('myMunsGrid');
    if (myMunsGrid) {
      if (myRegistrations.length === 0) {
        myMunsGrid.innerHTML = `
          <p class="empty-state-text">You are not registered for any MUN conferences yet. Explore Available MUNs below to register.</p>
        `;
      } else {
        myMunsGrid.innerHTML = myRegistrations.map(reg => {
          const mun = allMuns.find(m => m.id === reg.munId) || {
            id: reg.munId,
            name: 'KIT MUN',
            subtitle: "Kolhapur's Top MUN",
            conferenceDate: '2026-09-13',
            location: 'Kolhapur'
          };

          const isAssigned = reg.status === 'Assigned' && reg.country && reg.country !== 'Pending';
          const assignedCountry = reg.country || 'Australia';

          return `
            <div class="delegate-card registered-mun-card" id="card_my_${mun.id}">
              <div class="status-pill status-assigned" id="statusBadge_${mun.id}">
                <span class="pill-check">✓</span> COUNTRY ASSIGNED
              </div>

              <h3 class="card-mun-title" id="myMunTitle_${mun.id}">${mun.name}</h3>
              <p class="card-mun-subtitle" id="myMunSubtitle_${mun.id}">${mun.subtitle || mun.description || "Kolhapur's Top MUN"}</p>

              <div class="card-meta-list">
                <div class="card-meta-item">
                  <span class="meta-label">Date:</span>
                  <span class="meta-val">${formatDate(mun.conferenceDate)}</span>
                </div>
                <div class="card-meta-item">
                  <span class="meta-label">Location:</span>
                  <span class="meta-val">${mun.location}</span>
                </div>
              </div>

              <div class="country-assigned-box" id="countryBox_${mun.id}">
                <div class="assigned-title">
                  <span class="pill-check">✓</span> Country Assigned: <span class="assigned-country-val">${assignedCountry}</span>
                </div>
                <p class="assigned-note">
                  You cannot unregister after country assignment. Contact the organizer if you need to withdraw.
                </p>
              </div>

              <div class="card-actions-row">
                <button type="button" class="btn-card-details" data-mun-id="${mun.id}" id="btnDetails_${mun.id}">Details</button>
                <button type="button" class="btn-card-enter-mun" data-mun-id="${mun.id}" id="btnEnterMun_${mun.id}">Enter MUN</button>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Render "Available MUNs" Grid
    const availableMunsGrid = document.getElementById('availableMunsGrid');
    if (availableMunsGrid) {
      if (allMuns.length === 0) {
        availableMunsGrid.innerHTML = `
          <p class="empty-state-text">No MUN conferences available at the moment. Please check back later.</p>
        `;
      } else {
        availableMunsGrid.innerHTML = allMuns.map(mun => {
          const isRegistered = registeredMunIds.has(mun.id);
          const hasPoster = mun.posterUrl && mun.posterUrl.trim().length > 0;

          return `
            <div class="delegate-card available-mun-card" id="card_avail_${mun.id}">
              <div class="mun-poster-wrapper">
                ${hasPoster ? `
                  <img 
                    src="${mun.posterUrl}" 
                    alt="${mun.name}" 
                    class="mun-poster-img"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                  >
                  <div class="poster-placeholder-box" style="display:none;">
                    <div class="placeholder-icon-circle">
                      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.8">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                    </div>
                    <span class="coming-soon-text">COMING SOON</span>
                  </div>
                ` : `
                  <div class="poster-placeholder-box">
                    <div class="placeholder-icon-circle">
                      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.8">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                    </div>
                    <span class="coming-soon-text">COMING SOON</span>
                  </div>
                `}
              </div>

              <h3 class="card-mun-title" id="availMunTitle_${mun.id}">${mun.name}</h3>
              <p class="card-mun-subtitle" id="availMunSubtitle_${mun.id}">${mun.subtitle || mun.description || ''}</p>

              <div class="card-meta-list">
                <div class="card-meta-item">
                  <span class="meta-label">Date:</span>
                  <span class="meta-val">${formatDate(mun.conferenceDate)}</span>
                </div>
                <div class="card-meta-item">
                  <span class="meta-label">Location:</span>
                  <span class="meta-val">${mun.location}</span>
                </div>
                <div class="card-meta-item">
                  <span class="meta-label">Registration Deadline:</span>
                  <span class="meta-val">${formatDate(mun.registrationDeadline)}</span>
                </div>
              </div>

              ${isRegistered ? `
                <button type="button" class="btn-already-registered" disabled id="btnAlreadyReg_${mun.id}">Already Registered</button>
              ` : `
                <button type="button" class="btn-register-now" data-mun-id="${mun.id}" id="btnRegister_${mun.id}">Register Now</button>
              `}
            </div>
          `;
        }).join('');
      }
    }

    // Attach Event Listeners to Dynamically Created Buttons
    document.querySelectorAll('.btn-card-details').forEach(btn => {
      btn.addEventListener('click', () => {
        const munId = btn.getAttribute('data-mun-id');
        showMunDetails(munId);
      });
    });

    document.querySelectorAll('.btn-card-enter-mun').forEach(btn => {
      btn.addEventListener('click', () => {
        const munId = btn.getAttribute('data-mun-id');
        if (!munId) return;
        localStorage.setItem('munify_active_mun_id', munId);
        window.location.href = `mun-dashboard.html?munId=${encodeURIComponent(munId)}`;
      });
    });

    document.querySelectorAll('.btn-register-now').forEach(btn => {
      btn.addEventListener('click', () => {
        const munId = btn.getAttribute('data-mun-id');
        if (!munId) return;
        localStorage.setItem('munify_register_mun_id', munId);
        window.location.href = `register.html?munId=${encodeURIComponent(munId)}`;
      });
    });
  }

  // Initial Render
  renderDashboard();

  // Close modals when clicking outside modal box
  window.addEventListener('click', (e) => {
    if (e.target === profileModal) closeProfile();
    if (e.target === detailsModal) hideMunDetails();
    if (e.target === registerModal) hideRegisterModal();
    if (e.target === noticeModal) hideNotice();
  });
});
