import { NavLink } from "react-router";

export default function BriefTasksList({ data, type }) {
  const { idGroup } = data.group;
  console.log(idGroup);

  return (
    <li
      className={`${
        type === "todo" ? "bg-cyan-950/70" : "bg-green-700/70 line-through"
      } p-1 rounded text-white text-sm`}
    >
      <NavLink to={`/group/${idGroup}/calendar`}>{data.template.name}</NavLink>
    </li>
  );
}
