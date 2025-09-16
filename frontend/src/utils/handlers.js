import { http, HttpResponse } from "msw";
import { users } from "../mock_data/users";

export const handlers = () => [
  http.get("/api/auth/me", () => HttpResponse.json(users[0])),
  http.post("/api/auth/login", async ({ request }) => {
    const { email, password } = await request.json();
    const found = users.find(
      (user) => user.email === email && user.password === password
    );
    return found
      ? HttpResponse.json({ accessToken: "mock_access", user: found })
      : new HttpResponse("Invalid credentials", { status: 401 });
  }),
  http.post("/api/auth/logout", () => HttpResponse.json({ ok: true })),
];
