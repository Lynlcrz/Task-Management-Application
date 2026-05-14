import { AlertCircle, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Props {
  onAdd:   (title: string, description: string) => void;
  onClose: () => void;
}

export default function TaskModal({ onAdd, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [desc,  setDesc]  = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required.'); return; }
    onAdd(title.trim(), desc.trim());
  };

  const inputClass = `
    w-full bg-input border border-white/10 rounded-[8px]
    px-3 py-2.5 text-sm text-t1 placeholder:text-t3
    outline-none focus:border-white/25 transition-colors
  `;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-modal border border-white/[0.12] rounded-[12px] p-6 w-full max-w-[420px]"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-semibold text-t1">New task</h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="
              text-t3 hover:text-t1 hover:bg-white/[0.07]
              w-7 h-7 flex items-center justify-center
              rounded-[6px] transition-all
            "
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-t2 mb-1.5">
              Title <span className="text-danger">*</span>
            </label>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={e => { setTitle(e.target.value); setError(''); }}
              placeholder="e.g. Create or Fix something"
              className={inputClass}
            />
            {error && (
              <p className="flex items-center gap-1.5 text-danger text-xs mt-1.5">
                <AlertCircle size={12} />
                {error}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="mb-2">
            <label className="block text-xs font-medium text-t2 mb-1.5">
              Description
            </label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Add more details… (optional)"
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Footer */}
          <div className="flex gap-2 mt-5 pt-4 border-t border-white/[0.07]">
            <button
              type="button"
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
              type="submit"
              className="
                flex-1 bg-blue/[0.5] hover:bg-[#2573BE]
                text-white text-sm font-medium py-2.5 rounded-[8px] transition-colors
              "
            >
              Save task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}