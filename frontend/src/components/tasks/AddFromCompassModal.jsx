import { useState, useEffect, useMemo } from "react";
import { createGroupTemplate } from "../../services/groupsService";
import { fetchCompassRecipes } from "../../external/compassService";
import { compassMapper } from "../../external/compassMapper";

export default function AddFromCompassModal({ groupId, onClose, onImported }) {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());

  const selectedCount = selectedIds.size;

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchCompassRecipes({ take: 120 });
      setRecipes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to fetch recipes from Recipe Compass");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return recipes;
    return recipes.filter((r) =>
      (r.recipeTitle || "").toLowerCase().includes(s)
    );
  }, [recipes, search]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedDocs = useMemo(() => {
    return filtered.filter((r) => selectedIds.has(r.id));
  }, [filtered, selectedIds]);

  const handleImport = async () => {
    if (!Array.isArray(selectedDocs) || selectedDocs.length === 0) return;
    setImporting(true);
    setError("");
    try {
      for (const doc of selectedDocs) {
        const dto = compassMapper(doc);
        await createGroupTemplate(
          groupId,
          {
            name: dto.name,
            steps: dto.steps,
            type: "recipe",
          },
          dto.materials
        );
      }
      onImported?.();
      onClose();
    } catch (error) {
      console.error(error);
      setError(error.message || "Failed to import recipes");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl rounded-2xl bg-white p-4 sm:p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            Add Recipes from Recipe Compass
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 active:bg-slate-200"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title"
            className="w-full border rounded px-2 py-1 outline-none focus:ring-2 border-slate-800 focus:ring-cyan-600"
            autoFocus
          />

          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
              title="Clear"
            >
              ✕
            </button>
          )}
        </div>

        {/* States */}
        {loading && (
          <div className="text-slate-500 animate-pulse">Loading recipes...</div>
        )}
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}

        {/* Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[55vh] overflow-auto pr-1">
            {filtered.length === 0 ? (
              <div className="text-slate-500">No recipes found</div>
            ) : (
              filtered.map((r) => {
                const checked = selectedIds.has(r.id);
                return (
                  <label
                    key={r.id}
                    className={`flex gap-3 border rounded-xl p-3 cursor-pointer transition shadow-sm hover:shadow ${
                      checked ? "border-cyan-900/50 ring-cyan-600 bg-cyan-900/20" : "border-slate-200"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          className="accent-cyan-700"
                          checked={checked}
                          onChange={() => toggleSelect(r.id)}
                        />
                        {r.imageUrl ? (
                          <img
                            src={r.imageUrl}
                            alt={r.recipeTitle}
                            className="min-w-16 h-16 rounded-md object-cover border"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-md border bg-slate-100" />
                        )}
                        <div className="min-w-0">
                          <div className="font-semibold truncate">
                            {r.recipeTitle || "Untitled"}
                          </div>
                          <div className="text-sm text-slate-600 line-clamp-2">
                            {r.shortDescription || ""}
                          </div>
                          {Array.isArray(r.ingredients) &&
                            r.ingredients.length > 0 && (
                              <div className="text-xs text-slate-500 mt-1">
                                {r.ingredients.slice(0, 2).map((i, idx) => (
                                  <span key={idx}>
                                    {typeof i === "string" ? i : ""}
                                    {idx < Math.min(2, r.ingredients.length) - 1
                                      ? " · "
                                      : ""}
                                  </span>
                                ))}
                                {r.ingredients.length > 2 ? "…" : ""}
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </label>
                );
              })
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Selected: <span className="font-semibold">{selectedCount}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border hover:bg-slate-200 transition-all cursor-pointer"
              disabled={importing}
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              className="px-4 py-2 rounded-lg bg-cyan-900 text-white hover:bg-cyan-700 disabled:opacity-50 cursor-pointer"
              disabled={selectedCount === 0 || importing}
            >
              {importing ? "Importing..." : "Import selected"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
