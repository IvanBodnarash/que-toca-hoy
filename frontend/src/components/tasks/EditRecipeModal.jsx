import { useState } from "react";
import { X, Plus, Trash } from "lucide-react";

export default function EditRecipeModal({
  template,
  groupId,
  onClose,
  onSave,
}) {
  const [name, setName] = useState(template.name || "");
  const [steps, setSteps] = useState(
    Array.isArray(template.steps)
      ? template.steps
      : JSON.parse(template.steps || "[]")
  );
  const [materials, setMaterials] = useState(template.materials || []);

  const handleAddStep = () => setSteps([...steps, ""]);
  const handleRemoveStep = (index) =>
    setSteps(steps.filter((_, i) => i !== index));
  const handleStepChange = (index, value) =>
    setSteps(steps.map((s, i) => (i === index ? value : s)));

  const handleAddMaterial = () =>
    setMaterials([
      ...materials,
      { idMaterial: null, name: "", quantity: 1, unit: "ud" },
    ]);
  const handleRemoveMaterial = (index) =>
    setMaterials(materials.filter((_, i) => i !== index));
  const handleMaterialChange = (index, field, value) =>
    setMaterials(
      materials.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );

  const handleSubmit = () => {
    onSave({ ...template, name, steps, materials });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl w-[93%] max-w-3xl p-6 relative shadow-lg overflow-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Edit Recipe</h2>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100 cursor-pointer transition-all"
            title="close"
          >
            ✕
          </button>
        </div>

        {/* <h2 className="text-xl font-bold text-cyan-800 mb-4">Edit Template</h2> */}

        <div className="mb-4">
          <label className="block font-medium text-cyan-700 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-cyan-600 outline-none"
          />
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-cyan-700">Steps</span>
            <button
              onClick={handleAddStep}
              className="flex items-center gap-1 text-sm text-cyan-800 hover:underline"
            >
              <Plus size={14} /> Add Step
            </button>
          </div>
          <ul className="space-y-2">
            {steps.map((step, i) => (
              <li key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={step}
                  onChange={(e) => handleStepChange(i, e.target.value)}
                  className="flex-1 border rounded px-2 py-1 focus:ring-2 focus:ring-cyan-600 outline-none"
                />
                <button
                  onClick={() => handleRemoveStep(i)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash size={16} />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-cyan-700">Materials</span>
            <button
              onClick={handleAddMaterial}
              className="flex items-center gap-1 text-sm text-cyan-800 hover:underline"
            >
              <Plus size={14} /> Add Material
            </button>
          </div>
          <ul className="space-y-2">
            {materials.map((m, i) => (
              <li key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Name"
                  value={m.name || ""}
                  onChange={(e) =>
                    handleMaterialChange(i, "name", e.target.value)
                  }
                  className="border rounded px-2 py-1 w-36 focus:ring-2 focus:ring-cyan-600 outline-none"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={m.quantity || ""}
                  onChange={(e) =>
                    handleMaterialChange(i, "quantity", Number(e.target.value))
                  }
                  className="border rounded px-2 py-1 w-20 focus:ring-2 focus:ring-cyan-600 outline-none"
                />
                <select
                  value={m.unit || "ud"}
                  onChange={(e) =>
                    handleMaterialChange(i, "unit", e.target.value)
                  }
                  className="border rounded px-2 py-1 focus:ring-2 focus:ring-cyan-600 outline-none"
                >
                  <option value="ud">ud</option>
                  <option value="ml">ml</option>
                  <option value="gr">gr</option>
                </select>
                <button
                  onClick={() => handleRemoveMaterial(i)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash size={16} />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-2 mt-4 bg-cyan-800 text-white rounded-lg font-medium hover:bg-cyan-900 transition"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
