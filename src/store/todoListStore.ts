import { create } from 'zustand';
import { ITodoList } from '@/models/TodoList';
import { todoListApi } from '@/lib/api';

interface TodoListState {
  // State
  todoLists: ITodoList[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchTodoLists: () => Promise<void>;
  createTodoList: (name: string) => Promise<boolean>;
  deleteTodoList: (listId: string) => Promise<boolean>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useTodoListStore = create<TodoListState>((set, get) => ({
  // Initial state
  todoLists: [],
  isLoading: false,
  error: null,

  // Actions
  fetchTodoLists: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await todoListApi.getTodoLists();
      
      if (result.success && result.data) {
        set({ 
          todoLists: result.data, 
          isLoading: false, 
          error: null 
        });
      } else {
        set({ 
          isLoading: false, 
          error: result.error || 'Failed to fetch todo lists' 
        });
      }
    } catch (err) {
      console.error('Error fetching todo lists:', err);
      set({ 
        isLoading: false, 
        error: 'Network error occurred' 
      });
    }
  },

  createTodoList: async (name: string): Promise<boolean> => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await todoListApi.createTodoList(name);
      
      if (result.success && result.data) {
        // Add the new todo list to the existing list
        const currentLists = get().todoLists;
        set({ 
          todoLists: [result.data, ...currentLists],
          isLoading: false, 
          error: null 
        });
        return true;
      } else {
        set({ 
          isLoading: false, 
          error: result.error || 'Failed to create todo list' 
        });
        return false;
      }
    } catch (err) {
      console.error('Error creating todo list:', err);
      set({ 
        isLoading: false, 
        error: 'Network error occurred' 
      });
      return false;
    }
  },

  deleteTodoList: async (listId: string): Promise<boolean> => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await todoListApi.deleteTodoList(listId);
      
      if (result.success) {
        // Remove the deleted todo list from the existing list
        const currentLists = get().todoLists;
        const updatedLists = currentLists.filter(list => list._id !== listId);
        set({ 
          todoLists: updatedLists,
          isLoading: false, 
          error: null 
        });
        return true;
      } else {
        set({ 
          isLoading: false, 
          error: result.error || 'Failed to delete todo list' 
        });
        return false;
      }
    } catch (err) {
      console.error('Error deleting todo list:', err);
      set({ 
        isLoading: false, 
        error: 'Network error occurred' 
      });
      return false;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));
