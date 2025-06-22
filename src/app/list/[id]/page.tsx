'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTodoListStore } from '@/store/todoListStore';
import TodoDisplay from '@/app/components/TodoDisplay';
import { useTodoCollaboration } from '@/hooks/useTodoCollaboration';

export default function ListPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params.id as string;
  
  const [listName, setListName] = useState('');
  const { todoLists, fetchTodoLists } = useTodoListStore();
  
  // Initialize real-time collaboration for this list
  useTodoCollaboration(listId);

  useEffect(() => {
    if (todoLists.length === 0) {
      fetchTodoLists();
    }
  }, [todoLists.length, fetchTodoLists]);

  useEffect(() => {
    if (todoLists.length > 0) {
      const currentList = todoLists.find(list => list._id === listId);
      if (currentList) {
        setListName(currentList.name);
      } else {
        // List not found, redirect to dashboard
        router.push('/');
      }
    }
  }, [todoLists, listId, router]);

  if (!listName) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-800 mb-2 inline-flex items-center"
          >
            ← Back to Lists
          </button>
        </div>
      </div>
      
      <TodoDisplay listId={listId} listName={listName} />
    </div>
  );
}
