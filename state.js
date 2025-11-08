/* ==========================================================
   DORF-HANDELSMANAGER — STATE.JS (Teil 1)
   Kern-Logik: Datenhaltung, Währungen, Speicher, Utilitys
   ========================================================== */

/* ---------- GLOBAL STORAGE ---------- */
export const STORAGE_KEY = 'dorf_handels_v2_state';

/* ---------- WÄHRUNGSSYSTEM ---------- */
// Umrechnung: 100 Bronze = 1 Silber, 100 Silber = 1 Gold, 100 Gold = 1 Platin
export const RATES = { B: 1, S: 100, G: 10000, P: 1000000 };

export function currencyToBronze(c = {B:0,S:0,G:0,P:0}) {
  return (
    (Number(c.B)||0) * RATES.B +
    (Number(c.S)||0) * RATES.S +
    (Number(c.G)||0) * RATES.G +
    (Number(c.P)||0) * RATES.P
  );
}

export function bronzeToCurrency(b = 0) {
  b = Math.floor(b);
  const P = Math.floor(b / RATES.P); b -= P * RATES.P;
  const G = Math.floor(b / RATES.G); b -= G * RATES.G;
  const S = Math.floor(b / RATES.S); b -= S * RATES.S;
  const B = b;
  return { B, S, G, P };
}

export function formatCurrency(c) {
  if (!c) return '0B';
  const parts = [];
  if (c.P) parts.push(`${c.P}P`);
  if (c.G) parts.push(`${c.G}G`);
  if (c.S) parts.push(`${c.S}S`);
  if (c.B) parts.push(`${c.B}B`);
  return parts.join(' ') || '0B';
}

/* ---------- GRUND-STATE ---------- */
export let state = {
  vendors: {},   // Händler
  products: {},  // Produkte
  logs: {},      // Transaktions-Logs
  meta: { lastWeek: null }
};

/* ---------- INITIALDATEN (BEISPIEL) ---------- */
export const defaultVendors = [
  { id:'baldur', name:'Baldur Eisenfaust (Schmiede)', desc:'Meisterschmied & Händler für Waffen', funds:{B:0,S:50,G:12,P:0} },
  { id:'madlen', name:'Madlen (Magieladen)', desc:'Verkauft magische Items & Runen', funds:{B:0,S:30,G:8,P:0} },
  { id:'voss',   name:'Elda & Nico Voss (Alchemie)', desc:'Tränke & Elixiere höchster Qualität', funds:{B:0,S:40,G:9,P:0} },
  { id:'tav',    name:'Zur müden Mondsichel (Taverne)', desc:'Speisen, Getränke, Unterkunft', funds:{B:0,S:80,G:6,P:0} },
];

export const defaultProducts = [
  { id:'W-001', name:'Eisenkurzschwert', type:'weapon', vendor:'baldur', rarity:'Common', minFame:0,
    desc:'Ein einfaches Kurzschwert aus Eisen.', effect:'+1 Schaden',
    buy:{B:10,S:2,G:0,P:0}, sell:{B:40,S:3,G:0,P:0}, stock:6
  },
  { id:'A-001', name:'Heiltrank', type:'potion', vendor:'voss', rarity:'Common', minFame:0,
    desc:'Stellt kleinere Verletzungen wieder her.', effect:'Heilt 1W6 HP',
    buy:{B:5,S:1,G:0,P:0}, sell:{B:20,S:2,G:0,P:0}, stock:10
  },
  { id:'M-001', name:'Zauberrolle: Licht', type:'scroll', vendor:'madlen', rarity:'Common', minFame:0,
    desc:'Erleuchtet die Umgebung.', effect:'Lichtquelle für 10min',
    buy:{B:0,S:1,G:0,P:0}, sell:{B:10,S:2,G:0,P:0}, stock:5
  },
  { id:'T-001', name:'Hausbier (Krug)', type:'drink', vendor:'tav', rarity:'Common', minFame:0,
    desc:'Lokales Bier aus Gerste & Mondwasser.', effect:'+1 Stimmung',
    buy:{B:0,S:1,G:0,P:0}, sell:{B:0,S:2,G:0,P:0}, stock:50
  }
];

/* ---------- INITIALISIERUNG ---------- */
export function initState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      state = JSON.parse(saved);
      console.log('[State] Geladen aus LocalStorage');
      return;
    } catch (err) {
      console.warn('[State] Fehler beim Laden, initialisiere neu:', err);
    }
  }
  resetState();
}

export function resetState() {
  state = { vendors: {}, products: {}, logs: {}, meta:{ lastWeek: Date.now() } };
  defaultVendors.forEach(v => {
    state.vendors[v.id] = structuredClone(v);
    state.logs[v.id] = [];
  });
  defaultProducts.forEach(p => {
    state.products[p.id] = structuredClone(p);
  });
  saveState();
  console.log('[State] Initialisiert mit Standarddaten');
}

export function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/* ---------- LOGGING ---------- */
export function addLog(vendorId, action, details) {
  if (!state.logs[vendorId]) state.logs[vendorId] = [];
  const time = new Date().toLocaleString();
  const funds = state.vendors[vendorId]?.funds || {};
  state.logs[vendorId].push({ time, action, details, funds: structuredClone(funds) });
  saveState();
}

/* ---------- BESTAND & GELD ---------- */
export function adjustStock(prodId, delta) {
  const p = state.products[prodId];
  if (!p) return;
  p.stock = Math.max(0, (p.stock || 0) + delta);
  saveState();
}

export function adjustFunds(vendorId, deltaBronze) {
  const v = state.vendors[vendorId];
  if (!v) return;
  const newBronze = Math.max(0, currencyToBronze(v.funds) + deltaBronze);
  v.funds = bronzeToCurrency(newBronze);
  saveState();
}

/* ---------- WOCHENUPDATE ---------- */
export function weeklyUpdate(strength = 0.2) {
  Object.values(state.products).forEach(p => {
    const rarityFactor = p.rarity === 'Legendary' ? 0.1 : p.rarity === 'Rare' ? 0.5 : 1;
    const change = Math.round(p.stock * ((Math.random() * 2 - 1) * strength * rarityFactor));
    p.stock = Math.max(0, p.stock + change);
  });
  state.meta.lastWeek = Date.now();
  saveState();
  console.log('[State] Wochenupdate abgeschlossen');
}

/* ---------- DISCOUNT SYSTEM ---------- */
export function applyDiscount(vendorId, percent = 0) {
  Object.values(state.products)
    .filter(p => p.vendor === vendorId)
    .forEach(p => {
      ['buy', 'sell'].forEach(k => {
        const bronze = currencyToBronze(p[k]);
        const newBronze = Math.max(1, Math.round(bronze * (1 - percent / 100)));
        p[k] = bronzeToCurrency(newBronze);
      });
    });
  addLog(vendorId, 'Rabatt', `Globaler Rabatt von ${percent}% angewendet`);
  saveState();
}

/* ---------- HILFSFUNKTIONEN ---------- */
export function rarityColor(r) {
  switch (r) {
    case 'Legendary': return '#f9d67a';
    case 'Rare': return '#66c4ff';
    default: return '#ccc';
  }
}

export function getVendorProducts(vendorId) {
  return Object.values(state.products).filter(p => p.vendor === vendorId);
}
