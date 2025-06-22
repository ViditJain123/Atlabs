import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import List from '@/models/List';

export async function GET() {
  try {
    await connectDB();
    
    const lists = await List.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: lists,
    });
  } catch (error) {
    console.error('Error fetching lists:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch lists',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { listName } = body;
    
    if (!listName) {
      return NextResponse.json(
        {
          success: false,
          error: 'List name is required',
        },
        { status: 400 }
      );
    }
    
    const newList = new List({
      listName: listName.trim(),
    });
    
    const savedList = await newList.save();
    
    return NextResponse.json({
      success: true,
      data: savedList,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating list:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create list',
      },
      { status: 500 }
    );
  }
}
