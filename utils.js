/* ==========================================================
   DORF-HANDELSMANAGER — UTILS.JS
   Allgemeine Hilfsfunktionen
   ========================================================== */

/* Zufallszahl in Bereich */
export function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* Zufällige Auswahl aus Array */
export function choice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* Währungsumrechnung: Bronze ⇄ Komplex */
export function toBronze({ B = 0, S = 0, G = 0, P = 0 }) {
  return B + S * 100 + G * 10000 + P * 1000000;
}

export function fromBronze(value) {
  const P = Math.floor(value / 1000000);
  value %= 1000000;
  const G = Math.floor(value / 10000);
  value %= 10000;
  const S = Math.floor(value / 100);
  const B = value % 100;
  return { B, S, G, P };
}

/* Formatierte Währungsanzeige */
export function fmtCurrency(obj) {
  return `${obj.P ? obj.P + " P " : ""}${obj.G ? obj.G + " G " : ""}${obj.S ? obj.S + " S " : ""}${obj.B || (!obj.P && !obj.G && !obj.S) ? obj.B + " B" : ""}`;
}

/* Tiefen-Kopie */
export function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/* Farbzuordnung nach Rarität */
export function rarityColor(r) {
  switch (r.toLowerCase()) {
    case "rare": return "#4a9eff";
    case "legendary": return "#ffb347";
    default: return "#bfbfbf";
  }
}

/* Zufällige Bestandsänderung */
export function fluctuate(stock, intensity = 0.2) {
  const delta = Math.floor(stock * (Math.random() * intensity * 2 - intensity));
  const newStock = Math.max(0, stock + delta);
  return newStock;
}

/* Prozentuale Preisänderung */
export function modifyPrice(price, factor = 0.1) {
  const change = price * (Math.random() * factor * 2 - factor);
  return Math.max(1, Math.round(price + change));
}

/* Ruhm-Check */
export function checkReputation(required, playerRep) {
  return playerRep >= required;
}

/* Zeitstempel */
export function timestamp() {
  const d = new Date();
  return d.toLocaleString();
}
