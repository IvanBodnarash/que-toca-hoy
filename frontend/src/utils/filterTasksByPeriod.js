export const filterTasksByPeriod = (tasks, period) => {
  const now = new Date();
  return tasks.filter((t) => {
    if (!t?.startDate || !t?.endDate) return false;
    const start = new Date(t.startDate);
    const end = new Date(t.endDate);

    switch (period) {
      case "day":
        return now >= start && now <= end;
      case "week": {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return end >= startOfWeek && start <= endOfWeek;
      }
      case "month": {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return end >= monthStart && start <= monthEnd;
      }
      default:
        return true;
    }
  });
};
