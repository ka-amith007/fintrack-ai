import { useState } from 'react';
import { profileAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profileForm, setProfileForm] = useState({ name:user?.name||'', currency:user?.currency||'INR', monthlyBudget:user?.monthlyBudget||'' });
  const [pwForm, setPwForm] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' });
  const [savingP, setSavingP] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const initials = user?.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)||'U';

  const inp = { width:'100%', background:'#F8FAFC', border:'1.5px solid #E2E8F0', borderRadius:'10px', padding:'11px 14px', fontSize:'14px', color:'#0F172A', outline:'none', fontFamily:'inherit' };
  const lbl = { display:'block', fontSize:'12px', fontWeight:'600', color:'#374151', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'.05em' };

  const handleProfileSave = async (e) => {
    e.preventDefault(); setSavingP(true);
    try {
      const r = await profileAPI.update(profileForm);
      updateUser(r.data.user);
      toast.success('Profile updated!');
    } catch(err) { toast.error(err.response?.data?.message||'Update failed'); }
    finally { setSavingP(false); }
  };

  const handlePwSave = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { toast.error('Password must be 6+ characters'); return; }
    setSavingPw(true);
    try {
      await profileAPI.changePassword({ currentPassword:pwForm.currentPassword, newPassword:pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword:'', newPassword:'', confirmPassword:'' });
    } catch(err) { toast.error(err.response?.data?.message||'Failed'); }
    finally { setSavingPw(false); }
  };

  const Section = ({title, subtitle, icon, children}) => (
    <div className="card" style={{marginBottom:'16px'}}>
      <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'20px',paddingBottom:'16px',borderBottom:'1px solid #F1F5F9'}}>
        <div style={{width:'40px',height:'40px',borderRadius:'11px',background:'#EFF6FF',border:'1px solid #BFDBFE',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>{icon}</div>
        <div><div className="card-title">{title}</div><div className="card-subtitle">{subtitle}</div></div>
      </div>
      {children}
    </div>
  );

  return (
    <div style={{maxWidth:'640px'}}>
      <div style={{marginBottom:'20px'}}>
        <div className="page-title">Profile</div>
        <div className="page-subtitle">Manage your account settings</div>
      </div>

      {/* Profile header card */}
      <div className="card" style={{marginBottom:'16px',display:'flex',alignItems:'center',gap:'16px'}}>
        <div style={{width:'60px',height:'60px',borderRadius:'18px',background:'#2563EB',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px',fontWeight:'700',color:'#fff',flexShrink:0,boxShadow:'0 4px 16px rgba(37,99,235,.3)'}}>
          {initials}
        </div>
        <div>
          <div style={{fontSize:'18px',fontWeight:'700',color:'#0F172A'}}>{user?.name}</div>
          <div style={{fontSize:'13px',color:'#64748B',marginTop:'2px'}}>{user?.email}</div>
          {user?.createdAt && (
            <div style={{fontSize:'12px',color:'#94A3B8',marginTop:'4px',display:'flex',alignItems:'center',gap:'4px'}}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Member since {format(new Date(user.createdAt),'MMMM yyyy')}
            </div>
          )}
        </div>
        <div style={{marginLeft:'auto'}}>
          <span className="badge badge-info">Active</span>
        </div>
      </div>

      {/* Personal info */}
      <Section title="Personal Information" subtitle="Update your name and preferences" icon="👤">
        <form onSubmit={handleProfileSave}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',marginBottom:'14px'}}>
            <div>
              <label style={lbl}>Full Name</label>
              <input type="text" value={profileForm.name} onChange={e=>setProfileForm(p=>({...p,name:e.target.value}))} style={inp} required/>
            </div>
            <div>
              <label style={lbl}>Email Address</label>
              <input type="email" value={user?.email||''} style={{...inp,opacity:.55,cursor:'not-allowed'}} disabled/>
              <div style={{fontSize:'11px',color:'#94A3B8',marginTop:'4px'}}>Email cannot be changed</div>
            </div>
            <div>
              <label style={lbl}>Currency</label>
              <div style={{position:'relative'}}>
                <select value={profileForm.currency} onChange={e=>setProfileForm(p=>({...p,currency:e.target.value}))} style={{...inp,appearance:'none',paddingRight:'32px',cursor:'pointer'}}>
                  <option value="INR">INR (₹) — Indian Rupee</option>
                  <option value="USD">USD ($) — US Dollar</option>
                  <option value="EUR">EUR (€) — Euro</option>
                  <option value="GBP">GBP (£) — British Pound</option>
                </select>
                <span style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',pointerEvents:'none',color:'#94A3B8',display:'flex'}}>
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                </span>
              </div>
            </div>
            <div>
              <label style={lbl}>Monthly Budget (₹)</label>
              <input type="number" value={profileForm.monthlyBudget} onChange={e=>setProfileForm(p=>({...p,monthlyBudget:e.target.value}))} style={inp} placeholder="e.g. 50000" min="0"/>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-sm" disabled={savingP}>
            {savingP
              ? <div className="spinner" style={{width:'14px',height:'14px',border:'2px solid rgba(255,255,255,.3)',borderTop:'2px solid #fff'}}/>
              : <><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Save Changes</>
            }
          </button>
        </form>
      </Section>

      {/* Change password */}
      <Section title="Change Password" subtitle="Keep your account secure" icon="🔒">
        <form onSubmit={handlePwSave}>
          {[
            {key:'currentPassword', label:'Current Password', ph:'Enter current password'},
            {key:'newPassword',     label:'New Password',     ph:'Min. 6 characters'},
            {key:'confirmPassword', label:'Confirm Password', ph:'Re-enter new password'},
          ].map(({key,label,ph})=>(
            <div key={key} style={{marginBottom:'14px'}}>
              <label style={lbl}>{label}</label>
              <div style={{position:'relative'}}>
                <input
                  type={showPw?'text':'password'}
                  value={pwForm[key]}
                  onChange={e=>setPwForm(p=>({...p,[key]:e.target.value}))}
                  style={{...inp,paddingRight:'42px'}}
                  placeholder={ph}
                  required
                />
                {key==='currentPassword' && (
                  <button type="button" onClick={()=>setShowPw(!showPw)}
                    style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#94A3B8',display:'flex',padding:0}}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      {showPw
                        ? <><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></>
                        : <><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></>
                      }
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
          <button type="submit" className="btn btn-primary btn-sm" disabled={savingPw}>
            {savingPw
              ? <div className="spinner" style={{width:'14px',height:'14px',border:'2px solid rgba(255,255,255,.3)',borderTop:'2px solid #fff'}}/>
              : <><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>Change Password</>
            }
          </button>
        </form>
      </Section>

      {/* Account stats */}
      <div className="card">
        <div className="card-title" style={{marginBottom:'14px'}}>Account Info</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
          {[
            {label:'Account ID',     value:'#'+((user?._id||'').slice(-8).toUpperCase())},
            {label:'Currency',       value:user?.currency||'INR'},
            {label:'Monthly Budget', value:user?.monthlyBudget ? '₹'+Number(user.monthlyBudget).toLocaleString('en-IN') : 'Not set'},
            {label:'Member Since',   value:user?.createdAt ? format(new Date(user.createdAt),'MMM d, yyyy') : '—'},
          ].map(({label,value})=>(
            <div key={label} style={{background:'#F8FAFC',border:'1px solid #E2E8F0',borderRadius:'10px',padding:'12px 14px'}}>
              <div style={{fontSize:'11px',color:'#94A3B8',fontWeight:'600',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:'4px'}}>{label}</div>
              <div style={{fontSize:'14px',fontWeight:'600',color:'#0F172A'}}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
