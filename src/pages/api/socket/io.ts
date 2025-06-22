import { Server as NetServer } from 'http';
import { NextApiRequest } from 'next';
import { Server as ServerIO } from 'socket.io';
import { NextApiResponseServerIO } from '@/types/socket';
import { ITodo } from '@/types/todo';

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    const path = '/api/socket/io';
    const httpServer = res.socket.server as NetServer;
    const io = new ServerIO(httpServer, {
      path: path,
      addTrailingSlash: false,
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.NEXT_PUBLIC_APP_URL 
          : 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Join a room for a specific todo list
      socket.on('join-list', (listId: string) => {
        socket.join(listId);
        console.log(`User ${socket.id} joined list ${listId}`);
      });

      // Leave a room
      socket.on('leave-list', (listId: string) => {
        socket.leave(listId);
        console.log(`User ${socket.id} left list ${listId}`);
      });

      // Handle todo updates
      socket.on('todo-updated', (data: { listId: string; todo: ITodo }) => {
        socket.to(data.listId).emit('todo-changed', {
          type: 'updated',
          todo: data.todo,
        });
      });

      // Handle new todos
      socket.on('todo-added', (data: { listId: string; todo: ITodo }) => {
        socket.to(data.listId).emit('todo-changed', {
          type: 'added',
          todo: data.todo,
        });
      });

      // Handle todo deletions
      socket.on('todo-deleted', (data: { listId: string; todoId: string }) => {
        socket.to(data.listId).emit('todo-changed', {
          type: 'deleted',
          todoId: data.todoId,
        });
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });

    res.socket.server.io = io;
  }

  res.end();
};

export default ioHandler;
