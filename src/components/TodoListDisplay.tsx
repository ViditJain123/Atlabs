"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTodoListStore } from "../store/todoListStore";
import { ITodoList } from "@/models/TodoList";
import ShareModal from "./ShareModal";
import Notification from "./Notification";
import CircularProgress from "./CircularProgress";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { useUser } from "@clerk/nextjs";

interface TodoListDisplayProps {
  className?: string;
}

export default function TodoListDisplay({ className = "" }: TodoListDisplayProps) {
  const { todoLists, isLoading, error, fetchTodoLists, deleteTodoList } = useTodoListStore();
  const { user } = useUser();
  const router = useRouter();
  const [shareModal, setShareModal] = useState<{ isOpen: boolean; listId: string; listName: string }>({
    isOpen: false,
    listId: "",
    listName: ""
  });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; listId: string; listName: string }>({
    isOpen: false,
    listId: "",
    listName: ""
  });
  const [sharingLoading, setSharingLoading] = useState(false);
  const [deletingListId, setDeletingListId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchTodoLists();
  }, [fetchTodoLists]);

  const handleListClick = (listId: string) => {
    router.push(`/list/${listId}`);
  };

  const handleShareClick = (e: React.MouseEvent, listId: string, listName: string) => {
    e.stopPropagation(); // Prevent navigation to list
    setShareModal({ isOpen: true, listId, listName });
  };

  const handleDeleteClick = async (e: React.MouseEvent, listId: string, listName: string) => {
    e.stopPropagation(); // Prevent navigation to list
    setDeleteModal({ isOpen: true, listId, listName });
  };

  const handleDeleteConfirm = async () => {
    const { listId, listName } = deleteModal;
    setDeletingListId(listId);
    
    try {
      const success = await deleteTodoList(listId);
      if (success) {
        setNotification({ message: `"${listName}" deleted successfully`, type: 'success' });
        setTimeout(() => setNotification(null), 5000);
      } else {
        setNotification({ message: 'Failed to delete list', type: 'error' });
        setTimeout(() => setNotification(null), 5000);
      }
    } catch {
      setNotification({ message: 'An error occurred while deleting the list', type: 'error' });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setDeletingListId(null);
      setDeleteModal({ isOpen: false, listId: "", listName: "" });
    }
  };

  const handleShare = async (email: string) => {
    setSharingLoading(true);
    try {
      const response = await fetch(`/api/todo-lists/${shareModal.listId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to share list');
      }

      // Show success notification (you can implement this)
      setNotification({ message: `List shared successfully with ${email}`, type: 'success' });
      setTimeout(() => setNotification(null), 5000);
    } catch (error) {
      throw error; // Re-throw to be handled by the modal
    } finally {
      setSharingLoading(false);
    }
  };

  const isOwner = (todoList: ITodoList) => {
    return user?.id === todoList.userId;
  };

  const formatDate = (date: Date) => {
    const todoDate = new Date(date);
    
    // Format time as HH:MM
    const timeString = todoDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    // Format date as DD/MM/YYYY
    const dateString = todoDate.toLocaleDateString('en-GB');
    
    return `${timeString}, ${dateString}`;
  };

  if (isLoading && todoLists.length === 0) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <div className="text-gray-500">Loading your lists...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (todoLists.length === 0) {
    return null; // Don't show anything if no lists - AddListComponent will handle empty state
  }

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        {todoLists.map((todoList: ITodoList) => (
          <div
            key={todoList._id}
            onClick={() => handleListClick(todoList._id)}
            className="w-full lg:max-w-[920px] mx-auto p-6 border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
            style={{ 
              backgroundColor: '#FAFAFA',
              borderColor: '#00000005'
            }}
          >
            <div className="flex items-center gap-6">
              {/* Circular Progress Bar */}
              <div className="flex-shrink-0">
                <CircularProgress 
                  percentage={todoList.completionPercentage || 0}
                  size={64}
                  strokeWidth={5}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col gap-2">
                  {/* Title */}
                  <h3 className="text-xl font-semibold text-gray-900 truncate">
                    {todoList.name}
                    {!isOwner(todoList) && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Shared
                      </span>
                    )}
                  </h3>
                  
                  {/* Date and Task Count */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatDate(todoList.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      {todoList.todoCount || 0} tasks added
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {isOwner(todoList) && (
                  <button
                    onClick={(e) => handleShareClick(e, todoList._id, todoList.name)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Share list"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                  </button>
                )}
                
                {isOwner(todoList) && (
                  <button
                    onClick={(e) => handleDeleteClick(e, todoList._id, todoList.name)}
                    disabled={deletingListId === todoList._id}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete list"
                  >
                    {deletingListId === todoList._id ? (
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m12 2a10 10 0 0 1 10 10h-4a6 6 0 0 0-6-6v-4z"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <ShareModal
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ isOpen: false, listId: "", listName: "" })}
        onShare={handleShare}
        listName={shareModal.listName}
        isLoading={sharingLoading}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, listId: "", listName: "" })}
        onConfirm={handleDeleteConfirm}
        title="Are you sure want to delete this List?"
        description="This action cannot be undone. All tasks associated with this list will be lost."
        isLoading={deletingListId === deleteModal.listId}
      />

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
