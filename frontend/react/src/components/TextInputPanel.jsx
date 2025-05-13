import React from "react";

const TextInputPanel = ({
  isCollapsed,
  onToggle,
  userInput,
  setUserInput,
  resolution,
  setResolution,
  isGenerating,
  onSubmit,
}) => {
  return (
    <div
      className={`${
        isCollapsed ? "hidden" : "w-[30%]"
      } border-r border-gray-200 p-4 flex flex-col transition-all duration-300`}
    >
      <button
        onClick={onToggle}
        className="self-end mb-2 p-1 text-gray-500 hover:text-gray-700"
        title="Collapse panel"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <form onSubmit={onSubmit} className="flex flex-col h-full">
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Enter your story to generate storyboard..."
          rows={10}
          className="flex-grow resize-none p-3 bg-white border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300 text-gray-800"
        />
        <div className="mt-4 mb-7 flex justify-between items-center">
          <div className="flex gap-3">
            <ResolutionOption
              value="1:1"
              currentValue={resolution}
              onChange={setResolution}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-5 h-5"
                >
                  <rect x="5" y="5" width="15" height="15" />
                </svg>
              }
            />
            <ResolutionOption
              value="16:9"
              currentValue={resolution}
              onChange={setResolution}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-5 h-3.5"
                >
                  <rect x="0" y="4" width="25" height="16" />
                </svg>
              }
            />
            <ResolutionOption
              value="9:16"
              currentValue={resolution}
              onChange={setResolution}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-3.5 h-5"
                >
                  <rect x="4" y="0" width="16" height="25" />
                </svg>
              }
            />
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="bg-black hover:bg-gray-500 px-4 py-2 rounded-lg cursor-pointer text-white hover:text-gray-700 disabled:bg-gray-400"
          >
            {isGenerating ? "Generating..." : "Generate"}
          </button>
        </div>
      </form>
    </div>
  );
};

const ResolutionOption = ({ value, currentValue, onChange, icon }) => {
  return (
    <label className="relative group">
      <input
        type="radio"
        name="resolution"
        value={value}
        checked={currentValue === value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute opacity-0 w-0 h-0"
      />
      <div
        className={`w-10 h-10 rounded-lg cursor-pointer flex items-center justify-center transition-all ${
          currentValue === value ? "bg-gray-300" : "bg-gray-100 hover:bg-gray-200"
        }`}
      >
        {React.cloneElement(icon, {
          className: `${icon.props.className} ${
            currentValue === value ? "text-black" : "text-gray-600"
          }`,
        })}
        <span className="absolute -bottom-8 scale-0 rounded bg-gray-800 p-1 text-xs text-white group-hover:scale-100 transition-transform">
          {value}
        </span>
      </div>
    </label>
  );
};

export default TextInputPanel;