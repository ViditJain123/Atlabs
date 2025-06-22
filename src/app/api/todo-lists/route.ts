import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '../../../lib/mongodb';
import TodoList from '../../../models/TodoList';
import Todo from '../../../models/Todo';
import { TodoStatus } from '../../../types/todo';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    // Find lists owned by user or shared with user
    const todoLists = await TodoList.find({
      $or: [
        { userId },
        { sharedWith: userId }
      ]
    }).sort({ createdAt: -1 });
    
    // For each todo list, get the todo count and completion percentage
    const todoListsWithStats = await Promise.all(
      todoLists.map(async (list) => {
        const listId = list._id.toString();
        
        // Get total todos count for this list
        const totalTodos = await Todo.countDocuments({ listId });
        
        // Get completed todos count for this list
        const completedTodos = await Todo.countDocuments({ 
          listId, 
          status: TodoStatus.COMPLETED 
        });
        
        // Calculate completion percentage
        const completionPercentage = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;
        
        return {
          ...list.toObject(),
          todoCount: totalTodos,
          completedCount: completedTodos,
          completionPercentage
        };
      })
    );
    
    return NextResponse.json({
      success: true,
      data: todoListsWithStats,
    });
  } catch (error) {
    console.error('Error fetching todo lists:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name } = await request.json();
    
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'List name is required' },
        { status: 400 }
      );
    }

    await dbConnect();
    
    const todoList = new TodoList({
      name: name.trim(),
      userId,
    });
    
    await todoList.save();
    
    return NextResponse.json({
      success: true,
      data: todoList,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating todo list:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const listId = searchParams.get('id');
    
    if (!listId) {
      return NextResponse.json(
        { error: 'List ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();
    
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
    
    // Delete all todos in this list
    await Todo.deleteMany({ listId });
    
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
