"use client";

import { useState } from "react";
import Image from "next/image";
import { apiClient } from "@/lib/api-client";

interface AddListComponentProps {
  onListCreated?: () => void;
}

export default function AddListComponent({ onListCreated }: AddListComponentProps) {
  const [showInput, setShowInput] = useState(false);
  const [listName, setListName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddListClick = () => {
    setShowInput(true);
  };

  const handleCancel = () => {
    setShowInput(false);
    setListName("");
  };

  const handleSave = async () => {
    console.log("handleSave called with listName:", listName.trim());
    if (listName.trim() && !isLoading) {
      setIsLoading(true);
      console.log("Starting API call...");
      try {
        const response = await apiClient.createList({ listName: listName.trim() });
        console.log("API response:", response);
        if (response.success) {
          console.log("List created successfully:", response.data);
          setShowInput(false);
          setListName("");
          // Notify parent component that a list was created
          if (onListCreated) {
            onListCreated();
          }
        } else {
          console.error("Failed to create list:", response.error);
          // You can add toast notification here
        }
      } catch (error) {
        console.error("Error creating list:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log("handleSave skipped - listName empty or loading:", { listName: listName.trim(), isLoading });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    console.log("Key pressed:", e.key);
    if (e.key === "Enter") {
      console.log("Enter key detected, calling handleSave");
      handleSave();
    } else if (e.key === "Escape") {
      console.log("Escape key detected, calling handleCancel");
      handleCancel();
    }
  };

  return (
    <div 
      className="w-full lg:max-w-[920px] flex items-center justify-center rounded-lg border p-8 lg:p-12"
      style={{ 
        backgroundColor: '#FAFAFA',
        borderColor: '#00000005'
      }}
    >
      {!showInput ? (
        /* Add List Button */
        <button 
          onClick={handleAddListClick}
          className="px-4 py-2.5 rounded-lg text-white font-medium transition-colors hover:opacity-90 flex items-center justify-center cursor-pointer"
          style={{
            backgroundColor: '#D52121'
          }}
        >
          Add List
        </button>
      ) : (
        /* Input Component */
        <div className="w-full flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Add List Name"
              className="w-full px-4 py-3 rounded-lg border-2 border-red-400 focus:border-red-500 focus:outline-none text-gray-700 placeholder-gray-400 disabled:opacity-50"
              autoFocus
              disabled={isLoading}
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
              </div>
            )}
          </div>
          
          {/* Delete/Cancel Button */}
          <button
            onClick={handleCancel}
            className="p-2 text-gray-500 hover:text-red-500 transition-colors"
            title="Cancel"
          >
            <Image
              src="/dashboard/delete.svg"
              alt="Delete"
              width={24}
              height={24}
              className="w-6 h-6"
            />
          </button>
        </div>
      )}
    </div>
  );
}
