// OláSuper_liga_v4.jsx — LigaScreen: top-10 dinâmico com 3 filtros + bottom sheet produtos
(function(){
const { useState, useMemo, useEffect } = React;
const D4 = window.OláSuperDataV4;

const TIPO_OPTIONS = [
  { id:'todos',        label:'Todos' },
  { id:'supermercado', label:'Supermercados' },
];

const CAT_OPTIONS = [
  { id:'todos',      label:'Todos',       glyph:'🛒' },
  { id:'carnes',     label:'Carnes',      glyph:'🥩' },
  { id:'frescos',    label:'Frescos',     glyph:'🥬' },
  { id:'congelados', label:'Congelados',  glyph:'❄️' },
  { id:'laticinios', label:'Laticínios',  glyph:'🥛' },
  { id:'bebidas',    label:'Bebidas',     glyph:'💧' },
  { id:'higiene',    label:'Higiene',     glyph:'🧴' },
];

function TrendArrow({ trend }) {
  if (trend==='up')   return <span style={{ color:'#27AE60', fontSize:13, fontWeight:800 }}>↑</span>;
  if (trend==='down') return <span style={{ color:'#C0392B',  fontSize:13, fontWeight:800 }}>↓</span>;
  return <span style={{ color:P.ink3, fontSize:13 }}>→</span>;
}

// ---- Products bottom sheet ----
function WinnerProductsSheet({ storeId, categoryId, onAdd, onClose }) {
  const store    = D4.STORE_BY_ID[storeId];
  const products = useMemo(() => D4.getWinningProducts(storeId, categoryId), [storeId, categoryId]);
  const catLabel = CAT_OPTIONS.find(c=>c.id===categoryId)?.label || 'Todos';

  return (
    <div style={{ position:'absolute', inset:0, zIndex:200, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'flex-end', animation:'cdFadeIn 0.18s ease' }}
      onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ width:'100%', background:'#FFFFFF', borderRadius:'22px 22px 0 0', boxShadow:'0 -4px 32px rgba(0,0,0,0.18)', paddingTop:8, paddingLeft:20, paddingRight:20, paddingBottom:32, animation:'cdSlideUp 0.3s cubic-bezier(0.32,0.72,0,1)', maxHeight:'72%', display:'flex', flexDirection:'column' }}>
        {/* drag handle */}
        <div style={{ width:40, height:4, borderRadius:2, background:'#E0E0E0', margin:'0 auto 16px', flexShrink:0 }}/>

        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14, flexShrink:0 }}>
          <StoreBadge id={storeId} size={36}/>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:16, fontWeight:800, color:P.ink }}>{store?.name}</div>
            <div style={{ fontSize:12.5, color:P.ink3 }}>Produtos mais baratos em {catLabel}</div>
          </div>
          <button onClick={onClose} style={{ width:30, height:30, border:`1px solid ${P.line}`, borderRadius:8, background:'transparent', cursor:'pointer', color:P.ink2, fontSize:15, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>

        <div style={{ flex:1, overflowY:'auto' }}>
          {products.length===0 ? (
            <div style={{ textAlign:'center', padding:'32px 0', color:P.ink3 }}>
              <p style={{ fontSize:13.5 }}>Sem produtos vencedores nesta combinação.</p>
            </div>
          ) : products.map(wp => (
            <div key={wp.product.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 0', borderBottom:`1px solid ${P.lineSoft}` }}>
              <span style={{ fontSize:22, flexShrink:0 }}>{wp.product.glyph}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:700, color:P.ink, display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                  {wp.product.name}
                  {wp.isPromo && <PPill color={P.promo} bg={P.promoBg} style={{fontSize:10}}>promo</PPill>}
                </div>
                <div style={{ fontSize:12, color:P.ink3, marginTop:2 }}>
                  vs mais caro: {euro(wp.worstPrice)} ({wp.worstStore?.name})
                </div>
                <PPill color={P.savings} bg={P.savingsBg} style={{fontSize:10, marginTop:4}}>
                  −{euro(wp.savingVsWorst)} · −{String(wp.savingPct).replace('.',',')}%
                </PPill>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <div style={{ fontSize:16, fontWeight:800, color:P.savings, fontVariantNumeric:'tabular-nums' }}>{euro(wp.price)}</div>
                <button onClick={()=>{onAdd(wp.product.id);}} style={{ marginTop:5, height:28, padding:'0 10px', border:`1px solid ${P.primary}`, borderRadius:8, background:P.primarySoft, color:P.primaryText, fontSize:11.5, fontWeight:700, fontFamily:'inherit', cursor:'pointer', whiteSpace:'nowrap' }}>
                  + Carrinho
                </button>
              </div>
            </div>
          ))}
          <div style={{ height:10 }}/>
        </div>
      </div>
    </div>
  );
}

// ============ LIGA SCREEN ============
function LigaScreen({ onBack, onAdd, onNav, district, onDistrictChange, followedStores, onToggleFollow, onUpgrade, plan }) {
  const [storeType, setStoreType] = useState('todos');
  const [category,  setCategory]  = useState('todos');
  const [detail,    setDetail]    = useState(null); // { storeId, categoryId }

  const ranking = useMemo(() => D4.getTop10Ranking(district, storeType, category), [district, storeType, category]);

  // auto-adjust store type when category changes
  useEffect(() => {
    if (category==='todos') { setStoreType('todos'); return; }
    const types = D4.CAT_STORE_TYPES[category] || ['supermercado'];
    if (!types.includes(storeType) && storeType!=='todos') setStoreType('todos');
  }, [category]);

  const distObj = D4.DISTRICTS.find(d=>d.id===district) || D4.DISTRICTS[0];

  return (
    <div data-screen-label="Liga por Distrito" style={{ paddingTop:54, height:'100%', display:'flex', flexDirection:'column', position:'relative' }}>
      <PHeader title="Liga por Distrito" onBack={onBack}
        subtitle={`${distObj.flag} ${distObj.name} · Top ${ranking.length}`}/>

      {/* Filtros */}
      <div style={{ padding:'0 20px', flexShrink:0 }}>
        {/* Filtro 1 — Região */}
        <div style={{ marginBottom:8 }}>
          <p style={{ fontSize:10.5, fontWeight:700, color:P.ink3, textTransform:'uppercase', letterSpacing:'0.07em', margin:'0 0 5px' }}>Região</p>
          <div style={{ display:'flex', gap:5, overflowX:'auto', paddingBottom:2, scrollbarWidth:'none' }}>
            {D4.DISTRICTS.map(d=>(
              <button key={d.id} onClick={()=>onDistrictChange(d.id)} style={{ flexShrink:0, height:28, padding:'0 10px', border:`1px solid ${district===d.id?P.primary:P.line}`, borderRadius:100, background:district===d.id?P.primarySoft:'transparent', color:district===d.id?P.primaryText:P.ink2, fontSize:11.5, fontWeight:700, fontFamily:'inherit', cursor:'pointer', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:4 }}>
                {d.flag} {d.name}
              </button>
            ))}
          </div>
        </div>

        {/* Filtro 2 — Tipo de loja */}
        <div style={{ marginBottom:8 }}>
          <p style={{ fontSize:10.5, fontWeight:700, color:P.ink3, textTransform:'uppercase', letterSpacing:'0.07em', margin:'0 0 5px' }}>Tipo de loja</p>
          <div style={{ display:'flex', gap:5, overflowX:'auto', paddingBottom:2, scrollbarWidth:'none' }}>
            {TIPO_OPTIONS.map(tp=>(
              <button key={tp.id} onClick={()=>setStoreType(tp.id)} style={{ flexShrink:0, height:28, padding:'0 10px', border:`1px solid ${storeType===tp.id?P.primary:P.line}`, borderRadius:100, background:storeType===tp.id?P.primarySoft:'transparent', color:storeType===tp.id?P.primaryText:P.ink2, fontSize:11.5, fontWeight:700, fontFamily:'inherit', cursor:'pointer', whiteSpace:'nowrap' }}>
                {tp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filtro 3 — Categoria */}
        <div style={{ marginBottom:10 }}>
          <p style={{ fontSize:10.5, fontWeight:700, color:P.ink3, textTransform:'uppercase', letterSpacing:'0.07em', margin:'0 0 5px' }}>Categoria</p>
          <div style={{ display:'flex', gap:5, overflowX:'auto', paddingBottom:2, scrollbarWidth:'none' }}>
            {CAT_OPTIONS.map(c=>(
              <button key={c.id} onClick={()=>setCategory(c.id)} style={{ flexShrink:0, height:28, padding:'0 10px', border:`1px solid ${category===c.id?P.primary:P.line}`, borderRadius:100, background:category===c.id?P.primarySoft:'transparent', color:category===c.id?P.primaryText:P.ink2, fontSize:11.5, fontWeight:700, fontFamily:'inherit', cursor:'pointer', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:4 }}>
                {c.glyph} {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top 10 list */}
      <div style={{ flex:1, overflowY:'auto', padding:'0 20px 80px' }}>
        {ranking.length===0 ? (
          <div style={{ textAlign:'center', padding:'40px 0', color:P.ink3 }}>
            <p style={{ fontSize:14 }}>Sem lojas para esta combinação de filtros.</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {ranking.map((r, i) => {
              const followed = followedStores && followedStores[r.store.id];
              return (
                <PCard key={r.store.id} style={{ padding:'12px 14px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:11 }}>
                    {/* rank */}
                    <div style={{ width:26, height:26, borderRadius:'50%', flexShrink:0, background:i===0?P.savingsBg:P.surface2, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:i===0?P.savings:P.ink3 }}>{i+1}</div>
                    <StoreBadge id={r.store.id} size={32}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:14, fontWeight:800, color:P.ink, display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                        {r.store.name}
                        {i===0 && <PPill color={P.savings} bg={P.savingsBg} style={{fontSize:10}}>↑ líder</PPill>}
                      </div>
                      <div style={{ fontSize:11, color:P.ink3, textTransform:'capitalize', display:'flex', alignItems:'center', gap:5 }}>
                        {r.store.tipo} · <TrendArrow trend={r.trend}/> <span style={{ color:r.trend==='up'?'#27AE60':r.trend==='down'?'#C0392B':P.ink3 }}>{r.trend==='up'?`+${euro(Math.abs(r.delta))}`:r.trend==='down'?`−${euro(Math.abs(r.delta))}`: 'estável'}</span>
                      </div>
                    </div>
                    {/* price */}
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ fontSize:15, fontWeight:800, color:P.ink, fontVariantNumeric:'tabular-nums' }}>{euro(r.avg)}</div>
                      <div style={{ fontSize:10, color:P.ink3 }}>preço médio</div>
                    </div>
                  </div>

                  {/* action row */}
                  <div style={{ display:'flex', gap:7, marginTop:9 }}>
                    <button onClick={()=>setDetail({ storeId:r.store.id, categoryId:category })} style={{ flex:1, height:30, border:`1px solid ${P.line}`, borderRadius:8, background:'transparent', color:P.ink2, fontSize:12, fontWeight:700, fontFamily:'inherit', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                      <SparkIco size={13} color={P.ink3}/> Ver produtos
                    </button>
                    <FollowButton storeId={r.store.id} followedStores={followedStores||{}} plan={plan} onToggle={onToggleFollow} onUpgrade={()=>onUpgrade('plus')} size="sm"/>
                  </div>
                </PCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Products bottom sheet */}
      {detail && (
        <WinnerProductsSheet
          storeId={detail.storeId}
          categoryId={detail.categoryId}
          onAdd={id=>{onAdd(id); setDetail(null);}}
          onClose={()=>setDetail(null)}
        />
      )}
    </div>
  );
}

Object.assign(window, { LigaScreen, WinnerProductsSheet });
})();
