import { NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';
import { Server as NetServer, Socket } from 'net';
import { ITodo } from '@/types/todo';

export interface NextApiResponseServerIO extends NextApiResponse {
  socket: Socket & {
    server: NetServer & {
      io: ServerIO;
    };
  };
}

export interface TodoChangeEvent {
  type: 'added' | 'updated' | 'deleted';
  todo?: ITodo;
  todoId?: string;
}

export interface SocketEvents {
  'join-list': (listId: string) => void;
  'leave-list': (listId: string) => void;
  'todo-updated': (data: { listId: string; todo: ITodo }) => void;
  'todo-added': (data: { listId: string; todo: ITodo }) => void;
  'todo-deleted': (data: { listId: string; todoId: string }) => void;
  'todo-changed': (event: TodoChangeEvent) => void;
}
