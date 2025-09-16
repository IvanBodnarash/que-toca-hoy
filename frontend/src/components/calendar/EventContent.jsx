export default function EventContent({ event }) {
  const done = event.user?.idUser
    ? event.userTaskStatus === "done"
    : event.status === "done";

  const title = `${event.title}${
    event.user?.username ? ` — @${event.user.username}` : ""
  }`;

  return <span className={done ? "line-through" : ""}>{title}</span>;
}
