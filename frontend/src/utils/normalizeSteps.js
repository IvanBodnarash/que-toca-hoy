export function normalizeSteps(raw) {
  if (!raw && raw !== 0) return [];

  if (Array.isArray(raw)) {
    return raw
      .map((x) => {
        if (typeof x === "string") return x.trim();
        if (x && typeof x === "object") {
          return (x.text || x.step || JSON.stringify(x)).trim();
        }
        return String(x).trim();
      })
      .filter(Boolean);
  }

  if (typeof raw === "string") {
    const s = raw.trim();
    if (!s) return [];
    try {
      const parsed = JSON.parse(s);
      return normalizeSteps(parsed);
    } catch {
      if (s.includes("\n")) {
        return s
          .split("\n")
          .map((x) => x.trim())
          .filter(Boolean);
      }
      if (s.includes(",")) {
        return s
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean);
      }
      return [s];
    }
  }

  return [String(raw)];
}
