/* ==========================================================
   DORF-HANDELSMANAGER — UI.JS (Teil 2)
   Darstellung, Interaktionen, Modale, Rabattlogik
   ========================================================== */

import {
  state, initState, saveState, resetState,
  currencyToBronze, bronzeToCurrency, formatCurrency,
  addLog, adjustStock, adjustFunds, weeklyUpdate,
  applyDiscount, rarityColor, getVendorProducts
} from './state.js';

/* ---------- DOM ELEMENTE ---------- */
const vendorsContainer = document.getElementById('vendorsContainer');
const btnReset = document.getElementById('resetAll');
const btnWeek = document.getElementById('weekUpdateBtn');
const rangeWeek = document.getElementById('weekStrength');
const dropdownProduct = document.getElementById('globalProductList');
const inputSearch = document.getElementById('globalSearch');
const overlay = document.getElementById('overlay');

/* Modale */
const modalDiscount = document.createElement('div');
modalDiscount.className = 'modal';
modalDiscount.style.display = 'none';
modalDiscount.innerHTML = `
  <h3>Rabatt anwenden</h3>
  <p>Wähle Händler und Rabattprozentsatz:</p>
  <select id="discountVendor"></select>
  <input id="discountPercent" type="number" min="1" max="100" value="10" style="margin:6px">
  <button id="discountApply">Anwenden</button>
  <button id="discountCancel">Abbrechen</button>
`;
document.body.appendChild(modalDiscount);

/* ---------- INIT ---------- */
initState();
renderAll();

/* ---------- RENDER ---------- */
function renderAll() {
  vendorsContainer.innerHTML = '';
  Object.values(state.vendors).forEach(v => renderVendorPanel(v));
}

function renderVendorPanel(v) {
  const panel = document.createElement('div');
  panel.className = 'panel';
  const head = document.createElement('div');
  head.className = 'vendorHeader';
  head.innerHTML = `
    <div style="font-weight:600">${v.name}</div>
    <div class="small">${v.desc}</div>
    <div class="right small">${formatCurrency(v.funds)}</div>
  `;
  panel.appendChild(head);

  const body = document.createElement('div');
  body.className = 'vendorBody';
  body.style.display = 'none';
  panel.appendChild(body);
  head.addEventListener('click', () => {
    const isOpen = body.style.display === 'block';
    document.querySelectorAll('.vendorBody').forEach(b => (b.style.display = 'none'));
    body.style.display = isOpen ? 'none' : 'block';
    if (!isOpen) renderVendorBody(v, body);
  });
  vendorsContainer.appendChild(panel);
}

function renderVendorBody(v, body) {
  body.innerHTML = `
    <div class="small">Finanzen:</div>
    <div style="display:flex;gap:6px;align-items:center;margin-bottom:8px">
      B <input data-vfund="B" value="${v.funds.B||0}" style="width:60px">
      S <input data-vfund="S" value="${v.funds.S||0}" style="width:60px">
      G <input data-vfund="G" value="${v.funds.G||0}" style="width:60px">
      P <input data-vfund="P" value="${v.funds.P||0}" style="width:60px">
      <button data-savefund="${v.id}">Speichern</button>
      <button data-discount="${v.id}">Rabatt</button>
    </div>
    <table style="width:100%;border-collapse:collapse">
      <thead><tr><th>ID</th><th>Name</th><th>Typ</th><th>Rarität</th><th>Stock</th><th>Sell</th><th>Buy</th></tr></thead>
      <tbody id="tbody-${v.id}"></tbody>
    </table>
  `;
  const tbody = body.querySelector(`#tbody-${v.id}`);
  getVendorProducts(v.id).forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.id}</td>
      <td style="color:${rarityColor(p.rarity)}">${p.name}</td>
      <td>${p.type}</td>
      <td>${p.rarity}</td>
      <td><input data-stock="${p.id}" value="${p.stock}" style="width:60px"></td>
      <td>${formatCurrency(p.sell)}</td>
      <td>${formatCurrency(p.buy)}</td>
    `;
    tbody.appendChild(tr);
  });
}

/* ---------- EVENTS ---------- */
document.addEventListener('click', e => {
  const t = e.target;
  if (t.dataset.savefund) {
    const vid = t.dataset.savefund;
    const body = t.closest('.vendorBody');
    const inputs = body.querySelectorAll('[data-vfund]');
    const funds = {B:0,S:0,G:0,P:0};
    inputs.forEach(i => (funds[i.dataset.vfund] = Number(i.value)||0));
    state.vendors[vid].funds = funds;
    addLog(vid, 'Finanzen', 'Manuell angepasst');
    saveState();
    renderAll();
  }
  if (t.dataset.discount) {
    openDiscountModal(t.dataset.discount);
  }
});

/* Stock edit */
document.addEventListener('change', e => {
  if (e.target.dataset.stock) {
    adjustStock(e.target.dataset.stock, Number(e.target.value) - state.products[e.target.dataset.stock].stock);
    renderAll();
  }
});

/* ---------- DISCOUNT MODAL ---------- */
function openDiscountModal(vendorId) {
  overlay.style.display = 'block';
  modalDiscount.style.display = 'block';
  const sel = modalDiscount.querySelector('#discountVendor');
  sel.innerHTML = '';
  Object.values(state.vendors).forEach(v => {
    const opt = document.createElement('option');
    opt.value = v.id;
    opt.textContent = v.name;
    sel.appendChild(opt);
  });
  sel.value = vendorId;
}

modalDiscount.querySelector('#discountApply').onclick = () => {
  const vid = modalDiscount.querySelector('#discountVendor').value;
  const perc = Number(modalDiscount.querySelector('#discountPercent').value);
  applyDiscount(vid, perc);
  closeDiscountModal();
  renderAll();
};
modalDiscount.querySelector('#discountCancel').onclick = closeDiscountModal;
overlay.onclick = closeDiscountModal;

function closeDiscountModal() {
  overlay.style.display = 'none';
  modalDiscount.style.display = 'none';
}

/* ---------- WOCHENUPDATE ---------- */
btnWeek.addEventListener('click', () => {
  const strength = Number(rangeWeek.value) / 100;
  weeklyUpdate(strength);
  renderAll();
  alert('Wöchentliche Simulation abgeschlossen');
});

/* ---------- RESET ---------- */
btnReset.addEventListener('click', () => {
  if (confirm('Daten wirklich zurücksetzen?')) {
    resetState();
    renderAll();
  }
});

/* ---------- SUCHSYSTEM ---------- */
inputSearch.addEventListener('input', () => {
  const q = inputSearch.value.trim().toLowerCase();
  if (!q) { renderAll(); return; }
  vendorsContainer.innerHTML = '';
  Object.values(state.vendors).forEach(v => {
    const matches = getVendorProducts(v.id).filter(p =>
      p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
    );
    if (matches.length > 0) {
      const p = document.createElement('div');
      p.className = 'panel';
      p.innerHTML = `<h3>${v.name}</h3>`;
      const ul = document.createElement('ul');
      matches.forEach(mp => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${mp.name}</strong> (${mp.id}) — ${formatCurrency(mp.sell)}`;
        ul.appendChild(li);
      });
      p.appendChild(ul);
      vendorsContainer.appendChild(p);
    }
  });
});
