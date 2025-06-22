import mongoose, { Schema, Document } from 'mongoose';
import { TodoStatus, TodoPriority } from '@/types/todo';

export interface ITodo extends Document {
  _id: string;
  taskName: string;
  type: boolean;
  status: TodoStatus;
  priority: TodoPriority;
  createdOn: Date;
  listId: string; // Reference to TodoList
  userId: string;
  updatedAt: Date;
}

const TodoSchema: Schema = new Schema(
  {
    taskName: {
      type: String,
      required: [true, 'Task name is required'],
      trim: true,
      maxlength: [200, 'Task name cannot exceed 200 characters'],
    },
    type: {
      type: Boolean,
      required: true,
      default: false,
    },
    status: {
      type: String,
      enum: Object.values(TodoStatus),
      required: true,
      default: TodoStatus.TODO,
    },
    priority: {
      type: String,
      enum: Object.values(TodoPriority),
      required: true,
      default: TodoPriority.MEDIUM,
    },
    createdOn: {
      type: Date,
      default: Date.now,
      required: true,
    },
    listId: {
      type: String,
      required: [true, 'List ID is required'],
      index: true,
    },
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound indexes for better query performance
TodoSchema.index({ listId: 1, createdOn: -1 });
TodoSchema.index({ userId: 1, status: 1 });
TodoSchema.index({ userId: 1, priority: 1 });

// Prevent model re-compilation during development
export default mongoose.models.Todo || mongoose.model<ITodo>('Todo', TodoSchema);
