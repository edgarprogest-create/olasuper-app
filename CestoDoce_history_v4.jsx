// OláSuper_history_v4.jsx — Histórico de análises
(function(){
const { useState, useMemo } = React;

const SK_HIST = 'cd4_history';

const HISTORICO_DEMO = [
  {
    id: '1',
    data: '13 Jun 2026', hora: '10:58',
    total_artigos: 13, lojas_comparadas: 8,
    melhor_loja: 'Talho Campo Grande',
    total: 2.89, poupanca: 34.68,
    produtos: [
      { nome:'Frango Inteiro 1kg',   preco:1.49, loja:'Talho Campo Grande' },
      { nome:'Tomates 1kg',          preco:0.59, loja:'Talho Campo Grande' },
      { nome:'Leite Meio-gordo 1L',  preco:0.69, loja:'Talho Campo Grande' },
      { nome:'Iogurte Natural ×4',   preco:0.99, loja:'Talho Campo Grande' },
      { nome:'Pão de Forma',         preco:1.29, loja:'Talho Campo Grande' },
      { nome:'Ovos ×12',             preco:2.49, loja:'Talho Campo Grande' },
    ],
  },
  {
    id: '2',
    data: '06 Jun 2026', hora: '15:23',
    total_artigos: 8, lojas_comparadas: 6,
    melhor_loja: 'Lidl',
    total: 18.45, poupanca: 12.30,
    produtos: [
      { nome:'Detergente Roupa 3L',  preco:4.99, loja:'Lidl' },
      { nome:'Pasta de Dentes',      preco:1.49, loja:'Lidl' },
      { nome:'Azeite 750ml',         preco:5.99, loja:'Lidl' },
      { nome:'Arroz 1kg',            preco:0.99, loja:'Lidl' },
      { nome:'Café 250g',            preco:2.79, loja:'Lidl' },
      { nome:'Água 6×1.5L',         preco:2.20, loja:'Lidl' },
    ],
  },
];

function loadHistory() {
  try {
    const raw = localStorage.getItem(SK_HIST);
    const saved = raw ? JSON.parse(raw) : [];
    // merge demo + saved, no duplicates
    const ids = new Set(saved.map(h=>h.id));
    return [...saved, ...HISTORICO_DEMO.filter(d=>!ids.has(d.id))];
  } catch { return HISTORICO_DEMO; }
}

// ---- ProductsBottomSheet ----
function ProductsSheet({ entry, onClose, onRepeat }) {
  return (
    <div style={{ position:'absolute', inset:0, zIndex:200, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'flex-end', animation:'cdFadeIn 0.2s' }}
      onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ width:'100%', background:'#fff', borderRadius:'20px 20px 0 0', maxHeight:'70%', display:'flex', flexDirection:'column' }}>
        <div style={{ width:38, height:4, borderRadius:100, background:'#E0E0E0', margin:'12px auto 8px' }}/>
        <div style={{ padding:'0 20px 8px', borderBottom:`1px solid ${P.lineSoft}` }}>
          <div style={{ fontSize:15, fontWeight:800, color:P.ink }}>Carrinho · {entry.data}</div>
          <div style={{ fontSize:12, color:P.ink3, marginTop:2 }}>{entry.total_artigos} artigos · Total {euro(entry.total)}</div>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'8px 0' }}>
          {entry.produtos.map((p,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 20px', borderBottom:`1px solid ${P.lineSoft}`, fontSize:13 }}>
              <span style={{ flex:1, color:P.ink }}>{p.nome}</span>
              <span style={{ fontSize:11, color:P.ink3 }}>{p.loja}</span>
              <span style={{ fontWeight:700, color:P.ink, fontVariantNumeric:'tabular-nums' }}>{euro(p.preco)}</span>
            </div>
          ))}
        </div>
        <div style={{ padding:'12px 20px 20px' }}>
          <PBtn color={P.primary} onClick={()=>{ onRepeat(entry); onClose(); }}>
            ↺ Repetir este carrinho
          </PBtn>
        </div>
      </div>
    </div>
  );
}

// ---- HistoryScreen ----
function HistoryScreen({ onBack, onRepeatCart }) {
  const history = useMemo(loadHistory, []);
  const [selected, setSelected] = useState(null); // index into history
  const [productsEntry, setProductsEntry] = useState(null);

  if (selected !== null) {
    const entry = history[selected];
    return (
      <div data-screen-label="Análise Histórico" style={{ paddingTop:54, height:'100%', display:'flex', flexDirection:'column' }}>
        <PHeader title={entry.data} subtitle={`${entry.total_artigos} artigos · ${entry.lojas_comparadas} lojas`}
          onBack={()=>setSelected(null)}
          right={
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={()=>selected>0&&setSelected(selected-1)} disabled={selected===0}
                style={{ border:'none', background:'none', cursor:selected>0?'pointer':'default', color:selected>0?P.primary:P.line, fontSize:18, lineHeight:1, padding:'0 4px', fontFamily:'inherit' }}>←</button>
              <button onClick={()=>selected<history.length-1&&setSelected(selected+1)} disabled={selected>=history.length-1}
                style={{ border:'none', background:'none', cursor:selected<history.length-1?'pointer':'default', color:selected<history.length-1?P.primary:P.line, fontSize:18, lineHeight:1, padding:'0 4px', fontFamily:'inherit' }}>→</button>
            </div>
          }
        />
        <div style={{ flex:1, overflowY:'auto', padding:'12px 20px 80px' }}>

          {/* hero */}
          <div style={{ background:'#F0FBE8', borderRadius:18, padding:'20px', border:'1px solid #C8E6A0', marginBottom:12 }}>
            <div style={{ fontSize:13, color:P.ink3, marginBottom:4 }}>Melhor opção</div>
            <div style={{ fontSize:22, fontWeight:800, color:P.ink, letterSpacing:'-0.025em', marginBottom:8 }}>{entry.melhor_loja}</div>
            <div style={{ display:'flex', gap:20 }}>
              <div>
                <div style={{ fontSize:11, color:P.ink3, textTransform:'uppercase', letterSpacing:'0.05em' }}>Total</div>
                <div style={{ fontSize:20, fontWeight:800, color:P.ink, fontVariantNumeric:'tabular-nums' }}>{euro(entry.total)}</div>
              </div>
              {entry.poupanca > 0 && (
                <div>
                  <div style={{ fontSize:11, color:P.ink3, textTransform:'uppercase', letterSpacing:'0.05em' }}>Poupança</div>
                  <div style={{ fontSize:20, fontWeight:800, color:'#2E7D32', fontVariantNumeric:'tabular-nums' }}>{euro(entry.poupanca)}</div>
                </div>
              )}
            </div>
          </div>

          {/* product preview */}
          {entry.produtos.length > 0 && (
            <PCard style={{ padding:'14px 16px', marginBottom:12 }}>
              <div style={{ fontSize:11, fontWeight:700, color:P.ink3, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>Produtos</div>
              {entry.produtos.slice(0,4).map((p,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 0', borderBottom:i<3&&i<entry.produtos.length-1?`1px solid ${P.lineSoft}`:'none', fontSize:13 }}>
                  <span style={{ flex:1, color:P.ink }}>{p.nome}</span>
                  <span style={{ fontWeight:600, color:P.ink2, fontVariantNumeric:'tabular-nums' }}>{euro(p.preco)}</span>
                </div>
              ))}
              {entry.produtos.length > 4 && (
                <button onClick={()=>setProductsEntry(entry)} style={{ border:'none', background:'none', cursor:'pointer', color:P.primary, fontSize:13, fontWeight:700, fontFamily:'inherit', marginTop:6, padding:0 }}>
                  + Ver todos os {entry.total_artigos} produtos →
                </button>
              )}
            </PCard>
          )}

          <div style={{ display:'flex', gap:10 }}>
            <PBtn color={P.primary} onClick={()=>setProductsEntry(entry)} style={{ flex:1 }}>
              Ver produtos
            </PBtn>
            <PGhost onClick={()=>{ onRepeatCart(entry); onBack(); }} style={{ flex:1 }}>
              ↺ Repetir
            </PGhost>
          </div>
        </div>

        {productsEntry && <ProductsSheet entry={productsEntry} onClose={()=>setProductsEntry(null)} onRepeat={e=>{onRepeatCart(e);onBack();}}/>}
      </div>
    );
  }

  return (
    <div data-screen-label="Histórico" style={{ paddingTop:54, height:'100%', display:'flex', flexDirection:'column' }}>
      <PHeader title="Histórico" subtitle={`${history.length} análise${history.length!==1?'s':''}`} onBack={onBack}/>
      <div style={{ flex:1, overflowY:'auto', padding:'12px 20px 80px' }}>
        {history.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 28px', color:P.ink3 }}>
            <div style={{ fontSize:36, marginBottom:12 }}>📋</div>
            <p style={{ fontSize:14, lineHeight:1.55, margin:0 }}>Ainda sem histórico.<br/>Faz a primeira análise para começar.</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {history.map((entry, idx) => (
              <PCard key={entry.id} style={{ padding:'14px 16px' }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, color:P.ink3, marginBottom:2 }}>📅 {entry.data} · {entry.hora}</div>
                    <div style={{ fontSize:13.5, fontWeight:800, color:P.ink }}>{entry.melhor_loja}</div>
                    <div style={{ fontSize:12, color:P.ink3, marginTop:2 }}>{entry.total_artigos} artigos · {entry.lojas_comparadas} lojas comparadas</div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontSize:16, fontWeight:800, color:P.ink, fontVariantNumeric:'tabular-nums' }}>{euro(entry.total)}</div>
                    {entry.poupanca>0 && <div style={{ fontSize:12, color:'#2E7D32', fontWeight:700 }}>-{euro(entry.poupanca)} poupança</div>}
                  </div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={()=>setSelected(idx)} style={{ flex:1, height:36, borderRadius:10, border:`1px solid ${P.primary}`, background:'transparent', color:P.primary, fontSize:13, fontWeight:700, fontFamily:'inherit', cursor:'pointer' }}>Ver análise</button>
                  <button onClick={()=>setProductsEntry(entry)} style={{ flex:1, height:36, borderRadius:10, border:`1px solid ${P.line}`, background:'transparent', color:P.ink2, fontSize:13, fontWeight:700, fontFamily:'inherit', cursor:'pointer' }}>Ver produtos</button>
                </div>
              </PCard>
            ))}
          </div>
        )}
      </div>
      {productsEntry && <ProductsSheet entry={productsEntry} onClose={()=>setProductsEntry(null)} onRepeat={e=>{onRepeatCart(e);onBack();}}/>}
    </div>
  );
}

Object.assign(window, { HistoryScreen, loadHistory, SK_HIST });
})();
