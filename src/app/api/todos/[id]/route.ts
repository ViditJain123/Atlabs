import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb';
import Todo from '@/models/Todo';
import TodoList from '@/models/TodoList';
import { TodoStatus, TodoPriority } from '@/types/todo';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: todoId } = await params;
    const body = await request.json();
    const { taskName, type, status, priority } = body;

    // Validation
    if (status && !Object.values(TodoStatus).includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status value' },
        { status: 400 }
      );
    }

    if (priority && !Object.values(TodoPriority).includes(priority)) {
      return NextResponse.json(
        { success: false, error: 'Invalid priority value' },
        { status: 400 }
      );
    }

    await dbConnect();

    // First find the todo to get the listId
    const existingTodo = await Todo.findById(todoId);
    if (!existingTodo) {
      return NextResponse.json(
        { success: false, error: 'Todo not found' },
        { status: 404 }
      );
    }

    // Verify user has access to the list
    const todoList = await TodoList.findById(existingTodo.listId);
    if (!todoList || (todoList.userId !== userId && !todoList.sharedWith.includes(userId))) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    const updateData: Partial<{
      taskName: string;
      type: boolean;
      status: TodoStatus;
      priority: TodoPriority;
    }> = {};
    if (taskName !== undefined) updateData.taskName = taskName;
    if (type !== undefined) updateData.type = type;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;

    const updatedTodo = await Todo.findOneAndUpdate(
      { _id: todoId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedTodo) {
      return NextResponse.json(
        { success: false, error: 'Todo not found' },
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
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: todoId } = await params;

    await dbConnect();

    // First find the todo to get the listId and verify access
    const existingTodo = await Todo.findById(todoId);
    if (!existingTodo) {
      return NextResponse.json(
        { success: false, error: 'Todo not found' },
        { status: 404 }
      );
    }

    // Verify user has access to the list
    const todoList = await TodoList.findById(existingTodo.listId);
    if (!todoList || (todoList.userId !== userId && !todoList.sharedWith.includes(userId))) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    const deletedTodo = await Todo.findByIdAndDelete(todoId);

    if (!deletedTodo) {
      return NextResponse.json(
        { success: false, error: 'Todo not found' },
        { status: 404 }
      );
    }

    // Manually update the totalTasks count in the parent list
    await TodoList.findByIdAndUpdate(deletedTodo.listId, {
      $inc: { totalTasks: -1 }
    });

    return NextResponse.json({
      success: true,
      message: 'Todo deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting todo:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
