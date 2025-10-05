export function startOfDayLocal(d) {
  const x = new Date(d);
  return new Date(x.getFullYear(), x.getMonth(), x.getDate(), 0, 0, 0, 0);
}

export function endOfDayLocal(d) {
  const x = new Date(d);
  return new Date(x.getFullYear(), x.getMonth(), x.getDate(), 23, 59, 0, 0);
}

export function toLocalInputString(d) {
  const x = new Date(d);
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = x.getFullYear();
  const mm = pad(x.getMonth() + 1);
  const dd = pad(x.getDate());
  const hh = pad(x.getHours());
  const mi = pad(x.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export function toUtcIsoPreserveLocalFields(d) {
  const x = new Date(d); // d: "YYYY-MM-DDTHH:mm"
  return new Date(
    Date.UTC(
      x.getFullYear(),
      x.getMonth(),
      x.getDate(),
      x.getHours(),
      x.getMinutes(),
      x.getSeconds(),
      x.getMilliseconds()
    )
  ).toISOString(); // '...Z'
}

export function toUtcIsoAllDayRange(localStart) {
  const s = new Date(localStart); // 00:00 locally
  const startUtc = new Date(
    Date.UTC(s.getFullYear(), s.getMonth(), s.getDate(), 0, 0, 0, 0)
  );
  const endUtc = new Date(
    Date.UTC(s.getFullYear(), s.getMonth(), s.getDate() + 1, 0, 0, 0, 0)
  );
  return { startIso: startUtc.toISOString(), endIso: endUtc.toISOString() };
}
