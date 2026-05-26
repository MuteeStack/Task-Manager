export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type ThemeMode = 'dark' | 'light' | 'system';
export type TimeRange = 'week' | 'month' | 'year';
export type FilterType = 'all' | 'today' | 'upcoming' | 'completed';
export type ActivityType = 'created' | 'completed' | 'updated' | 'deleted';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: Date | null;
  category: string;
  tags: string[];
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  order: number;
  subtasks: Subtask[];
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: Date | null;
  category?: string;
  tags?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: Priority;
  status?: TaskStatus;
  dueDate?: Date | null;
  category?: string;
  tags?: string[];
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  initials: string;
  theme: ThemeMode;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  completionRate: number;
}

export interface CompletionChartData {
  date: string;
  completed: number;
  created: number;
}

export interface PriorityChartData {
  name: string;
  value: number;
  color: string;
}

export interface ActivityItem {
  id: string;
  userId: string;
  taskId: string;
  type: ActivityType;
  description: string;
  timestamp: Date;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

export interface CategoryOption {
  value: string;
  label: string;
  color: string;
}
