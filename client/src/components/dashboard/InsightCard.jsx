const TYPE_STYLES = {
  success: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300',
  warning: 'border-amber-500/20 bg-amber-500/5 text-amber-300',
  danger:  'border-red-500/20 bg-red-500/5 text-red-300',
  info:    'border-blue-500/20 bg-blue-500/5 text-blue-300',
};

export const InsightCard = ({ icon, message, type = 'info' }) => (
  <div className={`flex items-start gap-3 p-3.5 rounded-xl border ${TYPE_STYLES[type] || TYPE_STYLES.info}`}>
    <span className="text-xl shrink-0 mt-0.5">{icon}</span>
    <p className="text-sm leading-relaxed text-gray-300">{message}</p>
  </div>
);

export default InsightCard;
