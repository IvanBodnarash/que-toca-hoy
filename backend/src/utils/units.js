export const CANON = {
  UD: "ud",
  GR: "gr",
  ML: "ml",
  KG: "kg",
  L: "l",
  TSP: "tsp",
  TBSP: "tbsp",
  CUP: "cup",
  PINT: "pint",
  PINCH: "pinch",
  DASH: "dash",
  CLOVE: "clove",
  BUNCH: "bunch",
  SLICE: "slice",
  HANDFUL: "handful",
  CAN: "can",
  PACK: "pack",
  PIECE: "piece",
};

// Synonyms -> canonical tokens
const SYNS = new Map([
  // count
  ["piece", "piece"],
  ["pieces", "piece"],
  ["pc", "piece"],
  ["pcs", "piece"],
  ["unit", "ud"],
  ["units", "ud"],
  ["ud", "ud"],
  ["uds", "ud"],
  ["unidad", "ud"],
  ["unidades", "ud"],
  ["шт", "ud"],
  ["штук", "ud"],

  // Grams
  ["g", "gr"],
  ["gram", "gr"],
  ["grams", "gr"],
  ["gramo", "gr"],
  ["gramos", "gr"],
  ["gr", "gr"],

  // Kilograms
  ["kg", "kg"],
  ["kilo", "kg"],
  ["kilogram", "kg"],
  ["kilograms", "kg"],
  ["kilogramo", "kg"],
  ["kilogramos", "kg"],

  // Milliliters
  ["ml", "ml"],
  ["milliliter", "ml"],
  ["milliliters", "ml"],
  ["mililitro", "ml"],
  ["mililitros", "ml"],

  // Liters
  ["l", "l"],
  ["lt", "l"],
  ["liter", "l"],
  ["liters", "l"],
  ["litro", "l"],
  ["litros", "l"],

  // Spoons/cups
  ["tsp", "tsp"],
  ["teaspoon", "tsp"],
  ["teaspoons", "tsp"],
  ["tbsp", "tbsp"],
  ["tbs", "tbsp"], // important: 'tbs' -> 'tbsp'
  ["tablespoon", "tbsp"],
  ["tablespoons", "tbsp"],
  ["cup", "cup"],
  ["cups", "cup"],
  ["pint", "pint"],
  ["pints", "pint"],

  // Other culinary
  ["pinch", "pinch"],
  ["dash", "dash"],
  ["clove", "clove"],
  ["cloves", "clove"],
  ["bunch", "bunch"],
  ["bunches", "bunch"],
  ["slice", "slice"],
  ["slices", "slice"],
  ["handful", "handful"],
  ["handfuls", "handful"],
  ["can", "can"],
  ["cans", "can"],
  ["pack", "pack"],
  ["packs", "pack"],
]);

export function canonicalizeUnit(raw) {
  const s = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (!s) return CANON.UD;
  return SYNS.get(s) ?? CANON.UD; // undefined -> 'ud'
}

export function canonicalizeQtyUnit(quantity, unitRaw) {
  let qty = Number(quantity ?? 0);
  if (!Number.isFinite(qty) || qty <= 0) qty = 1; // default
  const unit = canonicalizeUnit(unitRaw);
  return { quantity: qty, unit };
}
