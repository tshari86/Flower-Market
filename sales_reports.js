
const CashReceiveModule = (() => {
  let _container = null, _db = null, tenantId = '';
  let receipts = [];

  function init(container, db) {
    _container = container; _db = db;
    tenantId = _db.currentTenant;
    loadData();
    renderPage();
  }

  function loadData() {
    const data = sessionStorage.getItem(`receipts_${tenantId}`);
    receipts = data ? JSON.parse(data) : [];
  }

  function saveData() {
    sessionStorage.setItem(`receipts_${tenantId}`, JSON.stringify(receipts));
    renderPage();
  }

  function getCustomers() {
    return JSON.parse(sessionStorage.getItem(`customers_${tenantId}`) || '[]');
  }

  function renderPage() {
    _container.innerHTML = `
      <div class="fm-page-header">
        <h1 class="fm-title">💰 Cash Receive</h1>
        <button id="add-receipt-btn" class="fm-btn-add">＋ Receive Payment</button>
      </div>
      <div class="fm-card animate-fade-in">
        <table class="fm-table">
          <thead>
            <tr>
              <th>Date</th><th>Customer Name</th><th>Amount Received</th><th>Notes</th><th style="text-align:right">Action</th>
            </tr>
          </thead>
          <tbody id="receipt-list">
            ${receipts.length === 0 ? `<tr><td colspan="5" class="fm-empty-state">No receipts found.</td></tr>` : ''}
          </tbody>
        </table>
      </div>
    `;

    const list = _container.querySelector('#receipt-list');
    [...receipts].reverse().forEach((r, idxOrig) => {
      const idx = receipts.length - 1 - idxOrig;
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${r.date}</td>
        <td class="fm-semi-bold">${r.customerName}</td>
        <td class="fm-semi-bold color-green">₹${r.amount}</td>
        <td>${r.notes || '—'}</td>
        <td style="text-align:right">
          <button class="fm-action-btn delete-btn">🗑️</button>
        </td>
      `;
      row.querySelector('.delete-btn').addEventListener('click', () => confirmDelete(idx));
      list.appendChild(row);
    });

    _container.querySelector('#add-receipt-btn').addEventListener('click', openModal);
  }

  function openModal() {
    const custs = getCustomers();
    const modal = document.createElement('div');
    modal.className = 'fm-modal-overlay';
    modal.innerHTML = `
      <div class="fm-modal animate-pop">
        <div class="fm-modal-header">
          <h2>💰 Record Cash Receipt</h2>
          <button class="fm-close-btn">&times;</button>
        </div>
        <form class="fm-form receipt-form">
          <div class="fm-field">
            <label>Date</label>
            <input type="date" id="r-date" value="${new Date().toISOString().split('T')[0]}" required>
          </div>
          <div class="fm-field">
            <label>Customer *</label>
            <select id="r-cust" required>
              <option value="">Select Customer</option>
              ${custs.map(c => `<option value="${c.id}">${c.name} (${c.id})</option>`).join('')}
            </select>
          </div>
          <div class="fm-field">
            <label>Amount (₹) *</label>
            <input type="number" id="r-amount" placeholder="0.00" step="0.01" required>
          </div>
          <div class="fm-field">
            <label>Notes</label>
            <textarea id="r-notes" placeholder="e.g. Paid via cash"></textarea>
          </div>
          <div class="fm-modal-footer">
            <button type="button" class="fm-btn-sub cancel-btn">Cancel</button>
            <button type="submit" class="fm-btn-add">Save Receipt</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('.fm-close-btn').addEventListener('click', () => modal.remove());
    modal.querySelector('.cancel-btn').addEventListener('click', () => modal.remove());

    modal.querySelector('.receipt-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const custId = modal.querySelector('#r-cust').value;
      const cust = custs.find(c => c.id === custId);
      
      const r = {
        id: Date.now(),
        date: modal.querySelector('#r-date').value,
        customerId: custId,
        customerName: cust.name,
        amount: parseFloat(modal.querySelector('#r-amount').value),
        notes: modal.querySelector('#r-notes').value
      };

      receipts.push(r);
      updateCustomerLedger(r);
      saveData();
      modal.remove();
    });
  }

  function updateCustomerLedger(r) {
    const custs = getCustomers();
    const idx = custs.findIndex(c => c.id === r.customerId);
    if (idx > -1) {
      if (!custs[idx].ledger) custs[idx].ledger = [];
      custs[idx].ledger.push({
        date: r.date,
        description: `Cash Received: ${r.notes || 'No notes'}`,
        debit: 0,
        credit: r.amount
      });
      sessionStorage.setItem(`customers_${tenantId}`, JSON.stringify(custs));
    }
  }

  function confirmDelete(idx) {
    if(confirm('Delete receipt?')) { receipts.splice(idx, 1); saveData(); }
  }

  return { init };
})();

const CustomerReportModule = (() => {
  let _container = null, _db = null, tenantId = '';

  function init(container, db) {
    _container = container; _db = db;
    tenantId = _db.currentTenant;
    renderPage();
  }

  function getCustomers() {
    return JSON.parse(sessionStorage.getItem(`customers_${tenantId}`) || '[]');
  }

  function renderPage() {
    const custs = getCustomers();
    _container.innerHTML = `
      <div class="fm-page-header">
        <h1 class="fm-title">📈 Customer Reports</h1>
      </div>
      <div class="fm-summary-grid">
        <div class="fm-stat-card card-blue">
          <h3>Total Customers</h3>
          <p>${custs.length}</p>
        </div>
        <div class="fm-stat-card card-red">
          <h3>Outstanding Dues</h3>
          <p>₹${custs.reduce((s, c) => s + CustomerModule.getDues(c), 0).toFixed(2)}</p>
        </div>
      </div>
      <div class="fm-card animate-fade-in">
        <table class="fm-table">
          <thead>
            <tr>
              <th>Customer</th><th>Contact</th><th>Credit Limit</th><th>Current Dues</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${custs.map(c => {
              const dues = CustomerModule.getDues(c);
              const limit = c.limit || 5000;
              return `
                <tr>
                  <td class="fm-semi-bold">${c.name}</td>
                  <td>${c.contact}</td>
                  <td>₹${limit}</td>
                  <td class="${dues > limit ? 'color-red' : 'color-green'}">₹${dues.toFixed(2)}</td>
                  <td>${dues > limit ? '<span class="fm-tag-absent">Over Limit</span>' : '<span class="fm-badge-id">Healthy</span>'}</td>
                </tr>
              `;
            }).join('')}
            ${custs.length === 0 ? '<tr><td colspan="5" class="fm-empty-state">No customer data available.</td></tr>' : ''}
          </tbody>
        </table>
      </div>
    `;
  }

  return { init };
})();

window.CashReceiveModule = CashReceiveModule;
window.CustomerReportModule = CustomerReportModule;
