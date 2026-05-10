import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

export const MiniSparkline = ({ data, dataKey, color = '#0ea5e9', height = 40 }) => {
  if (!data?.length) return null;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 3 }}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            return (
              <div className="bg-[#1e2535] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs">
                <span style={{ color }}>₹{Number(payload[0].value).toLocaleString('en-IN')}</span>
              </div>
            );
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MiniSparkline;
