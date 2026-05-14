import type { FilterStatus } from '../types/taskType';

interface Props {
  current:  FilterStatus;
  onChange: (status: FilterStatus) => void;
}

const filters: FilterStatus[] = ['all', 'active', 'completed'];

export default function FilterBar({ current, onChange }: Props) {
  return (
    <div className="flex gap-2">
      {filters.map(f => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`
            px-[18px] py-1.5 rounded-[6px] text-sm font-medium capitalize border transition-all
            ${current === f
              ? 'bg-white/[0.3] text-t1 border-white/25'
              : 'bg-transparent text-t2 border-white/[0.18] hover:bg-white/[0.05] hover:text-t1'
            }
          `}
        >
          {f}
        </button>
      ))}
    </div>
  );
}