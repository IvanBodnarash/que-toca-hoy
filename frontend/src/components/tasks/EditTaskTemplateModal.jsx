import { useState } from "react";
import { X, Trash2 } from "lucide-react";
import { normalizeSteps } from "../../utils/normalizeSteps";

export default function EditTaskTemplateModal({ template, onClose, onSave }) {
  const [name, setName] = useState(template.name || "");
  const [steps, setSteps] = useState(() => normalizeSteps(template.steps));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...template,
      name,
      // steps: JSON.stringify(steps),
      steps,
    });
  };

  const handleDeleteStep = (index) => {
    const newSteps = [...steps];
    newSteps.splice(index, 1);
    setSteps(newSteps);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-[93%] max-w-lg p-4 md:p-6 relative">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Edit Task Template</h2>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100 cursor-pointer transition-all"
            title="close"
          >
            ✕
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              className="w-full border rounded p-2 outline-none focus:ring-2 border-slate-500 focus:ring-cyan-600"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {/* Steps */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Steps
            </label>
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-2 mt-1">
                <input
                  className="w-full border rounded p-2 outline-none focus:ring-2 border-slate-500 focus:ring-cyan-600"
                  value={step}
                  onChange={(e) => {
                    const newSteps = [...steps];
                    newSteps[i] = e.target.value;
                    setSteps(newSteps);
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleDeleteStep(i)}
                  className="text-red-600 hover:text-red-800 transition-all cursor-pointer rounded bg-red-700/20 hover:bg-red-100 p-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setSteps([...steps, ""])}
              className="mt-2 text-cyan-800 text-md hover:text-cyan-600 cursor-pointer transition-all"
            >
              + Add step
            </button>
          </div>
          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1 rounded bg-slate-300 hover:bg-slate-400/80 transition-all cursor-pointer"
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
