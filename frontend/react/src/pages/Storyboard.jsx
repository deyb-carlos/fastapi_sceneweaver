import React, { useState,useRef, useEffect } from "react";

const Storyboard = () => {
  const captionNo = 32;
  const [userInput, setUserInput] = useState("");
  const [chunks, setChunks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const textareaRef = useRef(null);
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
      setUserInput("");
      return;
    }

    setChunks(chunkText(userInput));
    setCurrentIndex(0);
    setUserInput("");
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
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // reset first
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [userInput]);
  return (
    <div className="min-h-screen bg-white font-sans relative">
      {/* Sidebar */}
      <div
        id="mySidebar"
        className={`fixed top-0 left-0 w-[250px] h-full bg-neutral-900 pt-5 pl-6 pr-4 transition-all duration-300 z-[1001] ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 border-b border-gray-300 text-gray-300">
          <h2 className="text-lg font-semibold">History</h2>
        </div>
        <nav className="flex flex-col gap-2 p-4 text-white">{/* Items */}</nav>
      </div>

      {/* Hamburger Menu */}
      <div
        className="fixed top-4 left-4 z-[1002] cursor-pointer"
        onClick={toggleSidebar}
      >
        <div className="w-8 h-1 bg-black my-1 rounded transition-all"></div>
        <div className="w-8 h-1 bg-black my-1 rounded transition-all"></div>
        <div className="w-8 h-1 bg-black my-1 rounded transition-all"></div>
      </div>

      {/* Output Grid */}
      <div className="pt-20 px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[...Array(6)].map((_, i) => {
            const chunkIndex = currentIndex + i;
            const chunk = chunks[chunkIndex];
            return (
              <div
                key={i}
                className={`rounded-xl border border-gray-200 shadow-sm overflow-hidden ${
                  chunk ? "" : "invisible"
                }`}
              >
                {chunk && (
                  <>
                    <img
                      src={`./workspace-images/image${
                        (chunkIndex % 6) + 1
                      }.jpg`}
                      alt={`Image ${(chunkIndex % 6) + 1}`}
                      className="object-cover w-full h-[30vh]"
                    />
                    <div className="p-4 text-gray-800 font-semibold">
                      Caption {chunkIndex + 1}: {chunk}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Carousel Buttons */}
      {chunks.length > 6 && (
        <>
          <button
            onClick={handlePrev}
            className="fixed left-4 top-1/2 transform -translate-y-1/2 bg-gray-200 hover:bg-gray-300 text-xl w-10 h-10 rounded-full shadow z-10"
          >
            &lt;
          </button>
          <button
            onClick={handleNext}
            className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-gray-200 hover:bg-gray-300 text-xl w-10 h-10 rounded-full shadow z-10"
          >
            &gt;
          </button>
        </>
      )}

      {/* Chat Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto flex items-end relative"
        >
          <textarea
            ref={textareaRef}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Send a message..."
            className="flex-grow resize-none overflow-hidden p-3 pr-12 bg-white border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300 text-gray-800 max-h-60"
            rows={1}
          />

          <button
            type="submit"
            className="absolute right-4 bottom-3 text-gray-600 hover:text-black transition-colors"
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
                d="M5 12h14M12 5l7 7-7 7"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Storyboard;
