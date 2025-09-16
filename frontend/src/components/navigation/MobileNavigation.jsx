import { LuCalendarFold } from "react-icons/lu";
import { LuClipboardList } from "react-icons/lu";
import { GrGroup } from "react-icons/gr";
import { PiForkKnifeBold } from "react-icons/pi";
import { BiCartAlt } from "react-icons/bi";
import MobileNavItem from "./MobileNavItem";

export default function MobileNavigation() {
  return (
    <div className="fixed bottom-0 w-full py-3 bg-cyan-800 border-t border-white/10">
      <div className="flex flex-row items-center justify-center gap-2 text-white transition-all">
        <MobileNavItem path="manageGroup">
          <GrGroup className="size-9" />
        </MobileNavItem>
        <MobileNavItem path="buyList">
          <BiCartAlt className="size-10" />
        </MobileNavItem>
        <MobileNavItem path="calendar">
          <LuCalendarFold className="size-9" />
        </MobileNavItem>
        <MobileNavItem path="manageTasks">
          <LuClipboardList className="size-9" />
        </MobileNavItem>
        <MobileNavItem path="recipes">
          <PiForkKnifeBold className="size-9" />
        </MobileNavItem>
      </div>
    </div>
  );
}
