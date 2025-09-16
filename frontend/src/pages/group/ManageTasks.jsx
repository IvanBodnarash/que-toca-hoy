import { useEffect, useState } from "react";
import { useParams } from "react-router";
import GroupTemplatesList from "../../components/groups/GroupTemplatesList";
import AddTemplateModal from "../../components/tasks/NewTaskTemplateModal";
import EditTaskTemplateModal from "../../components/tasks/EditTaskTemplateModal";
import { getGroupTemplatesTasks } from "../../services/groupsService";
import { updateTaskTemplate } from "../../services/taskTemplateService";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { SiGoogletasks } from "react-icons/si";
import { useGroupRealtime } from "../../realtime/useGroupRealtime";

export default function ManageTasks() {
  const { groupId } = useParams();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [editingTemplate, setEditingTemplate] = useState(null);

  const loadTemplates = async () => {
    setLoading(true);
    setError("");
    try {
      let data = await getGroupTemplatesTasks(groupId);
      data = data.filter(
        (e) => name === "" || e.name.toLowerCase().includes(name.toLowerCase())
      );
      setTemplates(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [groupId, name]);

  useGroupRealtime(groupId, {
    onTemplatesChanged: () => loadTemplates(),
  });

  const handleSaveEdit = async (updated) => {
    try {
      await updateTaskTemplate(updated.idTaskTemplate, updated);
      await loadTemplates();
      setEditingTemplate(null);
    } catch (err) {
      alert(err.message || "Error updating task template");
    }
  };

  return (
    <div className="px-6 py-22 space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-row text-cyan-900 items-center gap-3">
          <SiGoogletasks className="size-6" />
          <h1 className="text-2xl font-bold">Task Templates</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-cyan-900 hover:bg-cyan-800 active:bg-cyan-700 text-white px-2 py-1 md:px-4 md:py-1.5 rounded-lg shadow transition-all cursor-pointer"
        >
          <PlusIcon className="w-5 h-5" /> Add Task
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Filter tasks by name"
          className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-600 shadow-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* States */}
      {loading && (
        <div className="text-slate-500 animate-pulse">Loading templates...</div>
      )}

      {error && <div className="text-red-600 font-medium">{error}</div>}

      {!loading && !error && templates.length === 0 && (
        <div className="text-slate-500 italic text-center p-6 rounded-lg border border-slate-200 bg-slate-50">
          No templates yet. Start by adding one!
        </div>
      )}

      {/* Templates list */}
      {!loading && !error && templates.length > 0 && (
        <GroupTemplatesList
          templates={templates}
          onEdit={(t) => setEditingTemplate(t)}
        />
      )}

      {/* Modals */}
      {showModal && (
        <AddTemplateModal
          groupId={groupId}
          onClose={() => setShowModal(false)}
          onCreated={() => loadTemplates()}
          type="task"
        />
      )}

      {editingTemplate && (
        <EditTaskTemplateModal
          template={editingTemplate}
          onClose={() => setEditingTemplate(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
