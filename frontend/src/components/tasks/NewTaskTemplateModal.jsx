import { useState, useEffect } from "react";
import {
  getGroupMaterials,
  createGroupTemplate,
} from "../../services/groupsService";
import { normalizeSteps } from "../../utils/normalizeSteps";

export default function AddTemplateModal({
  groupId,
  onClose,
  onCreated,
  type,
}) {
  const [name, setName] = useState("");
  const [steps, setSteps] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Materials
  const [materials, setMaterials] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const loadMaterials = async () => {
    let cancelled = false;

    setLoading(true);
    setError("");
    try {
      let data = await getGroupMaterials(groupId);
      console.log("Fetched materials data:", data.materials);

      if (!cancelled) {
        const mats = Array.isArray(data.materials) ? data.materials : [];

        // Remove duplicates by idMaterial
        const uniqueMaterials = Array.from(
          new Map(mats.map((m) => [m.idMaterial, m])).values()
        );

        setMaterials(uniqueMaterials);
      }
      console.log("Loaded materials:", data);
    } catch (e) {
      if (!cancelled) setError(e.message || "Failed to load templates");
    } finally {
      if (!cancelled) setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  };

  useEffect(() => {
    loadMaterials();
  }, [groupId]);

  const filteredMaterials = materials.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) &&
      !selectedMaterials.some((sm) => sm.idMaterial === m.idMaterial)
  );

  const handleSelectMaterial = (mat) => {
    if (!selectedMaterials.find((m) => m.idMaterial === mat.idMaterial)) {
      setSelectedMaterials([
        ...selectedMaterials,
        { ...mat, quantity: 1, unit: "ud" },
      ]);
    }
    setSearch("");
    setDropdownOpen(false);
  };
  const handleAddMaterial = () => {
    console.log(search);
    if (
      search.trim() &&
      !materials.some((m) => m.name.toLowerCase() === search.toLowerCase())
    ) {
      const newMat = { idMaterial: Date.now(), name: search };
      setMaterials([...materials, newMat]);
      setSelectedMaterials([
        ...selectedMaterials,
        { ...newMat, quantity: 1, unit: "ud" },
      ]);
    }
    setSearch("");
    setDropdownOpen(false);
  };

  const handleChangeQuantity = (idMaterial, value) => {
    setSelectedMaterials(
      selectedMaterials.map((m) =>
        m.idMaterial === idMaterial ? { ...m, quantity: value } : m
      )
    );
  };

  const handleChangeUnit = (idMaterial, value) => {
    setSelectedMaterials(
      selectedMaterials.map((m) =>
        m.idMaterial === idMaterial ? { ...m, unit: value } : m
      )
    );
  };

  const handleRemoveMaterial = (idMaterial) => {
    setSelectedMaterials(
      selectedMaterials.filter((m) => m.idMaterial !== idMaterial)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const stepsArray = normalizeSteps(steps);

      const tpl = await createGroupTemplate(
        groupId,
        { name, steps: stepsArray, type },
        selectedMaterials.map((m) => ({
          idMaterial: m.idMaterial,
          quantity: m.quantity,
          unit: m.unit,
          name: m.name,
        }))
      );

      onCreated?.(tpl);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[90%] max-w-md rounded-2xl bg-white p-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Add new {type}</h2>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100 cursor-pointer transition-all"
            title="close"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 text-slate-700">
          <input
            type="text"
            placeholder="Name"
            className="w-full border rounded px-2 py-1 outline-none focus:ring-2 border-slate-500 focus:ring-cyan-600"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <textarea
            placeholder="Write each step on a new line"
            className="w-full border rounded px-2 py-1 outline-none focus:ring-2 border-slate-500 focus:ring-cyan-600"
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
          />

          {/* Materials section */}
          <div className="space-y-2 relative">
            <p className="font-medium">Materials</p>

            <input
              type="text"
              placeholder="Search or add material"
              className="w-full border rounded px-2 py-1 outline-none focus:ring-2 border-slate-500 focus:ring-cyan-600"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setDropdownOpen(true);
              }}
              onFocus={() => setDropdownOpen(true)}
            />

            {dropdownOpen && search && (
              <div className="absolute z-10 w-full bg-white border rounded shadow max-h-40 overflow-y-auto">
                {filteredMaterials.length > 0 ? (
                  filteredMaterials.map((mat) => (
                    <div
                      key={mat.idMaterial}
                      className="px-3 py-1 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSelectMaterial(mat)}
                    >
                      {mat.name}
                    </div>
                  ))
                ) : (
                  <div
                    className="px-3 py-1 cursor-pointer hover:bg-gray-100 text-cyan-700"
                    onClick={handleAddMaterial}
                  >
                    + Add "{search}"
                  </div>
                )}
              </div>
            )}

            {/* Editable list of selected materials */}
            <div className="space-y-2 mt-2">
              {selectedMaterials.map((mat) => (
                <div
                  key={mat.idMaterial}
                  className="flex items-center gap-2 border p-2 rounded"
                >
                  <span className="flex-1">{mat.name}</span>
                  <input
                    type="number"
                    min="0"
                    className="w-20 border rounded px-1 py-0.5"
                    value={mat.quantity}
                    onChange={(e) =>
                      handleChangeQuantity(
                        mat.idMaterial,
                        parseFloat(e.target.value)
                      )
                    }
                  />
                  <select
                    className="border rounded px-1 py-0.5 cursor-pointer"
                    value={mat.unit}
                    onChange={(e) =>
                      handleChangeUnit(mat.idMaterial, e.target.value)
                    }
                  >
                    <option value="ud">ud</option>
                    <option value="ml">ml</option>
                    <option value="gr">gr</option>
                    <option value="kg">kg</option>
                    <option value="l">l</option>
                    <option value="tsp">tsp</option>
                    <option value="tbsp">tbsp</option>
                    <option value="cup">cup</option>
                    <option value="pint">pint</option>
                    <option value="pinch">pinch</option>
                    <option value="dash">dash</option>
                    <option value="clove">clove</option>
                    <option value="bunch">bunch</option>
                    <option value="slice">slice</option>
                    <option value="handful">handful</option>
                    <option value="can">can</option>
                    <option value="pack">pack</option>
                    <option value="piece">piece</option>
                  </select>
                  <button
                    type="button"
                    className="text-red-600 cursor-pointer"
                    onClick={() => handleRemoveMaterial(mat.idMaterial)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* States */}
          {loading && (
            <div className="text-slate-500 animate-pulse">
              Loading task templates...
            </div>
          )}
          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1 rounded bg-slate-300 hover:bg-slate-400 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1 rounded bg-cyan-900 hover:bg-cyan-800 text-white transition-all cursor-pointer"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
