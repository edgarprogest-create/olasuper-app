// OláSuper_analysis_v4.jsx — Analysis + Scanner + Profile + 3-tier Paywall
(function(){
const { useState, useEffect, useMemo, useRef } = React;
const D4 = window.OláSuperDataV4;

// ---- AnalysisProductsList: produtos expansíveis ----
function AnalysisProductsList({ cartItems, split, splitGroups }) {
  const [open, setOpen] = useV4S(false);
  const items = split
    ? splitGroups.flatMap(g => (g.items||[]).map(it => ({ name:it.product?.name||it.productId, qty:it.qty, price:it.unitPrice*it.qty, store:g.supermarket.name, isPromo:it.isPromo })))
    : cartItems;
  if (!items || items.length === 0) return null;
  return (
    <div style={{ marginBottom:12 }}>
      <button onClick={()=>setOpen(v=>!v)} style={{ width:'100%', background:P.surface2, border:`1px solid ${P.line}`, borderRadius:12, padding:'11px 14px', display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontFamily:'inherit', fontSize:13.5, fontWeight:700, color:P.ink }}>
        <span style={{ flex:1, textAlign:'left' }}>{open?'▼':'►'} {open?'Ocultar':'Ver'} {items.length} produto{items.length!==1?'s':''} incluídos</span>
        <span style={{ fontSize:12, color:P.ink3 }}>{open?'fechar':'↓'}</span>
      </button>
      {open && (
        <div style={{ background:P.surface2, borderRadius:'0 0 12px 12px', border:`1px solid ${P.line}`, borderTop:'none', padding:'4px 0 8px' }}>
          {items.map((it,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 14px', borderBottom:i<items.length-1?`1px solid ${P.lineSoft}`:'none', fontSize:13 }}>
              <span style={{ flex:1, color:P.ink }}>{it.name}{it.qty>1?` ×${it.qty}`:''}{it.isPromo&&<span style={{ marginLeft:6, fontSize:10, background:P.promoBg, color:P.promo, borderRadius:4, padding:'1px 5px', fontWeight:700 }}>promo</span>}</span>
              {split && <span style={{ fontSize:11, color:P.ink3, flexShrink:0 }}>{it.store}</span>}
              <span style={{ color:P.ink2, fontWeight:600, fontVariantNumeric:'tabular-nums', flexShrink:0 }}>{euro(it.price)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Tab 0: Máxima poupança ----
function TabOptimal({ r }) {
  const [open, setOpen] = useV4S({});
  const toggleStore = id => setOpen(prev => ({ ...prev, [id]: !prev[id] }));
  if (!r.optimalGroups || r.optimalGroups.length === 0) return (
    <div style={{ textAlign:'center', padding:'28px 16px', color:P.ink3, fontSize:13.5 }}>Sem dados suficientes para calcular.</div>
  );
  return (
    <div>
      {r.optimalGroups.map((g,gi) => (
        <div key={g.supermarket.id} style={{ marginBottom:8 }}>
          <button onClick={()=>toggleStore(g.supermarket.id)}
            style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'11px 12px', borderRadius:12, border:`1px solid ${P.line}`, background:P.surface2, cursor:'pointer', fontFamily:'inherit' }}>
            <StoreBadge id={g.supermarket.id} size={24}/>
            <span style={{ flex:1, fontSize:13.5, fontWeight:700, color:P.ink, textAlign:'left' }}>{g.supermarket.name}</span>
            <span style={{ fontSize:12, color:P.ink3 }}>{g.items.reduce((s,i)=>s+i.qty,0)} artigos</span>
            <span style={{ fontSize:13.5, fontWeight:800, color:P.ink, fontVariantNumeric:'tabular-nums', marginLeft:4 }}>{euro(g.subtotal)}</span>
            <span style={{ fontSize:12, color:P.ink3, marginLeft:2 }}>{open[g.supermarket.id]?'▲':'▼'}</span>
          </button>
          {open[g.supermarket.id] && (
            <div style={{ border:`1px solid ${P.line}`, borderTop:'none', borderRadius:'0 0 12px 12px', padding:'6px 12px 10px', background:'#fff' }}>
              {g.items.map((it,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 0', borderBottom:i<g.items.length-1?`1px solid ${P.lineSoft}`:'none', fontSize:13 }}>
                  <span style={{ flex:1, color:P.ink }}>{it.product?.name||it.productId}{it.qty>1?` ×${it.qty}`:''}{it.isPromo&&<span style={{ marginLeft:6, fontSize:10, background:P.promoBg, color:P.promo, borderRadius:4, padding:'1px 5px', fontWeight:700 }}>promo</span>}</span>
                  <span style={{ fontWeight:600, color:P.ink2, fontVariantNumeric:'tabular-nums' }}>{euro(it.unitPrice*it.qty)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 4px 0', borderTop:`1px solid ${P.lineSoft}`, marginTop:4 }}>
        <span style={{ fontSize:13, color:P.ink3 }}>Total</span>
        <span style={{ fontSize:16, fontWeight:800, color:P.ink, fontVariantNumeric:'tabular-nums' }}>{euro(r.optimalTotal)}</span>
      </div>
    </div>
  );
}

// ---- Tab 1: Loja única ----
function TabSingle({ r }) {
  const { t: tr } = useI18n();
  const medals = ['\u{1F947}','\u{1F948}','\u{1F949}'];
  const filtered = r.allTotals;
  const cheapest = filtered[0]?.total || 0;
  return (
    <div>
      {filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'28px 0', color:P.ink3, fontSize:13.5 }}>Nenhuma loja deste tipo com dados dispon\u00edveis.</div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
          {filtered.map((t,i)=>{
            const diff = t.total - cheapest;
            return (
              <div key={t.supermarket.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 0', borderBottom:i<filtered.length-1?`1px solid ${P.lineSoft}`:'none' }}>
                <span style={{ fontSize:14, width:22, textAlign:'center', flexShrink:0 }}>{i<3?medals[i]:`${i+1}.`}</span>
                <StoreBadge id={t.supermarket.id} size={22}/>
                <span style={{ flex:1, fontSize:13, color:i===0?P.ink:P.ink2, fontWeight:i===0?700:500, minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.supermarket.name}</span>
                <span style={{ fontSize:13, fontWeight:700, color:P.ink, fontVariantNumeric:'tabular-nums', flexShrink:0 }}>{euro(t.total)}</span>
                {i===0
                  ? <PPill color={P.savings} bg={P.savingsBg} style={{fontSize:10,flexShrink:0}}>mais barato</PPill>
                  : <span style={{ fontSize:12, fontWeight:700, color:'#C62828', flexShrink:0, minWidth:46, textAlign:'right' }}>+{euro(diff)}</span>
                }
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---- Tab 2: Divisão inteligente ----
function TabSplit({ r }) {
  const [open, setOpen] = useV4S(false);
  if (!r.shouldSplit || !r.splitGroups) return (
    <div style={{ textAlign:'center', padding:'28px 16px' }}>
      <div style={{ fontSize:28, marginBottom:10 }}>ℹ️</div>
      <div style={{ fontSize:14, fontWeight:700, color:P.ink, marginBottom:6 }}>A divisão não compensa neste carrinho.</div>
      <div style={{ fontSize:13, color:P.ink3, lineHeight:1.55 }}>A loja única {r.bestSingle.name} j\u00e1 \u00e9 a melhor op\u00e7\u00e3o.</div>
    </div>
  );
  return (
    <div>
      <div style={{ background:'#F0FBE8', borderRadius:14, padding:'16px', border:'1px solid #C8E6A0', marginBottom:12 }}>
        <div style={{ fontSize:13, fontWeight:800, color:'#2E7D32', marginBottom:10 }}>\ud83d\udca1 Melhor combinação encontrada</div>
        {r.splitGroups.map(g=>(
          <div key={g.supermarket.id} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
            <StoreBadge id={g.supermarket.id} size={20}/>
            <span style={{ flex:1, fontSize:13, color:P.ink2 }}>{g.supermarket.name} → {(g.items||[]).reduce((s,i)=>s+i.qty,0)} produtos</span>
            <span style={{ fontSize:13, fontWeight:700, color:P.ink, fontVariantNumeric:'tabular-nums' }}>{euro(g.subtotal)}</span>
          </div>
        ))}
        <div style={{ borderTop:`1px solid #C8E6A0`, paddingTop:8, marginTop:4, display:'flex', flexDirection:'column', gap:3 }}>
          <div style={{ fontSize:13, color:P.ink2 }}>Total dividido: <strong style={{color:P.ink, fontVariantNumeric:'tabular-nums'}}>{euro(r.splitTotal)}</strong></div>
          <div style={{ fontSize:13, color:'#2E7D32', fontWeight:700 }}>Poupança vs loja única: {euro(r.savings)}</div>
        </div>
      </div>
      {/* expand products per store */}
      <button onClick={()=>setOpen(v=>!v)} style={{ width:'100%', background:P.surface2, border:`1px solid ${P.line}`, borderRadius:10, padding:'10px 14px', display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:700, color:P.ink }}>
        <span style={{ flex:1, textAlign:'left' }}>{open?'\u25bc':'\u25ba'} Ver produtos de cada loja</span>
      </button>
      {open && r.splitGroups.map(g=>(
        <div key={g.supermarket.id} style={{ marginTop:6, background:P.surface2, border:`1px solid ${P.line}`, borderRadius:10, padding:'8px 12px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            <StoreBadge id={g.supermarket.id} size={20}/>
            <span style={{ fontSize:13, fontWeight:800, color:P.ink }}>{g.supermarket.name}</span>
          </div>
          {(g.items||[]).map((it,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 0', borderBottom:i<g.items.length-1?`1px solid ${P.lineSoft}`:'none', fontSize:12.5 }}>
              <span style={{ flex:1, color:P.ink }}>{it.product?.name||it.productId}{it.qty>1?` ×${it.qty}`:''}</span>
              <span style={{ fontWeight:600, color:P.ink2, fontVariantNumeric:'tabular-nums' }}>{euro(it.unitPrice*it.qty)}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ---- Tab 3: Personalizada ----
function TabCustom({ r, plan, onResult }) {
  const [selected, setSelected] = useV4S(() => new Set((r && r.allTotals ? r.allTotals : []).map(st => st.supermarket.id)));
  const [customResult, setCustomResult] = useV4S(null);
  const [expanded, setExpanded] = useV4S({});

  function toggleStore(id) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) { if (next.size > 1) next.delete(id); }
      else next.add(id);
      return next;
    });
    setCustomResult(null);
  }

  function calculate() {
    if (!r || !r.allTotals) return;
    const selStores = r.allTotals.filter(st => selected.has(st.supermarket.id)).map(st => st.supermarket);
    if (selStores.length === 0) return;
    const groupMap = {};
    selStores.forEach(s => { groupMap[s.id] = { supermarket: s, items: [], subtotal: 0 }; });
    const missing = [];
    (r._cart || []).forEach(ci => {
      const prod = D4.PRODUCT_BY_ID[ci.productId];
      if (!prod) return;
      let bestStore = null, bestPrice = Infinity;
      selStores.forEach(s => {
        const pr = D4.getPrice(prod, s.id);
        if (pr != null && pr < bestPrice) { bestPrice = pr; bestStore = s; }
      });
      if (bestStore) {
        groupMap[bestStore.id].items.push({ product: prod, qty: ci.qty, unitPrice: bestPrice });
        groupMap[bestStore.id].subtotal += bestPrice * ci.qty;
      } else { missing.push(prod ? prod.name : ci.productId); }
    });
    const groups = Object.values(groupMap).filter(g => g.items.length > 0)
      .sort((a, b) => b.subtotal - a.subtotal)
      .map(g => ({ ...g, subtotal: Math.round(g.subtotal * 100) / 100 }));
    const total = Math.round(groups.reduce((s, g) => s + g.subtotal, 0) * 100) / 100;
    const selTotals = r.allTotals.filter(st => selected.has(st.supermarket.id)).sort((a,b)=>a.total-b.total);
    const cheapestSel = selTotals[0];
    const savingsVsSelSingle = cheapestSel ? Math.round((cheapestSel.total - total) * 100) / 100 : 0;
    const savingsVsWorst = r.worstSingleTotal ? Math.round((r.worstSingleTotal - total) * 100) / 100 : 0;
    const result = { groups, total, savingsVsSelSingle, savingsVsWorst, missing, cheapestSel: cheapestSel?.supermarket };
    setCustomResult(result);
    if (onResult) onResult(result);
  }

  if (!r || !r.allTotals) return <div style={{ padding:20, color:P.ink3, fontSize:13 }}>Faz uma análise primeiro.</div>;

  const numSel = selected.size;

  return (
    <div>
      {/* Instrução clara */}
      <div style={{ background:'#F0FBE8', borderRadius:12, padding:'10px 14px', marginBottom:14, border:'1px solid #C8E6A0' }}>
        <div style={{ fontSize:12.5, color:'#2E7D32', lineHeight:1.55 }}>
          <strong>Como funciona:</strong> activa as lojas onde costumas ir. A app distribui cada produto pela loja mais barata dentro da tua selecção.
        </div>
      </div>

      {/* Lista de lojas com toggles */}
      <div style={{ fontSize:11, fontWeight:700, color:P.ink3, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>
        As minhas lojas ({numSel} seleccionada{numSel!==1?'s':''})
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:14 }}>
        {r.allTotals.map(st => {
          const on = selected.has(st.supermarket.id);
          const isCheapest = r.allTotals[0]?.supermarket.id === st.supermarket.id;
          return (
            <button key={st.supermarket.id} onClick={() => toggleStore(st.supermarket.id)}
              style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 12px', borderRadius:10,
                border:`1px solid ${on ? P.primary : P.line}`,
                background: on ? P.savingsBg : P.bg, cursor:'pointer', fontFamily:'inherit', transition:'all 0.12s' }}>
              <div style={{ width:36, height:20, borderRadius:20, background:on?P.primary:P.line, position:'relative', transition:'background 0.15s', flexShrink:0 }}>
                <div style={{ position:'absolute', top:3, left:on?18:3, width:14, height:14, borderRadius:'50%', background:'#fff', transition:'left 0.15s' }}/>
              </div>
              <StoreBadge id={st.supermarket.id} size={20}/>
              <div style={{ flex:1, textAlign:'left' }}>
                <div style={{ fontSize:13, color:P.ink, fontWeight:on?700:400 }}>{st.supermarket.name}</div>
                {isCheapest && <div style={{ fontSize:10, color:P.savings, fontWeight:700 }}>mais barato no total</div>}
              </div>
              <span style={{ fontSize:12, color:on?P.ink:P.ink3, fontVariantNumeric:'tabular-nums', fontWeight:on?700:400 }}>{euro(st.total)}</span>
            </button>
          );
        })}
      </div>

      <div style={{ fontSize:10.5, color:P.ink3, textAlign:'center', marginBottom:12 }}>
        Precos acima = total do teu carrinho nessa loja sozinha
      </div>

      <PBtn color={P.primary} onClick={calculate}>{`Calcular com estas ${numSel} ${numSel!==1?'lojas':'loja'}`}</PBtn>

      {/* Resultado */}
      {customResult && (
        <div style={{ marginTop:14 }}>
          {/* Hero */}
          <div style={{ background:'#F0FBE8', borderRadius:16, padding:'16px 18px', border:'1px solid #C8E6A0', marginBottom:10 }}>
            <div style={{ fontSize:12, fontWeight:700, color:P.savings, marginBottom:6 }}>✔️ A tua combinação óptima</div>
            <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
              <div>
                <div style={{ fontSize:11, color:P.ink3 }}>Total combinado</div>
                <div style={{ fontSize:22, fontWeight:800, color:P.ink, fontVariantNumeric:'tabular-nums' }}>{euro(customResult.total)}</div>
              </div>
              {customResult.savingsVsSelSingle > 0.5 && (
                <div>
                  <div style={{ fontSize:11, color:P.ink3 }}>Poupas vs {customResult.cheapestSel?.name}</div>
                  <div style={{ fontSize:22, fontWeight:800, color:'#2E7D32', fontVariantNumeric:'tabular-nums' }}>{euro(customResult.savingsVsSelSingle)}</div>
                </div>
              )}
            </div>
            {customResult.savingsVsSelSingle <= 0.5 && (
              <div style={{ fontSize:12, color:P.ink3, marginTop:6 }}>Neste caso comprar tudo numa só loja já é o ideal.</div>
            )}
          </div>

          {/* Aviso de produtos em falta */}
          {customResult.missing && customResult.missing.length > 0 && (
            <div style={{ background:'#FFF8E1', borderRadius:10, padding:'10px 14px', marginBottom:10, fontSize:12.5, color:'#E65100' }}>
              ⚠️ {customResult.missing.length} produto{customResult.missing.length!==1?'s':''} sem preço nestas lojas: {customResult.missing.join(', ')}
            </div>
          )}

          {/* Produtos por loja (expansível) */}
          <div style={{ fontSize:11, fontWeight:700, color:P.ink3, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>Onde comprar cada coisa</div>
          {customResult.groups.map((g, gi) => (
            <div key={g.supermarket.id} style={{ marginBottom:6, border:`1px solid ${P.line}`, borderRadius:12, overflow:'hidden' }}>
              <button onClick={()=>setExpanded(prev=>({...prev,[g.supermarket.id]:!prev[g.supermarket.id]}))}
                style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'11px 12px', background:P.surface2, border:'none', cursor:'pointer', fontFamily:'inherit' }}>
                <StoreBadge id={g.supermarket.id} size={22}/>
                <span style={{ flex:1, fontSize:13.5, fontWeight:700, color:P.ink, textAlign:'left' }}>{g.supermarket.name}</span>
                <span style={{ fontSize:12, color:P.ink3 }}>{g.items.reduce((s,i)=>s+i.qty,0)} artigos</span>
                <span style={{ fontSize:14, fontWeight:800, color:P.ink, fontVariantNumeric:'tabular-nums', marginLeft:4 }}>{euro(g.subtotal)}</span>
                <span style={{ color:P.ink3, fontSize:11, marginLeft:2 }}>{expanded[g.supermarket.id]?'▲':'▼'}</span>
              </button>
              {expanded[g.supermarket.id] && (
                <div style={{ padding:'6px 12px 10px', background:'#fff' }}>
                  {g.items.map((it, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 0', borderBottom:i<g.items.length-1?`1px solid ${P.lineSoft}`:'none', fontSize:13 }}>
                      <span style={{ flex:1, color:P.ink }}>{it.product?.name||it.productId}{it.qty>1?` ×${it.qty}`:''}</span>
                      <span style={{ fontWeight:600, color:P.ink2, fontVariantNumeric:'tabular-nums' }}>{euro(it.unitPrice*it.qty)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
// ---- AnalysisTabs: wrapper com 2 tabs ----
function AnalysisTabs({ r, activeTab, onTabChange, plan }) {
  const { t: tr } = useI18n();
  const tabs = [
    { id:'optimal', label:tr('maxPoupanca')||'Máxima poupança' },
    { id:'single',  label:tr('lojaUnica')||'Loja única' },
  ];
  return (
    <div>
      {/* tab bar */}
      <div style={{ display:'flex', background:P.surface2, borderRadius:12, padding:3, marginBottom:14 }}>
        {tabs.map(tab=>(
          <button key={tab.id} onClick={()=>onTabChange(tab.id)}
            style={{ flex:1, height:34, borderRadius:9, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:12.5, fontWeight:700, transition:'all 0.15s',
              background: activeTab===tab.id ? '#fff' : 'transparent',
              color: activeTab===tab.id ? P.ink : P.ink3,
              boxShadow: activeTab===tab.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            }}>{tab.label}</button>
        ))}
      </div>
      <PCard style={{ padding:'14px 16px' }}>
        {activeTab==='optimal' && <TabOptimal r={r}/>}
        {activeTab==='single'  && <TabSingle r={r}/>}
      </PCard>
    </div>
  );
}

// ---- PersonalizaSection: inline abaixo dos tabs ----
function PersonalizaSection({ r }) {
  const [open, setOpen] = useV4S(false);
  const [selected, setSelected] = useV4S(() => new Set((r?.allTotals||[]).map(st=>st.supermarket.id)));
  const [result, setResult] = useV4S(null);
  const [expanded, setExpanded] = useV4S({});

  function toggle(id) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) { if (next.size > 1) next.delete(id); }
      else next.add(id);
      return next;
    });
    setResult(null);
  }

  function calculate() {
    if (!r?.allTotals) return;
    const selStores = (r.allTotals||[]).filter(st => selected.has(st.supermarket.id)).map(st=>st.supermarket);
    if (!selStores.length) return;
    const groupMap = {};
    selStores.forEach(s => { groupMap[s.id] = { supermarket:s, items:[], subtotal:0 }; });
    const missing = [];
    (r._cart||[]).forEach(ci => {
      const prod = D4.PRODUCT_BY_ID[ci.productId];
      if (!prod) return;
      let bestStore = null, bestPrice = Infinity;
      selStores.forEach(s => {
        const pr = D4.getPrice(prod, s.id);
        if (pr != null && pr < bestPrice) { bestPrice = pr; bestStore = s; }
      });
      if (bestStore) {
        groupMap[bestStore.id].items.push({ product:prod, qty:ci.qty, unitPrice:bestPrice });
        groupMap[bestStore.id].subtotal += bestPrice*ci.qty;
      } else { missing.push(prod.name); }
    });
    const groups = Object.values(groupMap).filter(g=>g.items.length>0)
      .sort((a,b)=>b.subtotal-a.subtotal)
      .map(g=>({...g, subtotal:Math.round(g.subtotal*100)/100}));
    const total = Math.round(groups.reduce((s,g)=>s+g.subtotal,0)*100)/100;
    const savingsVsOptimal = Math.round(((r.optimalTotal||r.singleTotal) - total)*100)/100;
    const savingsVsWorst   = r.worstSingleTotal ? Math.round((r.worstSingleTotal - total)*100)/100 : 0;
    setResult({ groups, total, savingsVsOptimal, savingsVsWorst, missing });
  }

  if (!r?.allTotals) return null;
  const numSel = selected.size;
  const storeNames = (r.allTotals||[]).filter(st=>selected.has(st.supermarket.id)).map(st=>st.supermarket.name);

  return (
    <div style={{ marginTop:12, border:`1px solid ${P.line}`, borderRadius:16, overflow:'hidden' }}>
      {/* Header — always visible */}
      <button onClick={()=>setOpen(v=>!v)}
        style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'14px 16px', background:P.surface2, border:'none', cursor:'pointer', fontFamily:'inherit' }}>
        <span style={{ fontSize:18, flexShrink:0 }}>🛒</span>
        <div style={{ flex:1, textAlign:'left' }}>
          <div style={{ fontSize:13.5, fontWeight:800, color:P.ink }}>Não te dava jeito ir a {r.optimalGroups?.length||4} supermercados?</div>
          <div style={{ fontSize:12, color:P.ink3, marginTop:2 }}>Personaliza as lojas e vê a diferença</div>
        </div>
        <span style={{ fontSize:13, color:P.ink3, fontWeight:700 }}>{open?'▲':'▼'}</span>
      </button>

      {open && (
        <div style={{ padding:'14px 16px', background:'#fff' }}>
          <div style={{ fontSize:12.5, color:P.ink3, marginBottom:10, lineHeight:1.55 }}>
            Selecciona as lojas onde preferes ir. Redistribuímos os artigos pela combinação mais barata dentro da tua escolha.
          </div>

          {/* Store toggles */}
          <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:12 }}>
            {(r.allTotals||[]).map(st => {
              const on = selected.has(st.supermarket.id);
              return (
                <button key={st.supermarket.id} onClick={()=>toggle(st.supermarket.id)}
                  style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10,
                    border:`1px solid ${on?P.primary:P.line}`, background:on?P.savingsBg:P.bg,
                    cursor:'pointer', fontFamily:'inherit', transition:'all 0.12s' }}>
                  <div style={{ width:34, height:18, borderRadius:18, background:on?P.primary:P.line, position:'relative', transition:'background 0.15s', flexShrink:0 }}>
                    <div style={{ position:'absolute', top:2, left:on?17:2, width:14, height:14, borderRadius:'50%', background:'#fff', transition:'left 0.15s' }}/>
                  </div>
                  <StoreBadge id={st.supermarket.id} size={20}/>
                  <span style={{ flex:1, fontSize:13, color:P.ink, textAlign:'left', fontWeight:on?700:400 }}>{st.supermarket.name}</span>
                  <span style={{ fontSize:12, color:P.ink3, fontVariantNumeric:'tabular-nums' }}>{euro(st.total)}</span>
                </button>
              );
            })}
          </div>

          <PBtn color={P.primary} onClick={calculate}>{`Ver poupança com ${numSel} ${numSel!==1?'lojas':'loja'}`}</PBtn>

          {/* Resultado */}
          {result && (
            <div style={{ marginTop:14 }}>
              {/* Hero */}
              {(()=>{
                const worstGlobal = (r.allTotals||[]).slice(-1)[0];
                const savingsVsGlobal = worstGlobal ? Math.max(0, Math.round((worstGlobal.total - result.total)*100)/100) : 0;
                const extraVsOptimal = Math.max(0, Math.round((result.total - (r.optimalTotal||r.singleTotal))*100)/100);
                const optimalTotal = r.optimalTotal||r.singleTotal;
                return (
                  <div style={{ background:'#F0FBE8', borderRadius:14, padding:'16px', border:'1px solid #C8E6A0', marginBottom:10 }}>
                    {/* Total a pagar — número principal */}
                    <div style={{ marginBottom:12 }}>
                      <div style={{ fontSize:11, color:P.ink3, marginBottom:2 }}>Total a pagar com {result.groups.map(g=>g.supermarket.name).join(' + ')}</div>
                      <div style={{ fontSize:28, fontWeight:900, color:P.ink, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.03em' }}>{euro(result.total)}</div>
                    </div>
                    {/* Linha: máxima poupança + diferencial */}
                    <div style={{ display:'flex', gap:16, flexWrap:'wrap', paddingTop:10, borderTop:'1px solid #C8E6A0', marginBottom:10 }}>
                      <div>
                        <div style={{ fontSize:11, color:P.ink3, marginBottom:2 }}>Máxima poupança possível</div>
                        <div style={{ fontSize:16, fontWeight:800, color:'#2E7D32', fontVariantNumeric:'tabular-nums' }}>{euro(optimalTotal)}</div>
                      </div>
                      {extraVsOptimal > 0.5 && (
                        <div>
                          <div style={{ fontSize:11, color:P.ink3, marginBottom:2 }}>Diferencial</div>
                          <div style={{ fontSize:16, fontWeight:800, color:'#E65100', fontVariantNumeric:'tabular-nums' }}>+{euro(extraVsOptimal)}</div>
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize:11, color:P.ink3, marginBottom:2 }}>Poupas vs {worstGlobal?.supermarket?.name||'pior caso'}</div>
                        <div style={{ fontSize:16, fontWeight:800, color:'#2E7D32', fontVariantNumeric:'tabular-nums' }}>{euro(savingsVsGlobal)}</div>
                      </div>
                    </div>
                    {/* Nota diferencial */}
                    {extraVsOptimal > 0.5 && (
                      <div style={{ background:'rgba(255,255,255,0.7)', borderRadius:8, padding:'8px 10px', fontSize:12, color:P.ink2, lineHeight:1.45 }}>
                        💡 Se fosses a mais lojas pouparias mais <strong>{euro(extraVsOptimal)}</strong> — fica ao teu critério.
                      </div>
                    )}
                  </div>
                );
              })()}

              {result.missing?.length > 0 && (
                <div style={{ background:'#FFF8E1', borderRadius:10, padding:'8px 12px', marginBottom:8, fontSize:12, color:'#E65100' }}>
                  ⚠️ {result.missing.join(', ')} sem preço nestas lojas
                </div>
              )}

              {/* Produtos por loja */}
              {result.groups.map((g,gi) => (
                <div key={g.supermarket.id} style={{ marginBottom:6, border:`1px solid ${P.line}`, borderRadius:10, overflow:'hidden' }}>
                  <button onClick={()=>setExpanded(prev=>({...prev,[g.supermarket.id]:!prev[g.supermarket.id]}))}
                    style={{ width:'100%', display:'flex', alignItems:'center', gap:8, padding:'10px 12px', background:P.surface2, border:'none', cursor:'pointer', fontFamily:'inherit' }}>
                    <StoreBadge id={g.supermarket.id} size={20}/>
                    <span style={{ flex:1, fontSize:13, fontWeight:700, color:P.ink, textAlign:'left' }}>{g.supermarket.name}</span>
                    <span style={{ fontSize:12, color:P.ink3, marginRight:4 }}>{g.items.reduce((s,i)=>s+i.qty,0)} artigos</span>
                    <span style={{ fontSize:14, fontWeight:800, color:P.ink, fontVariantNumeric:'tabular-nums' }}>{euro(g.subtotal)}</span>
                    <span style={{ color:P.ink3, fontSize:11, marginLeft:2 }}>{expanded[g.supermarket.id]?'▲':'▼'}</span>
                  </button>
                  {expanded[g.supermarket.id] && (
                    <div style={{ padding:'6px 12px 8px', background:'#fff' }}>
                      {g.items.map((it,i) => (
                        <div key={i} style={{ display:'flex', gap:8, padding:'5px 0', borderBottom:i<g.items.length-1?`1px solid ${P.lineSoft}`:'none', fontSize:12.5 }}>
                          <span style={{ flex:1, color:P.ink }}>{it.product?.name}{it.qty>1?` ×${it.qty}`:''}</span>
                          <span style={{ fontWeight:600, color:P.ink2, fontVariantNumeric:'tabular-nums' }}>{euro(it.unitPrice*it.qty)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============ ANALYSIS ============
function AnalysisV4({ result, plan, onBack, onGoCart, onUpgrade, onHistory }) {
  const { t } = useI18n();
  const [animVal, setAnimVal] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [activeTab, setActiveTab] = useState('optimal');
  const [latestCustomResult, setLatestCustomResult] = useState(null);
  useEffect(()=>{
    if(!result) return;
    const target = result.shouldSplit ? result.savings : 0;
    let raf, start;
    const tick = t => {
      if(!start)start=t;
      const p = Math.min(1,(t-start)/1100);
      setAnimVal(target*(1-Math.pow(1-p,3)));
      if(p<1)raf=requestAnimationFrame(tick); else setAnimVal(target);
    };
    raf=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(raf);
  },[result]);

  if(!result) return (
    <div data-screen-label="Análise — vazio" style={{ paddingTop:54 }}>
      <PHeader title="Análise"/>
      <div style={{ textAlign:'center', padding:'60px 28px', color:P.ink3 }}>
        <div style={{ fontSize:40, marginBottom:14 }}>🧭</div>
        <p style={{ fontSize:14, lineHeight:1.55, margin:'0 0 18px' }}>Ainda sem análises.<br/>Cria um carrinho primeiro.</p>
        <PGhost onClick={onGoCart} style={{ maxWidth:240, margin:'0 auto' }}>Ir para o carrinho</PGhost>
      </div>
    </div>
  );

  const r = result;
  const split = r.shouldSplit;
  const freeIds = D4.PRODUCTS.slice(0, FREE_LIMIT).map(p=>p.id);
  const freeCart = r._cart ? r._cart.filter(i=>freeIds.includes(i.productId)) : null;
  const freeResult = plan==='free' && freeCart ? D4.compareCartV4(freeCart, r._district||'lisboa') : null;
  const extra = freeResult && r.savings > freeResult.savings ? Math.round((r.savings - freeResult.savings)*100)/100 : 0;

  const pc = planColor(plan);

  // products list for single-store case
  const cartItems = (r._cart||[]).map(ci=>{
    const prod = D4.PRODUCT_BY_ID[ci.productId];
    if (!prod) return null;
    const price = D4.getPrice(prod, r.bestSingle.id);
    return { name:prod.name, qty:ci.qty, price: (price||0)*ci.qty };
  }).filter(Boolean);

  const worst = r.allTotals[r.allTotals.length-1];
  const vsWorst = worst ? Math.max(0, worst.total - r.singleTotal) : 0;

  return (
    <div data-screen-label="Análise — resultado" style={{ paddingTop:54, height:'100%', display:'flex', flexDirection:'column' }}>
      <PHeader title="Resultado" subtitle={`${r.totalItems} artigos · ${r.allTotals.length} lojas comparadas`} onBack={onBack}
        right={
          <button onClick={()=>onHistory&&onHistory()} style={{ border:'none', background:'none', cursor:'pointer', color:P.ink3, fontSize:12.5, fontWeight:700, fontFamily:'inherit', display:'flex', alignItems:'center', gap:4 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            Histórico
          </button>
        }
      />
      <div style={{ flex:1, overflowY:'auto', padding:'4px 20px 80px' }}>

        {/* ═══ SECÇÃO 1 — Hero de impacto ═══ */}
        {(()=>{
          const mensalidade = plan==='plus_health' ? 2.49 : 1.39;
          const planoNome   = plan==='plus_health' ? 'OláSuper Saúde' : 'OláSuper Plus';
          const optSavings  = r.optimalSavings || 0;
          const optPct      = r.optimalSavingsPct || 0;
          const optTotal    = r.optimalTotal || r.singleTotal;
          const numStores   = (r.optimalGroups||[]).length;
          const poupancaReal = Math.max(0, optSavings - mensalidade);
          const showSubLine  = (plan==='plus'||plan==='plus_health') && optSavings > 0;
          return (
            <div style={{ borderRadius:20, padding:'20px', marginBottom:12, border:'1.5px solid #C8E6A0', background:'#F0FBE8' }}>
              <PPill color={P.savings} bg={P.primarySoft} style={{marginBottom:12}}>
                <CheckIco size={12} color={P.savings}/> Poupança máxima encontrada
              </PPill>
              <div style={{ fontSize:13, color:P.ink3, marginBottom:2 }}>Distribuindo por {numStores} {numStores===1?'loja':'lojas'}, poupas</div>
              <div style={{ fontSize:52, fontWeight:800, color:'#2E7D32', letterSpacing:'-0.04em', lineHeight:1.05, marginBottom:4, fontVariantNumeric:'tabular-nums' }}>
                {euro(optSavings)}
              </div>
              <div style={{ fontSize:13, color:P.ink2, marginBottom:10 }}>−{optPct}% vs {r.worstSingle?.name||'loja mais cara'}</div>
              <div style={{ fontSize:14, color:P.ink2, fontWeight:600 }}>Total: <strong style={{color:P.ink, fontSize:18}}>{euro(optTotal)}</strong></div>
              {/* subscrição linha */}
              {showSubLine && (
                <div style={{ borderTop:'1px solid #C8E6A0', marginTop:14, paddingTop:12, display:'flex', alignItems:'flex-start', gap:8 }}>
                  <span style={{ fontSize:16, flexShrink:0 }}>⭐</span>
                  <div>
                    <div style={{ fontSize:12, color:'#6B6B6B' }}>Com o teu <strong style={{color:P.ink}}>{planoNome}</strong> poupaste</div>
                    <div style={{ fontSize:16, fontWeight:800, color:P.savings, fontVariantNumeric:'tabular-nums' }}>{euro(poupancaReal)} este mês</div>
                    <div style={{ fontSize:11, color:'#9E9E9E', marginTop:1 }}>já com a mensalidade de {euro(mensalidade)} incluída</div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ═══ SECÇÃO 2 — Produtos includídos (expansível) ═══ */}
        <AnalysisProductsList cartItems={cartItems} split={split} splitGroups={r.splitGroups}/>

        {/* ═══ Plus upsell ═══ */}
        {plan==='free' && extra > 0.5 && (
          <div onClick={onUpgrade} style={{ cursor:'pointer', marginBottom:12, padding:'12px 14px', background:P.plusBg, borderRadius:14, display:'flex', alignItems:'center', gap:12, border:`1px solid ${P.plus}40` }}>
            <CrownIco size={22} color={P.plus}/>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13.5, fontWeight:800, color:P.plus }}>Com Plus, pouparias +{euro(extra)}</div>
              <div style={{ fontSize:12, color:P.ink3, marginTop:1 }}>Catálogo completo desbloqueado</div>
            </div>
            <span style={{ color:P.plus, fontWeight:800 }}>↗</span>
          </div>
        )}

        {/* ═══ SECÇÃO 3+4 — 2 tabs ═══ */}
        <AnalysisTabs r={r} activeTab={activeTab} onTabChange={setActiveTab} plan={plan}/>

        {/* ═══ PERSONALIZA — inline abaixo dos tabs ═══ */}
        <PersonalizaSection r={r}/>

      </div>

      {/* ═══ CTA fixo no fundo ═══ */}
      <div style={{ flexShrink:0, padding:'10px 20px 14px', background:P.bg, borderTop:`1px solid ${P.lineSoft}` }}>
        <PBtn color={P.primary} onClick={()=>{
          // Guardar poupança confirmada
          try {
            const hist = JSON.parse(localStorage.getItem('cd4_savings_history')||'[]');
            hist.push({ amount: r.optimalSavings||0, date: new Date().toISOString() });
            localStorage.setItem('cd4_savings_history', JSON.stringify(hist));
          } catch {}
          setConfirmed(true);
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          Confirmar este carrinho
        </PBtn>
        <p style={{ fontSize:11, color:'#9E9E9E', textAlign:'center', margin:'8px 0 0', lineHeight:1.4 }}>
          * Poupança calculada com base nos preços e promoções semanais dos folhetos de cada supermercado.
        </p>
      </div>

      {/* ═══ Modal confirmação ═══ */}
      {confirmed && (() => {
        const isCustom = latestCustomResult != null;
        const groups   = isCustom ? latestCustomResult.groups : (r.optimalGroups || [{supermarket:r.bestSingle, items:[]}]);
        const savings  = isCustom
          ? Math.max(0, Math.round(((r.allTotals||[]).slice(-1)[0]?.total||0) - latestCustomResult.total)*100)/100
          : (r.optimalSavings||0);
        const total    = isCustom ? euro(latestCustomResult.total) : euro(r.optimalTotal||r.singleTotal);
        const worstSt  = r.worstSingle;
        return (
          <div style={{ position:'absolute', inset:0, zIndex:200, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'flex-end', animation:'cdFadeIn 0.2s' }}
            onClick={()=>setConfirmed(false)}>
            <div onClick={e=>e.stopPropagation()} style={{ width:'100%', background:'#fff', borderRadius:'24px 24px 0 0', padding:'28px 24px 36px', boxShadow:'0 -4px 32px rgba(0,0,0,0.12)' }}>
              <div style={{ width:38, height:4, borderRadius:100, background:'#E0E0E0', margin:'0 auto 20px' }}/>
              <div style={{ textAlign:'center', marginBottom:20 }}>
                <div style={{ fontSize:52, marginBottom:12 }}>🤝</div>
                <h2 style={{ margin:'0 0 8px', fontSize:22, fontWeight:800, color:P.ink, letterSpacing:'-0.03em', lineHeight:1.2 }}>Boa escolha!</h2>
                <p style={{ margin:0, fontSize:14, color:P.ink3, lineHeight:1.55 }}>Acumulamos esta compra na tua conta poupança.</p>
              </div>
              <div style={{ background:P.savingsBg, borderRadius:16, padding:'16px 20px', marginBottom:20 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                  <span style={{ fontSize:24 }}>💰</span>
                  <div style={{ fontSize:11, color:P.ink3 }}>Resumo desta compra</div>
                </div>
                {/* Total — número principal */}
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontSize:11, color:P.ink3, marginBottom:2 }}>Total que vais pagar</div>
                  <div style={{ fontSize:30, fontWeight:900, color:P.ink, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.03em' }}>{total}</div>
                </div>
                {/* Poupança — secundária mas em verde */}
                <div style={{ display:'flex', alignItems:'baseline', gap:8, paddingTop:10, borderTop:`1px solid ${P.savingsBg==='#F0FBE8'?'#C8E6A0':P.lineSoft}` }}>
                  <div>
                    <div style={{ fontSize:11, color:P.ink3, marginBottom:1 }}>Poupaste</div>
                    <div style={{ fontSize:20, fontWeight:800, color:'#2E7D32', fontVariantNumeric:'tabular-nums' }}>{euro(savings)}</div>
                  </div>
                  {worstSt && (
                    <div style={{ fontSize:11, color:P.ink3, marginLeft:6, lineHeight:1.4 }}>
                      vs comprar tudo<br/>no {worstSt.name} ({euro((r.allTotals||[]).slice(-1)[0]?.total||0)})
                    </div>
                  )}
                </div>
              </div>
              <button onClick={()=>{
                const win = window.open('','_blank','width=600,height=700');
                if (!win) return;
                win.document.write(`<!DOCTYPE html><html><head><title>Lista de Compras OláSuper</title>
              <style>
                body{font-family:Arial,sans-serif;padding:32px;max-width:480px;margin:0 auto;color:#1A1A1A}
                h1{font-size:20px;font-weight:bold;margin-bottom:4px;color:#6AAB10}
                .date{font-size:12px;color:#9E9E9E;margin-bottom:20px}
                .savings-box{background:#F0FBE8;border:1.5px solid #6AAB10;border-radius:12px;padding:16px 20px;margin-bottom:24px}
                .savings-label{font-size:12px;color:#6B6B6B;margin-bottom:4px}
                .savings-amount{font-size:34px;font-weight:900;color:#2E7D32;letter-spacing:-0.03em;line-height:1}
                .savings-sub{font-size:11px;color:#9E9E9E;margin-top:6px}
                .store{font-size:13px;font-weight:bold;margin:20px 0 8px;border-bottom:1px solid #E0E0E0;padding-bottom:4px}
                .item{font-size:13px;padding:4px 0;display:flex;justify-content:space-between}
                .total{font-size:16px;font-weight:bold;margin-top:24px;border-top:2px solid #1A1A1A;padding-top:12px;display:flex;justify-content:space-between}
                .footer{font-size:10px;color:#9E9E9E;margin-top:32px;text-align:center}
                @media print{.noprint{display:none}}
              </style></head><body>
              <h1>Lista de Compras</h1>
              <div class="date">OláSuper · ${new Date().toLocaleDateString('pt-PT')}</div>
              <div class="savings-box">
                <div style="display:flex;gap:20px;flex-wrap:wrap;margin-bottom:10px">
                  <div>
                    <div class="savings-label">Total a pagar</div>
                    <div class="savings-amount" style="color:#1A1A1A;font-size:28px">${total}</div>
                  </div>
                  <div>
                    <div class="savings-label">Poupaste vs ${r.worstSingle?.name||'loja mais cara'}</div>
                    <div class="savings-amount">${euro(savings)}</div>
                  </div>
                </div>
                ${isCustom && Math.round((latestCustomResult.total - (r.optimalTotal||r.singleTotal))*100)/100 > 0.5
                  ? `<div class="savings-sub" style="color:#E65100">Podias poupar mais: ${euro(Math.round((latestCustomResult.total - (r.optimalTotal||r.singleTotal))*100)/100)} (máxima poupança: ${euro(r.optimalTotal||r.singleTotal)})</div>`
                  : ''}
                <div class="savings-sub">Se compravas tudo no ${r.worstSingle?.name||'loja mais cara'} tinhas gasto ${euro((r.allTotals||[]).slice(-1)[0]?.total||0)}</div>
              </div>
              ${groups.map(g=>`<div class="store">${g.supermarket.name}</div>
                ${(g.items||[]).map(it=>`<div class="item"><span>• ${it.product?.name||it.productId}${it.qty>1?` ×${it.qty}`:''}</span><span>${euro(it.unitPrice*it.qty)}</span></div>`).join('')}
              `).join('')}
              <div class="total"><span>Total</span><span>${total}</span></div>
              <div class="footer">Gerado pelo OláSuper · olasuper.pt</div>
              <br/><button class="noprint" onclick="window.print()" style="padding:10px 24px;background:#6AAB10;color:#fff;border:none;border-radius:8px;font-size:14px;cursor:pointer">Imprimir</button>
              </body></html>`);
win.document.close();
              }} style={{ width:'100%', height:50, borderRadius:14, border:`2px solid ${P.primary}`, background:'transparent', color:P.primary, fontSize:15, fontWeight:700, fontFamily:'inherit', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:12 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={P.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                Imprimir lista de compras
              </button>
              <button onClick={()=>setConfirmed(false)} style={{ width:'100%', height:46, borderRadius:14, border:'none', background:P.surface2, color:P.ink2, fontSize:14, fontWeight:600, fontFamily:'inherit', cursor:'pointer' }}>
                Fechar
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}


// ---- ScannerByName: pesquisa inteligente por nome ----
const SEARCH_PRODUCTS = [
  { id:'oreo', name:'Oreo Original 154g', tags:['oreo','bolacha','recheada','chocolate','nabisco'], category:'snacks', nutri:'D', nova:4, kcal:487, additives:['E250','E102','E471'], allergens:['glüten','soja','leite'], ingredients:'Farinha de trigo, açúcar, óleo vegetal, cacau em pó (6%), sal, aroma, E471, E250, E102' },
  { id:'bolachas_maria', name:'Bolachas Maria Integral', tags:['bolacha','maria','integral','digestiva'], category:'snacks', nutri:'B', nova:3, kcal:420, additives:['E471'], allergens:['glüten'], ingredients:'Farinha integral de trigo, açúcar, óleo de girassol, fermento, sal, E471' },
  { id:'bolachas_rec', name:'Bolachas Recheadas Marca Branca', tags:['bolacha','recheada','creme','barata'], category:'snacks', nutri:'D', nova:4, kcal:495, additives:['E211','E102','E320'], allergens:['glüten','soja'], ingredients:'Farinha de trigo, açúcar, óleo de palma, cacau, E211, E102, E320' },
  { id:'leite_uht', name:'Leite UHT Semi-desnatado 1L', tags:['leite','uht','semi','desnatado'], category:'laticinios', nutri:'B', nova:1, kcal:46, additives:[], allergens:['leite'], ingredients:'Leite de vaca pasteurizado (UHT)' },
  { id:'fiambre', name:'Fiambre Extra Fatiado', tags:['fiambre','fatiado','porco','sanduíche'], category:'carnes', nutri:'C', nova:3, kcal:112, additives:['E250','E621'], allergens:['soja'], ingredients:'Carne de porco (92%), água, amido, sal, E250, E621' },
  { id:'iogurte', name:'Iogurte Natural Activia', tags:['iogurte','danone','activia','natural'], category:'laticinios', nutri:'B', nova:1, kcal:58, additives:[], allergens:['leite'], ingredients:'Leite gordo pasteurizado, fermentos lácticos' },
  { id:'sumo', name:'Sumo de Laranja Compal', tags:['sumo','laranja','compal','natural'], category:'bebidas', nutri:'C', nova:2, kcal:45, additives:['E330'], allergens:[], ingredients:'Sumo de laranja (99%), ácido cítrico E330' },
  { id:'pao_forma', name:'Pão de Forma Integral Bimbo', tags:['pão','forma','integral','bimbo','sandwich'], category:'padaria', nutri:'B', nova:3, kcal:242, additives:['E282','E471'], allergens:['glüten','soja'], ingredients:'Farinha integral, água, levedura, sal, E282, E471' },
  { id:'refrigerante', name:'Refrigerante Cola Marca Branca', tags:['cola','refrigerante','gasosa','soda'], category:'bebidas', nutri:'E', nova:4, kcal:42, additives:['E150d','E338','E951'], allergens:[], ingredients:'Água gaseificada, açúcar, E150d, E338, E951' },
  { id:'queijo', name:'Queijo Fatiado Milbona', tags:['queijo','fatiado','milbona','lidl','amarelo'], category:'laticinios', nutri:'C', nova:2, kcal:356, additives:['E252'], allergens:['leite'], ingredients:'Leite pasteurizado, sal, coalho, E252' },
];
const NUTRI_COL = { A:'#2E7D32', B:'#6AAB10', C:'#F9A825', D:'#E65100', E:'#C62828' };
function ScannerByName({ isHealth, onSelect, onSwitchTab }) {
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [level, setLevel] = useState(null);
  const [results, setResults] = useState([]);

  // Debounce 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    if (debouncedQ.trim().length < 2) { setLevel(null); setResults([]); return; }
    const qLow = debouncedQ.toLowerCase().trim();
    const exacto = SEARCH_PRODUCTS.filter(p => p.name.toLowerCase().includes(qLow) || (p.tags||[]).some(t2=>t2.includes(qLow)));
    if (exacto.length > 0) { setLevel('exacto'); setResults(exacto); return; }
    const palavras = qLow.split(' ').filter(w=>w.length>2);
    const parcial = SEARCH_PRODUCTS.filter(p => palavras.some(w => p.name.toLowerCase().includes(w) || p.category.includes(w) || (p.tags||[]).some(t2=>t2.includes(w))));
    if (parcial.length > 0) { setLevel('parcial'); setResults(parcial); return; }
    setLevel('sem_resultado'); setResults([]);
  }, [debouncedQ]);

  const POPULARES = [
    {emoji:'🍪', label:'Bolachas Oreo',     query:'oreo'},
    {emoji:'🥛', label:'Leite UHT',         query:'leite'},
    {emoji:'🧀', label:'Queijo Fatiado',    query:'queijo'},
    {emoji:'🥩', label:'Fiambre Fatiado',   query:'fiambre'},
    {emoji:'🥤', label:'Refrigerante Cola', query:'cola'},
  ];
  function search(query) {
    setQ(query);
    if (query.trim().length < 2) { setLevel(null); setResults([]); return; }
    const qLow = query.toLowerCase().trim();
    const exacto = SEARCH_PRODUCTS.filter(p => p.name.toLowerCase().includes(qLow) || (p.tags||[]).some(t=>t.includes(qLow)));
    if (exacto.length > 0) { setLevel('exacto'); setResults(exacto); return; }
    const palavras = qLow.split(' ').filter(w=>w.length>2);
    const parcial = SEARCH_PRODUCTS.filter(p => palavras.some(w => p.name.toLowerCase().includes(w) || p.category.includes(w) || (p.tags||[]).some(t=>t.includes(w))));
    if (parcial.length > 0) { setLevel('parcial'); setResults(parcial); return; }
    setLevel('sem_resultado'); setResults([]);
  }
  function riskTag(prod) {
    const hasHigh = prod.additives.some(a => (ADDITIVES_DB[a]||{}).risk==='alto');
    const hasMed  = prod.additives.some(a => (ADDITIVES_DB[a]||{}).risk==='médio');
    if (hasHigh) return { label:'⚠ Risco alto', bg:'#FEECEC', color:'#C62828' };
    if (hasMed)  return { label:'Atenção', bg:'#FFF8E1', color:'#E65100' };
    if (prod.additives.length===0) return { label:'✅ Sem aditivos', bg:'#F0FBE8', color:'#2E7D32' };
    return null;
  }
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:8, background:'#F8F8F8', borderRadius:12, padding:'10px 14px', border:'1px solid #E8E8E8', marginBottom:q?10:12 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9E9E9E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input value={q} onChange={e=>search(e.target.value)} placeholder="Ex: Oreo, bolachas maria, leite…"
          style={{ flex:1, border:'none', background:'transparent', fontSize:14, color:'#1A1A1A', fontFamily:'inherit', outline:'none' }}/>
        {q&&<button onClick={()=>{setQ('');setLevel(null);setResults([]);}} style={{ border:'none', background:'none', cursor:'pointer', color:'#9E9E9E', fontSize:18, padding:0, lineHeight:1 }}>×</button>}
      </div>

      {!q&&(
        <div>
          <div style={{ fontSize:12, fontWeight:600, color:'#9E9E9E', marginBottom:8 }}>Produtos mais pesquisados</div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {POPULARES.map(p=>(
              <button key={p.query} onClick={()=>search(p.query)}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:12, background:'#F8F8F8', border:'1px solid #F0F0F0', cursor:'pointer', fontFamily:'inherit', textAlign:'left' }}>
                <span style={{ fontSize:20, flexShrink:0 }}>{p.emoji}</span>
                <span style={{ fontSize:14, color:'#1A1A1A', fontWeight:500 }}>{p.label}</span>
                <span style={{ marginLeft:'auto', color:'#C8C8C8', fontSize:16 }}>›</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {level==='parcial'&&<div style={{ fontSize:12, color:'#9E9E9E', marginBottom:8 }}>Encontrámos resultados semelhantes:</div>}

      {(level==='exacto'||level==='parcial')&&(
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {results.map(d=>{
            const tag = riskTag(d);
            return (
              <button key={d.id} onClick={()=>onSelect(d)}
                style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', borderRadius:14, background:'#fff', border:'1px solid #F0F0F0', cursor:'pointer', fontFamily:'inherit', textAlign:'left', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ width:44, height:44, borderRadius:12, background:NUTRI_COL[d.nutri]||P.line, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:20, fontWeight:900, flexShrink:0 }}>{d.nutri}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14.5, fontWeight:700, color:'#1A1A1A', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.name}</div>
                  <div style={{ fontSize:12, color:'#9E9E9E', marginTop:2 }}>{d.category} · {d.additives.length>0?`${d.additives.length} aditivo${d.additives.length>1?'s':''}`:'✅ sem aditivos'}</div>
                  {tag&&<span style={{ display:'inline-block', marginTop:6, fontSize:10, background:tag.bg, color:tag.color, borderRadius:6, padding:'2px 7px', fontWeight:700 }}>{tag.label}</span>}
                </div>
                <span style={{ color:'#C8C8C8', fontSize:20, flexShrink:0 }}>›</span>
              </button>
            );
          })}
        </div>
      )}

      {level==='parcial'&&(
        <div style={{ background:'#F8F8F8', borderRadius:12, padding:'12px 14px', marginTop:10 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#1A1A1A', marginBottom:4 }}>💡 Não encontraste o que querias?</div>
          <div style={{ fontSize:12.5, color:'#9E9E9E', lineHeight:1.55, marginBottom:8 }}>Cola os ingredientes do rótulo na tab <strong>Por ingredientes</strong> para análise precisa.</div>
          <button onClick={onSwitchTab} style={{ border:'1px solid #6AAB10', background:'transparent', color:'#6AAB10', borderRadius:8, padding:'6px 14px', fontSize:13, fontWeight:700, fontFamily:'inherit', cursor:'pointer' }}>Ir para Por ingredientes →</button>
        </div>
      )}
      {level==='sem_resultado'&&(
        <div style={{ background:'#F8F8F8', borderRadius:12, padding:'16px', textAlign:'center', marginTop:4 }}>
          <div style={{ fontSize:14, fontWeight:700, color:'#1A1A1A', marginBottom:6 }}>Não encontrámos "{q}"</div>
          <div style={{ fontSize:12.5, color:'#9E9E9E', lineHeight:1.55, marginBottom:12 }}>Copia a lista de ingredientes do rótulo e cola na tab Por ingredientes.</div>
          <button onClick={onSwitchTab} style={{ border:'none', background:'#6AAB10', color:'#fff', borderRadius:10, padding:'8px 20px', fontSize:13.5, fontWeight:700, fontFamily:'inherit', cursor:'pointer' }}>Ir para Por ingredientes →</button>
        </div>
      )}
    </div>
  );
}

// ---- Error Boundary for Scanner ----
class ScannerErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError:false }; }
  static getDerivedStateFromError() { return { hasError:true }; }
  componentDidCatch(err, info) { console.error('Scanner crash:', err, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding:32, textAlign:'center', background:'#F5F5F5', flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
          <div style={{ fontSize:36, marginBottom:12 }}>⚠️</div>
          <div style={{ fontSize:16, fontWeight:700, color:'#1A1A1A', marginBottom:8 }}>Algo correu mal</div>
          <div style={{ fontSize:13, color:'#6B6B6B', marginBottom:20 }}>Tenta novamente</div>
          <button onClick={()=>this.setState({hasError:false})}
            style={{ padding:'10px 24px', background:'#6AAB10', color:'#fff', border:'none', borderRadius:10, fontSize:14, cursor:'pointer', fontFamily:'inherit', fontWeight:700 }}>
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ============ SCANNER ============
const ADDITIVES_DB = {
  'E102':{ name:'Tartrazina', type:'Corante', risk:'alto', note:'Associado a hiperactividade em crianças e reações alérgicas.' },
  'E110':{ name:'Amarelo Sunset FCF', type:'Corante', risk:'alto', note:'Pode causar reacções alérgicas e hiperactividade.' },
  'E150d':{ name:'Caramelo (IV)', type:'Corante', risk:'médio', note:'Contém 4-MEI, possível carcinógeno em doses elevadas.' },
  'E211':{ name:'Benzoato de sódio', type:'Conservante', risk:'alto', note:'Combinado com vitamina C pode formar benzeno (carcinógeno).' },
  'E220':{ name:'Dióxido de enxofre', type:'Conservante', risk:'médio', note:'Pode causar crises em asmáticos.' },
  'E250':{ name:'Nitrito de sódio', type:'Conservante', risk:'alto', note:'Pode formar nitrosaminas carcinógenas em condições de calor.' },
  'E252':{ name:'Nitrato de potássio', type:'Conservante', risk:'médio', note:'Em quantidades elevadas pode interferir com o transporte de oxigénio.' },
  'E282':{ name:'Propionato de cálcio', type:'Conservante', risk:'baixo', note:'Pode causar dores de cabeça em pessoas sensíveis.' },
  'E320':{ name:'BHA (Butil-hidroxianisol)', type:'Antioxidante', risk:'alto', note:'Possível carcinógeno. Proibido em alguns países.' },
  'E321':{ name:'BHT (Butil-hidroxitolueno)', type:'Antioxidante', risk:'médio', note:'Controverso — alguns estudos apontam potencial carcinógeno.' },
  'E322':{ name:'Lecitina', type:'Emulsionante', risk:'baixo', note:'Geralmente seguro. Frequentemente derivado de soja ou girassol.' },
  'E330':{ name:'Ácido cítrico', type:'Regulador de acidez', risk:'baixo', note:'Natural, presente em citrícos. Seguro para consumo geral.' },
  'E338':{ name:'Ácido fosfórico', type:'Regulador de acidez', risk:'médio', note:'Consumo excessivo associado a perda de densidade óssea.' },
  'E407':{ name:'Carragenina', type:'Espessante', risk:'médio', note:'Possível inflamador intestinal em consumo excessivo.' },
  'E471':{ name:'Mono e digliceridos', type:'Emulsionante', risk:'baixo', note:'Derivados de gorduras vegetais ou animais. Geralmente seguro.' },
  'E621':{ name:'Glutamato monossódico (MSG)', type:'Realcador de sabor', risk:'médio', note:'Algumas pessoas reportam sensibilidade. Sem consenso científico.' },
  'E951':{ name:'Aspartame', type:'Edulcorante', risk:'médio', note:'Possível carcinógeno (IARC Grupo 2B). Deve ser evitado por fenilcetonúrios.' },
  'E301':{ name:'Ascorbato de sódio', type:'Antioxidante', risk:'baixo', note:'Forma segura de vitamina C.' },
};

const SEARCH_DEMOS = [
  { name:'Bolachas Recheadas', brand:'Marca Branca · Lidl', tags:['bolacha','bolachas','recheada','recheadas','chocolate','biscoito'], nutri:'D', nova:4, kcal:487, additives:['E211','E102','E320'], allergens:['glúten','soja'], ingredients:'Farinha de trigo, açúcar, óleo vegetal, cacau, E211, E102, E320' },
  { name:'Fiambre Extra Fatiado', brand:'Marca Premium · Continente', tags:['fiambre','fatiado','presunto','charcutaria','porco'], nutri:'C', nova:3, kcal:112, additives:['E250','E621'], allergens:['soja'], ingredients:'Carne de porco (92%), água, amido, sal, E250, E621' },
  { name:'Iogurte Natural', brand:'Activia · Danone', tags:['iogurte','iogurtes','activia','danone','natural','lacticinio'], nutri:'B', nova:1, kcal:58, additives:[], allergens:['leite'], ingredients:'Leite gordo pasteurizado, fermentos lácticos' },
  { name:'Sumo de Laranja', brand:'Compal · Natural', tags:['sumo','laranja','compal','suco','néctar'], nutri:'C', nova:2, kcal:45, additives:['E330'], allergens:[], ingredients:'Sumo de laranja (99%), ácido cítrico E330' },
  { name:'Pão de Forma Integral', brand:'Bimbo', tags:['pao','pão','bimbo','integral','forma','fatiado','trigo'], nutri:'B', nova:3, kcal:242, additives:['E282','E471'], allergens:['glúten','soja'], ingredients:'Farinha integral, água, levedura, sal, E282, E471' },
  { name:'Refrigerante Cola', brand:'Marca Branca · Pingo Doce', tags:['refrigerante','cola','gasoso','bebida','coca'], nutri:'E', nova:4, kcal:42, additives:['E150d','E338','E951'], allergens:[], ingredients:'Água gaseificada, açúcar, E150d, E338, E951' },
  { name:'Queijo Fatiado', brand:'Milbona · Lidl', tags:['queijo','fatiado','flamengo','gouda','milbona'], nutri:'C', nova:2, kcal:356, additives:['E252'], allergens:['leite'], ingredients:'Leite pasteurizado, sal, coalho, E252' },
  { name:'Leite UHT Meio-Gordo', brand:'Mimosa', tags:['leite','mimosa','uht','meiogordo','branco'], nutri:'B', nova:1, kcal:46, additives:[], allergens:['leite'], ingredients:'Leite UHT meio-gordo' },
  { name:'Cereais com Chocolate', brand:'Nestlé · Nesquik', tags:['cereal','cereais','nesquik','chocolate','nestle','pequeno-almoco'], nutri:'D', nova:4, kcal:386, additives:['E306','E322'], allergens:['glúten','soja'], ingredients:'Farinha de milho, açúcar, cacau (7.5%), sal, E306, E322' },
  { name:'Ketchup Classico', brand:'Heinz', tags:['ketchup','heinz','molho','tomate'], nutri:'C', nova:3, kcal:108, additives:['E150d','E260'], allergens:[], ingredients:'Tomate (148g por 100g), vinagre, sal, açúcar, E150d, E260' },
];

const NUTRI_COLORS = { A:'#2E7D32', B:'#6AAB10', C:'#F9A825', D:'#E65100', E:'#C62828' };

function pesquisarProduto(query) {
  const q = query.toLowerCase().trim();
  if (!q || q.length < 2) return { nivel:'vazio', resultados:[] };
  const exactos = SEARCH_DEMOS.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.tags||[]).some(t => t.includes(q))
  );
  if (exactos.length > 0) return { nivel:'exacto', resultados:exactos };
  const palavras = q.split(' ').filter(w => w.length > 2);
  const parciais = SEARCH_DEMOS.filter(p =>
    palavras.some(w =>
      p.name.toLowerCase().includes(w) ||
      (p.tags||[]).some(t => t.includes(w))
    )
  );
  if (parciais.length > 0) return { nivel:'parcial', resultados:parciais };
  return { nivel:'sem_resultado', resultados:[] };
}

function ScannerProductCard({ prod, onSelect }) {
  const risk = prod.additives.length===0?'baixo':prod.additives.some(a=>{ const d=ADDITIVES_DB[a]; return d&&d.risk==='alto'; })?'alto':'médio';
  const riskColor = risk==='alto'?'#C62828':risk==='médio'?'#E65100':'#2E7D32';
  return (
    <button onClick={()=>onSelect(prod)} style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'#fff', border:'none', borderBottom:`1px solid ${P.lineSoft}`, cursor:'pointer', fontFamily:'inherit', textAlign:'left' }}>
      <div style={{ width:32, height:32, borderRadius:9, background:NUTRI_COLORS[prod.nutri]||P.line, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:15, fontWeight:900, flexShrink:0 }}>{prod.nutri||'?'}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13.5, fontWeight:700, color:P.ink, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{prod.name}</div>
        <div style={{ fontSize:11.5, color:P.ink3 }}>{prod.brand}</div>
      </div>
      <span style={{ fontSize:11, fontWeight:700, color:riskColor, background:riskColor+'15', padding:'3px 8px', borderRadius:20, flexShrink:0 }}>{risk}</span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={P.ink3} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
    </button>
  );
}

function ScannerTabNome({ onSelect, onSwitchTab }) {
  const [q, setQ] = useState('');
  const { nivel, resultados } = pesquisarProduto(q);
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:8, background:P.surface2, borderRadius:12, padding:'10px 14px', border:`1px solid ${P.line}`, marginBottom:12 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={P.ink3} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Ex: Oreo, bolachas maria, leite…"
          style={{ flex:1, border:'none', background:'transparent', fontSize:14, color:P.ink, fontFamily:'inherit', outline:'none' }} autoFocus/>
        {q && <button onClick={()=>setQ('')} style={{ border:'none', background:'none', cursor:'pointer', color:P.ink3, fontSize:18, padding:0 }}>×</button>}
      </div>
      {nivel==='exacto' && (
        <div style={{ background:'#fff', border:`1px solid ${P.line}`, borderRadius:12, overflow:'hidden' }}>
          {resultados.map(p=><ScannerProductCard key={p.name} prod={p} onSelect={onSelect}/>)}
        </div>
      )}
      {nivel==='parcial' && (
        <div>
          <div style={{ fontSize:12, color:P.ink3, marginBottom:8, fontWeight:600 }}>Encontrámos resultados semelhantes:</div>
          <div style={{ background:'#fff', border:`1px solid ${P.line}`, borderRadius:12, overflow:'hidden', marginBottom:12 }}>
            {resultados.map(p=><ScannerProductCard key={p.name} prod={p} onSelect={onSelect}/>)}
          </div>
          <div style={{ background:'#EEF4FF', borderRadius:12, padding:'12px 14px', border:'1px solid #B8D0F8', fontSize:12.5, color:'#1B3FAB', lineHeight:1.55 }}>
            💡 Não encontraste o que querias? Cola a lista de ingredientes do rótulo na tab <strong>Por ingredientes</strong> para uma análise mais precisa.
          </div>
        </div>
      )}
      {nivel==='sem_resultado' && (
        <div style={{ textAlign:'center', padding:'24px 16px' }}>
          <div style={{ fontSize:28, marginBottom:10 }}>🔍</div>
          <div style={{ fontSize:14, fontWeight:700, color:P.ink, marginBottom:8 }}>Não encontrámos "{q}"</div>
          <div style={{ fontSize:13, color:P.ink3, lineHeight:1.55, marginBottom:16 }}>
            Para uma análise completa, copia a lista de ingredientes do rótulo e cola na tab <strong>Por ingredientes</strong>.
          </div>
          <button onClick={onSwitchTab} style={{ height:42, borderRadius:12, border:`1.5px solid ${P.primary}`, background:'transparent', color:P.primary, fontSize:13.5, fontWeight:700, fontFamily:'inherit', cursor:'pointer', padding:'0 20px' }}>
            Ir para Por ingredientes →
          </button>
        </div>
      )}
    </div>
  );
}

function ScannerTabIngredientes({ manual, setManual, onSubmit, isHealth }) {
  return (
    <form onSubmit={onSubmit}>
      <textarea value={manual} onChange={e=>setManual(e.target.value)}
        placeholder={"Cola aqui a lista de ingredientes do rótulo.\nEx: Farinha de trigo, açúcar, gordura vegetal, cacau (6%), sal, aroma, E471, E322, E250…"}
        style={{ width:'100%', minHeight:120, background:P.surface2, border:`1px solid ${P.line}`, borderRadius:12, padding:'12px 14px', color:P.ink, fontSize:13.5, fontFamily:'inherit', resize:'vertical', outline:'none', lineHeight:1.6, marginBottom:10 }}/>
      <button type="submit" style={{ width:'100%', height:46, borderRadius:12, border:'none', background:isHealth?P.primary:P.surface3, color:isHealth?'#fff':P.ink3, fontSize:14, fontWeight:800, fontFamily:'inherit', cursor:isHealth?'pointer':'default' }}>
        {isHealth?'Analisar ingredientes':'★ Exclusivo OláSuper Saúde'}
      </button>
    </form>
  );
}

function ScannerV4({ plan, onUpgrade }) {
  const { t } = useI18n();
  const [phase,  setPhase]  = useState('idle');
  const [report, setReport] = useState(null);
  const [manual, setManual] = useState('');
  const [scanTab, setScanTab] = useState('nome'); // 'nome' | 'ingredientes'
  const [ingredientesDB, setIngredientesDB] = useState(null);
  const [dbLoading, setDbLoading] = useState(false);
  const isHealth = plan==='plus_health';

  // Fetch ingredientes.json from GitHub (cache em sessionStorage)
  useEffect(() => {
    const CACHE_KEY = 'cd4_ingredientes_db';
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) { try { setIngredientesDB(JSON.parse(cached)); return; } catch {} }
    setDbLoading(true);
    fetch('https://raw.githubusercontent.com/edgarprogest-create/olasuper-data/main/ingredientes.json')
      .then(r => r.json())
      .then(data => {
        setIngredientesDB(data);
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch {}
        setDbLoading(false);
      })
      .catch(err => {
        console.warn('[OláSuper] ingredientes.json não carregado:', err);
        setDbLoading(false);
      });
  }, []);

  function tryDemo(prod) {
    if (!isHealth) { onUpgrade('plus_health'); return; }
    if (!prod) return;
    try {
      const additives = (prod.additives||[]).map(c => {
        if (!c || typeof c !== 'string') return null;
        return { code:c, ...(ADDITIVES_DB[c.toUpperCase()]||ADDITIVES_DB[c]||{ name:c, type:'Desconhecido', risk:'desconhecido', note:'Sem dados.' }) };
      }).filter(Boolean);
      const verdict = additives.some(a=>a.risk==='alto') ? 'alerta' : additives.some(a=>a.risk==='médio') ? 'atencao' : 'ok';
      setReport({ name:prod.name||'Produto', nutri:prod.nutri||null, nova:prod.nova||null, kcal:prod.kcal||null, additives, allergens:prod.allergens||[], ingredients:prod.ingredients||'', verdict });
      setPhase('result');
    } catch(e) {
      console.error('tryDemo crash:', e.message, e.stack);
    }
  }

  // ---- analisarTexto: cruza texto com DB do GitHub ----
  function analisarTexto(texto, db) {
    if (!texto) return { aditivos: [], ingredientes: [] };
    // Use GitHub DB if available, fallback to hardcoded ADDITIVES_DB
    const textoLower = texto.toLowerCase();
    // Detect E-numbers
    const eNumbers = [...new Set((texto.match(/E\d{3,4}[a-zA-Z]?/gi) || []))];
    let aditivosEncontrados;
    if (db?.aditivos) {
      aditivosEncontrados = eNumbers.map(codigo => {
        const found = db.aditivos.find(a => a.codigo?.toUpperCase() === codigo.toUpperCase());
        return found || { codigo, nome: 'Aditivo n\u00e3o identificado', risco: 'desconhecido', descricao: '', sugestao: '' };
      });
    } else {
      // Fallback to local ADDITIVES_DB
      aditivosEncontrados = eNumbers.map(c => ({ code:c, ...(ADDITIVES_DB[c.toUpperCase()]||ADDITIVES_DB[c]||{ name:c, type:'Desconhecido', risk:'desconhecido', note:'Sem dados.' }) }));
    }
    // Detect harmful ingredients by name/aliases
    const ingredientesEncontrados = (db?.ingredientes_prejudiciais||[]).filter(ing => {
      const aliases = [ing.nome, ...(ing.aliases||[])];
      return aliases.some(alias => textoLower.includes((alias||'').toLowerCase()));
    });
    return { aditivos: aditivosEncontrados, ingredientes: ingredientesEncontrados };
  }

  function handleManual(e) {
    e.preventDefault();
    if(!manual.trim()) return;
    if(!isHealth){ onUpgrade('plus_health'); return; }
    const resultado = analisarTexto(manual.trim(), ingredientesDB);
    const additives = resultado.aditivos.map(a => ({
      code: a.codigo || a.code,
      name: a.nome   || a.name  || a.codigo || a.code,
      type: a.tipo   || a.type  || 'Aditivo',
      risk: a.risco  || a.risk  || 'desconhecido',
      note: a.descricao || a.note || '',
      suggestion: a.sugestao || a.suggestion || '',
    }));
    const high = additives.filter(a => a.risk === 'alto');
    const med  = additives.filter(a => a.risk === 'médio' || a.risk === 'medio');
    setReport({
      name: 'Produto manual',
      brand: 'Inserção manual',
      nutri: null, nova: null, kcal: null,
      additives,
      allergens: [],
      ingredients: manual.trim(),
      verdict: high.length > 0 ? 'alerta' : med.length > 0 ? 'atencao' : 'ok',
      ingredientesPrejudiciais: resultado.ingredientes,
    });
    setPhase('result'); setManual('');
  }

  return (
    <div data-screen-label="Scanner de Ingredientes" style={{ height:'100%', display:'flex', flexDirection:'column', background:'#F5F5F5', overflowY:'auto' }}>

      {/* ─── Header gradiente ─── */}
      <div style={{ background:'linear-gradient(135deg, #2D5A0E 0%, #6AAB10 100%)', padding:'54px 20px 24px', borderRadius:'0 0 28px 28px', marginBottom:16, position:'relative', overflow:'hidden', flexShrink:0 }}>
        {/* emojis decorativos de fundo */}
        <div style={{ position:'absolute', top:8, right:12, fontSize:32, opacity:0.18, letterSpacing:6, pointerEvents:'none' }}>🥦🥩🍎🧀🐟</div>
        <div style={{ fontSize:22, fontWeight:800, color:'#fff', letterSpacing:'-0.03em' }}>Scanner</div>
        <div style={{ fontSize:14, color:'rgba(255,255,255,0.8)', marginTop:4 }}>Descobre o que estás realmente a comer</div>
        {!isHealth&&(
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, marginTop:12, background:'rgba(255,255,255,0.15)', borderRadius:20, padding:'5px 12px' }}>
            <CrownIco size={12} color='#fff'/>
            <span style={{ fontSize:12, color:'#fff', fontWeight:700 }}>Exclusivo OláSuper Saúde</span>
          </div>
        )}
      </div>

      <div style={{ flex:1, padding:'0 16px 100px' }}>

        {/* ─── 2 tabs ─── */}
        <div style={{ display:'flex', gap:8, marginBottom:16 }}>
          {[{id:'nome',label:'🔍 Por nome'},{id:'ingredientes',label:'📋 Por ingredientes'}].map(tab=>(
            <button key={tab.id} onClick={()=>setScanTab(tab.id)}
              style={{ flex:1, height:38, borderRadius:12, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:700, transition:'all 0.15s',
                background: scanTab===tab.id?'#6AAB10':'#fff',
                color: scanTab===tab.id?'#fff':'#6B6B6B',
                boxShadow: scanTab===tab.id?'0 2px 8px rgba(106,171,16,0.3)':'0 1px 3px rgba(0,0,0,0.06)',
              }}>{tab.label}</button>
          ))}
        </div>

        {phase==='idle'&&(
          <>
            {/* TAB A — Por nome */}
            {scanTab==='nome'&&(
              <div>
                {/* Campo pesquisa elevado */}
                <div style={{ background:'#fff', borderRadius:16, padding:'16px', marginBottom:12, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize:12, fontWeight:600, color:'#6B6B6B', marginBottom:8 }}>Pesquisa por nome</div>
                  <ScannerByName isHealth={isHealth} onSelect={tryDemo} onSwitchTab={()=>setScanTab('ingredientes')}/>
                </div>
              </div>
            )}

            {/* TAB B — Por ingredientes */}
            {scanTab==='ingredientes'&&(
              <div style={{ background:'#fff', borderRadius:16, padding:'16px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', marginBottom:12 }}>
                <div style={{ fontSize:12, fontWeight:600, color:'#6B6B6B', marginBottom:10 }}>
                  Cola os ingredientes do rótulo
                  {dbLoading && <span style={{ marginLeft:8, fontSize:11, color:P.primary }}>A carregar base de dados…</span>}
                  {!dbLoading && ingredientesDB && <span style={{ marginLeft:8, fontSize:11, color:'#2E7D32' }}>✓ Base de dados carregada</span>}
                </div>
                <form onSubmit={handleManual}>
                  <textarea value={manual} onChange={e=>setManual(e.target.value)}
                    placeholder={"Cola aqui a lista de ingredientes do rótulo.\nEx: Farinha de trigo, açúcar, gordura vegetal, cacau (6%), sal, aroma, E471, E322, E250..."}
                    style={{ width:'100%', minHeight:110, background:'#F8F8F8', border:'1px solid #E8E8E8', borderRadius:12, padding:'12px', color:'#1A1A1A', fontSize:13.5, fontFamily:'inherit', resize:'vertical', outline:'none', lineHeight:1.55, boxSizing:'border-box' }}/>
                  <button type="submit" style={{ marginTop:10, width:'100%', height:46, borderRadius:12, border:'none', background:isHealth?'#6AAB10':'#E0E0E0', color:isHealth?'#fff':'#9E9E9E', fontSize:14, fontWeight:800, fontFamily:'inherit', cursor:isHealth?'pointer':'default' }}>
                    {isHealth?'Analisar ingredientes':'★ Exclusivo OláSuper Saúde'}
                  </button>
                </form>
              </div>
            )}

            {/* Upsell se não tem saúde */}
            {!isHealth&&<ScannerUpsell onUpgrade={onUpgrade}/>}
          </>
        )}

        {phase==='result'&&report&&(
          <div>
            {/* ═ HERO — nome + Nutri-Score grande ═ */}
            <div style={{ textAlign:'center', padding:'20px 16px 16px', background:P.surface2, borderRadius:16, marginBottom:12, border:`1px solid ${P.line}` }}>
              <div style={{ fontSize:16, fontWeight:800, color:P.ink, letterSpacing:'-0.02em', marginBottom:2 }}>{report.name}</div>
              <div style={{ fontSize:12.5, color:P.ink3, marginBottom:14 }}>{report.brand}</div>
              {/* big Nutri-Score */}
              {report.nutri && (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, marginBottom:8 }}>
                  <NutriScoreBadge letter={report.nutri} size={64} showTooltip={true}/>
                  <div style={{ fontSize:11, color:P.ink3, fontWeight:600 }}>Nutri-Score · toca para saber mais</div>
                </div>
              )}
              {/* metrics row */}
              <div style={{ display:'flex', justifyContent:'center', gap:10, marginTop:8 }}>
                {report.nova&&(
                  <div style={{ textAlign:'center', padding:'8px 14px', background:'#fff', borderRadius:10, border:`1px solid ${P.line}` }}>
                    <div style={{ fontSize:9, color:P.ink3, marginBottom:3 }}>NOVA</div>
                    <div style={{ width:28, height:28, borderRadius:8, background:NOVA_COLORS[report.nova], display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:800, color:'#fff', margin:'0 auto' }}>{report.nova}</div>
                    <div style={{ fontSize:9, color:P.ink3, marginTop:3, lineHeight:1.2, maxWidth:56 }}>{NOVA_LABELS[report.nova]}</div>
                  </div>
                )}
                {report.kcal&&(
                  <div style={{ textAlign:'center', padding:'8px 14px', background:'#fff', borderRadius:10, border:`1px solid ${P.line}` }}>
                    <div style={{ fontSize:9, color:P.ink3, marginBottom:3 }}>Calorias</div>
                    <div style={{ fontSize:22, fontWeight:800, color:P.ink, fontVariantNumeric:'tabular-nums', lineHeight:1 }}>{report.kcal}</div>
                    <div style={{ fontSize:9, color:P.ink3, marginTop:3 }}>kcal/100g</div>
                  </div>
                )}
              </div>
            </div>

            {/* verdict badge */}
            {(()=>{
              const v = report.verdict==='alerta'?{ color:'oklch(50% 0.18 25)', bg:'oklch(96.5% 0.03 25)', icon:'🔴', text:'Contém aditivos de risco alto' }
                : report.verdict==='atencao'?{ color:'oklch(56% 0.15 75)', bg:'oklch(96.5% 0.03 75)', icon:'🟡', text:'Requer atenção' }
                : { color:P.savings, bg:P.savingsBg, icon:'🟢', text:'Perfil de aditivos aceitável' };
              return <div style={{ padding:'13px 15px', borderRadius:16, background:v.bg, border:`1px solid ${v.color}40`, marginBottom:12, display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:22 }}>{v.icon}</span>
                <div><div style={{ fontSize:15, fontWeight:800, color:v.color }}>{v.text}</div></div>
              </div>;
            })()
            }

            {/* additives */}
            {report.additives.length>0?(
              <PCard style={{ padding:'13px 15px', marginBottom:12 }}>
                <div style={{ fontSize:11, fontWeight:700, color:P.ink3, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>{report.additives.length} aditivo{report.additives.length>1?'s':''} detetado{report.additives.length>1?'s':''}</div>
                <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                  {report.additives.map(a=>(
                    <AdditiveCard key={a.code} a={a}/>
                  ))}
                </div>
              </PCard>
            ):(
              <PCard style={{ padding:'16px', textAlign:'center', marginBottom:12 }}>
                <div style={{ fontSize:22, marginBottom:6 }}>✅</div>
                <div style={{ fontSize:14, fontWeight:700, color:P.savings }}>Sem aditivos detetados</div>
                <div style={{ fontSize:12.5, color:P.ink3, marginTop:4 }}>Produto sem aditivos artificiais.</div>
              </PCard>
            )}

            <PCard style={{ padding:'13px 15px', marginBottom:12 }}>
              <div style={{ fontSize:11, fontWeight:700, color:P.ink3, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:7 }}>Ingredientes</div>
              <p style={{ fontSize:12.5, color:P.ink2, lineHeight:1.6, margin:0 }}>{report.ingredients}</p>
            </PCard>

            {report.allergens?.length>0&&(
              <PCard style={{ padding:'13px 15px', marginBottom:12 }}>
                <div style={{ fontSize:11, fontWeight:700, color:P.ink3, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:7 }}>⚠ Alergénios</div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {report.allergens.map(a=><PPill key={a} color='oklch(56% 0.15 75)' bg='oklch(96.5% 0.03 75)'>{a}</PPill>)}
                </div>
              </PCard>
            )}

            <div style={{ display:'flex', gap:8, marginTop:8 }}>
              <PGhost onClick={()=>{setPhase('idle');setReport(null);}} style={{flex:1}}>← Novo scan</PGhost>
              <button onClick={()=>{
                const risks = report.additives.map(a=>`${a.code} (${a.risk})`).join(', ');
                const text = `Analisei "${report.name}" com o OláSuper Saúde\n\n`
                  + `Nutri-Score: ${report.nutri||'N/A'} · NOVA: ${report.nova||'N/A'}\n`
                  + (report.additives.length>0 ? `Aditivos: ${risks}\n` : 'Sem aditivos detectados\n')
                  + `\nOláSuper: olasuper.pt`;
                if (navigator.share) {
                  navigator.share({ title:'Análise OlaSuperr', text });
                } else {
                  navigator.clipboard.writeText(text).then(()=>alert('Texto copiado! Cola onde quiseres.'));
                }
              }} style={{ flex:1, height:44, borderRadius:12, border:`1.5px solid ${P.primary}`, background:'transparent', color:P.primary, fontSize:14, fontWeight:700, fontFamily:'inherit', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={P.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                Partilhar análise
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- PromoCodeField: campo código promocional (Plus Health) ----
function PromoCodeField({ onDiscountApplied }) {
  const [code,  setCode]  = useV4S('');
  const [state, setState] = useV4S(null); // null | 'ok' | 'err'
  const VALID = 'OLASUPERAMIGO';
  function apply() {
    if (code.trim().toUpperCase() === VALID) { setState('ok'); onDiscountApplied && onDiscountApplied(true); }
    else { setState('err'); onDiscountApplied && onDiscountApplied(false); }
  }
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ display:'flex', borderRadius:10, border:`1px solid ${state==='ok'?'#6AB221':state==='err'?'#C62828':'#E0E0E0'}`, overflow:'hidden' }}>
        <input
          type="text" value={code}
          onChange={e=>{ setCode(e.target.value.toUpperCase()); setState(null); }}
          onKeyDown={e=>e.key==='Enter'&&apply()}
          placeholder="Tens um código de desconto?"
          style={{ flex:1, padding:'11px 12px', fontSize:13.5, color:'#1A1A1A', border:'none', outline:'none', background:'#fff', fontFamily:'inherit', minWidth:0 }}
        />
        <button onClick={apply} style={{ background:'#6AB221', color:'#fff', border:'none', padding:'11px 16px', fontSize:13.5, fontWeight:600, fontFamily:'inherit', cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>Aplicar</button>
      </div>
      {state==='ok' && (
        <div style={{ marginTop:7, padding:'8px 12px', background:'#EEF4FF', borderRadius:8, border:'1px solid #B8D0F8' }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#1B3FAB', marginBottom:2 }}>✓ Código aplicado — 20% de desconto</div>
          <div style={{ fontSize:13, color:'#6B6B6B' }}><s style={{marginRight:6}}>2,49€/mês</s>→ <strong style={{color:'#1B3FAB'}}>1,99€/mês</strong></div>
        </div>
      )}
      {state==='err' && (
        <div style={{ marginTop:6, fontSize:12.5, color:'#C62828', fontWeight:600 }}>✗ Código não reconhecido. Tenta novamente.</div>
      )}
    </div>
  );
}

// ============ CLASSIFICADOS CARD ============
function ClassificadosCard() {
  return (
    <div style={{ border:`1px solid ${P.line}`, borderRadius:16, overflow:'hidden', marginBottom:4 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'16px', background:P.surface2 }}>
        <span style={{ fontSize:22, flexShrink:0 }}>📊</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14, fontWeight:800, color:P.ink }}>Classificados OláSuper</div>
          <div style={{ fontSize:12, color:P.ink3, marginTop:1 }}>Anuncia o teu negócio local na app</div>
        </div>
        <span style={{ fontSize:11, color:'#fff', fontWeight:700, background:'#9E9E9E', padding:'3px 10px', borderRadius:20 }}>Em breve</span>
      </div>
      {/* Corpo */}
      <div style={{ padding:'12px 16px 16px', background:'#fff' }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:P.surface2, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={P.ink3} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <div style={{ fontSize:12.5, color:P.ink3, lineHeight:1.55 }}>
            Brevemente poderás anunciar o teu serviço directamente na OláSuper — e chegar a utilizadores que já se preocupam com saúde e alimentação.
          </div>
        </div>
        {/* Selo de qualidade */}
        <div style={{ display:'flex', alignItems:'center', gap:10, background:'#FFFBEB', borderRadius:12, padding:'10px 14px', marginBottom:10, border:'1px solid #FDE68A' }}>
          <span style={{ fontSize:20, flexShrink:0 }}>⭐</span>
          <div style={{ fontSize:12, color:'#92400E', lineHeight:1.5 }}>
            <strong>Profissionais seleccionados a dedo.</strong> Validamos a experiência, o percurso profissional e o feedback positivo dos seus pacientes antes de qualquer anúncio ser aprovado. Só entram os melhores.
          </div>
        </div>
        <div style={{ fontSize:11, fontWeight:700, color:P.ink3, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>Categorias previstas</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {['📊 Comércio local','🧑‍⚕️ Médicos','🥕 Nutricionistas','📝 Dietistas','🧠 Psicólogos','🏥 Enfermeiros ao domicílio'].map(cat=>(
            <span key={cat} style={{ fontSize:11.5, padding:'4px 10px', borderRadius:20, background:P.surface2, color:P.ink2, fontWeight:500 }}>{cat}</span>
          ))}
        </div>
        {/* Email de candidatura */}
        <a href="mailto:apoio@olasuper.com?subject=Candidatura%20a%20an%C3%BAncio%20OlaSuperr"
          style={{ display:'flex', alignItems:'center', gap:8, marginTop:14, padding:'10px 14px', borderRadius:12, background:P.surface2, border:`1px solid ${P.line}`, textDecoration:'none' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={P.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          <div>
            <div style={{ fontSize:11.5, color:P.ink3, lineHeight:1.3 }}>Candidaturas para anúncio</div>
            <div style={{ fontSize:13, fontWeight:700, color:P.primary }}>apoio@olasuper.com</div>
          </div>
        </a>
      </div>
    </div>
  );
}

// ============ PROFILE ============
function ProfileV4({ plan, usageUsed, usageLimit, lastSavings, onUpgrade, followedStores, onToggleFollow, onUpdateFollowCategories, onLogout, district, onDistrictChange }) {
  const { t } = useI18n();
  const isFree   = plan==='free';

  // Ler poupanças confirmadas do localStorage
  const savingsHistory = React.useMemo(() => {
    try { return JSON.parse(localStorage.getItem('cd4_savings_history')||'[]'); } catch { return []; }
  }, []);
  const poupancaTotal = Math.round(savingsHistory.reduce((s,e)=>s+(e.amount||0),0)*100)/100;
  const now = new Date();
  const poupancaMes = Math.round(savingsHistory.filter(e=>{
    const d = new Date(e.date); return d.getFullYear()===now.getFullYear() && d.getMonth()===now.getMonth();
  }).reduce((s,e)=>s+(e.amount||0),0)*100)/100;
  const isPlus   = plan==='plus';
  const isHealth = plan==='plus_health';

  const [linkCopied,    setLinkCopied]    = useState(false);
  const [storesOpen,    setStoresOpen]    = useState(false);
  const [notifEnabled,  setNotifEnabled]  = useState(true);
  const [districtOpen,  setDistrictOpen]  = useState(false);
  const [langOpen,      setLangOpen]      = useState(false);
  const [healthDiscount,setHealthDiscount]= useState(false);

  const followCount = Object.keys(followedStores||{}).length;
  const planLabel  = isHealth ? 'OláSuper Saúde' : isPlus ? 'Plus' : 'Grátis';
  const planCol    = isHealth ? P.health : isPlus ? P.plus : P.savings;
  const planBg     = isHealth ? P.healthBg : isPlus ? P.plusBg : P.savingsBg;
  const renewDate  = 'julho 2027';
  const REFERRAL_CODE = 'OLASUPERAMIGO';
  const referralLink = 'olasuper.pt';
  const shareText = `Estou a usar o OláSuper para poupar nas compras em Portugal 🛒 Compara preços em todos os supermercados e poupa sempre. Experimenta em olasuper.pt`;

  function copyLink() {
    try { navigator.clipboard.writeText(REFERRAL_CODE); } catch {}
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2200);
  }

  function shareLink() {
    if (navigator.share) {
      navigator.share({ title:'OláSuper', text: shareText });
    } else { copyLink(); }
  }

  return (
    <div data-screen-label="Perfil" style={{ paddingTop:54, height:'100%', display:'flex', flexDirection:'column' }}>
      <PHeader title="Perfil"/>
      <div style={{ flex:1, overflowY:'auto', padding:'8px 20px 110px' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

        {/* ═══ SECÇÃO 1 — Avatar + plano ═══ */}
        <PCard style={{ padding:'18px 16px', display:'flex', alignItems:'center', gap:14 }}>
          {/* avatar */}
          <div style={{ position:'relative', flexShrink:0 }}>
            <div style={{
              width:56, height:56, borderRadius:'50%',
              background:`linear-gradient(135deg, ${planCol} 0%, ${isHealth?'oklch(40% 0.22 300)':isPlus?'oklch(42% 0.22 300)':'#C0392B'} 100%)`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:20, fontWeight:900, color:'#fff',
              boxShadow:`0 4px 16px ${planCol}44`,
            }}>MS</div>
            {/* plan dot */}
            <div style={{ position:'absolute', bottom:1, right:1, width:16, height:16, borderRadius:'50%', background:planCol, border:'2px solid #fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {isHealth && <HeartIco size={8} color="#fff"/>}
              {isPlus   && <CrownIco size={8} color="#fff"/>}
              {isFree   && <span style={{ fontSize:8, color:'#fff', fontWeight:800 }}>✓</span>}
            </div>
          </div>

          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:16, fontWeight:800, color:P.ink, letterSpacing:'-0.02em' }}>Maria Santos</div>
            <div style={{ fontSize:12, color:P.ink3, margin:'1px 0 6px' }}>maria.santos@email.pt</div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:planBg, border:`1px solid ${planCol}30`, borderRadius:100, padding:'3px 10px 3px 7px' }}>
              {isHealth && <HeartIco size={11} color={planCol}/>}
              {isPlus   && <CrownIco size={11} color={planCol}/>}
              {isFree   && <span style={{ fontSize:9 }}>🎯</span>}
              <span style={{ fontSize:11.5, fontWeight:800, color:planCol, letterSpacing:'-0.01em' }}>{planLabel}</span>
            </div>
          </div>

          {/* settings cog */}
          <button style={{ border:'none', background:'none', cursor:'pointer', color:P.ink3, padding:4 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
        </PCard>

        {/* ═══ SECÇÃO 2 — Métricas ═══ */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          <PCard style={{ padding:'14px', boxShadow:'none', border:`1px solid ${P.line}` }}>
            <div style={{ fontSize:10, fontWeight:700, color:P.ink3, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>Análises/mês</div>
            <div style={{ fontSize:22, fontWeight:900, color:P.ink, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.03em', lineHeight:1 }}>
              {(isPlus||isHealth) ? '∞' : `${usageUsed}/${usageLimit}`}
            </div>
            {!(isPlus||isHealth) && (
              <div style={{ height:3, borderRadius:100, background:P.surface3, overflow:'hidden', margin:'8px 0 4px' }}>
                <div style={{ height:'100%', borderRadius:100, background:usageUsed>=usageLimit?'oklch(55% 0.18 25)':P.primary, width:`${Math.min(usageUsed/usageLimit,1)*100}%` }}/>
              </div>
            )}
            <div style={{ fontSize:10.5, color:P.ink3, marginTop:(isPlus||isHealth)?6:0 }}>
              {(isPlus||isHealth) ? 'ilimitadas · ' + planLabel : `renova 1 jul`}
            </div>
          </PCard>

          <PCard style={{
            padding:'14px', boxShadow:'none',
            border:`1px solid ${poupancaTotal>0?P.savings+'50':P.line}`,
            background:poupancaTotal>0?P.savingsBg:'#fff',
          }}>
            <div style={{ fontSize:10, fontWeight:700, color:poupancaTotal>0?P.savings:P.ink3, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>Poupança total</div>
            <div style={{ fontSize:22, fontWeight:900, color:poupancaTotal>0?P.savings:P.ink, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.03em', lineHeight:1 }}>
              {poupancaTotal>0 ? euro(poupancaTotal) : '0,00€'}
            </div>
            <div style={{ fontSize:10.5, color:poupancaTotal>0?P.savings:P.ink3, marginTop:6, lineHeight:1.45 }}>
              {poupancaTotal>0 ? (
                poupancaMes>0
                  ? `${euro(poupancaMes)} este mês · ${savingsHistory.length} compra${savingsHistory.length!==1?'s':''} confirmada${savingsHistory.length!==1?'s':''}`
                  : 'já poupaste!'
              ) : 'Faz a tua primeira análise e começa.'}
            </div>
          </PCard>
        </div>

        {/* ═══ SECÇÃO 3 — Simulador de Subscrição ═══ */}
        {isFree && <SimuladorSubscricao/>}

        {/* ═══ SECÇÃO 4 (old 3) — Convidar amigos ═══ */}
        <div style={{ background:'#F0FBE8', borderRadius:16, padding:'20px', border:'1px solid #C8E6A0', position:'relative', overflow:'hidden' }}>
          {/* decorative circles */}
          <div style={{ position:'absolute', top:-20, right:-20, width:90, height:90, borderRadius:'50%', background:'rgba(106,178,33,0.08)', pointerEvents:'none' }}/>
          <div style={{ position:'absolute', bottom:-30, right:20, width:60, height:60, borderRadius:'50%', background:'rgba(106,178,33,0.05)', pointerEvents:'none' }}/>

          {/* header row */}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
            <span style={{ fontSize:24, lineHeight:1, flexShrink:0 }}>🎁</span>
            <div>
              <div style={{ fontSize:16, fontWeight:500, color:'#1A1A1A', lineHeight:1.25 }}>{t('convida')||'Convida amigos para o OláSuper'}</div>
              <div style={{ fontSize:13, color:'#6B6B6B', marginTop:2, lineHeight:1.5 }}>Ajuda a dar a conhecer a app a todos os portugueses. Partilha com família e amigos.</div>
            </div>
          </div>

          {/* botão único */}
          <button onClick={shareLink} style={{ width:'100%', height:42, borderRadius:10, border:'none', background:'#6AB221', color:'#fff', fontSize:14, fontWeight:600, fontFamily:'inherit', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Partilhar OláSuper
          </button>

        </div>

        {/* ═══ CLASSIFICADOS — card de serviço pago ═══ */}
        <ClassificadosCard/>

        {/* ═══ SECÇÃO 4 — Planos ═══ */}
        {isFree && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <div style={{ fontSize:11, fontWeight:700, color:P.ink3, textTransform:'uppercase', letterSpacing:'0.07em' }}>Planos disponíveis</div>

            {/* Plus card */}
            <div style={{ background:'#F0FBE8', borderRadius:18, padding:'16px', border:'1px solid #C8E6A0', position:'relative', overflow:'hidden' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:34, height:34, borderRadius:10, background:'#3B6D11', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <CrownIco size={17} color="#fff"/>
                  </div>
                  <div>
                    <div style={{ fontSize:15, fontWeight:800, color:'#3B6D11', letterSpacing:'-0.01em' }}>Plus</div>
                    <div style={{ fontSize:19, fontWeight:900, color:'#3B6D11', letterSpacing:'-0.03em', lineHeight:1 }}>1,39€<span style={{fontSize:12,fontWeight:600}}>/mês</span></div>
                  </div>
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:12 }}>
                {D4.PLAN_FEATURES.plus.slice(0,3).map(f=>(
                  <div key={f} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:P.ink2 }}>
                    <CheckIco size={13} color='#6AB221'/> {f}
                  </div>
                ))}
              </div>
              <PBtn onClick={()=>onUpgrade('plus')} color='#6AB221' style={{minHeight:42, fontSize:14}}>
                <CrownIco size={15} color="#fff"/> Aderir ao OláSuper Plus
              </PBtn>
              <div style={{ fontSize:11, color:'#6AB221', textAlign:'center', marginTop:8, fontWeight:600, opacity:0.8 }}>
                ★ 2.347 utilizadores activos esta semana
              </div>
            </div>

            {/* OláSuper Saúde card */}
            <div style={{ background:'#EEF4FF', borderRadius:18, padding:'16px', border:'1px solid #B8D0F8', position:'relative', overflow:'hidden' }}>
              {/* "Mais completo" badge */}
              <div style={{ position:'absolute', top:14, right:14, background:'#D0E1FF', borderRadius:100, padding:'3px 10px', fontSize:10.5, fontWeight:800, color:'#1B3FAB', letterSpacing:'0.02em' }}>
                MAIS COMPLETO
              </div>
              <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:10 }}>
                <div style={{ width:34, height:34, borderRadius:10, background:'#1B3FAB', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <HeartIco size={17} color="#fff"/>
                </div>
                <div>
                  <div style={{ fontSize:15, fontWeight:800, color:'#1B3FAB', letterSpacing:'-0.01em' }}>OláSuper Saúde</div>
                  <div style={{ fontSize:19, fontWeight:900, color:'#1B3FAB', letterSpacing:'-0.03em', lineHeight:1 }}>2,49€<span style={{fontSize:12,fontWeight:600}}>/mês</span></div>
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#1B3FAB', fontWeight:700 }}>
                  <CheckIco size={13} color='#1B3FAB'/> Tudo do OláSuper Plus, mais:
                </div>
                {D4.PLAN_FEATURES.plus_health.slice(0,3).map(f=>(
                  <div key={f} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:P.ink2 }}>
                    <CheckIco size={13} color='#1B3FAB'/> {f}
                  </div>
                ))}
              </div>

              {/* ══ botão aderir ══ */}
              <PBtn onClick={()=>onUpgrade('plus_health')} color='#1B3FAB' style={{minHeight:42, fontSize:14}}>
                <HeartIco size={15} color="#fff"/> Aderir ao OláSuper Saúde
              </PBtn>
            </div>
          </div>
        )}

        {/* Plus → upgrade para OláSuper Saúde */}
        {isPlus && (
          <div style={{ background:'#EEF4FF', borderRadius:18, padding:'16px', border:'1px solid #B8D0F8' }}>
            <div style={{ fontSize:24, marginBottom:8 }}>🛒</div>
            <div style={{ fontSize:15, fontWeight:800, color:P.ink, letterSpacing:'-0.02em', marginBottom:6, lineHeight:1.25 }}>
              Prepara-te — vamos encher o teu carrinho de compras.
            </div>
            <div style={{ fontSize:12.5, color:P.ink2, lineHeight:1.55, marginBottom:12 }}>
              Com o OláSuper Saúde sabemos exactamente o que vai para o teu carrinho — e avisamos-te <em>antes</em> de chegares à caixa se há aditivos a evitar. Por apenas <strong style={{color:P.health}}>+1,10 €/mês</strong>.
            </div>
            <PBtn onClick={()=>onUpgrade('plus_health')} color={P.health} style={{minHeight:42, fontSize:14}}>
              <HeartIco size={15} color="#fff"/> Quero saber o que como 🔬
            </PBtn>
          </div>
        )}

        {/* OláSuper Saúde — thank you */}
        {isHealth && (
          <div style={{ background:P.healthBg, borderRadius:18, padding:'16px', border:`1.5px solid ${P.health}35`, textAlign:'center' }}>
            <div style={{ fontSize:32, marginBottom:6 }}>💜</div>
            <div style={{ fontSize:15, fontWeight:800, color:P.health, marginBottom:4 }}>Obrigado por seres membro!</div>
            <div style={{ fontSize:12.5, color:P.ink2, lineHeight:1.55 }}>
              Subscrição activa até <strong>{renewDate}</strong>.<br/>Tens acesso a todas as funcionalidades.
            </div>
          </div>
        )}

        {/* ═══ SECÇÃO 5 — Definições ═══ */}
        <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
          <div style={{ fontSize:11, fontWeight:700, color:P.ink3, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6, paddingLeft:4 }}>{t('definicoes')||'Definições'}</div>

          {/* Notificações */}
          <PCard style={{ padding:'13px 16px', display:'flex', alignItems:'center', gap:12, boxShadow:'none', border:`1px solid ${P.line}`, borderRadius:14, marginBottom:4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={P.ink2} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span style={{ flex:1, fontSize:14, color:P.ink, fontWeight:500 }}>{t('notificacoes')||'Notificações'}</span>
            <div onClick={()=>setNotifEnabled(v=>!v)} style={{ cursor:'pointer', width:42, height:24, borderRadius:100, background:notifEnabled?P.primary:P.surface3, position:'relative', transition:'background 0.2s', border:`1px solid ${notifEnabled?P.primary:P.line}` }}>
              <div style={{ position:'absolute', top:3, left:notifEnabled?20:3, width:16, height:16, borderRadius:'50%', background:'#fff', boxShadow:'0 1px 4px rgba(0,0,0,0.18)', transition:'left 0.18s' }}/>
            </div>
          </PCard>

          {/* Distrito */}
          <PCard onClick={()=>setDistrictOpen(v=>!v)} style={{ padding:'13px 16px', display:'flex', alignItems:'center', gap:12, boxShadow:'none', border:`1px solid ${P.line}`, borderRadius:14, marginBottom:4, cursor:'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={P.ink2} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span style={{ flex:1, fontSize:14, color:P.ink, fontWeight:500 }}>{t('distritoFav')||'Distrito favorito'}</span>
            <span style={{ fontSize:13, color:P.ink3, fontWeight:600 }}>{D4.DISTRICTS.find(d=>d.id===district)?.name || 'Lisboa'}</span>
            <span style={{ color:P.ink3, fontSize:13 }}>›</span>
          </PCard>

          {/* Idioma */}
          <PCard onClick={()=>setLangOpen(true)} style={{ padding:'13px 16px', display:'flex', alignItems:'center', gap:12, boxShadow:'none', border:`1px solid ${P.line}`, borderRadius:14, marginBottom:4, cursor:'pointer' }}>
            <span style={{ fontSize:18 }}>🌐</span>
            <span style={{ flex:1, fontSize:14, color:P.ink, fontWeight:500 }}>{t('idioma')||'Idioma'}</span>
            <span style={{ fontSize:13, color:P.ink3, fontWeight:600 }}>{(window.LINGUAS||[]).find(l=>l.id===(localStorage.getItem('cd4_lang')||'pt'))?.flag} {(window.LINGUAS||[]).find(l=>l.id===(localStorage.getItem('cd4_lang')||'pt'))?.nome}</span>
            <span style={{ color:P.ink3, fontSize:13 }}>›</span>
          </PCard>

          {/* Lojas seguidas */}
          <PCard onClick={()=>setStoresOpen(v=>!v)} style={{ padding:'13px 16px', display:'flex', alignItems:'center', gap:12, boxShadow:'none', border:`1px solid ${P.line}`, borderRadius:14, marginBottom:4, cursor:'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={P.ink2} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <span style={{ flex:1, fontSize:14, color:P.ink, fontWeight:500 }}>{t('lojasSeguidas')||'Lojas seguidas'}</span>
            <span style={{ fontSize:13, color:P.ink3, fontWeight:600 }}>{followCount > 0 ? `${followCount} loja${followCount>1?'s':''}` : 'nenhuma'}</span>
            <span style={{ color:P.ink3, fontSize:13 }}>›</span>
          </PCard>

          {storesOpen && (
            <div style={{ padding:'12px 16px', background:P.surface2, borderRadius:14, marginBottom:4, border:`1px solid ${P.line}` }}>
              <MyStoresSection
                followedStores={followedStores||{}} plan={plan}
                onToggle={onToggleFollow} onUpdateCategories={onUpdateFollowCategories}
                onUpgrade={()=>onUpgrade('plus')}
              />
            </div>
          )}

          {/* Privacidade */}
          <PCard style={{ padding:'13px 16px', display:'flex', alignItems:'center', gap:12, boxShadow:'none', border:`1px solid ${P.line}`, borderRadius:14, marginBottom:12, cursor:'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={P.ink2} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span style={{ flex:1, fontSize:14, color:P.ink, fontWeight:500 }}>{t('politicaPriv')||'Política de privacidade'}</span>
            <span style={{ color:P.ink3, fontSize:13 }}>›</span>
          </PCard>
        </div>

        </div>{/* end inner flex-column */}
      </div>{/* end scroll */}

      {/* ═══ Terminar sessão — fixo no fundo ═══ */}
      <div style={{ flexShrink:0, borderTop:`1px solid ${P.lineSoft}`, background:P.bg }}>
        <div style={{ textAlign:'center', padding:'10px 0 2px', fontSize:11, color:P.ink3 }}>
          OláSuper foi desenvolvida por <a href="https://rebuildops.com" target="_blank" style={{ color:P.ink3, textDecoration:'none', fontWeight:600 }}>RebuildOps.com</a>
        </div>
        <button onClick={onLogout} style={{ width:'100%', padding:'14px 0', border:'none', background:'none', color:'#E24B4A', fontSize:15, fontWeight:500, fontFamily:'inherit', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E24B4A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Terminar sessão
        </button>
      </div>
    </div>
  );
}

// ============ 3-TIER PAYWALL ============
function PaywallV4({ fromPlan, targetPlan, lastSavings, simBudget=120, onSubscribe, onClose }) {
  const [step, setStep] = useState('offer');
  const target = D4.PLANS[targetPlan] || D4.PLANS.plus;
  const isHealth = targetPlan==='plus_health';
  const accentColor = isHealth ? P.health : P.plus;
  const accentBg    = isHealth ? P.healthBg : P.plusBg;

  const freeSave  = Math.round(simBudget * MEDIAN_SAVE * 100) / 100;
  const plusSave  = Math.round(simBudget * MEDIAN_SAVE * PREMIUM_UP * 100) / 100;
  const uplift    = Math.round((plusSave - freeSave) * 100) / 100;

  const upgradePrice = fromPlan==='plus' && isHealth ? '+1,10 €/mês' : target.priceLabel;

  function pay() { setStep('paying'); setTimeout(()=>{setStep('success');setTimeout(()=>onSubscribe(targetPlan),1200);},1400); }

  return (
    <div style={{ position:'absolute', inset:0, zIndex:200, background:'rgba(10,20,14,0.4)', display:'flex', alignItems:'flex-end', animation:'cdFadeIn 0.2s ease' }}
      onClick={step==='offer'?onClose:undefined}>
      <div onClick={e=>e.stopPropagation()} style={{ width:'100%', background:P.surface, borderRadius:'24px 24px 0 0', border:`1px solid ${P.lineSoft}`, padding:'10px 22px calc(max(env(safe-area-inset-bottom),10px) + 12px)', animation:'cdSlideUp 0.32s cubic-bezier(0.32,0.72,0,1)', maxHeight:'92%', overflowY:'auto' }}>
        <div style={{ width:38, height:4, borderRadius:100, background:P.surface3, margin:'0 auto 16px' }}/>

        {step==='offer'&&(<>
          <PPill color={accentColor} bg={accentBg} style={{marginBottom:12}}>
            {isHealth?<HeartIco size={11} color={accentColor}/>:<CrownIco size={11} color={accentColor}/>} {target.label}
          </PPill>

          {isHealth ? (<>
            <h2 style={{ margin:'0 0 10px', fontSize:19, fontWeight:800, color:P.ink, letterSpacing:'-0.025em', lineHeight:1.25 }}>
              Sabias que certos ingredientes nos produtos que compras estão associados a várias doenças?
            </h2>
            <p style={{ margin:'0 0 18px', fontSize:13.5, color:P.ink2, lineHeight:1.6 }}>
              Vai ao supermercado com confiança. O OláSuper Saúde analisa qualquer produto e diz-te exactamente o que estás a comer.
            </p>
            <div style={{ background:P.healthBg, border:`1px solid ${P.health}25`, borderRadius:14, padding:'13px 15px', marginBottom:14 }}>
              <div style={{ fontSize:10.5, fontWeight:700, color:P.health, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>O que inclui</div>
              {[
                ['Nutri-Score A a E','saudável ou não — de imediato'],
                ['Classificação NOVA','quão processado é o produto'],
                ['Aditivos E-numbers','risco alto, médio ou baixo'],
                ['Alergénios detetados','sem surpresas desagradáveis'],
                ['Ranking de saúde por supermercado','quem vende melhor na tua zona'],
              ].map(([t,s])=>(
                <div key={t} style={{ display:'flex', gap:9, marginBottom:7 }}>
                  <CheckIco size={14} color={P.health}/>
                  <div>
                    <div style={{ fontSize:13.5, fontWeight:700, color:P.ink }}>{t}</div>
                    <div style={{ fontSize:12, color:P.ink3, lineHeight:1.4 }}>{s}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign:'center', marginBottom:4 }}>
              <span style={{ fontSize:34, fontWeight:800, color:P.ink, letterSpacing:'-0.03em' }}>2,49 €</span>
              <span style={{ fontSize:14, color:P.ink3, fontWeight:600 }}> / mês</span>
            </div>
            {fromPlan==='plus'&&<p style={{ textAlign:'center', fontSize:12.5, color:P.health, fontWeight:700, margin:'4px 0 12px' }}>Já és Plus? Faz upgrade por apenas +1,10€/mês</p>}
          </>) : (<>
            <h2 style={{ margin:'0 0 6px', fontSize:21, fontWeight:800, color:P.ink, letterSpacing:'-0.025em', lineHeight:1.2 }}>Análises ilimitadas + catálogo completo</h2>
            <p style={{ margin:'0 0 14px', fontSize:13.5, color:P.ink3, lineHeight:1.5 }}>Por menos do que um café por mês.</p>
            <div style={{ background:P.surface2, borderRadius:14, padding:'13px 15px', marginBottom:14, border:`1px solid ${P.line}` }}>
              <p style={{ margin:'0 0 8px', fontSize:11, fontWeight:700, color:P.ink3, textTransform:'uppercase', letterSpacing:'0.07em' }}>Impacto com {simBudget}€/mês</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                <div><div style={{ fontSize:10, color:P.ink3 }}>Grátis</div><div style={{ fontSize:19, fontWeight:800, color:P.ink, fontVariantNumeric:'tabular-nums' }}>{euro(freeSave)}</div></div>
                <div><div style={{ fontSize:10, color:accentColor, fontWeight:700 }}>Plus</div><div style={{ fontSize:19, fontWeight:800, color:accentColor, fontVariantNumeric:'tabular-nums' }}>{euro(plusSave)}</div></div>
              </div>
              <div style={{ marginTop:8, paddingTop:8, borderTop:`1px solid ${P.line}`, fontSize:12.5, color:P.ink2 }}>
                <strong style={{color:P.savings}}>+{euro(uplift)}/mês</strong> extra — subscrição paga-se em dias
              </div>
            </div>
            <ul style={{ margin:'0 0 14px', padding:0, listStyle:'none', display:'flex', flexDirection:'column', gap:7 }}>
              {D4.PLAN_FEATURES[targetPlan].map(f=>(
                <li key={f} style={{ display:'flex', alignItems:'center', gap:9, fontSize:13.5, color:P.ink2 }}>
                  <CheckIco size={14} color={accentColor}/> {f}
                </li>
              ))}
            </ul>
            <div style={{ textAlign:'center', marginBottom:12 }}>
              <span style={{ fontSize:34, fontWeight:800, color:P.ink, letterSpacing:'-0.03em' }}>{target.price.toFixed(2).replace('.',',')} €</span>
              <span style={{ fontSize:14, color:P.ink3, fontWeight:600 }}> / mês</span>
            </div>
          </>)}

          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <button onClick={pay} style={{ height:52, borderRadius:14, border:'none', background:'#000', color:'#fff', fontSize:16, fontWeight:700, fontFamily:'inherit', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
              <svg width="16" height="19" viewBox="0 0 17 20" fill="#fff"><path d="M13.9 10.6c0-2.4 2-3.6 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8C4 5.2 2.5 6.1 1.7 7.6c-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.7 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.1-1.2 2.9-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.5-1-2.5-4zM11.5 3.4c.7-.8 1.1-1.9 1-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4z"/></svg>
              Pay
            </button>
            <button onClick={pay} style={{ height:52, borderRadius:14, border:`1.5px solid ${P.line}`, background:'transparent', color:P.ink, fontSize:15, fontWeight:700, fontFamily:'inherit', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              <span style={{ fontWeight:800 }}><span style={{color:'#4285F4'}}>G</span><span style={{color:'#EA4335'}}>o</span><span style={{color:'#FBBC04'}}>o</span><span style={{color:'#4285F4'}}>g</span><span style={{color:'#34A853'}}>l</span><span style={{color:'#EA4335'}}>e</span></span> Pay
            </button>
            <button onClick={pay} style={{ height:42, borderRadius:12, border:'none', background:'transparent', color:P.ink2, fontSize:14, fontWeight:600, fontFamily:'inherit', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
              <WalletIco size={15} color={P.ink2}/> Pagar com cartão
            </button>
          </div>
          <p style={{ textAlign:'center', fontSize:11, color:P.ink3, margin:'10px 0 0', lineHeight:1.5 }}>Dentro da app · Cancela quando quiseres</p>
        </>)}

        {step==='paying'&&(
          <div style={{ textAlign:'center', padding:'44px 0 52px' }}>
            <div style={{ width:50, height:50, margin:'0 auto 16px', borderRadius:'50%', border:`4px solid ${P.lineSoft}`, borderTopColor:accentColor, animation:'cdSpin 0.8s linear infinite' }}/>
            <div style={{ fontSize:15, fontWeight:700, color:P.ink }}>A processar…</div>
            <div style={{ fontSize:12.5, color:P.ink3, marginTop:5 }}>{target.priceLabel} · {target.label}</div>
          </div>
        )}
        {step==='success'&&(
          <div style={{ textAlign:'center', padding:'44px 0 52px' }}>
            <div style={{ width:58, height:58, margin:'0 auto 14px', borderRadius:'50%', background:accentBg, border:`2px solid ${accentColor}50`, display:'flex', alignItems:'center', justifyContent:'center', animation:'cdPop 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
              <CheckIco size={28} color={accentColor}/>
            </div>
            <div style={{ fontSize:19, fontWeight:800, color:P.ink, letterSpacing:'-0.02em' }}>Bem-vinda ao {target.label}!</div>
            <div style={{ fontSize:13, color:P.ink3, marginTop:5 }}>{isHealth?'Scanner ativado.':'Análises ilimitadas ativadas.'}</div>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { AnalysisV4, ScannerV4, ProfileV4, PaywallV4, ScannerErrorBoundary });
})();
