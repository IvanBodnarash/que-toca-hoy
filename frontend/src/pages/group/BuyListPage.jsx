import { useEffect, useState, useRef } from "react";
import {
  getGroupBuyListReport,
  getTaskBuyList,
  updateBuyList,
} from "../../services/buyListService";
import toast, { Toaster } from "react-hot-toast";
import { X, History } from "lucide-react";
import { useParams, useSearchParams } from "react-router-dom";

import { TiShoppingCart } from "react-icons/ti";
import { MdCancel } from "react-icons/md";
import { useGroupRealtime } from "../../realtime/useGroupRealtime";

export default function BuyListPage() {
  const { groupId } = useParams();
  const [search] = useSearchParams();
  const taskId = search.get("task");
  const isTaskView = !!taskId;

  const [filter, setFilter] = useState("today");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [activityLog, setActivityLog] = useState([]);
  const [showLog, setShowLog] = useState(true);
  const toastId = useRef(null);
  const [recipeName, setRecipeName] = useState("");

  const fetchBuyList = async () => {
    setLoading(true);
    setError("");
    try {
      const data = taskId
        ? await getTaskBuyList(taskId)
        : await getGroupBuyListReport(groupId, filter);
      const onlyPending = (Array.isArray(data) ? data : []).filter(
        (i) => Number(i.quantity || 0) > 0
      );
      setItems(onlyPending);
      if (taskId && Array.isArray(data) && data.length > 0) {
        setRecipeName(data[0]?.recipeName || "");
      } else {
        setRecipeName("");
      }
    } catch (err) {
      setError(err.message || "Error loading buylist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyList();
  }, [filter, groupId, taskId]);

  useGroupRealtime(groupId, {
    onBuylistChanged: () => fetchBuyList(),
  });

  const addActivity = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setActivityLog((prev) => [{ message, timestamp }, ...prev]);
  };

  const handleCheck = (idBuyList) => {
    const current = items.find((i) => i.idBuyList === idBuyList);
    if (!current) return;

    if (current.quantity === 0) {
      if (!toastId.current) {
        toastId.current = toast(
          "Product already purchased. Use Replace to add.",
          { icon: "ℹ️" }
        );
        setTimeout(() => (toastId.current = null), 1500);
      }
      addActivity(
        `Tried to check ${current.Material?.name} but it was already purchased`
      );
      return;
    }

    const toggled = !current.checked;
    setItems((prev) =>
      prev.map((i) =>
        i.idBuyList === idBuyList ? { ...i, checked: toggled } : i
      )
    );

    const msg = toggled
      ? `Marked as purchased: ${current.Material?.name}`
      : `Unchecked: ${current.Material?.name}`;
    toast.success(msg);
    addActivity(msg);
  };

  const handleQuantityChange = (idBuyList, value) => {
    const current = items.find((i) => i.idBuyList === idBuyList);
    setItems((prev) =>
      prev.map((item) =>
        item.idBuyList === idBuyList
          ? { ...item, quantity: value, checked: false }
          : item
      )
    );
    addActivity(`Updated quantity to ${current.Material?.name} for ${value}`);
  };

  const handleSave = async () => {
    try {
      const payload = items.map((item) => ({
        idBuyList: item.idBuyList,
        quantity: item.checked ? 0 : Number(item.quantity) || 0,
      }));
      await updateBuyList(payload);
      toast.success("✅ List updated");
      addActivity("Shopping list has been updated");
      fetchBuyList();
    } catch (err) {
      toast.error("❌ Error updating the list");
    }
  };

  const renderQuantityEditor = (item) => {
    const isEditing = editing === item.idBuyList;
    if (!isEditing) {
      return (
        <>
          {item.quantity > 0 && (
            <span className="ml-2 text-slate-700 text-sm">
              ({item.quantity} {item.unit || ""})
            </span>
          )}
          <button
            onClick={() => setEditing(item.idBuyList)}
            className={`text-sm font-medium rounded-lg px-2 py-1 ml-2 border cursor-pointer transition ${
              item.quantity === 0
                ? "border-green-600 text-green-700 hover:bg-green-50"
                : "border-cyan-700 text-cyan-700 hover:bg-cyan-50"
            }`}
            title={item.quantity === 0 ? "Replace quantity" : "Edit quantity"}
          >
            {item.quantity === 0 ? "Add" : "Edit"}
          </button>
        </>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="1"
          max="99999"
          defaultValue={item.quantity > 0 ? item.quantity : ""}
          placeholder={`+ ${item.unit || ""}`}
          className="w-24 px-3 py-1 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") setEditing(null);
          }}
          onBlur={(e) => {
            const raw = e.target.value.trim();
            const next = Number(raw);
            if (!raw || Number.isNaN(next) || next < 1) {
              toast.error("Enter a value more or equal than 1");
              setEditing(null);
              return;
            }
            handleQuantityChange(item.idBuyList, next);
            setEditing(null);
            toast.success(`Quantity updated to ${next} ${item.unit || ""}`);
          }}
        />
        <button
          onClick={() => setEditing(null)}
          className="text-slate-600 hover:text-slate-800 text-lg cursor-pointer"
          title="Cancel"
        >
          <MdCancel />
        </button>
      </div>
    );
  };

  // Group items by material name
  const groupedItems = items.reduce((acc, item) => {
    const key = item.Material?.name || "Item";
    if (!acc[key]) acc[key] = { name: key, totalQuantity: 0, items: [] };
    acc[key].items.push(item);
    acc[key].totalQuantity += Number(item.quantity || 0);
    return acc;
  }, {});
  const groupedArray = Object.values(groupedItems);

  return (
    <div className="px-6 py-22 space-y-6 max-w-3xl mx-auto flex flex-col lg:flex-row gap-6 relative">
      <Toaster position="bottom-center" />

      {/* Shopping List */}
      <div className="flex-1">
        <div className="text-xl md:text-2xl font-bold mb-4 text-cyan-900 flex items-center gap-2">
          <TiShoppingCart className="size-8" />
          <h1>Buy List {isTaskView && recipeName ? ` - ${recipeName}` : ""}</h1>
        </div>

        {/* Filters */}
        {!isTaskView && (
          <div className="flex justify-center gap-2 mb-6 bg-slate-300 rounded-xl p-1">
            {["today", "week", "month"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 px-4 py-1 md:py-2 rounded-lg font-medium transition cursor-pointer ${
                  filter === f
                    ? "bg-cyan-800 text-white shadow"
                    : "text-cyan-800 hover:bg-slate-400/50"
                }`}
              >
                {f === "today" ? "Today" : f === "week" ? "Week" : "Month"}
              </button>
            ))}
          </div>
        )}

        {loading && <p className="text-center text-slate-500">⏳ Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && items.length === 0 && (
          <p className="text-center text-slate-400">
            {isTaskView
              ? "No pending purchases for this recipe"
              : "There are no pending purchases"}
          </p>
        )}

        <ul className="space-y-3 mb-6">
          {groupedArray.map((group) => (
            <li
              key={group.name}
              className="bg-white rounded-xl shadow p-2 border border-cyan-900/50"
            >
              <div className="flex justify-between items-center mb-1 font-semibold md:text-lg text-cyan-800">
                <span>{group.name}</span>
                <span>
                  Total: {group.totalQuantity} {group.items[0]?.unit || ""}
                </span>
              </div>

              {/* Individual items */}
              <ul className="space-y-2">
                {group.items.map((item) => {
                  const isCompleted = item.quantity === 0 || item.checked;
                  const checkboxDisabled = item.quantity === 0;

                  return (
                    <li
                      key={item.idBuyList}
                      className={`flex items-center gap-2 md:gap-3 rounded-lg border border-slate-300 p-1 md:p-2 transition ${
                        isCompleted
                          ? "bg-green-50 border-green-300"
                          : "bg-white"
                      }`}
                    >
                      <input
                        type="checkbox"
                        disabled={checkboxDisabled}
                        checked={checkboxDisabled ? false : !!item.checked}
                        onChange={() => handleCheck(item.idBuyList)}
                        className={`h-5 w-5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer ${
                          checkboxDisabled
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      />
                      <span className="flex-1 flex items-center gap-2 text-slate-800">
                        <span
                          className={
                            isCompleted ? "line-through text-slate-400" : ""
                          }
                        >
                          {item.Material.name || "Item"}
                        </span>

                        {item.quantity === 0 && (
                          <span className="text-green-700 text-xs font-medium bg-green-100 px-2 py-0.5 rounded-full">
                            Purchased
                          </span>
                        )}
                        {item.checked && item.quantity > 0 && (
                          <span className="text-cyan-800 text-xs font-medium bg-cyan-100 px-2 py-0.5 rounded-full">
                            Pending saving
                          </span>
                        )}
                      </span>
                      {renderQuantityEditor(item)}
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>

        {items.length > 0 && (
          <button
            onClick={handleSave}
            className="w-full p-2 rounded-xl bg-cyan-800 text-white font-semibold hover:bg-cyan-900 cursor-pointer shadow-md transition"
          >
            Save Changes
          </button>
        )}
      </div>

      {/* Toggle mobile sidebar */}
      <button
        onClick={() => setShowLog(!showLog)}
        className="lg:hidden fixed bottom-6 right-6 bg-cyan-800 text-white p-3 rounded-full shadow-lg hover:bg-cyan-900 transition"
      >
        {showLog ? <X size={20} /> : <History size={20} />}
      </button>
    </div>
  );
}
