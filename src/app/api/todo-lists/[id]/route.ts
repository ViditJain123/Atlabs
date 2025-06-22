import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb';
import TodoList from '@/models/TodoList';
import Todo from '@/models/Todo';
import { TodoStatus } from '@/types/todo';

// GET individual todo list
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const listId = params.id;
    
    // Find the todo list and verify access
    const todoList = await TodoList.findById(listId);
    
    if (!todoList) {
      return NextResponse.json(
        { error: 'Todo list not found' },
        { status: 404 }
      );
    }
    
    // Check if user has access (owner or shared with)
    if (todoList.userId !== userId && !todoList.sharedWith.includes(userId)) {
      return NextResponse.json(
        { error: 'Access denied to this list' },
        { status: 403 }
      );
    }
    
    // Get todo stats for this list
    const totalTodos = await Todo.countDocuments({ listId });
    const completedTodos = await Todo.countDocuments({ 
      listId, 
      status: TodoStatus.COMPLETED 
    });
    const completionPercentage = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;
    
    return NextResponse.json({
      success: true,
      data: {
        ...todoList.toObject(),
        todoCount: totalTodos,
        completedCount: completedTodos,
        completionPercentage
      },
    });
  } catch (error) {
    console.error('Error fetching todo list:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update todo list
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { listName } = await request.json();
    
    if (!listName || listName.trim().length === 0) {
      return NextResponse.json(
        { error: 'List name is required' },
        { status: 400 }
      );
    }

    await dbConnect();
    
    const listId = params.id;
    
    // Find the todo list and verify ownership
    const todoList = await TodoList.findById(listId);
    
    if (!todoList) {
      return NextResponse.json(
        { error: 'Todo list not found' },
        { status: 404 }
      );
    }
    
    // Only allow the owner to edit the list
    if (todoList.userId !== userId) {
      return NextResponse.json(
        { error: 'Only the owner can edit this list' },
        { status: 403 }
      );
    }
    
    // Update the list
    const updatedTodoList = await TodoList.findByIdAndUpdate(
      listId,
      { listName: listName.trim() },
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({
      success: true,
      data: updatedTodoList,
    });
  } catch (error) {
    console.error('Error updating todo list:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE todo list
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const listId = params.id;
    
    // Find the todo list and verify ownership
    const todoList = await TodoList.findById(listId);
    
    if (!todoList) {
      return NextResponse.json(
        { error: 'Todo list not found' },
        { status: 404 }
      );
    }
    
    // Only allow the owner to delete the list
    if (todoList.userId !== userId) {
      return NextResponse.json(
        { error: 'Only the owner can delete this list' },
        { status: 403 }
      );
    }
    
    // Delete all todos in this list first
    await Todo.deleteMany({ listId });
    
    // Update the totalTasks to 0 since we're deleting the whole list
    await TodoList.findByIdAndUpdate(listId, { totalTasks: 0 });
    
    // Delete the todo list
    await TodoList.findByIdAndDelete(listId);
    
    return NextResponse.json({
      success: true,
      message: 'Todo list and all its todos deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting todo list:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
