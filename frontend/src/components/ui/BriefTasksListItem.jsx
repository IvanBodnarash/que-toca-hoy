import { useMemo } from "react";
import { useNavigate } from "react-router";
import { BiCartAlt } from "react-icons/bi";

export default function BriefTasksList({ data, type }) {
  const navigate = useNavigate();
  const { idGroup } = data.group || {};
  const isRecipe = data.template.type === "recipe";
  const pendingCount = useMemo(() => {
    const list = Array.isArray(data.buyLists) ? data.buyLists : [];
    return list.filter((b) => Number(b.quantity || 0) > 0).length;
  }, [data]);

  const handleClick = (e) => {
    e?.preventDefault?.();
    if (isRecipe && pendingCount > 0) {
      navigate(`/group/${idGroup}/buyList?task=${data.idTaskDated}`);
    } else {
      navigate(`/group/${idGroup}/calendar`);
    }
  };

  return (
    <li
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleClick(e);
      }}
      tabIndex={0}
      className={`${
        type === "todo"
          ? "bg-cyan-950/70 hover:bg-cyan-800"
          : "bg-green-700/70 hover:bg-green-600 line-through"
      } p-1 rounded text-white text-sm cursor-pointer flex items-center justify-between transition-all ${
        isRecipe && pendingCount > 0 ? "ring-2 ring-cyan-700 ring-offset-1" : ""
      }`}
      title={isRecipe && pendingCount > 0 ? "Open buy list" : "Open calendar"}
    >
      <span className="truncate flex items-center gap-1">
        {data.template.name || "Task"}
        {isRecipe && pendingCount > 0 && <BiCartAlt className="opacity-80" />}
      </span>
      {isRecipe && pendingCount > 0 && (
        <span className="ml-2 shrink-0 px-1.5 py-0.5 rounded bg-blue-600/80 text-[11px] font-semibold">
          {pendingCount}
        </span>
      )}
    </li>
  );
}
