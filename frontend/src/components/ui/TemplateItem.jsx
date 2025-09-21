import { useState } from "react";

import toast from "react-hot-toast";

import { deleteTaskTemplate } from "../../services/taskTemplateService";
import { normalizeSteps } from "../../utils/normalizeSteps";

import { ChevronDown, ChevronUp, Edit, Trash2 } from "lucide-react";

export default function TemplateItem({ template, onEdit, onDeleted }) {
  const [showMaterials, setShowMaterials] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [busy, setBusy] = useState(false);

  const stepsArray = normalizeSteps(template?.steps);

  const handleDelete = async () => {
    if (busy) return;
    const ok = window.confirm(`Delete ${template.name}?`);
    if (!ok) return;

    try {
      setBusy(true);
      await deleteTaskTemplate(template.idTaskTemplate);
      toast.success("Deleted");
      onDeleted?.(template.idTaskTemplate);
    } catch (error) {
      if (error.status === 409) {
        toast.error("Can't delete: this recipe has scheduled tasks.");
      } else if (error.status === 404) {
        toast.error("Template not found");
      } else {
        toast.error(error.message || "Failed to delete");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="rounded-xl border border-cyan-900/40 bg-cyan-50/80 p-4 shadow-sm hover:shadow-md transition">
      {/* Header */}
      <div className="flex flex-row flex-wrap justify-between items-center gap-3">
        <div>
          <div className="font-semibold text-cyan-800 text-lg">
            {template.name}
          </div>
          {template.description && (
            <div className="text-sm text-cyan-700 mt-1">
              {template.description}
            </div>
          )}
        </div>

        <div className="flex sm:gap-2 flex-wrap items-center justify-between sm:justify-start w-full md:w-fit mt-2 sm:mt-0">
          {stepsArray.length > 0 && (
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-xs flex items-center gap-1 font-medium hover:bg-cyan-200 transition cursor-pointer"
            >
              {showSteps ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {stepsArray.length} {stepsArray.length === 1 ? "step" : "steps"}
            </button>
          )}

          {template.materials?.length > 0 && (
            <button
              onClick={() => setShowMaterials(!showMaterials)}
              className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-xs flex items-center gap-1 font-medium hover:bg-cyan-200 cursor-pointer transition"
            >
              {showMaterials ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
              {template.materials.length}{" "}
              {template.materials.length === 1 ? "ingredient" : "ingredients"}
            </button>
          )}

          <button
            onClick={() => onEdit?.(template)}
            className="ml-2 bg-cyan-800 text-white px-3 py-1 rounded-md text-xs flex items-center gap-1 font-medium hover:bg-cyan-900 cursor-pointer transition"
          >
            <Edit size={14} />
            Edit
          </button>

          <button
            onClick={handleDelete}
            disabled={busy}
            className="bg-red-700 text-white p-1.5 rounded-md text-xs flex items-center gap-1 font-medium hover:bg-red-900 cursor-pointer transition"
            title="Delete recipe"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Steps */}
      <div
        className={`overflow-hidden transition-[max-height] duration-400 ease-in-out ${
          showSteps ? "max-h-96" : "max-h-0"
        }`}
      >
        {Array.isArray(stepsArray) && stepsArray.length > 0 && (
          <ul className="list-decimal ml-5 text-sm text-cyan-700 space-y-1">
            {stepsArray.map((step, i) => (
              <li key={i} className="flex items-start gap-1">
                <span className="font-medium">{i + 1}.</span> {step}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Separator */}
      {showSteps && showMaterials && (
        <hr className="my-3 border-cyan-500 transition-all" />
      )}

      {/* Materials */}
      <div
        className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
          showMaterials ? "max-h-96" : "max-h-0"
        }`}
      >
        {template.materials?.length && (
          <ul className="list-disc ml-5 text-sm text-cyan-700 space-y-1">
            {template.materials.map((mat, idx) => (
              <li
                key={`${mat.idMaterial}-${idx}`}
                className="flex items-center justify-between w-50 gap-2"
              >
                <span className="font-medium">{mat.name}</span>
                {mat.quantity && (
                  <span className="text-xs text-white bg-cyan-800 px-2 py-0.5 rounded-full">
                    {mat.quantity} {mat.unit || "ud"}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}
