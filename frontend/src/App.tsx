import { ClipboardList } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import DeleteAlert from './components/deleteAlert';
import EditTaskModal from './components/editTaskModal';
import FilterBar from './components/filterBar';
import SearchBar from './components/searchBar';
import TaskItem from './components/taskItem';
import TaskModal from './components/taskModal';
import * as taskService from './services/taskService';
import type { FilterStatus, Task } from './types/taskType';

export default function App() {
  const [tasks,         setTasks]         = useState<Task[]>([]);
  const [search,        setSearch]        = useState('');
  const [filter,        setFilter]        = useState<FilterStatus>('all');
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');

  // Modal state (only one can be open at a time, so we track the relevant task for edit/delete)
  const [showAddModal,  setShowAddModal]  = useState(false);
  const [editingTask,   setEditingTask]   = useState<Task | null>(null);
  const [deletingTask,  setDeletingTask]  = useState<Task | null>(null);

  //  Load tasks with current search + filter
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await taskService.fetchTasks(search, filter);
      setTasks(data);
    } catch {
      setError('Could not load tasks. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  // Handlers for add, toggle, edit, delete
  const handleAdd = async (title: string, description: string) => {
    try {
      await taskService.createTask(title, description);
      setShowAddModal(false);
      loadTasks();
    } catch {
      setError('Failed to add task.');
    }
  };

  const handleToggle = async (id: number, status: 'active' | 'completed') => {
    try {
      await taskService.updateTask(id, { status });
      loadTasks();
    } catch {
      setError('Failed to update task.');
    }
  };

  const handleSaveEdit = async (id: number, title: string, description: string) => {
    try {
      await taskService.updateTask(id, { title, description });
      setEditingTask(null);
      loadTasks();
    } catch {
      setError('Failed to update task.');
    }
  };

  const handleConfirmDelete = async (id: number) => {
    try {
      await taskService.deleteTask(id);
      setDeletingTask(null);
      loadTasks();
    } catch {
      setError('Failed to delete task.');
    }
  };

  const doneCount  = tasks.filter(t => t.status === 'completed').length;
  const totalCount = tasks.length;

  return (
    <div className="min-h-screen bg-bg px-5 py-8">
      <div className="max-w-[660px] mx-auto">

        {/* Title */}
        <h1 className="flex items-center justify-center gap-2 text-xl font-semibold text-t1 text-center mb-6">
          <ClipboardList size={20} className="text-t1" />
          Task Manager
        </h1>

        {/* Search + Add task */}
        <div className="flex gap-2.5 items-center mb-3.5">
          <SearchBar search={search} onSearch={setSearch} />
          <button
            onClick={() => setShowAddModal(true)}
            className="
              flex items-center gap-1.5 bg-green
              border border-white/[0.18] hover:bg-green/[0.5] hover:border-white/25
              text-t1 text-sm font-medium px-4 py-2.5 rounded-[8px]
              transition-all whitespace-nowrap
            "
          >
            + Add task
          </button>
        </div>

        {/* Filters */}
        <FilterBar current={filter} onChange={setFilter} />

        {/* Meta count */}
        <p className="text-[13px] text-t2 mt-3.5 mb-3.5">
          {totalCount} task{totalCount !== 1 ? 's' : ''} shown · {doneCount}/{totalCount} completed
        </p>

        {/* Error banner */}
        {error && (
          <div className="bg-danger/10 border border-danger/20 text-danger text-sm px-4 py-3 rounded-[8px] mb-4">
            {error}
          </div>
        )}

        {/* Task list */}
        {loading ? (
          <p className="text-center text-t3 text-sm py-14">Loading tasks…</p>
        ) : tasks.length === 0 ? (
          <div className="text-center py-14">
            <p className="text-t3 text-lg">No tasks found.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {tasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleToggle}
                onEdit={() => setEditingTask(task)}
                onDelete={() => setDeletingTask(task)}
              />
            ))}
          </div>
        )}

      </div>

      {/* Add task modal */}
      {showAddModal && (
        <TaskModal
          onAdd={handleAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Edit task modal */}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onSave={handleSaveEdit}
          onClose={() => setEditingTask(null)}
        />
      )}

      {/* Delete confirmation */}
      {deletingTask && (
        <DeleteAlert
          task={deletingTask}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeletingTask(null)}
        />
      )}

    </div>
  );
}