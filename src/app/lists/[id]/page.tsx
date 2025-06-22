"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { List, Todo } from "@/types/api";
import Image from "next/image";

export default function ListDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params.id as string;

  const [list, setList] = useState<List | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New todo form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTodoName, setNewTodoName] = useState("");
  const [newTodoPriority, setNewTodoPriority] = useState<"high" | "medium" | "low">("medium");
  const [isCreating, setIsCreating] = useState(false);

  // Edit todo state
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editingTodoName, setEditingTodoName] = useState("");

  const loadListAndTodos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.getTodosForList(listId);
      if (response.success && response.data) {
        setList(response.data.list);
        setTodos(response.data.todos);
      } else {
        setError(response.error || "Failed to load list");
      }
    } catch (err) {
      setError("An error occurred while loading the list");
      console.error("Error loading list:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (listId) {
        try {
          setIsLoading(true);
          setError(null);
          
          const response = await apiClient.getTodosForList(listId);
          if (response.success && response.data) {
            setList(response.data.list);
            setTodos(response.data.todos);
          } else {
            setError(response.error || "Failed to load list");
          }
        } catch (err) {
          setError("An error occurred while loading the list");
          console.error("Error loading list:", err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadData();
  }, [listId]);

  const handleCreateTodo = async () => {
    if (!newTodoName.trim() || isCreating) return;

    try {
      setIsCreating(true);
      const response = await apiClient.createTodo({
        taskName: newTodoName.trim(),
        priority: newTodoPriority,
        listId: listId,
        status: "to-do",
        type: false
      });

      if (response.success) {
        setNewTodoName("");
        setNewTodoPriority("medium");
        setShowAddForm(false);
        loadListAndTodos(); // Refresh the list
      } else {
        setError(response.error || "Failed to create todo");
      }
    } catch (err) {
      setError("An error occurred while creating the todo");
      console.error("Error creating todo:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleTodo = async (todoId: string) => {
    try {
      const response = await apiClient.toggleTodoCompletion(todoId);
      if (response.success) {
        loadListAndTodos(); // Refresh the list
      } else {
        setError(response.error || "Failed to toggle todo");
      }
    } catch (err) {
      setError("An error occurred while updating the todo");
      console.error("Error toggling todo:", err);
    }
  };

  const handleStatusChange = async (todoId: string, newStatus: "to-do" | "in progress" | "completed") => {
    try {
      const response = await apiClient.changeTodoStatus(todoId, newStatus);
      if (response.success) {
        loadListAndTodos(); // Refresh the list
      } else {
        setError(response.error || "Failed to update status");
      }
    } catch (err) {
      setError("An error occurred while updating the status");
      console.error("Error updating status:", err);
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    if (!confirm("Are you sure you want to delete this todo?")) return;
    
    try {
      const response = await apiClient.deleteTodo(todoId);
      if (response.success) {
        loadListAndTodos(); // Refresh the list
      } else {
        setError(response.error || "Failed to delete todo");
      }
    } catch (err) {
      setError("An error occurred while deleting the todo");
      console.error("Error deleting todo:", err);
    }
  };

  const handleEditTodo = (todoId: string, currentName: string) => {
    setEditingTodoId(todoId);
    setEditingTodoName(currentName);
  };

  const handleSaveEdit = async (todoId: string) => {
    if (!editingTodoName.trim()) return;

    try {
      const response = await apiClient.updateTodo(todoId, {
        taskName: editingTodoName.trim()
      });
      if (response.success) {
        setEditingTodoId(null);
        setEditingTodoName("");
        loadListAndTodos(); // Refresh the list
      } else {
        setError(response.error || "Failed to update todo");
      }
    } catch (err) {
      setError("An error occurred while updating the todo");
      console.error("Error updating todo:", err);
    }
  };

  const handleCancelEdit = () => {
    setEditingTodoId(null);
    setEditingTodoName("");
  };

  const handleEditKeyPress = (e: React.KeyboardEvent, todoId: string) => {
    if (e.key === "Enter") {
      handleSaveEdit(todoId);
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreateTodo();
    } else if (e.key === "Escape") {
      setShowAddForm(false);
      setNewTodoName("");
      setNewTodoPriority("medium");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 bg-red-50 border-red-200";
      case "medium": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low": return "text-green-600 bg-green-50 border-green-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600 bg-green-50 border-green-200";
      case "in progress": return "text-blue-600 bg-blue-50 border-blue-200";
      case "to-do": return "text-gray-600 bg-gray-50 border-gray-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading list...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">List not found</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="w-full flex items-center justify-between p-6 lg:p-8 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{list.listName}</h1>
            <p className="text-sm text-gray-600">{list.totalTasks} total tasks</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Add Todo
        </button>
      </header>

      {/* Main Content */}
      <main className="p-6 lg:p-8">
        {/* Add Todo Form */}
        {showAddForm && (
          <div className="mb-8 p-6 bg-gray-50 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Todo</h3>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Name</label>
                <input
                  type="text"
                  value={newTodoName}
                  onChange={(e) => setNewTodoName(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Enter task name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                  autoFocus
                  disabled={isCreating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={newTodoPriority}
                  onChange={(e) => setNewTodoPriority(e.target.value as "high" | "medium" | "low")}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                  disabled={isCreating}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateTodo}
                  disabled={!newTodoName.trim() || isCreating}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? "Creating..." : "Create"}
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewTodoName("");
                    setNewTodoPriority("medium");
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Todos Table */}
        {todos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No todos yet</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Create Your First Todo
            </button>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {todos.map((todo) => (
                  <tr key={todo._id} className={`hover:bg-gray-50 ${todo.type ? 'opacity-75' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={todo.type}
                          onChange={() => handleToggleTodo(todo._id)}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <select
                          value={todo.status}
                          onChange={(e) => handleStatusChange(todo._id, e.target.value as "to-do" | "in progress" | "completed")}
                          className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(todo.status)}`}
                        >
                          <option value="to-do">To Do</option>
                          <option value="in progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingTodoId === todo._id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingTodoName}
                            onChange={(e) => setEditingTodoName(e.target.value)}
                            onKeyDown={(e) => handleEditKeyPress(e, todo._id)}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-red-500"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(todo._id)}
                            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div 
                          className={`text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded ${todo.type ? 'line-through' : ''}`}
                          onClick={() => handleEditTodo(todo._id, todo.taskName)}
                          title="Click to edit"
                        >
                          {todo.taskName}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(todo.priority)}`}>
                        {todo.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(todo.createdOn).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {editingTodoId === todo._id ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(todo._id)}
                              className="text-green-600 hover:text-green-900"
                              title="Save changes"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-gray-600 hover:text-gray-900"
                              title="Cancel editing"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditTodo(todo._id, todo.taskName)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit task name"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteTodo(todo._id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete task"
                            >
                              <Image
                                src="/dashboard/delete.svg"
                                alt="Delete"
                                width={16}
                                height={16}
                                className="w-4 h-4"
                              />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
