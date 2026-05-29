import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';

interface SuccessMessageProps {
  show: boolean;
  message: string;
  description?: string;
}

export function SuccessMessage({ show, message, description }: SuccessMessageProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-6 rounded-2xl shadow-2xl flex items-center gap-4 pointer-events-auto"
          >
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Check className="w-7 h-7" />
            </div>
            <div>
              <div className="font-bold text-xl">{message}</div>
              {description && (
                <div className="text-green-100 text-sm">{description}</div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
