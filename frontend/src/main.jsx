import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "../styles/main.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../styles/calendar.scss";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home.jsx";
import GroupLayout from "./layouts/GroupLayout.jsx";
import ManageTasks from "./pages/group/ManageTasks.jsx";
import GroupPage from "./pages/group/GroupPage.jsx";
import RecipesPage from "./pages/group/RecipesPage.jsx";
import CalendarPage from "./pages/group/CalendarPage.jsx";
import BuyListPage from "./pages/group/BuyListPage.jsx";
import AuthLayout from "./layouts/AuthLayout.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import RequireAuth from "./components/auth/RequireAuth.jsx";
import UserSettings from "./pages/auth/UserSettings.jsx";
import { GroupsProvider } from "./context/GroupContext.jsx";
import AboutUsPage from "./pages/aboutUs/AboutUsPage.jsx";
import NotFoundPage from "./pages/notFound/NotFoundPage.jsx";
import { AppStoreProvider } from "./state/AppStore.jsx";
import { RealtimeProvider } from "./realtime/RealtimeProvider.jsx";
import PublicLayout from "./layouts/PublicLayout.jsx";
import LandingPage from "./pages/public/LandingPage.jsx";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <AppStoreProvider>
    <RealtimeProvider>
      <BrowserRouter>
        <AuthProvider>
          <GroupsProvider>
            <Routes>
              {/* Public */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<LandingPage />} />
                <Route path="welcome" element={<LandingPage />} />
              </Route>

              {/* Auth */}
              <Route path="auth" element={<AuthLayout />}>
                <Route index element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              <Route path="aboutUs" element={<AboutUsPage />} />

              {/* App protected */}
              <Route element={<RequireAuth />}>
                <Route path="/app" element={<Home />} />
                <Route path="/app/userSettings" element={<UserSettings />} />
                <Route path="/app/group/:groupId" element={<GroupLayout />}>
                  <Route index element={<GroupPage />} />
                  <Route path="calendar" element={<CalendarPage />} />
                  <Route path="manageTasks" element={<ManageTasks />} />
                  <Route path="manageGroup" element={<GroupPage />} />
                  <Route path="recipes" element={<RecipesPage />} />
                  <Route path="buyList" element={<BuyListPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
                
                {/* Fallback */}
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </GroupsProvider>
        </AuthProvider>
      </BrowserRouter>
    </RealtimeProvider>
  </AppStoreProvider>
  // </StrictMode>
);
