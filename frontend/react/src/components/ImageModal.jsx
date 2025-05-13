import React, { useState } from "react";

const ImageModal = ({
  image,
  onClose,
  onDelete,
  isDeleting,
  onCaptionUpdate, // New prop for handling caption updates
}) => {
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [captionEditText, setCaptionEditText] = useState(image.caption);
  const [isUpdatingCaption, setIsUpdatingCaption] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  const handleSaveCaption = async () => {
    if (!captionEditText.trim()) {
      setUpdateError("Caption cannot be empty");
      return;
    }

    try {
      setIsUpdatingCaption(true);
      setUpdateError(null);
      
      // Call the parent component's handler which will call the API
      await onCaptionUpdate(image.id, captionEditText);
      
      // Only close edit mode if update was successful
      setIsEditingCaption(false);
    } catch (error) {
      console.error("Failed to update caption:", error);
      setUpdateError(error.message || "Failed to update caption");
    } finally {
      setIsUpdatingCaption(false);
    }
  };

  const handleStartEdit = () => {
    setCaptionEditText(image.caption);
    setIsEditingCaption(true);
    setUpdateError(null);
  };

  const handleCancelEdit = () => {
    setIsEditingCaption(false);
    setCaptionEditText(image.caption);
    setUpdateError(null);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 z-[2000] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
        <button
          className="absolute -top-10 right-0 text-white hover:text-gray-300"
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
          className="absolute -top-10 right-12 text-white hover:text-red-400"
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

        <div className="bg-white rounded-lg overflow-hidden shadow-xl">
          <img
            src={image.image_path}
            alt="Enlarged storyboard image"
            className="w-full h-auto max-h-[70vh] object-contain"
          />
          <div className="p-4 bg-white relative">
            <p className="font-semibold text-gray-500 mb-2">Caption:</p>
            {isEditingCaption ? (
              <>
                <textarea
                  className="w-full p-2 border rounded mb-2"
                  value={captionEditText}
                  onChange={(e) => setCaptionEditText(e.target.value)}
                  rows={3}
                  disabled={isUpdatingCaption}
                />
                {updateError && (
                  <p className="text-red-500 text-sm mb-2">{updateError}</p>
                )}
                <div className="flex justify-end space-x-2">
                  <button
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    onClick={handleCancelEdit}
                    disabled={isUpdatingCaption}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                    onClick={handleSaveCaption}
                    disabled={isUpdatingCaption}
                  >
                    {isUpdatingCaption ? "Saving..." : "Save"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-700 break-words whitespace-normal pr-10">
                  {image.caption}
                </p>
                <button
                  className="absolute right-4 bottom-4 text-gray-500 hover:text-blue-500"
                  onClick={handleStartEdit}
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
      </div>
    </div>
  );
};

export default ImageModal;