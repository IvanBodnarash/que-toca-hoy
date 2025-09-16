export const toDate = (ymd, hm = "00:00") => {
  const [y, m, d] = ymd.split("-").map(Number);
  const [hh, mm] = hm.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm);
};

export const toCalendarEvent = (task) => ({
  id: task.id,
  title: task.title,
  start: toDate(task.date, task.start),
  end: toDate(task.date, task.end),
  resource: { groupId: task.groupId },
});

export function toDateOnly(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Calcula el rango de fechas según filtro: today | week | month
export function getDateRange(filter) {
  const now = new Date();
  let startDate, endDate;

  if (filter === "today" || filter === "day") {
    startDate = toDateOnly(now);
    endDate = toDateOnly(now);
    endDate.setHours(23, 59, 59, 999);
  } else if (filter === "week") {
    // lunes de esta semana
    startDate = toDateOnly(
      new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1)
      )
    );
    // domingo
    endDate = toDateOnly(new Date(startDate));
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
  } else if (filter === "month") {
    startDate = toDateOnly(new Date(now.getFullYear(), now.getMonth(), 1));
    endDate = toDateOnly(new Date(now.getFullYear(), now.getMonth() + 1, 0));
    endDate.setHours(23, 59, 59, 999);
  } else {
    throw new Error("Filtro inválido. Usa: today, week o month");
  }

  //console.log(startDate, endDate);

  return { startDate, endDate };
}
