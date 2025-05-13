import React, { useState } from "react";

const ImageModal = ({
  image,
  onClose,
  onDelete,
  isDeleting,
  onCaptionUpdate,
  onRegenerateImage,
}) => {
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [captionEditText, setCaptionEditText] = useState(image.caption);
  const [isSaving, setIsSaving] = useState(false);
  const [seed, setSeed] = useState("");
  const [regenerationPrompt, setRegenerationPrompt] = useState(image.caption);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerationError, setRegenerationError] = useState(null);

const handleRegenerate = async () => {
  try {
    setIsRegenerating(true);
    setRegenerationError(null);
    
    const seedValue = seed.trim() ? parseInt(seed) : null;
    
    if (!regenerationPrompt.trim()) {
      throw new Error("Prompt cannot be empty");
    }

    await onRegenerateImage(image.id, regenerationPrompt.trim(), seedValue);
  } catch (error) {
    // Handle FastAPI validation errors
    if (error.response?.data?.detail) {
      if (Array.isArray(error.response.data.detail)) {
        // Handle multiple validation errors
        setRegenerationError(error.response.data.detail.map(d => d.msg).join(', '));
      } else {
        // Handle single error message
        setRegenerationError(error.response.data.detail);
      }
    } else {
      setRegenerationError(error.message || "Failed to regenerate image");
    }
  } finally {
    setIsRegenerating(false);
  }
};

  const handleSeedChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setSeed(value);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-[2000] flex items-center justify-center p-4">
      <div
        className="relative max-w-8xl w-full mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center items-center gap-6">
          {/* Image Container */}
          <div className="relative bg-white rounded-lg overflow-hidden shadow-xl">
            <button
              className="absolute top-2 right-2 text-white hover:text-gray-300 z-10"
              onClick={onClose}
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
            <button
              className="absolute top-2 right-12 text-white hover:text-red-400 z-10"
              onClick={onDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 animate-spin"
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
              ) : (
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              )}
            </button>

            <img
              src={image.image_path}
              alt="Enlarged storyboard image"
              className="w-full h-auto max-h-[70vh] object-contain"
            />

            {/* Caption Section */}
            <div className="p-4 bg-white relative">
              <p className="font-semibold text-gray-500 mb-2">Caption:</p>
              {isEditingCaption ? (
                <>
                  <textarea
                    className="w-full p-2 border rounded mb-2 text-black resize-none"
                    value={captionEditText}
                    onChange={(e) => setCaptionEditText(e.target.value)}
                    rows={3}
                    style={{ height: "80px" }}
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      className="px-3 py-1 bg-gray-300 text-black rounded hover:bg-gray-400"
                      onClick={() => setIsEditingCaption(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-3 py-1 bg-black text-white rounded hover:bg-gray-800 flex items-center justify-center"
                      onClick={async () => {
                        try {
                          setIsSaving(true);
                          await onCaptionUpdate(image.id, captionEditText);
                          setIsEditingCaption(false);
                        } catch (error) {
                          console.error("Failed to update caption:", error);
                        } finally {
                          setIsSaving(false);
                        }
                      }}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <svg
                          className="h-4 w-4 animate-spin mr-2"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                          />
                        </svg>
                      ) : null}
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-gray-700 break-words whitespace-normal pr-10">
                    {image.caption}
                  </p>
                  <button
                    className="absolute right-4 bottom-4 text-gray-500 hover:text-black"
                    onClick={() => setIsEditingCaption(true)}
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Regeneration Panel */}
          <div className="w-150 bg-black border border-gray-500 rounded-lg shadow-xl p-4 h-fit flex flex-col justify-center">
            <h3 className="font-semibold text-white mb-3">Regenerate Image</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-500 ">
                Prompt:
              </label>
              <textarea
                className="w-full p-2 border border-gray-500 rounded text-sm text-white resize-none"
                value={regenerationPrompt}
                onChange={(e) => setRegenerationPrompt(e.target.value)}
                rows={3}
                style={{ height: "80px" }}
              />
              <span className="mt-0 text-xs text-gray-500">
                Note: The prompt will not replace the caption when regenerating
              </span>
            </div>

            <div className="mb-4 flex flex-col">
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Seed:
              </label>
              <input
                type="text"
                value={seed}
                onChange={handleSeedChange}
                className="w-20 p-2 border rounded text-sm"
              />
              <span className="mt-1 text-xs text-gray-500">
                Note: The prompt will not replace the caption when regenerating
              </span>
            </div>

            {regenerationError && (
              <p className="text-red-500 text-xs mb-2">{regenerationError}</p>
            )}

            <div className="flex justify-end">
              <button
                className="px-3 py-2 bg-white text-black rounded hover:bg-gray-800 disabled:bg-gray-400"
                onClick={handleRegenerate}
                disabled={isRegenerating}
              >
                {isRegenerating ? "Regenerating..." : "Regenerate"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
