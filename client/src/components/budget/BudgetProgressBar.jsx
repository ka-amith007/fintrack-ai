import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export const BudgetProgressBar = ({ spent, budget, label = '', showLabel = true }) => {
  const pct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;

  const getColor = () => {
    if (pct >= 90) return 'bg-red-500';
    if (pct >= 70) return 'bg-amber-500';
    return 'bg-primary-500';
  };

  const StatusIcon = pct >= 90 ? XCircle : pct >= 70 ? AlertTriangle : CheckCircle;
  const statusColor = pct >= 90 ? 'text-red-400' : pct >= 70 ? 'text-amber-400' : 'text-emerald-400';

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <StatusIcon size={13} className={statusColor} />
            <span className="text-xs text-gray-400">{label}</span>
          </div>
          <span className="text-xs font-medium text-gray-300 font-tabular">
            {Math.round(pct)}%
          </span>
        </div>
      )}
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor()} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-gray-500 font-tabular">
            ₹{spent.toLocaleString('en-IN')} spent
          </span>
          <span className="text-xs text-gray-500 font-tabular">
            ₹{budget.toLocaleString('en-IN')} budget
          </span>
        </div>
      )}
    </div>
  );
};

export default BudgetProgressBar;
