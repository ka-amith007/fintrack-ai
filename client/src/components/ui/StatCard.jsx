import { motion } from 'framer-motion';

export const StatCard = ({ title, value, icon: Icon, colorClass, change, prefix = '₹', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="stat-card"
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`p-2.5 rounded-xl ${colorClass}`}>
        <Icon size={18} className="text-white" />
      </div>
      {change !== undefined && (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          change >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
        }`}>
          {change >= 0 ? '+' : ''}{change}%
        </span>
      )}
    </div>
    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{title}</p>
    <p className="text-2xl font-display font-bold text-white font-tabular">
      {prefix}{typeof value === 'number'
        ? value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
        : '0'}
    </p>
  </motion.div>
);

export default StatCard;
