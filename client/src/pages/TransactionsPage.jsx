import { useState, useEffect, useCallback } from 'react';
import { transactionAPI } from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ICONS = {Food:'🍔',Travel:'✈️',Shopping:'🛍️',Bills:'📱',Entertainment:'🎬',Health:'🏥',Education:'📚',Salary:'💼',Investment:'📈',Freelance:'💻',Other:'📌'};
const CATS_EXPENSE = ['Food','Travel','Shopping','Bills','Entertainment','Health','Education','Other'];
const CATS_INCOME  = ['Salary','Freelance','Investment','Other'];
const fmt = (n) => '₹' + (n||0).toLocaleString('en-IN');
const emptyForm = { title:'', amount:'', type:'expense', category:'Food', date:format(new Date(),'yyyy-MM-dd'), notes:'' };

export default function TransactionsPage() {
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCat, setFilterCat] = useState('all');
  const [total, setTotal] = useState(0);

  const fetchTxs = useCallback(async () => {
    setLoading(true);
    try {
      const p = {};
      if (search) p.search = search;
      if (filterType !== 'all') p.type = filterType;
      if (filterCat !== 'all') p.category = filterCat;
      const r = await transactionAPI.getAll(p);
      setTxs(r.data.transactions);
      setTotal(r.data.pagination.total);
    } catch { toast.error('Failed to load transactions'); }
    finally { setLoading(false); }
  }, [search, filterType, filterCat]);

  useEffect(() => { fetchTxs(); }, [fetchTxs]);

  const openAdd  = () => { setForm(emptyForm); setEdit(null); setModal(true); };
  const openEdit = (tx) => {
    setForm({ title:tx.title, amount:tx.amount, type:tx.type, category:tx.category, date:format(new Date(tx.date),'yyyy-MM-dd'), notes:tx.notes||'' });
    setEdit(tx); setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (edit) { await transactionAPI.update(edit._id, form); toast.success('Updated!'); }
      else      { await transactionAPI.create(form); toast.success('Transaction added!'); }
      setModal(false); fetchTxs();
    } catch(err) { toast.error(err.response?.data?.message||'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return;
    try { await transactionAPI.delete(id); toast.success('Deleted'); fetchTxs(); }
    catch { toast.error('Delete failed'); }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18); doc.text('FinTrack AI — Transactions', 14, 22);
    doc.setFontSize(10); doc.text(`Generated: ${format(new Date(),'MMM d, yyyy')}`, 14, 30);
    autoTable(doc, {
      startY:36,
      head:[['Date','Title','Category','Type','Amount']],
      body: txs.map(tx=>[format(new Date(tx.date),'MMM d, yyyy'),tx.title,tx.category,tx.type,(tx.type==='income'?'+':'-')+fmt(tx.amount)]),
      headStyles:{fillColor:[37,99,235]}, styles:{fontSize:9}
    });
    doc.save('fintrack-transactions.pdf');
    toast.success('PDF exported!');
  };

  const cats = form.type==='income' ? CATS_INCOME : CATS_EXPENSE;

  const inputStyle = { width:'100%', background:'#F8FAFC', border:'1.5px solid #E2E8F0', borderRadius:'10px', padding:'11px 14px', fontSize:'14px', color:'#0F172A', outline:'none', fontFamily:'inherit' };
  const labelStyle = { display:'block', fontSize:'12px', fontWeight:'600', color:'#374151', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'.05em' };

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'20px'}}>
        <div>
          <div className="page-title">Transactions</div>
          <div className="page-subtitle">{total} records found</div>
        </div>
        <div style={{display:'flex',gap:'8px'}}>
          <button className="btn btn-secondary btn-sm" onClick={exportPDF}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Export PDF
          </button>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
            Add New
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <div style={{position:'relative',flex:1,minWidth:'180px'}}>
          <span style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',color:'#94A3B8',display:'flex'}}>
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/></svg>
          </span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by title or category..." style={{...inputStyle,paddingLeft:'38px',padding:'9px 14px 9px 38px'}}/>
        </div>
        {[
          { val:filterType, set:setFilterType, opts:[['all','All Types'],['income','Income'],['expense','Expense']] },
          { val:filterCat,  set:setFilterCat,  opts:[['all','All Categories'],...['Food','Travel','Shopping','Bills','Entertainment','Health','Education','Salary','Investment','Other'].map(c=>[c,c])] }
        ].map(({val,set,opts},i) => (
          <div key={i} style={{position:'relative'}}>
            <select value={val} onChange={e=>set(e.target.value)} style={{...inputStyle,width:'auto',paddingRight:'32px',appearance:'none',cursor:'pointer',padding:'9px 32px 9px 12px'}}>
              {opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}
            </select>
            <span style={{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',pointerEvents:'none',color:'#94A3B8',display:'flex'}}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
            </span>
          </div>
        ))}
        {(search||filterType!=='all'||filterCat!=='all') && (
          <button className="btn btn-secondary btn-sm" onClick={()=>{setSearch('');setFilterType('all');setFilterCat('all');}}>Clear</button>
        )}
      </div>

      {/* Table card */}
      <div className="card" style={{padding:0,overflow:'hidden'}}>
        {/* Table header */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 80px 90px 110px 80px',gap:'12px',padding:'10px 20px',background:'#F8FAFC',borderBottom:'1px solid #E2E8F0',fontSize:'11px',fontWeight:'600',color:'#64748B',textTransform:'uppercase',letterSpacing:'.06em'}}>
          <span>Transaction</span><span>Category</span><span>Date</span><span style={{textAlign:'right'}}>Amount</span><span/>
        </div>

        {loading ? [...Array(6)].map((_,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:'12px',padding:'14px 20px',borderBottom:'1px solid #F1F5F9'}}>
            <div className="shimmer" style={{width:'38px',height:'38px',borderRadius:'10px',flexShrink:0}}/>
            <div style={{flex:1}}><div className="shimmer" style={{height:'14px',width:'40%',marginBottom:'6px'}}/><div className="shimmer" style={{height:'12px',width:'25%'}}/></div>
            <div className="shimmer" style={{width:'80px',height:'14px'}}/>
          </div>
        )) : txs.length===0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <div className="empty-title">No transactions found</div>
            <div className="empty-text">Try adjusting your filters or add a new transaction</div>
          </div>
        ) : txs.map((tx,i)=>(
          <div key={tx._id} className="tx-row" style={{display:'grid',gridTemplateColumns:'1fr 80px 90px 110px 80px',gap:'12px',alignItems:'center'}}>
            <div style={{display:'flex',alignItems:'center',gap:'10px',minWidth:0}}>
              <div className="tx-cat-icon">{ICONS[tx.category]||'💰'}</div>
              <div style={{minWidth:0}}>
                <div className="tx-title" style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{tx.title}</div>
                {tx.notes && <div className="tx-meta" style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>"{tx.notes}"</div>}
              </div>
            </div>
            <div><span className="badge badge-info" style={{fontSize:'11px'}}>{tx.category}</span></div>
            <div className="tx-meta">{format(new Date(tx.date),'MMM d, yyyy')}</div>
            <div style={{textAlign:'right'}}>
              <div className={tx.type==='income'?'tx-amount-pos':'tx-amount-neg'}>{tx.type==='income'?'+':'-'}₹{tx.amount.toLocaleString('en-IN')}</div>
              <span className={`badge badge-${tx.type}`} style={{fontSize:'10px'}}>{tx.type}</span>
            </div>
            <div className="tx-actions" style={{justifyContent:'flex-end'}}>
              <button className="action-btn" onClick={()=>openEdit(tx)} title="Edit">
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              </button>
              <button className="action-btn del" onClick={()=>handleDelete(tx._id)} title="Delete">
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="modal-box">
            <div className="modal-header">
              <div>
                <div className="modal-title">{edit?'Edit Transaction':'New Transaction'}</div>
                <div style={{fontSize:'13px',color:'#94A3B8',marginTop:'2px'}}>Record your financial activity</div>
              </div>
              <button className="modal-close" onClick={()=>setModal(false)}>
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="type-toggle">
                  {['expense','income'].map(t=>(
                    <button key={t} type="button"
                      className={`type-btn ${form.type===t?`active-${t}`:''}`}
                      onClick={()=>setForm(p=>({...p,type:t,category:t==='income'?'Salary':'Food'}))}>
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>
                <div style={{marginBottom:'14px'}}>
                  <label style={labelStyle}>What for?</label>
                  <input type="text" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} style={inputStyle} placeholder="e.g. Zomato order, Salary credit" required/>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'14px'}}>
                  <div>
                    <label style={labelStyle}>Amount (₹)</label>
                    <input type="number" value={form.amount} onChange={e=>setForm(p=>({...p,amount:e.target.value}))} style={inputStyle} placeholder="0.00" min="0.01" step="0.01" required/>
                  </div>
                  <div>
                    <label style={labelStyle}>Date</label>
                    <input type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} style={inputStyle} required/>
                  </div>
                </div>
                <div style={{marginBottom:'14px'}}>
                  <label style={labelStyle}>Category</label>
                  <div style={{position:'relative'}}>
                    <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} style={{...inputStyle,appearance:'none',paddingRight:'36px',cursor:'pointer'}}>
                      {cats.map(c=><option key={c} value={c}>{ICONS[c]} {c}</option>)}
                    </select>
                    <span style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',pointerEvents:'none',color:'#94A3B8',display:'flex'}}>
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                    </span>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Add Notes (optional)</label>
                  <input type="text" value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} style={inputStyle} placeholder="More details about this..."/>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" style={{flex:1,justifyContent:'center'}} onClick={()=>setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{flex:1,justifyContent:'center'}} disabled={saving}>
                  {saving ? <div className="spinner" style={{width:'16px',height:'16px',border:'2px solid rgba(255,255,255,.3)',borderTop:'2px solid #fff'}}/> : (edit?'Save Changes':'Save Transaction')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
