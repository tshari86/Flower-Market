const AbsentFarmerModule = (() => {
  let _container = null;
  let _db = null;
  let tenantId = '';
  let selectedDate = new Date().toISOString().split('T')[0];
  let filterType = 'today'; // today, week, month, custom
  let searchQuery = '';

  function init(container, db) {
    _container = container;
    _db = db;
    tenantId = sessionStorage.getItem('tenantId') || _db.currentTenant;
    renderPage();
  }

  function getAbsentFarmers() {
    // 1. Load all registered farmers
    const farmersRaw = sessionStorage.getItem(`farmers_${tenantId}`);
    const allFarmers = farmersRaw ? JSON.parse(farmersRaw) : [];

    // 2. Load purchase/entry data to see who is PRESENT
    // (Note: Currently using mock/empty if module not yet built)
    const purchaseRaw = sessionStorage.getItem(`purchases_${tenantId}`);
    const allPurchases = purchaseRaw ? JSON.parse(purchaseRaw) : [];

    // 3. Filter purchases by selected date/range
    const presentFarmerIds = new Set();
    
    // Simple logic: if a record exists for the date, the farmer was present
    allPurchases.forEach(p => {
      // Logic for different filters could be added here
      if (p.date === selectedDate) {
        presentFarmerIds.add(p.farmerId);
      }
    });

    // 4. Absent = All - Present
    let absent = allFarmers.filter(f => !presentFarmerIds.has(f.id));

    // 5. Apply Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      absent = absent.filter(f => 
        f.name.toLowerCase().includes(q) || 
        f.id.toLowerCase().includes(q)
      );
    }

    return absent;
  }

  function renderPage() {
    _container.innerHTML = `
      <div class="fm-page-header">
        <h1 class="fm-title">🚫 <span data-i18n="absent_title">Absent Farmer</span></h1>
        <div class="fm-header-actions">
          <div class="fm-filter-group">
            <select id="absent-date-preset" class="fm-select">
              <option value="today" ${filterType === 'today' ? 'selected' : ''}>Today</option>
              <option value="custom" ${filterType === 'custom' ? 'selected' : ''}>Custom Date</option>
            </select>
          </div>
          <div id="custom-date-container" class="fm-filter-group ${filterType !== 'custom' ? 'hidden' : ''}">
            <input type="date" id="absent-date-inp" class="fm-input" value="${selectedDate}">
          </div>
        </div>
      </div>

      <div class="fm-search-section">
        <div class="fm-search-wrap">
          <span class="fm-search-icon">🔍</span>
          <input type="text" id="absent-search" placeholder="Search by name or ID..." value="${searchQuery}">
        </div>
      </div>

      <div class="fm-card">
        <table class="fm-table">
          <thead>
            <tr>
              <th>Farmer ID</th>
              <th>Farmer Name</th>
              <th>Location</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody id="absent-list"></tbody>
        </table>
      </div>
    `;

    renderList();

    // Events
    const preset = _container.querySelector('#absent-date-preset');
    preset.addEventListener('change', (e) => {
      filterType = e.target.value;
      if (filterType === 'today') {
        selectedDate = new Date().toISOString().split('T')[0];
        _container.querySelector('#custom-date-container').classList.add('hidden');
      } else {
        _container.querySelector('#custom-date-container').classList.remove('hidden');
      }
      renderList();
    });

    _container.querySelector('#absent-date-inp').addEventListener('change', (e) => {
      selectedDate = e.target.value;
      renderList();
    });

    _container.querySelector('#absent-search').addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderList();
    });
  }

  function renderList() {
    const list = _container.querySelector('#absent-list');
    const absentData = getAbsentFarmers();

    if (absentData.length === 0) {
      list.innerHTML = `<tr><td colspan="4" class="fm-empty-state">All farmers are present for this date!</td></tr>`;
      return;
    }

    list.innerHTML = absentData.map(f => `
      <tr class="animate-fade-in">
        <td><span class="fm-badge-id">${f.id}</span></td>
        <td class="fm-semi-bold">${f.name}</td>
        <td>${f.location || '—'}</td>
        <td><span class="fm-tag-absent">Absent</span></td>
      </tr>
    `).join('');
  }

  return { init };
})();
