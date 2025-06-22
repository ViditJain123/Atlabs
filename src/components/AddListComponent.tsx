"use client";

import { useState } from "react";
import Image from "next/image";
import { useTodoListStore } from "../store/todoListStore";
import Notification from "./Notification";

function AddListComponent() {
  const [showInput, setShowInput] = useState(false);
  const [listName, setListName] = useState("");
  const [notification, setNotification] = useState<{message: string, type: "success" | "error"} | null>(null);
  
  // Zustand store
  const { createTodoList, isLoading, error, clearError, todoLists } = useTodoListStore();

  const handleAddListClick = () => {
    setShowInput(true);
    if (error) clearError(); // Clear any previous errors
  };

  const handleCancel = () => {
    setShowInput(false);
    setListName("");
    if (error) clearError();
  };

  const handleSave = async () => {
    if (listName.trim() && !isLoading) {
      const success = await createTodoList(listName.trim());
      
      if (success) {
        setShowInput(false);
        setListName("");
        setNotification({ message: "List created successfully!", type: "success" });
      } else {
        setNotification({ message: error || "Failed to create list", type: "error" });
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const hasLists = todoLists.length > 0;

  return (
    <>
      <div 
        className={`w-full lg:max-w-[920px] flex flex-col items-center justify-center rounded-lg ${
          showInput ? 'p-6 border' : (hasLists ? 'p-0' : 'p-8 lg:p-12 border')
        }`}
        style={{ 
          backgroundColor: showInput || !hasLists ? '#FAFAFA' : 'transparent',
          borderColor: showInput || !hasLists ? '#00000005' : 'transparent',
          maxHeight: showInput ? 'auto' : (hasLists ? '40px' : '557px'),
          height: showInput ? 'auto' : (hasLists ? '40px' : 'min(100vh - 200px, 557px)'),
          minHeight: showInput ? 'auto' : 'auto'
        }}
      >
        {!hasLists && !showInput ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center text-center">
            <div>
              <Image
                src="/dashboard/ftue.png"
                alt="Create your first list"
                width={200}
                height={200}
                className="object-contain"
              />
            </div>
            <h2 className="text-xl font-bold text-gray-900" style={{ marginTop: '28px', marginBottom: '28px' }}>
              Create your first list and become more productive
            </h2>
            <button 
              onClick={handleAddListClick}
              className="px-6 py-3 rounded-lg text-white font-medium transition-colors hover:opacity-90 flex items-center justify-center cursor-pointer"
              style={{
                backgroundColor: '#D52121'
              }}
            >
              Add List
            </button>
          </div>
        ) : !showInput ? (
          /* Add List Button (when has lists) */
          <button 
            onClick={handleAddListClick}
            className="w-full h-10 rounded-lg text-gray-600 font-medium transition-colors hover:text-gray-800 hover:bg-gray-100 flex items-center justify-center cursor-pointer border"
            style={{
              height: '40px',
              backgroundColor: '#FAFAFA',
              borderColor: '#00000005'
            }}
          >
            + Add another List
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
                className="w-full px-4 py-3 rounded-lg border-2 border-red-400 focus:border-red-500 focus:outline-none text-gray-700 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                autoFocus
                disabled={isLoading}
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
      
      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </>
  );
}

export default AddListComponent;
