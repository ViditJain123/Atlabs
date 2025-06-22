import { ApiResponse, List, Todo, CreateListRequest, UpdateListRequest, CreateTodoRequest, UpdateTodoRequest } from '@/types/api';

const API_BASE = '/api';

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  }

  // List operations
  async getLists(): Promise<ApiResponse<List[]>> {
    return this.request<List[]>('/lists');
  }

  async getList(id: string): Promise<ApiResponse<List>> {
    return this.request<List>(`/lists/${id}`);
  }

  async createList(data: CreateListRequest): Promise<ApiResponse<List>> {
    return this.request<List>('/lists', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateList(id: string, data: UpdateListRequest): Promise<ApiResponse<List>> {
    return this.request<List>(`/lists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteList(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/lists/${id}`, {
      method: 'DELETE',
    });
  }

  // Todo operations
  async getTodos(params?: {
    listId?: string;
    status?: 'to-do' | 'in progress' | 'completed';
    priority?: 'high' | 'medium' | 'low';
  }): Promise<ApiResponse<Todo[]>> {
    const searchParams = new URLSearchParams();
    
    if (params?.listId) searchParams.append('listId', params.listId);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.priority) searchParams.append('priority', params.priority);
    
    const query = searchParams.toString();
    return this.request<Todo[]>(`/todos${query ? `?${query}` : ''}`);
  }

  async getTodo(id: string): Promise<ApiResponse<Todo>> {
    return this.request<Todo>(`/todos/${id}`);
  }

  async createTodo(data: CreateTodoRequest): Promise<ApiResponse<Todo>> {
    return this.request<Todo>('/todos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTodo(id: string, data: UpdateTodoRequest): Promise<ApiResponse<Todo>> {
    return this.request<Todo>(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTodo(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/todos/${id}`, {
      method: 'DELETE',
    });
  }

  // Get todos for a specific list
  async getTodosForList(listId: string, params?: {
    status?: 'to-do' | 'in progress' | 'completed';
    priority?: 'high' | 'medium' | 'low';
  }): Promise<ApiResponse<{ list: List; todos: Todo[]; totalTodos: number }>> {
    const searchParams = new URLSearchParams();
    
    if (params?.status) searchParams.append('status', params.status);
    if (params?.priority) searchParams.append('priority', params.priority);
    
    const query = searchParams.toString();
    return this.request<{ list: List; todos: Todo[]; totalTodos: number }>(
      `/lists/${listId}/todos${query ? `?${query}` : ''}`
    );
  }

  // Utility methods for common operations
  async toggleTodoCompletion(id: string): Promise<ApiResponse<Todo>> {
    // First get the current todo
    const todoResponse = await this.getTodo(id);
    if (!todoResponse.success || !todoResponse.data) {
      return todoResponse;
    }

    const currentTodo = todoResponse.data;
    const newType = !currentTodo.type;
    
    return this.updateTodo(id, { type: newType });
  }

  async changeTodoStatus(id: string, status: 'to-do' | 'in progress' | 'completed'): Promise<ApiResponse<Todo>> {
    return this.updateTodo(id, { status });
  }
}

export const apiClient = new ApiClient();
