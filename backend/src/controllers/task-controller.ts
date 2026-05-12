import { Request, Response } from 'express';
import pool from '../config/db';
import { CreateTaskBody, UpdateTaskBody } from '../types/task-types';

// ─── GET ALL TASKS (with search + filter) ────────────────────────────────────
export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    // These come from the URL: /api/tasks?search=homework&status=active
    const { search, status } = req.query;

    let query = 'SELECT * FROM tasks WHERE 1=1'; // 1=1 is a trick to make adding AND clauses easier
    const params: (string | number)[] = [];

    // If the user searched for something, filter by title
    if (search) {
      query += ' AND title LIKE ?';
      params.push(`%${search}%`); // % means "anything before/after the search word"
    }

    // If the user filtered by status (active/completed)
    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status as string);
    }

    query += ' ORDER BY created_at DESC'; // newest tasks first

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};

// ─── CREATE TASK ──────────────────────────────────────────────────────────────
export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description }: CreateTaskBody = req.body;

    // Validate — title is required
    if (!title || title.trim() === '') {
      res.status(400).json({ message: 'Title is required' });
      return;
    }

    const [result] = await pool.execute(
      'INSERT INTO tasks (title, description) VALUES (?, ?)',
      [title.trim(), description || null]
    );

    // Get the newly created task to return it to the frontend
    const insertId = (result as { insertId: number }).insertId;
    const [rows] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [insertId]);
    const tasks = rows as any[];

    res.status(201).json(tasks[0]); // 201 = Created
  } catch (error) {
    res.status(500).json({ message: 'Failed to create task' });
  }
};

// ─── UPDATE TASK ──────────────────────────────────────────────────────────────
export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, status }: UpdateTaskBody = req.body;

    // Build the update query dynamically — only update what was sent
    const fields: string[] = [];
    const params: (string | number)[] = [];

    if (title !== undefined) {
      if (title.trim() === '') {
        res.status(400).json({ message: 'Title cannot be empty' });
        return;
      }
      fields.push('title = ?');
      params.push(title.trim());
    }
    if (description !== undefined) {
      fields.push('description = ?');
      params.push(description);
    }
    if (status !== undefined) {
      fields.push('status = ?');
      params.push(status);
    }

    if (fields.length === 0) {
      res.status(400).json({ message: 'No fields to update' });
      return;
    }

    params.push(Number(id)); // the WHERE id = ? value

    await pool.execute(
      `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`,
      params
    );

    // Return the updated task
    const [rows] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [id]);
    const tasks = rows as any[];

    if (tasks.length === 0) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    res.json(tasks[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update task' });
  }
};

// ─── DELETE TASK ──────────────────────────────────────────────────────────────
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute('DELETE FROM tasks WHERE id = ?', [id]);
    const affectedRows = (result as { affectedRows: number }).affectedRows;

    if (affectedRows === 0) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete task' });
  }
};