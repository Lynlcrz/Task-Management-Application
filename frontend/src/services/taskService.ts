import type { Task } from '../types/taskType';

const BASE_URL = 'http://localhost:8080/api/tasks';

//Fetch tasks (with optional search and filter
export const fetchTasks = async (search: string, status: string): Promise<Task[]> => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (status !== 'all') params.append('status', status);

  const res = await fetch(`${BASE_URL}?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
};

//Create new task
export const createTask = async (title: string, description: string): Promise<Task> => {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description }),
  });
  if (!res.ok) throw new Error('Failed to create task');
  return res.json();
};

//Update task
export const updateTask = async (id: number, data: Partial<Task>): Promise<Task> => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update task');
  return res.json();
};

//Delete task
export const deleteTask = async (id: number): Promise<void> => {
  const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete task');
};