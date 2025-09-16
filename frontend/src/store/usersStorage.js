const LOCALSTORAGE_USERS_KEY = "users_state";

export function loadUsers() {
  try {
    const raw = localStorage.getItem(LOCALSTORAGE_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveUsers(users) {
  localStorage.setItem(LOCALSTORAGE_USERS_KEY, JSON.stringify(users));
}

export function upsertUser(user) {
  const users = loadUsers();
  const idx = users.findIndex(
    (u) => u.id === user.id || u.idUser === user.idUser
  );
  const normalized = {
    id: user.id ?? user.idUser, // id in front idUser in back
    idUser: user.idUser ?? user.id,
    name: user.name ?? "",
    email: user.email ?? "",
    username: user.username ?? user.name ?? "",
    image: user.image ?? "",
  };
  if (idx >= 0) users[idx] = { ...users[idx], ...normalized };
  else users.push(normalized);
  saveUsers(users);
  return normalized;
}
