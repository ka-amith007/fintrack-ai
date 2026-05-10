import { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const fmt = (n) => '₹' + (n||0).toLocaleString('en-IN');

const StatCard = ({ label, value, type, icon, change, delay }) => {
  const cls = { balance:'s-blue', income:'s-green', expense:'s-red', savings:'s-purple' }[type];
  return (
    <div className={`stat-card ${cls} fade-up`} style={{animationDelay:`${delay}s`}}>
      <div className="stat-icon">
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={icon}/></svg>
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{fmt(value)}</div>
      {change && <div className="stat-change">{change}</div>}
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsAPI.getSummary(), analyticsAPI.getInsights()])
      .then(([s, i]) => { setSummary(s.data); setInsights(i.data.insights||[]); })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) return (
    <div>
      <div className="shimmer" style={{height:'28px',width:'220px',marginBottom:'20px'}}/>
      <div className="stat-grid">
        {[...Array(4)].map((_,i) => <div key={i} className="shimmer" style={{height:'120px'}}/>)}
      </div>
    </div>
  );

  const budgetPct = user?.monthlyBudget > 0 ? Math.min(100, Math.round(((summary?.monthExpense||0)/user.monthlyBudget)*100)) : 0;

  return (
    <div>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'20px'}}>
        <div>
          <div className="page-title">{greet}, {user?.name?.split(' ')[0]} 👋</div>
          <div className="page-subtitle">{format(new Date(),'EEEE, MMMM d, yyyy')}</div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => window.location.reload()}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        <StatCard label="Total Balance" value={summary?.totalBalance} type="balance" icon="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" delay={0} change="↑ All time balance"/>
        <StatCard label="Total Income" value={summary?.totalIncome} type="income" icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" delay={.05} change={`This month: ${fmt(summary?.monthIncome)}`}/>
        <StatCard label="Total Expenses" value={summary?.totalExpense} type="expense" icon="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" delay={.1} change={`This month: ${fmt(summary?.monthExpense)}`}/>
        <StatCard label="Month Savings" value={summary?.monthSavings} type="savings" icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" delay={.15} change="Income - Expenses"/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1.6fr',gap:'16px',marginBottom:'16px'}}>
        {/* Monthly overview */}
        <div className="card fade-up fade-up-1">
          <div style={{marginBottom:'16px'}}>
            <div className="card-title">This Month</div>
            <div className="card-subtitle">May 2026</div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
            {[
              { label:'Income', value:summary?.monthIncome, color:'#16A34A', bg:'#F0FDF4', border:'#BBF7D0', icon:'M5 10l7-7m0 0l7 7m-7-7v18' },
              { label:'Expenses', value:summary?.monthExpense, color:'#DC2626', bg:'#FEF2F2', border:'#FECACA', icon:'M19 14l-7 7m0 0l-7-7m7 7V3' }
            ].map(({label,value,color,bg,border,icon}) => (
              <div key={label} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 14px',borderRadius:'10px',background:bg,border:`1px solid ${border}`}}>
                <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                  <div style={{width:'30px',height:'30px',borderRadius:'8px',background:'#fff',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <svg width="14" height="14" fill="none" stroke={color} strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={icon}/></svg>
                  </div>
                  <span style={{fontSize:'13px',fontWeight:'600',color}}>{label}</span>
                </div>
                <span style={{fontSize:'15px',fontWeight:'700',color}}>{fmt(value)}</span>
              </div>
            ))}
            {user?.monthlyBudget > 0 && (
              <div style={{marginTop:'4px'}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',color:'#64748B',marginBottom:'6px'}}>
                  <span>Budget used</span><span style={{fontWeight:'600',color: budgetPct>=90?'#DC2626':budgetPct>=70?'#D97706':'#16A34A'}}>{budgetPct}%</span>
                </div>
                <div className="prog-track">
                  <div className="prog-bar" style={{width:`${budgetPct}%`,background:budgetPct>=90?'#EF4444':budgetPct>=70?'#F59E0B':'#2563EB'}}/>
                </div>
                <div style={{fontSize:'11px',color:'#94A3B8',marginTop:'4px'}}>Budget: {fmt(user.monthlyBudget)}</div>
              </div>
            )}
          </div>
        </div>

        {/* AI Insights */}
        <div className="card fade-up fade-up-2">
          <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'14px'}}>
            <div style={{width:'28px',height:'28px',borderRadius:'8px',background:'#FFFBEB',border:'1px solid #FDE68A',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px'}}>💡</div>
            <div>
              <div className="card-title">AI Financial Insights</div>
              <div className="card-subtitle">Personalized analysis</div>
            </div>
          </div>
          <div style={{maxHeight:'220px',overflowY:'auto'}}>
            {insights.length===0
              ? <div className="insight-item info"><span>💡</span><span>Add transactions to get personalized AI financial insights!</span></div>
              : insights.map((ins,i) => (
                <div key={i} className={`insight-item ${ins.type}`}>
                  <span style={{fontSize:'16px'}}>{ins.icon}</span>
                  <span>{ins.message}</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card fade-up fade-up-3" style={{padding:0,overflow:'hidden'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 20px',borderBottom:'1px solid #F1F5F9'}}>
          <div>
            <div className="card-title">Recent Transactions</div>
            <div className="card-subtitle">Your latest financial activity</div>
          </div>
          <a href="/transactions" style={{fontSize:'13px',color:'#2563EB',fontWeight:'600',textDecoration:'none'}}>View all →</a>
        </div>
        {!summary?.recentTransactions?.length ? (
          <div className="empty-state">
            <div className="empty-icon">💳</div>
            <div className="empty-title">No transactions yet</div>
            <div className="empty-text">Add your first transaction to get started</div>
          </div>
        ) : summary.recentTransactions.map((tx,i) => (
          <div key={tx._id} className="tx-row" style={{animationDelay:`${i*.04}s`}}>
            <div className="tx-cat-icon">
              {{'Food':'🍔','Travel':'✈️','Shopping':'🛍️','Bills':'📱','Entertainment':'🎬','Health':'🏥','Education':'📚','Salary':'💼','Investment':'📈','Freelance':'💻','Other':'📌'}[tx.category]||'💰'}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div className="tx-title">{tx.title}</div>
              <div className="tx-meta">{tx.category} · {format(new Date(tx.date),'MMM d, yyyy')}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div className={tx.type==='income'?'tx-amount-pos':'tx-amount-neg'}>
                {tx.type==='income'?'+':'-'}{fmt(tx.amount)}
              </div>
              <span className={`badge badge-${tx.type}`}>{tx.type}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
