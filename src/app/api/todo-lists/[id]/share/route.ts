import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/backend';
import dbConnect from '../../../../../lib/mongodb';
import TodoList from '../../../../../models/TodoList';

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function POST(
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

    const { email } = await request.json();
    
    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    await dbConnect();
    
    // Find the todo list and verify ownership
    const todoList = await TodoList.findById(params.id);
    if (!todoList) {
      return NextResponse.json(
        { error: 'Todo list not found' },
        { status: 404 }
      );
    }

    if (todoList.userId !== userId) {
      return NextResponse.json(
        { error: 'Only the owner can share this list' },
        { status: 403 }
      );
    }

    // Validate that the email corresponds to an existing Clerk user
    let targetUser;
    try {
      const users = await clerkClient.users.getUserList({
        emailAddress: [email.trim()],
      });
      
      if (users.data.length === 0) {
        return NextResponse.json(
          { error: 'No user found with this email address' },
          { status: 404 }
        );
      }
      
      targetUser = users.data[0];
    } catch (clerkError) {
      console.error('Error validating user with Clerk:', clerkError);
      return NextResponse.json(
        { error: 'Error validating user' },
        { status: 500 }
      );
    }

    // Check if already shared with this user
    if (todoList.sharedWith.includes(targetUser.id)) {
      return NextResponse.json(
        { error: 'List is already shared with this user' },
        { status: 400 }
      );
    }

    // Don't allow sharing with the owner
    if (targetUser.id === userId) {
      return NextResponse.json(
        { error: 'Cannot share list with yourself' },
        { status: 400 }
      );
    }

    // Add user to shared list
    todoList.sharedWith.push(targetUser.id);
    await todoList.save();

    return NextResponse.json({
      success: true,
      message: `List shared successfully with ${email}`,
      sharedUser: {
        id: targetUser.id,
        email: targetUser.emailAddresses[0]?.emailAddress,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
      }
    });

  } catch (error) {
    console.error('Error sharing todo list:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get list of users the list is shared with
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
    
    const todoList = await TodoList.findById(params.id);
    if (!todoList) {
      return NextResponse.json(
        { error: 'Todo list not found' },
        { status: 404 }
      );
    }

    // Check if user has access (owner or shared user)
    if (todoList.userId !== userId && !todoList.sharedWith.includes(userId)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get user details from Clerk for shared users
    const sharedUsers = [];
    if (todoList.sharedWith.length > 0) {
      try {
        const users = await clerkClient.users.getUserList({
          userId: todoList.sharedWith,
        });
        
        for (const user of users.data) {
          sharedUsers.push({
            id: user.id,
            email: user.emailAddresses[0]?.emailAddress,
            firstName: user.firstName,
            lastName: user.lastName,
          });
        }
      } catch (clerkError) {
        console.error('Error fetching shared users from Clerk:', clerkError);
      }
    }

    return NextResponse.json({
      success: true,
      sharedUsers,
      isOwner: todoList.userId === userId,
    });

  } catch (error) {
    console.error('Error fetching shared users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
