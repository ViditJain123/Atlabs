import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Todo from '@/models/Todo';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid todo ID',
        },
        { status: 400 }
      );
    }
    
    const todo = await Todo.findById(id).populate('listId', 'listName');
    
    if (!todo) {
      return NextResponse.json(
        {
          success: false,
          error: 'Todo not found',
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: todo,
    });
  } catch (error) {
    console.error('Error fetching todo:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch todo',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const body = await request.json();
    const { taskName, status, priority, type } = body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid todo ID',
        },
        { status: 400 }
      );
    }
    
    // Build update object
    const updateData: Record<string, string | boolean> = {};
    
    if (taskName !== undefined) {
      updateData.taskName = taskName.trim();
    }
    
    if (status !== undefined && ['to-do', 'in progress', 'completed'].includes(status)) {
      updateData.status = status;
    }
    
    if (priority !== undefined && ['high', 'medium', 'low'].includes(priority)) {
      updateData.priority = priority;
    }
    
    if (type !== undefined) {
      updateData.type = type;
    }
    
    const updatedTodo = await Todo.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('listId', 'listName');
    
    if (!updatedTodo) {
      return NextResponse.json(
        {
          success: false,
          error: 'Todo not found',
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updatedTodo,
    });
  } catch (error) {
    console.error('Error updating todo:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update todo',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid todo ID',
        },
        { status: 400 }
      );
    }
    
    const deletedTodo = await Todo.findByIdAndDelete(id);
    
    if (!deletedTodo) {
      return NextResponse.json(
        {
          success: false,
          error: 'Todo not found',
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Todo deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting todo:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete todo',
      },
      { status: 500 }
    );
  }
}
