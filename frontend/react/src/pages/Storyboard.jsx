import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { imagesAPI } from "../api";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import TextInputPanel from "../components/TextInputPanel";
import ImageGrid from "../components/ImageGrid";
import ImageModal from "../components/ImageModal";
import NavigationButtons from "../components/NavigationButtons";

const Storyboard = () => {
  const navigate = useNavigate();
  const { id, name } = useParams();
  const [userInput, setUserInput] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resolution, setResolution] = useState("1:1");
  const [storyboardImages, setStoryboardImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isTextAreaCollapsed, setIsTextAreaCollapsed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [captionEditText, setCaptionEditText] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [feedbackSelection, setFeedbackSelection] = useState(null);

  const [generationStatus, setGenerationStatus] = useState({
    isGenerating: false,
    current: 0,
    total: 0,
    progress: 0,
  });
  const [showGenerationIndicator, setShowGenerationIndicator] = useState(false);

  const initialImageCountRef = useRef(0);
  const pollingIntervalRef = useRef(null);

  const toggleTextArea = () => {
    setIsTextAreaCollapsed(!isTextAreaCollapsed);
  };

  const sortImagesById = (images) => {
    return [...images].sort((a, b) => a.id - b.id);
  };

  const countSentences = (text) => {
    if (!text) return 0;
    const sentences = text.replace(/\s+/g, " ").match(/[^.!?]+[.!?]+/g);
    return sentences ? sentences.length : 1;
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, storyboardImages.length]);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await imagesAPI.getImages(id);
        if (response.data && Array.isArray(response.data)) {
          const sortedImages = sortImagesById(response.data);
          setStoryboardImages(sortedImages);
          initialImageCountRef.current = sortedImages.length;
        } else {
          setError("No images found.");
        }
      } catch (err) {
        setError("Failed to fetch images");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchImages();
  }, [id]);

  useEffect(() => {
    const pollForImages = async () => {
      try {
        const response = await imagesAPI.getImages(id);
        if (response.data && Array.isArray(response.data)) {
          const newImages = sortImagesById(response.data);
          const currentTotalImages = newImages.length;
          const newImagesCount =
            currentTotalImages - initialImageCountRef.current;

          if (newImagesCount > 0) {
            setGenerationStatus((prev) => {
              const newProgress = Math.min(
                Math.round((newImagesCount / prev.total) * 100),
                100
              );

              return {
                ...prev,
                current: newImagesCount,
                progress: newProgress,
              };
            });

            setStoryboardImages(newImages);
          }

          // Check if generation is complete
          if (
            generationStatus.total > 0 &&
            newImagesCount >= generationStatus.total
          ) {
            completeGeneration();
          }
        }
      } catch (err) {
        console.error("Error polling for images:", err);
      }
    };

    if (generationStatus.isGenerating) {
      // Clear any existing interval
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      // Start new polling interval
      pollingIntervalRef.current = setInterval(pollForImages, 3000);
      // Immediate first poll
      pollForImages();
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [generationStatus.isGenerating, id, generationStatus.total]);

  const completeGeneration = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    setIsGenerating(false);
    setShowGenerationIndicator(false);
    setGenerationStatus({
      isGenerating: false,
      current: 0,
      total: 0,
      progress: 0,
    });
    initialImageCountRef.current = storyboardImages.length;
  };

  const handleGenerateImages = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isGenerating) return;

    try {
      const sentenceCount = countSentences(userInput);
      initialImageCountRef.current = storyboardImages.length;

      setIsGenerating(true);
      setGenerationStatus({
        isGenerating: true,
        current: 0,
        total: sentenceCount,
        progress: 0,
      });
      setShowGenerationIndicator(true);

      const formData = new FormData();
      formData.append("story", userInput);
      formData.append("resolution", resolution);

      await imagesAPI.generateImages(id, formData);
    } catch (error) {
      console.error("Error generating images:", error);
      completeGeneration();
    }
  };

  const handleRegenerateImage = async (
    imageId,
    caption,
    seed,
    resolution,
    isOpenPose,
    pose_img
  ) => {
    try {
      await imagesAPI.regenerateImage(
        imageId,
        caption,
        seed,
        resolution,
        isOpenPose,
        pose_img
      );
      const response = await imagesAPI.getImages(id);
      if (response.data) {
        setStoryboardImages(sortImagesById(response.data));
        const regeneratedImage = response.data.find(
          (img) => img.id === imageId
        );
        if (regeneratedImage) {
          setSelectedImage(regeneratedImage);
        }
      }
      return true;
    } catch (error) {
      console.error("Error regenerating image:", error);
      throw new Error(
        error.response?.data?.detail || "Failed to regenerate image"
      );
    }
  };

  const handleUpdateCaption = async (imageId, newCaption) => {
    try {
      await imagesAPI.updateImageCaption(imageId, newCaption);
      const response = await imagesAPI.getImages(id);
      if (response.data && Array.isArray(response.data)) {
        setStoryboardImages(sortImagesById(response.data));
        const updatedImage = response.data.find((img) => img.id === imageId);
        if (updatedImage) {
          setSelectedImage(updatedImage);
        }
      }
      return true;
    } catch (error) {
      console.error("Error updating caption:", error);
      throw new Error(
        error.response?.data?.detail || "Failed to update caption"
      );
    }
  };

  const handleNext = (e) => {
    if (e) e.preventDefault();
    if (currentIndex + 6 < storyboardImages.length) {
      setCurrentIndex(currentIndex + 6);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = (e) => {
    if (e) e.preventDefault();
    if (currentIndex === 0) {
      setCurrentIndex(
        storyboardImages.length - (storyboardImages.length % 6 || 6)
      );
    } else {
      setCurrentIndex(currentIndex - 6);
    }
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen bg-white font-sans relative">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      <Header
        isSidebarOpen={sidebarOpen}
        storyboardName={name}
        onNavigateHome={() => navigate("/home")}
        onToggleSidebar={toggleSidebar}
      />

      <div
        className={`flex h-screen pt-16 transition-all duration-300 ${
          sidebarOpen ? "pl-[250px]" : "pl-0"
        }`}
      >
        <TextInputPanel
          isCollapsed={isTextAreaCollapsed}
          onToggle={toggleTextArea}
          userInput={userInput}
          setUserInput={setUserInput}
          resolution={resolution}
          setResolution={setResolution}
          isGenerating={isGenerating}
          onSubmit={handleGenerateImages}
        />

        <ImageGrid
          isTextAreaCollapsed={isTextAreaCollapsed}
          sidebarOpen={sidebarOpen}
          loading={loading}
          error={error}
          storyboardImages={storyboardImages}
          currentIndex={currentIndex}
          onImageClick={setSelectedImage}
          onExpandPanel={() => setIsTextAreaCollapsed(false)}
        />

        {selectedImage && (
          <ImageModal
            image={selectedImage}
            onClose={() => setSelectedImage(null)}
            onDelete={async () => {
              try {
                setIsDeleting(true);
                await imagesAPI.deleteImage(selectedImage.id);

                setStoryboardImages((prev) =>
                  prev.filter((img) => img.id !== selectedImage.id)
                );

                setSelectedImage(null);
              } catch (error) {
                console.error("Error deleting image:", error);
                alert("Failed to delete image");
              } finally {
                setIsDeleting(false);
              }
            }}
            feedbackSelection={feedbackSelection}
            setFeedbackSelection={setFeedbackSelection}
            isRegenerating={isRegenerating}
            setIsRegenerating={setIsRegenerating}
            onRegenerateImage={handleRegenerateImage}
            isDeleting={isDeleting}
            onCaptionUpdate={handleUpdateCaption}
            isEditingCaption={isEditingCaption}
            captionEditText={captionEditText}
            onCaptionEditChange={setCaptionEditText}
            onSaveCaption={async () => {
              try {
                await imagesAPI.updateImageCaption(
                  selectedImage.id,
                  captionEditText
                );
                setStoryboardImages((prev) =>
                  sortImagesById(
                    prev.map((img) =>
                      img.id === selectedImage.id
                        ? { ...img, caption: captionEditText }
                        : img
                    )
                  )
                );

                setIsEditingCaption(false);
              } catch (error) {
                console.error("Error updating caption:", error);
                alert("Failed to update caption");
              }
            }}
            onCancelEdit={() => setIsEditingCaption(false)}
            onStartEdit={() => {
              setCaptionEditText(selectedImage.caption);
              setIsEditingCaption(true);
            }}
          />
        )}
      </div>

      {storyboardImages.length > 6 && (
        <NavigationButtons
          isTextAreaCollapsed={isTextAreaCollapsed}
          sidebarOpen={sidebarOpen}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
      {showGenerationIndicator && (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-xl border-2 border-black z-50 w-80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <h3 className="font-medium text-gray-800">
                {generationStatus.total > 0
                  ? `Generating ${generationStatus.current} of ${generationStatus.total}`
                  : "Preparing generation..."}
              </h3>
              {/* Add spinner next to generating text when in progress */}
              {generationStatus.total > 0 && (
                <svg
                  className="animate-spin ml-2 h-4 w-4 text-black"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
            </div>
            {generationStatus.total > 0 && (
              <span className="text-sm text-gray-500">
                {generationStatus.progress}%
              </span>
            )}
          </div>

          {generationStatus.total > 0 ? (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-black h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${generationStatus.progress}%` }}
              ></div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-2">
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5 text-black"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-sm text-gray-600">Initializing...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Storyboard;
