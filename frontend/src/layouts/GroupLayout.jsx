import { Outlet } from "react-router-dom";
import MobileNavigation from "../components/navigation/MobileNavigation";
import GroupHeader from "../components/groups/GroupHeader";

export default function GroupLayout() {
  return (
    <>
      <GroupHeader />
      <Outlet />
      <MobileNavigation />
    </>
  );
}
