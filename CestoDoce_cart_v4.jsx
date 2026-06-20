// OláSuper_cart_v4.jsx — Cart (folhetos + lista) + Analyzing
(function(){
const { useState, useMemo, useEffect } = React;
const D4 = window.OláSuperDataV4;

const FREE_LIMIT = 20;
const FREE_PRODS = D4.PRODUCTS.slice(0, FREE_LIMIT);

function CartV4_inner({ t=k=>k,  plan, cart, onChangeQty, onAdd, onAnalyse, usageLeft, district, followedStores, onToggleFollow, onUpgrade }) {
  const [query, setQuery]   = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [tab, setTab]       = useState('folhetos'); // folhetos | carrinho
  const [selCat, setSelCat] = useState('frescos');

  // Debounce 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const planProds = (plan==='plus'||plan==='plus_health') ? D4.PRODUCTS : FREE_PRODS;
  const lockedCount = D4.PRODUCTS.length - FREE_PRODS.length;

  const results = useMemo(() => {
    if (!debouncedQ.trim()) return [];
    const q = debouncedQ.trim().toLowerCase();
    return planProds.filter(p => p.name.toLowerCase().includes(q)).slice(0, 7);
  }, [debouncedQ, planProds]);

  const cartProducts = cart.map(it => ({ ...it, product: D4.PRODUCT_BY_ID[it.productId] })).filter(x => x.product);
  const inCart = id => cart.find(i => i.productId===id);

  const bestTotal = useMemo(() => {
    if (!cart.length) return 0;
    const r = D4.compareCartV4(cart, district); return r ? r.splitTotal : 0;
  }, [cart, district]);

  const flyersForCat = D4.FLYERS.filter(f => f.category===selCat);
  const highlights   = D4.FLYERS.filter(f => f.highlight);
  const flashFlyers  = D4.FLYERS.filter(f => f.relampago);

  function storeName(id) {
    const s = D4.STORE_BY_ID[id]; return s ? s.name : id;
  }

  const canAnalyse = (plan==='plus'||plan==='plus_health') || usageLeft > 0;

  return (
    <div data-screen-label="Carrinho — folhetos e pesquisa" style={{ paddingTop:54, height:'100%', display:'flex', flexDirection:'column' }}>
      {/* header */}
      <div style={{ padding:'10px 20px 0', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
          <h1 style={{ flex:1, margin:0, fontSize:20, fontWeight:800, color:P.ink, letterSpacing:'-0.025em' }}>Carrinho</h1>
          {cart.length>0&&<span style={{ fontSize:12.5, fontWeight:700, color:P.ink3 }}>{cartProducts.reduce((s,i)=>s+i.qty,0)} art. · {euro(bestTotal)}</span>}
        </div>

        {/* flash relâmpago strip */}
        {flashFlyers.length>0&&(
          <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:6, scrollbarWidth:'none', marginBottom:8 }}>
            {flashFlyers.map(f=>(
              <div key={f.id} style={{ flexShrink:0, display:'flex', alignItems:'center', gap:7, background:P.flashBg, border:`1px solid ${P.flash}30`, borderRadius:10, padding:'6px 10px' }}>
                <FlashIco size={13} color={P.flash}/>
                <span style={{ fontSize:12, fontWeight:700, color:P.flash, whiteSpace:'nowrap' }}>{f.product} · {euro(f.promoPrice)}</span>
              </div>
            ))}
          </div>
        )}

        {/* search hint */}
        <p style={{ margin:'0 0 10px', fontSize:13, color:P.ink2, lineHeight:1.5, fontStyle:'italic' }}>
          Procura os teus produtos favoritos, adiciona ao carrinho e fica a par das próximas promoções — recebendo notificações quando o preço baixar.
        </p>

        {/* search */}
        <div style={{ position:'relative', zIndex:40, marginBottom:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, background:P.surface, border:`1.5px solid ${query?P.primary:P.line}`, borderRadius:12, padding:'0 14px', transition:'border-color 0.15s' }}>
            <SearchIco size={17} color={P.ink3}/>
            <input value={query} onChange={e=>setQuery(e.target.value)}
              placeholder={plan==='free'?(t('pesquisarFree')||`Pesquisar (${FREE_LIMIT} produtos disponíveis)…`):(t('pesquisarProduto')||'Pesquisar produto…')}
              style={{ flex:1, border:'none', outline:'none', background:'transparent', fontSize:14.5, fontFamily:'inherit', color:P.ink, height:44 }}/>
            {query&&<button onClick={()=>setQuery('')} style={{ border:'none', background:'none', cursor:'pointer', color:P.ink3, fontSize:13, fontFamily:'inherit' }}>✕</button>}
          </div>
          {results.length>0&&(
            <div style={{ position:'absolute', left:0, right:0, top:46, background:P.surface, borderRadius:14, boxShadow:P.shadowLift, overflow:'hidden', border:`1px solid ${P.lineSoft}`, zIndex:50 }}>
              {results.map(p=>{
                const cheapest = D4.STORES.reduce((b,s)=>{ const pa=D4.getPrice(p,s.id), pb=D4.getPrice(p,b.id); return pa!=null&&(pb==null||pa<pb)?s:b; }, D4.STORES[0]);
                const added = inCart(p.id);
                return (
                  <button key={p.id} onClick={()=>{onAdd(p.id);setQuery('');}}
                    style={{ display:'flex', alignItems:'center', gap:12, width:'100%', padding:'10px 14px', border:'none', background:'none', cursor:'pointer', borderBottom:`1px solid ${P.lineSoft}`, fontFamily:'inherit', textAlign:'left' }}>
                    <span style={{ fontSize:18 }}>{p.glyph}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:14, fontWeight:600, color:P.ink }}>{p.name}</div>
                      <div style={{ fontSize:11.5, color:P.ink3 }}>
                        desde {euro(D4.getPrice(p,cheapest.id)||0)} · {cheapest.name}
                        {p.prices[cheapest.id]?.promo!=null&&<span style={{ color:P.promo, fontWeight:700 }}> · promo</span>}
                      </div>
                    </div>
                    <span style={{ width:28, height:28, borderRadius:100, flexShrink:0, background:added?P.primarySoft:P.primary, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {added?<CheckIco size={14} color={P.primary}/>:<PlusIco size={14} color="#fff"/>}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* plan banner */}
        {plan==='free'&&(
          <div style={{ padding:'8px 12px', background:P.plusBg, borderRadius:10, fontSize:12.5, color:P.plus, fontWeight:600, marginBottom:8, display:'flex', alignItems:'center', gap:8 }}>
            <CrownIco size={14} color={P.plus}/>
            <span>Plano Grátis: {FREE_LIMIT}/{D4.PRODUCTS.length} produtos. <strong>{lockedCount} bloqueados no Plus.</strong></span>
          </div>
        )}

        {/* tabs */}
        <div style={{ display:'flex', gap:4, background:P.surface2, padding:3, borderRadius:10, marginBottom:10 }}>
          {[{id:'folhetos',label:`📋 ${t('folhetos')||'Folhetos'}`},{id:'carrinho',label:`🧺 ${t('carrinho')||'Carrinho'}${cart.length?` (${cart.length})`:''}`}].map(tab=>(
            <button key={tab.id} onClick={()=>setTab(tab.id)} style={{ flex:1, height:32, border:'none', borderRadius:8, fontFamily:'inherit', fontSize:12.5, fontWeight:700, cursor:'pointer', background:tab===tab.id?P.surface:'transparent', color:tab===tab.id?P.ink:P.ink2, boxShadow:tab===tab.id?P.shadow:'none', transition:'all 0.15s' }}>{tab.label}</button>
          ))}
        </div>
      </div>

      {/* content */}
      <div style={{ flex:1, overflowY:'auto', padding:'0 20px 10px' }}>
        {tab==='folhetos'&&(
          <div>
            {/* highlights carousel */}
            <p style={{ fontSize:11, fontWeight:700, color:P.ink3, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>⚡ Destaques da semana</p>
            <div style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:8, scrollbarWidth:'none', marginBottom:14 }}>
              {highlights.map(f=>(
                <div key={f.id} style={{ flexShrink:0, width:144, background:P.surface, border:`1px solid ${P.line}`, borderRadius:14, padding:'12px 13px', cursor:'pointer' }}
                  onClick={()=>{ const mp=D4.PRODUCTS.find(x=>x.name.toLowerCase().includes(f.product.split(' ')[0].toLowerCase())); if(mp)onAdd(mp.id); }}>
                  <div style={{ fontSize:24, marginBottom:6 }}>{f.glyph}</div>
                  <div style={{ fontSize:13, fontWeight:800, color:P.ink, lineHeight:1.2, marginBottom:3 }}>{f.product}</div>
                  <div style={{ fontSize:11, color:P.ink3, marginBottom:8 }}>{f.detail} · {storeName(f.store)}</div>
                  <div style={{ display:'flex', alignItems:'baseline', gap:6 }}>
                    <span style={{ fontSize:16, fontWeight:800, color:P.savings }}>{euro(f.promoPrice)}</span>
                    <span style={{ fontSize:11, color:P.ink3, textDecoration:'line-through' }}>{euro(f.normalPrice)}</span>
                  </div>
                  <PPill color={P.promo} bg={P.promoBg} style={{marginTop:6,fontSize:10}}>−{f.savingPct}% · {f.validUntil}</PPill>
                </div>
              ))}
            </div>

            {/* category filter */}
            <p style={{ fontSize:11, fontWeight:700, color:P.ink3, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Por Categoria</p>
            <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:8, scrollbarWidth:'none', marginBottom:10 }}>
              {D4.CATEGORIES.map(c=>(
                <button key={c.id} onClick={()=>setSelCat(c.id)} style={{ flexShrink:0, height:30, padding:'0 12px', border:`1px solid ${selCat===c.id?P.primary:P.line}`, borderRadius:100, background:selCat===c.id?P.primarySoft:'transparent', color:selCat===c.id?P.primaryText:P.ink2, fontSize:12, fontWeight:700, fontFamily:'inherit', cursor:'pointer', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:4 }}>
                  {c.glyph} {c.name}
                </button>
              ))}
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
              {flyersForCat.length===0
                ? <div style={{ textAlign:'center', padding:'28px 0', color:P.ink3, fontSize:13.5 }}>Sem destaques nesta categoria.</div>
                : flyersForCat.map(f=>{
                  const mp = D4.PRODUCTS.find(p=>p.name.toLowerCase().includes(f.product.split(' ')[0].toLowerCase()));
                  const added = mp&&inCart(mp.id);
                  return (
                    <PCard key={f.id} style={{ padding:'13px 15px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ fontSize:26, width:40, textAlign:'center', flexShrink:0 }}>{f.glyph}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:7, flexWrap:'wrap', marginBottom:2 }}>
                            <span style={{ fontSize:14, fontWeight:800, color:P.ink }}>{f.product}</span>
                            {f.relampago&&<PPill color={P.flash} bg={P.flashBg} style={{fontSize:10}}><FlashIco size={9} color={P.flash}/> relâmpago</PPill>}
                          </div>
                          <div style={{ fontSize:12, color:P.ink3 }}>{f.detail} · até {f.validUntil}</div>
                          <div style={{ marginTop:5, display:'flex', alignItems:'center', gap:7 }}>
                            <StoreBadge id={f.store} size={20}/>
                            <span style={{ fontSize:12, color:P.ink3 }}>{storeName(f.store)}</span>
                          </div>
                        </div>
                        <div style={{ textAlign:'right', flexShrink:0 }}>
                          <div style={{ fontSize:17, fontWeight:800, color:P.savings, fontVariantNumeric:'tabular-nums' }}>{euro(f.promoPrice)}</div>
                          <div style={{ fontSize:11.5, color:P.ink3, textDecoration:'line-through' }}>{euro(f.normalPrice)}</div>
                          <PPill color={P.promo} bg={P.promoBg} style={{marginTop:4,fontSize:10}}>−{f.savingPct}%</PPill>
                        </div>
                      </div>
                      {mp&&(
                        <button onClick={()=>onAdd(mp.id)} style={{ marginTop:9, width:'100%', height:33, border:`1px solid ${added?P.primary:P.line}`, borderRadius:9, background:added?P.primarySoft:'transparent', color:added?P.primaryText:P.ink2, fontSize:12.5, fontWeight:700, fontFamily:'inherit', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                          {added?<><CheckIco size={13} color={P.primary}/> Adicionado</>:<><PlusIco size={13} color={P.ink2}/> Adicionar</>}
                        </button>
                      )}
                      <div style={{ marginTop:7, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <span style={{ fontSize:11, color:P.ink3 }}>Seguir para notificações:</span>
                        <FollowButton storeId={f.store} followedStores={followedStores||{}} plan={plan} onToggle={onToggleFollow} onUpgrade={()=>onUpgrade&&onUpgrade('plus')} size="sm"/>
                      </div>
                    </PCard>
                  );
                })
              }
            </div>
          </div>
        )}

        {tab==='carrinho'&&(
          <div>
            {cartProducts.length===0
              ? <div style={{ textAlign:'center', padding:'48px 0', color:P.ink3 }}>
                  <BasketIco size={40} color={P.lineSoft}/>
                  <p style={{ fontSize:14, lineHeight:1.55, margin:'14px 0 0' }}>Carrinho vazio.<br/>Pesquisa ou escolhe dos folhetos.</p>
                </div>
              : <PCard style={{ padding:'4px 16px' }}>
                  {cartProducts.map((it,idx)=>{
                    const cheapest = D4.STORES.reduce((b,s)=>{ const pa=D4.getPrice(it.product,s.id), pb=D4.getPrice(it.product,b.id); return pa!=null&&(pb==null||pa<pb)?s:b; }, D4.STORES[0]);
                    const isPromo = it.product.prices[cheapest.id]?.promo!=null;
                    return (
                      <div key={it.productId} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:idx<cartProducts.length-1?`1px solid ${P.lineSoft}`:'none' }}>
                        <span style={{ fontSize:20 }}>{it.product.glyph}</span>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:14, fontWeight:600, color:P.ink, display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                            {it.product.name}
                            {isPromo&&<PPill color={P.promo} bg={P.promoBg} style={{fontSize:10}}>promo</PPill>}
                          </div>
                          <div style={{ fontSize:12, color:P.ink3, marginTop:2 }}>melhor: {euro(D4.getPrice(it.product,cheapest.id)||0)} · {cheapest.name}</div>
                        </div>
                        <PStepper qty={it.qty} onChange={d=>onChangeQty(it.productId,d)} color={P.primary}/>
                      </div>
                    );
                  })}
                </PCard>
            }
          </div>
        )}
        <div style={{ height:8 }}/>
      </div>

      {/* sticky CTA */}
      {cartProducts.length>0&&(
        <div style={{ flexShrink:0, padding:'10px 20px 12px', background:P.surface, borderTop:`1px solid ${P.lineSoft}` }}>
          <PBtn onClick={onAnalyse} color={P.primary}>
            <SparkIco size={17} color="#fff"/> Analisar carrinho
          </PBtn>
          <p style={{ textAlign:'center', fontSize:11.5, color:P.ink3, margin:'6px 0 0' }}>
            {(plan==='plus'||plan==='plus_health')
              ? 'Análises ilimitadas · Plus'
              : usageLeft>0
                ? `${usageLeft} análise gratuita este mês`
                : 'Limite atingido · upgrade para continuar'}
          </p>
        </div>
      )}
    </div>
  );
}

// ============ ANALYZING ============
function AnalyzingV4({ plan }) {
  const [step, setStep] = React.useState(0);
  const total = (plan==='plus'||plan==='plus_health') ? D4.PRODUCTS.length : FREE_LIMIT;
  React.useEffect(()=>{
    const ts = D4.STORES.slice(0,6).map((_,i)=>setTimeout(()=>setStep(i+1),400+i*280));
    return()=>ts.forEach(clearTimeout);
  },[]);
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', padding:'20px 28px 80px', background:P.bg }}>
      <div style={{ position:'relative', width:78, height:78, marginBottom:22 }}>
        <svg viewBox="0 0 80 80" width="80" height="80" style={{ position:'absolute', inset:0 }}>
          <circle cx="40" cy="40" r="36" fill="none" stroke={P.lineSoft} strokeWidth="5"/>
          <circle cx="40" cy="40" r="36" fill="none" stroke={P.primary} strokeWidth="5"
            strokeDasharray="226" strokeDashoffset={226*(1-step/6)} strokeLinecap="round"
            style={{ transition:'stroke-dashoffset 0.35s ease', transform:'rotate(-90deg)', transformOrigin:'center' }}/>
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🔍</div>
      </div>
      <h2 style={{ fontSize:19, fontWeight:800, color:P.ink, letterSpacing:'-0.02em', textAlign:'center', margin:'0 0 5px' }}>A comparar preços…</h2>
      <p style={{ fontSize:13, color:P.ink3, margin:'0 0 22px', textAlign:'center' }}>{total} produtos · {D4.STORES.filter(s=>s.tipo==='supermercado').length} lojas</p>
      <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:8 }}>
        {D4.STORES.slice(0,6).map((sm,i)=>(
          <div key={sm.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 14px', borderRadius:12, background:i<step?P.primarySoft:P.surface, border:`1px solid ${i<step?P.primary+'50':P.line}`, transition:'all 0.3s' }}>
            <StoreBadge id={sm.id} size={28}/>
            <span style={{ flex:1, fontSize:13.5, fontWeight:i<step?700:500, color:i<step?P.ink:P.ink2 }}>{sm.name}</span>
            <span style={{ fontSize:13, color:i<step?P.savings:P.ink3 }}>{i<step?'✓':''}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CartV4(props) {
  const { t } = useI18n();
  return <CartV4_inner {...props} t={t}/>;
}

Object.assign(window, { CartV4, AnalyzingV4, FREE_LIMIT, FREE_PRODS });
})();
