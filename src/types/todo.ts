// Enums for Todo properties
export enum TodoStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed'
}

export enum TodoPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
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
