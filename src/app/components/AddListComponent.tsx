"use client";

import { useState } from "react";
import Image from "next/image";

export default function AddListComponent() {
  const [showInput, setShowInput] = useState(false);
  const [listName, setListName] = useState("");

  const handleAddListClick = () => {
    setShowInput(true);
  };

  const handleCancel = () => {
    setShowInput(false);
    setListName("");
  };

  const handleSave = () => {
    if (listName.trim()) {
      // TODO: Save the list
      console.log("Saving list:", listName);
      setShowInput(false);
      setListName("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
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
              className="w-full px-4 py-3 rounded-lg border-2 border-red-400 focus:border-red-500 focus:outline-none text-gray-700 placeholder-gray-400"
              autoFocus
            />
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
