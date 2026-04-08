
// Simple data service to manage Products, Invoices, and Farmers in localStorage

const STORAGE_KEYS = {
  FARMERS: 'flower_market_farmers',
  PRODUCTS: 'flower_market_products',
  INTAKES: 'flower_market_intakes',
};

// Initial Data
const INITIAL_FARMERS = [
  { id: '1', name: 'Hari', contact: '9876543210', location: 'Ooty', balance: -48700 },
  { id: '2', name: 'Asif', contact: '8765432109', location: 'Hosur', balance: 19614 },
  { id: '3', name: 'Ram', contact: '7654321098', location: 'Doddaballapur', balance: 5441 },
  { id: '4', name: 'Vijay', contact: '9898989898', location: 'Salem', balance: 1635 },
  { id: '5', name: 'Ajith', contact: '8787878787', location: 'Theni', balance: 78 },
  { id: '6', name: 'Surya', contact: '7676767676', location: 'Madurai', balance: 92 },
];

// --- FARMERS ---
export const getFarmers = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.FARMERS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.FARMERS, JSON.stringify(INITIAL_FARMERS));
    return INITIAL_FARMERS;
  }
  return JSON.parse(stored);
};

export const saveFarmer = (farmer) => {
  const farmers = getFarmers();
  const existingIndex = farmers.findIndex(f => f.id === farmer.id);

  if (existingIndex >= 0) {
    farmers[existingIndex] = { ...farmers[existingIndex], ...farmer };
  } else {
    farmers.push({ ...farmer, id: Date.now().toString(), balance: 0 });
  }

  localStorage.setItem(STORAGE_KEYS.FARMERS, JSON.stringify(farmers));
  return farmers;
};

export const deleteFarmer = (id) => {
  const farmers = getFarmers().filter(f => f.id !== id);
  localStorage.setItem(STORAGE_KEYS.FARMERS, JSON.stringify(farmers));
  return farmers;
};

// --- PRODUCTS (Flowers) ---
export const getProducts = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  // Dummy products if empty logic preserved...
  if (!stored) return [];
  return JSON.parse(stored);
};

// --- INTAKE ---
export const saveIntake = (intakeData) => {
  const intakes = getIntakes();
  const newIntake = { ...intakeData, id: Date.now().toString(), date: new Date().toISOString() };
  // In a real app, this would likely update the farmer's balance too
  intakes.push(newIntake);
  localStorage.setItem(STORAGE_KEYS.INTAKES, JSON.stringify(intakes));
  return newIntake;
};

export const getIntakes = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.INTAKES);
  return stored ? JSON.parse(stored) : [];
};

// --- BUYERS ---
const INITIAL_BUYERS = [
  { id: '1', name: 'Fresh Flowers Co', contact: '9988776655', location: 'Chennai', balance: 0 },
  { id: '2', name: 'Wedding Events', contact: '8877665544', location: 'Bangalore', balance: 0 },
];

export const getBuyers = () => {
  const stored = localStorage.getItem('flower_market_buyers');
  if (!stored) {
    localStorage.setItem('flower_market_buyers', JSON.stringify(INITIAL_BUYERS));
    return INITIAL_BUYERS;
  }
  return JSON.parse(stored);
};

export const saveBuyer = (buyer) => {
  const buyers = getBuyers();
  if (buyer.id) {
    const index = buyers.findIndex(b => b.id === buyer.id);
    buyers[index] = buyer;
  } else {
    buyers.push({ ...buyer, id: Date.now().toString(), balance: 0 });
  }
  localStorage.setItem('flower_market_buyers', JSON.stringify(buyers));
  return buyers;
};

// --- SALES ---
export const saveSale = (saleData) => {
  const sales = getSales();
  const newSale = { ...saleData, id: Date.now().toString(), timestamp: new Date().toISOString() };
  sales.push(newSale);
  localStorage.setItem('flower_market_sales', JSON.stringify(sales));
  return newSale;
};

export const getSales = () => {
  const stored = localStorage.getItem('flower_market_sales');
  return stored ? JSON.parse(stored) : [];
};
