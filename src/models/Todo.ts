import mongoose, { Schema, Document } from 'mongoose';
import List from './List';

export interface ITodo extends Document {
  type: boolean;
  taskName: string;
  status: 'to-do' | 'in progress' | 'completed';
  createdOn: Date;
  priority: 'high' | 'medium' | 'low';
  listId: mongoose.Types.ObjectId;
}

const TodoSchema: Schema = new Schema({
  type: {
    type: Boolean,
    default: false,
  },
  taskName: {
    type: String,
    required: [true, 'Task name is required'],
    trim: true,
  },
  status: {
    type: String,
    enum: ['to-do', 'in progress', 'completed'],
    default: 'to-do',
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium',
  },
  listId: {
    type: Schema.Types.ObjectId,
    ref: 'List',
    required: [true, 'List ID is required'],
  },
});

// Pre-save middleware to sync type and status
TodoSchema.pre('save', function (next) {
  // If type is true, status should be completed
  if (this.type === true && this.status !== 'completed') {
    this.status = 'completed';
  }
  
  // If status is completed, type should be true
  if (this.status === 'completed' && this.type !== true) {
    this.type = true;
  }
  
  // If status is not completed, type should be false
  if (this.status !== 'completed' && this.type === true) {
    this.type = false;
  }
  
  next();
});

// Pre-update middleware to sync type and status for findOneAndUpdate operations
TodoSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function (next) {
  const update = this.getUpdate() as Partial<ITodo>;
  
  if (update) {
    // If type is being set to true, status should be completed
    if (update.type === true && update.status !== 'completed') {
      update.status = 'completed';
    }
    
    // If status is being set to completed, type should be true
    if (update.status === 'completed' && update.type !== true) {
      update.type = true;
    }
    
    // If status is not completed, type should be false
    if (update.status && update.status !== 'completed' && update.type !== false) {
      update.type = false;
    }
  }
  
  next();
});

// Post-save middleware to update totalTasks in the parent list
TodoSchema.post('save', async function (doc) {
  try {
    const totalTasks = await mongoose.model('Todo').countDocuments({ listId: doc.listId });
    await List.findByIdAndUpdate(doc.listId, { totalTasks });
  } catch (error) {
    console.error('Error updating totalTasks after save:', error);
  }
});

// Post-remove middleware to update totalTasks in the parent list
TodoSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    try {
      const totalTasks = await mongoose.model('Todo').countDocuments({ listId: doc.listId });
      await List.findByIdAndUpdate(doc.listId, { totalTasks });
    } catch (error) {
      console.error('Error updating totalTasks after delete:', error);
    }
  }
});

// Create indexes for better performance
TodoSchema.index({ listId: 1, createdOn: -1 });
TodoSchema.index({ status: 1 });
TodoSchema.index({ priority: 1 });

export default mongoose.models.Todo || mongoose.model<ITodo>('Todo', TodoSchema);
