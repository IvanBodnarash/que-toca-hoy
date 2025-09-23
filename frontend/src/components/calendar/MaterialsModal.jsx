export default function MaterialsModal({
  selectedTemplateMaterials,
  selectedMaterials,
  setSelectedMaterials,
  setMaterialsModalOpen,
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40">
      <div className="w-[90%] max-w-md bg-white p-4 rounded-2xl shadow-lg">
        <h2 className="text-lg font-semibold mb-3">Select materials to buy</h2>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {selectedTemplateMaterials.map((mat) => {
            const isSelected = selectedMaterials.some(
              (m) => m.idMaterial === mat.idMaterial
            );
            return (
              <label key={mat.idMaterial} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="size-5 cursor-pointer"
                  checked={isSelected}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedMaterials([
                        ...selectedMaterials,
                        {
                          idMaterial: mat.idMaterial,
                          quantity: mat.quantity || 1,
                          unit: mat.unit || "ud",
                        },
                      ]);
                    } else {
                      setSelectedMaterials(
                        selectedMaterials.filter(
                          (m) => m.idMaterial !== mat.idMaterial
                        )
                      );
                    }
                  }}
                />
                {mat.name} ({mat.quantity} {mat.unit || "ud"})
              </label>
            );
          })}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => setMaterialsModalOpen(false)}
            className="px-4 py-2 rounded bg-slate-200 hover:bg-slate-300 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => setMaterialsModalOpen(false)}
            className="px-4 py-2 rounded bg-cyan-900 text-white hover:bg-cyan-800 transition-all cursor-pointer"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
