export default function FilterButton({ onClick, children, active }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-4 py-1 rounded-lg font-medium transition cursor-pointer ${
        active
          ? "bg-cyan-800 text-white shadow"
          : "text-cyan-800 hover:bg-slate-400/50"
      }`}
    >
      {children}
    </button>
  );
}
