import { Router } from 'express';
import { createTask, deleteTask, getTasks, updateTask } from '../controllers/task-controller';

const router = Router();

// Each line maps an HTTP method + URL → to a controller function
router.get('/',         getTasks);    // GET    /api/tasks
router.post('/',        createTask);  // POST   /api/tasks
router.put('/:id',      updateTask);  // PUT    /api/tasks/1
router.delete('/:id',   deleteTask);  // DELETE /api/tasks/1

export default router;