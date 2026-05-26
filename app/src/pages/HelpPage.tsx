import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, MessageSquare, BookOpen, Mail } from 'lucide-react';

const faqs = [
  {
    question: 'How do I create a new task?',
    answer: 'Click the "+ New Task" button in the dashboard or press the "N" key on your keyboard. Fill in the title, description (optional), priority, due date, and category, then click "Create Task".',
  },
  {
    question: 'How do I mark a task as complete?',
    answer: 'Click the checkbox next to any task to toggle its completion status. Completed tasks will show a strikethrough and can be filtered using the "Completed" filter.',
  },
  {
    question: 'Can I organize tasks by priority?',
    answer: 'Yes! Each task can be assigned a priority level: Low, Medium, or High. You can filter tasks by priority using the priority dropdown in the task list.',
  },
  {
    question: 'How does the calendar view work?',
    answer: 'The Calendar page shows all your tasks organized by their due dates. Click on any date to see tasks scheduled for that day. You can also add tasks directly from the calendar.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. TaskFlow uses Firebase Authentication and Realtime Database with security rules that ensure only you can access your tasks. All data is encrypted in transit and at rest.',
  },
  {
    question: 'Can I use TaskFlow offline?',
    answer: 'Yes! TaskFlow supports offline mode. Your changes are saved locally and automatically synced when you reconnect to the internet.',
  },
];

export function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8b5cf6]/20 to-[#6366f1]/20 flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-8 h-8 text-[#a78bfa]" />
        </div>
        <h1 className="text-[#f8fafc] text-2xl font-bold tracking-tight mb-2">Help Center</h1>
        <p className="text-[#64748b] text-sm max-w-md mx-auto">
          Find answers to common questions and learn how to make the most of TaskFlow.
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: BookOpen, label: 'Getting Started', desc: 'Learn the basics' },
          { icon: MessageSquare, label: 'FAQ', desc: 'Common questions' },
          { icon: Mail, label: 'Contact Us', desc: 'Get in touch' },
        ].map((link) => (
          <motion.div
            key={link.label}
            whileHover={{ y: -2 }}
            className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:bg-white/[0.06] transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-[rgba(139,92,246,0.15)] flex items-center justify-center flex-shrink-0">
              <link.icon className="w-5 h-5 text-[#a78bfa]" />
            </div>
            <div>
              <p className="text-[#f8fafc] text-sm font-medium">{link.label}</p>
              <p className="text-[#64748b] text-xs">{link.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-3">
        <h2 className="text-[#f8fafc] font-semibold text-lg mb-4">Frequently Asked Questions</h2>
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="bg-white/[0.04] border border-white/[0.06] rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
            >
              <span className="text-[#f8fafc] text-sm font-medium pr-4">{faq.question}</span>
              <ChevronDown
                className={`w-4 h-4 text-[#64748b] flex-shrink-0 transition-transform ${openIndex === i ? 'rotate-180' : ''}`}
              />
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-4">
                    <p className="text-[#94a3b8] text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Keyboard Shortcuts */}
      <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-6">
        <h2 className="text-[#f8fafc] font-semibold text-lg mb-4">Keyboard Shortcuts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { key: '/', action: 'Focus search bar' },
            { key: 'N', action: 'Create new task' },
            { key: 'Escape', action: 'Close modals' },
            { key: '?', action: 'Show keyboard shortcuts' },
          ].map((shortcut) => (
            <div key={shortcut.key} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
              <span className="text-[#94a3b8] text-sm">{shortcut.action}</span>
              <kbd className="px-2 py-1 rounded bg-white/[0.06] text-[#f8fafc] text-xs font-mono border border-white/[0.08]">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
