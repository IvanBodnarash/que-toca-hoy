export default function DateCellTapWrapper({
  value,
  setSelectedData,
  setDayOpen,
  children,
}) {
  const handleTap = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedData(new Date(value));
    setDayOpen(true);
  };
  return (
    <div onClick={handleTap} onTouchEnd={handleTap}>
      {children}
    </div>
  );
}
