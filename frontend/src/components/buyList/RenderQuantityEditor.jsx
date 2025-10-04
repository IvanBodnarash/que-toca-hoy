import toast from "react-hot-toast";
import { MdCancel } from "react-icons/md";

export default function RenderQuantityEditor({
  items,
  item,
  editing,
  addActivity,
  setItems,
  setEditing,
}) {
  const isEditing = editing === item.idBuyList;

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

  return (
    <>
      {!isEditing ? (
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
      ) : (
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
              handleQuantityChange(item.idBuyList, next);
              setEditing(null);
              if (next !== item.quantity) {
                toast.success(`Quantity updated to ${next} ${item.unit || ""}`);
              }
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
      )}
    </>
  );
}
