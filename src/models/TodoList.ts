import mongoose, { Schema, Document } from 'mongoose';

export interface ITodoList extends Document {
  _id: string;
  listName: string;
  userId: string; // Owner of the list
  sharedWith: string[]; // Array of user IDs who have access to this list
  createdAt: Date;
  updatedAt: Date;
  totalTasks: number; // Total number of tasks in the list
  todoCount?: number; // Total number of todos in the list (computed)
  completedCount?: number; // Number of completed todos (computed)
  completionPercentage?: number; // Percentage of completed todos (computed)
}

const TodoListSchema: Schema = new Schema(
  {
    listName: {
      type: String,
      required: [true, 'List name is required'],
      trim: true,
      maxlength: [100, 'List name cannot exceed 100 characters'],
    },
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
    },
    sharedWith: [{
      type: String,
      index: true,
    }],
    totalTasks: {
      type: Number,
      default: 0,
      min: [0, 'Total tasks cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

// Create index for better query performance
TodoListSchema.index({ userId: 1, createdAt: -1 });
TodoListSchema.index({ sharedWith: 1 });

// Prevent model re-compilation during development
export default mongoose.models.TodoList || mongoose.model<ITodoList>('TodoList', TodoListSchema);
