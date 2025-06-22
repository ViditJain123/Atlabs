"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { List } from "@/types/api";

interface ListsDisplayProps {
  refreshTrigger?: number;
}

export default function ListsDisplay({ refreshTrigger }: ListsDisplayProps) {
  const [lists, setLists] = useState<List[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadLists = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getLists();
      if (response.success && response.data) {
        setLists(response.data);
      } else {
        console.error("Failed to load lists:", response.error);
      }
    } catch (error) {
      console.error("Error loading lists:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLists();
  }, [refreshTrigger]);

  // Refresh lists every 2 seconds to catch new additions
  useEffect(() => {
    const interval = setInterval(loadLists, 2000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading && lists.length === 0) {
    return (
      <div className="w-full max-w-[920px] mx-auto mt-8 p-4">
        <p className="text-gray-500 text-center">Loading lists...</p>
      </div>
    );
  }

  if (lists.length === 0) {
    return (
      <div className="w-full max-w-[920px] mx-auto mt-8 p-4">
        <p className="text-gray-500 text-center">No lists yet. Create your first list above!</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[920px] mx-auto mt-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Lists ({lists.length})</h2>
      <div className="space-y-3">
        {lists.map((list) => (
          <div
            key={list._id}
            onClick={() => router.push(`/lists/${list._id}`)}
            className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer hover:bg-gray-50"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-gray-900">{list.listName}</h3>
                <p className="text-sm text-gray-500">
                  {list.totalTasks} task{list.totalTasks !== 1 ? 's' : ''} • 
                  Created {new Date(list.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-gray-600">
                  {list.totalTasks} tasks
                </span>
                <div className="text-xs text-gray-400 mt-1">Click to open</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={loadLists}
        className="mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-800 underline"
      >
        Refresh Lists
      </button>
    </div>
  );
}
