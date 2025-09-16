import { NavLink } from "react-router-dom";

import { GrLinkedin } from "react-icons/gr";
import { FaGithub } from "react-icons/fa";

export function DevCard({ member }) {
  return (
    <div className="border-2 border-yellow-50 w-fit min-h-84 rounded-xl p-4 shadow-xl hover:scale-102 transition-all cursor-pointer">
      <div className="flex flex-col h-full justify-between gap-2">
        <div>
          <img
            src={member.image}
            alt={member.name}
            className="object-cover h-58 w-64 rounded-xl"
          />
          <h1 className="text-3xl text-yellow-50 font-bold w-54 mt-2">
            {member.name}
          </h1>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-yellow-50 text-xl">{member.position}</h1>
          <div className="flex flex-col gap-1 text-yellow-50">
            <NavLink
              to={member.links[0]}
              target="_blank"
              className="hover:text-yellow-100 transition-all"
            >
              <span className="flex flex-row items-center gap-2">
                <GrLinkedin /> LinkedIn
              </span>
            </NavLink>
            <NavLink
              to={member.links[1]}
              target="_blank"
              className="hover:text-yellow-100 transition-all"
            >
              <span className="flex flex-row items-center gap-2">
                <FaGithub /> GitHub
              </span>
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}
