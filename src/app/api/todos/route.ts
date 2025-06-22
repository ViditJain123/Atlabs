import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb';
import Todo from '@/models/Todo';
import TodoList from '@/models/TodoList';
import { TodoStatus, TodoPriority } from '@/types/todo';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const listId = searchParams.get('listId');
    const status = searchParams.get('status');

    if (listId) {
      // Verify user has access to this list
      const todoList = await TodoList.findById(listId);
      if (!todoList || (todoList.userId !== userId && !todoList.sharedWith.includes(userId))) {
        return NextResponse.json(
          { success: false, error: 'Access denied to this list' },
          { status: 403 }
        );
      }
    }

    // For shared lists, we need to find todos in lists the user has access to
    let accessibleListIds = [];
    if (!listId) {
      // Find all lists user has access to
      const accessibleLists = await TodoList.find({
        $or: [
          { userId },
          { sharedWith: userId }
        ]
      }, '_id');
      accessibleListIds = accessibleLists.map(list => list._id.toString());
    }

    const query: Record<string, string | object> = {};

    if (listId) {
      query.listId = listId;
    } else {
      query.listId = { $in: accessibleListIds };
    }

    if (status && Object.values(TodoStatus).includes(status as TodoStatus)) {
      query.status = status;
    }

    const todos = await Todo.find(query)
      .sort({ createdOn: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: todos,
    });

  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { taskName, type, status, priority, listId } = body;

    // Validation
    if (!taskName || !listId) {
      return NextResponse.json(
        { success: false, error: 'Task name and list ID are required' },
        { status: 400 }
      );
    }

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

    // Verify user has access to the list
    const todoList = await TodoList.findById(listId);
    if (!todoList) {
      return NextResponse.json(
        { success: false, error: 'Todo list not found' },
        { status: 404 }
      );
    }

    if (todoList.userId !== userId && !todoList.sharedWith.includes(userId)) {
      return NextResponse.json(
        { success: false, error: 'Access denied to this list' },
        { status: 403 }
      );
    }

    const newTodo = new Todo({
      taskName,
      type: type || false,
      status: status || TodoStatus.TODO,
      priority: priority || TodoPriority.MEDIUM,
      listId,
      userId,
      createdOn: new Date(),
    });

    const savedTodo = await newTodo.save();

    return NextResponse.json({
      success: true,
      data: savedTodo,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating todo:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
