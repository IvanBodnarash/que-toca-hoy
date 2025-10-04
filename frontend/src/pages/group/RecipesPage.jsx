import { useEffect, useState } from "react";
import { useParams } from "react-router";
import GroupTemplatesList from "../../components/groups/GroupTemplatesList";
import EditRecipeModal from "../../components/tasks/EditRecipeModal";
import AddRecipeModal from "../../components/tasks/AddRecipeModal";
import {
  getGroupTemplatesRecipes,
  updateGroupTemplate,
} from "../../services/groupsService";
import { GiHotMeal } from "react-icons/gi";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "lucide-react";
import { useGroupRealtime } from "../../realtime/useGroupRealtime";
import AddFromCompassModal from "../../components/tasks/AddFromCompassModal";
import { updateTaskTemplate } from "../../services/taskTemplateService";

export default function RecipesPage() {
  const { groupId } = useParams();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterName, setFilterName] = useState("");
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [creatingRecipe, setCreatingRecipe] = useState(false);
  const [addingFromCompass, setAddingFromCompass] = useState(false);

  // Load templates
  const loadTemplates = async () => {
    setLoading(true);
    setError("");
    try {
      let data = await getGroupTemplatesRecipes(groupId);
      data = data.filter(
        (e) =>
          filterName === "" ||
          e.name.toLowerCase().includes(filterName.toLowerCase())
      );
      setTemplates(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [groupId, filterName]);

  useGroupRealtime(groupId, {
    onTemplatesChanged: () => loadTemplates(),
  });

  // Update template
  const handleEditTemplate = async (template) => {
    try {
      await updateGroupTemplate(groupId, template);
      await loadTemplates();
      setEditingTemplate(null);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update template");
    }
  };

  const handleDeleted = (id) =>
    setTemplates((prev) => prev.filter((t) => t.idTaskTemplate !== id));

  return (
    <div className="px-6 py-22 space-y-6 max-w-3xl mx-auto">
      {/* Header + New Recipe Button */}
      <div className="flex flex-wrap items-center justify-between">
        <div className="flex flex-row text-cyan-900 items-center gap-3">
          <GiHotMeal className="size-6 md:size-8" />
          <h1 className="text-xl md:text-2xl font-bold">Recipes</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCreatingRecipe(true)}
            className="text-xs flex items-center gap-1 bg-cyan-900 hover:bg-cyan-800 active:bg-cyan-700 text-white px-2 py-1 md:px-4 md:py-1.5 rounded-lg shadow transition-all cursor-pointer"
          >
            <PlusIcon className="size-3" /> New Recipe
          </button>
          <button
            onClick={() => setAddingFromCompass(true)}
            className="text-sm flex items-center gap-2 border border-cyan-900 hover:bg-cyan-50 active:bg-cyan-100 text-cyan-900 px-2 py-1 md:px-4 md:py-1.5 rounded-lg shadow transition-all cursor-pointer"
          >
            Import
          </button>
        </div>
      </div>
      {/* Search bar */}
      <div className="relative">
        <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Filter recipes by name"
          className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-600"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
        />
      </div>
      {/* States */}
      {loading && (
        <div className="text-slate-500 animate-pulse">Loading recipes...</div>
      )}
      {error && <div className="text-red-600 font-medium">{error}</div>}
      {!loading && !error && templates.length === 0 && (
        <div className="text-slate-500 italic text-center p-6 rounded-lg border border-slate-200 bg-slate-50">
          No recipes found.
        </div>
      )}
      {/* List */}
      {!loading && !error && templates.length > 0 && (
        <GroupTemplatesList
          templates={templates}
          onEdit={(template) => setEditingTemplate(template)}
          onDeleted={handleDeleted}
        />
      )}

      {/* Edit recipe modal */}
      {editingTemplate && (
        <EditRecipeModal
          template={editingTemplate}
          groupId={groupId}
          onClose={() => setEditingTemplate(null)}
          onSave={handleEditTemplate}
        />
      )}

      {/* Create recipe modal */}
      {creatingRecipe && (
        <AddRecipeModal
          groupId={groupId}
          onClose={() => setCreatingRecipe(false)}
          onCreated={loadTemplates}
        />
      )}

      {/* Add from Recipe Compass modal */}
      {addingFromCompass && (
        <AddFromCompassModal
          groupId={groupId}
          onClose={() => setAddingFromCompass(false)}
          onImported={loadTemplates}
        />
      )}
    </div>
  );
}
