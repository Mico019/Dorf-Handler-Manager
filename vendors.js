/* ==========================================================
   DORF-HANDELSMANAGER — VENDORS.JS
   Händlerdefinitionen mit Basisdaten
   ========================================================== */

export const vendors = [
  {
    id: "baldur",
    name: "Baldur Eisenfaust",
    type: "Schmied",
    desc: "Meisterschmied des Dorfes, bekannt für präzise Waffen und Rüstungen.",
    funds: { B: 0, S: 80, G: 12, P: 0 },
    location: "Dorfplatz (Schmiede)",
    fameRequired: 0,
  },
  {
    id: "madlen",
    name: "Madlen",
    type: "Magieladen",
    desc: "Spezialisiert auf Runen, Rollen und magische Verbrauchsgüter.",
    funds: { B: 0, S: 50, G: 8, P: 0 },
    location: "Zentralstraße (blauer Laden)",
    fameRequired: 0,
  },
  {
    id: "voss",
    name: "Elda & Nico Voss",
    type: "Alchemisten",
    desc: "Verkaufen Heiltränke, Gegengifte und seltene Seren.",
    funds: { B: 0, S: 70, G: 10, P: 0 },
    location: "Nordgasse (Alchemie-Labor)",
    fameRequired: 0,
  },
  {
    id: "trav",
    name: "Reisender Händler",
    type: "Exotische Waren",
    desc: "Bringt seltene Güter aus fernen Ländern.",
    funds: { B: 0, S: 40, G: 6, P: 0 },
    location: "Marktplatz (nur zeitweise anwesend)",
    fameRequired: 0,
  },
  {
    id: "obst",
    name: "Alter Obsthändler",
    type: "Lebensmittel",
    desc: "Ein gemütlicher Mann mit einem Lächeln und einem Apfelkorb.",
    funds: { B: 0, S: 15, G: 1, P: 0 },
    location: "Dorfmarkt",
    fameRequired: 0,
  },
  {
    id: "tav",
    name: "Zur müden Mondsichel",
    type: "Taverne & Gasthaus",
    desc: "Herzstück des Dorflebens, Treffpunkt für alle Abenteurer.",
    funds: { B: 0, S: 120, G: 10, P: 0 },
    location: "Dorfmitte",
    fameRequired: 0,
  },
];
