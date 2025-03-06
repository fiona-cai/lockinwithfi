export interface Todo {
    id: number;
    title: string;
    completed: boolean;
}

const API_BASE_URL = 'http://localhost:8000/api';

export const api = {
    async getTodos(): Promise<Todo[]> {
        const response = await fetch(`${API_BASE_URL}/todos`);
        if (!response.ok) throw new Error('Failed to fetch todos');
        return response.json();
    },

    async createTodo(title: string): Promise<Todo> {
        const response = await fetch(`${API_BASE_URL}/todos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title }),
        });
        if (!response.ok) throw new Error('Failed to create todo');
        return response.json();
    },

    async updateTodo(todo: Todo): Promise<Todo> {
        const response = await fetch(`${API_BASE_URL}/todos/${todo.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(todo),
        });
        if (!response.ok) throw new Error('Failed to update todo');
        return response.json();
    },

    async deleteTodo(id: number): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete todo');
    },
}; 