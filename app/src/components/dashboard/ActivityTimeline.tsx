import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2, Plus, Pencil, Trash2, type LucideIcon } from 'lucide-react';
import type { ActivityItem, ActivityType } from '@/types';

interface ActivityTimelineProps {
  activities: ActivityItem[];
}

const activityConfig: Record<ActivityType, { icon: LucideIcon; color: string; bgColor: string }> = {
  created: { icon: Plus, color: 'text-[#22c55e]', bgColor: 'bg-[#22c55e]/10' },
  completed: { icon: CheckCircle2, color: 'text-[#8b5cf6]', bgColor: 'bg-[#8b5cf6]/10' },
  updated: { icon: Pencil, color: 'text-[#f59e0b]', bgColor: 'bg-[#f59e0b]/10' },
  deleted: { icon: Trash2, color: 'text-[#ef4444]', bgColor: 'bg-[#ef4444]/10' },
};

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-5">
        <h3 className="text-[#f8fafc] font-semibold text-sm mb-4">Recent Activity</h3>
        <div className="text-center py-6">
          <p className="text-[#64748b] text-sm">No recent activity</p>
          <p className="text-[#64748b] text-xs mt-1">Complete tasks to see activity here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.05)]">
      <h3 className="text-[#f8fafc] font-semibold text-sm mb-4">Recent Activity</h3>
      <div className="space-y-0">
        {activities.map((activity, index) => {
          const config = activityConfig[activity.type];
          const Icon = config.icon;
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3 relative"
            >
              {/* Timeline line */}
              {index < activities.length - 1 && (
                <div className="absolute left-[15px] top-8 bottom-0 w-[2px] bg-white/[0.06]" />
              )}
              {/* Icon */}
              <div className={`w-8 h-8 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-3.5 h-3.5 ${config.color}`} />
              </div>
              {/* Content */}
              <div className="pb-4 min-w-0">
                <p className="text-[#f8fafc] text-sm truncate">{activity.description}</p>
                <p className="text-[#64748b] text-xs mt-0.5">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
