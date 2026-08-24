/**
 * Admin Manage Committee JavaScript
 * Implements frontend state, statistics, country allocations, chair/co-chair management,
 * inline chair additions, duplicate email validation, country chip removal, and toast notifications.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Authenticate check
  const sessionStr = localStorage.getItem('munify_session');
  if (!sessionStr) {
    window.location.href = '../user/login.html';
    return;
  }

  // 2. Parse URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const munId = urlParams.get('munId') || 'mun_kit_1';
  const committeeId = urlParams.get('committeeId') || 'comm_kit_1';

  // 3. Load Current MUN & Committee
  const munsDb = JSON.parse(localStorage.getItem('munify_muns_db') || '[]');
  const currentMun = munsDb.find(m => String(m.id) === String(munId)) || {
    id: munId,
    name: 'KIT MUN',
    location: 'Kolhapur'
  };

  const committeesDb = JSON.parse(localStorage.getItem('munify_committees_db') || '[]');
  let currentCommittee = committeesDb.find(c => String(c.id) === String(committeeId));
  if (!currentCommittee) {
    currentCommittee = {
      id: committeeId,
      munId: currentMun.id,
      name: 'UNHRC',
      fullName: 'United Nations Human Rights Council',
      agenda: 'Human Resources',
      status: 'Inactive',
      seats: 10,
      delegates: 10
    };
  }

  // Configure Back to Dashboard Button
  const btnBackToDashboard = document.getElementById('btnBackToDashboard');
  if (btnBackToDashboard) {
    btnBackToDashboard.href = `mun-dashboard.html?munId=${encodeURIComponent(currentMun.id)}`;
  }

  // DOM Elements
  const mcCommitteeName = document.getElementById('mcCommitteeName');
  const mcCommitteeAgenda = document.getElementById('mcCommitteeAgenda');
  const mcStatusBadge = document.getElementById('mcStatusBadge');

  const mcTotalCountriesVal = document.getElementById('mcTotalCountriesVal');
  const mcAssignedCountriesVal = document.getElementById('mcAssignedCountriesVal');
  const mcVacantSeatsVal = document.getElementById('mcVacantSeatsVal');

  const mcAllocationTableBody = document.getElementById('mcAllocationTableBody');
  const btnAutoAssignCountries = document.getElementById('btnAutoAssignCountries');
  const btnLockAllAllocations = document.getElementById('btnLockAllAllocations');

  const mcChairsGrid = document.getElementById('mcChairsGrid');
  const btnToggleAddChairForm = document.getElementById('btnToggleAddChairForm');
  const mcAddChairFormCard = document.getElementById('mcAddChairFormCard');
  const addChairInlineForm = document.getElementById('addChairInlineForm');
  const btnCancelNewChair = document.getElementById('btnCancelNewChair');
  const btnAssignRoles = document.getElementById('btnAssignRoles');

  const mcLimitBadge = document.getElementById('mcLimitBadge');
  const mcCountriesGridContainer = document.getElementById('mcCountriesGridContainer');
  const mcCommitteeDelegatesTableBody = document.getElementById('mcCommitteeDelegatesTableBody');
  const mcToastContainer = document.getElementById('mcToastContainer');

  // Initial Data Sets
  const defaultCountryList = [
    { code: 'af', name: 'Afghanistan' },
    { code: 'al', name: 'Albania' },
    { code: 'dz', name: 'Algeria' },
    { code: 'ad', name: 'Andorra' },
    { code: 'ao', name: 'Angola' },
    { code: 'ag', name: 'Antigua and Barbuda' },
    { code: 'ar', name: 'Argentina' },
    { code: 'am', name: 'Armenia' },
    { code: 'au', name: 'Australia' },
    { code: 'at', name: 'Austria' }
  ];

  // Committee Countries State
  let committeeCountries = (currentCommittee.countries && currentCommittee.countries.length > 0)
    ? currentCommittee.countries
    : defaultCountryList;

  // Country Allocations State
  let countryAllocations = committeeCountries.map((c, idx) => {
    if (c.name === 'Australia' || idx === 8) {
      return {
        country: c.name,
        code: c.code,
        delegate: 'Anuraj Deshmukh',
        status: 'Locked'
      };
    }
    return {
      country: c.name,
      code: c.code,
      delegate: 'Unassigned',
      status: 'Available'
    };
  });

  // Chair Candidates State
  let chairCandidates = [
    { id: 'chair_1', name: 'Anuraj Deshmukh', email: 'anurajdeshmukh360@gmail.com' },
    { id: 'chair_2', name: 'arin', email: 'arin123@gmail.com' }
  ];

  let selectedChairId = 'chair_1';
  let selectedCoChairId = 'chair_2';

  // Committee Delegates State
  let committeeDelegates = [
    { name: 'Anuraj Deshmukh', country: 'Australia', code: 'au', status: 'Assigned' }
  ];

  // Helper: Toast Notifications
  function showToast(message, type = 'normal') {
    if (!mcToastContainer) return;
    const toast = document.createElement('div');
    toast.className = `mc-toast ${type}`;
    toast.textContent = message;
    mcToastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 250);
    }, 3500);
  }

  // 1. Render Header & Statistics
  function renderHeaderAndStats() {
    if (mcCommitteeName) mcCommitteeName.textContent = currentCommittee.name || 'UNHRC';
    if (mcCommitteeAgenda) mcCommitteeAgenda.textContent = `Agenda: ${currentCommittee.agenda || 'Human Resources'}`;

    const isInactive = (currentCommittee.status || 'Inactive').toLowerCase() === 'inactive';
    if (mcStatusBadge) {
      mcStatusBadge.textContent = isInactive ? 'INACTIVE' : 'ACTIVE';
      mcStatusBadge.className = `mc-status-badge ${isInactive ? 'inactive' : 'active'}`;
    }

    const totalCount = committeeCountries.length;
    const assignedCount = countryAllocations.filter(a => a.delegate !== 'Unassigned').length;
    const vacantCount = Math.max(0, totalCount - assignedCount);

    if (mcTotalCountriesVal) mcTotalCountriesVal.textContent = totalCount;
    if (mcAssignedCountriesVal) mcAssignedCountriesVal.textContent = assignedCount;
    if (mcVacantSeatsVal) mcVacantSeatsVal.textContent = vacantCount;

    if (mcLimitBadge) {
      mcLimitBadge.textContent = `Limit Reached (${totalCount}/10)`;
    }
  }

  // 2. Render Country Allocation Table
  function renderCountryAllocationTable() {
    if (!mcAllocationTableBody) return;
    mcAllocationTableBody.innerHTML = '';

    if (countryAllocations.length === 0) {
      mcAllocationTableBody.innerHTML = `
        <tr>
          <td colspan="3" style="text-align: center; color: #64748b; padding: 24px;">
            No country allocations currently configured.
          </td>
        </tr>
      `;
      return;
    }

    countryAllocations.forEach(alloc => {
      const tr = document.createElement('tr');
      const flagUrl = `https://flagcdn.com/w40/${alloc.code.toLowerCase()}.png`;

      const isLocked = alloc.status === 'Locked';
      const statusBadge = isLocked 
        ? `<span class="mc-badge-locked">Locked</span>`
        : `<span class="mc-badge-available">Available</span>`;

      tr.innerHTML = `
        <td>
          <div class="mc-country-cell">
            <img class="mc-flag-img" src="${flagUrl}" alt="${alloc.country} flag" onerror="this.style.display='none'">
            <span>${alloc.country}</span>
          </div>
        </td>
        <td>${alloc.delegate}</td>
        <td>${statusBadge}</td>
      `;

      mcAllocationTableBody.appendChild(tr);
    });
  }

  // 3. Render Chair Candidates
  function renderChairCandidates() {
    if (!mcChairsGrid) return;
    mcChairsGrid.innerHTML = '';

    if (chairCandidates.length === 0) {
      mcChairsGrid.innerHTML = `
        <div class="mc-empty-chairs-box">
          <p class="mc-empty-chairs-text">No chairs available.</p>
          <button type="button" class="mc-btn-navy" id="btnAddChairManuallyBtn">Add Chair Manually</button>
        </div>
      `;

      const btnManual = document.getElementById('btnAddChairManuallyBtn');
      if (btnManual) {
        btnManual.addEventListener('click', () => {
          if (mcAddChairFormCard) mcAddChairFormCard.style.display = 'block';
          const nameInput = document.getElementById('newChairName');
          if (nameInput) nameInput.focus();
        });
      }
      return;
    }

    chairCandidates.forEach(cand => {
      const isChair = cand.id === selectedChairId;
      const isCoChair = cand.id === selectedCoChairId;

      const card = document.createElement('div');
      let roleClass = '';
      let roleBadgeHtml = '';

      if (isChair) {
        roleClass = 'is-chair';
        roleBadgeHtml = `<span class="mc-card-role-badge chair">CHAIR</span>`;
      } else if (isCoChair) {
        roleClass = 'is-co-chair';
        roleBadgeHtml = `<span class="mc-card-role-badge co-chair">CO-CHAIR</span>`;
      }

      card.className = `mc-chair-person-card ${roleClass}`;
      card.id = `cand_${cand.id}`;

      card.innerHTML = `
        ${roleBadgeHtml}
        <button type="button" class="mc-card-remove-btn" data-id="${cand.id}" data-name="${cand.name}" title="Remove person">&times;</button>
        <div class="mc-person-avatar-circle">&#128100;</div>
        <h4 class="mc-chair-name">${cand.name}</h4>
        <p class="mc-chair-email">${cand.email}</p>
      `;

      // Card click for role selection (Click once for Chair, another for Co-Chair)
      card.addEventListener('click', (e) => {
        // Prevent trigger if remove button clicked
        if (e.target.closest('.mc-card-remove-btn')) return;

        if (cand.id === selectedChairId) {
          // Deselect chair
          selectedChairId = null;
        } else if (cand.id === selectedCoChairId) {
          // Deselect co-chair
          selectedCoChairId = null;
        } else {
          // Assign to vacant slot
          if (!selectedChairId) {
            selectedChairId = cand.id;
          } else if (!selectedCoChairId) {
            selectedCoChairId = cand.id;
          } else {
            // Both assigned, cycle chair
            selectedChairId = cand.id;
          }
        }
        renderChairCandidates();
      });

      mcChairsGrid.appendChild(card);
    });

    // Attach remove handlers
    const removeBtns = mcChairsGrid.querySelectorAll('.mc-card-remove-btn');
    removeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const candId = btn.getAttribute('data-id');
        const candName = btn.getAttribute('data-name');

        chairCandidates = chairCandidates.filter(c => c.id !== candId);
        if (selectedChairId === candId) selectedChairId = null;
        if (selectedCoChairId === candId) selectedCoChairId = null;

        showToast(`${candName} removed from list`);
        renderChairCandidates();
      });
    });
  }

  // 4. Render Manage Countries 4-Column Grid
  function renderManageCountries() {
    if (!mcCountriesGridContainer) return;
    mcCountriesGridContainer.innerHTML = '';

    if (committeeCountries.length === 0) {
      mcCountriesGridContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: #64748b; padding: 20px;">
          No countries in this committee.
        </div>
      `;
      return;
    }

    committeeCountries.forEach(c => {
      const item = document.createElement('div');
      item.className = 'mc-country-chip-item';
      const flagUrl = `https://flagcdn.com/w40/${c.code.toLowerCase()}.png`;

      item.innerHTML = `
        <div class="mc-country-chip-left">
          <img class="mc-flag-img" src="${flagUrl}" alt="${c.name} flag" onerror="this.style.display='none'">
          <span>${c.name}</span>
        </div>
        <button type="button" class="mc-country-remove-btn" data-code="${c.code}" data-name="${c.name}" title="Remove country">&times;</button>
      `;

      mcCountriesGridContainer.appendChild(item);
    });

    // Attach country remove handlers
    const removeCountryBtns = mcCountriesGridContainer.querySelectorAll('.mc-country-remove-btn');
    removeCountryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.getAttribute('data-code');
        const name = btn.getAttribute('data-name');

        committeeCountries = committeeCountries.filter(c => c.code !== code);
        countryAllocations = countryAllocations.filter(a => a.code !== code);

        showToast(`${name} removed from committee`);
        renderHeaderAndStats();
        renderCountryAllocationTable();
        renderManageCountries();
      });
    });
  }

  // 5. Render Committee Delegates Table
  function renderCommitteeDelegates() {
    if (!mcCommitteeDelegatesTableBody) return;
    mcCommitteeDelegatesTableBody.innerHTML = '';

    if (committeeDelegates.length === 0) {
      mcCommitteeDelegatesTableBody.innerHTML = `
        <tr>
          <td colspan="3" style="text-align: center; color: #64748b; padding: 24px;">
            No delegates assigned yet.
          </td>
        </tr>
      `;
      return;
    }

    committeeDelegates.forEach(del => {
      const tr = document.createElement('tr');
      const flagUrl = `https://flagcdn.com/w40/${del.code.toLowerCase()}.png`;

      tr.innerHTML = `
        <td>${del.name}</td>
        <td>
          <div class="mc-country-cell">
            <img class="mc-flag-img" src="${flagUrl}" alt="${del.country} flag" onerror="this.style.display='none'">
            <span>${del.country}</span>
          </div>
        </td>
        <td><span class="mc-badge-assigned">${del.status}</span></td>
      `;

      mcCommitteeDelegatesTableBody.appendChild(tr);
    });
  }

  // Auto Assign Countries Button
  if (btnAutoAssignCountries) {
    btnAutoAssignCountries.addEventListener('click', () => {
      const sampleNames = ['Anuraj Deshmukh', 'Rahul Sharma', 'Sneha Patil', 'Aman Verma', 'Pooja Kulkarni', 'Aditya Joshi', 'Neha Deshpande', 'Rohan Mehta', 'Vikram Singh', 'Tanvi Shinde'];
      
      countryAllocations = countryAllocations.map((alloc, i) => ({
        ...alloc,
        delegate: sampleNames[i % sampleNames.length],
        status: 'Locked'
      }));

      // Update committee delegates table with assigned rows
      committeeDelegates = countryAllocations.map(a => ({
        name: a.delegate,
        country: a.country,
        code: a.code,
        status: 'Assigned'
      }));

      renderHeaderAndStats();
      renderCountryAllocationTable();
      renderCommitteeDelegates();
      showToast('Countries auto-assigned and locked');
    });
  }

  // Lock All Allocations Button
  if (btnLockAllAllocations) {
    btnLockAllAllocations.addEventListener('click', () => {
      countryAllocations = countryAllocations.map(alloc => ({
        ...alloc,
        status: 'Locked'
      }));

      renderCountryAllocationTable();
      showToast('All country allocations locked successfully');
    });
  }

  // Toggle Add Chair Form Button
  if (btnToggleAddChairForm) {
    btnToggleAddChairForm.addEventListener('click', () => {
      if (!mcAddChairFormCard) return;
      const isShown = mcAddChairFormCard.style.display === 'block';
      mcAddChairFormCard.style.display = isShown ? 'none' : 'block';
      if (!isShown) {
        const nameInput = document.getElementById('newChairName');
        if (nameInput) nameInput.focus();
      }
    });
  }

  // Cancel New Chair Button
  if (btnCancelNewChair) {
    btnCancelNewChair.addEventListener('click', () => {
      if (mcAddChairFormCard) mcAddChairFormCard.style.display = 'none';
      if (addChairInlineForm) addChairInlineForm.reset();
    });
  }

  // Submit Add Chair Inline Form
  if (addChairInlineForm) {
    addChairInlineForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('newChairName');
      const emailInput = document.getElementById('newChairEmail');
      const passwordInput = document.getElementById('newChairPassword');

      const nameVal = (nameInput?.value || '').trim();
      const emailVal = (emailInput?.value || '').trim().toLowerCase();
      const passVal = (passwordInput?.value || '').trim();

      if (!nameVal || !emailVal || !passVal) {
        showToast('Please fill in all chair fields', 'error');
        return;
      }

      // Check for duplicate email
      const isDuplicate = chairCandidates.some(c => c.email.toLowerCase() === emailVal);
      if (isDuplicate) {
        showToast('Email is already registered', 'error');
        return;
      }

      // Add to chair candidate list
      const newChair = {
        id: `chair_${Date.now()}`,
        name: nameVal,
        email: emailVal
      };

      chairCandidates.push(newChair);
      addChairInlineForm.reset();
      if (mcAddChairFormCard) mcAddChairFormCard.style.display = 'none';

      showToast(`${nameVal} added to chair candidates`, 'success');
      renderChairCandidates();
    });
  }

  // Assign Roles Button
  if (btnAssignRoles) {
    btnAssignRoles.addEventListener('click', () => {
      const chairPerson = chairCandidates.find(c => c.id === selectedChairId);
      const coChairPerson = chairCandidates.find(c => c.id === selectedCoChairId);

      if (chairPerson && coChairPerson) {
        showToast(`Assigned ${chairPerson.name} as Chair & ${coChairPerson.name} as Co-Chair`);
      } else if (chairPerson) {
        showToast(`Assigned ${chairPerson.name} as Chair`);
      } else if (coChairPerson) {
        showToast(`Assigned ${coChairPerson.name} as Co-Chair`);
      } else {
        showToast('Please select Chair or Co-Chair from the list', 'error');
      }
    });
  }

  // Initial Full Render
  renderHeaderAndStats();
  renderCountryAllocationTable();
  renderChairCandidates();
  renderManageCountries();
  renderCommitteeDelegates();
});
