import { Trash2, X } from 'lucide-react';
import type { Task } from '../types/taskType';

interface Props {
  task:      Task;
  onConfirm: (id: number) => void;
  onClose:   () => void;
}

export default function DeleteAlert({ task, onConfirm, onClose }: Props) {
  const handleConfirm = () => {
    onConfirm(task.id);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-modal border border-white/[0.12] rounded-[12px] p-6 w-full max-w-[380px]"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Red icon circle */}
            <div className="w-9 h-9 rounded-full bg-danger/10 border border-danger/20 flex items-center justify-center flex-shrink-0">
              <Trash2 size={16} className="text-danger" />
            </div>
            <h2 className="text-[15px] font-semibold text-t1">Delete task</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="
              text-t3 hover:text-t1 hover:bg-white/[0.07]
              w-7 h-7 flex items-center justify-center
              rounded-[6px] transition-all flex-shrink-0
            "
          >
            <X size={16} />
          </button>
        </div>

        {/* Message */}
        <p className="text-sm text-t2 mb-2 leading-relaxed">
          Are you sure you want to delete this task? This action cannot be undone.
        </p>

        {/* Task preview pill */}
        <div className="
          bg-input border border-white/[0.08] rounded-[8px]
          px-3 py-2.5 mb-5
        ">
          <p className="text-sm font-medium text-t1 truncate">{task.title}</p>
          {task.description && (
            <p className="text-xs text-t3 mt-0.5 truncate">{task.description}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 pt-4 border-t border-white/[0.07]">
          <button
            onClick={onClose}
            className="
              flex-1 bg-transparent border border-white/[0.18]
              hover:bg-white/[0.05] hover:text-t1
              text-t2 text-sm font-medium py-2.5 rounded-[8px] transition-all
            "
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="
              flex-1 bg-danger hover:bg-[#c73f3e]
              text-white text-sm font-medium py-2.5 rounded-[8px] transition-colors
              flex items-center justify-center gap-2
            "
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}