import { useState, useRef } from "react";
import toast from "react-hot-toast";
import RenderQuantityEditor from "./RenderQuantityEditor";

export default function IndividualItems({
  group,
  items,
  addActivity,
  setItems,
}) {
  const [editing, setEditing] = useState(null);
  const toastId = useRef(null);

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

  return (
    <ul className="space-y-2">
      {group.items.map((item) => {
        const isCompleted = item.quantity === 0 || item.checked;
        const checkboxDisabled = item.quantity === 0;

        return (
          <li
            key={item.idBuyList}
            className={`flex items-center gap-1 md:gap-3 rounded-lg border border-slate-300 p-1 md:p-2 transition ${
              isCompleted ? "bg-green-50 border-green-300" : "bg-white"
            }`}
          >
            <input
              type="checkbox"
              disabled={checkboxDisabled}
              checked={checkboxDisabled ? false : !!item.checked}
              onChange={() => handleCheck(item.idBuyList)}
              className={`size-4 md:size-5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer ${
                checkboxDisabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
            />
            <span className="flex-1 flex text-sm md:text-md items-center gap-2 text-slate-800">
              <span
                className={isCompleted ? "line-through text-slate-400" : ""}
              >
                {item.Material.name || "Item"}
              </span>

              {item.quantity === 0 && (
                <span className="text-green-700 text-xs font-medium bg-green-100 px-2 py-0.5 rounded-full">
                  Purchased
                </span>
              )}
              {item.checked && item.quantity > 0 && (
                <span className="text-cyan-800 text-xs text-center font-medium bg-cyan-100 px-1.5 md:px-2 py-0.5 rounded-full">
                  Pending saving
                </span>
              )}
            </span>

            <RenderQuantityEditor
              items={items}
              item={item}
              editing={editing}
              addActivity={addActivity}
              setItems={setItems}
              setEditing={setEditing}
            />
          </li>
        );
      })}
    </ul>
  );
}
