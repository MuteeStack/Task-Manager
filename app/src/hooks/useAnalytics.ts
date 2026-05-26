import { useMemo } from 'react';
import { format, subDays, isBefore, startOfDay } from 'date-fns';
import type { Task, TaskStats, CompletionChartData, PriorityChartData } from '@/types';

export function useAnalytics(tasks: Task[], timeRange: 'week' | 'month' | 'year' = 'week') {
  const stats: TaskStats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
    const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
    const now = new Date();
    const overdueTasks = tasks.filter(
      (t) => t.status !== 'completed' && t.dueDate && isBefore(t.dueDate, now)
    ).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      overdueTasks,
      completionRate,
    };
  }, [tasks]);

  const completionData: CompletionChartData[] = useMemo(() => {
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
    const data: CompletionChartData[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, timeRange === 'year' ? 'MMM' : 'EEE');
      const completed = tasks.filter(
        (t) =>
          t.status === 'completed' &&
          t.completedAt &&
          format(t.completedAt, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      ).length;
      const created = tasks.filter(
        (t) => t.createdAt && format(t.createdAt, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      ).length;

      // For year view, aggregate by month
      if (timeRange === 'year') {
        const existing = data.find((d) => d.date === dateStr);
        if (existing) {
          existing.completed += completed;
          existing.created += created;
        } else {
          data.push({ date: dateStr, completed, created });
        }
      } else {
        data.push({ date: dateStr, completed, created });
      }
    }

    return data;
  }, [tasks, timeRange]);

  const priorityData: PriorityChartData[] = useMemo(() => {
    const high = tasks.filter((t) => t.priority === 'high').length;
    const medium = tasks.filter((t) => t.priority === 'medium').length;
    const low = tasks.filter((t) => t.priority === 'low').length;

    return [
      { name: 'High', value: high, color: '#ef4444' },
      { name: 'Medium', value: medium, color: '#f59e0b' },
      { name: 'Low', value: low, color: '#22c55e' },
    ];
  }, [tasks]);

  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    tasks.forEach((t) => {
      const cat = t.category || 'general';
      categories[cat] = (categories[cat] || 0) + 1;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [tasks]);

  const weeklyTrend = useMemo(() => {
    const weeks = 12;
    const data: { week: string; completed: number; total: number }[] = [];

    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = subDays(startOfDay(new Date()), i * 7);
      const weekEnd = subDays(startOfDay(new Date()), (i - 1) * 7);
      const weekTasks = tasks.filter((t) => {
        if (!t.createdAt) return false;
        return isBefore(weekStart, t.createdAt) && isBefore(t.createdAt, weekEnd);
      });
      const completed = weekTasks.filter((t) => t.status === 'completed').length;
      data.push({
        week: format(weekStart, 'MMM d'),
        completed,
        total: weekTasks.length,
      });
    }

    return data;
  }, [tasks]);

  return {
    stats,
    completionData,
    priorityData,
    categoryData,
    weeklyTrend,
  };
}
