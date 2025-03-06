'use client';

import { useState, useEffect } from 'react';
import { api, Todo } from '@/lib/api';

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTodos();
  }, []);

  async function loadTodos() {
    try {
      const fetchedTodos = await api.getTodos();
      setTodos(fetchedTodos);
      setError(null);
    } catch (err) {
      setError('Failed to load todos');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    try {
      const newTodo = await api.createTodo(newTodoTitle);
      setTodos([...todos, newTodo]);
      setNewTodoTitle('');
      setError(null);
    } catch (err) {
      setError('Failed to add todo');
    }
  }

  async function handleToggleTodo(todo: Todo) {
    try {
      const updatedTodo = await api.updateTodo({
        ...todo,
        completed: !todo.completed,
      });
      setTodos(todos.map(t => t.id === updatedTodo.id ? updatedTodo : t));
      setError(null);
    } catch (err) {
      setError('Failed to update todo');
    }
  }

  async function handleDeleteTodo(id: number) {
    try {
      await api.deleteTodo(id);
      setTodos(todos.filter(t => t.id !== id));
      setError(null);
    } catch (err) {
      setError('Failed to delete todo');
    }
  }

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Todo List</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleAddTodo} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              placeholder="Add a new todo..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add
            </button>
          </div>
        </form>

        <ul className="space-y-3">
          {todos.map(todo => (
            <li
              key={todo.id}
              className="flex items-center gap-3 bg-white p-4 rounded-lg shadow"
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggleTodo(todo)}
                className="h-5 w-5 text-blue-500"
              />
              <span className={`flex-1 ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                {todo.title}
              </span>
              <button
                onClick={() => handleDeleteTodo(todo.id)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>

        {todos.length === 0 && (
          <p className="text-center text-gray-500">No todos yet. Add one above!</p>
        )}
      </div>
    </div>
  );
}
