import React from "react";

const Sidebar = ({ isOpen, onToggle }) => {
  return (
    <div
      id="mySidebar"
      className={`w-[250px] h-full bg-neutral-900 transition-all duration-300 z-[1001] ${
        isOpen ? "fixed left-0" : "fixed -left-[250px]"
      }`}
    >
      <div className="flex justify-center items-center py-6 px-4">
        <img src="/sw-logo.png" alt="SceneWeaver Logo" className="h-16 w-auto" />
      </div>

      <div className="px-6 pt-2 text-gray-300">
        <h2 className="text-lg font-semibold">Storyboards</h2>
      </div>

      <nav className="flex flex-col gap-2 p-4 text-white">
        <div className="p-2 hover:bg-gray-700 rounded cursor-pointer">
          Previous Storyboard 1
        </div>
        <div className="p-2 hover:bg-gray-700 rounded cursor-pointer">
          Previous Storyboard 2
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;