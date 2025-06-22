# Backend Implementation Guide

## 🚀 Backend Overview

This backend implementation provides a complete API for a collaborative to-do application with MongoDB, featuring automatic synchronization between todo completion status and the checkbox state, along with dynamic task counting.

## 📊 Data Models

### List Model (`TodoList`)
```typescript
{
  listName: String (required),     // Name of the list
  createdAt: Date (auto),          // Creation timestamp  
  totalTasks: Number (default: 0), // Total number of tasks (auto-managed)
  userId: String (required),       // Owner of the list
  sharedWith: [String],           // Array of user IDs with access
  updatedAt: Date (auto)          // Last update timestamp
}
```

### To-do Model (`Todo`)
```typescript
{
  type: Boolean (required),              // Checkbox state (true = completed)
  taskName: String (required),           // Name of the task
  status: Enum["to-do", "in progress", "completed"], // Task status
  createdOn: Date (auto),               // Creation timestamp
  priority: Enum["high", "medium", "low"], // Task priority
  listId: String (required),            // Reference to parent list
  userId: String (required),            // Creator of the task
  updatedAt: Date (auto)               // Last update timestamp
}
```

## 🔄 Automatic Synchronization Logic

The backend automatically maintains consistency between `type` (checkbox) and `status` fields:

- ✅ **When `type` = `true`** → `status` automatically becomes `"completed"`
- ✅ **When `status` = `"completed"`** → `type` automatically becomes `true`
- ✅ **When `status` ≠ `"completed"`** → `type` automatically becomes `false`
- ✅ **When `type` = `false`** and `status` = `"completed"` → `status` becomes `"to-do"`

This sync happens automatically in both create and update operations using Mongoose middleware.

## 📈 Dynamic Task Counting

The `totalTasks` field in each list is automatically maintained:

- **➕ Creating a todo** → `totalTasks` increments by 1
- **➖ Deleting a todo** → `totalTasks` decrements by 1
- **🗑️ Deleting a list** → All todos deleted, `totalTasks` reset to 0

## 🛠️ API Endpoints

### Lists Management

#### Get All Lists
```http
GET /api/todo-lists
```
Returns all lists owned by or shared with the authenticated user, including computed statistics.

#### Create New List
```http
POST /api/todo-lists
Content-Type: application/json

{
  "listName": "My New List"
}
```

#### Get Single List
```http
GET /api/todo-lists/{id}
```

#### Update List
```http
PUT /api/todo-lists/{id}
Content-Type: application/json

{
  "listName": "Updated List Name"
}
```

#### Delete List
```http
DELETE /api/todo-lists/{id}
```
⚠️ **Note**: Deletes all todos in the list as well.

#### Sync totalTasks (Utility)
```http
POST /api/todo-lists/sync
```
Recalculates and syncs `totalTasks` for all user lists.

### Todos Management

#### Get Todos
```http
GET /api/todos?listId={listId}&status={status}
```

#### Create Todo
```http
POST /api/todos
Content-Type: application/json

{
  "taskName": "Complete project setup",
  "type": false,
  "status": "to-do",
  "priority": "high",
  "listId": "list_id_here"
}
```

#### Update Todo
```http
PUT /api/todos/{id}
Content-Type: application/json

{
  "taskName": "Updated task name",
  "type": true,  // This will auto-set status to "completed"
  "priority": "medium"
}
```

#### Delete Todo
```http
DELETE /api/todos/{id}
```

## 🔧 Setup Instructions

### 1. Environment Configuration
Copy `.env.local.example` to `.env.local` and configure:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/atlabs-todo

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key_here
CLERK_SECRET_KEY=your_secret_key_here
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

## 🧪 Example Use Cases

### Case 1: Add New Todo
```javascript
// POST /api/todos
{
  "taskName": "Review code",
  "type": false,
  "status": "to-do", 
  "priority": "medium",
  "listId": "list123"
}
// Result: todo created, totalTasks incremented
```

### Case 2: Mark Todo as Complete
```javascript
// PUT /api/todos/todo123
{
  "type": true
}
// Result: status automatically becomes "completed"
```

### Case 3: Change Status to Completed
```javascript
// PUT /api/todos/todo123  
{
  "status": "completed"
}
// Result: type automatically becomes true
```

### Case 4: Delete Todo
```javascript
// DELETE /api/todos/todo123
// Result: todo deleted, totalTasks decremented
```

## 🔒 Security Features

- **Authentication**: Clerk-based user authentication
- **Authorization**: Users can only access their own lists or shared lists
- **Data Validation**: Comprehensive input validation on all endpoints
- **Error Handling**: Consistent error responses with appropriate HTTP status codes

## 🚨 Error Handling

All endpoints return consistent error responses:

```javascript
{
  "success": false,
  "error": "Error message here"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden (access denied)
- `404` - Not Found
- `500` - Internal Server Error

## 📝 Notes

- The sync logic is implemented using Mongoose middleware for reliability
- `totalTasks` is automatically managed but can be manually synced using the sync endpoint
- All dates are stored as ISO strings
- The API supports collaborative features through the `sharedWith` field
- Enum values are lowercase with hyphens for consistency
