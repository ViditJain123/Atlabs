export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface List {
  _id: string;
  listName: string;
  createdAt: string;
  totalTasks: number;
}

export interface Todo {
  _id: string;
  type: boolean;
  taskName: string;
  status: 'to-do' | 'in progress' | 'completed';
  createdOn: string;
  priority: 'high' | 'medium' | 'low';
  listId: string | List;
}

export interface CreateListRequest {
  listName: string;
}

export interface UpdateListRequest {
  listName: string;
}

export interface CreateTodoRequest {
  taskName: string;
  status?: 'to-do' | 'in progress' | 'completed';
  priority?: 'high' | 'medium' | 'low';
  listId: string;
  type?: boolean;
}

export interface UpdateTodoRequest {
  taskName?: string;
  status?: 'to-do' | 'in progress' | 'completed';
  priority?: 'high' | 'medium' | 'low';
  type?: boolean;
}
