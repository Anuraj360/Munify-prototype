/**
 * MUNify - Delegate Individual MUN Dashboard JavaScript
 * Fully dynamic rendering for any selected MUN (KIT MUN, Walchand MUN, DYP MUN, etc.)
 * Matches Screenshot 1 and Screenshot 2 layouts and behaviors.
 */

// Helper to format Date string to 'Month D, YYYY' (e.g. 'August 31, 2026')
function formatFullDate(dateStr) {
  if (!dateStr) return 'August 31, 2026';
  try {
    // If format is YYYY-MM-DD
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
    // If it's already a parseable date or string
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
  } catch (e) {}
  return dateStr;
}

// Get Active Session
function getActiveSession() {
  const sessionStr = localStorage.getItem('munify_session');
  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr);
      if (session && session.email) return session;
    } catch (e) {}
  }
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

// Get all MUNs database
function getAllMuns() {
  const defaultMuns = [
    {
      id: 'mun_kit_1',
      name: 'KIT MUN',
      subtitle: "Kolhapur's Top MUN",
      conferenceDate: '2026-09-13',
      registrationDeadline: '2026-09-03',
      location: 'Kolhapur',
      description: "Kolhapur's premier Model United Nations conference.",
      posterUrl: '../../assets/images/security-council.jpg'
    },
    {
      id: 'mun_walchand_1',
      name: 'Walchand MUN',
      subtitle: 'xyz',
      conferenceDate: '2026-08-31',
      registrationDeadline: '2026-08-24',
      location: 'Sangli',
      description: 'xyz',
      posterUrl: ''
    },
    {
      id: 'mun_dyp_1',
      name: 'DYP MUN',
      subtitle: 'D.Y. Patil Model United Nations - Sangli',
      conferenceDate: '2026-10-10',
      registrationDeadline: '2026-10-01',
      location: 'Sangli',
      description: 'D.Y. Patil Model United Nations - Sangli edition.',
      posterUrl: '../../assets/images/unep.jpg'
    }
  ];

  const storedStr = localStorage.getItem('munify_muns_db');
  if (storedStr) {
    try {
      const parsed = JSON.parse(storedStr);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }
  return defaultMuns;
}

// Get Delegates Database
function getDelegatesDatabase() {
  const defaultDelegates = [
    {
      id: 'del_kit_1',
      munId: 'mun_kit_1',
      name: 'Anuraj Deshmukh',
      email: 'anurajdeshmukh360@gmail.com',
      phone: '+91 98765 43210',
      committee: '',
      country: '',
      status: 'Pending'
    },
    {
      id: 'del_walchand_1',
      munId: 'mun_walchand_1',
      name: 'Anuraj Deshmukh',
      email: 'anurajdeshmukh360@gmail.com',
      phone: '+91 98765 43210',
      committee: '',
      country: '',
      status: 'Pending'
    }
  ];

  const storedStr = localStorage.getItem('munify_delegates_db');
  if (storedStr) {
    try {
      const parsed = JSON.parse(storedStr);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }
  return defaultDelegates;
}

function saveDelegatesDatabase(data) {
  localStorage.setItem('munify_delegates_db', JSON.stringify(data));
}

document.addEventListener('DOMContentLoaded', () => {
  const session = getActiveSession();

  // 1. Determine Selected MUN ID dynamically
  const urlParams = new URLSearchParams(window.location.search);
  let munId = urlParams.get('munId') || localStorage.getItem('munify_active_mun_id') || 'mun_walchand_1';

  const allMuns = getAllMuns();
  let selectedMUN = allMuns.find(m => m.id === munId);
  if (!selectedMUN) {
    selectedMUN = allMuns[0];
    munId = selectedMUN.id;
  }

  // Update Page Title
  document.title = `${selectedMUN.name} - MUNify`;

  // 2. Delegate Registration for this MUN
  const delegates = getDelegatesDatabase();
  const munDelegates = delegates.filter(d => d.munId === selectedMUN.id);
  const totalDelegatesCount = Math.max(1, munDelegates.length);

  let myRegistration = delegates.find(d => 
    d.munId === selectedMUN.id && (
      (d.email && d.email.toLowerCase() === (session.email || '').toLowerCase()) ||
      (d.name && d.name.toLowerCase() === (session.name || '').toLowerCase())
    )
  );

  // 3. Render Header Card
  const munHeaderTitle = document.getElementById('munHeaderTitle');
  if (munHeaderTitle) {
    munHeaderTitle.textContent = selectedMUN.name;
  }

  // 4. Render Conference Information Card
  const confDescription = document.getElementById('confDescription');
  const confDate = document.getElementById('confDate');
  const confDelegatesCount = document.getElementById('confDelegatesCount');
  const confLocation = document.getElementById('confLocation');
  const confDeadline = document.getElementById('confDeadline');
  const confCommitteesCount = document.getElementById('confCommitteesCount');

  if (confDescription) confDescription.textContent = selectedMUN.description || selectedMUN.subtitle || 'xyz';
  if (confDate) confDate.textContent = formatFullDate(selectedMUN.conferenceDate);
  if (confDelegatesCount) confDelegatesCount.textContent = totalDelegatesCount.toString();
  if (confLocation) confLocation.textContent = selectedMUN.location || 'Sangli';
  if (confDeadline) confDeadline.textContent = formatFullDate(selectedMUN.registrationDeadline);
  if (confCommitteesCount) confCommitteesCount.textContent = '1';

  // 5. Render Current Status Card
  const statusConference = document.getElementById('statusConference');
  const statusCommittee = document.getElementById('statusCommittee');
  const statusCountryPref = document.getElementById('statusCountryPref');
  const statusCountryAssign = document.getElementById('statusCountryAssign');
  const statusPositionPaper = document.getElementById('statusPositionPaper');

  function updateStatusUI() {
    if (statusConference) statusConference.textContent = selectedMUN.name;

    const hasCommittee = myRegistration && myRegistration.committee && myRegistration.committee.trim() !== '';
    const hasPreferences = myRegistration && myRegistration.countryPreferences && myRegistration.countryPreferences.length > 0;
    const hasCountryAssigned = myRegistration && myRegistration.country && myRegistration.country.trim() !== '' && myRegistration.country !== 'Pending';

    // Committee status
    if (statusCommittee) {
      if (hasCommittee) {
        statusCommittee.textContent = myRegistration.committee;
        statusCommittee.className = 'status-value status-val-green';
      } else {
        statusCommittee.textContent = 'Not Selected';
        statusCommittee.className = 'status-value status-val-orange';
      }
    }

    // Country Preferences status
    if (statusCountryPref) {
      if (hasPreferences) {
        statusCountryPref.textContent = 'Submitted';
        statusCountryPref.className = 'status-value status-val-green';
      } else {
        statusCountryPref.textContent = 'Not Submitted';
        statusCountryPref.className = 'status-value status-val-orange';
      }
    }

    // Country Assignment status
    if (statusCountryAssign) {
      if (hasCountryAssigned) {
        statusCountryAssign.textContent = myRegistration.country;
        statusCountryAssign.className = 'status-value status-val-green';
      } else {
        statusCountryAssign.textContent = 'Pending Assignment';
        statusCountryAssign.className = 'status-value status-val-orange';
      }
    }

    // Position Paper status
    if (statusPositionPaper) {
      statusPositionPaper.textContent = 'Not Submitted';
      statusPositionPaper.className = 'status-value status-val-red';
    }

    // Quick Action button states
    const btnRequestCountry = document.getElementById('btnRequestCountry');
    if (btnRequestCountry) {
      if (hasCommittee) {
        btnRequestCountry.disabled = false;
        btnRequestCountry.className = 'btn-quick-action btn-qa-primary';
      } else {
        btnRequestCountry.disabled = true;
        btnRequestCountry.className = 'btn-quick-action btn-qa-disabled';
      }
    }
  }

  updateStatusUI();

  // 6. Quick Action Button Listeners & Modals
  const btnSelectCommittee = document.getElementById('btnSelectCommittee');
  const selectCommitteeModal = document.getElementById('selectCommitteeModal');
  const closeCommitteeModal = document.getElementById('closeCommitteeModal');
  const btnCancelCommitteeModal = document.getElementById('btnCancelCommitteeModal');
  const btnSaveCommitteeModal = document.getElementById('btnSaveCommitteeModal');
  const modalMunNameText = document.getElementById('modalMunNameText');

  if (modalMunNameText) modalMunNameText.textContent = selectedMUN.name;

  if (btnSelectCommittee && selectCommitteeModal) {
    btnSelectCommittee.addEventListener('click', () => {
      selectCommitteeModal.classList.add('active');
    });
  }

  function hideCommitteeModal() {
    if (selectCommitteeModal) selectCommitteeModal.classList.remove('active');
  }

  if (closeCommitteeModal) closeCommitteeModal.addEventListener('click', hideCommitteeModal);
  if (btnCancelCommitteeModal) btnCancelCommitteeModal.addEventListener('click', hideCommitteeModal);

  if (btnSaveCommitteeModal) {
    btnSaveCommitteeModal.addEventListener('click', () => {
      const selectedRadio = document.querySelector('input[name="committeeChoice"]:checked');
      const committeeName = selectedRadio ? selectedRadio.value : 'UNHRC';

      if (!myRegistration) {
        myRegistration = {
          id: 'del_' + selectedMUN.id.replace('mun_', '') + '_' + Date.now(),
          munId: selectedMUN.id,
          name: session.name,
          email: session.email,
          phone: session.phone || '',
          committee: committeeName,
          country: '',
          status: 'Committee Selected'
        };
        delegates.push(myRegistration);
      } else {
        myRegistration.committee = committeeName;
      }
      saveDelegatesDatabase(delegates);
      updateStatusUI();
      hideCommitteeModal();
    });
  }

  // Request Country Modal
  const btnRequestCountry = document.getElementById('btnRequestCountry');
  const requestCountryModal = document.getElementById('requestCountryModal');
  const closeCountryModal = document.getElementById('closeCountryModal');
  const btnCancelCountryModal = document.getElementById('btnCancelCountryModal');
  const btnSaveCountryModal = document.getElementById('btnSaveCountryModal');

  if (btnRequestCountry && requestCountryModal) {
    btnRequestCountry.addEventListener('click', () => {
      if (btnRequestCountry.disabled) return;
      requestCountryModal.classList.add('active');
    });
  }

  function hideCountryModal() {
    if (requestCountryModal) requestCountryModal.classList.remove('active');
  }

  if (closeCountryModal) closeCountryModal.addEventListener('click', hideCountryModal);
  if (btnCancelCountryModal) btnCancelCountryModal.addEventListener('click', hideCountryModal);

  if (btnSaveCountryModal) {
    btnSaveCountryModal.addEventListener('click', () => {
      const p1 = (document.getElementById('countryPref1')?.value || 'Australia').trim();
      const p2 = (document.getElementById('countryPref2')?.value || '').trim();
      const p3 = (document.getElementById('countryPref3')?.value || '').trim();

      if (myRegistration) {
        myRegistration.countryPreferences = [p1, p2, p3].filter(Boolean);
        saveDelegatesDatabase(delegates);
      }
      updateStatusUI();
      hideCountryModal();
    });
  }

  // View Resources Modal
  const btnViewResources = document.getElementById('btnViewResources');
  const resourcesModal = document.getElementById('resourcesModal');
  const closeResourcesModal = document.getElementById('closeResourcesModal');
  const btnCloseResourcesModal = document.getElementById('btnCloseResourcesModal');

  if (btnViewResources && resourcesModal) {
    btnViewResources.addEventListener('click', () => {
      resourcesModal.classList.add('active');
    });
  }

  function hideResourcesModal() {
    if (resourcesModal) resourcesModal.classList.remove('active');
  }

  if (closeResourcesModal) closeResourcesModal.addEventListener('click', hideResourcesModal);
  if (btnCloseResourcesModal) btnCloseResourcesModal.addEventListener('click', hideResourcesModal);

  // Enter Room (Locked) Modal
  const btnEnterRoom = document.getElementById('btnEnterRoom');
  const lockedModal = document.getElementById('lockedModal');
  const closeLockedModal = document.getElementById('closeLockedModal');
  const btnCloseLockedModal = document.getElementById('btnCloseLockedModal');

  if (btnEnterRoom && lockedModal) {
    btnEnterRoom.addEventListener('click', () => {
      lockedModal.classList.add('active');
    });
  }

  function hideLockedModal() {
    if (lockedModal) lockedModal.classList.remove('active');
  }

  if (closeLockedModal) closeLockedModal.addEventListener('click', hideLockedModal);
  if (btnCloseLockedModal) btnCloseLockedModal.addEventListener('click', hideLockedModal);

  // 7. Navbar and Session Management
  const mobileToggle = document.getElementById('mobileNavToggle');
  const navbarLinks = document.getElementById('navbarLinks');
  const navbarActions = document.getElementById('navbarActions');
  if (mobileToggle && navbarLinks && navbarActions) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', !isExpanded);
      navbarLinks.classList.toggle('active');
      navbarActions.classList.toggle('active');
    });
  }

  // Logout Button (Only explicit click clears session)
  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem('munify_session');
      window.location.href = 'login.html';
    });
  }

  // Profile Modal
  const navProfile = document.getElementById('navProfile');
  const profileModal = document.getElementById('profileModal');
  const closeProfileModal = document.getElementById('closeProfileModal');
  const btnDoneProfileModal = document.getElementById('btnDoneProfileModal');
  const modalProfileName = document.getElementById('modalProfileName');
  const modalProfileEmail = document.getElementById('modalProfileEmail');

  function openProfile() {
    if (modalProfileName) modalProfileName.textContent = session.name || 'Anuraj Deshmukh';
    if (modalProfileEmail) modalProfileEmail.textContent = session.email || 'anurajdeshmukh360@gmail.com';
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

  // Close any modal when clicking backdrop
  window.addEventListener('click', (e) => {
    if (e.target === profileModal) closeProfile();
    if (e.target === selectCommitteeModal) hideCommitteeModal();
    if (e.target === requestCountryModal) hideCountryModal();
    if (e.target === resourcesModal) hideResourcesModal();
    if (e.target === lockedModal) hideLockedModal();
  });
});
