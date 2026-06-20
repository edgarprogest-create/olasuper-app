// OláSuper_ui_v4.jsx — Light premium tokens + components (branco, limpo, premium)
const { useState: useV4S, useEffect: useV4E, useRef: useV4R, useMemo: useV4M, useLayoutEffect: useV4L } = React;

// ---- Light premium tokens — paleta OláSuper (vermelho + azul) ----
const P = {
  // backgrounds — branco puro, sem tom verde
  bg:       '#FAFAFA',
  surface:  '#FFFFFF',
  surface2: '#F6F6F6',
  surface3: '#EEEEEE',

  // text — preto neutro
  ink:    '#1A1A1A',
  ink2:   '#4A4A4A',
  ink3:   '#6B6B6B',

  // borders — cinzento neutro
  line:     '#E5E5E5',
  lineSoft: '#F0F0F0',

  // primary GREEN — acções, botões, navegação activa
  primary:     '#6AAB10',
  primaryDark: '#558C00',
  primarySoft: '#F2F9E8',
  primaryText: '#6AB221',

  // savings GREEN — poupança, descida de preço
  savings:   '#00C853',
  savingsBg: '#E8FFF0',

  // plus purple (mantém)
  plus:     'oklch(42% 0.14 300)',
  plusBg:   'oklch(96% 0.025 300)',

  // health violet (mantém)
  health:   'oklch(40% 0.16 280)',
  healthBg: 'oklch(96% 0.025 280)',

  // states
  red:    '#E8271A',
  redBg:  '#FEF2F1',
  amber:  'oklch(56% 0.15 75)',
  amberBg:'oklch(96.5% 0.03 75)',
  promo:  '#F07B11',
  promoBg:'#FFF4E8',

  // notif relâmpago
  flash:   'oklch(50% 0.17 55)',
  flashBg: 'oklch(96% 0.03 65)',

  shadow:     '0 1px 4px rgba(0,0,0,0.05), 0 4px 18px rgba(0,0,0,0.05)',
  shadowLift: '0 4px 14px rgba(0,0,0,0.08), 0 14px 36px rgba(0,0,0,0.10)',
};

// Plan accent lookup
function planColor(plan) {
  if (plan==='plus_health') return { primary:P.health, bg:P.healthBg };
  if (plan==='plus')        return { primary:P.plus, bg:P.plusBg };
  return { primary:P.primary, bg:P.primarySoft };
}

// Store colors
const STORE_HUE = { continente:20, pingodoce:145, lidl:225, aldi:200, mercadona:160, intermarche:10 };
function storeColor(id) {
  const h = STORE_HUE[id] || 150;
  return { bg:`oklch(95% 0.03 ${h})`, text:`oklch(38% 0.13 ${h})` };
}

// ---- Icons ----
function PIco({ size=22, color='currentColor', children }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">{children}</svg>;
}
function HomeIco(p)     { return <PIco {...p}><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/></PIco>; }
function BasketIco(p)   { return <PIco {...p}><path d="M4 9h16l-1.5 11h-13z"/><path d="M8 9l4-6 4 6"/></PIco>; }
function ScanIco(p)     { return <PIco {...p}><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/></PIco>; }
function PersonIco(p)   { return <PIco {...p}><circle cx="12" cy="7.5" r="3.5"/><path d="M4.5 20.5c0-4 3.4-6.5 7.5-6.5s7.5 2.5 7.5 6.5"/></PIco>; }
function SearchIco(p)   { return <PIco {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8"/></PIco>; }
function PlusIco(p)     { return <PIco {...p}><path d="M12 5v14M5 12h14"/></PIco>; }
function MinusIco(p)    { return <PIco {...p}><path d="M5 12h14"/></PIco>; }
function CheckIco(p)    { return <PIco {...p}><path d="m4.5 12.5 5 5L19.5 7"/></PIco>; }
function BackIco(p)     { return <PIco {...p}><path d="M19 12H5"/><path d="m11 6-6 6 6 6"/></PIco>; }
function SparkIco(p)    { return <PIco {...p}><path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z"/></PIco>; }
function CrownIco(p)    { return <PIco {...p}><path d="M4 18h16l1-10-5 3.5L12 5 8 11.5 3 8z"/></PIco>; }
function WalletIco(p)   { return <PIco {...p}><rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10h18"/></PIco>; }
function TrendUpIco(p)  { return <PIco {...p}><path d="m4 16 6-6 3 3 7-7"/><path d="M20 11V6h-5"/></PIco>; }
function TrendDnIco(p)  { return <PIco {...p}><path d="m4 8 6 6 3-3 7 7"/><path d="M20 13v5h-5"/></PIco>; }
function TagIco(p)      { return <PIco {...p}><path d="M3 11V4a1 1 0 0 1 1-1h7l10 10-8 8z"/><circle cx="8" cy="8" r="1.4"/></PIco>; }
function BellIco(p)     { return <PIco {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></PIco>; }
function FlashIco(p)    { return <PIco {...p}><path d="M13 2 3 14h9l-1 8 10-12h-9z"/></PIco>; }
function MapPinIco(p)   { return <PIco {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></PIco>; }
function HeartIco(p)    { return <PIco {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></PIco>; }
function CameraIco(p)   { return <PIco {...p}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></PIco>; }
function AlertIco(p)    { return <PIco {...p}><path d="M10.3 3.3 2 20h20L13.7 3.3a2 2 0 0 0-3.4 0z"/><path d="M12 9v5"/><circle cx="12" cy="17" r=".8" fill="currentColor"/></PIco>; }

// ---- StoreBadge with image-slot support ----
function StoreBadge({ id, size=38 }) {
  const c = storeColor(id);
  const D4 = window.OláSuperDataV4;
  const store = D4 ? D4.STORE_BY_ID[id] : null;
  const letter = store ? store.short[0] : (id||'?')[0].toUpperCase();
  const r = Math.round(size * 0.28);
  // Check if slot already has a saved image
  const slotKey = `image-slot:store-logo-${id}`;
  const hasSaved = (() => { try { return !!localStorage.getItem(slotKey); } catch { return false; } })();
  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      {/* fallback letter — always behind, visible when no logo uploaded */}
      <div style={{ position:'absolute', inset:0, borderRadius:`${r}px`, background:c.bg, color:c.text, display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*.38, fontWeight:800, letterSpacing:'-0.01em', zIndex:0 }}>{letter}</div>
      {/* image-slot: data-editable makes it clickable+droppable */}
      <image-slot
        id={`store-logo-${id}`}
        shape="rounded"
        radius={`${r}`}
        fit="contain"
        placeholder={hasSaved ? '' : '＋'}
        style={{ position:'absolute', inset:0, width:`${size}px`, height:`${size}px`, zIndex:1, '--is-bg':'transparent', '--is-ph-bg':'transparent', '--is-ph-color':c.text, '--is-ph-size':`${Math.round(size*0.38)}px` }}
      ></image-slot>
    </div>
  );
}

// ---- Sparkline ----
function P4Spark({ values, color, width=72, height=28 }) {
  if (!values || values.length < 2) return null;
  const min=Math.min(...values), max=Math.max(...values), rng=max-min||1;
  const pad=2, h=height-pad*2;
  const pts=values.map((v,i)=>[(i/(values.length-1))*width, pad+h-((v-min)/rng)*h]);
  const line=pts.map((p,i)=>{ if(i===0)return `M${p[0].toFixed(2)},${p[1].toFixed(2)}`; const pr=pts[i-1],mx=(pr[0]+p[0])/2; return `C${mx.toFixed(2)},${pr[1].toFixed(2)} ${mx.toFixed(2)},${p[1].toFixed(2)} ${p[0].toFixed(2)},${p[1].toFixed(2)}`; }).join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{flexShrink:0}} aria-hidden="true">
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ---- Primitives ----
function euro(n) { return Number(n).toFixed(2).replace('.', ',') + '\u00a0€'; }

function PCard({ children, style={}, onClick }) {
  return <div onClick={onClick} style={{ background:P.surface, borderRadius:18, padding:16, boxShadow:P.shadow, border:`1px solid ${P.lineSoft}`, cursor:onClick?'pointer':'default', ...style }}>{children}</div>;
}

function PPill({ children, color, bg, style={} }) {
  return <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 9px', borderRadius:100, background:bg, color, fontSize:11, fontWeight:700, letterSpacing:'0.02em', whiteSpace:'nowrap', ...style }}>{children}</span>;
}

function PBtn({ children, onClick, color, disabled, style={} }) {
  const bg = disabled ? P.surface3 : (color || P.primary);
  const textCol = disabled ? P.ink3 : '#fff';
  return (
    <button onClick={onClick} disabled={disabled} style={{ width:'100%', minHeight:52, border:'none', borderRadius:14, background:bg, color:textCol, fontSize:15.5, fontWeight:800, fontFamily:'inherit', cursor:disabled?'default':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, whiteSpace:'nowrap', boxShadow:disabled?'none':`0 4px 16px ${bg}44`, transition:'transform 0.1s', ...style }}
      onMouseDown={e=>{ if(!disabled)e.currentTarget.style.transform='scale(0.985)'; }}
      onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}
      onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
    >{children}</button>
  );
}

function PGhost({ children, onClick, style={} }) {
  return <button onClick={onClick} style={{ width:'100%', minHeight:48, borderRadius:14, border:`1.5px solid ${P.line}`, background:'transparent', color:P.ink, fontSize:15, fontWeight:600, fontFamily:'inherit', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, whiteSpace:'nowrap', ...style }}>{children}</button>;
}

function PStepper({ qty, onChange, color }) {
  const col = color || P.primary;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:0, background:P.surface2, borderRadius:100, border:`1px solid ${P.line}` }}>
      <button onClick={()=>onChange(-1)} style={{ width:34,height:34,border:'none',background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:P.ink2,borderRadius:100 }}><MinusIco size={15}/></button>
      <span style={{ minWidth:22,textAlign:'center',fontSize:14,fontWeight:800,color:P.ink,fontVariantNumeric:'tabular-nums' }}>{qty}</span>
      <button onClick={()=>onChange(1)} style={{ width:34,height:34,border:'none',background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:col,borderRadius:100 }}><PlusIco size={15}/></button>
    </div>
  );
}

function PTabBar({ current, onChange, cartCount, notifCount }) {
  const tabs = [
    { id:'home',    Icon:HomeIco,    label:'Início' },
    { id:'cart',    Icon:BasketIco,  label:'Carrinho', badge:cartCount },
    { id:'scanner', Icon:ScanIco,    label:'Scanner'  },
    { id:'profile', Icon:PersonIco,  label:'Perfil', badge:notifCount },
  ];
  return (
    <nav style={{ position:'absolute', bottom:0, left:0, right:0, background:'rgba(255,255,255,0.94)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', borderTop:`1px solid ${P.lineSoft}`, display:'flex', zIndex:60, paddingBottom:'max(env(safe-area-inset-bottom),6px)', paddingTop:6 }}>
      {tabs.map(({ id, Icon, label, badge }) => {
        const active = current===id || (id==='cart'&&current==='analyzing');
        return (
          <button key={id} onClick={()=>onChange(id)} style={{ flex:1, minHeight:50, border:'none', background:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3, color:active?P.primary:P.ink3, position:'relative', fontFamily:'inherit' }}>
            <span style={{ position:'relative', display:'inline-flex' }}>
              <Icon size={22} color={active?P.primary:P.ink3}/>
              {badge>0&&<span style={{ position:'absolute', top:-4, right:-7, minWidth:15, height:15, borderRadius:100, background:P.primary, color:'#fff', fontSize:9, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 3px' }}>{badge}</span>}
            </span>
            <span style={{ fontSize:10.5, fontWeight:active?700:500, letterSpacing:'0.01em' }}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function PHeader({ title, subtitle, onBack, right }) {
  return (
    <header style={{ display:'flex', alignItems:'center', gap:12, padding:'16px 20px 8px' }}>
      {onBack&&<button onClick={onBack} style={{ width:36,height:36,borderRadius:10,border:`1px solid ${P.line}`,background:P.surface,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:P.ink2,flexShrink:0 }}><BackIco size={17}/></button>}
      <div style={{ flex:1, minWidth:0 }}>
        <h1 style={{ margin:0, fontSize:21, fontWeight:800, color:P.ink, letterSpacing:'-0.025em', lineHeight:1.1 }}>{title}</h1>
        {subtitle&&<p style={{ margin:'2px 0 0', fontSize:12.5, color:P.ink3 }}>{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}

// ---- Phone frame (light) ----
function PPhone({ children }) {
  const [scale, setScale] = useV4S(1);
  useV4L(() => {
    const fit = () => {
      const sx=(window.innerWidth-28)/390, sy=(window.innerHeight-28)/844;
      setScale(Math.min(1.05, Math.max(0.36, Math.min(sx,sy))));
    };
    fit(); window.addEventListener('resize', fit); return ()=>window.removeEventListener('resize', fit);
  }, []);
  return (
    <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:`radial-gradient(900px at 20% -5%, #F0F4FF, transparent 55%), radial-gradient(700px at 110% 110%, #F2F9E8, transparent 52%), #EBEBEB` }}>
      <div style={{ transformOrigin:'center', transform:`scale(${scale})` }}>
        <div style={{ width:390, height:844, background:'#1a1a1a', borderRadius:54, padding:10, boxShadow:'0 50px 90px -25px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.1) inset' }}>
          <div style={{ position:'relative', width:'100%', height:'100%', background:P.bg, borderRadius:44, overflow:'hidden' }}>
            <div style={{ position:'absolute', top:12, left:'50%', transform:'translateX(-50%)', width:108, height:28, background:'#1a1a1a', borderRadius:16, zIndex:50, pointerEvents:'none' }}/>
            <PStatus/>
            {children}
            <div style={{ position:'absolute', bottom:8, left:'50%', transform:'translateX(-50%)', width:130, height:5, borderRadius:3, background:P.ink, opacity:0.16, zIndex:50, pointerEvents:'none' }}/>
          </div>
        </div>
      </div>
    </div>
  );
}

function PStatus() { return null; }

Object.assign(window, {
  P, planColor, storeColor,
  HomeIco, BasketIco, ScanIco, PersonIco, SearchIco, PlusIco, MinusIco,
  CheckIco, BackIco, SparkIco, CrownIco, WalletIco, TrendUpIco, TrendDnIco,
  TagIco, BellIco, FlashIco, MapPinIco, HeartIco, CameraIco, AlertIco,
  StoreBadge, P4Spark, euro, PCard, PPill, PBtn, PGhost, PStepper,
  PTabBar, PHeader, PPhone, PStatus,
});
