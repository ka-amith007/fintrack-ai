import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { analyticsAPI } from '../services/api';
import toast from 'react-hot-toast';

const PIE_COLORS = ['#2563EB','#7C3AED','#EC4899','#EF4444','#06B6D4','#10B981','#F59E0B','#6B7280'];
const fmt = v => '₹'+(v>=1000?(v/1000).toFixed(0)+'k':v);

const Tooltip2 = ({active,payload,label}) => {
  if (!active||!payload?.length) return null;
  return (
    <div style={{background:'#fff',border:'1px solid #E2E8F0',borderRadius:'10px',padding:'10px 14px',boxShadow:'0 4px 16px rgba(0,0,0,.1)',fontSize:'13px'}}>
      {label && <p style={{color:'#64748B',marginBottom:'6px',fontWeight:'600'}}>{label}</p>}
      {payload.map((p,i)=>(
        <div key={i} style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'2px'}}>
          <span style={{width:'8px',height:'8px',borderRadius:'2px',background:p.color,display:'inline-block'}}/>
          <span style={{color:'#64748B'}}>{p.name}:</span>
          <span style={{fontWeight:'700',color:'#0F172A'}}>₹{Number(p.value).toLocaleString('en-IN')}</span>
        </div>
      ))}
    </div>
  );
};

const axis = { fill:'#94A3B8', fontSize:11 };

export default function AnalyticsPage() {
  const [charts, setCharts] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsAPI.getCharts(), analyticsAPI.getInsights()])
      .then(([c,i])=>{ setCharts(c.data); setInsights(i.data.insights||[]); })
      .catch(()=>toast.error('Failed to load analytics'))
      .finally(()=>setLoading(false));
  },[]);

  if (loading) return (
    <div>
      <div className="shimmer" style={{height:'28px',width:'180px',marginBottom:'20px'}}/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
        {[...Array(4)].map((_,i)=><div key={i} className="shimmer" style={{height:'280px',borderRadius:'14px'}}/>)}
      </div>
    </div>
  );

  const ChartCard = ({title,badge,children}) => (
    <div className="card">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'18px'}}>
        <div className="card-title">{title}</div>
        {badge && <span className="badge badge-info">{badge}</span>}
      </div>
      {children}
    </div>
  );

  return (
    <div>
      <div style={{marginBottom:'20px'}}>
        <div className="page-title">Analytics</div>
        <div className="page-subtitle">Visual breakdown of your financial patterns</div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'16px'}}>
        <ChartCard title="Expenses by Category" badge="This month">
          {!charts?.categoryData?.length
            ? <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'220px',color:'#94A3B8',fontSize:'13px'}}>No expense data this month</div>
            : <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={charts.categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value">
                    {charts.categoryData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                  </Pie>
                  <Tooltip content={<Tooltip2/>}/>
                  <Legend formatter={v=><span style={{color:'#64748B',fontSize:'12px'}}>{v}</span>}/>
                </PieChart>
              </ResponsiveContainer>
          }
        </ChartCard>

        <ChartCard title="Income vs Expenses" badge="Last 6 months">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={charts?.monthlyData||[]} barSize={14} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9"/>
              <XAxis dataKey="month" tick={axis} axisLine={false} tickLine={false}/>
              <YAxis tick={axis} axisLine={false} tickLine={false} tickFormatter={fmt}/>
              <Tooltip content={<Tooltip2/>}/>
              <Legend formatter={v=><span style={{color:'#64748B',fontSize:'12px'}}>{v}</span>}/>
              <Bar dataKey="income" name="Income" fill="#22C55E" radius={[4,4,0,0]}/>
              <Bar dataKey="expense" name="Expense" fill="#EF4444" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Savings Trend" badge="Last 6 months">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={charts?.monthlyData||[]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9"/>
              <XAxis dataKey="month" tick={axis} axisLine={false} tickLine={false}/>
              <YAxis tick={axis} axisLine={false} tickLine={false} tickFormatter={fmt}/>
              <Tooltip content={<Tooltip2/>}/>
              <Line type="monotone" dataKey="savings" name="Savings" stroke="#7C3AED" strokeWidth={2.5} dot={{fill:'#7C3AED',r:4}} activeDot={{r:6}}/>
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Spending" badge="Last 6 months">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={charts?.monthlyData||[]} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9"/>
              <XAxis dataKey="month" tick={axis} axisLine={false} tickLine={false}/>
              <YAxis tick={axis} axisLine={false} tickLine={false} tickFormatter={fmt}/>
              <Tooltip content={<Tooltip2/>}/>
              <Bar dataKey="expense" name="Spending" fill="#2563EB" radius={[5,5,0,0]} fillOpacity={0.85}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* AI insights grid */}
      <div className="card">
        <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'16px'}}>
          <span style={{fontSize:'18px'}}>🤖</span>
          <div className="card-title">AI Spending Analysis</div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'10px'}}>
          {insights.length===0
            ? <div style={{gridColumn:'1/-1',textAlign:'center',padding:'32px',color:'#94A3B8',fontSize:'13px'}}>Add more transactions to see AI insights</div>
            : insights.map((ins,i)=>(
              <div key={i} className={`insight-item ${ins.type}`} style={{margin:0}}>
                <span style={{fontSize:'20px'}}>{ins.icon}</span>
                <span>{ins.message}</span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
