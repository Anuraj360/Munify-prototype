/**
 * MUNify - Individual Conference Dashboard JavaScript
 * Handles dynamic MUN data loading, statistics scoping, tab navigation,
 * action modals, and admin session verification.
 */

/**
 * Verify current Admin session
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
 * Helper to get or seed all MUN records from storage
 */
function getAllMuns() {
  const defaultMuns = [
    {
      id: 'mun_kit_1',
      name: 'KIT MUN',
      conferenceDate: '2026-09-13',
      registrationDeadline: '2026-08-31',
      location: 'Kolhapur',
      description: "Kolhapur's Top MUN",
      image: '',
      delegatesCount: 4,
      activeCommitteesCount: 4,
      chairMembersCount: 8,
      createdAt: '2026-01-02T00:00:00.000Z',
      published: true
    },
    {
      id: 'mun_walchand_1',
      name: 'Walchand MUN',
      conferenceDate: '2026-10-15',
      registrationDeadline: '2026-09-30',
      location: 'Sangli',
      description: 'Walchand Model United Nations Annual Conference',
      image: '',
      delegatesCount: 4,
      activeCommitteesCount: 1,
      chairMembersCount: 2,
      createdAt: '2026-01-01T00:00:00.000Z',
      published: true
    },
    {
      id: 'mun_dyp_1',
      name: 'DYP MUN',
      conferenceDate: '2026-12-05',
      registrationDeadline: '2026-11-15',
      location: 'Sangli',
      description: 'D.Y. Patil Model United Nations - Sangli',
      image: '',
      delegatesCount: 2,
      activeCommitteesCount: 2,
      chairMembersCount: 4,
      createdAt: '2026-01-03T00:00:00.000Z',
      published: true
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

/**
 * Helper to get or seed delegate records
 */
function getDelegatesDb(currentMun) {
  const defaultDelegates = [
    // KIT MUN Delegates
    {
      id: 'del_kit_1',
      munId: 'mun_kit_1',
      name: 'Anuraj Deshmukh',
      email: 'anuraj.deshmukh@example.com',
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
      id: 'del_kit_3',
      munId: 'mun_kit_1',
      name: 'Rohan Kulkarni',
      email: 'rohan.kulkarni@example.com',
      phone: '+91 98451 23670',
      committee: 'WHO',
      country: 'Brazil',
      status: 'Pending',
      registeredAt: '2026-08-12'
    },
    {
      id: 'del_kit_4',
      munId: 'mun_kit_1',
      name: 'Sneha Joshi',
      email: 'sneha.joshi@example.com',
      phone: '+91 99123 45678',
      committee: 'UNGA',
      country: 'France',
      status: 'Assigned',
      registeredAt: '2026-08-14'
    },
    // Walchand MUN Delegates
    {
      id: 'del_walchand_1',
      munId: 'mun_walchand_1',
      name: 'Anuraj Deshmukh',
      email: 'anuraj.walchand@example.com',
      phone: '+91 98765 43210',
      committee: 'UNHRC',
      country: 'Australia',
      status: 'Assigned',
      registeredAt: '2026-08-10'
    },
    {
      id: 'del_walchand_2',
      munId: 'mun_walchand_1',
      name: 'Priya Patil',
      email: 'priya.w@example.com',
      phone: '+91 98234 56781',
      committee: 'UNSC',
      country: 'Japan',
      status: 'Assigned',
      registeredAt: '2026-08-11'
    },
    {
      id: 'del_walchand_3',
      munId: 'mun_walchand_1',
      name: 'Rohan Kulkarni',
      email: 'rohan.w@example.com',
      phone: '+91 98451 23670',
      committee: 'WHO',
      country: 'Brazil',
      status: 'Pending',
      registeredAt: '2026-08-12'
    },
    {
      id: 'del_walchand_4',
      munId: 'mun_walchand_1',
      name: 'Sneha Joshi',
      email: 'sneha.w@example.com',
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
        if (currentMun) {
          const existsForMun = parsed.some(d => String(d.munId) === String(currentMun.id));
          if (!existsForMun) {
            const seeded = defaultDelegates.map((d, idx) => ({
              ...d,
              id: `del_${currentMun.id}_${idx + 1}`,
              munId: currentMun.id
            }));
            const combined = [...parsed, ...seeded];
            localStorage.setItem('munify_delegates_db', JSON.stringify(combined));
            return combined;
          }
        }
        return parsed;
      }
    } catch (e) {}
  }

  localStorage.setItem('munify_delegates_db', JSON.stringify(defaultDelegates));
  return defaultDelegates;
}

/**
 * Get selected MUN by query parameter or fallback to first
 */
function getSelectedMun() {
  const urlParams = new URLSearchParams(window.location.search);
  const munId = urlParams.get('munId');
  const allMuns = getAllMuns();

  if (munId) {
    const found = allMuns.find(m => String(m.id) === String(munId));
    if (found) return found;
  }

  return allMuns[0];
}

/**
 * Load and render the selected MUN's information
 */
function renderConferenceDashboard(mun) {
  if (!mun) return;

  const munName = mun.name || 'MUN Conference';
  const location = mun.location || 'India';

  // 1. Update Document Title
  document.title = `${munName} - Conference Overview - MUNify`;

  // 2. Update Subtitle Header: [MUN NAME] • [LOCATION]
  const subtitleElem = document.getElementById('confSubtitleInfo');
  if (subtitleElem) {
    subtitleElem.innerHTML = `${escapeHtml(munName)} &bull; ${escapeHtml(location)}`;
  }

  // 3. Update Statistics Cards
  // Compute dynamically based on actual delegates/committees/chairs databases or defaults
  const delegatesDb = JSON.parse(localStorage.getItem('munify_delegates_db') || '[]');
  const committeesDb = JSON.parse(localStorage.getItem('munify_committees_db') || '[]');
  const chairsDb = JSON.parse(localStorage.getItem('munify_chairs_db') || '[]');

  const munDelegates = delegatesDb.filter(d => String(d.munId) === String(mun.id));
  const munCommittees = committeesDb.filter(c => String(c.munId) === String(mun.id));
  const munChairs = chairsDb.filter(ch => String(ch.munId) === String(mun.id));

  // Determine counts (use recorded counts or fallback to specific conference default if Walchand)
  let totalDelegates = munDelegates.length;
  let activeCommittees = munCommittees.length;
  let chairMembers = munChairs.length;

  if (mun.id === 'mun_walchand_1') {
    if (totalDelegates === 0 && mun.delegatesCount !== undefined) totalDelegates = mun.delegatesCount;
    if (activeCommittees === 0 && mun.activeCommitteesCount !== undefined) activeCommittees = mun.activeCommitteesCount;
    if (chairMembers === 0 && mun.chairMembersCount !== undefined) chairMembers = mun.chairMembersCount;
  } else {
    // For other custom created MUNs
    if (mun.delegatesCount !== undefined && totalDelegates === 0) totalDelegates = mun.delegatesCount;
    if (mun.activeCommitteesCount !== undefined && activeCommittees === 0) activeCommittees = mun.activeCommitteesCount;
    if (mun.chairMembersCount !== undefined && chairMembers === 0) chairMembers = mun.chairMembersCount;
  }

  const statDelegatesElem = document.getElementById('statValDelegates');
  const statCommitteesElem = document.getElementById('statValCommittees');
  const statChairsElem = document.getElementById('statValChairs');

  if (statDelegatesElem) statDelegatesElem.textContent = String(totalDelegates);
  if (statCommitteesElem) statCommitteesElem.textContent = String(activeCommittees);
  if (statChairsElem) statChairsElem.textContent = String(chairMembers);

  // 4. Update Welcome Card
  const welcomeHeading = document.getElementById('welcomeHeading');
  const welcomeDesc = document.getElementById('welcomeDescText');

  if (welcomeHeading) {
    welcomeHeading.textContent = `Welcome to ${munName}`;
  }

  if (welcomeDesc) {
    welcomeDesc.textContent = `Welcome to the ${munName} management dashboard. From here you can manage all aspects of your conference, from delegate registrations to committee proceedings. Use the sidebar to navigate through different sections of the conference management system.`;
  }

  // 5. Update Result & Cert headers
  const resultsHeader = document.getElementById('resultsConfNameHeader');
  if (resultsHeader) resultsHeader.textContent = `${munName} - Official Results`;

  const certHeader = document.getElementById('certConfNameHeader');
  if (certHeader) certHeader.textContent = `${munName} - Certificates System Ready`;

  // 6. Populate Settings View & Poster
  renderMunSettings(mun);

  // 7. Render Delegates List if any
  renderDelegatesTable(mun);

  // 8. Render Committees List
  renderCommitteesList(mun, activeCommittees);
}

/**
 * Format date string into human readable format matching screenshot (e.g. "Sun Sep 13 2026")
 */
function formatDisplayDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const parts = String(dateStr).split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) {
        return d.toDateString();
      }
    }
    const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
    if (!isNaN(d.getTime())) {
      return d.toDateString();
    }
  } catch (e) {}
  return dateStr;
}

/**
 * Render MUN Poster and Conference Settings view
 */
function renderMunSettings(mun) {
  if (!mun) return;

  // 1. Dynamic Poster Display
  const posterImg = document.getElementById('munPosterImage');
  const posterPlaceholder = document.getElementById('munPosterPlaceholder');
  const posterSrc = (mun.image || mun.poster || mun.imageUrl || mun.posterUrl || '').trim();

  if (posterImg && posterPlaceholder) {
    if (posterSrc && posterSrc.length > 0) {
      posterImg.src = posterSrc;
      posterImg.alt = `${mun.name || 'MUN'} Poster`;
      posterImg.style.display = 'block';
      posterPlaceholder.style.display = 'none';

      posterImg.onerror = () => {
        posterImg.style.display = 'none';
        posterPlaceholder.style.display = 'flex';
      };
    } else {
      posterImg.src = '';
      posterImg.style.display = 'none';
      posterPlaceholder.style.display = 'flex';
    }
  }

  // 2. Read-only Display Details (Matching Screenshot)
  const dispName = document.getElementById('settingsDispName');
  const dispDate = document.getElementById('settingsDispDate');
  const dispDesc = document.getElementById('settingsDispDesc');

  if (dispName) dispName.textContent = mun.name || '—';
  if (dispDate) dispDate.textContent = formatDisplayDate(mun.conferenceDate);
  if (dispDesc) dispDesc.textContent = mun.description || '—';

  // 3. Populate Editable Form Inputs
  const settingsName = document.getElementById('settingsMunName');
  const settingsDate = document.getElementById('settingsConfDate');
  const settingsReg = document.getElementById('settingsRegDate');
  const settingsLoc = document.getElementById('settingsLocation');
  const settingsDesc = document.getElementById('settingsDescription');

  if (settingsName) settingsName.value = mun.name || '';
  if (settingsDate) settingsDate.value = mun.conferenceDate || '';
  if (settingsReg) settingsReg.value = mun.registrationDeadline || '';
  if (settingsLoc) settingsLoc.value = mun.location || '';
  if (settingsDesc) settingsDesc.value = mun.description || '';

  // 4. Advanced Options Button Status
  const publishedBtn = document.getElementById('btnPublishedStatus');
  if (publishedBtn) {
    if (mun.published === false) {
      publishedBtn.textContent = 'Draft';
      publishedBtn.style.backgroundColor = '#6b7280';
    } else {
      publishedBtn.innerHTML = '&#10003; Published';
      publishedBtn.style.backgroundColor = '#16a34a';
    }
  }
}

/**
 * Render Delegates Directory for this MUN with search & filter support
 */
function renderDelegatesTable(mun) {
  const tbody = document.getElementById('delegatesTableBody');
  if (!tbody) return;

  const allDelegates = getDelegatesDb(mun);
  let munDelegates = allDelegates.filter(d => String(d.munId) === String(mun.id));

  // Populate committee dropdown if present
  const committeeSelect = document.getElementById('committeeFilterSelect');
  if (committeeSelect && committeeSelect.options.length <= 1) {
    const uniqueCommittees = Array.from(
      new Set(munDelegates.map(d => (d.committee || '').trim()).filter(Boolean))
    );
    ['UNHRC', 'UNSC', 'WHO', 'UNGA'].forEach(c => {
      if (!uniqueCommittees.includes(c)) uniqueCommittees.push(c);
    });
    committeeSelect.innerHTML = '<option value="all">All Committees</option>';
    uniqueCommittees.forEach(comm => {
      const opt = document.createElement('option');
      opt.value = comm;
      opt.textContent = comm;
      committeeSelect.appendChild(opt);
    });
  }

  // Filter based on search & selects
  const searchVal = (document.getElementById('delegateSearchInput')?.value || '').trim().toLowerCase();
  if (searchVal) {
    munDelegates = munDelegates.filter(d => (d.name || '').toLowerCase().includes(searchVal));
  }

  const selectedComm = document.getElementById('committeeFilterSelect')?.value || 'all';
  if (selectedComm !== 'all') {
    munDelegates = munDelegates.filter(d => (d.committee || '').trim() === selectedComm);
  }

  const selectedStat = document.getElementById('statusFilterSelect')?.value || 'all';
  if (selectedStat !== 'all') {
    munDelegates = munDelegates.filter(d => (d.status || '').toLowerCase() === selectedStat.toLowerCase());
  }

  if (munDelegates.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: #6b7280; padding: 32px; font-size: 15px;">No delegates found matching your criteria for ${escapeHtml(mun.name)}.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = '';
  munDelegates.forEach(del => {
    const isAssigned = (del.status || '').toLowerCase() === 'assigned';
    const tr = document.createElement('tr');

    const committeeDisplay = isAssigned && del.committee
      ? `<span class="text-green-assigned">✓ ${escapeHtml(del.committee)}</span>`
      : `<span class="text-pending-field">${escapeHtml(del.committee || '—')}</span>`;

    const countryDisplay = isAssigned && del.country
      ? `<span class="text-green-assigned">✓ ${escapeHtml(del.country)}</span>`
      : `<span class="text-pending-field">${escapeHtml(del.country || 'Pending')}</span>`;

    const statusDisplay = isAssigned
      ? `<span class="status-assigned-text">Assigned</span>`
      : `<span class="status-pending-text">Pending</span>`;

    tr.innerHTML = `
      <td class="delegate-cell-name">${escapeHtml(del.name || 'Delegate')}</td>
      <td>${committeeDisplay}</td>
      <td>${countryDisplay}</td>
      <td>${statusDisplay}</td>
      <td>
        <div class="delegates-actions-cell">
          <button type="button" class="btn-table-info" data-id="${del.id}">Info</button>
          <button type="button" class="btn-table-delete" data-id="${del.id}">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Attach info handlers
  document.querySelectorAll('#delegatesTableBody .btn-table-info').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const del = allDelegates.find(d => String(d.id) === String(id));
      if (!del) return;

      const modal = document.getElementById('delegateInfoModalOverlay');
      if (modal) {
        document.getElementById('modalDelName').textContent = del.name || '—';
        document.getElementById('modalDelEmail').textContent = del.email || '—';
        document.getElementById('modalDelCommittee').textContent = del.committee || '—';
        document.getElementById('modalDelCountry').textContent = del.country || '—';
        document.getElementById('modalDelStatus').textContent = del.status || 'Pending';
        document.getElementById('modalDelPhone').textContent = del.phone || '—';
        modal.classList.add('active');
      }
    });
  });

  // Attach delete handlers
  document.querySelectorAll('#delegatesTableBody .btn-table-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const del = allDelegates.find(d => String(d.id) === String(id));
      if (!del) return;

      if (confirm(`Are you sure you want to delete delegate "${del.name}" from ${mun.name}?`)) {
        const updated = allDelegates.filter(d => String(d.id) !== String(id));
        localStorage.setItem('munify_delegates_db', JSON.stringify(updated));
        renderConferenceDashboard(mun);
      }
    });
  });
}

/**
 * Render Committees List for this MUN (Matching Screenshot UI Reference)
 */
function renderCommitteesList(mun, count) {
  const grid = document.getElementById('committeesListGrid');
  if (!grid) return;

  const defaultCommittees = [
    { id: 'comm_kit_1', munId: 'mun_kit_1', name: 'UNHRC', fullName: 'United Nations Human Rights Council', agenda: 'Human Resources', chairs: 2, delegates: 25 },
    { id: 'comm_kit_2', munId: 'mun_kit_1', name: 'WHO', fullName: 'World Health Organization', agenda: 'world health', chairs: 2, delegates: 25 },
    { id: 'comm_kit_3', munId: 'mun_kit_1', name: 'UNGA', fullName: 'United Nations General Assembly', agenda: 'Global Peace and Security', chairs: 2, delegates: 30 },
    { id: 'comm_kit_4', munId: 'mun_kit_1', name: 'UNSC', fullName: 'United Nations Security Council', agenda: 'International Security and Conflict Resolution', chairs: 2, delegates: 15 },
    { id: 'comm_walchand_1', munId: 'mun_walchand_1', name: 'UNHRC', fullName: 'United Nations Human Rights Council', agenda: 'Addressing global digital privacy and surveillance in conflict zones', chairs: 2, delegates: 20 },
    { id: 'comm_walchand_2', munId: 'mun_walchand_1', name: 'UNSC', fullName: 'United Nations Security Council', agenda: 'Maritime security and counter-piracy operations in international waters', chairs: 2, delegates: 15 },
    { id: 'comm_dyp_1', munId: 'mun_dyp_1', name: 'UNGA', fullName: 'United Nations General Assembly', agenda: 'Sustainable climate adaptation and renewable energy infrastructure', chairs: 2, delegates: 30 },
    { id: 'comm_dyp_2', munId: 'mun_dyp_1', name: 'UNESCO', fullName: 'United Nations Educational, Scientific and Cultural Organization', agenda: 'Protection and restitution of cultural heritage in occupied territories', chairs: 2, delegates: 20 }
  ];

  let committeesDb = JSON.parse(localStorage.getItem('munify_committees_db') || '[]');
  if (committeesDb.length === 0) {
    committeesDb = defaultCommittees;
    localStorage.setItem('munify_committees_db', JSON.stringify(committeesDb));
  }

  let munCommittees = committeesDb.filter(c => String(c.munId) === String(mun.id));
  if (munCommittees.length === 0) {
    const seeded = defaultCommittees.map((c, i) => ({
      ...c,
      id: `comm_${mun.id}_${i + 1}`,
      munId: mun.id
    }));
    committeesDb = [...committeesDb, ...seeded];
    localStorage.setItem('munify_committees_db', JSON.stringify(committeesDb));
    munCommittees = seeded;
  }

  grid.innerHTML = '';
  munCommittees.forEach(comm => {
    const card = document.createElement('div');
    card.className = 'committee-card';
    const agendaText = comm.agenda ? escapeHtml(comm.agenda) : 'General Committee Topic';
    card.innerHTML = `
      <div>
        <h3 class="committee-card-name">${escapeHtml(comm.name)}</h3>
        <p class="committee-card-agenda"><strong>Agenda:</strong>${agendaText}</p>
      </div>
      <div class="committee-card-actions">
        <button type="button" class="btn-committee-delete" data-id="${comm.id}" data-name="${escapeHtml(comm.name)}">Delete</button>
        <a href="manage-committee.html?munId=${encodeURIComponent(mun.id)}&committeeId=${encodeURIComponent(comm.id)}" class="btn-committee-manage">Manage</a>
      </div>
    `;
    grid.appendChild(card);
  });

  // Attach delete handlers
  grid.querySelectorAll('.btn-committee-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      if (confirm(`Are you sure you want to delete committee "${name}" from ${mun.name}?`)) {
        const updated = committeesDb.filter(c => String(c.id) !== String(id));
        localStorage.setItem('munify_committees_db', JSON.stringify(updated));
        renderConferenceDashboard(mun);
      }
    });
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

document.addEventListener('DOMContentLoaded', () => {
  // 1. Verify Admin Session
  const session = verifyAdminSession();
  if (!session) return;

  // 2. Get Selected MUN and populate
  const currentMun = getSelectedMun();
  renderConferenceDashboard(currentMun);

  // 3. Sidebar Tab Switching & Header Title Sync
  const navLinks = document.querySelectorAll('.sidebar-nav-link');
  const confHeadingTitle = document.getElementById('confHeadingTitle');
  const tabTitles = {
    overview: 'Conference Overview',
    delegates: 'Delegates',
    committees: 'Committees',
    settings: 'Settings'
  };

  const tabViews = {
    overview: document.getElementById('tabViewOverview'),
    delegates: document.getElementById('tabViewDelegates'),
    committees: document.getElementById('tabViewCommittees'),
    settings: document.getElementById('tabViewSettings')
  };

  function switchTab(targetTab) {
    // Update active nav styling
    navLinks.forEach(l => {
      if (l.getAttribute('data-tab') === targetTab) {
        l.classList.add('active');
      } else {
        l.classList.remove('active');
      }
    });

    // Update Header Title
    if (confHeadingTitle && tabTitles[targetTab]) {
      confHeadingTitle.textContent = tabTitles[targetTab];
    }

    // Update active tab display
    Object.keys(tabViews).forEach(key => {
      const view = tabViews[key];
      if (view) {
        if (key === targetTab) {
          view.style.display = 'block';
          view.classList.add('active');
        } else {
          view.style.display = 'none';
          view.classList.remove('active');
        }
      }
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = link.getAttribute('data-tab');
      switchTab(targetTab);

      // On mobile, close sidebar if open
      const sidebar = document.getElementById('munSidebar');
      if (sidebar && sidebar.classList.contains('mobile-open')) {
        sidebar.classList.remove('mobile-open');
      }
    });
  });

  // Check URL hash or query param to open specific tab on load
  const urlTab = new URLSearchParams(window.location.search).get('tab') || window.location.hash.replace('#', '');
  if (urlTab && tabViews[urlTab]) {
    switchTab(urlTab);
  }

  // 4. Delegates search and filter listeners (inside mun-dashboard.html)
  const delSearchInput = document.getElementById('delegateSearchInput');
  const commSelect = document.getElementById('committeeFilterSelect');
  const statSelect = document.getElementById('statusFilterSelect');

  if (delSearchInput) delSearchInput.addEventListener('input', () => renderDelegatesTable(currentMun));
  if (commSelect) commSelect.addEventListener('change', () => renderDelegatesTable(currentMun));
  if (statSelect) statSelect.addEventListener('change', () => renderDelegatesTable(currentMun));

  // Delegate Info Modal in mun-dashboard.html
  const infoModalOverlay = document.getElementById('delegateInfoModalOverlay');
  const closeInfoBtn = document.getElementById('closeDelegateInfoModalBtn');
  const dismissInfoBtn = document.getElementById('dismissDelegateInfoModalBtn');

  function closeDelInfoModal() {
    if (infoModalOverlay) infoModalOverlay.classList.remove('active');
  }

  if (closeInfoBtn) closeInfoBtn.addEventListener('click', closeDelInfoModal);
  if (dismissInfoBtn) dismissInfoBtn.addEventListener('click', closeDelInfoModal);
  if (infoModalOverlay) {
    infoModalOverlay.addEventListener('click', (e) => {
      if (e.target === infoModalOverlay) closeDelInfoModal();
    });
  }

  // 5. Mobile Sidebar Toggle
  const mobileToggle = document.getElementById('sidebarMobileToggle');
  const sidebar = document.getElementById('munSidebar');
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }

  // 5. Explicit Sidebar Logout
  const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
  if (sidebarLogoutBtn) {
    sidebarLogoutBtn.addEventListener('click', () => {
      localStorage.removeItem('munify_session');
      window.location.href = '../user/login.html';
    });
  }

  // 6. Action Modals: Display Results
  const resultsBtn = document.getElementById('btnDisplayResults');
  const resultsOverlay = document.getElementById('resultsModalOverlay');
  const closeResultsBtn = document.getElementById('closeResultsModalBtn');
  const dismissResultsBtn = document.getElementById('dismissResultsModalBtn');

  if (resultsBtn && resultsOverlay) {
    resultsBtn.addEventListener('click', () => resultsOverlay.classList.add('active'));
    if (closeResultsBtn) closeResultsBtn.addEventListener('click', () => resultsOverlay.classList.remove('active'));
    if (dismissResultsBtn) dismissResultsBtn.addEventListener('click', () => resultsOverlay.classList.remove('active'));
    resultsOverlay.addEventListener('click', (e) => {
      if (e.target === resultsOverlay) resultsOverlay.classList.remove('active');
    });
  }

  // 7. Action Modals: Generate Certificates
  const certBtn = document.getElementById('btnGenerateCertificates');
  const certOverlay = document.getElementById('certificatesModalOverlay');
  const closeCertBtn = document.getElementById('closeCertModalBtn');
  const dismissCertBtn = document.getElementById('dismissCertModalBtn');
  const batchDownloadBtn = document.getElementById('btnDownloadBatchCert');

  if (certBtn && certOverlay) {
    certBtn.addEventListener('click', () => certOverlay.classList.add('active'));
    if (closeCertBtn) closeCertBtn.addEventListener('click', () => certOverlay.classList.remove('active'));
    if (dismissCertBtn) dismissCertBtn.addEventListener('click', () => certOverlay.classList.remove('active'));
    certOverlay.addEventListener('click', (e) => {
      if (e.target === certOverlay) certOverlay.classList.remove('active');
    });
    if (batchDownloadBtn) {
      batchDownloadBtn.addEventListener('click', () => {
        alert(`Generating certificate bundle for ${currentMun ? currentMun.name : 'Conference'}...`);
        certOverlay.classList.remove('active');
      });
    }
  }

  // 8. Settings View Controls & Form Update
  const btnEditDetails = document.getElementById('btnEditMunDetails');
  const btnCancelEdit = document.getElementById('btnCancelEditMun');
  const detailsView = document.getElementById('settingsDetailsView');
  const settingsForm = document.getElementById('confSettingsForm');

  if (btnEditDetails && detailsView && settingsForm) {
    btnEditDetails.addEventListener('click', () => {
      detailsView.style.display = 'none';
      settingsForm.style.display = 'block';
    });
  }

  if (btnCancelEdit && detailsView && settingsForm) {
    btnCancelEdit.addEventListener('click', () => {
      settingsForm.style.display = 'none';
      detailsView.style.display = 'block';
    });
  }

  if (settingsForm) {
    settingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!currentMun) return;

      const name = document.getElementById('settingsMunName').value.trim();
      const confDate = document.getElementById('settingsConfDate').value;
      const regDate = document.getElementById('settingsRegDate').value;
      const location = document.getElementById('settingsLocation').value.trim();
      const description = document.getElementById('settingsDescription').value.trim();
      const imageInput = document.getElementById('settingsMunImage');

      if (!name || !confDate || !regDate || !location) {
        alert('Please fill in all required fields.');
        return;
      }

      currentMun.name = name;
      currentMun.conferenceDate = confDate;
      currentMun.registrationDeadline = regDate;
      currentMun.location = location;
      currentMun.description = description;

      // If a new poster image was selected
      if (imageInput && imageInput.files && imageInput.files[0]) {
        try {
          const file = imageInput.files[0];
          const imageData = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => resolve('');
            reader.readAsDataURL(file);
          });
          if (imageData) {
            currentMun.image = imageData;
          }
        } catch (err) {
          console.error('Error reading image file:', err);
        }
      }

      // Update in allMuns storage
      const allMuns = getAllMuns();
      const idx = allMuns.findIndex(m => String(m.id) === String(currentMun.id));
      if (idx !== -1) {
        allMuns[idx] = currentMun;
      } else {
        allMuns.push(currentMun);
      }
      localStorage.setItem('munify_muns_db', JSON.stringify(allMuns));

      renderConferenceDashboard(currentMun);
      if (detailsView && settingsForm) {
        settingsForm.style.display = 'none';
        detailsView.style.display = 'block';
      }
      alert('Conference settings saved successfully!');
    });
  }

  // Advanced Options: Unpublish MUN
  const unpublishBtn = document.getElementById('btnUnpublishMun');
  if (unpublishBtn) {
    unpublishBtn.addEventListener('click', () => {
      if (!currentMun) return;
      currentMun.published = false;
      const allMuns = getAllMuns();
      const idx = allMuns.findIndex(m => String(m.id) === String(currentMun.id));
      if (idx !== -1) allMuns[idx] = currentMun;
      localStorage.setItem('munify_muns_db', JSON.stringify(allMuns));
      renderMunSettings(currentMun);
      alert(`${currentMun.name} has been unpublished from public listings.`);
    });
  }

  // Advanced Options: Delete MUN
  const deleteMunBtn = document.getElementById('btnDeleteMun');
  if (deleteMunBtn) {
    deleteMunBtn.addEventListener('click', () => {
      if (!currentMun) return;
      if (confirm(`Are you sure you want to permanently delete "${currentMun.name}"? This action cannot be undone.`)) {
        const allMuns = getAllMuns();
        const updated = allMuns.filter(m => String(m.id) !== String(currentMun.id));
        localStorage.setItem('munify_muns_db', JSON.stringify(updated));
        alert(`${currentMun.name} deleted successfully.`);
        window.location.href = 'dashboard.html';
      }
    });
  }

  // 9. Quick Add Committee Button (in Committees Tab)
  const addCommBtn = document.getElementById('btnAddCommitteeModalBtn');
  if (addCommBtn) {
    addCommBtn.href = `create-committee.html?munId=${encodeURIComponent(currentMun.id)}`;
  }

  // 10. Quick Add Delegate Button (in Delegates Tab)
  const addDelBtn = document.getElementById('btnAddDelegateModalBtn');
  if (addDelBtn) {
    addDelBtn.addEventListener('click', () => {
      const delName = prompt('Enter Delegate Name:');
      if (!delName || !delName.trim()) return;

      const delEmail = prompt('Enter Delegate Email:', 'delegate@gmail.com');
      const delComm = prompt('Enter Committee Name (e.g. UNHRC):', 'UNHRC');
      const delPort = prompt('Enter Country / Portfolio:', 'United States');

      const delegatesDb = JSON.parse(localStorage.getItem('munify_delegates_db') || '[]');
      const newDel = {
        id: 'del_' + Date.now(),
        munId: currentMun.id,
        name: delName.trim(),
        email: delEmail ? delEmail.trim() : '',
        committee: delComm ? delComm.trim() : 'General Assembly',
        portfolio: delPort ? delPort.trim() : 'Delegate'
      };

      delegatesDb.push(newDel);
      localStorage.setItem('munify_delegates_db', JSON.stringify(delegatesDb));
      renderConferenceDashboard(currentMun);
    });
  }
});
