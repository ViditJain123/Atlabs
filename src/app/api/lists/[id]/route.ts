import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import List from '@/models/List';
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
          error: 'Invalid list ID',
        },
        { status: 400 }
      );
    }
    
    const list = await List.findById(id);
    
    if (!list) {
      return NextResponse.json(
        {
          success: false,
          error: 'List not found',
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: list,
    });
  } catch (error) {
    console.error('Error fetching list:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch list',
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
    const { listName } = body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid list ID',
        },
        { status: 400 }
      );
    }
    
    if (!listName) {
      return NextResponse.json(
        {
          success: false,
          error: 'List name is required',
        },
        { status: 400 }
      );
    }
    
    const updatedList = await List.findByIdAndUpdate(
      id,
      { listName: listName.trim() },
      { new: true, runValidators: true }
    );
    
    if (!updatedList) {
      return NextResponse.json(
        {
          success: false,
          error: 'List not found',
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updatedList,
    });
  } catch (error) {
    console.error('Error updating list:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update list',
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
          error: 'Invalid list ID',
        },
        { status: 400 }
      );
    }
    
    // First, delete all todos in this list
    await Todo.deleteMany({ listId: id });
    
    // Then delete the list
    const deletedList = await List.findByIdAndDelete(id);
    
    if (!deletedList) {
      return NextResponse.json(
        {
          success: false,
          error: 'List not found',
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'List and all associated todos deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting list:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete list',
      },
      { status: 500 }
    );
  }
}
