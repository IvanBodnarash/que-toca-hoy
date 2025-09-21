import { parseIngredientLine } from "../utils/ingredientParser";

export function compassMapper(compassDoc) {
  const {
    recipeTitle,
    ingredients = [],
    directions = [],
  } = compassDoc;

  const materials = ingredients.map((line) => {
    const parsed = parseIngredientLine(line); // {quantity, unit, name}
    return {
      name: parsed.name || "Ingredient",
      quantity: parsed.quantity ?? 1,
      unit: parsed.unit || "piece",
    };
  });

  return {
    name: recipeTitle || "Untitled",
    steps: Array.isArray(directions) ? directions : [],
    materials,
  };
}
