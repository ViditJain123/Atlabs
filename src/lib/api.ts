import { ITodoList } from '@/models/TodoList';
import { ITodo, TodoStatus, TodoPriority } from '@/types/todo';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CreateTodoRequest {
  taskName: string;
  type: boolean;
  status: TodoStatus;
  priority: TodoPriority;
  listId: string;
}

export interface UpdateTodoRequest {
  taskName?: string;
  type?: boolean;
  status?: TodoStatus;
  priority?: TodoPriority;
}

export const todoListApi = {
  // Get all todo lists for the current user
  async getTodoLists(): Promise<ApiResponse<ITodoList[]>> {
    try {
      const response = await fetch('/api/todo-lists', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Failed to fetch todo lists',
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching todo lists:', error);
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  },

  // Create a new todo list
  async createTodoList(name: string): Promise<ApiResponse<ITodoList>> {
    try {
      const response = await fetch('/api/todo-lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Failed to create todo list',
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating todo list:', error);
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  },

  // Delete a todo list
  async deleteTodoList(listId: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`/api/todo-lists?id=${listId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Failed to delete todo list',
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting todo list:', error);
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  },
};

export const todoApi = {
  // Get all todos for a specific list
  async getTodos(listId: string): Promise<ApiResponse<ITodo[]>> {
    try {
      const response = await fetch(`/api/todos?listId=${listId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Failed to fetch todos',
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching todos:', error);
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  },

  // Create a new todo
  async createTodo(todo: CreateTodoRequest): Promise<ApiResponse<ITodo>> {
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(todo),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Failed to create todo',
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating todo:', error);
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  },

  // Update a todo
  async updateTodo(todoId: string, updates: UpdateTodoRequest): Promise<ApiResponse<ITodo>> {
    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Failed to update todo',
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating todo:', error);
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  },

  // Delete a todo
  async deleteTodo(todoId: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Failed to delete todo',
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting todo:', error);
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  },

  // Get todos by status
  async getTodosByStatus(status: TodoStatus): Promise<ApiResponse<ITodo[]>> {
    try {
      const response = await fetch(`/api/todos?status=${status}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Failed to fetch todos by status',
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching todos by status:', error);
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  },
};
