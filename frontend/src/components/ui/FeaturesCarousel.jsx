import { Carousel } from "flowbite-react";
import { SiGoogletasks } from "react-icons/si";
import { LuCalendarClock } from "react-icons/lu";
import { TiShoppingCart } from "react-icons/ti";
import { GiHotMeal } from "react-icons/gi";

import calendarScreen from "../../assets/screenshots/calendar.png";
import calendarModalScreen from "../../assets/screenshots/calendar-rotative-frequent.png";
import recipesScreen from "../../assets/screenshots/recipe-page.png";
import buylistScreen from "../../assets/screenshots/buy-list.png";
import { carouselThemeConfig } from "../../utils/carouselTheme";
import { useState } from "react";

export default function FeaturesCarousel() {
  // Slides data
  const slides = [
    {
      img: calendarScreen,
      icon: LuCalendarClock,
      title: "Tasks planner",
      subtitle: "Plan meals & chores on a shared calendar.",
    },
    {
      img: calendarModalScreen,
      icon: SiGoogletasks,
      title: "Rotating chores",
      subtitle: "Assign, rotate, track completion.",
    },
    {
      img: recipesScreen,
      icon: GiHotMeal,
      title: "Recipe templates",
      subtitle: "Steps + ingredients in one place.",
    },
    {
      img: buylistScreen,
      icon: TiShoppingCart,
      title: "Smart buy list",
      subtitle: "Auto-aggregated quantities by period.",
    },
  ];

  const [active, setActive] = useState(0);
  const ActiveIcon = slides[active].icon;

  return (
    <div className="relative h-56 sm:h-64 xl:h-80 2xl:h-96 mt-18 md:mt-0">
      <Carousel
        slide
        loop
        slideInterval={2800}
        theme={carouselThemeConfig}
        className="shadow-xl rounded-xl border border-slate-400"
        onSlideChange={(i) => setActive(i)}
      >
        {slides.map(({ img, title }) => (
          <div key={title} className="relative h-full w-full">
            {/* Background screenshot */}
            <img
              src={img}
              alt={title}
              className="h-full w-full object-cover"
              loading="lazy"
            />

            {/* Gradient for contrast */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-transparent" />
          </div>
        ))}
      </Carousel>

      {/* Card-overlay */}
      <div className="lg:min-w-96 absolute -bottom-1 -right-1 lg:-bottom-6 lg:-right-6">
        <div
          key={active}
          className="animate-fade-up flex items-start gap-3 rounded-xl border border-slate-200 bg-white/85 p-3 sm:p-4 shadow-lg backdrop-blur-sm"
        >
          <ActiveIcon className="shrink-0 text-cyan-900" size={28} />
          <div>
            <div className="font-semibold text-cyan-900">
              {slides[active].title}
            </div>
            <div className="text-xs sm:text-sm text-slate-600">
              {slides[active].subtitle}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
