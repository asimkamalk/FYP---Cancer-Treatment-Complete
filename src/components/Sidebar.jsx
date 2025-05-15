import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { sun } from "../assets";
import { navlinks } from "../constants";
import { IconHeartHandshake, IconMoon } from "@tabler/icons-react";

const Icon = ({ styles, name, imgUrl, isActive, disabled, handleClick }) => (
  <div
    className={`h-[48px] w-[48px] rounded-[10px] ${
      isActive && isActive === name && "bg-[#2c2f32]"
    } flex items-center justify-center ${
      !disabled && "cursor-pointer hover:bg-[#2c2f32]"
    } ${styles}`}
    onClick={handleClick}
  >
    {!isActive ? (
      <img 
        src={imgUrl} 
        alt="fund_logo" 
        className="h-6 w-6 opacity-100" 
      />
    ) : (
      <img
        src={imgUrl}
        alt="fund_logo"
        className={`h-6 w-6 ${
          isActive !== name ? "opacity-70" : "opacity-100"
        }`}
      />
    )}
  </div>
);

const Sidebar = () => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState("dashboard");
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check if dark mode is enabled in localStorage
    const darkMode = localStorage.getItem("darkMode") === "true";
    setIsDark(darkMode);
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("darkMode", !isDark);
  };

  return (
    <div className="sticky top-5 flex h-[93vh] flex-col items-center justify-between">
      <Link to="/">
        <div className="rounded-[10px] bg-[#2c2f32] p-2">
          <IconHeartHandshake size={40} color="#1ec070" className=" " />
        </div>
      </Link>

      <div className="mt-12 flex w-[76px] flex-1 flex-col items-center justify-between rounded-[20px] bg-[#1c1c24] py-4">
        <div className="flex flex-col items-center justify-center gap-3">
          {navlinks.map((link) => (
            <Icon
              key={link.name}
              {...link}
              isActive={isActive}
              handleClick={() => {
                if (!link.disabled) {
                  setIsActive(link.name);
                  navigate(link.link);
                }
              }}
            />
          ))}
        </div>

        <button
          onClick={toggleTheme}
          className="flex h-[48px] w-[48px] cursor-pointer items-center justify-center rounded-[10px] bg-[#1c1c24] hover:bg-[#2c2f32]"
        >
          {isDark ? (
            <img src={sun} alt="light_mode" className="h-6 w-6 opacity-100" />
          ) : (
            <IconMoon className="h-6 w-6 text-white" />
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
