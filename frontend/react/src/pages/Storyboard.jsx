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
  const [isGeneratingLong, setIsGeneratingLong] = useState(false);
  const [isTextAreaCollapsed, setIsTextAreaCollapsed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [captionEditText, setCaptionEditText] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [feedbackSelection, setFeedbackSelection] = useState(null);
  const [prevTextAreaState, setPrevTextAreaState] =
    useState(isTextAreaCollapsed);

  const imageCountRef = useRef(0);

  const toggleTextArea = () => {
    setIsTextAreaCollapsed(!isTextAreaCollapsed);
  };
  const sortImagesById = (images) => {
    return [...images].sort((a, b) => a.id - b.id);
  };

  // Keyboard navigation effect
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

  // Fetch images effect
  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await imagesAPI.getImages(id);
        if (response.data && Array.isArray(response.data)) {
          setStoryboardImages(sortImagesById(response.data));
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

  // Polling effect
  useEffect(() => {
    const pollInterval = 3000;

    const pollForImages = async () => {
      try {
        const response = await imagesAPI.getImages(id);
        if (response.data && Array.isArray(response.data)) {
          if (response.data.length !== imageCountRef.current) {
            imageCountRef.current = response.data.length;
            setStoryboardImages(sortImagesById(response.data));
            setIsGenerating(false);
          }
        }
      } catch (err) {
        console.error("Error polling for images:", err);
      }
    };

    const intervalId = setInterval(pollForImages, pollInterval);
    pollForImages();
    return () => clearInterval(intervalId);
  }, [id]);

  const handleGenerateImages = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    try {
      setIsGenerating(true);
      setIsGeneratingLong(true);
      const formData = new FormData();
      formData.append("story", userInput);
      formData.append("resolution", resolution);
      await imagesAPI.generateImages(id, formData);
    } catch (error) {
      console.error("Error generating images:", error);
      alert("Failed to start image generation. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };
  const handleRegenerateImage = async (imageId, caption, seed, resolution, isOpenPose, pose_img) => {
    try {
      await imagesAPI.regenerateImage(imageId, caption, seed, resolution, isOpenPose, pose_img);
      // Refresh the images after regeneration
      const response = await imagesAPI.getImages(id);
      if (response.data) {
        setStoryboardImages(sortImagesById(response.data));
        // Keep the same image selected if it still exists
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
      // Call your API to update the caption
      await imagesAPI.updateImageCaption(imageId, newCaption);

      // Refresh the images data
      const response = await imagesAPI.getImages(id);
      if (response.data && Array.isArray(response.data)) {
        setStoryboardImages(sortImagesById(response.data));
        // Find and set the updated image to keep modal open
        const updatedImage = response.data.find((img) => img.id === imageId);
        if (updatedImage) {
          setSelectedImage(updatedImage);
        }
      }

      return true; // Indicate success
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
          prevTextAreaState={prevTextAreaState}
        />
      )}
    </div>
  );
};

export default Storyboard;
