"use client";

import { useEffect } from 'react';
import { useTodoStore } from '@/store/todoStore';
import { useSocket } from '@/contexts/SocketContext';
import { TodoChangeEvent } from '@/types/socket';

export const useTodoCollaboration = (listId: string | null) => {
  const { 
    emitTodoAdded, 
    emitTodoUpdated, 
    emitTodoDeleted, 
    joinList, 
    leaveList, 
    onTodoChange, 
    offTodoChange 
  } = useSocket();
  
  const { 
    addTodoFromSocket, 
    updateTodoFromSocket, 
    deleteTodoFromSocket 
  } = useTodoStore();

  useEffect(() => {
    if (!listId) return;

    // Join the room for this list
    joinList(listId);

    // Handle incoming real-time changes
    const handleTodoChange = (event: TodoChangeEvent) => {
      switch (event.type) {
        case 'added':
          if (event.todo) {
            addTodoFromSocket(event.todo);
          }
          break;
        case 'updated':
          if (event.todo) {
            updateTodoFromSocket(event.todo);
          }
          break;
        case 'deleted':
          if (event.todoId) {
            deleteTodoFromSocket(event.todoId);
          }
          break;
      }
    };

    onTodoChange(handleTodoChange);

    // Cleanup when component unmounts or listId changes
    return () => {
      leaveList(listId);
      offTodoChange(handleTodoChange);
    };
  }, [listId, joinList, leaveList, onTodoChange, offTodoChange, addTodoFromSocket, updateTodoFromSocket, deleteTodoFromSocket]);

  // Return methods that components can use to emit events
  return {
    emitTodoAdded,
    emitTodoUpdated,
    emitTodoDeleted,
  };
};
