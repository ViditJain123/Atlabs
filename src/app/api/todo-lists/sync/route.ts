import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb';
import TodoList from '@/models/TodoList';
import Todo from '@/models/Todo';

// POST - Sync totalTasks count for all user's lists
export async function POST() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    // Get all lists owned by the user
    const userLists = await TodoList.find({ userId });
    
    // Update totalTasks for each list
    const updatePromises = userLists.map(async (list) => {
      const totalTodos = await Todo.countDocuments({ listId: list._id.toString() });
      return TodoList.findByIdAndUpdate(list._id, { totalTasks: totalTodos });
    });
    
    await Promise.all(updatePromises);
    
    return NextResponse.json({
      success: true,
      message: `Synced totalTasks for ${userLists.length} lists`,
    });
  } catch (error) {
    console.error('Error syncing totalTasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
