/**
 * MUNify - Delegate Registration Form JavaScript
 * Handles form validation, session auto-population, MUN-specific registration,
 * and seamless redirect back to the Delegate Dashboard without breaking authentication.
 */

// Helper to get or initialize session
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

// Get all MUNs
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
      conferenceDate: '2026-10-15',
      registrationDeadline: '2026-10-01',
      location: 'Sangli, Maharashtra',
      description: 'Walchand Model United Nations Annual Conference - xyz edition.',
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
      committee: 'UNHRC',
      country: 'Australia',
      status: 'Assigned'
    },
    {
      id: 'del_walchand_1',
      munId: 'mun_walchand_1',
      name: 'Anuraj Deshmukh',
      email: 'anurajdeshmukh360@gmail.com',
      phone: '+91 98765 43210',
      committee: 'UNHRC',
      country: 'Australia',
      status: 'Assigned'
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

  // 1. Determine target MUN ID from URL or localStorage
  const urlParams = new URLSearchParams(window.location.search);
  let munId = urlParams.get('munId') || localStorage.getItem('munify_register_mun_id') || 'mun_dyp_1';

  const allMuns = getAllMuns();
  let targetMun = allMuns.find(m => m.id === munId);
  if (!targetMun) {
    targetMun = allMuns[0];
    munId = targetMun.id;
  }

  // 2. Pre-fill Name and Email from session
  const fullNameInput = document.getElementById('fullName');
  const emailInput = document.getElementById('email');
  const dobInput = document.getElementById('dob');
  const genderInput = document.getElementById('gender');
  const phoneInput = document.getElementById('phone');
  const schoolCollegeInput = document.getElementById('schoolCollege');
  const pastMunsCountInput = document.getElementById('pastMunsCount');
  const regAlert = document.getElementById('regAlert');
  const form = document.getElementById('delegateRegForm');

  if (fullNameInput && session.name) {
    fullNameInput.value = session.name;
  }
  if (emailInput && session.email) {
    emailInput.value = session.email;
  }
  if (phoneInput && session.phone) {
    phoneInput.value = session.phone;
  }
  if (schoolCollegeInput && session.college) {
    schoolCollegeInput.value = session.college;
  }

  // 3. Clear invalid highlighting on input
  const allInputs = [fullNameInput, dobInput, genderInput, emailInput, phoneInput, schoolCollegeInput, pastMunsCountInput];
  allInputs.forEach(input => {
    if (!input) return;
    input.addEventListener('input', () => {
      input.classList.remove('is-invalid');
      if (regAlert) regAlert.style.display = 'none';
    });
    input.addEventListener('change', () => {
      input.classList.remove('is-invalid');
      if (regAlert) regAlert.style.display = 'none';
    });
  });

  // 4. Form Validation & Submission
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      let hasError = false;
      let firstErrorElement = null;

      // Validate required fields
      const requiredFields = [
        { el: fullNameInput, name: 'Full Name' },
        { el: dobInput, name: 'Date of Birth' },
        { el: genderInput, name: 'Gender' },
        { el: emailInput, name: 'Email Address' },
        { el: phoneInput, name: 'Phone Number' },
        { el: schoolCollegeInput, name: 'School / College Name' },
        { el: pastMunsCountInput, name: 'Number of MUNs Participated' }
      ];

      requiredFields.forEach(({ el }) => {
        if (!el || !el.value || el.value.trim() === '') {
          el.classList.add('is-invalid');
          hasError = true;
          if (!firstErrorElement) firstErrorElement = el;
        } else {
          el.classList.remove('is-invalid');
        }
      });

      // Specific validation for past MUN count (must be >= 0)
      if (pastMunsCountInput && pastMunsCountInput.value !== '') {
        const countVal = parseInt(pastMunsCountInput.value, 10);
        if (isNaN(countVal) || countVal < 0) {
          pastMunsCountInput.classList.add('is-invalid');
          hasError = true;
          if (!firstErrorElement) firstErrorElement = pastMunsCountInput;
        }
      }

      if (hasError) {
        if (regAlert) {
          regAlert.className = 'reg-alert alert-error';
          regAlert.textContent = 'Please fill in all required fields marked with * before submitting.';
          regAlert.style.display = 'block';
          regAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        if (firstErrorElement) firstErrorElement.focus();
        return;
      }

      // Save Registration
      const delegates = getDelegatesDatabase();
      const userEmail = (emailInput.value || session.email || '').trim();
      const userName = (fullNameInput.value || session.name || '').trim();

      // Check if already registered
      const alreadyRegistered = delegates.some(d => 
        d.munId === targetMun.id && (
          (d.email && d.email.toLowerCase() === userEmail.toLowerCase()) ||
          (d.name && d.name.toLowerCase() === userName.toLowerCase())
        )
      );

      if (!alreadyRegistered) {
        const newRegistration = {
          id: 'del_' + targetMun.id.replace('mun_', '') + '_' + Date.now(),
          munId: targetMun.id,
          name: userName,
          email: userEmail,
          phone: phoneInput.value.trim(),
          dob: dobInput.value,
          gender: genderInput.value,
          college: schoolCollegeInput.value.trim(),
          pastExperience: parseInt(pastMunsCountInput.value, 10) || 0,
          committee: 'UNHRC',
          country: 'Pending',
          status: 'Pending',
          registeredAt: new Date().toISOString().split('T')[0]
        };
        delegates.push(newRegistration);
        saveDelegatesDatabase(delegates);
      }

      // Update session info if modified
      session.name = userName;
      session.email = userEmail;
      session.phone = phoneInput.value.trim();
      session.college = schoolCollegeInput.value.trim();
      localStorage.setItem('munify_session', JSON.stringify(session));

      // Show success message and redirect back to Dashboard
      if (regAlert) {
        regAlert.className = 'reg-alert alert-success';
        regAlert.textContent = `Successfully registered for ${targetMun.name}! Redirecting to dashboard...`;
        regAlert.style.display = 'block';
      }

      const submitBtn = document.getElementById('btnSubmitRegistration');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
      }

      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 700);
    });
  }

  // 5. Mobile Nav Toggle
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

  // 6. Logout Handler (Only explicit logout clears session)
  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem('munify_session');
      window.location.href = 'login.html';
    });
  }

  // 7. Profile Modal Handlers
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

  window.addEventListener('click', (e) => {
    if (e.target === profileModal) closeProfile();
  });
});
