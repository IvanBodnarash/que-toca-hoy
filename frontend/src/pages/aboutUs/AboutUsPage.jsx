import { NavLink } from "react-router-dom";

import { DevCard } from "../../components/cards/DevCard";

import ivanPhoto from "../../assets/photo/ivan.jpeg";
import antonnyPhoto from "../../assets/photo/antonny.png";
import gerardPhoto from "../../assets/photo/gerard.jpeg";
import elenaPhoto from "../../assets/photo/elena.jpeg";

import { FaArrowCircleRight, FaArrowCircleLeft } from "react-icons/fa";

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
    title: "Why we built it",
    description: (
      <div>
        <h1 className="text-lg/tight md:text-3xl border-b-3 md:border-b-8 border-dotted border-yellow-50/30 pb-2 md:pb-4 font-semibold mb-2">
          Living with several roommates can be fun but also chaotic.
        </h1>
        <p className="opacity-90 md:leading-8 leading-5">
          Keeping track of <strong>chores, planning meals,</strong> and
          <strong> organizing shopping lists</strong> often turns into a{" "}
          <strong>mess</strong>. <br /> We built <strong>QueTocaHoy</strong> to
          make all of that easier -{" "}
          <strong>helping people share responsibilities</strong> <br /> and stay
          on top of <strong>daily life together</strong>.
        </p>
      </div>
    ),
  },
  {
    title: "What inspired us",
    description: (
      <div>
        <h1 className="text-lg/tight md:text-3xl border-b-3 md:border-b-8 border-dotted border-yellow-50/30 pb-2 md:pb-4 font-semibold mb-2">
          Life moves fast, and planning takes time.
        </h1>
        <p className="opacity-90 md:leading-8 leading-5">
          We wanted a <strong>simple, modern tool</strong> that helps people
          <strong>organize everything</strong> in one place. <br /> From
          <strong>groceries</strong> to <strong>recipes</strong> - so everyone
          can <strong>save time</strong> and focus on the{" "}
          <strong>good stuff</strong>.
        </p>
      </div>
    ),
  },
  {
    title: "What’s inside",
    description: (
      <div>
        <h1 className="text-lg/tight md:text-3xl border-b-3 md:border-b-8 border-dotted border-yellow-50/30 pb-2 md:pb-4 font-semibold mb-2">
          QueTocaHoy connects with our other project.
        </h1>
        <p className="opacity-90 md:leading-8 leading-5">
          <NavLink
            to="https://the-recipe-compass.web.app/"
            target="_blank"
            className="underline text-cyan-100 hover:text-cyan-300 italic"
          >
            The Recipe Compass
          </NavLink>{" "}
          uses <strong>Firebase</strong> and lets you choose{" "}
          <strong>recipes</strong> directly from there. <br />
          It brings{" "}
          <strong>
            meal ideas, task tracking, and shopping management
          </strong>{" "}
          together in one smooth experience.
        </p>
      </div>
    ),
  },
  {
    title: "How we built it",
    description: (
      <div>
        <h1 className="text-lg/tight md:text-3xl border-b-3 md:border-b-8 border-dotted border-yellow-50/30 pb-2 md:pb-4 font-semibold mb-2">
          We used the technologies we learned during our bootcamp
        </h1>
        <p className="opacity-90 md:leading-8 leading-5">
          <strong>MySQL, Sequelize, Node.js, Express, React, Vite,</strong> and
          <strong>TailwindCSS.</strong> <br /> For deployment, we went with
          <strong>Render, Neon (PostgreSQL),</strong> and{" "}
          <strong>Vercel</strong>. <br /> The app also includes{" "}
          <strong>JWT authentication, cookies,</strong> and global state
          management with <strong>Context API</strong>.
        </p>
      </div>
    ),
  },
  {
    title: "Join us",
    description: (
      <div>
        <h1 className="text-lg/tight md:text-3xl border-b-3 md:border-b-8 border-dotted border-yellow-50/30 pb-2 md:pb-4 font-semibold mb-2">
          QueTocaHoy is still an MVP
        </h1>
        <p className="opacity-90 md:leading-8 leading-5">
          {" "}
          Our <strong>first</strong> working version - built for{" "}
          <strong>learning and sharing.</strong> <br /> There’s a lot more to
          come, and we’d love to see <strong>others contribute.</strong> <br />
          Check out the{" "}
          <a
            href="#repo"
            className="underline text-cyan-100 hover:text-cyan-300 italic"
          >
            link below
          </a>{" "}
          if you want to be part of it!
        </p>
      </div>
    ),
  },
];

export default function AboutUsPage() {
  return (
    <div className="bg-cyan-900 h-full">
      <header className="py-4 px-8 md:py-5 md:px-54  backdrop-blur bg-cyan-950/80 fixed flex justify-between shadow-xl items-center z-50 w-full">
        <span
          to="/app"
          aria-label="Que Toca Hoy - Home"
          className="leading-none text-yellow-50 hover:text-yellow-200 transition-all cursor-pointer"
        >
          <p className="text-xl md:text-3xl main-logo">QueTocaHoy</p>
        </span>

        <NavLink
          to="/app"
          aria-label="Que Toca Hoy - Home"
          className="leading-none bg-cyan-800 p-2 px-4 rounded-lg border shadow-2xl border-white/20 text-yellow-50 hover:bg-cyan-900 backdrop-blur-lg transition-all"
        >
          Go to App
        </NavLink>
      </header>

      <div className="py-8 px-4 md:px-54 md:space-y-22">
        <section className="relative flex flex-row flex-wrap gap-4 py-8 md:py-12 md:space-y-14 mt-4 md:mt-18 justify-between">
          {/* Vertical Line */}
          <div className="absolute top-48 bottom-22 right-1/4 md:left-1/2 md:-translate-x-1/2 w-px bg-white/20" />

          {aboutUs.map((el, index) => {
            const alignRigt = index % 2 !== 0;
            const cardClasses = `text-yellow-50 p-4 md:p-5 md:space-y-3 flex flex-col gap-2 md:gap-8 rounded-xl w-fit ${
              alignRigt
                ? "ml-auto md:items-end md:text-right md:text-right md:translate-y-6"
                : "mr-auto md:items-start md:text-left md:text-left"
            }`;

            const bodyClasses = `text-xs md:text-xl md:leading-8 bg-cyan-900 z-10 border border-white/20 shadow-xl rounded-3xl p-4 md:p-8 text-yellow-50/80 ${
              alignRigt ? "md:text-right" : "md:text-left"
            }`;

            return (
              <div key={el.title} className={cardClasses}>
                <h1
                  className={`text-xl md:text-6xl font-bold text-shadow-lg ${
                    alignRigt ? "md:pr-8" : "md:pl-8"
                  }`}
                >
                  {el.title}
                </h1>
                <div className={bodyClasses}>{el.description}</div>
              </div>
            );
          })}
        </section>

        <section className="flex flex-col gap-4">
          <h1 className="text-3xl md:text-6xl font-bold text-shadow-lg text-center md:mb-8 text-yellow-50">
            Our Team
          </h1>
          <div className="flex flex-wrap justify-around gap-6 py-4">
            {teamMembers.map((member) => (
              <DevCard key={member.name} member={member} />
            ))}
          </div>
        </section>

        <footer
          id="repo"
          className="flex flex-col justify-center items-center gap-4 mt-8"
        >
          <h1 className="text-2xl text-yellow-50">
            Contribute to our project!
          </h1>
          <div className="flex items-center gap-4 text-center text-yellow-100 hover:text-yellow-50 hover:scale-105 underline transition-all">
            <FaArrowCircleRight />
            <NavLink
              className="font-mono"
              to="https://github.com/IvanBodnarash/que-toca-hoy"
              target="_blank"
            >
              github.com repo
            </NavLink>
            <FaArrowCircleLeft />
          </div>
          <span className="text-slate-300">© {new Date().getFullYear()} </span>
        </footer>
      </div>
    </div>
  );
}
