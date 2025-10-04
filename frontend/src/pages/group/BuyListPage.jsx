import { useEffect, useState } from "react";
import {
  getGroupBuyListReport,
  getTaskBuyList,
  updateBuyList,
} from "../../services/buyListService";
import toast, { Toaster } from "react-hot-toast";
import { X, History } from "lucide-react";
import { useParams, useSearchParams } from "react-router-dom";

import { TiShoppingCart } from "react-icons/ti";
import { useGroupRealtime } from "../../realtime/useGroupRealtime";
import BuyListActivity from "../../components/buyList/BuyListActivity";
import IndividualItems from "../../components/buyList/IndividualItems";

export default function BuyListPage() {
  const { groupId } = useParams();
  const [search] = useSearchParams();
  const taskId = search.get("task");
  const isTaskView = !!taskId;

  const [filter, setFilter] = useState("today");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activityLog, setActivityLog] = useState([]);
  const [showLog, setShowLog] = useState(true);
  const [recipeName, setRecipeName] = useState("");

  const MAX_LOG = 100;

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
    const color = message.startsWith("Marked as purchased")
      ? "green"
      : message.startsWith("Updated quantity")
      ? "cyan"
      : "";
    setActivityLog((prev) => {
      const next = [{ message, color, timestamp }, ...prev];
      return next.slice(0, MAX_LOG);
    });
  };

  const handleSave = async () => {
    try {
      const payload = items.map((item) => ({
        idBuyList: item.idBuyList,
        quantity: item.checked ? 0 : Number(item.quantity) || 0,
      }));
      await updateBuyList(payload);
      toast.success("List updated");
      addActivity("Buy list has been updated");
      fetchBuyList();
    } catch (err) {
      toast.error("Error updating the list");
    }
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
    <div className="px-6 py-22 space-y-6 max-w-5xl mx-auto flex flex-col lg:flex-row gap-6 relative">
      <Toaster position="bottom-center" />

      {/* Buy List */}
      <div className="flex-1">
        <div className="text-xl md:text-2xl font-bold mb-4 text-cyan-900 flex items-center gap-2">
          <TiShoppingCart className="size-6 md:size-8" />
          <h1 className="text-xl md:text-2xl font-bold">Buy List {isTaskView && recipeName ? ` - ${recipeName}` : ""}</h1>
        </div>

        {/* Filters */}
        {!isTaskView && (
          <div className="flex justify-center gap-2 mb-4 md:mb-6 bg-slate-300 rounded-xl p-1">
            {["today", "week", "month"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 px-4 py-0.5 md:py-1 rounded-lg font-medium transition cursor-pointer ${
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

        {loading && (
          <p className="text-center text-slate-500 animate-pulse">
            ⏳ Loading...
          </p>
        )}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && items.length === 0 && (
          <p className="text-center text-slate-400">
            {isTaskView
              ? "No pending purchases for this recipe"
              : "There are no pending purchases"}
          </p>
        )}
        {!loading && !error && items.length > 0 && (
          <div className="flex flex-col md:flex-row gap-2">
            <div className="md:w-3/5">
              <ul className="space-y-3 mb-2 md:mb-6">
                {groupedArray.map((group) => (
                  <li
                    key={group.name}
                    className="bg-white rounded-xl shadow p-2 border border-cyan-900/50"
                  >
                    <div className="flex justify-between items-center mb-1 font-semibold md:text-lg text-cyan-800">
                      <span>{group.name}</span>
                      <span>
                        Total: {group.totalQuantity}{" "}
                        {group.items[0]?.unit || ""}
                      </span>
                    </div>

                    {/* Individual items */}
                    <IndividualItems
                      addActivity={addActivity}
                      group={group}
                      items={items}
                      setItems={setItems}
                    />
                  </li>
                ))}
              </ul>

              {items.length > 0 && (
                <button
                  onClick={handleSave}
                  className="w-full p-1 md:p-2 mb-2 rounded-xl bg-cyan-800 text-white font-semibold hover:bg-cyan-900 cursor-pointer shadow-md transition"
                >
                  Save Changes
                </button>
              )}
            </div>

            <BuyListActivity
              activityLog={activityLog}
              setActivityLog={setActivityLog}
              showLog={showLog}
            />
          </div>
        )}
      </div>

      {/* Toggle mobile sidebar */}
      <button
        onClick={() => setShowLog(!showLog)}
        className="fixed bottom-24 right-4 bg-cyan-700 border border-cyan-900 text-white p-3 rounded-full shadow-2xl hover:bg-cyan-900 transition-all cursor-pointer md:hidden"
        title={showLog ? "Hide activity" : "Show activity"}
      >
        {showLog ? <X size={20} /> : <History size={20} />}
      </button>
    </div>
  );
}
