"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { TodoChangeEvent } from '@/types/socket';
import { ITodo } from '@/types/todo';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinList: (listId: string) => void;
  leaveList: (listId: string) => void;
  emitTodoAdded: (listId: string, todo: ITodo) => void;
  emitTodoUpdated: (listId: string, todo: ITodo) => void;
  emitTodoDeleted: (listId: string, todoId: string) => void;
  onTodoChange: (callback: (event: TodoChangeEvent) => void) => void;
  offTodoChange: (callback: (event: TodoChangeEvent) => void) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io({
      path: '/api/socket/io',
      addTrailingSlash: false,
    });

    socketInstance.on('connect', () => {
      console.log('Connected to socket server');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const joinList = (listId: string) => {
    if (socket) {
      socket.emit('join-list', listId);
    }
  };

  const leaveList = (listId: string) => {
    if (socket) {
      socket.emit('leave-list', listId);
    }
  };

  const emitTodoAdded = (listId: string, todo: ITodo) => {
    if (socket) {
      socket.emit('todo-added', { listId, todo });
    }
  };

  const emitTodoUpdated = (listId: string, todo: ITodo) => {
    if (socket) {
      socket.emit('todo-updated', { listId, todo });
    }
  };

  const emitTodoDeleted = (listId: string, todoId: string) => {
    if (socket) {
      socket.emit('todo-deleted', { listId, todoId });
    }
  };

  const onTodoChange = (callback: (event: TodoChangeEvent) => void) => {
    if (socket) {
      socket.on('todo-changed', callback);
    }
  };

  const offTodoChange = (callback: (event: TodoChangeEvent) => void) => {
    if (socket) {
      socket.off('todo-changed', callback);
    }
  };

  const contextValue: SocketContextType = {
    socket,
    isConnected,
    joinList,
    leaveList,
    emitTodoAdded,
    emitTodoUpdated,
    emitTodoDeleted,
    onTodoChange,
    offTodoChange,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};
