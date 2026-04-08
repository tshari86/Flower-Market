
const SalesModule = (() => {
  let _container = null, _db = null, tenantId = '';
  let sales = [];

  function init(container, db) {
    _container = container; _db = db;
    tenantId = _db.currentTenant;
    loadData();
    renderPage();
  }

  function loadData() {
    const data = sessionStorage.getItem(`sales_${tenantId}`);
    sales = data ? JSON.parse(data) : [];
  }

  function saveData() {
    sessionStorage.setItem(`sales_${tenantId}`, JSON.stringify(sales));
    renderPage();
  }

  function getCustomers() {
    return JSON.parse(sessionStorage.getItem(`customers_${tenantId}`) || '[]');
  }

  function renderPage() {
    _container.innerHTML = `
      <div class="fm-page-header">
        <h1 class="fm-title">🧾 Sales & Invoices</h1>
        <button id="add-sale-btn" class="fm-btn-add">＋ Generate Invoice</button>
      </div>
      <div class="fm-card animate-fade-in">
        <table class="fm-table">
          <thead>
            <tr>
              <th>Inv #</th><th>Date</th><th>Customer</th><th>Total Amount</th><th>Status</th><th style="text-align:right">Actions</th>
            </tr>
          </thead>
          <tbody id="sales-list">
            ${sales.length === 0 ? `<tr><td colspan="6" class="fm-empty-state">No sales recorded.</td></tr>` : ''}
          </tbody>
        </table>
      </div>
    `;

    const list = _container.querySelector('#sales-list');
    [...sales].reverse().forEach((s, idxOrig) => {
      const idx = sales.length - 1 - idxOrig;
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><span class="fm-badge-id">${s.invNo}</span></td>
        <td>${s.date}</td>
        <td class="fm-semi-bold">${s.customerName}</td>
        <td class="fm-semi-bold">₹${s.total}</td>
        <td><span class="fm-tag-absent" style="background:${s.paid ? '#edfaf3' : '#fef2f2'}; color:${s.paid ? '#1e8a4a' : '#c0392b'}">${s.paid ? 'Paid' : 'Unpaid'}</span></td>
        <td style="text-align:right">
          <button class="fm-action-btn print-btn" title="View/Print">🧾</button>
          <button class="fm-action-btn wa-btn" title="Send WhatsApp">📲</button>
          <button class="fm-action-btn delete-btn">🗑️</button>
        </td>
      `;
      row.querySelector('.print-btn').addEventListener('click', () => showInvoice(s));
      row.querySelector('.wa-btn').addEventListener('click', () => sendWhatsApp(s));
      row.querySelector('.delete-btn').addEventListener('click', () => confirmDelete(idx));
      list.appendChild(row);
    });

    _container.querySelector('#add-sale-btn').addEventListener('click', openModal);
  }

  function openModal() {
    const custs = getCustomers();
    const flowers = JSON.parse(sessionStorage.getItem(`flowers_${tenantId}`) || '[]');
    const modal = document.createElement('div');
    modal.className = 'fm-modal-overlay';
    modal.innerHTML = `
      <div class="fm-modal animate-pop" style="max-width: 600px">
        <div class="fm-modal-header">
          <h2>🧾 New Sales Entry</h2>
          <button class="fm-close-btn">&times;</button>
        </div>
        <form class="fm-form sales-form">
          <div class="fm-form-grid">
            <div class="fm-field">
              <label>Invoice #</label>
              <input type="text" value="INV-${Date.now().toString().slice(-6)}" disabled>
            </div>
            <div class="fm-field">
              <label>Date</label>
              <input type="date" id="s-date" value="${new Date().toISOString().split('T')[0]}" required>
            </div>
            <div class="fm-field">
              <label>Select Customer *</label>
              <select id="s-cust" required>
                <option value="">Select Customer</option>
                ${custs.map(c => `<option value="${c.id}">${c.name} (${c.id})</option>`).join('')}
              </select>
            </div>
            <div class="fm-field">
              <label>Flower *</label>
              <select id="s-flower" required>
                ${flowers.map(f => `<option value="${f.name}">${f.name}</option>`).join('')}
              </select>
            </div>
            <div class="fm-field">
              <label>Quantity</label>
              <input type="number" id="s-qty" step="0.01" required>
            </div>
            <div class="fm-field">
              <label>Rate (₹)</label>
              <input type="number" id="s-rate" step="0.01" required>
            </div>
          </div>
          <div class="fm-modal-footer">
            <button type="button" class="fm-btn-sub cancel-btn">Cancel</button>
            <button type="submit" class="fm-btn-add">Save & Invoice</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('.fm-close-btn').addEventListener('click', () => modal.remove());
    
    modal.querySelector('.sales-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const custId = modal.querySelector('#s-cust').value;
      const cust = custs.find(c => c.id === custId);
      const total = (parseFloat(modal.querySelector('#s-qty').value) * parseFloat(modal.querySelector('#s-rate').value)).toFixed(2);
      
      const sale = {
        invNo: 'INV-' + Date.now().toString().slice(-6),
        date: modal.querySelector('#s-date').value,
        customerId: custId,
        customerName: cust.name,
        customerContact: cust.contact,
        items: [{
          name: modal.querySelector('#s-flower').value,
          qty: modal.querySelector('#s-qty').value,
          rate: modal.querySelector('#s-rate').value,
          total: total
        }],
        total: total,
        paid: false
      };

      sales.push(sale);
      updateCustomerLedger(sale);
      saveData();
      modal.remove();
      showInvoice(sale);
    });
  }

  function updateCustomerLedger(sale) {
    const custs = getCustomers();
    const idx = custs.findIndex(c => c.id === sale.customerId);
    if (idx > -1) {
      if (!custs[idx].ledger) custs[idx].ledger = [];
      custs[idx].ledger.push({
        date: sale.date,
        description: `Sales: ${sale.invNo}`,
        debit: sale.total,
        credit: 0
      });
      sessionStorage.setItem(`customers_${tenantId}`, JSON.stringify(custs));
    }
  }

  function showInvoice(s) {
    const custs = getCustomers();
    const cust = custs.find(c => c.id === s.customerId);
    const prevDues = CustomerModule.getDues(cust) - parseFloat(s.total);
    const netBalanace = prevDues + parseFloat(s.total);

    const modal = document.createElement('div');
    modal.className = 'fm-modal-overlay';
    modal.style.zIndex = '2000';
    modal.innerHTML = `
      <div class="fm-modal animate-pop" style="max-width: 800px; padding: 0">
        <div id="printable-invoice" style="padding: 40px; background: white; color: #333; font-family: 'Inter', sans-serif;">
          <div style="display:flex; justify-content:space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 20px">
            <div>
              <h1 style="color:var(--green-primary); margin:0">🌸 ${_db.currentTenant.toUpperCase()} MARKET</h1>
              <p style="margin:5px 0; color:#666">Professional Flower Billing System</p>
            </div>
            <div style="text-align:right">
              <h2 style="margin:0">INVOICE</h2>
              <p style="margin:5px 0"># ${s.invNo}</p>
              <p style="margin:5px 0">Date: ${s.date}</p>
            </div>
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px">
            <div>
              <h4 style="border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 10px">BILL TO</h4>
              <h3 style="margin:0">${s.customerName}</h3>
              <p style="margin:5px 0">Contact: ${s.customerContact}</p>
            </div>
            <div style="text-align:right">
               <h4 style="border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 10px">PAYMENT INFO</h4>
               <p style="margin:5px 0">UPI ID: market@upi</p>
               <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=upi://pay?pa=market@upi%26am=${s.total}%26tn=${s.invNo}" style="margin-top:5px">
            </div>
          </div>
          <table style="width:100%; border-collapse: collapse; margin-bottom: 40px">
            <thead>
              <tr style="background:#f9f9f9; text-align:left">
                <th style="padding:12px; border:1px solid #eee">ITEM</th>
                <th style="padding:12px; border:1px solid #eee">QTY</th>
                <th style="padding:12px; border:1px solid #eee">RATE</th>
                <th style="padding:12px; border:1px solid #eee; text-align:right">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${s.items.map(i => `
                <tr>
                  <td style="padding:12px; border:1px solid #eee">${i.name}</td>
                  <td style="padding:12px; border:1px solid #eee">${i.qty}</td>
                  <td style="padding:12px; border:1px solid #eee">₹${i.rate}</td>
                  <td style="padding:12px; border:1px solid #eee; text-align:right">₹${i.total}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="display:flex; justify-content: flex-end">
            <div style="width: 250px">
              <div style="display:flex; justify-content:space-between; padding: 5px 0"><span>Sub Total:</span> <span>₹${s.total}</span></div>
              <div style="display:flex; justify-content:space-between; padding: 5px 0"><span>Prev Balance:</span> <span>₹${prevDues.toFixed(2)}</span></div>
              <div style="display:flex; justify-content:space-between; padding: 10px 0; border-top: 2px solid #333; font-weight: 800; font-size: 1.2rem">
                <span>NET PAYABLE:</span> <span>₹${netBalanace.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div style="margin-top: 60px; text-align:center; color:#999; font-size: 0.8rem; border-top: 1px dashed #eee; padding-top: 20px">
            Thank you for your business! This is a computer generated invoice.
          </div>
        </div>
        <div class="fm-modal-footer no-print" style="justify-content:center; gap: 20px; padding: 20px; background: #f8f9fa; border-radius: 0 0 16px 16px">
          <button class="fm-btn-sub" onclick="window.print()">🖨 Print Invoice</button>
          <button class="fm-btn-add wa-share-btn">📲 WhatsApp Share</button>
          <button class="fm-btn-sub close-inv">✕ Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('.close-inv').addEventListener('click', () => modal.remove());
    modal.querySelector('.wa-share-btn').addEventListener('click', () => sendWhatsApp(s));
  }

  function sendWhatsApp(s) {
    const text = `🌸 *New Invoice: ${s.invNo}*%0A---------------------------%0AHello *${s.customerName}*,%0AYour bill for *₹${s.total}* is generated.%0AItem: ${s.items[0].name} (%20${s.items[0].qty} @ ₹${s.items[0].rate})%0A%0APlease pay via UPI: market@upi.%0A%0A_Powered by Sakura Billing_`;
    window.open(`https://wa.me/91${s.customerContact}?text=${text}`, '_blank');
  }

  function confirmDelete(idx) {
    if(confirm('Delete invoice?')) { sales.splice(idx, 1); saveData(); }
  }

  return { init };
})();
window.SalesModule = SalesModule;
