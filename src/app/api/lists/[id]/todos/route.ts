import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Todo from '@/models/Todo';
import List from '@/models/List';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id: listId } = await params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    
    if (!mongoose.Types.ObjectId.isValid(listId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid list ID',
        },
        { status: 400 }
      );
    }
    
    // Check if list exists
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
    
    // Build query
    const query: Record<string, string> = { listId };
    
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
      data: {
        list,
        todos,
        totalTodos: todos.length,
      },
    });
  } catch (error) {
    console.error('Error fetching todos for list:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch todos for list',
      },
      { status: 500 }
    );
  }
}
