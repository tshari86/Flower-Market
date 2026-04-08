
const CustomerModule = (() => {
  let _container = null, _db = null, tenantId = '';
  let customers = [];

  function init(container, db) {
    _container = container; _db = db;
    tenantId = _db.currentTenant;
    loadData();
    renderPage();
  }

  function loadData() {
    const data = sessionStorage.getItem(`customers_${tenantId}`);
    customers = data ? JSON.parse(data) : [];
  }

  function saveData() {
    sessionStorage.setItem(`customers_${tenantId}`, JSON.stringify(customers));
    renderPage();
  }

  function renderPage() {
    _container.innerHTML = `
      <div class="fm-page-header">
        <h1 class="fm-title">👤 Customer Master</h1>
        <button id="add-cust-btn" class="fm-btn-add">＋ Add Customer</button>
      </div>
      <div class="fm-card animate-fade-in">
        <table class="fm-table">
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Contact</th><th>Credit Limit</th><th>Current Dues</th><th style="text-align:right">Action</th>
            </tr>
          </thead>
          <tbody id="cust-list">
            ${customers.length === 0 ? `<tr><td colspan="6" class="fm-empty-state">No customers registered yet.</td></tr>` : ''}
          </tbody>
        </table>
      </div>
    `;

    const list = _container.querySelector('#cust-list');
    customers.forEach((c, idx) => {
      const dues = getDues(c);
      const isOverLimit = dues > (c.limit || 5000);

      const row = document.createElement('tr');
      row.innerHTML = `
        <td><span class="fm-badge-id">${c.id}</span></td>
        <td class="fm-semi-bold ${isOverLimit ? 'color-red' : ''}">${c.name} ${isOverLimit ? '⚠️' : ''}</td>
        <td>${c.contact}</td>
        <td>₹${c.limit || 5000}</td>
        <td class="fm-semi-bold ${isOverLimit ? 'color-red' : 'color-green'}">₹${dues.toFixed(2)}</td>
        <td style="text-align:right">
          <button class="fm-action-btn edit-btn">✏️</button>
          <button class="fm-action-btn delete-btn">🗑️</button>
        </td>
      `;
      row.querySelector('.delete-btn').addEventListener('click', () => confirmDelete(idx));
      list.appendChild(row);
    });

    _container.querySelector('#add-cust-btn').addEventListener('click', () => openModal());
  }

  function getDues(c) {
    const ledger = c.ledger || [];
    const debit = ledger.reduce((s, t) => s + (parseFloat(t.debit) || 0), 0);
    const credit = ledger.reduce((s, t) => s + (parseFloat(t.credit) || 0), 0);
    return (parseFloat(c.initialDues) || 0) + debit - credit;
  }

  function openModal(cust = null, index = -1) {
    const isEdit = cust !== null;
    const modal = document.createElement('div');
    modal.className = 'fm-modal-overlay';
    modal.innerHTML = `
      <div class="fm-modal animate-pop">
        <div class="fm-modal-header">
          <h2>${isEdit ? '✏️ Edit' : '👤 Add'} Customer</h2>
          <button class="fm-close-btn">&times;</button>
        </div>
        <form class="fm-form cust-form">
          <div class="fm-field">
            <label>Customer Name *</label>
            <input type="text" id="c-name" value="${isEdit ? cust.name : ''}" required>
          </div>
          <div class="fm-field">
            <label>Contact Number *</label>
            <input type="tel" id="c-contact" value="${isEdit ? cust.contact : ''}" required>
          </div>
          <div class="fm-field">
            <label>Credit Limit (₹)</label>
            <input type="number" id="c-limit" value="${isEdit ? cust.limit : '5000'}">
          </div>
          <div class="fm-field">
            <label>Initial Dues (₹)</label>
            <input type="number" id="c-dues" value="${isEdit ? cust.initialDues : '0'}" ${isEdit ? 'disabled' : ''}>
          </div>
          <div class="fm-modal-footer">
            <button type="button" class="fm-btn-sub cancel-btn">Cancel</button>
            <button type="submit" class="fm-btn-add">${isEdit ? 'Update' : 'Register'}</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('.fm-close-btn').addEventListener('click', () => modal.remove());
    modal.querySelector('.cancel-btn').addEventListener('click', () => modal.remove());

    modal.querySelector('.cust-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const payload = {
        id: isEdit ? cust.id : 'C' + String(Date.now()).slice(-4),
        name: modal.querySelector('#c-name').value,
        contact: modal.querySelector('#c-contact').value,
        limit: parseFloat(modal.querySelector('#c-limit').value),
        initialDues: parseFloat(modal.querySelector('#c-dues').value),
        ledger: isEdit ? cust.ledger : []
      };

      if (isEdit) customers[index] = payload;
      else customers.push(payload);
      
      saveData();
      modal.remove();
    });
  }

  function confirmDelete(idx) {
    if(confirm('Delete customer?')) { customers.splice(idx, 1); saveData(); }
  }

  return { init, getDues };
})();
window.CustomerModule = CustomerModule;
