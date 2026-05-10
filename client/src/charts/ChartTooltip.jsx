export const ChartTooltip = ({ active, payload, label, prefix = '₹' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1e2535] border border-white/10 rounded-xl p-3 text-sm shadow-xl min-w-[140px]">
      {label && <p className="text-gray-400 mb-2 text-xs font-medium uppercase tracking-wide">{label}</p>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-gray-300 text-xs">{p.name}</span>
          </div>
          <span className="font-semibold text-white font-tabular text-xs">
            {prefix}{Number(p.value).toLocaleString('en-IN')}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ChartTooltip;
