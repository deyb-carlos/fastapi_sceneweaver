import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { imagesAPI } from "../api"; // Adjust the path if necessary

const Storyboard = () => {
  const navigate = useNavigate();
  const { id, name } = useParams(); // Use params directly
  const [userInput, setUserInput] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resolution, setResolution] = useState("1:1");
  const [storyboardImages, setStoryboardImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      setError(null); // Reset any previous errors

      try {
        console.log("Fetching images for storyboardId:", id); // Debugging line

        // Fetch images for a given storyboard by its ID
        const response = await imagesAPI.getImages(id);

        console.log("API Response:", response); // Log the full response to inspect its structure

        // Assuming the response is wrapped in a "data" field
        if (response.data && Array.isArray(response.data)) {
          setStoryboardImages(response.data); // Set the images array from the response
        } else {
          console.error("Invalid response structure or no images found.");
          setError("No images found.");
        }
      } catch (err) {
        console.error("Error fetching images:", err);
        setError("Failed to fetch images");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchImages(); // Fetch images only if storyboardId is provided
    }
  }, [id]); // Only depend on `id` now, not `name`
  // Only depend on `id` now, not `name`
  useEffect(() => {
    if (selectedImage) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [selectedImage]);
  const handleGenerateImages = async (e) => {
    e.preventDefault();

    if (!userInput.trim()) return;

    try {
      setIsGenerating(true);

      const formData = new FormData();
      formData.append("story", userInput);
      formData.append("resolution", resolution);

      await imagesAPI.generateImages(id, formData);
      alert("Image generation started!");

      // Start polling for new images
      const previousImageCount = storyboardImages.length;
      const pollInterval = 3000; // 3 seconds
      const maxAttempts = 20; // stop after ~1 minute
      let attempts = 0;

      const pollForNewImages = async () => {
        try {
          const response = await imagesAPI.getImages(id);
          if (response.data && Array.isArray(response.data)) {
            if (response.data.length > previousImageCount) {
              setStoryboardImages(response.data);
              console.log("New image(s) detected. Polling stopped.");
              return;
            }
          }
        } catch (err) {
          console.error("Error polling for new images:", err);
        }

        if (++attempts < maxAttempts) {
          setTimeout(pollForNewImages, pollInterval);
        } else {
          console.warn("Polling timed out.");
        }
      };

      pollForNewImages(); // Start polling
    } catch (error) {
      console.error("Error generating images:", error);
      alert("Failed to start image generation. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNext = () => {
    if (currentIndex + 6 < storyboardImages.length) {
      setCurrentIndex(currentIndex + 6);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex === 0) {
      setCurrentIndex(
        storyboardImages.length - (storyboardImages.length % 6 || 6)
      );
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
      <div
        id="mySidebar"
        className={`w-[250px] h-full bg-neutral-900 transition-all duration-300 z-[1001] ${
          sidebarOpen ? "fixed left-0" : "fixed -left-[250px]"
        }`}
      >
        {/* Logo container - centered with no border */}
        <div className="flex justify-center items-center py-6 px-4">
          <img
            src="/sw-logo.png"
            alt="SceneWeaver Logo"
            className="h-16 w-auto"
          />
        </div>

        {/* History section without border */}
        <div className="px-6 pt-2 text-gray-300">
          <h2 className="text-lg font-semibold">Storyboards</h2>
        </div>

        <nav className="flex flex-col gap-2 p-4 text-white">
          {/* History items would go here */}
          <div className="p-2 hover:bg-gray-700 rounded cursor-pointer">
            Previous Storyboard 1
          </div>
          <div className="p-2 hover:bg-gray-700 rounded cursor-pointer">
            Previous Storyboard 2
          </div>
        </nav>
      </div>

      {/* Hamburger Menu */}
      <div
        className={`fixed top-4 left-4 z-[1002] cursor-pointer transition-all duration-300 hover:bg-gray-300  ${
          sidebarOpen ? "left-[270px]" : "left-4"
        }`}
        onClick={toggleSidebar}
      >
        <img
          src="https://sceneweaver.s3.ap-southeast-2.amazonaws.com/assets/menu.png"
          alt="Menu"
          className="w-8 h-8"
        />
      </div>

      {/* Header with Storyboard Name and Home Button */}
      <div
        className={`fixed top-0 h-16 bg-white border-b border-gray-200 z-[1000] flex items-center justify-between px-4 transition-all duration-300 ${
          sidebarOpen ? "left-[250px] right-0" : "left-0 right-0"
        }`}
      >
        <div className="ml-12">
          <h1 className="text-xl font-bold text-gray-800">
            <span className="text-black text-4xl">{name}</span>
          </h1>
        </div>

        <button
          onClick={() => navigate("/home")}
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
          <form
            onSubmit={handleGenerateImages}
            className="flex flex-col h-full"
          >
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Enter your story to generate storyboard..."
              rows={10}
              className="flex-grow resize-none p-3 bg-white border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300 text-gray-800"
            />
            <div className="mt-4 mb-7 flex justify-between items-center">
              <div className="flex gap-3">
                {/* 1:1 Square */}
                <label className="relative group">
                  <input
                    type="radio"
                    name="resolution"
                    value="1:1"
                    checked={resolution === "1:1"}
                    onChange={(e) => setResolution(e.target.value)}
                    className="absolute opacity-0 w-0 h-0"
                  />
                  <div
                    className={`w-10 h-10 rounded-lg cursor-pointer flex items-center justify-center transition-all ${
                      resolution === "1:1"
                        ? "bg-gray-300"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className={`w-5 h-5 ${
                        resolution === "1:1" ? "text-black" : "text-gray-600"
                      }`}
                    >
                      <rect x="5" y="5" width="15" height="15" />
                    </svg>
                    {/* Tooltip */}
                    <span className="absolute -bottom-8 scale-0 rounded bg-gray-800 p-1 text-xs text-white group-hover:scale-100 transition-transform">
                      1:1
                    </span>
                  </div>
                </label>

                {/* 16:9 Widescreen */}
                <label className="relative group">
                  <input
                    type="radio"
                    name="resolution"
                    value="16:9"
                    checked={resolution === "16:9"}
                    onChange={(e) => setResolution(e.target.value)}
                    className="absolute opacity-0 w-0 h-0"
                  />
                  <div
                    className={`w-10 h-10 rounded-lg cursor-pointer flex items-center justify-center transition-all ${
                      resolution === "16:9"
                        ? "bg-gray-300"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className={`w-5 h-3.5 ${
                        resolution === "16:9" ? "text-black" : "text-gray-600"
                      }`}
                    >
                      <rect x="0" y="4" width="25" height="16" />
                    </svg>
                    {/* Tooltip */}
                    <span className="absolute -bottom-8 scale-0 rounded bg-gray-800 p-1 text-xs text-white group-hover:scale-100 transition-transform">
                      16:9
                    </span>
                  </div>
                </label>

                {/* 9:16 Portrait */}
                <label className="relative group">
                  <input
                    type="radio"
                    name="resolution"
                    value="9:16"
                    checked={resolution === "9:16"}
                    onChange={(e) => setResolution(e.target.value)}
                    className="absolute opacity-0 w-0 h-0"
                  />
                  <div
                    className={`w-10 h-10 rounded-lg cursor-pointer flex items-center justify-center transition-all ${
                      resolution === "9:16"
                        ? "bg-gray-300"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className={`w-3.5 h-5 ${
                        resolution === "9:16" ? "text-black" : "text-gray-600"
                      }`}
                    >
                      <rect x="4" y="0" width="16" height="25" />
                    </svg>
                    {/* Tooltip */}
                    <span className="absolute -bottom-8 scale-0 rounded bg-gray-800 p-1 text-xs text-white group-hover:scale-100 transition-transform">
                      9:16
                    </span>
                  </div>
                </label>
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
        {/* Image Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 z-[2000] flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="relative max-w-4xl w-full max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute -top-10 right-0 text-white hover:text-gray-300"
                onClick={() => setSelectedImage(null)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <div className="bg-white rounded-lg overflow-hidden shadow-xl">
                <img
                  src={selectedImage.image_path}
                  alt="Enlarged storyboard image"
                  className="w-full h-auto max-h-[70vh] object-contain"
                />
                <div className="p-4 bg-white">
                  <p className="font-semibold">Caption:</p>
                  <p className="text-gray-700">{selectedImage.caption}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Right Side - Output Grid (70%) */}
        <div className="w-[70%] overflow-y-auto p-8 relative bg-[radial-gradient(circle_at_center,#e5e7eb_1px,transparent_1px)] bg-[length:20px_20px]">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,#e5e7eb_1px,transparent_1px)] bg-[length:20px_20px]"></div>

          {loading ? (
            <div className="text-center">Loading images...</div>
          ) : storyboardImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-center max-w-md">
                <h2 className="text-2xl font-bold text-gray-700 mb-4">
                  No Storyboard Images Yet
                </h2>
                <p className="text-gray-500 mb-6">
                  Enter your story in the left panel and click "Generate
                  Storyboard" to create your first storyboard images.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-0">
              {storyboardImages
                .slice(currentIndex, currentIndex + 6)
                .map((image, i) => (
                  <div key={i} className="flex flex-col">
                    {/* Square Image Container */}
                    <div
                      className="aspect-square overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedImage(image)}
                    >
                      <img
                        src={image.image_path}
                        alt={`Storyboard image ${i + 1}`}
                        className="object-cover w-full h-full"
                      />
                    </div>

                    {/* Updated Caption Container */}
                    <div className="mt-2 p-2 text-gray-800 font-semibold text-sm bg-white rounded-lg border border-gray-100 min-h-[60px] max-h-[100px] overflow-y-auto">
                      <p className="text-xs mb-1">
                        Caption {currentIndex + i + 1}:
                      </p>
                      <p className="font-normal text-sm break-words whitespace-normal">
                        {image.caption}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Carousel Buttons */}
      {storyboardImages.length > 6 && (
        <>
          <button
            onClick={handlePrev}
            className={`fixed top-1/2 transform -translate-y-1/2 bg-gray-700 hover:bg-gray-500  text-xl w-10 h-10 rounded-full shadow z-10 transition-all duration-300 ${
              sidebarOpen
                ? "left-[calc(30%+180px+20px)]"
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
            className={`fixed right-4 top-1/2 transform -translate-y-1/2 bg-gray-700 hover:bg-gray-500 text-xl w-10 h-10 rounded-full shadow z-10 transition-all duration-300 ${
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
