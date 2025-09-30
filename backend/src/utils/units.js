export const UNIT = { UD: "ud", ML: "ml", GR: "gr" };

const MAP = new Map([
  // pieces
  ["piece", UNIT.UD],
  ["pieces", UNIT.UD],
  ["pc", UNIT.UD],
  ["pcs", UNIT.UD],
  ["unit", UNIT.UD],
  ["units", UNIT.UD],
  ["each", UNIT.UD],
  ["ea", UNIT.UD],
  ["шт", UNIT.UD],
  ["штук", UNIT.UD],
  ["unidad", UNIT.UD],
  ["unidades", UNIT.UD],
  ["ud", UNIT.UD],
  ["uds", UNIT.UD],

  // grams
  ["g", UNIT.GR],
  ["gram", UNIT.GR],
  ["grams", UNIT.GR],
  ["gramo", UNIT.GR],
  ["gramos", UNIT.GR],
  ["gr", UNIT.GR],

  // milliliters
  ["ml", UNIT.ML],
  ["milliliter", UNIT.ML],
  ["milliliters", UNIT.ML],
  ["mililitro", UNIT.ML],
  ["mililitros", UNIT.ML],

  // liters -> ml
  ["l", UNIT.ML],
  ["liter", UNIT.ML],
  ["liters", UNIT.ML],
  ["litro", UNIT.ML],
  ["litros", UNIT.ML],

  // spoons -> ml
  ["tbsp", UNIT.ML],
  ["tablespoon", UNIT.ML],
  ["tablespoons", UNIT.ML],
  ["tsp", UNIT.ML],
  ["teaspoon", UNIT.ML],
  ["teaspoons", UNIT.ML],
  ["cup", UNIT.ML],
  ["cups", UNIT.ML],
]);

export function normalizeUnit(raw) {
  const s = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (!s) return UNIT.UD; // default
  return MAP.get(s) ?? UNIT.UD; // undefined -> 'ud'
}

export function normalizeQtyUnit(quantity, unitRaw) {
  let qty = Number(quantity ?? 0);
  if (Number.isNaN(qty)) qty = 0;

  const u = String(unitRaw ?? "")
    .trim()
    .toLowerCase();

  // kg -> gr
  if (
    u === "kg" ||
    u === "kilogram" ||
    u === "kilograms" ||
    u === "kilogramo" ||
    u === "kilogramos"
  ) {
    return { quantity: qty * 1000, unit: UNIT.GR };
  }

  // l -> ml
  if (
    u === "l" ||
    u === "liter" ||
    u === "liters" ||
    u === "litro" ||
    u === "litros"
  ) {
    return { quantity: qty * 1000, unit: UNIT.ML };
  }

  if (u === "tbsp" || u === "tablespoon" || u === "tablespoons") {
    return { quantity: qty * 15, unit: UNIT.ML };
  }
  if (u === "tsp" || u === "teaspoon" || u === "teaspoons") {
    return { quantity: qty * 5, unit: UNIT.ML };
  }
  if (u === "cup" || u === "cups") {
    return { quantity: qty * 240, unit: UNIT.ML };
  }

  const unit = normalizeUnit(u);
  return { quantity: qty, unit };
}
