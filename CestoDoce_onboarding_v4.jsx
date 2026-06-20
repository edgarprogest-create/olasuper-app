// OláSuper_onboarding_v4.jsx — Boas-vindas + Login + Registo + auth token sim
(function(){
const { useState, useEffect } = React;

const AUTH_KEY = 'cd4_auth_token';
const USER_KEY = 'cd4_user';

// ---- Contas de teste (fallback quando Supabase não está configurado) ----
const CONTAS_TESTE = [
  { email:'plus@olasuper.pt',   password:'teste1234', name:'Utilizador Plus',   plan:'plus' },
  { email:'saude@olasuper.pt',  password:'teste1234', name:'Utilizador Saúde',  plan:'plus_health' },
  { email:'free@olasuper.pt',   password:'teste1234', name:'Utilizador Grátis', plan:'free' },
];

// ---- Auth helpers — Supabase quando configurado, hardcoded como fallback ----
const SB = () => window.OlaSuperSupabase || window['OláSuperSupabase'];

async function authLogin(email, password) {
  // Contas de teste — funcionam sempre, mesmo com Supabase ligado
  const conta = CONTAS_TESTE.find(c => c.email === email && c.password === password);
  if (conta) {
    return { ok: true, user: { email: conta.email, name: conta.name, plan: conta.plan, usageLeft: 1 } };
  }
  // Senão, tenta Supabase
  const sb = SB();
  if (sb?.IS_CONFIGURED && sb.client) return await sb.login(email, password);
  return { ok: false, msg: 'Email ou password incorrectos.' };
}

async function authRegister(email, password, name) {
  const sb = SB();
  if (sb?.IS_CONFIGURED && sb.client) return await sb.register(email, password, name);
  return { ok: true, user: { email, name, plan: 'free', usageLeft: 1 } };
}

async function authCheckSession() {
  const sb = SB();
  if (sb?.IS_CONFIGURED && sb.client) return await sb.checkSession();
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const token = JSON.parse(raw);
    if (token.keep === false && !sessionStorage.getItem('cd4_ss')) return null;
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch { return null; }
}

async function authLogout() {
  const sb = SB();
  if (sb?.IS_CONFIGURED && sb.client) await sb.logout();
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem('cd4_ss');
}

// ---- helpers ----
function saveToken(user, keepSession) {
  const token = { uid: Date.now(), name: user.name, email: user.email, plan: user.plan||'free', exp: keepSession ? null : Date.now() + 1000*60*60*24*7 };
  try { localStorage.setItem(AUTH_KEY, JSON.stringify(token)); localStorage.setItem(USER_KEY, JSON.stringify({ name:user.name, email:user.email, plan:user.plan||'free' })); } catch {}
  return token;
}
function loadToken() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const t = JSON.parse(raw);
    if (t.exp && Date.now() > t.exp) { localStorage.removeItem(AUTH_KEY); return null; }
    return t;
  } catch { return null; }
}
function clearToken() { try { localStorage.removeItem(AUTH_KEY); localStorage.removeItem(USER_KEY); } catch {} }
function loadUser() { try { return JSON.parse(localStorage.getItem(USER_KEY)||'null'); } catch { return null; } }

// ---- Input field ----
function PInput({ label, type='text', value, onChange, placeholder, autoFocus }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom:14 }}>
      {label && <label style={{ display:'block', fontSize:11.5, fontWeight:700, color:P.ink3, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:5 }}>{label}</label>}
      <input
        type={type} value={value} onChange={e=>onChange(e.target.value)}
        placeholder={placeholder} autoFocus={autoFocus}
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        style={{ width:'100%', height:48, border:`1.5px solid ${focused?P.primary:P.line}`, borderRadius:12, padding:'0 14px', fontSize:15, fontFamily:'inherit', color:P.ink, background:P.surface, outline:'none', transition:'border-color 0.15s' }}
      />
    </div>
  );
}

// ---- Toggle ----
function PToggle({ value, onChange, label }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }} onClick={()=>onChange(!value)}>
      <div style={{ width:42, height:24, borderRadius:100, background:value?P.primary:P.surface3, position:'relative', transition:'background 0.2s', flexShrink:0, border:`1px solid ${value?P.primary:P.line}` }}>
        <div style={{ position:'absolute', top:3, left:value?20:3, width:16, height:16, borderRadius:'50%', background:'#fff', boxShadow:'0 1px 4px rgba(0,0,0,0.18)', transition:'left 0.18s' }}/>
      </div>
      <span style={{ fontSize:13.5, color:P.ink2 }}>{label}</span>
    </div>
  );
}

// ---- Logo ----
const LS_LOGO = 'cd4_logo_img';
function CDLogo({ size=72, editable=false, transparent=false }) {
  const [src, setSrc] = React.useState(() => {
    try { return localStorage.getItem(LS_LOGO) || null; } catch { return null; }
  });
  const [hover, setHover] = React.useState(false);
  const fileRef = React.useRef();

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target.result;
      setSrc(dataUrl);
      try { localStorage.setItem(LS_LOGO, dataUrl); } catch {}
    };
    reader.readAsDataURL(file);
  }

  const r = Math.round(size * 0.25);

  // Transparent mode: só texto limpo, nunca usa imagem (pode ter fundo colorido)
  if (transparent) {
    return (
      <div style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, padding:'8px 0' }}>
        <span style={{ fontSize:32, fontWeight:700, color:P.primary, letterSpacing:'-0.03em', fontFamily:'DM Sans, sans-serif', textAlign:'center' }}>OláSuper</span>
      </div>
    );
  }

  return (
    <label
      htmlFor="cd-logo-upload"
      style={{ width:'90%', height:160, flexShrink:0, position:'relative', cursor: editable ? 'pointer' : 'default', display:'block' }}
      onMouseEnter={() => editable && setHover(true)}
      onMouseLeave={() => editable && setHover(false)}
    >
      {/* Logo image or fallback */}
      {src ? (
        <img src={src} style={{ width:'100%', height:'100%', objectFit:'contain', display:'block', background:'transparent' }} alt="Logo OláSuper"/>
      ) : (
        <div style={{ width:'100%', height:'100%', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width={size*0.72} height={size*0.72} viewBox="0 0 120 40" fill="none">
            <text x="60" y="30" textAnchor="middle" fontFamily="DM Sans, sans-serif" fontWeight="800" fontSize="28" fill="#fff">OláSuper</text>
          </svg>
        </div>
      )}

      {/* Hover overlay — só quando editable */}
      {editable && hover && (
        <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <span style={{ fontSize:9, color:'#fff', fontWeight:700, letterSpacing:'0.03em' }}>SUBSTITUIR</span>
        </div>
      )}

      {/* File input — opacity:0 em vez de display:none para garantir activação via label */}
      {editable && (
        <input id="cd-logo-upload" type="file" accept="image/*"
          style={{ opacity:0, position:'absolute', inset:0, width:'100%', height:'100%', cursor:'pointer', zIndex:10 }}
          onChange={handleFile}/>
      )}
    </label>
  );
}

// ============ SCREEN 1 — BOAS-VINDAS ============
function WelcomeScreen({ onLogin, onRegister }) {
  const { t } = useI18n();
  return (
    <div data-screen-label="Boas-Vindas" style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'space-between', padding:'60px 32px 48px', background:'#6AAB10', overflowY:'auto' }}>
      {/* top spacer */}
      <div/>

      {/* center: logo + copy */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:0 }}>
        <CDLogo size={180} editable={true}/>
        <p style={{ margin:'16px 0 0', fontSize:18, color:'#fff', textAlign:'center', lineHeight:'24px', fontWeight:500, maxWidth:300 }}>
          {t('comecarPoupar')}
        </p>
        <p style={{ margin:'8px 0 0', fontSize:13, color:'rgba(255,255,255,0.75)', textAlign:'center', lineHeight:1.5, padding:'0 32px' }}>
          {t('tagline')}
        </p>
      </div>

      {/* bottom: CTAs */}
      <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:10, marginTop:24 }}>
        <button onClick={onLogin} style={{
          height:52, borderRadius:14, border:'none', background:'#fff', color:'#6AB221',
          fontSize:16, fontWeight:800, fontFamily:'inherit', cursor:'pointer', letterSpacing:'-0.01em'
        }}>{t('entrar')}</button>
        <button onClick={onRegister} style={{
          height:52, borderRadius:14, border:'2px solid rgba(255,255,255,0.7)', background:'transparent', color:'#fff',
          fontSize:16, fontWeight:700, fontFamily:'inherit', cursor:'pointer', letterSpacing:'-0.01em'
        }}>{t('criarConta')}</button>
        <p style={{ textAlign:'center', fontSize:11, color:'rgba(255,255,255,0.7)', margin:'4px 0 0', lineHeight:1.5 }}>
          Ao continuar, aceitas os <span style={{color:'#fff',fontWeight:600}}>Termos de Serviço</span> e a <span style={{color:'#fff',fontWeight:600}}>Política de Privacidade</span>
        </p>
      </div>
    </div>
  );
}


// ---- Shared: GreenTopZone with floating food emojis ----
const ALIMENTOS = [
  { emoji:'🥩', top:'5%',  left:'8%',  delay:0    },
  { emoji:'🍎', top:'8%',  left:'65%', delay:300  },
  { emoji:'🥦', top:'3%',  left:'82%', delay:600  },
  { emoji:'🐟', top:'18%', left:'38%', delay:900  },
  { emoji:'🍊', top:'25%', left:'5%',  delay:200  },
  { emoji:'🥕', top:'30%', left:'55%', delay:500  },
  { emoji:'🧀', top:'12%', left:'22%', delay:800  },
  { emoji:'🍇', top:'20%', left:'78%', delay:100  },
  { emoji:'🥚', top:'55%', left:'28%', delay:700  },
  { emoji:'🌽', top:'48%', left:'70%', delay:400  },
  { emoji:'🍋', top:'62%', left:'12%', delay:1000 },
  { emoji:'🥑', top:'68%', left:'85%', delay:150  },
  { emoji:'🛒', top:'42%', left:'48%', delay:550  },
  { emoji:'🍓', top:'72%', left:'42%', delay:250  },
  { emoji:'🥐', top:'58%', left:'90%', delay:650  },
  { emoji:'🍗', top:'78%', left:'18%', delay:350  },
  { emoji:'🥜', top:'85%', left:'62%', delay:450  },
  { emoji:'🫐', top:'38%', left:'15%', delay:750  },
];
function GreenTopZone({ children }) {
  return (
    <div style={{ background:'#2D5A0E', height:'40%', width:'100%', overflow:'hidden', position:'relative', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      <style>{`
        @keyframes cdFloat { 0%,100%{transform:translateY(0) rotate(-8deg)} 50%{transform:translateY(-12px) rotate(8deg)} }
      `}</style>
      {ALIMENTOS.map((item,i) => (
        <span key={i} style={{
          position:'absolute', top:item.top, left:item.left,
          fontSize:26, opacity:0.38, userSelect:'none', pointerEvents:'none',
          animation:`cdFloat ${2.2+(i*0.1)}s ease-in-out ${item.delay}ms infinite`,
          display:'inline-block'
        }}>{item.emoji}</span>
      ))}
      <div style={{ position:'relative', zIndex:2 }}>{children}</div>
    </div>
  );
}

// ---- Shared: UnderlineField ----
function UField({ label, type='text', value, onChange, placeholder, autoFocus, right }) {
  return (
    <div style={{ marginBottom:20 }}>
      <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#9E9E9E', letterSpacing:'0.05em', marginBottom:6, textTransform:'uppercase' }}>{label}</label>
      <div style={{ display:'flex', alignItems:'center', borderBottom:'1px solid #E0E0E0', paddingBottom:8 }}>
        <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} autoFocus={autoFocus}
          style={{ flex:1, border:'none', outline:'none', fontSize:15, color:'#1A1A1A', background:'transparent', fontFamily:'inherit', padding:0 }}/>
        {right}
      </div>
    </div>
  );
}

// ============ SCREEN 2 — LOGIN ============
function LoginScreen({ onSuccess, onRegister }) {
  const { t } = useI18n();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [keep,     setKeep]     = useState(true);
  const [showPw,   setShowPw]   = useState(false);
  const [entered,  setEntered]  = useState(false);
  React.useEffect(() => { setTimeout(() => setEntered(true), 30); }, []);

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await authLogin(email, password);
      if (!res.ok) { setError(res.msg); setLoading(false); return; }
      const token = saveToken(res.user, keep);
      setLoading(false);
      onSuccess(token);
    } catch(err) {
      console.error('login error:', err);
      setError('Erro de ligação. Tenta novamente.');
      setLoading(false);
    }
  }

  return (
    <div data-screen-label="Login" style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', background:'#2D5A0E', overflow:'hidden' }}>
      {/* Top zone with pattern + logo */}
      <GreenTopZone>
        <div/>
      </GreenTopZone>

      {/* White card */}
      <div style={{ flex:1, background:'#fff', borderRadius:'32px 32px 0 0', padding:'32px 28px 20px', marginTop:-20, overflowY:'auto',
        opacity: entered ? 1 : 0, transform: entered ? 'translateY(0)' : 'translateY(40px)', transition:'all 0.4s ease-out 0.1s' }}>
        <h1 style={{ margin:'0 0 4px', fontSize:24, fontWeight:800, color:'#1A1A1A', letterSpacing:'-0.03em' }}>Bem-vindo de volta</h1>
        <p style={{ margin:'0 0 28px', fontSize:14, color:'#9E9E9E' }}>Entra na tua conta OláSuper</p>

        <form onSubmit={submit}>
          <UField {...{}} placeholder={t('email')} type="email" value={email} onChange={setEmail} placeholder="o.teu@email.pt" autoFocus={true}/>
          <UField label="Password" type={showPw?'text':'password'} value={password} onChange={setPassword} placeholder="••••••••"
            right={<button type="button" onClick={()=>setShowPw(v=>!v)} style={{ border:'none', background:'none', cursor:'pointer', color:'#9E9E9E', fontSize:12.5, fontFamily:'inherit', padding:0, flexShrink:0 }}>{showPw?'Ocultar':'Ver'}</button>}/>

          {error && <p style={{ margin:'-12px 0 16px', fontSize:12.5, color:'#C62828', fontWeight:600 }}>{error}</p>}

          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:24 }}>
            <div onClick={()=>setKeep(v=>!v)} style={{ width:40, height:22, borderRadius:11, background:keep?P.primary:'#E0E0E0', cursor:'pointer', transition:'background 0.2s', position:'relative', flexShrink:0 }}>
              <div style={{ position:'absolute', top:3, left:keep?20:3, width:16, height:16, borderRadius:'50%', background:'#fff', transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }}/>
            </div>
            <span style={{ fontSize:13, color:'#6B6B6B' }}>Manter sessão iniciada</span>
          </div>

          <button type="submit" disabled={loading}
            style={{ width:'100%', height:52, borderRadius:14, border:'none', background:P.primary, color:'#fff', fontSize:16, fontWeight:800, fontFamily:'inherit', cursor:'pointer', letterSpacing:'-0.01em', marginBottom:16, opacity:loading?0.7:1 }}>
            {loading ? t('aEntrar') : 'Entrar'}
          </button>
        </form>

        <p style={{ textAlign:'center', margin:'0 0 12px', fontSize:13.5, color:'#9E9E9E', cursor:'pointer' }}>Esqueci-me da password</p>

        <div style={{ textAlign:'center', paddingTop:12, borderTop:'1px solid #F0F0F0' }}>
          <span style={{ fontSize:13.5, color:'#9E9E9E' }}>Ainda não tens conta? </span>
          <button onClick={onRegister} style={{ border:'none', background:'none', cursor:'pointer', color:P.primary, fontSize:13.5, fontWeight:700, fontFamily:'inherit', padding:0 }}>{t('regista')}</button>
        </div>
      </div>
    </div>
  );
}

// ============ SCREEN 3 — REGISTO ============
function RegisterScreen({ onSuccess, onLogin }) {
  const { t } = useI18n();
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [entered,  setEntered]  = useState(false);
  React.useEffect(() => { setTimeout(() => setEntered(true), 30); }, []);

  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) { setError('Insere o teu nome.'); return; }
    if (!email.includes('@')) { setError('Email inválido.'); return; }
    if (password.length < 6) { setError('Password: mínimo 6 caracteres.'); return; }
    if (password !== confirm) { setError('As passwords não coincidem.'); return; }
    setLoading(true); setError('');
    try {
      const res = await authRegister(email, password, name.trim());
      if (!res.ok) { setError(res.msg || 'Erro ao criar conta.'); setLoading(false); return; }
      const token = saveToken(res.user, true);
      setLoading(false);
      onSuccess(token);
    } catch(err) {
      console.error('register error:', err);
      setError('Erro de ligação. Tenta novamente.');
      setLoading(false);
    }
  }

  return (
    <div data-screen-label="Registo" style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', background:'#2D5A0E', overflow:'hidden' }}>
      {/* Top zone */}
      <GreenTopZone>
        <div style={{ display:'flex', alignItems:'center', gap:12, opacity: entered?1:0, transform: entered?'translateY(0)':'translateY(-16px)', transition:'all 0.4s ease-out' }}>
          <button onClick={onLogin} style={{ border:'none', background:'none', cursor:'pointer', padding:4, color:'#fff', display:'flex', alignItems:'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span style={{ fontSize:18, fontWeight:700, color:'#fff', letterSpacing:'-0.02em' }}>{t('criarConta')}</span>
        </div>
      </GreenTopZone>

      {/* White card */}
      <div style={{ flex:1, background:'#fff', borderRadius:'32px 32px 0 0', padding:'28px 28px 20px', marginTop:-20, overflowY:'auto',
        opacity: entered?1:0, transform: entered?'translateY(0)':'translateY(40px)', transition:'all 0.4s ease-out 0.1s' }}>

        <form onSubmit={submit}>
          <UField label="Nome" value={name} onChange={setName} placeholder="Maria Santos" autoFocus={true}/>
          <UField {...{}} placeholder={t('email')} type="email" value={email} onChange={setEmail} placeholder="o.teu@email.pt"/>
          <UField label="Password" type={showPw?'text':'password'} value={password} onChange={setPassword} placeholder="mínimo 6 caracteres"
            right={<button type="button" onClick={()=>setShowPw(v=>!v)} style={{ border:'none', background:'none', cursor:'pointer', color:'#9E9E9E', fontSize:12.5, fontFamily:'inherit', padding:0, flexShrink:0 }}>{showPw?'Ocultar':'Ver'}</button>}/>
          <UField label="Confirmar password" type={showPw?'text':'password'} value={confirm} onChange={setConfirm} placeholder="repete a password"/>

          {error && <p style={{ margin:'-12px 0 16px', fontSize:12.5, color:'#C62828', fontWeight:600 }}>{error}</p>}

          {password.length > 0 && (
            <div style={{ marginBottom:20 }}>
              <div style={{ height:3, borderRadius:100, background:'#F0F0F0', overflow:'hidden', marginBottom:4 }}>
                <div style={{ height:'100%', borderRadius:100, transition:'width 0.3s, background 0.3s',
                  width: password.length<6?'25%':password.length<10?'55%':'85%',
                  background: password.length<6?'#C62828':password.length<10?'#F9A825':P.primary }}/>
              </div>
              <span style={{ fontSize:11, color:'#9E9E9E' }}>{password.length<6?'Fraca':password.length<10?'Razoável':'Boa'}</span>
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{ width:'100%', height:52, borderRadius:14, border:'none', background:P.primary, color:'#fff', fontSize:16, fontWeight:800, fontFamily:'inherit', cursor:'pointer', letterSpacing:'-0.01em', marginBottom:20, opacity:loading?0.7:1 }}>
            {loading ? t('aCriar') : 'Criar conta'}
          </button>
        </form>

        <div style={{ textAlign:'center', paddingTop:12, borderTop:'1px solid #F0F0F0' }}>
          <span style={{ fontSize:13.5, color:'#9E9E9E' }}>Já tens conta? </span>
          <button onClick={onLogin} style={{ border:'none', background:'none', cursor:'pointer', color:P.primary, fontSize:13.5, fontWeight:700, fontFamily:'inherit', padding:0 }}>{t('entraAqui')}</button>
        </div>
      </div>
    </div>
  );
}

// ============ SPLASH ============
function SplashScreen() {
  return (
    <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:P.bg, gap:16 }}>
      <CDLogo size={72}/>
      <div style={{ width:36, height:4, borderRadius:100, background:P.surface3, overflow:'hidden' }}>
        <div style={{ height:'100%', background:P.primary, borderRadius:100, animation:'cdSplashLoad 1s ease forwards' }}/>
      </div>
    </div>
  );
}

// ============ AUTH GATE ============
// Wraps the whole app — shows onboarding until logged in
function AuthGate({ children, onUserChange }) {
  const [phase, setPhase] = useState('splash'); // splash | welcome | login | register | app
  const [user,  setUser]  = useState(null);

  useEffect(() => {
    async function initSession() {
      try {
        // Try Supabase session first, then localStorage fallback
        const sessionUser = await authCheckSession();
        if (sessionUser) {
          const u = { name: sessionUser.name||'Utilizador', email: sessionUser.email||'', plan: sessionUser.plan||'free', usageLeft: sessionUser.usageLeft??1, district: sessionUser.district||'lisboa', lang: sessionUser.lang||'pt' };
          setUser(u); onUserChange && onUserChange(u);
          setPhase('app');
        } else {
          setPhase('welcome');
        }
      } catch(e) {
        console.error('session check error:', e);
        setPhase('welcome');
      }
    }
    setTimeout(initSession, 800);
  }, []);

  function handleSuccess(token) {
    const u = loadUser() || { name: token.name||'Utilizador', email: '', plan: token.plan||'free' };
    if (!u.plan) u.plan = token.plan || 'free';
    setUser(u); onUserChange && onUserChange(u);
    setPhase('app');
  }

  async function handleLogout() {
    await authLogout();
    clearToken(); setUser(null); setPhase('welcome');
  }

  if (phase==='splash') return <SplashScreen/>;
  if (phase==='welcome') return <WelcomeScreen onLogin={()=>setPhase('login')} onRegister={()=>setPhase('register')}/>;
  if (phase==='login')   return <LoginScreen onSuccess={handleSuccess} onRegister={()=>setPhase('register')}/>;
  if (phase==='register') return <RegisterScreen onSuccess={handleSuccess} onLogin={()=>setPhase('login')}/>;

  // app phase — clone children injecting user + logout
  return typeof children === 'function' ? children({ user, onLogout: handleLogout }) : children;
}

Object.assign(window, {
  AuthGate, WelcomeScreen, LoginScreen, RegisterScreen, SplashScreen,
  CDLogo, loadToken, loadUser, clearToken, saveToken,
});
})();
