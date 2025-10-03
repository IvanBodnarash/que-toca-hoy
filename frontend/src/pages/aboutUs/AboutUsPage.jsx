import { NavLink } from "react-router-dom";

import { DevCard } from "../../components/cards/DevCard";

import ivanPhoto from "../../assets/photo/ivan.jpeg";
import antonnyPhoto from "../../assets/photo/antonny.png";
import gerardPhoto from "../../assets/photo/gerard.jpeg";
import elenaPhoto from "../../assets/photo/elena.jpeg";

const teamMembers = [
  {
    image: ivanPhoto,
    name: "Ivan Bodnarash",
    position: "Frontend Developer",
    links: [
      "https://www.linkedin.com/in/ivan-bodnarash",
      "https://github.com/IvanBodnarash",
    ],
  },
  {
    image: antonnyPhoto,
    name: "Antonny Alayo Villanueva",
    position: "Backend Developer",
    links: [
      "https://www.linkedin.com/in/antonny-alayo-villanueva/",
      "https://github.com/hgaxel",
    ],
  },
  {
    image: gerardPhoto,
    name: "Gerard López Paredes",
    position: "Backend Developer",
    links: [
      "https://www.linkedin.com/in/gerard-lopez-paredes",
      "https://github.com/GerardLopezParedes",
    ],
  },
  {
    image: elenaPhoto,
    name: "Elena Molina Lopez",
    position: "Full Stack Developer",
    links: [
      "https://www.linkedin.com/in/elena-molina-lopez",
      "https://github.com/eeleeml",
    ],
  },
];

const aboutUs = [
  {
    title: "What we do",
    description:
      "We are building QueTocaHoy, a modern web application that helps people organize shared tasks within a group and plan recipes and shopping more easily.",
  },
  {
    title: "Who we are",
    description:
      "We are a team of passionate developers. Each of us brings unique skills to the table - from frontend development and design to backend engineering and product management.",
  },
  {
    title: "Our mission",
    description:
      "We believe technology should make everyday life simpler. Our mission is to create tools that save time, improve collaboration, and turn daily routines into effortless experiences.",
  },
  {
    title: "Why choose us",
    description:
      "We focus on usability, modern design, and transparency. Our goal is to deliver an intuitive, high-quality product that provides real value without unnecessary complexity.",
  },
];

export default function AboutUsPage() {
  return (
    <div className="py-8 px-8 md:px-32 bg-cyan-900 h-full md:space-y-22">
      <div className="py-4 md:py-12 hover:scale-105 m-auto transition-all w-fit">
        <NavLink
          to="/app"
          aria-label="Que Toca Hoy - Home"
          className="leading-none text-center text-yellow-100 hover:text-yellow-200 transition-all"
        >
          <p className="text-3xl md:text-5xl main-logo">QueTocaHoy</p>
          <p className="text-lg">Enter</p>
        </NavLink>
      </div>

      <div className="flex flex-row flex-wrap gap-4 py-8 md:py-12 justify-between">
        {aboutUs.map((el) => (
          <div
            key={el.title}
            className="text-yellow-50 py-4 flex flex-col gap-2 md:gap-4 md:w-[48%] bg-cyan-950/60 p-5 rounded-xl"
          >
            <h1 className="text-lg md:text-2xl font-bold">{el.title}</h1>
            <p className="text-sm md:text-lg text-yellow-50/80">
              {el.description}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-center text-yellow-50">
          Our Team
        </h1>
        <div className="flex flex-wrap justify-around gap-6 py-4">
          {teamMembers.map((member) => (
            <DevCard key={member.name} member={member} />
          ))}
        </div>
      </div>

      <div className="flex flex-col justify-center items-center gap-4 mt-8">
        <h1 className="text-2xl text-yellow-50">Contribute to our project!</h1>
        <NavLink
          className="font-mono text-center text-yellow-100 hover:text-yellow-50 hover:scale-105 transition-all"
          to="https://github.com/IvanBodnarash/que-toca-hoy"
          target="_blank"
        >
          https://github.com/IvanBodnarash/que-toca-hoy
        </NavLink>
      </div>
    </div>
  );
}
