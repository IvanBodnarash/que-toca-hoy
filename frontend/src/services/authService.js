import { apiGet, apiPost, setToken } from "../api/apiFetch";

export async function login(identifier, password) {
  const data = await apiPost("/auth/login", { username: identifier, password });
  setToken(data.token);
  return data; // { token, user }
}

export async function register(name, email, username, password, image, color) {
  const data = await apiPost("/auth/register", {
    name,
    email,
    username,
    password,
    image,
    color,
  });
  setToken(data.token);
  return data; // { token, user }
}

export async function me() {
  return apiGet("/auth/profile"); // { message, user }
}

export async function logout() {
  await apiPost("/auth/logout");
  setToken(null);
}
