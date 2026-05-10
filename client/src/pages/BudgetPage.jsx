import { useState, useEffect } from 'react';
import { budgetAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CATS = ['Food','Travel','Shopping','Bills','Entertainment','Health','Education','Other'];
const ICONS = {Food:'🍔',Travel:'✈️',Shopping:'🛍️',Bills:'📱',Entertainment:'🎬',Health:'🏥',Education:'📚',Other:'📌'};
const fmt = n => '₹'+(n||0).toLocaleString('en-IN');

const ProgressBar = ({spent,budget}) => {
  const pct = budget>0 ? Math.min(100,(spent/budget)*100) : 0;
  const color = pct>=90?'#EF4444':pct>=70?'#F59E0B':'#2563EB';
  return (
    <div>
      <div className="prog-track"><div className="prog-bar" style={{width:`${pct}%`,background:color}}/></div>
      <div style={{display:'flex',justifyContent:'space-between',marginTop:'4px',fontSize:'11px',color:'#94A3B8'}}>
        <span>{fmt(spent)} spent</span><span style={{color: pct>=90?'#DC2626':pct>=70?'#D97706':'#64748B'}}>{Math.round(pct)}%</span>
      </div>
    </div>
  );
};

export default function BudgetPage() {
  const { user, updateUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [total, setTotal] = useState('');
  const [catBudgets, setCatBudgets] = useState({});
  const [saving, setSaving] = useState(false);

  const inputStyle = {width:'100%',background:'#F8FAFC',border:'1.5px solid #E2E8F0',borderRadius:'9px',padding:'9px 12px',fontSize:'14px',color:'#0F172A',outline:'none',fontFamily:'inherit'};

  const fetchBudget = async () => {
    setLoading(true);
    try {
      const r = await budgetAPI.get();
      setData(r.data);
      setTotal(r.data.budget?.totalBudget||'');
      setCatBudgets(r.data.budget?.categoryBudgets||{});
    } catch { toast.error('Failed to load budget'); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ fetchBudget(); },[]);

  const handleSave = async () => {
    if (!total||Number(total)<=0) { toast.error('Enter a valid budget'); return; }
    setSaving(true);
    try {
      await budgetAPI.set({ totalBudget:Number(total), categoryBudgets:catBudgets });
      updateUser({...user,monthlyBudget:Number(total)});
      toast.success('Budget saved!');
      setEditing(false);
      fetchBudget();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const now = new Date();
  const monthName = now.toLocaleString('default',{month:'long',year:'numeric'});
  const pct = data?.budget?.totalBudget>0 ? Math.min(100,Math.round(((data.totalSpent||0)/data.budget.totalBudget)*100)) : 0;
  const barColor = pct>=90?'#EF4444':pct>=70?'#F59E0B':'#2563EB';

  if (loading) return <div className="shimmer" style={{height:'300px',borderRadius:'14px'}}/>;

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'20px'}}>
        <div>
          <div className="page-title">Budget</div>
          <div className="page-subtitle">{monthName}</div>
        </div>
        {!editing
          ? <button className="btn btn-primary btn-sm" onClick={()=>setEditing(true)}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              {data?.budget ? 'Edit Budget' : 'Set Budget'}
            </button>
          : <div style={{display:'flex',gap:'8px'}}>
              <button className="btn btn-secondary btn-sm" onClick={()=>setEditing(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                {saving ? <div className="spinner" style={{width:'14px',height:'14px',border:'2px solid rgba(255,255,255,.3)',borderTop:'2px solid #fff'}}/> : 'Save'}
              </button>
            </div>
        }
      </div>

      {/* Total budget card */}
      <div className="card" style={{marginBottom:'16px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'20px'}}>
          <div style={{width:'42px',height:'42px',borderRadius:'12px',background:'#EFF6FF',border:'1px solid #BFDBFE',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px'}}>🎯</div>
          <div>
            <div className="card-title">Monthly Budget Overview</div>
            <div className="card-subtitle">{editing?'Set your total and category budgets':'Track spending vs budget'}</div>
          </div>
        </div>

        {editing ? (
          <div>
            <label style={{display:'block',fontSize:'12px',fontWeight:'600',color:'#374151',marginBottom:'6px',textTransform:'uppercase',letterSpacing:'.05em'}}>Total Monthly Budget (₹)</label>
            <input type="number" value={total} onChange={e=>setTotal(e.target.value)} style={{...inputStyle,fontSize:'20px',fontWeight:'700',maxWidth:'240px'}} placeholder="e.g. 50000" min="0"/>
          </div>
        ) : data?.budget ? (
          <>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:'12px'}}>
              <div>
                <div style={{fontSize:'32px',fontWeight:'700',color:'#0F172A',letterSpacing:'-1px'}}>{fmt(data.totalSpent)}</div>
                <div style={{fontSize:'13px',color:'#64748B',marginTop:'2px'}}>of {fmt(data.budget.totalBudget)} budget</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:'28px',fontWeight:'700',color:barColor}}>{pct}%</div>
                <div style={{fontSize:'12px',color:'#94A3B8'}}>utilized</div>
              </div>
            </div>
            <div className="prog-track" style={{height:'10px'}}>
              <div className="prog-bar" style={{width:`${pct}%`,background:barColor}}/>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:'8px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'13px'}}>
                {pct>=90
                  ? <><span style={{color:'#DC2626',fontSize:'16px'}}>🚨</span><span style={{color:'#DC2626',fontWeight:'600'}}>Budget exceeded!</span></>
                  : pct>=70
                  ? <><span style={{fontSize:'16px'}}>⚠️</span><span style={{color:'#D97706',fontWeight:'600'}}>Approaching limit</span></>
                  : <><span style={{fontSize:'16px'}}>✅</span><span style={{color:'#16A34A',fontWeight:'600'}}>On track</span></>
                }
              </div>
              <div style={{fontSize:'13px',color:'#64748B'}}>Remaining: <strong style={{color:'#0F172A'}}>{fmt(data.remainingBudget)}</strong></div>
            </div>
          </>
        ) : (
          <div className="empty-state" style={{padding:'32px 24px'}}>
            <div className="empty-icon">🎯</div>
            <div className="empty-title">No budget set</div>
            <div className="empty-text">Click "Set Budget" to start tracking</div>
          </div>
        )}
      </div>

      {/* Category budgets */}
      <div className="card">
        <div style={{marginBottom:'16px'}}>
          <div className="card-title">Category Budgets</div>
          <div className="card-subtitle">Set spending limits per category</div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0'}}>
          {CATS.map((cat,i)=>{
            const budget = catBudgets[cat]||0;
            const spent  = data?.categorySpent?.[cat]||0;
            return (
              <div key={cat} style={{padding:'14px 16px',borderBottom: i<CATS.length-2?'1px solid #F1F5F9':'none', borderRight:i%2===0?'1px solid #F1F5F9':'none'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'8px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                    <span style={{fontSize:'18px'}}>{ICONS[cat]}</span>
                    <span style={{fontSize:'13px',fontWeight:'600',color:'#0F172A'}}>{cat}</span>
                  </div>
                  {editing
                    ? <input type="number" value={catBudgets[cat]||''} onChange={e=>setCatBudgets(p=>({...p,[cat]:Number(e.target.value)}))}
                        style={{width:'90px',background:'#F8FAFC',border:'1.5px solid #E2E8F0',borderRadius:'8px',padding:'5px 8px',fontSize:'13px',color:'#0F172A',outline:'none',textAlign:'right',fontFamily:'inherit'}} placeholder="₹ 0" min="0"/>
                    : <span style={{fontSize:'12px',color:'#64748B'}}>{fmt(spent)}{budget>0?` / ${fmt(budget)}`:''}</span>
                  }
                </div>
                {!editing && budget>0 && <ProgressBar spent={spent} budget={budget}/>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
