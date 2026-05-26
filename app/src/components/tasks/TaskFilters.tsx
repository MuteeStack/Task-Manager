import { motion } from 'framer-motion';
import { Filter, ArrowUpDown, Search } from 'lucide-react';
import type { FilterType, Priority } from '@/types';

interface TaskFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  priorityFilter: Priority | 'all';
  onPriorityFilterChange: (priority: Priority | 'all') => void;
}

const filters: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'today', label: 'Today' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
];

const sortOptions = [
  { value: 'order', label: 'Custom Order' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'created', label: 'Created' },
];

export function TaskFilters({
  activeFilter,
  onFilterChange,
  searchValue,
  onSearchChange,
  sortBy,
  onSortChange,
  priorityFilter,
  onPriorityFilterChange,
}: TaskFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Search - Mobile only */}
      <div className="sm:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg text-[#f8fafc] text-sm placeholder:text-[#64748b] pl-10 pr-4 py-2.5 outline-none focus:border-[#8b5cf6]/35 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {/* Filter pills */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-[#64748b] mr-1" />
          {filters.map((f) => (
            <motion.button
              key={f.value}
              onClick={() => onFilterChange(f.value)}
              whileTap={{ scale: 0.97 }}
              className={`
                px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150
                ${activeFilter === f.value
                  ? 'bg-white/[0.06] text-[#f8fafc] border border-[rgba(139,92,246,0.35)]'
                  : 'bg-white/[0.02] text-[#94a3b8] border border-white/[0.06] hover:bg-white/[0.04] hover:text-[#f8fafc]'
                }
              `}
            >
              {f.label}
            </motion.button>
          ))}
        </div>

        {/* Priority filter */}
        <div className="flex items-center gap-1">
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityFilterChange(e.target.value as Priority | 'all')}
            className="bg-white/[0.03] border border-white/[0.08] rounded-lg text-[#94a3b8] text-xs py-1.5 px-2.5 outline-none focus:border-[#8b5cf6]/35 transition-all cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Sort */}
        <div className="ml-auto flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-[#64748b]" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-white/[0.03] border border-white/[0.08] rounded-lg text-[#94a3b8] text-xs py-1.5 px-2.5 outline-none focus:border-[#8b5cf6]/35 transition-all cursor-pointer"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
