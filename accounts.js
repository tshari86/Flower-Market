
const AccountsModule = (() => {
  let _container = null, _db = null, tenantId = '';
  
  // State for Day Account
  let dayDate = new Date().toISOString().split('T')[0];
  
  // State for Month Account
  let monthYear = new Date().toISOString().slice(0, 7); // YYYY-MM

  function init(container, db, type) {
    _container = container; _db = db;
    tenantId = _db.currentTenant;
    if (type === 'day') renderDayAccount();
    else renderMonthAccount();
  }

  function getDailyData(date) {
    const p = JSON.parse(sessionStorage.getItem(`purchases_${tenantId}`) || '[]');
    const pay = JSON.parse(sessionStorage.getItem(`payments_${tenantId}`) || '[]');
    const exp = JSON.parse(sessionStorage.getItem(`expenses_${tenantId}`) || '[]');

    return {
      purchases: p.filter(x => x.date === date),
      payments: pay.filter(x => x.date === date),
      expenses: exp.filter(x => x.date === date)
    };
  }

  function getMonthlyData(yearMonth) {
    const p = JSON.parse(sessionStorage.getItem(`purchases_${tenantId}`) || '[]');
    const pay = JSON.parse(sessionStorage.getItem(`payments_${tenantId}`) || '[]');
    const exp = JSON.parse(sessionStorage.getItem(`expenses_${tenantId}`) || '[]');

    return {
      purchases: p.filter(x => x.date.startsWith(yearMonth)),
      payments: pay.filter(x => x.date.startsWith(yearMonth)),
      expenses: exp.filter(x => x.date.startsWith(yearMonth))
    };
  }

  function renderDayAccount() {
    const data = getDailyData(dayDate);
    const totalP = data.purchases.reduce((s, x) => s + parseFloat(x.net), 0);
    const totalPay = data.payments.reduce((s, x) => s + parseFloat(x.amount), 0);
    const totalExp = data.expenses.reduce((s, x) => s + parseFloat(x.amount), 0);
    const balance = totalP - totalPay - totalExp;

    _container.innerHTML = `
      <div class="fm-page-header">
        <h1 class="fm-title">📅 Day Account</h1>
        <div class="fm-filter-group">
          <label>Filter Date:</label>
          <input type="date" id="day-date-filter" class="fm-input" value="${dayDate}">
        </div>
      </div>

      <div class="fm-summary-grid">
        <div class="fm-stat-card card-blue">
          <h3>Total Purchase</h3>
          <p>₹${totalP.toFixed(2)}</p>
        </div>
        <div class="fm-stat-card card-red">
          <h3>Cash Paid</h3>
          <p>₹${totalPay.toFixed(2)}</p>
        </div>
        <div class="fm-stat-card card-orange">
          <h3>Expenses</h3>
          <p>₹${totalExp.toFixed(2)}</p>
        </div>
        <div class="fm-stat-card card-green">
          <h3>Net Balance</h3>
          <p>₹${balance.toFixed(2)}</p>
        </div>
      </div>

      <div class="fm-card animate-fade-in">
        <h3 class="fm-section-subtitle">Detailed Entries</h3>
        <table class="fm-table">
          <thead>
            <tr><th>Type</th><th>Name/Detail</th><th>Debit (₹)</th><th>Credit (₹)</th></tr>
          </thead>
          <tbody>
            ${data.purchases.map(x => `<tr><td>Purchase</td><td>${x.farmerName} (${x.flowerName})</td><td class="color-green">₹${x.net}</td><td>—</td></tr>`).join('')}
            ${data.payments.map(x => `<tr><td>Payment</td><td>${x.farmerName}</td><td>—</td><td class="color-red">₹${x.amount}</td></tr>`).join('')}
            ${data.expenses.map(x => `<tr><td>Expense</td><td>${x.type}</td><td>—</td><td class="color-red">₹${x.amount}</td></tr>`).join('')}
            ${data.purchases.length === 0 && data.payments.length === 0 && data.expenses.length === 0 ? `<tr><td colspan="4" class="fm-empty-state">No transactions for this date.</td></tr>` : ''}
          </tbody>
        </table>
      </div>
    `;

    _container.querySelector('#day-date-filter').addEventListener('change', (e) => {
      dayDate = e.target.value;
      renderDayAccount();
    });
  }

  function renderMonthAccount() {
    const data = getMonthlyData(monthYear);
    const totalP = data.purchases.reduce((s, x) => s + parseFloat(x.net), 0);
    const totalPay = data.payments.reduce((s, x) => s + parseFloat(x.amount), 0);
    const totalExp = data.expenses.reduce((s, x) => s + parseFloat(x.amount), 0);

    _container.innerHTML = `
      <div class="fm-page-header">
        <h1 class="fm-title">📊 Monthwise Report</h1>
        <div class="fm-filter-group">
          <label>Select Month:</label>
          <input type="month" id="month-filter" class="fm-input" value="${monthYear}">
        </div>
      </div>

      <div class="fm-summary-grid">
        <div class="fm-stat-card glass-light">
          <h3>📦 Month Purchase</h3>
          <p>₹${totalP.toFixed(2)}</p>
        </div>
        <div class="fm-stat-card glass-light">
          <h3>💸 Month Payments</h3>
          <p>₹${totalPay.toFixed(2)}</p>
        </div>
        <div class="fm-stat-card glass-light">
          <h3>📝 Month Expenses</h3>
          <p>₹${totalExp.toFixed(2)}</p>
        </div>
      </div>

      <div class="fm-card animate-fade-in">
        <h3 class="fm-section-subtitle">Summary by Farmer</h3>
        <table class="fm-table">
          <thead>
            <tr><th>Farmer Name</th><th>Total Purchase (₹)</th><th>Total Paid (₹)</th></tr>
          </thead>
          <tbody id="month-farmer-summary"></tbody>
        </table>
      </div>
    `;

    // Calculate farmer-wise summary
    const farmerSummary = {};
    data.purchases.forEach(x => {
      if (!farmerSummary[x.farmerName]) farmerSummary[x.farmerName] = { p: 0, pay: 0 };
      farmerSummary[x.farmerName].p += parseFloat(x.net);
    });
    data.payments.forEach(x => {
      if (!farmerSummary[x.farmerName]) farmerSummary[x.farmerName] = { p: 0, pay: 0 };
      farmerSummary[x.farmerName].pay += parseFloat(x.amount);
    });

    const tbody = _container.querySelector('#month-farmer-summary');
    Object.keys(farmerSummary).forEach(name => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${name}</td><td class="color-green">₹${farmerSummary[name].p.toFixed(2)}</td><td class="color-red">₹${farmerSummary[name].pay.toFixed(2)}</td>`;
      tbody.appendChild(row);
    });

    _container.querySelector('#month-filter').addEventListener('change', (e) => {
      monthYear = e.target.value;
      renderMonthAccount();
    });
  }

  return { init };
})();
window.AccountsModule = AccountsModule;
