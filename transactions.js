/* ==========================================================
   DORF-HANDELSMANAGER — TRANSACTIONS.JS (Teil 3)
   Handles: Kaufen, Verkaufen, Feilschen, Popups
   ========================================================== */

import {
  state, saveState, adjustFunds, adjustStock,
  addLog, formatCurrency, currencyToBronze, bronzeToCurrency
} from "./state.js";

/* Overlay + Modal Grundstruktur */
const overlay = document.getElementById("overlay") || (() => {
  const o = document.createElement("div");
  o.id = "overlay";
  o.className = "overlay";
  document.body.appendChild(o);
  return o;
})();

const modalTrade = document.createElement("div");
modalTrade.className = "modal";
modalTrade.style.display = "none";
document.body.appendChild(modalTrade);

/* Öffnet Handels-Popup */
export function openTradeModal(vendorId, productId, mode = "buy") {
  const v = state.vendors[vendorId];
  const p = state.products[productId];
  if (!v || !p) return;

  const isBuy = mode === "buy"; // Spieler kauft vom Händler
  const title = isBuy ? "Kauf bestätigen" : "Verkauf bestätigen";
  const price = isBuy ? p.sell : p.buy;

  modalTrade.innerHTML = `
    <h3>${title}</h3>
    <p>${isBuy ? "Der Händler verkauft" : "Der Händler kauft"} <strong>${p.name}</strong>.</p>
    <p>Preis: ${formatCurrency(price)}</p>
    <label>Menge:</label>
    <input id="tradeAmount" type="number" value="1" min="1" max="${isBuy ? p.stock : 99}" style="width:80px">
    <div style="margin-top:8px">
      <button id="btnFeil">Feilschen</button>
      <button id="btnConfirm">Bestätigen</button>
      <button id="btnCancel">Abbrechen</button>
    </div>
  `;
  overlay.style.display = "block";
  modalTrade.style.display = "block";

  /* Event-Listener */
  modalTrade.querySelector("#btnFeil").onclick = () => feilschen(vendorId, p, isBuy);
  modalTrade.querySelector("#btnConfirm").onclick = () => confirmTrade(vendorId, p, isBuy);
  modalTrade.querySelector("#btnCancel").onclick = closeModal;
  overlay.onclick = closeModal;
}

/* ---------- FEILSCH-POPUP ---------- */
function feilschen(vendorId, product, isBuy) {
  const adjust = prompt("Wie stark wurde gefeilscht? (z. B. -10 für 10 % Rabatt oder +20 für 20 % Aufschlag)");
  const num = Number(adjust);
  if (isNaN(num)) return alert("Ungültige Eingabe.");
  const price = product[isBuy ? "sell" : "buy"];
  const modified = Math.round(price * (1 + num / 100));
  product[isBuy ? "sell" : "buy"] = modified;
  addLog(vendorId, product.id, `Feilschen: ${num}% → neuer Preis ${formatCurrency(modified)}`);
  saveState();
  alert("Preis angepasst!");
}

/* ---------- TRANSAKTIONS-LOGIK ---------- */
function confirmTrade(vendorId, product, isBuy) {
  const v = state.vendors[vendorId];
  const amount = Number(modalTrade.querySelector("#tradeAmount").value);
  const price = product[isBuy ? "sell" : "buy"];
  const total = price * amount;

  if (isBuy && product.stock < amount) return alert("Nicht genug Bestand!");
  if (isBuy) {
    adjustFunds(vendorId, -total);
    adjustStock(product.id, -amount);
    addLog(vendorId, product.id, `Verkauf an Spieler x${amount} für ${formatCurrency(total)}`);
  } else {
    adjustFunds(vendorId, total);
    adjustStock(product.id, amount);
    addLog(vendorId, product.id, `Einkauf vom Spieler x${amount} für ${formatCurrency(total)}`);
  }
  saveState();
  alert("Transaktion abgeschlossen!");
  closeModal();
}

/* ---------- MODAL-STEUERUNG ---------- */
function closeModal() {
  modalTrade.style.display = "none";
  overlay.style.display = "none";
}

/* Exporte */
export { closeModal };
