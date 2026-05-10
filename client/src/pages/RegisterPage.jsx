import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'', confirmPassword:'' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const inp = { width:'100%', background:'#F8FAFC', border:'1.5px solid #E2E8F0', borderRadius:'10px', padding:'11px 14px 11px 40px', fontSize:'14px', color:'#0F172A', outline:'none', fontFamily:'inherit' };
  const lbl = { display:'block', fontSize:'12px', fontWeight:'600', color:'#374151', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'.05em' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be 6+ characters'); return; }
    setLoading(true);
    try {
      await register({ name:form.name, email:form.email, password:form.password });
      toast.success('Account created! Welcome 🎉');
      navigate('/dashboard');
    } catch(err) { toast.error(err.response?.data?.message||'Registration failed'); }
    finally { setLoading(false); }
  };

  const EyeIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      {showPw
        ? <><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></>
        : <><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></>
      }
    </svg>
  );

  const fields = [
    { key:'name',            type:'text',     icon:'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', label:'Full Name',        ph:'Amith Kumar' },
    { key:'email',           type:'email',    icon:'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', label:'Email Address', ph:'you@example.com' },
    { key:'password',        type:'password', icon:'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', label:'Password',      ph:'Min. 6 characters', eye:true },
    { key:'confirmPassword', type:'password', icon:'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', label:'Confirm Password', ph:'Re-enter password' },
  ];

  return (
    <div className="auth-page">
      <div style={{width:'100%',maxWidth:'420px'}}>
        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:'24px'}}>
          <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:'54px',height:'54px',borderRadius:'16px',background:'#2563EB',marginBottom:'12px',boxShadow:'0 8px 24px rgba(37,99,235,.35)'}}>
            <svg viewBox="0 0 20 20" fill="none" width="28" height="28">
              <rect x="2" y="11" width="3" height="7" rx="1" fill="white" opacity=".6"/>
              <rect x="8" y="7" width="3" height="11" rx="1" fill="white" opacity=".8"/>
              <rect x="14" y="3" width="3" height="15" rx="1" fill="white"/>
              <path d="M3 8L8 5L13 7.5L17 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity=".5"/>
            </svg>
          </div>
          <div style={{fontSize:'26px',fontWeight:'700',color:'#0F172A',letterSpacing:'-0.5px'}}>FinTrack <span style={{color:'#2563EB'}}>AI</span></div>
          <div style={{fontSize:'14px',color:'#64748B',marginTop:'4px'}}>Smart finance management, powered by AI</div>
        </div>

        <div className="auth-card">
          <div style={{marginBottom:'22px'}}>
            <div style={{fontSize:'20px',fontWeight:'700',color:'#0F172A'}}>Create account</div>
            <div style={{fontSize:'13px',color:'#64748B',marginTop:'3px'}}>Start your financial journey today</div>
          </div>

          <form onSubmit={handleSubmit}>
            {fields.map(({key,type,icon,label,ph,eye})=>(
              <div key={key} style={{marginBottom:'14px'}}>
                <label style={lbl}>{label}</label>
                <div style={{position:'relative'}}>
                  <span style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',color:'#94A3B8',display:'flex',pointerEvents:'none'}}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={icon}/></svg>
                  </span>
                  <input
                    type={eye||type==='password' ? (showPw?'text':'password') : type}
                    value={form[key]}
                    onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}
                    style={{...inp, paddingRight: eye?'42px':'14px'}}
                    placeholder={ph}
                    required
                  />
                  {eye && (
                    <button type="button" onClick={()=>setShowPw(!showPw)} style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#94A3B8',display:'flex',padding:0}}>
                      <EyeIcon/>
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button type="submit" disabled={loading} style={{width:'100%',background:'#2563EB',color:'#fff',fontWeight:'700',fontSize:'15px',padding:'13px',borderRadius:'11px',border:'none',cursor:loading?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',opacity:loading?.7:1,marginTop:'6px',fontFamily:'inherit'}}>
              {loading
                ? <div className="spinner" style={{width:'18px',height:'18px',border:'2px solid rgba(255,255,255,.3)',borderTop:'2px solid #fff'}}/>
                : <>Create free account <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg></>
              }
            </button>
          </form>

          <div style={{textAlign:'center',fontSize:'14px',color:'#64748B',marginTop:'18px'}}>
            Already have an account?{' '}
            <Link to="/login" style={{color:'#2563EB',fontWeight:'700',textDecoration:'none'}}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
