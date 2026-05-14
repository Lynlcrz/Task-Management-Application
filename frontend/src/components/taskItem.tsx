import { Pencil, Trash2 } from 'lucide-react';
import type { Task } from '../types/taskType';

interface Props {
  task:     Task;
  onToggle: (id: number, status: 'active' | 'completed') => void;
  onEdit:   (task: Task) => void;
  onDelete: (task: Task) => void;
}

export default function TaskItem({ task, onToggle, onEdit, onDelete }: Props) {
  const isDone = task.status === 'completed';

  return (
    <div className={`
      bg-card border border-white/10 rounded-[10px]
      px-4 py-3.5 flex gap-3 items-start transition-opacity
      ${isDone ? 'opacity-55' : ''}
    `}>

      {/* Checkbox */}
      <input
        type="checkbox"
        checked={isDone}
        onChange={() => onToggle(task.id, isDone ? 'active' : 'completed')}
        className="bg-card mt-[3px] w-[17px] h-[17px] cursor-pointer flex-shrink-0"
      />

      {/* Body */}
      <div className="flex-1 min-w-0">
        <p className={`
          text-sm font-semibold leading-snug mb-1
          ${isDone ? 'line-through text-t3' : 'text-t1'}
        `}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-[13px] text-t2 mb-2 leading-relaxed">
            {task.description}
          </p>
        )}
        <span className="
          inline-block text-[11px] font-medium text-t2
          border border-white/[0.12] bg-white/[0.04]
          px-2.5 py-0.5 rounded-full
        ">
          {task.status}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-1.5 flex-shrink-0 mt-0.5">
        <button
          onClick={() => onEdit(task)}
          title="Edit task"
          className="
            w-[34px] h-[34px] flex items-center justify-center
            bg-card border border-white/10 rounded-[7px]
            text-t2 hover:text-blue hover:bg-blue/[0.12] hover:border-blue/35
            transition-all
          "
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDelete(task)}
          title="Delete task"
          className="
            w-[34px] h-[34px] flex items-center justify-center
            bg-card border border-white/10 rounded-[7px]
            text-t2 hover:text-danger hover:bg-danger/[0.12] hover:border-danger/30
            transition-all
          "
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
