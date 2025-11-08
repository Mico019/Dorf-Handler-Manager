/* ==========================================================
   DORF-HANDELSMANAGER — TOOLS.JS (Teil 4)
   Händler- und Produktmanagement
   ========================================================== */

import { state, saveState, addLog } from "./state.js";
import { renderAll } from "./ui.js";

const overlay = document.getElementById("overlay") || (() => {
  const o = document.createElement("div");
  o.id = "overlay";
  o.className = "overlay";
  document.body.appendChild(o);
  return o;
})();

const modalManager = document.createElement("div");
modalManager.className = "modal";
modalManager.style.display = "none";
document.body.appendChild(modalManager);

export function openManager(type = "vendor") {
  modalManager.style.display = "block";
  overlay.style.display = "block";
  if (type === "vendor") renderVendorManager();
  else renderProductManager();
}

function renderVendorManager() {
  modalManager.innerHTML = `
    <h3>Neuen Händler anlegen</h3>
    <label>Name:</label><input id="vName">
    <label>Beschreibung:</label><input id="vDesc">
    <button id="vAdd">Hinzufügen</button>
    <h4>Bestehende Händler:</h4>
    <ul id="vendorList"></ul>
    <button id="closeManager">Schließen</button>
  `;

  const list = modalManager.querySelector("#vendorList");
  Object.values(state.vendors).forEach(v => {
    const li = document.createElement("li");
    li.innerHTML = `<b>${v.name}</b> - ${v.desc} 
      <button data-del="${v.id}">❌</button>`;
    list.appendChild(li);
  });

  modalManager.querySelector("#vAdd").onclick = () => {
    const name = modalManager.querySelector("#vName").value.trim();
    if (!name) return alert("Bitte Name eingeben!");
    const id = name.toLowerCase().replace(/\s+/g, "_");
    state.vendors[id] = { id, name, desc: modalManager.querySelector("#vDesc").value.trim(), funds:{B:0,S:0,G:0,P:0} };
    addLog(id, "Neuer Händler", "Erstellt");
    saveState();
    alert("Händler hinzugefügt!");
    renderVendorManager();
  };

  modalManager.querySelectorAll("[data-del]").forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.del;
      if (confirm(`${id} löschen?`)) {
        delete state.vendors[id];
        saveState();
        renderVendorManager();
      }
    };
  });

  modalManager.querySelector("#closeManager").onclick = closeManager;
}

function renderProductManager() {
  modalManager.innerHTML = `
    <h3>Neues Produkt anlegen</h3>
    <label>Name:</label><input id="pName">
    <label>Typ:</label><input id="pType">
    <label>Rarität:</label>
      <select id="pRarity">
        <option>Common</option>
        <option>Rare</option>
        <option>Legendary</option>
      </select>
    <label>Verkaufspreis:</label><input id="pSell" type="number" value="100">
    <label>Einkaufspreis:</label><input id="pBuy" type="number" value="50">
    <label>Bestand:</label><input id="pStock" type="number" value="10">
    <button id="pAdd">Hinzufügen</button>
    <h4>Produkte:</h4>
    <ul id="prodList"></ul>
    <button id="closeManager">Schließen</button>
  `;

  const list = modalManager.querySelector("#prodList");
  Object.values(state.products).forEach(p => {
    const li = document.createElement("li");
    li.innerHTML = `${p.name} (${p.rarity}) — ${p.type} 
      <button data-delp="${p.id}">❌</button>`;
    list.appendChild(li);
  });

  modalManager.querySelector("#pAdd").onclick = () => {
    const id = "itm" + Math.random().toString(36).substring(2, 7);
    const newProd = {
      id,
      name: modalManager.querySelector("#pName").value.trim(),
      type: modalManager.querySelector("#pType").value.trim(),
      rarity: modalManager.querySelector("#pRarity").value,
      sell: Number(modalManager.querySelector("#pSell").value),
      buy: Number(modalManager.querySelector("#pBuy").value),
      stock: Number(modalManager.querySelector("#pStock").value)
    };
    state.products[id] = newProd;
    addLog("global", id, "Neues Produkt angelegt");
    saveState();
    alert("Produkt hinzugefügt!");
    renderProductManager();
  };

  modalManager.querySelectorAll("[data-delp]").forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.delp;
      if (confirm(`${id} löschen?`)) {
        delete state.products[id];
        saveState();
        renderProductManager();
      }
    };
  });

  modalManager.querySelector("#closeManager").onclick = closeManager;
}

function closeManager() {
  modalManager.style.display = "none";
  overlay.style.display = "none";
}
