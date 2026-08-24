/**
 * MUNify - Committees Management JavaScript (Admin Section)
 * Scoped to individual MUN conferences using munId.
 * Provides live committee cards rendering matching screenshot UI,
 * dynamic CRUD operations, deletion confirmation, and management navigation.
 */

// Verify Admin Session
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

// Retrieve All MUNs
function getAllMuns() {
  const defaultMuns = [
    {
      id: 'mun_kit_1',
      name: 'KIT MUN',
      conferenceDate: '2026-11-20',
      registrationDeadline: '2026-10-31',
      location: 'Kolhapur',
      description: 'KIT Model United Nations Conference - Kolhapur',
      delegatesCount: 4,
      activeCommitteesCount: 4,
      chairMembersCount: 8,
      createdAt: '2026-01-02T00:00:00.000Z'
    },
    {
      id: 'mun_walchand_1',
      name: 'Walchand MUN',
      conferenceDate: '2026-10-15',
      registrationDeadline: '2026-09-30',
      location: 'Sangli',
      description: 'Walchand Model United Nations Annual Conference',
      delegatesCount: 4,
      activeCommitteesCount: 2,
      chairMembersCount: 4,
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'mun_dyp_1',
      name: 'DYP MUN',
      conferenceDate: '2026-12-05',
      registrationDeadline: '2026-11-15',
      location: 'Sangli',
      description: 'D.Y. Patil Model United Nations - Sangli',
      delegatesCount: 2,
      activeCommitteesCount: 2,
      chairMembersCount: 4,
      createdAt: '2026-01-03T00:00:00.000Z'
    }
  ];

  const storedStr = localStorage.getItem('munify_muns_db');
  if (storedStr) {
    try {
      const parsed = JSON.parse(storedStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {}
  }

  localStorage.setItem('munify_muns_db', JSON.stringify(defaultMuns));
  return defaultMuns;
}

// Get Selected MUN based on query parameter
function getSelectedMun() {
  const urlParams = new URLSearchParams(window.location.search);
  const munId = urlParams.get('munId');
  const allMuns = getAllMuns();

  if (munId) {
    const found = allMuns.find(m => String(m.id) === String(munId));
    if (found) return found;
  }

  // Default to KIT MUN (or first available)
  const kitMun = allMuns.find(m => m.id === 'mun_kit_1' || m.name.toLowerCase().includes('kit'));
  return kitMun || allMuns[0];
}

// Get or Seed Committees for all MUNs
function getCommitteesDatabase(currentMun) {
  const defaultCommittees = [
    // KIT MUN Committees (matching UI reference with UNHRC, WHO, UNGA, UNSC)
    {
      id: 'comm_kit_1',
      munId: 'mun_kit_1',
      name: 'UNHRC',
      fullName: 'United Nations Human Rights Council',
      agenda: 'Human Resources',
      chairs: 2,
      delegates: 25,
      createdAt: '2026-01-02T00:00:00.000Z'
    },
    {
      id: 'comm_kit_2',
      munId: 'mun_kit_1',
      name: 'WHO',
      fullName: 'World Health Organization',
      agenda: 'world health',
      chairs: 2,
      delegates: 25,
      createdAt: '2026-01-02T00:00:00.000Z'
    },
    {
      id: 'comm_kit_3',
      munId: 'mun_kit_1',
      name: 'UNGA',
      fullName: 'United Nations General Assembly',
      agenda: 'Global Peace and Security',
      chairs: 2,
      delegates: 30,
      createdAt: '2026-01-02T00:00:00.000Z'
    },
    {
      id: 'comm_kit_4',
      munId: 'mun_kit_1',
      name: 'UNSC',
      fullName: 'United Nations Security Council',
      agenda: 'International Security and Conflict Resolution',
      chairs: 2,
      delegates: 15,
      createdAt: '2026-01-02T00:00:00.000Z'
    },
    // Walchand MUN Committees
    {
      id: 'comm_walchand_1',
      munId: 'mun_walchand_1',
      name: 'UNHRC',
      fullName: 'United Nations Human Rights Council',
      agenda: 'Addressing global digital privacy and surveillance in conflict zones',
      chairs: 2,
      delegates: 20,
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'comm_walchand_2',
      munId: 'mun_walchand_1',
      name: 'UNSC',
      fullName: 'United Nations Security Council',
      agenda: 'Maritime security and counter-piracy operations in international waters',
      chairs: 2,
      delegates: 15,
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    // DYP MUN Committees
    {
      id: 'comm_dyp_1',
      munId: 'mun_dyp_1',
      name: 'UNGA',
      fullName: 'United Nations General Assembly',
      agenda: 'Sustainable climate adaptation and renewable energy infrastructure',
      chairs: 2,
      delegates: 30,
      createdAt: '2026-01-03T00:00:00.000Z'
    },
    {
      id: 'comm_dyp_2',
      munId: 'mun_dyp_1',
      name: 'UNESCO',
      fullName: 'United Nations Educational, Scientific and Cultural Organization',
      agenda: 'Protection and restitution of cultural heritage in occupied territories',
      chairs: 2,
      delegates: 20,
      createdAt: '2026-01-03T00:00:00.000Z'
    }
  ];

  const storedStr = localStorage.getItem('munify_committees_db');
  if (storedStr) {
    try {
      const parsed = JSON.parse(storedStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (currentMun) {
          const existsForCurrent = parsed.some(c => String(c.munId) === String(currentMun.id));
          if (!existsForCurrent) {
            const seeded = defaultCommittees.map((c, idx) => ({
              ...c,
              id: `comm_${currentMun.id}_${idx + 1}`,
              munId: currentMun.id
            }));
            const updated = [...parsed, ...seeded];
            localStorage.setItem('munify_committees_db', JSON.stringify(updated));
            return updated;
          }
        }
        return parsed;
      }
    } catch (e) {}
  }

  localStorage.setItem('munify_committees_db', JSON.stringify(defaultCommittees));
  return defaultCommittees;
}

// Escape HTML utility
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. Verify Admin Session
  const session = verifyAdminSession();
  if (!session) return;

  // 2. Resolve Active MUN
  const currentMun = getSelectedMun();
  const munName = currentMun.name || 'Conference';
  const munLocation = currentMun.location || 'India';

  // 3. Update Title & Header Information
  document.title = `Committees - ${munName} - MUNify`;

  const subtitleElem = document.getElementById('confSubtitleInfo');
  if (subtitleElem) {
    subtitleElem.innerHTML = `${escapeHtml(munName)} &bull; ${escapeHtml(munLocation)}`;
  }

  // 4. Update Navigation Links with current munId
  const navOverview = document.getElementById('navItemOverview');
  const navDelegates = document.getElementById('navItemDelegates');
  const navCommittees = document.getElementById('navItemCommittees');
  const navSettings = document.getElementById('navItemSettings');
  const backBtn = document.getElementById('btnBackToConfOverview');
  const createCommBtn = document.getElementById('btnOpenCreateCommitteePage');

  if (navOverview) navOverview.href = `mun-dashboard.html?munId=${encodeURIComponent(currentMun.id)}`;
  if (navDelegates) navDelegates.href = `delegates.html?munId=${encodeURIComponent(currentMun.id)}`;
  if (navCommittees) navCommittees.href = `committees.html?munId=${encodeURIComponent(currentMun.id)}`;
  if (navSettings) navSettings.href = `mun-dashboard.html?munId=${encodeURIComponent(currentMun.id)}#settings`;
  if (backBtn) backBtn.href = `mun-dashboard.html?munId=${encodeURIComponent(currentMun.id)}`;
  if (createCommBtn) createCommBtn.href = `create-committee.html?munId=${encodeURIComponent(currentMun.id)}`;

  // 5. Render Committee Cards
  function renderCommittees() {
    const allCommittees = getCommitteesDatabase(currentMun);
    const munCommittees = allCommittees.filter(c => String(c.munId) === String(currentMun.id));
    const grid = document.getElementById('committeesCardsGrid');
    if (!grid) return;

    if (munCommittees.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; background: #ffffff; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 48px 24px; text-align: center; color: #64748b;">
          <h3 style="color: var(--color-navy); font-size: 18px; margin: 0 0 8px 0;">No committees found for ${escapeHtml(munName)}</h3>
          <p style="margin: 0 0 16px 0; font-size: 14px;">Click "Create Committee" above to add the first committee for this conference.</p>
          <button type="button" class="btn-create-committee" id="btnEmptyStateCreate">Create Committee</button>
        </div>
      `;
      const emptyBtn = document.getElementById('btnEmptyStateCreate');
      if (emptyBtn) emptyBtn.addEventListener('click', openCreateModal);
      return;
    }

    grid.innerHTML = '';
    munCommittees.forEach(comm => {
      const card = document.createElement('div');
      card.className = 'committee-card';
      card.id = `card_${comm.id}`;

      // Notice format in screenshot: Agenda:Human Resources / Agenda:world health
      const agendaText = comm.agenda ? escapeHtml(comm.agenda) : 'General Committee Topic';

      card.innerHTML = `
        <div>
          <h3 class="committee-card-name">${escapeHtml(comm.name)}</h3>
          <p class="committee-card-agenda"><strong>Agenda:</strong>${agendaText}</p>
        </div>
        <div class="committee-card-actions">
          <button type="button" class="btn-committee-delete" data-id="${comm.id}" data-name="${escapeHtml(comm.name)}">Delete</button>
          <a href="manage-committee.html?munId=${encodeURIComponent(currentMun.id)}&committeeId=${encodeURIComponent(comm.id)}" class="btn-committee-manage">Manage</a>
        </div>
      `;

      grid.appendChild(card);
    });

    // Attach Delete Action Handlers
    document.querySelectorAll('.btn-committee-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name');
        deleteCommittee(id, name);
      });
    });
  }

  // 6. Delete Committee Function
  function deleteCommittee(committeeId, committeeName) {
    const confirmed = confirm(`Are you sure you want to delete committee "${committeeName}" from ${currentMun.name}?`);
    if (!confirmed) return;

    const allCommittees = getCommitteesDatabase(currentMun);
    const updated = allCommittees.filter(c => String(c.id) !== String(committeeId));
    localStorage.setItem('munify_committees_db', JSON.stringify(updated));

    // Also update conference committee count in muns DB if present
    const allMuns = getAllMuns();
    const munIndex = allMuns.findIndex(m => String(m.id) === String(currentMun.id));
    if (munIndex !== -1) {
      const remainingForMun = updated.filter(c => String(c.munId) === String(currentMun.id)).length;
      allMuns[munIndex].activeCommitteesCount = remainingForMun;
      localStorage.setItem('munify_muns_db', JSON.stringify(allMuns));
    }

    // Re-render committees list without reloading or logging out
    renderCommittees();
  }

  // 7. Initial Render
  renderCommittees();

  // 8. Create Committee Modal Logic
  const createModalOverlay = document.getElementById('createCommitteeModalOverlay');
  const openCreateModalBtn = document.getElementById('btnOpenCreateCommitteeModal');
  const closeCreateModalBtn = document.getElementById('closeCreateCommModalBtn');
  const dismissCreateModalBtn = document.getElementById('dismissCreateCommModalBtn');
  const createCommForm = document.getElementById('createCommitteeForm');

  function openCreateModal() {
    if (createCommForm) createCommForm.reset();
    if (createModalOverlay) createModalOverlay.classList.add('active');
  }

  function closeCreateModal() {
    if (createModalOverlay) createModalOverlay.classList.remove('active');
  }

  if (openCreateModalBtn) openCreateModalBtn.addEventListener('click', openCreateModal);
  if (closeCreateModalBtn) closeCreateModalBtn.addEventListener('click', closeCreateModal);
  if (dismissCreateModalBtn) dismissCreateModalBtn.addEventListener('click', closeCreateModal);
  if (createModalOverlay) {
    createModalOverlay.addEventListener('click', (e) => {
      if (e.target === createModalOverlay) closeCreateModal();
    });
  }

  if (createCommForm) {
    createCommForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = (document.getElementById('newCommName')?.value || '').trim();
      const fullName = (document.getElementById('newCommFullName')?.value || '').trim();
      const agenda = (document.getElementById('newCommAgenda')?.value || '').trim();
      const chairs = parseInt(document.getElementById('newCommChairs')?.value || '2', 10);
      const delegates = parseInt(document.getElementById('newCommDelegates')?.value || '25', 10);

      if (!name || !agenda) {
        alert('Please provide both Committee Name and Agenda.');
        return;
      }

      const allCommittees = getCommitteesDatabase(currentMun);
      const newCommittee = {
        id: `comm_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        munId: currentMun.id,
        name: name,
        fullName: fullName || name,
        agenda: agenda,
        chairs: chairs || 2,
        delegates: delegates || 25,
        createdAt: new Date().toISOString()
      };

      allCommittees.push(newCommittee);
      localStorage.setItem('munify_committees_db', JSON.stringify(allCommittees));

      // Update MUN stats
      const allMuns = getAllMuns();
      const munIndex = allMuns.findIndex(m => String(m.id) === String(currentMun.id));
      if (munIndex !== -1) {
        const count = allCommittees.filter(c => String(c.munId) === String(currentMun.id)).length;
        allMuns[munIndex].activeCommitteesCount = count;
        localStorage.setItem('munify_muns_db', JSON.stringify(allMuns));
      }

      closeCreateModal();
      renderCommittees();
    });
  }

  // 9. Mobile Sidebar Toggle
  const mobileToggle = document.getElementById('sidebarMobileToggle');
  const sidebar = document.getElementById('munSidebar');
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }

  // 10. Explicit Sidebar Logout
  const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
  if (sidebarLogoutBtn) {
    sidebarLogoutBtn.addEventListener('click', () => {
      localStorage.removeItem('munify_session');
      window.location.href = '../user/login.html';
    });
  }

  // 11. Top Header Action Modals: Results & Certificates
  const resultsBtn = document.getElementById('btnDisplayResults');
  const resultsOverlay = document.getElementById('resultsModalOverlay');
  const closeResultsBtn = document.getElementById('closeResultsModalBtn');
  const dismissResultsBtn = document.getElementById('dismissResultsModalBtn');

  if (resultsBtn && resultsOverlay) {
    resultsBtn.addEventListener('click', () => {
      const header = document.getElementById('resultsConfNameHeader');
      if (header) header.textContent = `${munName} - Official Results`;
      resultsOverlay.classList.add('active');
    });
    if (closeResultsBtn) closeResultsBtn.addEventListener('click', () => resultsOverlay.classList.remove('active'));
    if (dismissResultsBtn) dismissResultsBtn.addEventListener('click', () => resultsOverlay.classList.remove('active'));
    resultsOverlay.addEventListener('click', (e) => {
      if (e.target === resultsOverlay) resultsOverlay.classList.remove('active');
    });
  }

  const certBtn = document.getElementById('btnGenerateCertificates');
  const certOverlay = document.getElementById('certificatesModalOverlay');
  const closeCertBtn = document.getElementById('closeCertModalBtn');
  const dismissCertBtn = document.getElementById('dismissCertModalBtn');
  const batchDownloadBtn = document.getElementById('btnDownloadBatchCert');

  if (certBtn && certOverlay) {
    certBtn.addEventListener('click', () => {
      const header = document.getElementById('certConfNameHeader');
      if (header) header.textContent = `${munName} - Certificates System Ready`;
      certOverlay.classList.add('active');
    });
    if (closeCertBtn) closeCertBtn.addEventListener('click', () => certOverlay.classList.remove('active'));
    if (dismissCertBtn) dismissCertBtn.addEventListener('click', () => certOverlay.classList.remove('active'));
    certOverlay.addEventListener('click', (e) => {
      if (e.target === certOverlay) certOverlay.classList.remove('active');
    });
    if (batchDownloadBtn) {
      batchDownloadBtn.addEventListener('click', () => {
        alert(`Generating certificate bundle for ${munName}...`);
        certOverlay.classList.remove('active');
      });
    }
  }
});
