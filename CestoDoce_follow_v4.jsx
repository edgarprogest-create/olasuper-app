// OláSuper_follow_v4.jsx — FollowButton + MyStoresSection + NotifPreview
(function(){
const { useState, useMemo } = React;
const D4 = window.OláSuperDataV4;

const FREE_MAX = 2;

// ---- helper ----
function isFollowed(followedStores, storeId) {
  return !!(followedStores && followedStores[storeId]);
}
function followCount(followedStores) {
  return Object.keys(followedStores || {}).length;
}

// ---- FollowButton ----
// onToggle(storeId) — toggles follow
// onUpgrade() — called when free limit hit
function FollowButton({ storeId, followedStores, plan, onToggle, onUpgrade, size='md' }) {
  const followed = isFollowed(followedStores, storeId);
  const isFree   = plan==='free';
  const atLimit  = isFree && !followed && followCount(followedStores) >= FREE_MAX;

  const h = size==='sm' ? 28 : 32;
  const fs = size==='sm' ? 11.5 : 12.5;

  function handle(e) {
    e.stopPropagation();
    if (atLimit) { onUpgrade && onUpgrade(); return; }
    onToggle(storeId);
  }

  return (
    <button onClick={handle} style={{
      height: h, padding: '0 12px', border: `1.5px solid ${followed ? P.primary : P.line}`,
      borderRadius: 100, background: followed ? P.primarySoft : 'transparent',
      color: followed ? P.primaryText : P.ink2,
      fontSize: fs, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
      flexShrink: 0, transition: 'all 0.15s',
    }}>
      {followed
        ? <><CheckIco size={13} color={P.primary}/> A seguir</>
        : atLimit
          ? <><CrownIco size={12} color={P.plus}/> Plus</>
          : <>+ Seguir</>
      }
    </button>
  );
}

// ---- Category chips for a store ----
function CategoryChips({ storeId, selectedCats, onChange, disabled }) {
  return (
    <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginTop:6 }}>
      {D4.CATEGORIES.map(cat => {
        const on = selectedCats.includes(cat.id);
        return (
          <button key={cat.id} onClick={()=>{ if(disabled) return; const next=on?selectedCats.filter(c=>c!==cat.id):[...selectedCats,cat.id]; onChange(next); }}
            style={{ height:24, padding:'0 9px', border:`1px solid ${on?P.primary:P.line}`, borderRadius:100, background:on?P.primarySoft:'transparent', color:on?P.primaryText:P.ink3, fontSize:10.5, fontWeight:700, fontFamily:'inherit', cursor:disabled?'default':'pointer', display:'flex', alignItems:'center', gap:4, opacity:disabled?0.5:1, whiteSpace:'nowrap' }}>
            {cat.glyph} {cat.name}
          </button>
        );
      })}
      <button onClick={()=>{ if(disabled) return; onChange([]); }}
        style={{ height:24, padding:'0 9px', border:`1px solid ${P.line}`, borderRadius:100, background:'transparent', color:P.ink3, fontSize:10.5, fontWeight:600, fontFamily:'inherit', cursor:disabled?'default':'pointer' }}>
        Todas
      </button>
    </div>
  );
}

// ---- MyStoresSection (in Profile) ----
function MyStoresSection({ followedStores, plan, onToggle, onUpdateCategories, onUpgrade, onNav }) {
  const [expanded, setExpanded] = useState(null); // storeId being edited
  const isFree = plan==='free';
  const canCats = !isFree;
  const count   = followCount(followedStores);

  const followed = Object.entries(followedStores || {}).map(([id, data]) => ({
    id, store: D4.STORE_BY_ID[id], categories: data.categories || [],
  })).filter(f => f.store);

  const allStores = D4.STORES;

  // notification examples for followed stores
  const notifExamples = useMemo(() => {
    const examples = [];
    followed.slice(0, 2).forEach(f => {
      const flash = D4.FLYERS.find(fl => fl.store===f.id && fl.relampago);
      if (flash) examples.push({ type:'relampago', store:f.store, flyer:flash });
      else {
        const normal = D4.FLYERS.find(fl => fl.store===f.id);
        if (normal) examples.push({ type:'promo', store:f.store, flyer:normal });
      }
    });
    return examples.slice(0, 2);
  }, [followed]);

  return (
    <div>
      {/* header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <h2 style={{ margin:0, fontSize:15, fontWeight:800, color:P.ink, letterSpacing:'-0.01em' }}>As minhas lojas</h2>
        <span style={{ fontSize:12, color:P.ink3 }}>
          {isFree ? `${count}/${FREE_MAX}` : `${count} seguidas`}
        </span>
      </div>

      {/* free limit info */}
      {isFree && (
        <div style={{ padding:'8px 12px', background:P.plusBg, borderRadius:10, fontSize:12.5, color:P.plus, fontWeight:600, marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
          <CrownIco size={14} color={P.plus}/>
          <span>Grátis: max {FREE_MAX} lojas, sem filtro de categoria. <button onClick={onUpgrade} style={{ border:'none', background:'none', cursor:'pointer', color:P.plus, fontWeight:800, fontFamily:'inherit', fontSize:12.5, padding:0 }}>Upgrade →</button></span>
        </div>
      )}

      {/* followed stores list */}
      {followed.length === 0 ? (
        <div style={{ textAlign:'center', padding:'24px 0', color:P.ink3 }}>
          <BellIco size={32} color={P.lineSoft}/>
          <p style={{ fontSize:13.5, lineHeight:1.5, margin:'10px 0 0' }}>
            Ainda não segues nenhuma loja.<br/>Toca em "+ Seguir" no ranking ou nos folhetos.
          </p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
          {followed.map(f => (
            <div key={f.id} style={{ background:P.surface, borderRadius:14, border:`1px solid ${P.line}`, overflow:'hidden', boxShadow:P.shadow }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', cursor:'pointer' }}
                onClick={()=>setExpanded(expanded===f.id?null:f.id)}>
                <StoreBadge id={f.id} size={34}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:800, color:P.ink }}>{f.store.name}</div>
                  <div style={{ fontSize:11.5, color:P.ink3, marginTop:1 }}>
                    {f.categories.length===0 ? 'Todas as categorias' : f.categories.map(c=>D4.CATEGORIES.find(x=>x.id===c)?.name).filter(Boolean).join(', ')}
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  {canCats && <span style={{ fontSize:11, color:P.ink3 }}>{expanded===f.id?'▲':'✏'}</span>}
                  <button onClick={e=>{e.stopPropagation();onToggle(f.id);}} style={{ width:28, height:28, border:`1px solid ${P.line}`, borderRadius:8, background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:P.ink3, fontSize:14 }}>✕</button>
                </div>
              </div>
              {canCats && expanded===f.id && (
                <div style={{ padding:'0 14px 14px', borderTop:`1px solid ${P.lineSoft}`, paddingTop:10 }}>
                  <div style={{ fontSize:11.5, fontWeight:700, color:P.ink3, marginBottom:6 }}>Receber notificações para:</div>
                  <CategoryChips storeId={f.id} selectedCats={f.categories} onChange={cats=>onUpdateCategories(f.id,cats)} disabled={false}/>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* discover more stores */}
      <div style={{ marginBottom:14 }}>
        <div style={{ fontSize:11, fontWeight:700, color:P.ink3, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>Descobrir lojas para seguir</div>
        <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
          {allStores.filter(s=>!followedStores[s.id]).slice(0,5).map(s=>(
            <div key={s.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', background:P.surface, borderRadius:12, border:`1px solid ${P.lineSoft}`, boxShadow:P.shadow }}>
              <StoreBadge id={s.id} size={30}/>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13.5, fontWeight:700, color:P.ink }}>{s.name}</div>
                <div style={{ fontSize:11, color:P.ink3, textTransform:'capitalize' }}>{s.tipo}</div>
              </div>
              <FollowButton storeId={s.id} followedStores={followedStores} plan={plan} onToggle={onToggle} onUpgrade={onUpgrade} size="sm"/>
            </div>
          ))}
        </div>
      </div>

      {/* notification preview */}
      {notifExamples.length > 0 && (
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:P.ink3, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>Exemplo de notificações que receberás</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {notifExamples.map((ex, i) => (
              <div key={i} style={{ display:'flex', gap:10, padding:'11px 14px', background:ex.type==='relampago'?P.flashBg:P.primarySoft, borderRadius:12, border:`1px solid ${ex.type==='relampago'?P.flash+'30':P.primary+'30'}` }}>
                <div style={{ width:32, height:32, borderRadius:10, flexShrink:0, background:ex.type==='relampago'?`${P.flash}20`:P.savingsBg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {ex.type==='relampago'?<FlashIco size={16} color={P.flash}/>:<BellIco size={16} color={P.primary}/>}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:800, color:P.ink }}>
                    {ex.type==='relampago'?`⚡ Relâmpago · ${ex.store.name}`:`${ex.store.name} tem promoção`}
                  </div>
                  <div style={{ fontSize:12, color:P.ink2, marginTop:2, lineHeight:1.4 }}>
                    {ex.flyer.product} a {euro(ex.flyer.promoPrice)} — −{ex.flyer.savingPct}%
                  </div>
                </div>
              </div>
            ))}
            <div style={{ display:'flex', gap:10, padding:'11px 14px', background:P.surface2, borderRadius:12, border:`1px solid ${P.line}` }}>
              <div style={{ width:32, height:32, borderRadius:10, flexShrink:0, background:P.savingsBg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <TrendUpIco size={16} color={P.savings}/>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:800, color:P.ink }}>
                  {followed[0]?.store.name||'Pingo Doce'} sobe no ranking
                </div>
                <div style={{ fontSize:12, color:P.ink2, marginTop:2, lineHeight:1.4 }}>
                  O teu favorito subiu para 2.º lugar nos Frescos esta semana
                </div>
              </div>
            </div>
          </div>
          <p style={{ fontSize:11.5, color:P.ink3, margin:'8px 4px 0', lineHeight:1.5 }}>
            {isFree ? 'Notificações de relâmpago disponíveis em todos os planos.' : 'Notificações personalizadas pelas lojas e categorias que escolheste.'}
          </p>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { FollowButton, CategoryChips, MyStoresSection, isFollowed, followCount, FREE_MAX_STORES: FREE_MAX });
})();
