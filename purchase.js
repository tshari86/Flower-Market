
const PurchaseModule = (() => {
  let _container = null, _db = null, tenantId = '';
  let purchases = [];

  function init(container, db) {
    _container = container; _db = db;
    tenantId = _db.currentTenant;
    loadData();
    renderPage();
  }

  function loadData() {
    const data = sessionStorage.getItem(`purchases_${tenantId}`);
    purchases = data ? JSON.parse(data) : [];
  }

  function saveData() {
    sessionStorage.setItem(`purchases_${tenantId}`, JSON.stringify(purchases));
    renderPage();
  }

  function getFarmers() {
    const data = sessionStorage.getItem(`farmers_${tenantId}`);
    return data ? JSON.parse(data) : [];
  }

  function getFlowers() {
    const data = sessionStorage.getItem(`flowers_${tenantId}`);
    return data ? JSON.parse(data) : [];
  }

  function renderPage() {
    _container.innerHTML = `
      <div class="fm-page-header">
        <h1 class="fm-title">🛒 Purchase</h1>
        <button id="add-purchase-btn" class="fm-btn-add">＋ Add Purchase</button>
      </div>
      <div class="fm-card animate-fade-in">
        <table class="fm-table">
          <thead>
            <tr>
              <th>Date</th><th>Farmer</th><th>Flower</th>
              <th>Qty</th><th>Rate</th><th>Total</th>
              <th>Comm%</th><th>Net Amount</th>
              <th style="text-align:right">Action</th>
            </tr>
          </thead>
          <tbody id="purchase-list">
            ${purchases.length === 0 ? `<tr><td colspan="9" class="fm-empty-state">No purchases found today.</td></tr>` : ''}
          </tbody>
        </table>
      </div>
    `;

    const list = _container.querySelector('#purchase-list');
    [...purchases].reverse().forEach((p, idxOriginal) => {
      const idx = purchases.length - 1 - idxOriginal;
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${p.date}</td>
        <td class="fm-semi-bold">${p.farmerName}</td>
        <td>${p.flowerName}</td>
        <td>${p.qty}</td>
        <td>₹${p.rate}</td>
        <td>₹${p.total}</td>
        <td>${p.comm}%</td>
        <td class="fm-semi-bold color-green">₹${p.net}</td>
        <td style="text-align:right">
          <button class="fm-action-btn delete-btn">🗑️</button>
        </td>
      `;
      row.querySelector('.delete-btn').addEventListener('click', () => confirmDelete(idx));
      list.appendChild(row);
    });

    _container.querySelector('#add-purchase-btn').addEventListener('click', openModal);
  }

  function openModal() {
    const farmers = getFarmers();
    const flowers = getFlowers();
    const modal = document.createElement('div');
    modal.className = 'fm-modal-overlay';
    modal.innerHTML = `
      <div class="fm-modal animate-pop" style="max-width: 600px">
        <div class="fm-modal-header">
          <h2>🛒 New Purchase Entry</h2>
          <button class="fm-close-btn">&times;</button>
        </div>
        <form class="fm-form purchase-form">
          <div class="fm-form-grid">
            <div class="fm-field">
              <label>Date</label>
              <input type="date" id="p-date" value="${new Date().toISOString().split('T')[0]}" required>
            </div>
            <div class="fm-field">
              <label>Farmer Name *</label>
              <select id="p-farmer" required>
                <option value="">Select Farmer</option>
                ${farmers.map(f => `<option value="${f.id}" data-comm="${f.commission || 0}">${f.name} (${f.id})</option>`).join('')}
              </select>
            </div>
            <div class="fm-field">
              <label>Flower Name *</label>
              <select id="p-flower" required>
                <option value="">Select Flower</option>
                ${flowers.map(f => `<option value="${f.name}">${f.name}</option>`).join('')}
              </select>
            </div>
            <div class="fm-field">
              <label>Quantity</label>
              <input type="number" id="p-qty" placeholder="0" step="0.01" required>
            </div>
            <div class="fm-field">
              <label>Rate (₹)</label>
              <input type="number" id="p-rate" placeholder="0.00" step="0.01" required>
            </div>
            <div class="fm-field">
              <label>Commission (%)</label>
              <input type="number" id="p-comm" placeholder="0" step="0.01">
            </div>
          </div>
          <div class="fm-calc-preview">
            <div>Total: <span id="prev-total">₹0.00</span></div>
            <div>Comm: <span id="prev-comm">₹0.00</span></div>
            <div class="net-row">Net Amount: <span id="prev-net">₹0.00</span></div>
          </div>
          <div class="fm-modal-footer">
            <button type="button" class="fm-btn-sub cancel-btn">Cancel</button>
            <button type="submit" class="fm-btn-add">Save Purchase</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    const fInp = modal.querySelector('#p-farmer');
    const qInp = modal.querySelector('#p-qty');
    const rInp = modal.querySelector('#p-rate');
    const cInp = modal.querySelector('#p-comm');

    function updateCalc() {
      const q = parseFloat(qInp.value) || 0;
      const r = parseFloat(rInp.value) || 0;
      const c = parseFloat(cInp.value) || 0;
      const total = q * r;
      const commAmt = (total * c) / 100;
      const net = total - commAmt;
      modal.querySelector('#prev-total').textContent = `₹${total.toFixed(2)}`;
      modal.querySelector('#prev-comm').textContent = `₹${commAmt.toFixed(2)}`;
      modal.querySelector('#prev-net').textContent = `₹${net.toFixed(2)}`;
    }

    fInp.addEventListener('change', () => {
      const opt = fInp.options[fInp.selectedIndex];
      if (opt.value) cInp.value = opt.dataset.comm;
      updateCalc();
    });
    [qInp, rInp, cInp].forEach(i => i.addEventListener('input', updateCalc));

    modal.querySelector('.fm-close-btn').addEventListener('click', () => modal.remove());
    modal.querySelector('.cancel-btn').addEventListener('click', () => modal.remove());

    modal.querySelector('.purchase-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const farmerId = fInp.value;
      const farmer = farmers.find(f => f.id === farmerId);
      
      const p = {
        id: Date.now(),
        date: modal.querySelector('#p-date').value,
        farmerId,
        farmerName: farmer.name,
        flowerName: modal.querySelector('#p-flower').value,
        qty: parseFloat(qInp.value),
        rate: parseFloat(rInp.value),
        comm: parseFloat(cInp.value),
        total: (parseFloat(qInp.value) * parseFloat(rInp.value)).toFixed(2),
        net: (parseFloat(qInp.value) * parseFloat(rInp.value) * (1 - parseFloat(cInp.value)/100)).toFixed(2)
      };

      purchases.push(p);
      updateFarmerLedger(p, 'debit');
      saveData();
      modal.remove();
    });
  }

  function updateFarmerLedger(entry, type) {
    const farmers = getFarmers();
    const fIdx = farmers.findIndex(f => f.id === entry.farmerId);
    if (fIdx > -1) {
      if (!farmers[fIdx].ledger) farmers[fIdx].ledger = [];
      farmers[fIdx].ledger.push({
        date: entry.date,
        description: type === 'debit' ? `Purchase: ${entry.flowerName} (${entry.qty} @ ${entry.rate})` : `Cash Payment`,
        debit: type === 'debit' ? entry.net : 0,
        credit: type === 'credit' ? entry.amount : 0
      });
      sessionStorage.setItem(`farmers_${tenantId}`, JSON.stringify(farmers));
    }
  }

  function confirmDelete(index) {
    if (confirm('Delete this purchase record? Note: Ledger will need manual adjustment for consistency.')) {
      purchases.splice(index, 1);
      saveData();
    }
  }

  return { init };
})();
window.PurchaseModule = PurchaseModule;
