import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ref,
  onValue,
  push,
  set,
  update,
  remove,
  serverTimestamp,
} from 'firebase/database';
import { db } from '@/lib/firebase';
import type { Task, CreateTaskInput, UpdateTaskInput, Priority, TaskStatus } from '@/types';

function convertTimestampToDate(value: unknown): Date | null {
  if (typeof value === 'number') return new Date(value);
  if (value instanceof Date) return value;
  return null;
}

function docToTask(docData: Record<string, unknown>, id: string): Task {
  return {
    id,
    userId: (docData.userId as string) || '',
    title: (docData.title as string) || '',
    description: (docData.description as string) || '',
    priority: (docData.priority as Priority) || 'medium',
    status: (docData.status as TaskStatus) || 'pending',
    dueDate: convertTimestampToDate(docData.dueDate),
    category: (docData.category as string) || 'general',
    tags: (docData.tags as string[]) || [],
    completedAt: convertTimestampToDate(docData.completedAt),
    createdAt: convertTimestampToDate(docData.createdAt) || new Date(),
    updatedAt: convertTimestampToDate(docData.updatedAt) || new Date(),
    order: (docData.order as number) || 0,
    subtasks: (docData.subtasks as Task['subtasks']) || [],
  };
}

export function useTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  useEffect(() => {
    if (!userId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const tasksRef = ref(db, `tasks/${userId}`);

    const unsubscribe = onValue(
      tasksRef,
      (snapshot) => {
        const data = (snapshot.val() as Record<string, Record<string, unknown>> | null) || {};
        const newTasks = Object.entries(data).map(([id, value]) => docToTask(value, id));
        newTasks.sort((a, b) => a.order - b.order);
        setTasks(newTasks);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Tasks subscription error:', err);
        setError('Failed to load tasks');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const createTask = useCallback(async (input: CreateTaskInput) => {
    if (!userId) throw new Error('Not authenticated');
    setSyncing(true);
    try {
      const maxOrder = tasksRef.current.length > 0
        ? Math.max(...tasksRef.current.map((t) => t.order))
        : -1;
      const now = new Date();

      const newTask = {
        userId,
        title: input.title,
        description: input.description || '',
        priority: input.priority,
        status: 'pending' as TaskStatus,
        dueDate: input.dueDate ? input.dueDate.getTime() : null,
        category: input.category || 'general',
        tags: input.tags || [],
        completedAt: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        order: maxOrder + 1,
        subtasks: [],
      };

      const newTaskRef = push(ref(db, `tasks/${userId}`));
      await set(newTaskRef, newTask);
      setSyncing(false);
      return {
        ...newTask,
        id: newTaskRef.key || '',
        dueDate: input.dueDate || null,
        createdAt: now,
        updatedAt: now,
      } as Task;
    } catch (err) {
      setSyncing(false);
      throw new Error('Failed to create task');
    }
  }, [userId]);

  const updateTask = useCallback(async (taskId: string, updates: UpdateTaskInput) => {
    if (!userId) throw new Error('Not authenticated');
    setSyncing(true);
    try {
      const updateData: Record<string, unknown> = { updatedAt: serverTimestamp() };
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.dueDate !== undefined) {
        updateData.dueDate = updates.dueDate ? updates.dueDate.getTime() : null;
      }
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.tags !== undefined) updateData.tags = updates.tags;
      if (updates.status === 'completed') {
        updateData.completedAt = serverTimestamp();
      } else if (updates.status === 'pending') {
        updateData.completedAt = null;
      }

      await update(ref(db, `tasks/${userId}/${taskId}`), updateData);
      setSyncing(false);
    } catch (err) {
      setSyncing(false);
      throw new Error('Failed to update task');
    }
  }, [userId]);

  const deleteTask = useCallback(async (taskId: string) => {
    if (!userId) throw new Error('Not authenticated');
    try {
      await remove(ref(db, `tasks/${userId}/${taskId}`));
    } catch (err) {
      throw new Error('Failed to delete task');
    }
  }, [userId]);

  const toggleTaskComplete = useCallback(async (taskId: string) => {
    if (!userId) throw new Error('Not authenticated');
    const task = tasksRef.current.find((t) => t.id === taskId);
    if (!task) return;

    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await update(ref(db, `tasks/${userId}/${taskId}`), {
        status: newStatus,
        completedAt: newStatus === 'completed' ? serverTimestamp() : null,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      throw new Error('Failed to update task');
    }
  }, [userId]);

  const reorderTasks = useCallback(async (orderedIds: string[]) => {
    if (!userId) return;
    try {
      const updates: Record<string, number> = {};
      orderedIds.forEach((id, index) => {
        updates[`tasks/${userId}/${id}/order`] = index;
      });
      await update(ref(db), updates);
    } catch (err) {
      console.error('Reorder error:', err);
    }
  }, [userId]);

  return {
    tasks,
    loading,
    error,
    syncing,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    reorderTasks,
  };
}
