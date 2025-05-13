import React from "react";

const Header = ({ isSidebarOpen, storyboardName, onNavigateHome, onToggleSidebar }) => {
  return (
    <div
      className={`fixed top-0 h-16 bg-white border-b border-gray-200 z-[1000] flex items-center justify-between px-4 transition-all duration-300 ${
        isSidebarOpen ? "left-[250px] right-0" : "left-0 right-0"
      }`}
    >
      {/* Sidebar toggle button */}
      <button
        onClick={onToggleSidebar}
        className="text-gray-600 hover:text-black focus:outline-none mr-4"
        title="Toggle Sidebar"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Storyboard Name */}
      <div className="ml-2 flex-grow">
        <h1 className="text-xl font-bold text-gray-800">
          <span className="text-black text-4xl">{storyboardName}</span>
        </h1>
      </div>

      {/* Home button */}
      <button
        onClick={onNavigateHome}
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
        title="Home"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      </button>
    </div>
  );
};

export default Header;
