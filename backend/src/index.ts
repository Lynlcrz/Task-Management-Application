import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import taskRoutes from './routes/task-routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

//  Middleware setup
app.use(cors({ origin: 'http://localhost:5173' })); // allow requests from Vite dev server
app.use(express.json());

// Routes for task management
app.use('/api/tasks', taskRoutes);

//  Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Task Manager API is running ✅' });
});

//  Start server on specified port
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});