import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import taskRoutes from './routes/task-routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:5173' })); // allow requests from Vite dev server
app.use(express.json()); // parse incoming JSON bodies

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/tasks', taskRoutes);

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Task Manager API is running ✅' });
});

// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});