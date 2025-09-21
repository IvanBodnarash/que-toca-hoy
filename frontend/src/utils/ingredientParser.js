const FRACTIONS = {
  "¼": 0.25,
  "½": 0.5,
  "¾": 0.75,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "⅕": 0.2,
  "⅖": 0.4,
  "⅗": 0.6,
  "⅘": 0.8,
};

const UNIT_SYNONYMS = {
  g: ["g", "gr", "гр", "гр.", "gram", "grams", "gramo", "gramos"],
  kg: ["kg", "кг", "kilo", "kilogram", "kilograms", "kilogramo", "kilogramos"],
  mg: ["mg", "мг"],

  ml: ["ml", "мл", "mililitro", "mililitros"],
  l: ["l", "л", "lt", "liter", "liters", "litro", "litros"],

  tsp: [
    "tsp",
    "ч.л",
    "ч. л",
    "tea spoon",
    "teaspoon",
    "teaspoons",
    "cdita",
    "cucharadita",
  ],
  tbsp: [
    "tbsp",
    "ст.л",
    "ст. л",
    "tablespoon",
    "tablespoons",
    "cda",
    "cucharada",
    "cucharadas",
  ],
  cup: ["cup", "cups", "склянка", "стакан", "vaso", "taza", "tazas"],
  pint: ["pint", "pints"],

  piece: ["шт", "шт.", "piece", "pieces", "unidad", "unidades", "ud", "uds"],
  slice: ["slice", "slices", "слайс", "ломтик", "rebanada", "rebanadas"],
  clove: ["clove", "cloves", "зубчик", "зубчики", "diente", "dientes"],
  can: ["can", "cans", "банка", "lata", "latas"],
  pack: ["pack", "packs", "пачка", "paquete", "paquetes"],
  bunch: ["bunch", "bunches", "пучок", "ramo", "manojo"],
  handful: ["handful", "handfuls", "жменя"],
  pinch: ["pinch", "pinches", "щіпка", "щепотка"],
  dash: ["dash", "дрібка"],
};

const UNIT_NORMAL = Object.entries(UNIT_SYNONYMS).reduce((acc, [norm, arr]) => {
  arr.forEach((s) => (acc[s.toLowerCase()] = norm));
  return acc;
}, {});

function toNumber(token) {
  if (!token) return null;
  token = token.replace(",", ".").trim();

  // "1 1/2"
  if (/^\d+\s+\d+\/\d+$/.test(token)) {
    const [whole, frac] = token.split(/\s+/);
    const [a, b] = frac.split("/").map(Number);
    return Number(whole) + a / b;
  }

  // "1/2"
  if (/^\d+\/\d+$/.test(token)) {
    const [a, b] = token.split("/").map(Number);
    return a / b;
  }

  // Special symbol "½"
  if (FRACTIONS[token]) return FRACTIONS[token];

  // "1–2"
  if (/^\d+(\.\d+)?\s*[–-]\s*\d+(\.\d+)?$/.test(token)) {
    return Number(token.split(/[–-]/)[0]);
  }

  const n = Number(token);
  return Number.isNaN(n) ? null : n;
}

// Main Function
export function parseIngredientLine(lineRaw) {
  const out = { quantity: null, unit: null, name: "" };
  if (!lineRaw) return out;

  let line = lineRaw.replace(/\s+/g, " ").replace(/[~≈]/g, "").trim();
  const tokens = line.split(" ");

  // Qty
  let qTokens = [];
  for (let i = 0; i < Math.min(3, tokens.length); i++) {
    const tryTok = qTokens.concat(tokens[i]).join(" ");
    const val = toNumber(tryTok);
    if (val !== null) {
      qTokens.push(tokens[i]);
    } else {
      break;
    }
  }
  if (qTokens.length) {
    out.quantity = toNumber(qTokens.join(" "));
    tokens.splice(0, qTokens.length);
  }

  // Unit
  if (tokens.length) {
    const u1 = UNIT_NORMAL[tokens[0].toLowerCase()];
    const u2 =
      tokens[1] && UNIT_NORMAL[(tokens[0] + " " + tokens[1]).toLowerCase()];
    if (u2) {
      out.unit = u2;
      tokens.splice(0, 2);
    } else if (u1) {
      out.unit = u1;
      tokens.splice(0, 1);
    }
  }

  out.name = tokens.join(" ").trim();

  // Defaults
  if (!out.unit && out.quantity != null) out.unit = "piece";
  if (!out.unit && out.quantity == null) out.unit = "piece";

  return out;
}
