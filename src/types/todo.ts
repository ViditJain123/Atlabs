// Enums for Todo properties
export enum TodoStatus {
  TODO = 'to-do',
  IN_PROGRESS = 'in-progress',
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
