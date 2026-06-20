// OláSuper_app_v4.jsx — App principal v4: 3-tier plans + distrito + full flow
(function(){
const { useState, useEffect, useCallback } = React;
const D4 = window.OláSuperDataV4;
const SK = { PLAN:'cd4_plan', USAGE:'cd4_usage', CART:'cd4_cart', DISTRICT:'cd4_district', FOLLOWED:'cd4_followed', HISTORY:'cd4_history', PRICES_CACHE:'cd4_prices_cache', PRICES_TS:'cd4_prices_ts' };

function load() {
  try {
    return {
      plan:          localStorage.getItem(SK.PLAN)     || 'free',
      usage:         parseInt(localStorage.getItem(SK.USAGE)||'0',10),
      cart:          JSON.parse(localStorage.getItem(SK.CART)||'null') || D4.DEMO_CART,
      district:      localStorage.getItem(SK.DISTRICT) || 'lisboa',
      followedStores:JSON.parse(localStorage.getItem(SK.FOLLOWED)||'{}'),
    };
  } catch { return { plan:'free', usage:0, cart:D4.DEMO_CART, district:'lisboa', followedStores:{} }; }
}

// ---- SplashLoading ----
function SplashLoading() {
  return (
    <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#fff', gap:16 }}>
      <div style={{ width:56, height:56, borderRadius:14, background:P.primary, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
          <path d="M6 14h28l-2.5 17H8.5L6 14z" fill="rgba(255,255,255,0.25)" stroke="#fff" strokeWidth="2" strokeLinejoin="round"/>
          <path d="M12 14l4-9 4 9" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M20 14l4-9 4 9" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13 23l4 4 10-8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div style={{ width:32, height:32, border:`3px solid ${P.line}`, borderTopColor:P.primary, borderRadius:'50%', animation:'cdSpin 0.8s linear infinite' }}></div>
      <span style={{ fontSize:13, color:P.ink3 }}>A carregar dados…</span>
    </div>
  );
}

// ---- ErroLigacao ----
function ErroLigacao({ onRetry }) {
  return (
    <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#fff', padding:32, textAlign:'center', gap:14 }}>
      <div style={{ fontSize:44 }}>📡</div>
      <div style={{ fontSize:18, fontWeight:800, color:P.ink, letterSpacing:'-0.02em' }}>Sem ligação</div>
      <div style={{ fontSize:14, color:P.ink3, lineHeight:1.55, maxWidth:260 }}>Não foi possível carregar os dados. Verifica a tua ligação e tenta novamente.</div>
      <button onClick={onRetry} style={{ marginTop:8, height:48, borderRadius:14, border:'none', background:P.primary, color:'#fff', fontSize:15, fontWeight:800, fontFamily:'inherit', cursor:'pointer', padding:'0 32px' }}>
        Tentar novamente
      </button>
    </div>
  );
}

function App() {
  const DEFS = { theme:'verde', demo:'free' };
  const [t, setTweak] = useTweaks(DEFS);

  const ini = load();
  // authPlan: the plan from the logged-in test account (overrides localStorage when demo='free')
  const [authPlan, setAuthPlan] = useState(null);

  function resolve(demo, stored, overridePlan) {
    if (demo==='plus_health') return { plan:'plus_health', usageUsed:3 };
    if (demo==='plus')        return { plan:'plus',        usageUsed:5 };
    if (demo==='used_quota')  return { plan:'free',        usageUsed:1 };
    // default: use logged-in user's plan if available, else stored
    return { plan: overridePlan || stored.plan, usageUsed: stored.usage };
  }
  const res = resolve(t.demo, ini, authPlan);
  const LIMIT = 1;

  const [screen,   setScreen]   = useState('home');
  const [cart,     setCart]     = useState(ini.cart);
  const [result,   setResult]   = useState(null);
  const [dataStatus, setDataStatus] = useState('ok'); // 'ok' | 'loading' | 'error'
  const [plan,     setPlan]     = useState(res.plan);
  const [usage,    setUsage]    = useState(res.usageUsed);
  const [savings,  setSavings]  = useState(null);
  const [district, setDistrict] = useState(ini.district);
  const [paywall,  setPaywall]  = useState(null); // null | 'plus' | 'plus_health'
  const [paywallFrom, setPaywallFrom] = useState('free');
  const [simBudget, setSimBudget] = useState(120);
  const [authUser, setAuthUser] = useState(null);

  function handleLogout() {
    clearToken(); setAuthUser(null);
  }

  const [followedStores, setFollowedStores] = useState(ini.followedStores || {});

  const toggleFollow = useCallback(storeId => {
    setFollowedStores(prev => {
      const next = {...prev};
      if (next[storeId]) delete next[storeId];
      else next[storeId] = { categories: [] };
      try { localStorage.setItem(SK.FOLLOWED, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const updateFollowCategories = useCallback((storeId, cats) => {
    setFollowedStores(prev => {
      const next = {...prev, [storeId]: { ...(prev[storeId]||{}), categories: cats }};
      try { localStorage.setItem(SK.FOLLOWED, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  useEffect(()=>{ const r=resolve(t.demo,ini,authPlan); setPlan(r.plan); setUsage(r.usageUsed); },[t.demo, authPlan]);
  useEffect(()=>{ try{ localStorage.setItem(SK.CART,JSON.stringify(cart)); }catch{} },[cart]);
  useEffect(()=>{ try{ localStorage.setItem(SK.DISTRICT,district); }catch{} },[district]);

  const cartCount = cart.reduce((s,i)=>s+i.qty,0);
  const usageLeft = LIMIT - usage;
  const canAnalyse = (plan==='plus'||plan==='plus_health') || usageLeft > 0;
  const unreadNotif = D4.NOTIFICATIONS.filter(n=>!n.read&&(n.plan==='free'||plan!=='free')).length;

  function openUpgrade(targetPlan) {
    setPaywallFrom(plan);
    setPaywall(targetPlan || (plan==='plus' ? 'plus_health' : 'plus'));
  }

  const addToCart = useCallback(id=>{
    setCart(p=>p.find(i=>i.productId===id)?p:[...p,{productId:id,qty:1}]);
  },[]);

  const changeQty = useCallback((id,d)=>{
    setCart(p=>p.map(i=>i.productId===id?{...i,qty:Math.max(0,i.qty+d)}:i).filter(i=>i.qty>0));
  },[]);

  const runAnalysis = useCallback(()=>{
    if(!cart.length) return;
    if(!canAnalyse){ openUpgrade('plus'); return; }
    setScreen('analyzing');
    setTimeout(()=>{
      const r = D4.compareCartV4(cart, district);
      if(r){ r._cart=cart; r._district=district; }
      setResult(r);
      if(r) setSavings(r.shouldSplit ? r.savings : 0);
      // Save to history
      if(r) {
        try {
          const now = new Date();
          const entry = {
            id: String(Date.now()),
            data: now.toLocaleDateString('pt-PT',{day:'2-digit',month:'short',year:'numeric'}).replace('de ','').replace('. ','  ').trim(),
            hora: now.toLocaleTimeString('pt-PT',{hour:'2-digit',minute:'2-digit'}),
            total_artigos: r.totalItems,
            lojas_comparadas: r.allTotals.length,
            melhor_loja: r.bestSingle.name,
            total: r.singleTotal,
            poupanca: r.shouldSplit ? r.savings : (r.allTotals.length>1 ? r.allTotals[r.allTotals.length-1].total - r.singleTotal : 0),
            produtos: (r._cart||[]).map(ci=>{
              const prod = D4.PRODUCT_BY_ID[ci.productId];
              if (!prod) return null;
              const price = D4.getPrice(prod, r.bestSingle.id);
              return { nome:prod.name, preco:(price||0)*ci.qty, loja:r.bestSingle.name };
            }).filter(Boolean),
          };
          const existing = JSON.parse(localStorage.getItem(SK.HISTORY)||'[]');
          localStorage.setItem(SK.HISTORY, JSON.stringify([entry, ...existing].slice(0,20)));
        } catch {}
      }
      if(plan==='free'){
        const next=usage+1; setUsage(next);
        try{ localStorage.setItem(SK.USAGE,String(next)); }catch{}
      }
      setScreen('analysis');
    }, 6*290+820);
  },[cart,canAnalyse,plan,usage,district]);

  const subscribe = useCallback(targetPlan=>{
    setPlan(targetPlan); setUsage(0); setPaywall(null);
    try{ localStorage.setItem(SK.PLAN,targetPlan); }catch{}
    if((targetPlan==='plus'||targetPlan==='plus_health') && cart.length){
      setTimeout(()=>{
        setScreen('analyzing');
        setTimeout(()=>{
          const r=D4.compareCartV4(cart,district); if(r){r._cart=cart;r._district=district;}
          setResult(r); if(r)setSavings(r.shouldSplit?r.savings:0); setScreen('analysis');
        },6*290+820);
      },300);
    }
  },[cart,district]);

  const cartScreens = ['cart','analyzing','analysis'];
  const activeTab   = cartScreens.includes(screen)?(screen==='analysis'?'analysis':'cart'):screen;

  function renderScreen(onLogout) {
    switch(screen){
      case 'liga':
        return <LigaScreen onBack={()=>setScreen('home')} onAdd={addToCart}
          onNav={setScreen} district={district} onDistrictChange={d=>setDistrict(d)}
          followedStores={followedStores} onToggleFollow={toggleFollow}
          onUpgrade={openUpgrade} plan={plan}/>;
      case 'home':
        return <HomeV4 plan={plan} onNewCart={()=>setScreen('cart')} cartCount={cartCount}
          monthlySaved={savings!=null?savings:4.30} district={district}
          onDistrictChange={d=>setDistrict(d)} onNav={setScreen}
          followedStores={followedStores} onToggleFollow={toggleFollow} onUpgrade={openUpgrade}/>;
      case 'cart':
        return <CartV4 plan={plan} cart={cart} onChangeQty={changeQty} onAdd={addToCart}
          onAnalyse={runAnalysis} usageLeft={usageLeft} district={district}
          followedStores={followedStores} onToggleFollow={toggleFollow} onUpgrade={openUpgrade}/>;
      case 'analyzing':
        return <AnalyzingV4 plan={plan}/>;
      case 'analysis':
        return <AnalysisV4 result={result} plan={plan}
          onBack={()=>setScreen('cart')} onGoCart={()=>setScreen('cart')}
          onHistory={()=>setScreen('history')}
          onUpgrade={()=>openUpgrade('plus')}/>;
      case 'history':
        return <HistoryScreen onBack={()=>setScreen('analysis')}
          onRepeatCart={entry=>{
            // load products from history entry back into cart
            // map product names to IDs where possible
            const newCart = (entry.produtos||[]).map((p,i)=>({ productId:`hist_${entry.id}_${i}`, qty:1, _histName:p.nome, _histPrice:p.preco }));
            if(newCart.length) { setCart(newCart); setScreen('cart'); }
          }}/>;
      case 'scanner':
        return <ScannerErrorBoundary><ScannerV4 plan={plan} onUpgrade={openUpgrade}/></ScannerErrorBoundary>;
      case 'profile':
        return <ProfileV4 plan={plan} usageUsed={usage} usageLimit={LIMIT}
          lastSavings={savings} onUpgrade={openUpgrade}
          followedStores={followedStores} onToggleFollow={toggleFollow}
          onUpdateFollowCategories={updateFollowCategories}
          onLogout={onLogout}/>;
      default: return null;
    }
  }

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", color:P.ink, fontSize:15.5, lineHeight:1.45 }}>
      {dataStatus==='loading' && <SplashLoading/>}
      {dataStatus==='error'   && <ErroLigacao onRetry={()=>setDataStatus('loading')}/>}
      {dataStatus==='ok' && (
      <PPhone>
        <AuthGate onUserChange={u=>{
            setAuthUser(u);
            if(u?.plan) {
              setAuthPlan(u.plan);
              // If not in a demo override mode, apply the login plan immediately
              if(t.demo==='free') setPlan(u.plan);
            }
          }}>
          {({ user, onLogout }) => (<>
            <div style={{ position:'absolute', inset:0, bottom:62, background:P.bg, overflowY:'auto', overflowX:'hidden' }}>
              {renderScreen(onLogout)}
            </div>

            {paywall&&(
              <PaywallV4
                fromPlan={paywallFrom} targetPlan={paywall}
                lastSavings={savings} simBudget={simBudget}
                onSubscribe={subscribe}
                onClose={()=>setPaywall(null)}
              />
            )}

            {screen!=='analyzing'&&(
              <PTabBar
                current={activeTab}
                onChange={s=>{
                  if(s==='analysis'&&!result){ setScreen('cart'); return; }
                  setScreen(s);
                }}
                cartCount={cartCount} notifCount={unreadNotif}
              />
            )}
          </>)}
        </AuthGate>
      </PPhone>
      )}
      <TweaksPanel>
        <TweakSection label="Cenário"/>
        <TweakSelect label="Plano"
          value={t.demo}
          options={[
            {value:'free',       label:'Grátis · análise disponível'},
            {value:'used_quota', label:'Grátis · quota usada'},
            {value:'plus',       label:'OláSuper Plus'},
            {value:'plus_health',label:'OláSuper Saúde'},
          ]}
          onChange={v=>setTweak('demo',v)}/>
      </TweaksPanel>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<I18nProvider><App/></I18nProvider>);
})();
