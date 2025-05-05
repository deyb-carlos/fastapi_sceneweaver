import React, { useState, useEffect } from "react";

const Storyboard = () => {
  const captionNo = 32;
  const [userInput, setUserInput] = useState("");
  const [chunks, setChunks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const chunkText = (text) => {
    const chunkSize = Math.ceil(text.length / captionNo);
    const result = [];
    for (let i = 0; i < captionNo; i++) {
      const start = i * chunkSize;
      const end = start + chunkSize;
      result.push(text.slice(start, end));
    }
    return result;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    if (captionNo > 77) {
      alert("Error: Number of Captions Exceed the Limit!");
   
      return;
    }

    setChunks(chunkText(userInput));
    setCurrentIndex(0);

  };

  const handleNext = () => {
    if (currentIndex + 6 < captionNo) {
      setCurrentIndex(currentIndex + 6);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex === 0) {
      setCurrentIndex(captionNo - (captionNo % 6 || 6));
    } else {
      setCurrentIndex(currentIndex - 6);
    }
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans relative">
      {/* Sidebar - now part of document flow when open */}
      <div
        id="mySidebar"
        className={`w-[250px] h-full bg-neutral-900 pt-5 pl-6 pr-4 transition-all duration-300 z-[1001] ${
          sidebarOpen ? "fixed left-0" : "fixed -left-[250px]"
        }`}
      >
        <div className="px-6 border-b border-gray-300 text-gray-300">
          <h2 className="text-lg font-semibold">History</h2>
        </div>
        <nav className="flex flex-col gap-2 p-4 text-white">{/* Items */}</nav>
      </div>

      {/* Hamburger Menu */}
      <div
        className={`fixed top-4 left-4 z-[1002] cursor-pointer transition-all duration-300 ${
          sidebarOpen ? "left-[254px]" : "left-4"
        }`}
        onClick={toggleSidebar}
      >
        <div className="w-8 h-1 bg-black my-1 rounded transition-all"></div>
        <div className="w-8 h-1 bg-black my-1 rounded transition-all"></div>
        <div className="w-8 h-1 bg-black my-1 rounded transition-all"></div>
      </div>

      {/* Header with Storyboard Name */}
      <div
        className={`fixed top-0 h-16 bg-white border-b border-gray-200 z-[1000] flex items-center px-4 transition-all duration-300 ${
          sidebarOpen ? "left-[250px] right-0" : "left-0 right-0"
        }`}
      >
        <div className="ml-12">
          <h1 className="text-xl font-bold text-gray-800">
            Storyboard:{" "}
            <span className="text-blue-600">"The Lost Kingdom of Azuria"</span>
          </h1>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        className={`flex h-screen pt-16 transition-all duration-300 ${
          sidebarOpen ? "pl-[250px]" : "pl-0"
        }`}
      >
        {/* Left Side - Text Area (30%) */}
        <div
          className={`w-[30%] border-r border-gray-200 p-4 flex flex-col transition-all duration-300 ${
            sidebarOpen ? "ml-0" : "ml-0"
          }`}
        >
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Send a message..."
              rows={10}
              className="flex-grow resize-none p-3 bg-white border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300 text-gray-800"
            />
            <button
              type="submit"
              className="mt-4 self-end bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
            >
              Send
            </button>
          </form>
        </div>

        {/* Right Side - Output Grid (70%) */}
        <div className="w-[70%] overflow-y-auto p-8 relative bg-[radial-gradient(circle_at_center,#e5e7eb_1px,transparent_1px)] bg-[length:20px_20px]">
          {/* Dot pattern background */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,#e5e7eb_1px,transparent_1px)] bg-[length:20px_20px]"></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-0">
            {[...Array(6)].map((_, i) => {
              const chunkIndex = currentIndex + i;
              const chunk = chunks[chunkIndex];
              return (
                <div
                  key={i}
                  className={`flex flex-col ${chunk ? "" : "invisible"}`}
                >
                  {/* Square Image Container */}
                  <div className="aspect-square overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
                    {chunk && (
                      <img
                        src={`./workspace-images/image${
                          (chunkIndex % 6) + 1
                        }.jpg`}
                        alt={`Image ${(chunkIndex % 6) + 1}`}
                        className="object-cover w-full h-full"
                      />
                    )}
                  </div>
                  {/* Text Below */}
                  {chunk && (
                    <div className="mt-2 p-2 text-gray-800 font-semibold text-sm bg-white rounded-lg border border-gray-100">
                      <p>Caption {chunkIndex + 1}:</p>
                      <p className="font-normal">{chunk}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Carousel Buttons */}
      {chunks.length > 6 && (
        <>
          <button
            onClick={handlePrev}
            className={`fixed top-1/2 transform -translate-y-1/2 bg-gray-200 hover:bg-gray-300 text-xl w-10 h-10 rounded-full shadow z-10 transition-all duration-300 ${
              sidebarOpen
                ? "left-[calc(30%+250px+20px)]"
                : "left-[calc(30%+20px)]"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mx-auto"
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
          <button
            onClick={handleNext}
            className={`fixed right-4 top-1/2 transform -translate-y-1/2 bg-gray-200 hover:bg-gray-300 text-xl w-10 h-10 rounded-full shadow z-10 transition-all duration-300 ${
              sidebarOpen ? "right-4" : "right-4"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}
    </div>
  );
};

export default Storyboard;
