import mongoose, { Schema, Document } from 'mongoose';

export interface IList extends Document {
  listName: string;
  createdAt: Date;
  totalTasks: number;
}

const ListSchema: Schema = new Schema({
  listName: {
    type: String,
    required: [true, 'List name is required'],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  totalTasks: {
    type: Number,
    default: 0,
    min: 0,
  },
});

// Create index for better performance
ListSchema.index({ createdAt: -1 });

export default mongoose.models.List || mongoose.model<IList>('List', ListSchema);
