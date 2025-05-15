import React, { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { Sidebar, Navbar } from "./components";
import { Home, Profile, Onboarding } from "./pages";
import MedicalRecords from "./pages/records/index";
import ScreeningSchedule from "./pages/ScreeningSchedule";
import SingleRecordDetails from "./pages/records/single-record-details";
import { useStateContext } from "./context";

const App = () => {
  const { user, authenticated, ready, login, currentUser } = useStateContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && !authenticated) {
      login();
    } else if (user && !currentUser) {
      navigate("/onboarding");
    }
  }, [user, authenticated, ready, login, currentUser, navigate]);

  // Initialize theme from localStorage
  useEffect(() => {
    const darkMode = localStorage.getItem("darkMode") === "true";
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <div className="sm:-8 relative flex min-h-screen flex-row bg-white p-4 transition-colors duration-200 dark:bg-[#13131a]">
      <div className="relative mr-10 hidden sm:flex">
        <Sidebar />
      </div>

      <div className="mx-auto max-w-[1280px] flex-1 max-sm:w-full sm:pr-5 text-gray-800 dark:text-white">
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/medical-records" element={<MedicalRecords />} />
          <Route
            path="/medical-records/:id"
            element={<SingleRecordDetails />}
          />
          <Route path="/screening-schedules" element={<ScreeningSchedule />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
