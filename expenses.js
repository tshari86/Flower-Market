
const ExpensesModule = (() => {
  let _container = null, _db = null, tenantId = '';
  let expenses = [];

  function init(container, db) {
    _container = container; _db = db;
    tenantId = _db.currentTenant;
    loadData();
    renderPage();
  }

  function loadData() {
    const data = sessionStorage.getItem(`expenses_${tenantId}`);
    expenses = data ? JSON.parse(data) : [];
  }

  function saveData() {
    sessionStorage.setItem(`expenses_${tenantId}`, JSON.stringify(expenses));
    renderPage();
  }

  function renderPage() {
    _container.innerHTML = `
      <div class="fm-page-header">
        <h1 class="fm-title">📉 Expenses</h1>
        <button id="add-exp-btn" class="fm-btn-add">＋ Add Expense</button>
      </div>
      <div class="fm-card animate-fade-in">
        <table class="fm-table">
          <thead>
            <tr>
              <th>Date</th><th>Type</th><th>Amount</th><th>Notes</th><th style="text-align:right">Action</th>
            </tr>
          </thead>
          <tbody id="exp-list">
            ${expenses.length === 0 ? `<tr><td colspan="5" class="fm-empty-state">No expenses recorded.</td></tr>` : ''}
          </tbody>
        </table>
      </div>
    `;

    const list = _container.querySelector('#exp-list');
    [...expenses].reverse().forEach((e, idxOrig) => {
      const idx = expenses.length - 1 - idxOrig;
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${e.date}</td>
        <td class="fm-semi-bold">${e.type}</td>
        <td class="fm-semi-bold color-red">₹${e.amount}</td>
        <td>${e.notes || '—'}</td>
        <td style="text-align:right">
          <button class="fm-action-btn delete-btn">🗑️</button>
        </td>
      `;
      row.querySelector('.delete-btn').addEventListener('click', () => confirmDelete(idx));
      list.appendChild(row);
    });

    _container.querySelector('#add-exp-btn').addEventListener('click', openModal);
  }

  function openModal() {
    const modal = document.createElement('div');
    modal.className = 'fm-modal-overlay';
    modal.innerHTML = `
      <div class="fm-modal animate-pop">
        <div class="fm-modal-header">
          <h2>📊 Add New Expense</h2>
          <button class="fm-close-btn">&times;</button>
        </div>
        <form class="fm-form exp-form">
          <div class="fm-field">
            <label>Date</label>
            <input type="date" id="exp-date" value="${new Date().toISOString().split('T')[0]}" required>
          </div>
          <div class="fm-field">
            <label>Expense Type *</label>
            <select id="exp-type" required>
              <option value="Rent">Rent</option>
              <option value="Electricity">Electricity</option>
              <option value="Tea/Snacks">Tea/Snacks</option>
              <option value="Transport">Transport</option>
              <option value="Labour">Labour</option>
              <option value="Stationary">Stationary</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div class="fm-field">
            <label>Amount (₹) *</label>
            <input type="number" id="exp-amount" placeholder="0.00" step="0.01" required>
          </div>
          <div class="fm-field">
            <label>Notes</label>
            <textarea id="exp-notes" placeholder="Optional details..."></textarea>
          </div>
          <div class="fm-modal-footer">
            <button type="button" class="fm-btn-sub cancel-btn">Cancel</button>
            <button type="submit" class="fm-btn-add">Record Expense</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    modal.querySelector('.fm-close-btn').addEventListener('click', () => modal.remove());
    modal.querySelector('.cancel-btn').addEventListener('click', () => modal.remove());

    modal.querySelector('.exp-form').addEventListener('submit', (ev) => {
      ev.preventDefault();
      const exp = {
        id: Date.now(),
        date: modal.querySelector('#exp-date').value,
        type: modal.querySelector('#exp-type').value,
        amount: parseFloat(modal.querySelector('#exp-amount').value),
        notes: modal.querySelector('#exp-notes').value
      };
      expenses.push(exp);
      saveData();
      modal.remove();
    });
  }

  function confirmDelete(idx) {
    if (confirm('Delete this expense entry?')) {
      expenses.splice(idx, 1);
      saveData();
    }
  }

  return { init };
})();
window.ExpensesModule = ExpensesModule;
