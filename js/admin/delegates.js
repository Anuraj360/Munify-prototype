/**
 * MUNify - Delegates Management JavaScript (Admin Section)
 * Scoped to individual MUN conferences.
 * Provides live search, committee & status filtering, delegate info modals,
 * and persistent deletion with full session preservation.
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
      activeCommitteesCount: 1,
      chairMembersCount: 2,
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

// Get or Seed Delegates for all MUNs
function getDelegatesDatabase(currentMun) {
  const defaultDelegates = [
    // KIT MUN Delegates (4 realistic records matching UI reference requirement)
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
        // If current MUN doesn't have delegates yet, copy sample 4 delegates for this MUN
        const existsForCurrent = parsed.some(d => String(d.munId) === String(currentMun.id));
        if (!existsForCurrent) {
          const seeded = defaultDelegates.map((d, i) => ({
            ...d,
            id: `del_${currentMun.id}_${i + 1}`,
            munId: currentMun.id
          }));
          const updated = [...parsed, ...seeded];
          localStorage.setItem('munify_delegates_db', JSON.stringify(updated));
          return updated;
        }
        return parsed;
      }
    } catch (e) {}
  }

  localStorage.setItem('munify_delegates_db', JSON.stringify(defaultDelegates));
  return defaultDelegates;
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
  // 1. Session verification
  const session = verifyAdminSession();
  if (!session) return;

  // 2. Resolve Active MUN
  const currentMun = getSelectedMun();
  const munName = currentMun.name || 'Conference';
  const munLocation = currentMun.location || 'India';

  // 3. Update Title & Header Information
  document.title = `Delegates - ${munName} - MUNify`;

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

  if (navOverview) navOverview.href = `mun-dashboard.html?munId=${encodeURIComponent(currentMun.id)}`;
  if (navDelegates) navDelegates.href = `delegates.html?munId=${encodeURIComponent(currentMun.id)}`;
  if (navCommittees) navCommittees.href = `committees.html?munId=${encodeURIComponent(currentMun.id)}`;
  if (navSettings) navSettings.href = `mun-dashboard.html?munId=${encodeURIComponent(currentMun.id)}#settings`;
  if (backBtn) backBtn.href = `mun-dashboard.html?munId=${encodeURIComponent(currentMun.id)}`;

  // 5. Populate Committee Filter Options dynamically
  let allDelegates = getDelegatesDatabase(currentMun);
  const munDelegates = allDelegates.filter(d => String(d.munId) === String(currentMun.id));

  const committeeSelect = document.getElementById('committeeFilterSelect');
  if (committeeSelect) {
    const uniqueCommittees = Array.from(
      new Set(munDelegates.map(d => (d.committee || '').trim()).filter(Boolean))
    );

    // If less than default committees, add standard UN committees
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

  // 6. Table Rendering Function
  function renderTable() {
    allDelegates = getDelegatesDatabase(currentMun);
    let filtered = allDelegates.filter(d => String(d.munId) === String(currentMun.id));

    // Apply Search Filter (Case-insensitive on Name)
    const searchVal = (document.getElementById('delegateSearchInput')?.value || '').trim().toLowerCase();
    if (searchVal) {
      filtered = filtered.filter(d => (d.name || '').toLowerCase().includes(searchVal));
    }

    // Apply Committee Filter
    const selectedCommittee = document.getElementById('committeeFilterSelect')?.value || 'all';
    if (selectedCommittee !== 'all') {
      filtered = filtered.filter(d => (d.committee || '').trim() === selectedCommittee);
    }

    // Apply Status Filter
    const selectedStatus = document.getElementById('statusFilterSelect')?.value || 'all';
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(d => (d.status || '').toLowerCase() === selectedStatus.toLowerCase());
    }

    const tbody = document.getElementById('delegatesTableBody');
    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: #6b7280; padding: 36px 0; font-size: 15px;">
            No delegates match your current search and filter criteria.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = '';
    filtered.forEach(del => {
      const isAssigned = (del.status || '').toLowerCase() === 'assigned';
      const tr = document.createElement('tr');

      // Formatting Committee display with green checkmark when assigned
      const committeeDisplay = isAssigned && del.committee
        ? `<span class="text-green-assigned">✓ ${escapeHtml(del.committee)}</span>`
        : `<span class="text-pending-field">${escapeHtml(del.committee || '—')}</span>`;

      // Formatting Country display with green checkmark when assigned
      const countryDisplay = isAssigned && del.country
        ? `<span class="text-green-assigned">✓ ${escapeHtml(del.country)}</span>`
        : `<span class="text-pending-field">${escapeHtml(del.country || 'Pending')}</span>`;

      // Formatting Status label
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

    // Attach Info Button Handlers
    document.querySelectorAll('.btn-table-info').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openDelegateInfoModal(id);
      });
    });

    // Attach Delete Button Handlers
    document.querySelectorAll('.btn-table-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        deleteDelegate(id);
      });
    });
  }

  // 7. Initial Table Render
  renderTable();

  // 8. Event Listeners for Search & Filter Inputs
  const searchInput = document.getElementById('delegateSearchInput');
  const statusSelect = document.getElementById('statusFilterSelect');

  if (searchInput) searchInput.addEventListener('input', renderTable);
  if (committeeSelect) committeeSelect.addEventListener('change', renderTable);
  if (statusSelect) statusSelect.addEventListener('change', renderTable);

  // 9. Delegate Info Modal Logic
  const infoModalOverlay = document.getElementById('delegateInfoModalOverlay');
  const closeInfoBtn = document.getElementById('closeDelegateInfoModalBtn');
  const dismissInfoBtn = document.getElementById('dismissDelegateInfoModalBtn');

  function openDelegateInfoModal(delegateId) {
    const currentList = getDelegatesDatabase(currentMun);
    const delegate = currentList.find(d => String(d.id) === String(delegateId));
    if (!delegate || !infoModalOverlay) return;

    document.getElementById('modalDelName').textContent = delegate.name || '—';
    document.getElementById('modalDelEmail').textContent = delegate.email || '—';
    document.getElementById('modalDelCommittee').textContent = delegate.committee || '—';
    document.getElementById('modalDelCountry').textContent = delegate.country || '—';
    document.getElementById('modalDelStatus').textContent = delegate.status || 'Pending';
    document.getElementById('modalDelPhone').textContent = delegate.phone || '—';

    infoModalOverlay.classList.add('active');
  }

  function closeDelegateInfoModal() {
    if (infoModalOverlay) infoModalOverlay.classList.remove('active');
  }

  if (closeInfoBtn) closeInfoBtn.addEventListener('click', closeDelegateInfoModal);
  if (dismissInfoBtn) dismissInfoBtn.addEventListener('click', closeDelegateInfoModal);
  if (infoModalOverlay) {
    infoModalOverlay.addEventListener('click', (e) => {
      if (e.target === infoModalOverlay) closeDelegateInfoModal();
    });
  }

  // 10. Delete Delegate Logic
  function deleteDelegate(delegateId) {
    const currentList = getDelegatesDatabase(currentMun);
    const delegate = currentList.find(d => String(d.id) === String(delegateId));
    if (!delegate) return;

    const confirmed = confirm(`Are you sure you want to delete delegate "${delegate.name}" from ${currentMun.name}?`);
    if (!confirmed) return;

    const updatedList = currentList.filter(d => String(d.id) !== String(delegateId));
    localStorage.setItem('munify_delegates_db', JSON.stringify(updatedList));

    // Re-render table and preserve active session and page
    renderTable();
  }

  // 11. Mobile Sidebar Toggle
  const mobileToggle = document.getElementById('sidebarMobileToggle');
  const sidebar = document.getElementById('munSidebar');
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }

  // 12. Explicit Sidebar Logout
  const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
  if (sidebarLogoutBtn) {
    sidebarLogoutBtn.addEventListener('click', () => {
      localStorage.removeItem('munify_session');
      window.location.href = '../user/login.html';
    });
  }

  // 13. Top Header Action Modals: Results & Certificates
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
