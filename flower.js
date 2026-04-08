const FlowerModule = (() => {
  let flowers = [];
  let _container = null;
  let tenantId = '';
  let _db = null;

  function init(container, db) {
    _container = container;
    _db = db;
    tenantId = sessionStorage.getItem('tenantId') || _db.currentTenant;
    loadData();
    renderPage();
  }

  function loadData() {
    const data = sessionStorage.getItem(`flowers_${tenantId}`);
    flowers = data ? JSON.parse(data) : [];
  }

  function saveData() {
    sessionStorage.setItem(`flowers_${tenantId}`, JSON.stringify(flowers));
    renderPage();
  }

  function renderPage() {
    _container.innerHTML = `
      <div class="fm-page-header">
        <h1 class="fm-title">🌼 <span data-i18n="flower_title">Flower</span></h1>
        <button id="add-flower-btn" class="fm-btn-add">＋ <span data-i18n="add_flower">Add Flower</span></button>
      </div>

      <div class="fm-card">
        <table class="fm-table">
          <thead>
            <tr>
              <th style="width: 80%"><span data-i18n="flower_name">Flower Name</span></th>
              <th style="text-align: right"><span data-i18n="actions">Actions</span></th>
            </tr>
          </thead>
          <tbody id="flower-list">
            ${flowers.length === 0 ? `<tr><td colspan="2" class="fm-empty-state">No flowers found. Click 'Add Flower' to start!</td></tr>` : ''}
          </tbody>
        </table>
      </div>
    `;

    const list = _container.querySelector('#flower-list');
    flowers.forEach((flower, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="fm-semi-bold">${flower.name}</td>
        <td style="text-align: right">
          <div class="fm-table-actions">
            <button class="fm-action-btn edit-btn" title="Edit">✏️</button>
            <button class="fm-action-btn delete-btn" title="Delete">🗑️</button>
          </div>
        </td>
      `;
      
      row.querySelector('.edit-btn').addEventListener('click', () => openModal(flower, index));
      row.querySelector('.delete-btn').addEventListener('click', () => confirmDelete(index));
      list.appendChild(row);
    });

    _container.querySelector('#add-flower-btn').addEventListener('click', () => openModal());
  }

  function openModal(flower = null, index = -1) {
    const isEdit = flower !== null;
    const modal = document.createElement('div');
    modal.className = 'fm-modal-overlay';
    modal.innerHTML = `
      <div class="fm-modal animate-pop">
        <div class="fm-modal-header">
          <h2>${isEdit ? '✏️ Edit Flower' : '🌼 Add New Flower'}</h2>
          <button class="fm-close-btn">&times;</button>
        </div>
        <form class="fm-form">
          <div class="fm-field">
            <label>Flower Name *</label>
            <input type="text" id="flower-name" placeholder="Enter name" value="${isEdit ? flower.name : ''}" required>
          </div>
          <div class="fm-modal-footer">
            <button type="button" class="fm-btn-sub cancel-btn">Cancel</button>
            <button type="submit" class="fm-btn-add">${isEdit ? 'Update' : 'Register'} Flower</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    modal.querySelector('#flower-name').focus();

    const closeModal = () => modal.remove();
    modal.querySelector('.fm-close-btn').addEventListener('click', closeModal);
    modal.querySelector('.cancel-btn').addEventListener('click', closeModal);

    modal.querySelector('.fm-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = modal.querySelector('#flower-name').value.trim();
      
      if (!name) return;

      // Duplicate check
      const exists = flowers.some((f, i) => f.name.toLowerCase() === name.toLowerCase() && i !== index);
      if (exists) {
        alert('This flower name already exists!');
        return;
      }

      if (isEdit) {
        flowers[index].name = name;
      } else {
        flowers.push({ name });
      }

      saveData();
      closeModal();
    });
  }

  function confirmDelete(index) {
    const flower = flowers[index];
    if (confirm(`Are you sure you want to delete "${flower.name}"?`)) {
      flowers.splice(index, 1);
      saveData();
    }
  }

  return { init };
})();
