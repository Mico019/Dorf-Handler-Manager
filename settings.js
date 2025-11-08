/* ==========================================================
   DORF-HANDELSMANAGER — SETTINGS.JS (Teil 4b)
   Admin / Kontrolle / Backup / Import / Export
   ========================================================== */

import { state, saveState, resetState, weeklyUpdate } from "./state.js";
import { renderAll } from "./ui.js";

const adminPanel = document.createElement("div");
adminPanel.className = "admin-panel";
adminPanel.innerHTML = `
  <h3>🧭 Admin-Panel</h3>
  <button id="backupBtn">Backup exportieren</button>
  <button id="importBtn">Backup importieren</button>
  <button id="simulateWeek">Woche simulieren</button>
  <button id="resetBtn">Daten zurücksetzen</button>
  <input type="file" id="fileInput" style="display:none">
`;
document.body.appendChild(adminPanel);

/* EXPORT */
document.getElementById("backupBtn").onclick = () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "dorf_backup.json";
  a.click();
  URL.revokeObjectURL(url);
};

/* IMPORT */
document.getElementById("importBtn").onclick = () => {
  document.getElementById("fileInput").click();
};

document.getElementById("fileInput").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      Object.assign(state, data);
      saveState();
      renderAll();
      alert("Backup erfolgreich importiert!");
    } catch {
      alert("Fehler beim Import!");
    }
  };
  reader.readAsText(file);
});

/* WOCHE SIM */
document.getElementById("simulateWeek").onclick = () => {
  weeklyUpdate(0.2 + Math.random() * 0.4);
  renderAll();
  alert("Woche simuliert!");
};

/* RESET */
document.getElementById("resetBtn").onclick = () => {
  if (confirm("Wirklich alles löschen?")) {
    resetState();
    renderAll();
  }
};
