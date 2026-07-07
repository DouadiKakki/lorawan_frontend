import { motion, AnimatePresence } from 'motion/react';

interface LoadingMessageProps {
  show: boolean;
  message: string;
  description?: string;
}

export function LoadingMessage({ show, message, description }: LoadingMessageProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="bg-white dark:bg-slate-800 px-8 py-6 rounded-2xl shadow-2xl flex flex-col items-center gap-3 pointer-events-auto min-w-[220px] text-center"
          >
            <div className="w-10 h-10 rounded-full border-[3px] border-slate-200 dark:border-slate-600 border-t-blue-500 animate-spin" />
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">{message}</div>
              {description && (
                <div className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{description}</div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
