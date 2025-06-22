import { create } from 'zustand';
import { ITodo as ITodoModel } from '@/models/Todo';
import { ITodo, TodoStatus, TodoPriority } from '@/types/todo';
import { todoApi, CreateTodoRequest, UpdateTodoRequest } from '@/lib/api';

interface TodoState {
  // State
  todos: ITodo[];
  isLoading: boolean;
  error: string | null;
  selectedListId: string | null;
  
  // Actions
  fetchTodos: (listId: string) => Promise<void>;
  createTodo: (todo: CreateTodoRequest, emitSocket?: (listId: string, todo: ITodo) => void) => Promise<boolean>;
  updateTodo: (todoId: string, updates: UpdateTodoRequest, emitSocket?: (listId: string, todo: ITodo) => void) => Promise<boolean>;
  deleteTodo: (todoId: string, emitSocket?: (listId: string, todoId: string) => void) => Promise<boolean>;
  fetchTodosByStatus: (status: TodoStatus) => Promise<void>;
  setSelectedListId: (listId: string | null) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  
  // Real-time sync methods
  addTodoFromSocket: (todo: ITodo) => void;
  updateTodoFromSocket: (todo: ITodo) => void;
  deleteTodoFromSocket: (todoId: string) => void;
  
  // Computed getters
  getTodosByStatus: (status: TodoStatus) => ITodo[];
  getTodosByPriority: (priority: TodoPriority) => ITodo[];
  getCompletedTodosCount: () => number;
  getPendingTodosCount: () => number;
}

export const useTodoStore = create<TodoState>((set, get) => ({
  // Initial state
  todos: [],
  isLoading: false,
  error: null,
  selectedListId: null,

  // Actions
  fetchTodos: async (listId: string) => {
    set({ isLoading: true, error: null, selectedListId: listId });
    
    try {
      const result = await todoApi.getTodos(listId);
      
      if (result.success && result.data) {
        set({ 
          todos: result.data, 
          isLoading: false, 
          error: null 
        });
      } else {
        set({ 
          isLoading: false, 
          error: result.error || 'Failed to fetch todos' 
        });
      }
    } catch (err) {
      console.error('Error fetching todos:', err);
      set({ 
        isLoading: false, 
        error: 'Network error occurred' 
      });
    }
  },

  createTodo: async (todo: CreateTodoRequest, emitSocket?: (listId: string, todo: ITodo) => void): Promise<boolean> => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await todoApi.createTodo(todo);
      
      if (result.success && result.data) {
        const currentTodos = get().todos;
        set({ 
          todos: [result.data, ...currentTodos],
          isLoading: false, 
          error: null 
        });
        
        // Emit socket event for real-time collaboration
        if (emitSocket && todo.listId) {
          emitSocket(todo.listId, result.data);
        }
        
        return true;
      } else {
        set({ 
          isLoading: false, 
          error: result.error || 'Failed to create todo' 
        });
        return false;
      }
    } catch (err) {
      console.error('Error creating todo:', err);
      set({ 
        isLoading: false, 
        error: 'Network error occurred' 
      });
      return false;
    }
  },

  updateTodo: async (todoId: string, updates: UpdateTodoRequest, emitSocket?: (listId: string, todo: ITodo) => void): Promise<boolean> => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await todoApi.updateTodo(todoId, updates);
      
      if (result.success && result.data) {
        const currentTodos = get().todos;
        const updatedTodos = currentTodos.map(todo => 
          todo._id === todoId ? result.data! : todo
        );
        set({ 
          todos: updatedTodos,
          isLoading: false, 
          error: null 
        });
        
        // Emit socket event for real-time collaboration
        if (emitSocket && result.data.listId) {
          emitSocket(result.data.listId, result.data);
        }
        
        return true;
      } else {
        set({ 
          isLoading: false, 
          error: result.error || 'Failed to update todo' 
        });
        return false;
      }
    } catch (err) {
      console.error('Error updating todo:', err);
      set({ 
        isLoading: false, 
        error: 'Network error occurred' 
      });
      return false;
    }
  },

  deleteTodo: async (todoId: string, emitSocket?: (listId: string, todoId: string) => void): Promise<boolean> => {
    set({ isLoading: true, error: null });
    
    try {
      // Get the todo before deleting to get the listId
      const currentTodos = get().todos;
      const todoToDelete = currentTodos.find(todo => todo._id === todoId);
      
      const result = await todoApi.deleteTodo(todoId);
      
      if (result.success) {
        const filteredTodos = currentTodos.filter(todo => todo._id !== todoId);
        set({ 
          todos: filteredTodos,
          isLoading: false, 
          error: null 
        });
        
        // Emit socket event for real-time collaboration
        if (emitSocket && todoToDelete?.listId) {
          emitSocket(todoToDelete.listId, todoId);
        }
        
        return true;
      } else {
        set({ 
          isLoading: false, 
          error: result.error || 'Failed to delete todo' 
        });
        return false;
      }
    } catch (err) {
      console.error('Error deleting todo:', err);
      set({ 
        isLoading: false, 
        error: 'Network error occurred' 
      });
      return false;
    }
  },

  fetchTodosByStatus: async (status: TodoStatus) => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await todoApi.getTodosByStatus(status);
      
      if (result.success && result.data) {
        set({ 
          todos: result.data, 
          isLoading: false, 
          error: null 
        });
      } else {
        set({ 
          isLoading: false, 
          error: result.error || 'Failed to fetch todos by status' 
        });
      }
    } catch (err) {
      console.error('Error fetching todos by status:', err);
      set({ 
        isLoading: false, 
        error: 'Network error occurred' 
      });
    }
  },

  setSelectedListId: (listId: string | null) => {
    set({ selectedListId: listId });
  },

  clearError: () => {
    set({ error: null });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  // Real-time sync methods
  addTodoFromSocket: (todo: ITodo) => {
    const currentTodos = get().todos;
    // Only add if not already present (avoid duplicates)
    if (!currentTodos.some(t => t._id === todo._id)) {
      set({ todos: [todo, ...currentTodos] });
    }
  },

  updateTodoFromSocket: (todo: ITodo) => {
    const currentTodos = get().todos;
    const updatedTodos = currentTodos.map(t => t._id === todo._id ? todo : t);
    set({ todos: updatedTodos });
  },

  deleteTodoFromSocket: (todoId: string) => {
    const currentTodos = get().todos;
    const filteredTodos = currentTodos.filter(todo => todo._id !== todoId);
    set({ todos: filteredTodos });
  },

  // Computed getters
  getTodosByStatus: (status: TodoStatus) => {
    return get().todos.filter(todo => todo.status === status);
  },

  getTodosByPriority: (priority: TodoPriority) => {
    return get().todos.filter(todo => todo.priority === priority);
  },

  getCompletedTodosCount: () => {
    return get().todos.filter(todo => todo.status === TodoStatus.COMPLETED).length;
  },

  getPendingTodosCount: () => {
    return get().todos.filter(todo => 
      todo.status === TodoStatus.TODO || todo.status === TodoStatus.IN_PROGRESS
    ).length;
  },
}));
