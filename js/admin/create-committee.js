/**
 * Admin Create Committee Page JavaScript
 * Handles validation, country search, selection, removable chips, and committee creation
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Auth check
  const sessionStr = localStorage.getItem('munify_session');
  if (!sessionStr) {
    window.location.href = '../user/login.html';
    return;
  }

  // 2. Parse munId from URL
  const urlParams = new URLSearchParams(window.location.search);
  const munId = urlParams.get('munId') || 'mun_kit_1';

  // 3. Load Current MUN
  const munsDb = JSON.parse(localStorage.getItem('munify_muns_db') || '[]');
  const currentMun = munsDb.find(m => String(m.id) === String(munId)) || {
    id: munId,
    name: 'KIT MUN',
    location: 'Kolhapur'
  };

  // Configure back to dashboard link
  const backDashboardLink = document.getElementById('backDashboardLink');
  if (backDashboardLink) {
    backDashboardLink.href = `committees.html?munId=${encodeURIComponent(currentMun.id)}`;
  }

  // Full Country Database with ISO Codes for FlagCDN
  const countries = [
    { code: 'af', name: 'Afghanistan' },
    { code: 'al', name: 'Albania' },
    { code: 'dz', name: 'Algeria' },
    { code: 'ad', name: 'Andorra' },
    { code: 'ao', name: 'Angola' },
    { code: 'ag', name: 'Antigua and Barbuda' },
    { code: 'ar', name: 'Argentina' },
    { code: 'am', name: 'Armenia' },
    { code: 'au', name: 'Australia' },
    { code: 'at', name: 'Austria' },
    { code: 'az', name: 'Azerbaijan' },
    { code: 'bs', name: 'Bahamas' },
    { code: 'bh', name: 'Bahrain' },
    { code: 'bd', name: 'Bangladesh' },
    { code: 'bb', name: 'Barbados' },
    { code: 'by', name: 'Belarus' },
    { code: 'be', name: 'Belgium' },
    { code: 'bz', name: 'Belize' },
    { code: 'bj', name: 'Benin' },
    { code: 'bt', name: 'Bhutan' },
    { code: 'bo', name: 'Bolivia' },
    { code: 'ba', name: 'Bosnia and Herzegovina' },
    { code: 'bw', name: 'Botswana' },
    { code: 'br', name: 'Brazil' },
    { code: 'bn', name: 'Brunei' },
    { code: 'bg', name: 'Bulgaria' },
    { code: 'bf', name: 'Burkina Faso' },
    { code: 'bi', name: 'Burundi' },
    { code: 'kh', name: 'Cambodia' },
    { code: 'cm', name: 'Cameroon' },
    { code: 'ca', name: 'Canada' },
    { code: 'cl', name: 'Chile' },
    { code: 'cn', name: 'China' },
    { code: 'co', name: 'Colombia' },
    { code: 'cr', name: 'Costa Rica' },
    { code: 'hr', name: 'Croatia' },
    { code: 'cu', name: 'Cuba' },
    { code: 'cy', name: 'Cyprus' },
    { code: 'cz', name: 'Czech Republic' },
    { code: 'dk', name: 'Denmark' },
    { code: 'eg', name: 'Egypt' },
    { code: 'ee', name: 'Estonia' },
    { code: 'et', name: 'Ethiopia' },
    { code: 'fi', name: 'Finland' },
    { code: 'fr', name: 'France' },
    { code: 'de', name: 'Germany' },
    { code: 'gr', name: 'Greece' },
    { code: 'in', name: 'India' },
    { code: 'id', name: 'Indonesia' },
    { code: 'ir', name: 'Iran' },
    { code: 'iq', name: 'Iraq' },
    { code: 'ie', name: 'Ireland' },
    { code: 'il', name: 'Israel' },
    { code: 'it', name: 'Italy' },
    { code: 'jp', name: 'Japan' },
    { code: 'ke', name: 'Kenya' },
    { code: 'kr', name: 'South Korea' },
    { code: 'kw', name: 'Kuwait' },
    { code: 'lb', name: 'Lebanon' },
    { code: 'my', name: 'Malaysia' },
    { code: 'mx', name: 'Mexico' },
    { code: 'nl', name: 'Netherlands' },
    { code: 'nz', name: 'New Zealand' },
    { code: 'ng', name: 'Nigeria' },
    { code: 'no', name: 'Norway' },
    { code: 'pk', name: 'Pakistan' },
    { code: 'ph', name: 'Philippines' },
    { code: 'pl', name: 'Poland' },
    { code: 'pt', name: 'Portugal' },
    { code: 'qa', name: 'Qatar' },
    { code: 'ru', name: 'Russia' },
    { code: 'sa', name: 'Saudi Arabia' },
    { code: 'sg', name: 'Singapore' },
    { code: 'za', name: 'South Africa' },
    { code: 'es', name: 'Spain' },
    { code: 'se', name: 'Sweden' },
    { code: 'ch', name: 'Switzerland' },
    { code: 'th', name: 'Thailand' },
    { code: 'tr', name: 'Turkey' },
    { code: 'ae', name: 'United Arab Emirates' },
    { code: 'gb', name: 'United Kingdom' },
    { code: 'us', name: 'United States' },
    { code: 'vn', name: 'Vietnam' }
  ];

  // State
  let selectedCountries = []; // Array of country objects added as chips
  let tempCheckedCodes = new Set(); // Codes checked in the list
  let totalSeats = 30;
  let committeeStatus = false; // Inactive by default

  // DOM Elements
  const committeeNameInput = document.getElementById('committeeNameInput');
  const agendaTextarea = document.getElementById('agendaTextarea');
  const agendaErrorMsg = document.getElementById('agendaErrorMsg');
  const agendaFeedbackIcon = document.getElementById('agendaFeedbackIcon');

  const totalSeatsInput = document.getElementById('totalSeatsInput');
  const seatsFeedbackIcon = document.getElementById('seatsFeedbackIcon');

  const statusToggleCheckbox = document.getElementById('statusToggleCheckbox');
  const statusToggleText = document.getElementById('statusToggleText');

  const searchCountryInput = document.getElementById('searchCountryInput');
  const countryCounterText = document.getElementById('countryCounterText');
  const btnAddSelected = document.getElementById('btnAddSelected');
  const countriesDropdownList = document.getElementById('countriesDropdownList');

  const selectedCountriesWrapper = document.getElementById('selectedCountriesWrapper');
  const selectedChipsContainer = document.getElementById('selectedChipsContainer');
  const createCommitteeForm = document.getElementById('createCommitteeForm');

  // Initialize total seats
  if (totalSeatsInput) {
    totalSeats = parseInt(totalSeatsInput.value || '30', 10);
    totalSeatsInput.addEventListener('input', () => {
      const val = parseInt(totalSeatsInput.value || '0', 10);
      if (val > 0) {
        totalSeats = val;
        totalSeatsInput.classList.add('is-valid');
        totalSeatsInput.classList.remove('is-invalid');
        seatsFeedbackIcon.innerHTML = '<span class="icon-valid-check">✓</span>';
      } else {
        totalSeats = 0;
        totalSeatsInput.classList.remove('is-valid');
        totalSeatsInput.classList.add('is-invalid');
        seatsFeedbackIcon.innerHTML = '';
      }
      updateCounterDisplay();
    });
  }

  // Status Toggle
  if (statusToggleCheckbox) {
    statusToggleCheckbox.addEventListener('change', () => {
      committeeStatus = statusToggleCheckbox.checked;
      if (statusToggleText) {
        statusToggleText.textContent = committeeStatus ? 'Active' : 'Inactive';
      }
    });
  }

  // Render Countries Dropdown
  function renderCountryList(filterQuery = '') {
    if (!countriesDropdownList) return;
    countriesDropdownList.innerHTML = '';

    const q = filterQuery.toLowerCase().trim();
    const filtered = countries.filter(c => {
      const isAlreadyAdded = selectedCountries.some(sc => sc.code === c.code);
      if (isAlreadyAdded) return false;
      return c.name.toLowerCase().includes(q);
    });

    if (filtered.length === 0) {
      countriesDropdownList.innerHTML = `
        <div style="padding: 14px 16px; text-align: center; color: #94a3b8; font-size: 13px;">
          No matching countries available
        </div>
      `;
      return;
    }

    filtered.forEach(c => {
      const isChecked = tempCheckedCodes.has(c.code);
      const row = document.createElement('div');
      row.className = `country-dropdown-item ${isChecked ? 'is-selected-row' : ''}`;
      
      const flagUrl = `https://flagcdn.com/w40/${c.code}.png`;
      row.innerHTML = `
        <input type="checkbox" class="country-checkbox-custom" data-code="${c.code}" ${isChecked ? 'checked' : ''}>
        <img class="country-flag-icon" src="${flagUrl}" alt="${c.name} flag" loading="lazy" onerror="this.style.display='none'">
        <span class="country-name-text">${c.name}</span>
      `;

      // Checkbox change handler
      const cb = row.querySelector('.country-checkbox-custom');
      cb.addEventListener('change', (e) => {
        e.stopPropagation();
        handleCountryToggle(c, cb.checked);
      });

      // Row click handler
      row.addEventListener('click', (e) => {
        if (e.target !== cb) {
          cb.checked = !cb.checked;
          handleCountryToggle(c, cb.checked);
        }
      });

      countriesDropdownList.appendChild(row);
    });
  }

  function handleCountryToggle(country, checked) {
    if (checked) {
      const currentTotal = selectedCountries.length + tempCheckedCodes.size;
      if (currentTotal >= totalSeats) {
        alert(`You cannot select more than ${totalSeats} countries for this committee.`);
        renderCountryList(searchCountryInput?.value || '');
        return;
      }
      tempCheckedCodes.add(country.code);
    } else {
      tempCheckedCodes.delete(country.code);
    }
    updateCounterDisplay();
    renderCountryList(searchCountryInput?.value || '');
  }

  // Update counter display (e.g., 0 / 30 or 5 / 30)
  function updateCounterDisplay() {
    if (!countryCounterText) return;
    const count = selectedCountries.length + tempCheckedCodes.size;
    countryCounterText.textContent = `${count} / ${totalSeats}`;
  }

  // Open dropdown on search input focus or click
  if (searchCountryInput) {
    searchCountryInput.addEventListener('focus', () => {
      renderCountryList(searchCountryInput.value);
      if (countriesDropdownList) countriesDropdownList.style.display = 'block';
    });

    searchCountryInput.addEventListener('click', () => {
      renderCountryList(searchCountryInput.value);
      if (countriesDropdownList) countriesDropdownList.style.display = 'block';
    });

    searchCountryInput.addEventListener('input', () => {
      renderCountryList(searchCountryInput.value);
      if (countriesDropdownList) countriesDropdownList.style.display = 'block';
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    const isInsideSearch = searchCountryInput?.contains(e.target);
    const isInsideDropdown = countriesDropdownList?.contains(e.target);
    const isAddBtn = btnAddSelected?.contains(e.target);

    if (!isInsideSearch && !isInsideDropdown && !isAddBtn) {
      if (countriesDropdownList) {
        countriesDropdownList.style.display = 'none';
      }
    }
  });

  // Add Selected Button
  if (btnAddSelected) {
    btnAddSelected.addEventListener('click', () => {
      if (tempCheckedCodes.size === 0) {
        if (countriesDropdownList) countriesDropdownList.style.display = 'none';
        return;
      }

      tempCheckedCodes.forEach(code => {
        const found = countries.find(c => c.code === code);
        if (found && !selectedCountries.some(sc => sc.code === code)) {
          selectedCountries.push(found);
        }
      });

      tempCheckedCodes.clear();
      if (searchCountryInput) searchCountryInput.value = '';
      if (countriesDropdownList) countriesDropdownList.style.display = 'none';
      
      renderSelectedChips();
      updateCounterDisplay();
    });
  }

  // Render Selected Chips in Selected Countries container
  function renderSelectedChips() {
    if (!selectedChipsContainer) return;
    selectedChipsContainer.innerHTML = '';

    if (selectedCountries.length === 0) {
      selectedChipsContainer.innerHTML = '<div class="no-countries-placeholder">No countries added yet.</div>';
      return;
    }

    selectedCountries.forEach((c) => {
      const chip = document.createElement('div');
      chip.className = 'selected-country-chip';
      const flagUrl = `https://flagcdn.com/w40/${c.code}.png`;
      chip.innerHTML = `
        <img class="country-flag-icon" src="${flagUrl}" alt="${c.name} flag" loading="lazy" onerror="this.style.display='none'">
        <span>${c.name}</span>
        <button type="button" class="chip-remove-btn" data-code="${c.code}" aria-label="Remove ${c.name}">&times;</button>
      `;

      const removeBtn = chip.querySelector('.chip-remove-btn');
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedCountries = selectedCountries.filter(sc => sc.code !== c.code);
        renderSelectedChips();
        updateCounterDisplay();
        if (countriesDropdownList && countriesDropdownList.style.display !== 'none') {
          renderCountryList(searchCountryInput?.value || '');
        }
      });

      selectedChipsContainer.appendChild(chip);
    });
  }

  // Real-time validation for Agenda
  if (agendaTextarea) {
    agendaTextarea.addEventListener('input', () => {
      const val = agendaTextarea.value.trim();
      if (val.length >= 3) {
        agendaTextarea.classList.remove('is-invalid');
        if (agendaErrorMsg) agendaErrorMsg.style.display = 'none';
        if (agendaFeedbackIcon) agendaFeedbackIcon.style.display = 'none';
      }
    });
  }

  // Form Submit Handler
  if (createCommitteeForm) {
    createCommitteeForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameVal = (committeeNameInput?.value || '').trim();
      const agendaVal = (agendaTextarea?.value || '').trim();
      const seatsVal = parseInt(totalSeatsInput?.value || '0', 10);

      let hasError = false;

      // Validate Name
      if (!nameVal) {
        committeeNameInput?.classList.add('is-invalid');
        hasError = true;
      } else {
        committeeNameInput?.classList.remove('is-invalid');
      }

      // Validate Agenda
      if (!agendaVal || agendaVal.length < 3) {
        if (agendaTextarea) {
          agendaTextarea.classList.add('is-invalid');
        }
        if (agendaErrorMsg) {
          agendaErrorMsg.style.display = 'block';
          agendaErrorMsg.textContent = 'Agenda must be valid';
        }
        if (agendaFeedbackIcon) {
          agendaFeedbackIcon.style.display = 'block';
          agendaFeedbackIcon.innerHTML = '<span class="icon-invalid-excl">!</span>';
        }
        hasError = true;
      } else {
        if (agendaTextarea) agendaTextarea.classList.remove('is-invalid');
        if (agendaErrorMsg) agendaErrorMsg.style.display = 'none';
        if (agendaFeedbackIcon) agendaFeedbackIcon.style.display = 'none';
      }

      // Validate Seats
      if (seatsVal <= 0) {
        if (totalSeatsInput) totalSeatsInput.classList.add('is-invalid');
        hasError = true;
      }

      if (hasError) {
        return;
      }

      // Any remaining checked countries in list get added automatically
      if (tempCheckedCodes.size > 0) {
        tempCheckedCodes.forEach(code => {
          const found = countries.find(c => c.code === code);
          if (found && !selectedCountries.some(sc => sc.code === code)) {
            selectedCountries.push(found);
          }
        });
        tempCheckedCodes.clear();
      }

      // Save to database
      const committeesDb = JSON.parse(localStorage.getItem('munify_committees_db') || '[]');
      const newCommittee = {
        id: `comm_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        munId: currentMun.id,
        name: nameVal,
        fullName: nameVal,
        agenda: agendaVal,
        seats: seatsVal,
        delegates: selectedCountries.length || seatsVal,
        status: committeeStatus ? 'Active' : 'Inactive',
        countries: selectedCountries.map(c => ({ code: c.code, name: c.name })),
        chairs: 2,
        createdAt: new Date().toISOString()
      };

      committeesDb.push(newCommittee);
      localStorage.setItem('munify_committees_db', JSON.stringify(committeesDb));

      // Redirect back to committees page for the same MUN
      window.location.href = `committees.html?munId=${encodeURIComponent(currentMun.id)}`;
    });
  }

  // Initial renders
  renderCountryList();
  renderSelectedChips();
  updateCounterDisplay();
});
