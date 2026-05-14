import { Router } from 'express';
import { createTask, deleteTask, getTasks, updateTask } from '../controllers/task-controller';

const router = Router();

// Each line maps an HTTP method + URL → to a controller function
router.get('/',         getTasks);    // GET
router.post('/',        createTask);  // POST
router.put('/:id',      updateTask);  // PUT
router.delete('/:id',   deleteTask);  // DELETE

export default router;