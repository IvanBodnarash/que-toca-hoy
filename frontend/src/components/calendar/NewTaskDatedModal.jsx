import { useEffect, useState } from "react";
import { getGroupTemplates, getGroupUsers } from "../../services/groupsService";
import { getMaterialsforTemplante } from "../../services/taskDatedService";
import {
  assignUserToTask,
  createTaskDated,
} from "../../services/taskDatedService";
import {
  endOfDayLocal,
  startOfDayLocal,
  toLocalInputString,
} from "../../utils/toLocalInputString";
import MaterialsModal from "./MaterialsModal";

export default function NewTaskDatedModal({
  open,
  groupId,
  defaultDate,
  onClose,
  onCreated,
}) {
  const [templates, setTemplates] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [idTaskTemplate, setIdTaskTemplate] = useState("");
  const [assignees, setAssignees] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [frequency, setFrequency] = useState("none");
  const [rotative, setRotative] = useState(false);

  // For materials
  const [materialsModalOpen, setMaterialsModalOpen] = useState(false);
  const [selectedTemplateMaterials, setSelectedTemplateMaterials] = useState(
    []
  );
  const [selectedMaterials, setSelectedMaterials] = useState([]);

  // For selected type of template
  const [selectedTask, setSelectedTask] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState("");

  const handleTaskChange = (id) => {
    setSelectedTask(id);
    setSelectedRecipe(""); // Reset
    handleTemplateChange(id); // Load materials and open the modal
  };

  const handleRecipeChange = (id) => {
    setSelectedRecipe(id);
    setSelectedTask(""); // Reset from another
    handleTemplateChange(id); // Upload materials and open modal
  };

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [tpls, usrs] = await Promise.all([
          getGroupTemplates(groupId),
          getGroupUsers(groupId),
        ]);

        if (cancelled) return;

        setTemplates(Array.isArray(tpls) ? tpls : []);
        setUsers(Array.isArray(usrs) ? usrs : []);

        const base = defaultDate || new Date();
        const s = startOfDayLocal(base);
        const e = endOfDayLocal(base);

        setStartDate(toLocalInputString(s));
        setEndDate(toLocalInputString(e));

        setIdTaskTemplate("");
        setAssignees([]);
        setFrequency("none");
        setRotative(false);
        setSelectedTemplateMaterials([]);
        setSelectedMaterials([]);
        setSelectedTask("");
        setSelectedRecipe("");
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load form data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, groupId, defaultDate]);

  const handleTemplateChange = async (templateId) => {
    try {
      setIdTaskTemplate(templateId);
      if (!templateId) {
        setSelectedTemplateMaterials([]);
        setSelectedMaterials([]);
        setMaterialsModalOpen(false);
        return;
      }

      const materials = await getMaterialsforTemplante(Number(templateId));
      if (Array.isArray(materials) && materials.length > 0) {
        setSelectedTemplateMaterials(materials);
        setSelectedMaterials([]);
        setMaterialsModalOpen(true);
      } else {
        setSelectedTemplateMaterials([]);
        setSelectedMaterials([]);
        setMaterialsModalOpen(false);
      }
    } catch (e) {
      console.warn("getMaterialsforTemplante failed:", e?.message || e);
      setSelectedTemplateMaterials([]);
      setSelectedMaterials([]);
      setMaterialsModalOpen(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!idTaskTemplate) {
      setError("Template is required");
      return;
    }
    if (!startDate || !endDate) {
      setError("Start and End dates are required");
      return;
    }

    const s = new Date(startDate);
    const en = new Date(endDate);
    if (isNaN(s.getTime()) || isNaN(en.getTime())) {
      setError("Invalid date format");
      return;
    }
    if (s > en) {
      setError("Start must be before End");
      return;
    }
    if (rotative && assignees.length < 1) {
      setError("For rotative tasks choose at least one assignee");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const created = await createTaskDated({
        idGroup: Number(groupId),
        idTaskTemplate: Number(idTaskTemplate),
        startDate: s.toISOString(),
        endDate: en.toISOString(),
        frequency,
        rotative,
        rotators: rotative ? assignees : undefined,
        materials: selectedMaterials,
      });

      if (rotative) {
        const first = assignees[0];
        if (first) {
          try {
            await assignUserToTask(Number(first), Number(created.idTaskDated));
          } catch (err) {
            console.warn("assignUserToTask failed:", err?.message || err);
          }
        }
      } else if (Array.isArray(assignees) && assignees.length > 0) {
        for (const uid of assignees) {
          try {
            await assignUserToTask(Number(uid), Number(created.idTaskDated));
          } catch (err) {
            console.warn("assignUserToTask failed:", err?.message || err);
          }
        }
      }
      onCreated(); // Refresh calendar
      onClose(); // Close modal
    } catch (e) {
      setError(e.message || "Create failed");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  // Separate recipes and tasks
  const taskTemplates = templates.filter((t) => t.type === "task");
  const recipeTemplates = templates.filter((t) => t.type === "recipe");

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
      <div className="w-[92%] max-w-xl rounded-2xl bg-white p-4 shadow-xl transition-all">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Add task</h2>
          <button
            onClick={() => onClose()}
            className="inline-flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100 cursor-pointer"
            title="close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-3xl text-slate-800">📋 </label>
            <select
              value={selectedTask}
              onChange={(e) => handleTaskChange(e.target.value)}
              className="w-32 bg-cyan-800 hover:bg-cyan-700 transition-all outline-0 text-white rounded p-1 cursor-pointer"
            >
              <option value="">Select task</option>
              {taskTemplates.map((t) => (
                <option key={t.idTaskTemplate} value={t.idTaskTemplate}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-3xl text-slate-800">🥘 </label>
            <select
              value={selectedRecipe}
              onChange={(e) => handleRecipeChange(e.target.value)}
              className="w-32 bg-cyan-800 hover:bg-cyan-700 transition-all outline-0 text-white rounded p-1 cursor-pointer"
            >
              <option value="">Select recipe</option>
              {recipeTemplates.map((t) => (
                <option key={t.idTaskTemplate} value={t.idTaskTemplate}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="text-md text-slate-800">Start</label>
              <input
                type="datetime-local"
                className="mt-1 w-full rounded-md border border-slate-500 px-3 py-2 focus:ring-2 outline-none text-slate-700 focus:ring-cyan-600 cursor-pointer"
                value={startDate}
                // onChange={(e) => setStartDate(e.target.value)}
                onChange={(e) => {
                  const v = e.target.value;
                  setStartDate(v);
                  try {
                    const s = new Date(v);
                    const eSame = endOfDayLocal(s);
                    setEndDate(toLocalInputString(eSame));
                  } catch (error) {
                    console.error(error.message);
                  }
                }}
              />
            </div>
            <div>
              <label className="text-md text-slate-800">End</label>
              <input
                type="datetime-local"
                className="mt-1 w-full rounded-md border border-slate-500 px-3 py-2 focus:ring-2 outline-none text-slate-700 focus:ring-cyan-600 cursor-pointer"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-md text-slate-800">Assignees</label>
            <select
              multiple
              className="mt-1 w-full rounded-md border border-slate-500 focus:ring-2 outline-none text-slate-700 focus:ring-cyan-600 cursor-pointer p-2 max-h-32"
              value={assignees.map(String)}
              onChange={(e) => {
                const ids = Array.from(e.target.selectedOptions).map((o) =>
                  Number(o.value)
                );
                // setAssignees(rotative ? ids.slice(0, 1) : ids);
                setAssignees(ids);
              }}
            >
              {users.map((u) => (
                <option
                  key={u.idUser}
                  value={u.idUser}
                  className="p-2 cursor-pointer"
                >
                  @{u.username} — {u.name}
                </option>
              ))}
            </select>
            {rotative && (
              <p className="text-xs text-slate-600 mt-1">
                Rotative: choose the members to rotate between. The first
                selected will start.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="text-md text-slate-800">Frequency</label>
              <select
                className="mt-1 w-full rounded-md border border-slate-500 px-3 py-2 focus:ring-2 outline-none text-slate-700 focus:ring-cyan-600 cursor-pointer"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option value="none">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="mt-2 inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                id="rotative"
                className="size-6 cursor-pointer"
                checked={rotative}
                // onChange={(e) => setRotative(e.target.checked)}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setRotative(checked);
                  if (checked && assignees.length > 1) {
                    setAssignees(assignees.slice(0, 1));
                  }
                }}
              />
              <label
                htmlFor="rotative"
                className="text-lg text-slate-800 cursor-pointer"
              >
                Rotative
              </label>
            </div>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-cyan-900 hover:bg-cyan-700 cursor-pointer transition-all px-4 py-2 text-white disabled:opacity-60"
          >
            {loading ? "Saving..." : "Create"}
          </button>
        </form>

        {/* Materials modal */}
        {materialsModalOpen && (
          <MaterialsModal
            selectedMaterials={selectedMaterials}
            selectedTemplateMaterials={selectedTemplateMaterials}
            setMaterialsModalOpen={setMaterialsModalOpen}
            setSelectedMaterials={setSelectedMaterials}
          />
        )}
      </div>
    </div>
  );
}
