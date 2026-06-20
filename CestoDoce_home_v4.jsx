// OláSuper_home_v4.jsx — Home: stock market + Liga Distrito + simulador + notificações
(function(){
const { useState, useMemo } = React;
const D4 = window.OláSuperDataV4;

const MEDIAN_SAVE = 0.14;
const PREMIUM_UP  = 1.42;

function buildSparks(districtId) {
  const stores = D4.getStoresForDistrict(districtId, null).filter(s => s.tipo==='supermercado');
  const noise = {
    continente:  [1.01,1.02,1.00,1.01,1.02,1.01,1.00,1.00],
    pingodoce:   [1.04,0.99,0.97,0.94,0.93,0.95,0.94,0.94],
    lidl:        [0.92,0.91,0.93,0.90,0.91,0.89,0.90,0.90],
    aldi:        [0.91,0.92,0.90,0.89,0.90,0.88,0.89,0.89],
    mercadona:   [0.97,0.98,0.96,0.97,0.97,0.96,0.96,0.96],
    intermarche: [0.99,1.00,1.01,1.00,1.01,1.00,1.00,1.00],
  };
  const baseAvg = {};
  stores.forEach(sm => {
    const prods = D4.PRODUCTS.filter(p => p.prices[sm.id]?.base);
    baseAvg[sm.id] = prods.reduce((s,p) => s + (p.prices[sm.id]?.base||0), 0) / (prods.length||1);
  });
  return stores.map(sm => {
    const n = noise[sm.id] || Array(8).fill(1);
    const hist = n.map((f, i) => {
      const maxV = Math.max(...stores.map(s => baseAvg[s.id] * (noise[s.id]||Array(8).fill(1))[i]));
      return maxV - baseAvg[sm.id] * f;
    });
    return { id:sm.id, name:sm.name, tipo:sm.tipo, values:hist, today:hist[7], delta:hist[7]-hist[6] };
  }).sort((a,b) => b.today-a.today);
}

function buildCatWinners(districtId) {
  const stores = D4.getStoresForDistrict(districtId, null);
  return D4.CATEGORIES.map(cat => {
    const catStores = stores.filter(s => s.categorias.includes('all') || s.categorias.includes(cat.id));
    const prods = D4.PRODUCTS.filter(p => p.category===cat.id);
    if (!prods.length || !catStores.length) return null;
    const totals = catStores.map(sm => {
      const total = prods.reduce((s,p) => {
        const pr = D4.getPrice(p, sm.id);
        return pr != null ? s + pr : s;
      }, 0);
      return { sm, total };
    }).filter(t => t.total > 0).sort((a,b) => a.total-b.total);
    if (!totals.length) return null;
    const promoCount = prods.filter(p => p.prices[totals[0].sm.id]?.promo != null).length;
    return { category:cat, winner:totals[0].sm, saving:totals[totals.length-1].total - totals[0].total, promoCount };
  }).filter(Boolean);
}

// ---- Notification dot component ----
function NotifItem({ n }) {
  const isFlash = n.type==='relampago';
  return (
    <div style={{ display:'flex', gap:10, padding:'11px 0', borderBottom:`1px solid ${P.lineSoft}` }}>
      <div style={{ width:34, height:34, borderRadius:10, flexShrink:0, background:isFlash?P.flashBg:P.primarySoft, display:'flex', alignItems:'center', justifyContent:'center' }}>
        {isFlash ? <FlashIco size={17} color={P.flash}/> : <TrendUpIco size={17} color={P.primary}/>}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13.5, fontWeight:700, color:P.ink, display:'flex', alignItems:'center', gap:6 }}>
          {n.title}
          {!n.read && <span style={{ width:7, height:7, borderRadius:'50%', background:P.primary, flexShrink:0, display:'inline-block' }}/>}
        </div>
        <div style={{ fontSize:12, color:P.ink2, marginTop:2, lineHeight:1.45 }}>{n.body}</div>
        <div style={{ fontSize:11, color:P.ink3, marginTop:3 }}>{n.time}</div>
      </div>
    </div>
  );
}

// ============ SIMULADOR DE SUBSCRIÇÃO (reutilizável) ============
function SimuladorSubscricao() {
  const { useState: useS } = React;
  const [simOpen, setSimOpen] = useS(false);
  const [budget,  setBudget]  = useS(120);
  const MEDIAN    = window.MEDIAN_SAVE||0.14;
  const PREM      = window.PREMIUM_UP||1.42;
  const sliderPct = ((budget-20)/(500-20))*100;
  const plusSave  = Math.round(budget*MEDIAN*PREM*100)/100;
  const freeSave  = Math.round(budget*MEDIAN*100)/100;
  const uplift    = Math.round((plusSave-freeSave)*100)/100;

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8, cursor:'pointer' }} onClick={()=>setSimOpen(v=>!v)}>
        <span style={{ fontSize:12, fontWeight:700, color:P.ink2, textTransform:'uppercase', letterSpacing:'0.07em' }}>Simulador de Subscrição</span>
        <span style={{ fontSize:12, fontWeight:700, color:P.primary }}>{simOpen?'▲':'▼'}</span>
      </div>
      {simOpen ? (
        <PCard style={{ padding:'18px 16px' }}>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:17, fontWeight:800, color:P.ink, letterSpacing:'-0.02em', lineHeight:1.2, marginBottom:4 }}>Queres ver se a subscrição compensa?</div>
            <div style={{ fontSize:13, color:P.ink2, lineHeight:1.45 }}>Faz a simulação. Diz-nos quanto gastas por mês em compras.</div>
          </div>
          <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:8 }}>
            <span style={{ fontSize:32, fontWeight:800, color:P.ink, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.03em' }}>{budget}</span>
            <span style={{ fontSize:15, fontWeight:700, color:P.ink2 }}>€/mês</span>
          </div>
          <input type="range" min="20" max="500" step="5" value={budget} onChange={e=>setBudget(Number(e.target.value))}
            style={{ width:'100%', height:5, borderRadius:100, marginBottom:20, background:`linear-gradient(90deg,${P.primary} ${sliderPct}%,${P.surface3} ${sliderPct}%)` }}/>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[
              { emoji:'🏷', title:'Marcas brancas', subtitle:'Poupança máxima', color:P.savings, bg:P.savingsBg, saving:Math.round(budget*0.50*100)/100, body:'Se não te importas de comprar marcas brancas, com o Plus consegues poupar até 50% do teu orçamento — ', savingLabel:true },
              { emoji:'🛒', title:'Marcas de referência', subtitle:'Poupança moderada', color:P.plus, bg:P.plusBg, saving:Math.round(budget*0.30*100)/100, body:'Se preferes marcas, ainda assim conseguimos reduzir a tua fatura até 30% — só por comprares nos sítios certos. ', savingLabel:true },
              { emoji:'🥗', title:'Comprador ocasional', subtitle:'OláSuper Saúde vale pela saúde', color:P.health, bg:P.healthBg, saving:null, body:'Se fazes compras ocasionalmente, o Plus pode não compensar pelo preço. Mas se te preocupas com o que comes, o OláSuper Saúde analisa os ingredientes e avisa-te dos que têm aditivos prejudiciais.', savingLabel:false },
            ].map(s => (
              <div key={s.title} style={{ background:s.bg, borderRadius:14, padding:'13px 14px', border:`1px solid ${s.color}25` }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                  <span style={{ fontSize:20 }}>{s.emoji}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13.5, fontWeight:800, color:s.color }}>{s.title}</div>
                    <div style={{ fontSize:11, color:P.ink3, fontWeight:600 }}>{s.subtitle}</div>
                  </div>
                  {s.saving!=null && (
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ fontSize:20, fontWeight:800, color:s.color, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em' }}>{euro(s.saving)}</div>
                      <div style={{ fontSize:10, color:P.ink3 }}>poupança estimada</div>
                    </div>
                  )}
                </div>
                <p style={{ margin:0, fontSize:12.5, color:P.ink2, lineHeight:1.55 }}>
                  {s.body}{s.savingLabel&&s.saving!=null&&<strong style={{color:s.color}}>poupas até {euro(s.saving)}/mês</strong>}
                </p>
              </div>
            ))}
          </div>
          <div style={{ marginTop:12, padding:'10px 12px', background:P.surface2, borderRadius:10, fontSize:12.5, color:P.ink2, lineHeight:1.5 }}>
            <SparkIco size={14} color={P.primary}/>&nbsp; Plus desbloqueia <strong style={{color:P.savings}}>+{euro(uplift)}/mês</strong> extra vs plano grátis
          </div>
        </PCard>
      ) : (
        <PCard style={{ padding:'12px 14px', display:'flex', alignItems:'center', gap:12, cursor:'pointer', boxShadow:'none', border:`1px solid ${P.line}` }} onClick={()=>setSimOpen(true)}>
          <SparkIco size={22} color={P.primary}/>
          <div>
            <div style={{ fontSize:13.5, fontWeight:700, color:P.ink }}>Queres ver se a subscrição compensa?</div>
            <div style={{ fontSize:12, color:P.ink3, marginTop:1 }}>Simula o teu ganho mensal →</div>
          </div>
        </PCard>
      )}
    </div>
  );
}

// ============ HOME SCREEN ============
function HomeV4_inner({ t=k=>k,  plan, onNewCart, cartCount, monthlySaved, district, onDistrictChange, followedStores, onToggleFollow, onUpgrade, onNav, onAdd }) {
  const [showNotif,setShowNotif]= useState(false);
  const [showLeague, setShowLeague] = useState(false);
  const [catDetail, setCatDetail] = useState(null);
  const [stockCat,  setStockCat]  = useState('todos');

  const sparks   = useMemo(() => buildSparks(district), [district]);
  const catWins  = useMemo(() => buildCatWinners(district), [district]);
  const localStores = useMemo(() => D4.getStoresForDistrict(district, null).filter(s => s.tipo!=='supermercado'), [district]);

  const unreadNotifs = D4.NOTIFICATIONS.filter(n => !n.read && (n.plan==='free' || plan!=='free')).length;
  const visibleNotifs = D4.NOTIFICATIONS.filter(n => n.plan==='free' || plan==='plus' || plan==='plus_health');

  const col = d => d>0.005 ? '#00C853' : d<-0.005 ? '#C0392B' : P.ink3;
  const distObj = D4.DISTRICTS.find(d => d.id===district) || D4.DISTRICTS[0];

  return (
    <div data-screen-label="Início — stock market + liga" style={{ paddingTop:54, height:'100%', display:'flex', flexDirection:'column' }}>
      {/* header */}
      <div style={{ padding:'12px 20px 0', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
        <div style={{ flex:1 }}>
          <p style={{ margin:0, fontSize:11, fontWeight:700, color:P.ink3, textTransform:'uppercase', letterSpacing:'0.09em' }}>8–14 jun 2026</p>
          <h1 style={{ margin:'2px 0 0', fontSize:22, fontWeight:800, color:P.ink, letterSpacing:'-0.025em', lineHeight:1.1 }}>Mercado de Poupança</h1>
        </div>
        {/* bell */}
        <button onClick={()=>setShowNotif(v=>!v)} style={{ position:'relative', width:38, height:38, borderRadius:11, border:`1px solid ${P.line}`, background:P.surface, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <BellIco size={19} color={P.ink2}/>
          {unreadNotifs>0 && <span style={{ position:'absolute', top:4, right:4, width:8, height:8, borderRadius:'50%', background:P.flash }}/>}
        </button>
      </div>

      {/* district pills — XTB style */}
      <div style={{ padding:'10px 20px 0', flexShrink:0 }}>
        <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:2, scrollbarWidth:'none' }}>
          {D4.DISTRICTS.map(d => (
            <button key={d.id} onClick={()=>onDistrictChange(d.id)} style={{ flexShrink:0, height:30, padding:'0 12px', border:'none', borderRadius:100, background:district===d.id?'#1A1A1A':'#F0F0F0', color:district===d.id?'#fff':P.ink2, fontSize:12, fontWeight:700, fontFamily:'inherit', cursor:'pointer', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:5, transition:'background 0.15s, color 0.15s' }}>
              {d.flag} {d.name}
            </button>
          ))}
        </div>
      </div>

      {/* notifications panel */}
      {showNotif && (
        <div style={{ margin:'10px 20px 0', background:P.surface, borderRadius:16, border:`1px solid ${P.line}`, padding:'12px 14px', boxShadow:P.shadowLift, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
            <span style={{ fontSize:13, fontWeight:800, color:P.ink }}>Notificações</span>
            <button onClick={()=>setShowNotif(false)} style={{ border:'none', background:'none', cursor:'pointer', color:P.ink3, fontSize:14, fontFamily:'inherit' }}>✕</button>
          </div>
          {visibleNotifs.length === 0
            ? <p style={{ fontSize:13, color:P.ink3, textAlign:'center', padding:'12px 0' }}>Sem notificações de momento.</p>
            : visibleNotifs.map(n => <NotifItem key={n.id} n={n}/>)
          }
          {plan==='free' && <p style={{ fontSize:11.5, color:P.ink3, marginTop:8, lineHeight:1.5 }}>⚡ Relâmpago para todos · 📊 Rankings semanais exclusivo Plus</p>}
        </div>
      )}

      <div style={{ flex:1, overflowY:'auto', padding:'14px 20px 20px' }}>

        {/* monthly savings row */}
        {monthlySaved > 0 && (
          <div style={{ display:'flex', gap:8, marginBottom:14 }}>
            <PCard style={{ flex:1, padding:'12px 14px', background:P.savingsBg, border:`1px solid ${P.line}`, boxShadow:'none', display:'flex', alignItems:'center', gap:10 }}>
              <WalletIco size={20} color={P.savings}/>
              <div>
                <div style={{ fontSize:11, color:P.ink3 }}>Poupado este mês</div>
                <div style={{ fontSize:18, fontWeight:800, color:P.savings, fontVariantNumeric:'tabular-nums' }}>{euro(monthlySaved)}</div>
              </div>
            </PCard>
            <PCard style={{ flex:1, padding:'12px 14px', boxShadow:'none', border:`1px solid ${P.line}`, display:'flex', alignItems:'center', gap:10, cursor:'pointer' }} onClick={()=>setShowLeague(v=>!v)}>
              <MapPinIco size={20} color={P.primary}/>
              <div>
                <div style={{ fontSize:11, color:P.ink3 }}>Liga · {distObj.flag} {distObj.name}</div>
                <div style={{ fontSize:13, fontWeight:700, color:P.ink }}>{showLeague?'▲ fechar':'▼ ver ranking'}</div>
              </div>
            </PCard>
          </div>
        )}

        {/* local stores league */}
        {showLeague && localStores.length > 0 && (
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:12, fontWeight:700, color:P.ink2, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>
              {distObj.flag} Lojas Locais em {distObj.name}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {localStores.map(s => (
                <PCard key={s.id} style={{ padding:'12px 14px', display:'flex', alignItems:'center', gap:12, boxShadow:'none', border:`1px solid ${P.line}` }}>
                  <StoreBadge id={s.id} size={34}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:P.ink }}>{s.name}</div>
                    <div style={{ fontSize:12, color:P.ink3, textTransform:'capitalize' }}>{s.tipo} · {s.categorias.filter(c=>c!=='all').join(', ')}</div>
                  </div>
                  <FollowButton storeId={s.id} followedStores={followedStores||{}} plan={plan} onToggle={onToggleFollow} onUpgrade={()=>onUpgrade('plus')} size="sm"/>
                </PCard>
              ))}
            </div>
          </div>
        )}
        {showLeague && localStores.length===0 && (
          <PCard style={{ padding:'14px 16px', marginBottom:14, boxShadow:'none', border:`1px solid ${P.line}`, textAlign:'center' }}>
            <p style={{ fontSize:13, color:P.ink3 }}>Em breve lojas locais em {distObj.name}. A começar por Lisboa.</p>
          </PCard>
        )}

        {/* stock list — XTB style */}
        <div style={{ marginBottom:14 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <span style={{ fontSize:12, fontWeight:700, color:P.ink2, textTransform:'uppercase', letterSpacing:'0.07em' }}>Performance · €/produto</span>
            <span style={{ fontSize:11, color:P.ink3 }}>vs pior loja · 7 dias</span>
          </div>
          {/* category filter pills — XTB style */}
          <div style={{ display:'flex', gap:5, overflowX:'auto', marginBottom:10, scrollbarWidth:'none', paddingBottom:2 }}>
            {[{id:'todos',name:'Todos'},...D4.CATEGORIES].map(cat=>(
              <button key={cat.id} onClick={()=>setStockCat(cat.id)} style={{ flexShrink:0, height:28, padding:'0 12px', border:'none', borderRadius:100, background:stockCat===cat.id?'#1A1A1A':'#F0F0F0', color:stockCat===cat.id?'#fff':'#6B6B6B', fontSize:12, fontWeight:700, fontFamily:'inherit', cursor:'pointer', whiteSpace:'nowrap', transition:'background 0.15s, color 0.15s' }}>
                {cat.glyph?`${cat.glyph} `:''}{cat.name}
              </button>
            ))}
          </div>
          {/* flat list — no card wrapper */}
          <div style={{ background:P.surface, borderRadius:16, border:`0.5px solid #E0E0E0`, overflow:'hidden' }}>
            {sparks.map((sm,i) => {
              const c = col(sm.delta);
              const isWin = i===0;
              const pct = sm.values[6]>0 ? ((sm.today - sm.values[6])/sm.values[6]*100) : 0;
              const pctStr = (pct>0?'+':'')+pct.toFixed(2).replace('.',',')+'%';
              return (
                <div key={sm.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom:i<sparks.length-1?'0.5px solid #E0E0E0':'none', background:'transparent' }}>
                  {/* rank */}
                  <span style={{ width:14, fontSize:11, fontWeight:800, color:isWin?'#00C853':P.ink3, textAlign:'center', flexShrink:0 }}>{i+1}</span>
                  {/* logo */}
                  <StoreBadge id={sm.id} size={34}/>
                  {/* name + type */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:isWin?800:500, color:P.ink, letterSpacing:'-0.01em' }}>{sm.name}</div>
                    <div style={{ fontSize:12, color:c, fontWeight:700, marginTop:1, fontVariantNumeric:'tabular-nums' }}>
                      {pct>0.05?<span style={{color:'#00C853'}}>{pctStr}</span>:pct<-0.05?<span style={{color:'#C0392B'}}>{pctStr}</span>:<span style={{color:P.ink3}}>→ estável</span>}
                    </div>
                  </div>
                  {/* sparkline */}
                  <P4Spark values={sm.values} color={c} width={56} height={28}/>
                  {/* price */}
                  <div style={{ textAlign:'right', minWidth:48, flexShrink:0 }}>
                    <div style={{ fontSize:14.5, fontWeight:800, color:P.ink, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em' }}>{euro(sm.today)}</div>
                    <div style={{ fontSize:11, color:c, fontWeight:700, fontVariantNumeric:'tabular-nums' }}>
                      {sm.delta>0.005?`+${sm.delta.toFixed(2).replace('.',',')}€`:sm.delta<-0.005?`${sm.delta.toFixed(2).replace('.',',')}€`:''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* category winners — top-3 preview + Liga button */}
        <div style={{ marginBottom:14 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
            <span style={{ fontSize:12, fontWeight:700, color:P.ink2, textTransform:'uppercase', letterSpacing:'0.07em' }}>Vencedor por Categoria</span>
            <button onClick={()=>onNav('liga')} style={{ height:26, padding:'0 11px', border:`1px solid ${P.primary}`, borderRadius:100, background:P.primarySoft, color:P.primaryText, fontSize:11.5, fontWeight:700, fontFamily:'inherit', cursor:'pointer' }}>Ver Liga →</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {catWins.slice(0,4).map(({ category, winner, saving, promoCount }) => {
              const allCatStores = D4.getStoresForDistrict(district, category.id);
              return (
              <PCard key={category.id} onClick={()=>setCatDetail({ category, winner, allCatStores })} style={{ padding:'12px 12px', boxShadow:'none', border:`1px solid ${P.line}`, cursor:'pointer', transition:'border-color 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor=P.primary}
                onMouseLeave={e=>e.currentTarget.style.borderColor=P.line}>
                <p style={{ margin:'0 0 8px', fontSize:10, fontWeight:700, color:P.ink3, textTransform:'uppercase', letterSpacing:'0.06em' }}>{category.glyph} {category.name}</p>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>  
                  <StoreBadge id={winner.id} size={28}/>
                  <div style={{ flex:1, minWidth:0 }}>  
                    <div style={{ fontSize:12.5, fontWeight:800, color:P.ink, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{winner.name}</div>
                    <div style={{ fontSize:11, color:P.savings, fontWeight:700 }}>−{euro(saving)}</div>
                  </div>
                  <span style={{ fontSize:14, color:P.ink3, flexShrink:0 }}>›</span>
                </div>
                {promoCount>0&&<PPill color={P.promo} bg={P.promoBg} style={{marginTop:6,fontSize:10}}><TagIco size={9} color={P.promo}/> {promoCount} promo</PPill>}
              </PCard>
              );
            })}
          </div>
          <button onClick={()=>onNav('liga')} style={{ marginTop:10, width:'100%', height:36, border:`1px solid ${P.line}`, borderRadius:12, background:'transparent', color:P.ink2, fontSize:13, fontWeight:700, fontFamily:'inherit', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
            <MapPinIco size={15} color={P.ink3}/> Ver Liga completa por distrito
          </button>
        </div>

        {/* simulator */}
        <SimuladorSubscricao/>

      </div>

      {/* CTA fixo acima da tab bar */}
      <div style={{ flexShrink:0, padding:'10px 20px 12px', background:P.surface, borderTop:`1px solid ${P.lineSoft}` }}>
        <PBtn onClick={onNewCart} color={P.primary}>
          <BasketIco size={18} color="#fff"/>
          {cartCount>0?`Continuar carrinho (${cartCount})`:'Criar carrinho'}
        </PBtn>
        {plan==='free'&&<p style={{ textAlign:'center', fontSize:11.5, color:P.ink3, margin:'6px 0 0' }}>1 análise/mês no plano grátis</p>}
      </div>
    </div>
  );
}

function HomeV4(props) {
  const { t } = useI18n();
  return <HomeV4_inner {...props} t={t}/>;
}

Object.assign(window, { HomeV4, SimuladorSubscricao, MEDIAN_SAVE, PREMIUM_UP });
})();
