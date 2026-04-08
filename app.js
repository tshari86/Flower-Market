// ==========================================
// FLOWER MARKET BILLING - CORE APP
// Multi-Tenant | Light Green Theme | Keyboard Nav
// ==========================================

const App = (() => {

  // ── Multi-Tenant Database ──────────────────────────────────────────────────
  const DB = {
    tenants: {
      shop001: {
        id: 'shop001', name: 'Sakura Flower Market', logo: '🌸',
        username: 'sakura', password: 'shop123',
        data: { farmers: [], sales: [], expenses: [], purchases: [] }
      },
      shop002: {
        id: 'shop002', name: 'Lotus Flower Hub', logo: '🪷',
        username: 'lotus', password: 'shop456',
        data: { farmers: [], sales: [], expenses: [], purchases: [] }
      },
      shop003: {
        id: 'shop003', name: 'Yuki Bloom Store', logo: '🌷',
        username: 'yuki', password: 'shop789',
        data: { farmers: [], sales: [], expenses: [], purchases: [] }
      }
    },
    currentTenant: null, currentUser: null,
    getTenantData(key) {
      if (!this.currentTenant) return null;
      return this.tenants[this.currentTenant].data[key];
    },
    authenticate(username, password) {
      for (const id in this.tenants) {
        const t = this.tenants[id];
        if (t.username === username && t.password === password) {
          this.currentTenant = id;
          this.currentUser = { username, tenantId: id, tenantName: t.name, logo: t.logo };
          // Persist session
          sessionStorage.setItem('fmb_session', JSON.stringify(this.currentUser));
          return true;
        }
      }
      return false;
    },
    logout() {
      this.currentTenant = null;
      this.currentUser = null;
      sessionStorage.removeItem('fmb_session');
      sessionStorage.removeItem('fmb_page');
    },
    restoreSession() {
      try {
        const saved = sessionStorage.getItem('fmb_session');
        if (saved) {
          this.currentUser = JSON.parse(saved);
          this.currentTenant = this.currentUser.tenantId;
          return true;
        }
      } catch(e) {}
      return false;
    }
  };

  // ── Language / i18n ───────────────────────────────────────────────────────
  const i18n = {
    lang: 'en',
    strings: {
      en: {
        login: 'Login', username: 'Username', password: 'Password',
        farmer: 'Farmer', sales: 'Sales', exit: 'Exit / Logout',
        addFarmer: 'Farmer', absentFarmer: 'Absent Farmer',
        flower: 'Flower', purchase: 'Purchase', cashPay: 'Cash Pay',
        expenses: 'Expenses', dayAccount: 'Day Account', monthAccount: 'Month Account',
        customer: 'Customer', cashReceive: 'Cash Receive',
        customerReport: 'Customer Report', back: 'Back to Main Menu',
        welcome: 'Welcome', invalidCreds: 'Invalid credentials. Please try again.',
        loginTitle: 'Flower Market Billing', loginSubtitle: 'Manage your floral empire',
        selectLanguage: 'Language', comingSoon: 'Feature coming soon!',
        tenantHint: 'Hint: Try sakura/shop123, lotus/shop456, yuki/shop789',
        keyNav: '↑↓ Navigate  •  Enter Select  •  Esc Back'
      },
      ta: {
        login: 'உள்நுழை', username: 'பயனர்பெயர்', password: 'கடவுச்சொல்',
        farmer: 'விவசாயி', sales: 'விற்பனை', exit: 'வெளியேறு',
        addFarmer: 'விவசாயி', absentFarmer: 'வராத விவசாயி',
        flower: 'பூ', purchase: 'கொள்முதல்', cashPay: 'பண கட்டணம்',
        expenses: 'செலவுகள்', dayAccount: 'நாள் கணக்கு', monthAccount: 'மாத கணக்கு',
        customer: 'வாடிக்கையாளர்', cashReceive: 'பண முறை',
        customerReport: 'வாடிக்கையாளர் அறிக்கை', back: 'முகப்புக்கு திரும்பு',
        welcome: 'வரவேற்கிறோம்', invalidCreds: 'தவறான நற்சான்றிதழ்கள். மீண்டும் முயற்சிக்கவும்.',
        loginTitle: 'பூக்கடை பில்லிங்', loginSubtitle: 'உங்கள் பூ வணிகத்தை நிர்வகிக்கவும்',
        selectLanguage: 'மொழி', comingSoon: 'விரைவில் வரும்!',
        tenantHint: 'குறிப்பு: sakura/shop123, lotus/shop456, yuki/shop789 முயற்சிக்கவும்',
        keyNav: '↑↓ நகர்வு  •  Enter தேர்வு  •  Esc திரும்பு'
      }
    },
    t(key) { return this.strings[this.lang][key] || key; },
    setLang(l) { this.lang = l; }
  };

  // ── Router / State ─────────────────────────────────────────────────────────
  let currentPage = 'login';
  let focusIndex = 0;

  function navigate(page) {
    currentPage = page;
    focusIndex = 0;
    // Persist current page (only save authenticated pages)
    if (page !== 'login') {
      sessionStorage.setItem('fmb_page', page);
    } else {
      sessionStorage.removeItem('fmb_page');
    }
    render();
  }

  // ── Render Engine ──────────────────────────────────────────────────────────
  function render() {
    const root = document.getElementById('app');
    root.innerHTML = '';
    switch (currentPage) {
      case 'login':  root.appendChild(renderLogin());  break;
      case 'main':   root.appendChild(renderMain());   break;
      case 'farmer': root.appendChild(renderFarmer()); break;
      case 'sales':  root.appendChild(renderSales());  break;
      default:       root.appendChild(renderLogin());
    }
    // Entrance animation
    requestAnimationFrame(() => {
      const page = root.firstChild;
      if (page) {
        page.style.opacity = '0';
        page.style.transform = 'translateY(18px)';
        requestAnimationFrame(() => {
          page.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
          page.style.opacity = '1';
          page.style.transform = 'translateY(0)';
        });
      }
    });
  }

  // ── Language Selector ──────────────────────────────────────────────────────
  function renderLangSelector() {
    const wrap = el('div', 'lang-selector-wrap');
    const label = el('span', 'lang-label', '🌐 ' + i18n.t('selectLanguage') + ':');
    const sel = document.createElement('select');
    sel.className = 'lang-select';
    sel.setAttribute('aria-label', 'Select Language');
    sel.innerHTML = `<option value="en" ${i18n.lang === 'en' ? 'selected' : ''}>English</option>
                     <option value="ta" ${i18n.lang === 'ta' ? 'selected' : ''}>தமிழ்</option>`;
    sel.addEventListener('change', e => { i18n.setLang(e.target.value); render(); });
    wrap.appendChild(label); wrap.appendChild(sel);
    return wrap;
  }

  // ── Petals ─────────────────────────────────────────────────────────────────
  function addPetals(container) {
    const emojis = ['🌿', '🌱', '🍃', '🌾', '🌻', '🌼', '🌸'];
    for (let i = 0; i < 16; i++) {
      const p = document.createElement('div');
      p.className = 'petal';
      p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      p.style.left = Math.random() * 100 + 'vw';
      p.style.animationDuration = (5 + Math.random() * 7) + 's';
      p.style.animationDelay = (Math.random() * 9) + 's';
      p.style.fontSize = (14 + Math.random() * 16) + 'px';
      p.style.opacity = 0.4 + Math.random() * 0.4;
      container.appendChild(p);
    }
  }



  // ── LOGIN PAGE ─────────────────────────────────────────────────────────────
  function renderLogin() {
    const page = el('div', 'page page-login');
    addPetals(page);

    const card = el('div', 'login-card glass-card');
    const logoWrap = el('div', 'login-logo-wrap');
    logoWrap.innerHTML = `<div class="login-logo-icon">🌿</div>
      <h1 class="login-title">${i18n.t('loginTitle')}</h1>
      <p class="login-subtitle">${i18n.t('loginSubtitle')}</p>`;
    card.appendChild(logoWrap);

    const form = document.createElement('form');
    form.className = 'login-form';
    form.setAttribute('id', 'login-form');
    form.innerHTML = `
      <div class="field-group">
        <span class="field-icon">👤</span>
        <input id="inp-user" type="text" class="field-input" placeholder="${i18n.t('username')}" autocomplete="off" aria-label="${i18n.t('username')}" />
      </div>
      <div class="field-group">
        <span class="field-icon">🔒</span>
        <input id="inp-pass" type="password" class="field-input" placeholder="${i18n.t('password')}" aria-label="${i18n.t('password')}" />
      </div>
      <div id="login-error" class="login-error hidden"></div>
      <button id="login-btn" type="submit" class="btn-primary btn-full ripple">
        <span class="btn-icon">✨</span> ${i18n.t('login')}
      </button>
      <p class="hint-text">${i18n.t('tenantHint')}</p>
    `;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const u = document.getElementById('inp-user').value.trim();
      const p = document.getElementById('inp-pass').value.trim();
      if (DB.authenticate(u, p)) {
        navigate('main');
      } else {
        const err = document.getElementById('login-error');
        err.textContent = i18n.t('invalidCreds');
        err.classList.remove('hidden');
        err.classList.add('shake');
        setTimeout(() => err.classList.remove('shake'), 600);
      }
    });
    card.appendChild(form);

    const langWrap = el('div', 'login-lang');
    langWrap.appendChild(renderLangSelector());
    card.appendChild(langWrap);

    page.appendChild(card);

    // ── Login Keyboard Nav ──
    // Tab naturally works. Enter on button submits. Arrow keys move between fields.
    setTimeout(() => {
      const userInput = document.getElementById('inp-user');
      if (userInput) userInput.focus();

      page.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const inputs = ['inp-user', 'inp-pass', 'login-btn'];
          const cur = document.activeElement?.id;
          const idx = inputs.indexOf(cur);
          const next = document.getElementById(inputs[Math.min(idx + 1, inputs.length - 1)]);
          if (next) next.focus();
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          const inputs = ['inp-user', 'inp-pass', 'login-btn'];
          const cur = document.activeElement?.id;
          const idx = inputs.indexOf(cur);
          const prev = document.getElementById(inputs[Math.max(idx - 1, 0)]);
          if (prev) prev.focus();
        }
      });
    }, 100);

    return page;
  }

  // ── MAIN MENU ──────────────────────────────────────────────────────────────
  function renderMain() {
    const page = el('div', 'page page-main');
    addPetals(page);

    // Top Bar
    const topBar = el('div', 'top-bar glass');
    const tenantInfo = el('div', 'tenant-info');
    tenantInfo.innerHTML = `<span class="tenant-logo">${DB.currentUser.logo}</span>
      <div><div class="tenant-name">${DB.currentUser.tenantName}</div>
      <div class="tenant-user">@${DB.currentUser.username}</div></div>`;
    topBar.appendChild(tenantInfo);
    const topRight = el('div', 'top-right');
    topRight.appendChild(renderLangSelector());
    topBar.appendChild(topRight);
    page.appendChild(topBar);

    // Center buttons
    const center = el('div', 'main-center');
    const welcomeTitle = el('div', 'main-welcome-title');
    welcomeTitle.innerHTML = `<span class="welcome-emoji">🌿</span> ${i18n.t('welcome')}, ${DB.currentUser.tenantName}!`;
    center.appendChild(welcomeTitle);

    const mainBtns = el('div', 'main-buttons');
    const farmerBtn = makeMenuBtn('🌿', i18n.t('farmer'), 'btn-farmer', 'main-btn-farmer', () => navigate('farmer'));
    const salesBtn  = makeMenuBtn('💐', i18n.t('sales'),  'btn-sales',  'main-btn-sales',  () => navigate('sales'));
    mainBtns.appendChild(farmerBtn);
    mainBtns.appendChild(salesBtn);
    center.appendChild(mainBtns);
    page.appendChild(center);

    // Bottom row: Exit + key hint
    const bottomBar = el('div', 'bottom-bar');
    const exitBtn = document.createElement('button');
    exitBtn.className = 'btn-exit ripple'; exitBtn.id = 'main-btn-exit';
    exitBtn.innerHTML = `<span>🚪</span> ${i18n.t('exit')}`;
    exitBtn.addEventListener('click', () => { DB.logout(); navigate('login'); });
    bottomBar.appendChild(exitBtn);
    page.appendChild(bottomBar);

    // ── Main Menu Keyboard Nav ──
    const btnIds = ['main-btn-farmer', 'main-btn-sales', 'main-btn-exit'];
    setTimeout(() => {
      document.getElementById(btnIds[focusIndex])?.focus();
      page.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          e.preventDefault();
          focusIndex = (focusIndex + 1) % btnIds.length;
          document.getElementById(btnIds[focusIndex])?.focus();
        }
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          e.preventDefault();
          focusIndex = (focusIndex - 1 + btnIds.length) % btnIds.length;
          document.getElementById(btnIds[focusIndex])?.focus();
        }
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          document.getElementById(btnIds[focusIndex])?.click();
        }
        if (e.key === 'F' || e.key === 'f') navigate('farmer');
        if (e.key === 'S' || e.key === 's') navigate('sales');
        // Escape on main menu does nothing — user must click Exit/Logout explicitly
      });
    }, 100);

    return page;
  }

  // ── FARMER SECTION ─────────────────────────────────────────────────────────
  function renderFarmer() {
    return renderSectionPage('farmer', [
      { icon: '👨‍🌾', key: 'addFarmer' },
      { icon: '📋', key: 'absentFarmer' },
      { icon: '🌸', key: 'flower' },
      { icon: '🛒', key: 'purchase' },
      { icon: '💵', key: 'cashPay' },
      { icon: '📊', key: 'expenses' },
      { icon: '📅', key: 'dayAccount' },
      { icon: '📆', key: 'monthAccount' },
    ], '🌿', i18n.t('farmer'));
  }

  // ── SALES SECTION ── (no "Back" item in sidebar — only top bar has it) ─────
  function renderSales() {
    return renderSectionPage('sales', [
      { icon: '🧑‍💼', key: 'customer' },
      { icon: '💰', key: 'cashReceive' },
      { icon: '🧾', key: 'sales' },
      { icon: '📈', key: 'customerReport' },
    ], '💐', i18n.t('sales'));
  }

  // ── Generic Section Page ───────────────────────────────────────────────────
  function renderSectionPage(section, items, emoji, title) {
    const page = el('div', 'page page-section');
    addPetals(page);

    // Top bar
    const topBar = el('div', 'top-bar glass');
    const backBtn = document.createElement('button');
    backBtn.className = 'btn-back ripple'; backBtn.id = 'sec-back-btn';
    backBtn.innerHTML = `← ${i18n.t('back')}`;
    backBtn.addEventListener('click', () => navigate('main'));
    topBar.appendChild(backBtn);
    const pageTitle = el('div', 'section-page-title');
    pageTitle.innerHTML = `${emoji} ${title}`;
    topBar.appendChild(pageTitle);
    const topRight = el('div', 'top-right');
    topRight.appendChild(renderLangSelector());
    topBar.appendChild(topRight);
    page.appendChild(topBar);

    // Layout
    const layout = el('div', 'section-layout');

    // Sidebar
    const sidebar = el('div', 'sidebar glass-card');
    const sideTitle = el('div', 'sidebar-title');
    sideTitle.innerHTML = `${emoji} ${title}`;
    sidebar.appendChild(sideTitle);

    const menuList = el('ul', 'sidebar-menu');
    menuList.setAttribute('role', 'menu');
    let activeSidebarIdx = 0;

    items.forEach((item, idx) => {
      const li = document.createElement('li');
      li.className = 'sidebar-menu-item ripple';
      li.setAttribute('role', 'menuitem');
      li.setAttribute('tabindex', idx === 0 ? '0' : '-1');
      li.dataset.idx = idx;
      if (idx === 0) li.classList.add('active');
      li.innerHTML = `<span class="menu-icon">${item.icon}</span> <span class="menu-label">${i18n.t(item.key) || item.key}</span>`;

      li.addEventListener('click', () => {
        setActiveSidebarItem(idx);
        updateContentPanel(item);
      });

      menuList.appendChild(li);
    });

    function setActiveSidebarItem(idx) {
      activeSidebarIdx = idx;
      const all = menuList.querySelectorAll('.sidebar-menu-item');
      all.forEach((x, i) => {
        x.classList.toggle('active', i === idx);
        x.setAttribute('tabindex', i === idx ? '0' : '-1');
      });
      all[idx]?.focus();
      updateContentPanel(items[idx]);
    }

    sidebar.appendChild(menuList);
    layout.appendChild(sidebar);

    // Content Panel
    const content = el('div', 'content-panel glass-card');
    content.id = 'content-panel';
    updateContentPanel(items[0], content);
    layout.appendChild(content);

    page.appendChild(layout);

    // ── Section Keyboard Nav ──
    setTimeout(() => {
      // Start focus on first sidebar item
      menuList.querySelectorAll('.sidebar-menu-item')[0]?.focus();

      page.addEventListener('keydown', e => {
        const focused = document.activeElement;
        const isSidebarFocused = focused?.classList?.contains('sidebar-menu-item');

        // ── Arrow Up/Down in sidebar
        if ((e.key === 'ArrowDown') && isSidebarFocused) {
          e.preventDefault();
          const next = (activeSidebarIdx + 1) % items.length;
          setActiveSidebarItem(next);
        }
        if ((e.key === 'ArrowUp') && isSidebarFocused) {
          e.preventDefault();
          const prev = (activeSidebarIdx - 1 + items.length) % items.length;
          setActiveSidebarItem(prev);
        }

        // ── Left arrow: focus back to sidebar from content
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          menuList.querySelectorAll('.sidebar-menu-item')[activeSidebarIdx]?.focus();
        }

        // ── Right arrow: move focus into content panel
        if (e.key === 'ArrowRight' && isSidebarFocused) {
          e.preventDefault();
          document.getElementById('content-panel')?.focus();
        }

        // ── Enter / Space: activate sidebar item
        if ((e.key === 'Enter' || e.key === ' ') && isSidebarFocused) {
          e.preventDefault();
          setActiveSidebarItem(activeSidebarIdx);
        }

        // ── Escape: go back to main
        if (e.key === 'Escape') {
          navigate('main');
        }

        // ── Number shortcuts 1-8
        const num = parseInt(e.key);
        if (!isNaN(num) && num >= 1 && num <= items.length) {
          setActiveSidebarItem(num - 1);
        }
      });
    }, 100);

    return page;
  }

  function updateContentPanel(item, panel) {
    const cp = panel || document.getElementById('content-panel');
    if (!cp) return;

    // ── Route Farmer module ──
    if (currentPage === 'farmer') {
      if (item.key === 'addFarmer')      { FarmerModule.render(cp, DB); return; }
      if (item.key === 'absentFarmer')   { AbsentFarmerModule.init(cp, DB); return; }
      if (item.key === 'flower')         { FlowerModule.init(cp, DB); return; }
      if (item.key === 'purchase')       { PurchaseModule.init(cp, DB); return; }
      if (item.key === 'cashPay')        { CashPayModule.init(cp, DB); return; }
      if (item.key === 'expenses')       { ExpensesModule.init(cp, DB); return; }
      if (item.key === 'dayAccount')     { AccountsModule.init(cp, DB, 'day'); return; }
      if (item.key === 'monthAccount')   { AccountsModule.init(cp, DB, 'month'); return; }
    }

    // ── Route Sales module ──
    if (currentPage === 'sales') {
      if (item.key === 'customer')       { CustomerModule.init(cp, DB); return; }
      if (item.key === 'cashReceive')    { CashReceiveModule.init(cp, DB); return; }
      if (item.key === 'sales')          { SalesModule.init(cp, DB); return; }
      if (item.key === 'customerReport') { CustomerReportModule.init(cp, DB); return; }
      if (item.key === 'salesReport')    { SalesReportModule.init(cp, DB); return; }
    }

    // ── Default: Coming Soon ──
    cp.setAttribute('tabindex', '0');
    cp.innerHTML = `
      <div class="content-header">
        <div class="content-icon-lg">${item.icon}</div>
        <h2 class="content-title">${i18n.t(item.key) || item.key}</h2>
      </div>
      <div class="coming-soon-wrap">
        <div class="coming-soon-anime">
          <div class="anime-circle">🌿</div>
          <div class="anime-circle delay1">🌸</div>
          <div class="anime-circle delay2">🌼</div>
        </div>
        <p class="coming-soon-text">${i18n.t('comingSoon')}</p>
        <p class="coming-soon-sub">This feature is being crafted with ❤️</p>
      </div>`;
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  function el(tag, cls = '', text = '') {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  function makeMenuBtn(icon, label, cls, id, onClick) {
    const btn = document.createElement('button');
    btn.className = `main-menu-btn ${cls} ripple`;
    btn.id = id;
    btn.innerHTML = `<span class="main-btn-icon">${icon}</span><span class="main-btn-label">${label}</span>`;
    btn.addEventListener('click', onClick);
    return btn;
  }

  // Ripple effect
  document.addEventListener('click', e => {
    const btn = e.target.closest('.ripple');
    if (!btn) return;
    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    const rect = btn.getBoundingClientRect();
    ripple.style.left = (e.clientX - rect.left) + 'px';
    ripple.style.top  = (e.clientY - rect.top)  + 'px';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });

  function init() {
    // Restore session from sessionStorage on page load / refresh
    if (DB.restoreSession()) {
      const savedPage = sessionStorage.getItem('fmb_page') || 'main';
      currentPage = savedPage;
    }
    render();
  }
  return { init };
})();

document.addEventListener('DOMContentLoaded', () => App.init());
