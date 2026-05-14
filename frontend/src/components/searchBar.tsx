import { Search } from 'lucide-react';

interface Props {
  search:   string;
  onSearch: (value: string) => void;
}

export default function SearchBar({ search, onSearch }: Props) {
  console.log('Rendering SearchBar with search:', search);
  return ( 
    <div className="relative flex-1">
      <Search
        size={15}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-t3 pointer-events-none"
      />
      <input
        type="text"
        value={search}
        onChange={e => onSearch(e.target.value)}
        placeholder="Search tasks..."
        className="
          w-full bg-input border border-white/10 rounded-[8px]
          pl-9 pr-3 py-2.5 text-sm text-t1 placeholder:text-t3
          outline-none focus:border-white/25 transition-colors
        "
      />
    </div>
  );
}