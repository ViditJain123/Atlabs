'use client';

import { useEffect, useState } from 'react';
import { useTodoStore } from '@/store/todoStore';
import { useSocket } from '@/contexts/SocketContext';
import { ITodo, TodoStatus, TodoPriority } from '@/types/todo';
import Notification from './Notification';

interface TodoDisplayProps {
  listId: string;
}

export default function TodoDisplay({ listId }: TodoDisplayProps) {
  const {
    todos,
    isLoading,
    error,
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    clearError,
  } = useTodoStore();

  const { emitTodoAdded, emitTodoUpdated, emitTodoDeleted } = useSocket();

  const [newTodoName, setNewTodoName] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<TodoPriority>(TodoPriority.MEDIUM);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Filter todos for the current list
  const listTodos = todos.filter(todo => todo.listId === listId);

  useEffect(() => {
    fetchTodos(listId);
  }, [listId, fetchTodos]);

  useEffect(() => {
    if (error) {
      setNotification({ message: error, type: 'error' });
    }
  }, [error]);

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTodoName.trim()) {
      setNotification({ message: 'Task name is required', type: 'error' });
      return;
    }

    const success = await createTodo(
      {
        taskName: newTodoName.trim(),
        type: false,
        status: TodoStatus.TODO,
        listId,
        priority: newTodoPriority,
      },
      emitTodoAdded
    );

    if (success) {
      setNewTodoName('');
      setNewTodoPriority(TodoPriority.MEDIUM);
      setNotification({ message: 'Task created successfully', type: 'success' });
    }
  };

  const handleUpdateTodo = async (todoId: string, updates: Partial<ITodo>) => {
    const success = await updateTodo(todoId, updates, emitTodoUpdated);
    if (success) {
      setNotification({ message: 'Task updated successfully', type: 'success' });
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    const success = await deleteTodo(todoId, emitTodoDeleted);
    if (success) {
      setNotification({ message: 'Task deleted successfully', type: 'success' });
    }
  };

  const handleToggleComplete = async (todo: ITodo) => {
    const newType = !todo.type;
    const newStatus = newType ? TodoStatus.COMPLETED : TodoStatus.TODO;
    
    await handleUpdateTodo(todo._id, { type: newType, status: newStatus });
  };

  const getPriorityColor = (priority: TodoPriority) => {
    switch (priority) {
      case TodoPriority.HIGH:
        return 'text-red-600 bg-red-50 border-red-200';
      case TodoPriority.MEDIUM:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case TodoPriority.LOW:
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading && listTodos.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      {/* Add New Todo Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Task</h2>
        <form onSubmit={handleCreateTodo} className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              value={newTodoName}
              onChange={(e) => setNewTodoName(e.target.value)}
              placeholder="Enter task name..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={newTodoPriority}
              onChange={(e) => setNewTodoPriority(e.target.value as TodoPriority)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={TodoPriority.LOW}>Low Priority</option>
              <option value={TodoPriority.MEDIUM}>Medium Priority</option>
              <option value={TodoPriority.HIGH}>High Priority</option>
            </select>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Adding...' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>

      {/* Todos List */}
      <div className="space-y-4">
        {listTodos.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
            <div className="text-gray-500 text-lg mb-2">No tasks yet</div>
            <div className="text-gray-400">Add your first task above to get started</div>
          </div>
        ) : (
          listTodos.map((todo) => (
            <div
              key={todo._id}
              className={`bg-white rounded-lg shadow-sm border p-6 transition-all duration-200 ${
                todo.type ? 'opacity-75' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Checkbox */}
                <button
                  onClick={() => handleToggleComplete(todo)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    todo.type
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {todo.type && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>

                {/* Task Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`text-lg font-medium ${todo.type ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {todo.taskName}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(todo.priority)}`}>
                      {todo.priority === TodoPriority.LOW ? 'Low' : 
                       todo.priority === TodoPriority.MEDIUM ? 'Medium' : 
                       'High'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Created {formatDate(todo.createdOn)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      todo.status === TodoStatus.COMPLETED
                        ? 'bg-green-100 text-green-800'
                        : todo.status === TodoStatus.IN_PROGRESS
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {todo.status === TodoStatus.TODO ? 'To Do' : 
                       todo.status === TodoStatus.IN_PROGRESS ? 'In Progress' : 
                       'Completed'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <select
                    value={todo.status}
                    onChange={(e) => handleUpdateTodo(todo._id, { status: e.target.value as TodoStatus })}
                    className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={TodoStatus.TODO}>To Do</option>
                    <option value={TodoStatus.IN_PROGRESS}>In Progress</option>
                    <option value={TodoStatus.COMPLETED}>Completed</option>
                  </select>
                  <button
                    onClick={() => handleDeleteTodo(todo._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => {
            setNotification(null);
            clearError();
          }}
        />
      )}
    </div>
  );
}
