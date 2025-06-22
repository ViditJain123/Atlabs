import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Todo from '@/models/Todo';
import List from '@/models/List';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const listId = searchParams.get('listId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    
    // Build query object
    const query: Record<string, string> = {};
    
    if (listId) {
      if (!mongoose.Types.ObjectId.isValid(listId)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid list ID',
          },
          { status: 400 }
        );
      }
      query.listId = listId;
    }
    
    if (status && ['to-do', 'in progress', 'completed'].includes(status)) {
      query.status = status;
    }
    
    if (priority && ['high', 'medium', 'low'].includes(priority)) {
      query.priority = priority;
    }
    
    const todos = await Todo.find(query)
      .populate('listId', 'listName')
      .sort({ createdOn: -1 });
    
    return NextResponse.json({
      success: true,
      data: todos,
    });
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch todos',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { taskName, status, priority, listId, type } = body;
    
    if (!taskName) {
      return NextResponse.json(
        {
          success: false,
          error: 'Task name is required',
        },
        { status: 400 }
      );
    }
    
    if (!listId || !mongoose.Types.ObjectId.isValid(listId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Valid list ID is required',
        },
        { status: 400 }
      );
    }
    
    // Check if the list exists
    const list = await List.findById(listId);
    if (!list) {
      return NextResponse.json(
        {
          success: false,
          error: 'List not found',
        },
        { status: 404 }
      );
    }
    
    const newTodo = new Todo({
      taskName: taskName.trim(),
      status: status || 'to-do',
      priority: priority || 'medium',
      listId,
      type: type || false,
    });
    
    const savedTodo = await newTodo.save();
    
    // Populate the listId field before returning
    await savedTodo.populate('listId', 'listName');
    
    return NextResponse.json({
      success: true,
      data: savedTodo,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating todo:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create todo',
      },
      { status: 500 }
    );
  }
}
