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

// Middleware to sync type and status fields
TodoSchema.pre('save', function() {
  // If type is set to true, status must be "completed"
  if (this.type === true && this.status !== TodoStatus.COMPLETED) {
    this.status = TodoStatus.COMPLETED;
  }
  // If status is set to "completed", type must be true
  else if (this.status === TodoStatus.COMPLETED && this.type !== true) {
    this.type = true;
  }
  // If status is not "completed", type must be false
  else if (this.status !== TodoStatus.COMPLETED && this.type === true) {
    this.type = false;
  }
});

// Middleware to sync type and status fields for updates
TodoSchema.pre('findOneAndUpdate', function() {
  const update = this.getUpdate() as Record<string, unknown>;
  
  if (update) {
    // If type is being set to true, ensure status is "completed"
    if (update.type === true && update.status !== TodoStatus.COMPLETED) {
      this.set({ status: TodoStatus.COMPLETED });
    }
    // If status is being set to "completed", ensure type is true
    else if (update.status === TodoStatus.COMPLETED && update.type !== true) {
      this.set({ type: true });
    }
    // If status is being set to something other than "completed" and type is true, set type to false
    else if (update.status && update.status !== TodoStatus.COMPLETED && update.type === true) {
      this.set({ type: false });
    }
    // If type is being set to false and status is "completed", change status
    else if (update.type === false && update.status === TodoStatus.COMPLETED) {
      this.set({ status: TodoStatus.TODO });
    }
  }
});

// Middleware to update totalTasks when a todo is saved (created)
TodoSchema.post('save', async function() {
  const TodoList = mongoose.models.TodoList;
  if (TodoList && this.isNew) {
    await TodoList.findByIdAndUpdate(this.listId, {
      $inc: { totalTasks: 1 }
    });
  }
});

// Middleware to update totalTasks when a todo is deleted
TodoSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    const TodoList = mongoose.models.TodoList;
    if (TodoList) {
      await TodoList.findByIdAndUpdate(doc.listId, {
        $inc: { totalTasks: -1 }
      });
    }
  }
});

// Also handle deleteOne
TodoSchema.post('deleteOne', async function() {
  const docToDelete = await this.model.findOne(this.getQuery());
  if (docToDelete) {
    const TodoList = mongoose.models.TodoList;
    if (TodoList) {
      await TodoList.findByIdAndUpdate(docToDelete.listId, {
        $inc: { totalTasks: -1 }
      });
    }
  }
});

// Prevent model re-compilation during development
export default mongoose.models.Todo || mongoose.model<ITodo>('Todo', TodoSchema);
