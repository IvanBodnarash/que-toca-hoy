export const initialGroups = [
  {
    id: "123",
    name: "Family",
    description: "Family Todos",
    periodicity: "Weekly",
    members: [
      { userId: "654", role: "admin" },
      { userId: "515", role: "user" },
    ],
    invitations: [
      {
        email: "test@example.com",
        role: "user",
        pin: "123456",
        token: "abc-uuid",
        link: "http://localhost:5173/join?token=abc-uuid",
      },
    ],
  },
  {
    id: "456",
    name: "Friends",
    description: "Friends Todos",
    periodicity: "Monthly",
    members: [
      { userId: "654", role: "admin" },
      { userId: "454", role: "user" },
    ],
    invitations: [
      {
        email: "test2@example.com",
        role: "user",
        pin: "654321",
        token: "def-uuid",
        link: "http://localhost:5173/join?token=def-uuid",
      },
    ],
  },
];
