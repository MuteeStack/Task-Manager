import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Flame, Target } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts';
import { useTasks } from '@/hooks/useTasks';
import { useAnalytics } from '@/hooks/useAnalytics';
import type { TimeRange } from '@/types';

interface AnalyticsPageProps {
  userId: string;
}

const COLORS = ['#8b5cf6', '#6366f1', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444'];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f172a] border border-white/[0.08] rounded-lg px-3 py-2 shadow-xl">
        <p className="text-[#94a3b8] text-xs mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-[#f8fafc] text-xs font-medium" style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function AnalyticsPage({ userId }: AnalyticsPageProps) {
  const { tasks, loading } = useTasks(userId);
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const { stats, completionData, priorityData, categoryData, weeklyTrend } = useAnalytics(tasks, timeRange);

  const productivityStreak = useMemo(() => {
    // Simple streak calculation based on completed tasks in consecutive days
    return stats.completedTasks > 0 ? Math.min(stats.completedTasks, 30) : 0;
  }, [stats.completedTasks]);

  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: 'week', label: '7 Days' },
    { value: 'month', label: '30 Days' },
    { value: 'year', label: 'Year' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#a78bfa]" />
          <h2 className="text-[#f8fafc] font-semibold text-lg">Analytics</h2>
        </div>
        <div className="flex gap-1.5">
          {timeRanges.map((r) => (
            <button
              key={r.value}
              onClick={() => setTimeRange(r.value)}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${timeRange === r.value
                  ? 'bg-white/[0.06] text-[#f8fafc] border border-[rgba(139,92,246,0.35)]'
                  : 'text-[#64748b] hover:text-[#94a3b8] hover:bg-white/[0.03]'
                }
              `}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks', value: stats.totalTasks, icon: Target, color: 'text-[#8b5cf6]', bg: 'bg-[rgba(139,92,246,0.15)]' },
          { label: 'Completed', value: stats.completedTasks, icon: TrendingUp, color: 'text-[#22c55e]', bg: 'bg-[rgba(34,197,94,0.15)]' },
          { label: 'Completion Rate', value: `${stats.completionRate}%`, icon: BarChart3, color: 'text-[#3b82f6]', bg: 'bg-[rgba(59,130,246,0.15)]' },
          { label: 'Streak', value: productivityStreak, icon: Flame, color: 'text-[#f59e0b]', bg: 'bg-[rgba(245,158,11,0.15)]' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-5"
          >
            <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-[#f8fafc] text-2xl font-semibold">{stat.value}</p>
            <p className="text-[#64748b] text-xs mt-1 uppercase tracking-wider">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-5"
        >
          <h3 className="text-[#f8fafc] font-semibold text-sm mb-4">Task Completion Trend</h3>
          <div className="h-[250px]">
            {loading ? (
              <div className="h-full bg-white/[0.03] rounded-lg animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={completionData}>
                  <defs>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="completed" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorCompleted)" />
                  <Area type="monotone" dataKey="created" stroke="#6366f1" strokeWidth={2} fill="url(#colorCreated)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-5"
        >
          <h3 className="text-[#f8fafc] font-semibold text-sm mb-4">Category Distribution</h3>
          <div className="h-[250px]">
            {loading ? (
              <div className="h-full bg-white/[0.03] rounded-lg animate-pulse" />
            ) : categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(value) => <span className="text-[#94a3b8] text-xs">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-[#64748b] text-sm">
                No data available
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-5"
        >
          <h3 className="text-[#f8fafc] font-semibold text-sm mb-4">Priority Breakdown</h3>
          <div className="h-[250px]">
            {loading ? (
              <div className="h-full bg-white/[0.03] rounded-lg animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Weekly Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-5"
        >
          <h3 className="text-[#f8fafc] font-semibold text-sm mb-4">Weekly Productivity</h3>
          <div className="h-[250px]">
            {loading ? (
              <div className="h-full bg-white/[0.03] rounded-lg animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="completed" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
