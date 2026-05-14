import type { FilterStatus } from '../types/taskType';

interface Props {
  readonly current: FilterStatus;
  readonly onChange: (status: FilterStatus) => void;
  readonly dateFrom: string;
  readonly dateTo: string;
  readonly onDateFromChange: (value: string) => void;
  readonly onDateToChange: (value: string) => void;
}

const filters: FilterStatus[] = ['all', 'active', 'completed'];

export default function FilterBar({ current, onChange, dateFrom, dateTo, onDateFromChange, onDateToChange }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-2 flex-wrap">
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

      <div className="flex flex-wrap gap-2 items-center">
        <label className="flex items-center gap-2 text-sm text-t2">
          <span className="whitespace-nowrap">From</span>
          <input
            type="date"
            value={dateFrom}
            onChange={e => onDateFromChange(e.target.value)}
            className="bg-input border border-white/10 rounded-[8px] px-3 py-2 text-sm text-t2 outline-none focus:border-white/25"
            style={{ colorScheme: 'dark' }}
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-t2">
          <span className="whitespace-nowrap">To</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => onDateToChange(e.target.value)}
            className="bg-input border border-white/10 rounded-[8px] px-3 py-2 text-sm text-t2 outline-none focus:border-white/25"
            style={{ colorScheme: 'dark' }}
          />
        </label>
      </div>
    </div>
  );
}
