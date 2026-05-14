import { ClipboardList } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import DeleteAlert from './components/deleteAlert';
import EditTaskModal from './components/editTaskModal';
import FilterBar from './components/filterBar';
import SearchBar from './components/searchBar';
import TaskItem from './components/taskItem';
import TaskModal from './components/taskModal';
import * as taskService from './services/taskService';
import type { FilterStatus, Task } from './types/taskType';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./components/ui/pagination";

type PendingDeletion = {
  task: Task;
  expiresAt: number;
  countdown: number;
};

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

  const getPageFromUrl = () => {
    const params = new URLSearchParams(globalThis.location.search);
    const pageParam = params.get('page');
    const pageNumber = Number(pageParam);
    return pageParam && Number.isInteger(pageNumber) && pageNumber > 0 ? pageNumber : 1;
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(getPageFromUrl);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [pendingDeletions, setPendingDeletions] = useState<PendingDeletion[]>([]);
  const pendingDeletionsRef = useRef<PendingDeletion[]>([]);
  const pendingTimerRefs = useRef<Record<number, number>>({});
  const countdownIntervalRef = useRef<number | null>(null);
  const itemsPerPage = 5;

  useEffect(() => {
    const params = new URLSearchParams(globalThis.location.search);
    if (currentPage === 1) {
      params.delete('page');
    } else {
      params.set('page', String(currentPage));
    }
    const search = params.toString();
    const newUrl = globalThis.location.pathname + (search ? `?${search}` : '');
    globalThis.history.replaceState(null, '', newUrl);
  }, [currentPage]);

  const firstLoadRef = useRef(true);

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

  useEffect(() => {
    if (firstLoadRef.current) {
      firstLoadRef.current = false;
      loadTasks();
      return;
    }

    setCurrentPage(1);
    loadTasks();
  }, [search, filter, loadTasks]);

  const savePendingDeletions = useCallback((items: PendingDeletion[]) => {
    pendingDeletionsRef.current = items;
    setPendingDeletions(items);

    if (items.length > 0) {
      globalThis.localStorage.setItem('pendingDeletions', JSON.stringify(items));
      globalThis.localStorage.removeItem('pendingDeletion');
    } else {
      globalThis.localStorage.removeItem('pendingDeletions');
      globalThis.localStorage.removeItem('pendingDeletion');
    }
  }, []);

  const clearPendingTimer = useCallback((taskId: number) => {
    const timerId = pendingTimerRefs.current[taskId];
    if (timerId !== undefined) {
      globalThis.clearTimeout(timerId);
      delete pendingTimerRefs.current[taskId];
    }
  }, []);

  const clearCountdownTimerIfIdle = useCallback(() => {
    if (pendingDeletionsRef.current.length > 0) return;

    if (countdownIntervalRef.current !== null) {
      globalThis.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const startCountdownTimer = useCallback(() => {
    if (countdownIntervalRef.current !== null) return;

    countdownIntervalRef.current = globalThis.setInterval(() => {
      const next = pendingDeletionsRef.current.map(item => ({
        ...item,
        countdown: Math.max(0, Math.ceil((item.expiresAt - Date.now()) / 1000)),
      }));

      savePendingDeletions(next);
      clearCountdownTimerIfIdle();
    }, 1000);
  }, [clearCountdownTimerIfIdle, savePendingDeletions]);

  const removePendingDeletion = useCallback((taskId: number) => {
    clearPendingTimer(taskId);
    const next = pendingDeletionsRef.current.filter(item => item.task.id !== taskId);
    savePendingDeletions(next);
    clearCountdownTimerIfIdle();
  }, [clearCountdownTimerIfIdle, clearPendingTimer, savePendingDeletions]);

  const commitPendingDeletion = useCallback(async (taskId: number) => {
    const pending = pendingDeletionsRef.current.find(item => item.task.id === taskId);
    if (!pending) return;

    removePendingDeletion(taskId);

    try {
      await taskService.deleteTask(taskId);
      await loadTasks();
    } catch {
      setError('Failed to delete task permanently.');
    }
  }, [loadTasks, removePendingDeletion]);

  useEffect(() => {
    const raw = globalThis.localStorage.getItem('pendingDeletions')
      ?? globalThis.localStorage.getItem('pendingDeletion');
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as PendingDeletion[] | { task: Task; expiresAt: number };
      const savedItems = Array.isArray(parsed) ? parsed : [parsed];
      const activeItems: PendingDeletion[] = [];

      savedItems.forEach(saved => {
        if (!saved?.task || typeof saved.expiresAt !== 'number') return;

        const remaining = saved.expiresAt - Date.now();
        if (remaining <= 0) {
          void taskService.deleteTask(saved.task.id).then(loadTasks).catch(() => {
            setError('Failed to delete task permanently.');
          });
        } else {
          activeItems.push({
            task: saved.task,
            expiresAt: saved.expiresAt,
            countdown: Math.ceil(remaining / 1000),
          });
          pendingTimerRefs.current[saved.task.id] = globalThis.setTimeout(() => {
            void commitPendingDeletion(saved.task.id);
          }, remaining);
        }
      });

      savePendingDeletions(activeItems);
      if (activeItems.length > 0) startCountdownTimer();
    } catch {
      globalThis.localStorage.removeItem('pendingDeletions');
      globalThis.localStorage.removeItem('pendingDeletion');
    }
  }, [commitPendingDeletion, loadTasks, savePendingDeletions, startCountdownTimer]);

  useEffect(() => () => {
    Object.values(pendingTimerRefs.current).forEach(timerId => {
      globalThis.clearTimeout(timerId);
    });
    if (countdownIntervalRef.current !== null) {
      globalThis.clearInterval(countdownIntervalRef.current);
    }
  }, []);

  const schedulePendingDeletion = (task: Task) => {
    const expiresAt = Date.now() + 10000;
    const nextPending = { task, expiresAt, countdown: 10 };
    const nextItems = [
      nextPending,
      ...pendingDeletionsRef.current.filter(item => item.task.id !== task.id),
    ];

    savePendingDeletions(nextItems);
    setTasks(prev => prev.filter(t => t.id !== task.id));
    clearPendingTimer(task.id);
    pendingTimerRefs.current[task.id] = globalThis.setTimeout(() => {
      void commitPendingDeletion(task.id);
    }, 10000);
    startCountdownTimer();
  };

  const cancelPendingDeletion = (taskId: number) => {
    const pending = pendingDeletionsRef.current.find(item => item.task.id === taskId);
    if (!pending) return;

    setTasks(prev => [pending.task, ...prev]);
    removePendingDeletion(taskId);
  };

  // Handlers for add, toggle, edit, delete
  const handleAdd = async (title: string, description: string) => {
    try {
      await taskService.createTask(title, description);
      setShowAddModal(false);
      await loadTasks();
    } catch {
      setError('Failed to add task.');
    }
  };

  const handleToggle = async (id: number, status: 'active' | 'completed') => {
    try {
      await taskService.updateTask(id, { status });
      await loadTasks();
    } catch {
      setError('Failed to update task.');
    }
  };

  const handleSaveEdit = async (id: number, title: string, description: string) => {
    try {
      await taskService.updateTask(id, { title, description });
      setEditingTask(null);
      await loadTasks();
    } catch {
      setError('Failed to update task.');
    }
  };

  const handleConfirmDelete = async (id: number) => {
    try {
      const taskToDelete = tasks.find(t => t.id === id);
      if (!taskToDelete) throw new Error('Task not found');
      schedulePendingDeletion(taskToDelete);
      setDeletingTask(null);
    } catch {
      setError('Failed to schedule deletion.');
    }
  };

  const pendingDeletionIds = new Set(pendingDeletions.map(item => item.task.id));
  const tasksWithoutPendingDeletion = tasks.filter(t => !pendingDeletionIds.has(t.id));

  const filteredTasks = tasksWithoutPendingDeletion.filter(task => {
    const matchesStatus = filter === 'all' || task.status === filter;
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase())
      || task.description?.toLowerCase().includes(search.toLowerCase());

    const created = new Date(task.created_at);
    const matchesFrom = !dateFrom || created >= new Date(`${dateFrom}T00:00:00`);
    const matchesTo = !dateTo || created <= new Date(`${dateTo}T23:59:59`);

    return matchesStatus && matchesSearch && matchesFrom && matchesTo;
  });

  const doneCount  = filteredTasks.filter(t => t.status === 'completed').length;
  const totalCount = filteredTasks.length;

  // Pagination calculations
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const effectiveCurrentPage = totalPages > 0 ? Math.min(currentPage, totalPages) : currentPage;
  const paginatedTasks = filteredTasks.slice((effectiveCurrentPage - 1) * itemsPerPage, effectiveCurrentPage * itemsPerPage);
  const shownCount = paginatedTasks.length;
  const taskPlural = shownCount === 1 ? '' : 's';

  const updatePageInUrl = (page: number) => {
    const params = new URLSearchParams(globalThis.location.search);
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }
    const search = params.toString();
    const newUrl = globalThis.location.pathname + (search ? `?${search}` : '');
    globalThis.history.replaceState(null, '', newUrl);
  };

  const setPage = (page: number) => {
    setCurrentPage(page);
    updatePageInUrl(page);
  };

  const renderPaginationItems = () => {
    const items = [];
    for (let i = 1; i <= totalPages; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            href={`?page=${i}`}
            isActive={i === effectiveCurrentPage}
            className={i === effectiveCurrentPage ? 'font-bold border-white bg-white text-black hover:bg-white' : ''}
            onClick={(e) => {
              e.preventDefault();
              setPage(i);
            }}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    return items;
  };

  let taskContent;
  if (loading) {
    taskContent = <p className="text-center text-t3 text-sm py-14">Loading tasks…</p>;
  } else if (filteredTasks.length === 0) {
    taskContent = (
      <div className="text-center py-14">
        <p className="text-t3 text-lg">No tasks found.</p>
      </div>
    );
  } else {
    taskContent = (
      <div className="flex flex-col gap-1.5 min-h-[320px]">
        {paginatedTasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={handleToggle}
            onEdit={() => setEditingTask(task)}
            onDelete={() => setDeletingTask(task)}
          />
        ))}
      </div>
    );
  }

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
        <FilterBar
          current={filter}
          onChange={setFilter}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
        />

        {/* Meta count */}
        <p className="text-[13px] text-t2 mt-3.5 mb-3.5">
          {shownCount} task{taskPlural} shown · {doneCount}/{totalCount} completed
        </p>

        {/* Error banner */}
        {error && (
          <div className="bg-danger/10 border border-danger/20 text-danger text-sm px-4 py-3 rounded-[8px] mb-4">
            {error}
          </div>
        )}

        {pendingDeletions.length > 0 && (
          <div className="fixed top-5 right-5 z-50 flex w-full max-w-[420px] flex-col gap-3 px-4">
            {pendingDeletions.map(pendingDeletion => (
              <div
                key={pendingDeletion.task.id}
                className="rounded-[14px] border border-white/10 bg-card px-4 py-3 text-sm text-t1 shadow-xl"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">Task deleted</p>
                    <p className="text-xs text-t2">
                      Undo within {pendingDeletion.countdown} second{pendingDeletion.countdown === 1 ? '' : 's'} to restore the task.
                    </p>
                  </div>
                  <button
                    onClick={() => cancelPendingDeletion(pendingDeletion.task.id)}
                    className="rounded-[10px] bg-green px-3 py-2 text-sm font-semibold text-bg transition hover:bg-green/80"
                  >
                    Undo
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Task list */}
        {taskContent}

        <div className="border-t border-white/10 mt-6 pt-4">
          {totalPages > 0 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href={`?page=${Math.max(1, effectiveCurrentPage - 1)}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(Math.max(1, effectiveCurrentPage - 1));
                    }}
                    className={effectiveCurrentPage === 1 || totalPages <= 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                {renderPaginationItems()}
                <PaginationItem>
                  <PaginationNext
                    href={`?page=${Math.min(totalPages, effectiveCurrentPage + 1)}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(Math.min(totalPages, effectiveCurrentPage + 1));
                    }}
                    className={effectiveCurrentPage === totalPages || totalPages <= 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>

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
