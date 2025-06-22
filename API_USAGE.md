# API Usage Examples

This document provides examples of how to use the to-do application backend API.

## Models

### List Model
- `listName` (String, required): Name of the list
- `createdAt` (Date, default: Date.now): Timestamp when created
- `totalTasks` (Number, default: 0): Total number of tasks (auto-updated)

### Todo Model
- `type` (Boolean): Checkbox state for completion
- `taskName` (String, required): Name of the task
- `status` (Enum: "to-do", "in progress", "completed"): Task status
- `createdOn` (Date, default: Date.now): When the task was created
- `priority` (Enum: "high", "medium", "low"): Task priority
- `listId` (ObjectId): Reference to the parent list

## API Endpoints

### Lists

#### GET /api/lists
Get all lists
```typescript
const response = await apiClient.getLists();
```

#### POST /api/lists
Create a new list
```typescript
const response = await apiClient.createList({
  listName: "Work Tasks"
});
```

#### GET /api/lists/[id]
Get a specific list
```typescript
const response = await apiClient.getList("list_id_here");
```

#### PUT /api/lists/[id]
Update a list
```typescript
const response = await apiClient.updateList("list_id_here", {
  listName: "Updated Work Tasks"
});
```

#### DELETE /api/lists/[id]
Delete a list (and all its todos)
```typescript
const response = await apiClient.deleteList("list_id_here");
```

### Todos

#### GET /api/todos
Get all todos (with optional filters)
```typescript
// Get all todos
const response = await apiClient.getTodos();

// Get todos for a specific list
const response = await apiClient.getTodos({ listId: "list_id_here" });

// Get completed todos
const response = await apiClient.getTodos({ status: "completed" });

// Get high priority todos
const response = await apiClient.getTodos({ priority: "high" });
```

#### POST /api/todos
Create a new todo
```typescript
const response = await apiClient.createTodo({
  taskName: "Complete project documentation",
  status: "to-do",
  priority: "high",
  listId: "list_id_here",
  type: false
});
```

#### GET /api/todos/[id]
Get a specific todo
```typescript
const response = await apiClient.getTodo("todo_id_here");
```

#### PUT /api/todos/[id]
Update a todo
```typescript
// Mark as completed (both ways work due to auto-sync)
const response1 = await apiClient.updateTodo("todo_id_here", {
  type: true  // This will auto-set status to "completed"
});

const response2 = await apiClient.updateTodo("todo_id_here", {
  status: "completed"  // This will auto-set type to true
});

// Change priority
const response = await apiClient.updateTodo("todo_id_here", {
  priority: "low"
});

// Update task name
const response = await apiClient.updateTodo("todo_id_here", {
  taskName: "Updated task name"
});
```

#### DELETE /api/todos/[id]
Delete a todo
```typescript
const response = await apiClient.deleteTodo("todo_id_here");
```

#### GET /api/lists/[listId]/todos
Get all todos for a specific list
```typescript
const response = await apiClient.getTodosForList("list_id_here");

// With filters
const response = await apiClient.getTodosForList("list_id_here", {
  status: "completed",
  priority: "high"
});
```

## Utility Methods

### Toggle Todo Completion
```typescript
// Toggle completion state (completed ↔ not completed)
const response = await apiClient.toggleTodoCompletion("todo_id_here");
```

### Change Todo Status
```typescript
// Change status directly
const response = await apiClient.changeTodoStatus("todo_id_here", "in progress");
```

## Auto-Sync Logic

The backend automatically maintains consistency between `type` and `status` fields:

1. **When `type` is set to `true`**: `status` automatically becomes `"completed"`
2. **When `status` is set to `"completed"`**: `type` automatically becomes `true`
3. **When `status` is set to anything other than `"completed"`**: `type` automatically becomes `false`

This ensures the checkbox state and status are always synchronized.

## totalTasks Auto-Update

The `totalTasks` field in each List is automatically updated when:
- A todo is added to the list
- A todo is removed from the list

This happens via Mongoose middleware, so you don't need to manually update this field.

## Example React Component Usage

```typescript
'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { List, Todo } from '@/types/api';

export default function TodoApp() {
  const [lists, setLists] = useState<List[]>([]);
  const [selectedList, setSelectedList] = useState<List | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    const response = await apiClient.getLists();
    if (response.success && response.data) {
      setLists(response.data);
    }
  };

  const loadTodos = async (listId: string) => {
    const response = await apiClient.getTodosForList(listId);
    if (response.success && response.data) {
      setSelectedList(response.data.list);
      setTodos(response.data.todos);
    }
  };

  const createList = async (listName: string) => {
    const response = await apiClient.createList({ listName });
    if (response.success) {
      loadLists();
    }
  };

  const toggleTodo = async (todoId: string) => {
    const response = await apiClient.toggleTodoCompletion(todoId);
    if (response.success && selectedList) {
      loadTodos(selectedList._id);
    }
  };

  // ... rest of component
}
```

## Error Handling

All API responses follow this structure:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

Always check the `success` field before using the `data`:
```typescript
const response = await apiClient.createTodo(todoData);
if (response.success && response.data) {
  // Handle success
  console.log('Todo created:', response.data);
} else {
  // Handle error
  console.error('Error:', response.error);
}
```
