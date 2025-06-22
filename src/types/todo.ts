// Enums for Todo properties
export enum TodoStatus {
  TODO = 'to-do',
  IN_PROGRESS = 'in progress',
  COMPLETED = 'completed'
}

export enum TodoPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

// Client-side interface (without mongoose Document)
export interface ITodo {
  _id: string;
  taskName: string;
  type: boolean;
  status: TodoStatus;
  priority: TodoPriority;
  createdOn: Date;
  listId: string;
  userId: string;
  updatedAt: Date;
}

// Client-side interface for TodoList (without mongoose Document)
export interface ITodoList {
  _id: string;
  listName: string;
  userId: string;
  sharedWith: string[];
  createdAt: Date;
  updatedAt: Date;
  totalTasks: number;
  todoCount?: number; // Computed field
  completedCount?: number; // Computed field
  completionPercentage?: number; // Computed field
}
