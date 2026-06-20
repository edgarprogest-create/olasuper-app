// OláSuper_data_v4.js — JSON v4: lojas locais, distrito, nutri, flash promos, 3-tier plans
window.OláSuperDataV4 = (function () {

  // ---- Planos ----
  const PLANS = {
    free:        { id:'free',       label:'Grátis',       price:0,    priceLabel:'Grátis',    color:'#6B7280' },
    plus:        { id:'plus',       label:'OláSuper Plus', price:1.39, priceLabel:'1,39 €/mês', color:'#059669' },
    plus_health: { id:'plus_health',label:'OláSuper Saúde',  price:2.49, priceLabel:'2,49 €/mês', color:'#7C3AED' },
  };

  const PLAN_FEATURES = {
    free:        ['1 análise/mês', `30 produtos no catálogo`, 'Notificações relâmpago'],
    plus:        ['Análises ilimitadas', 'Catálogo completo', 'Ranking semanal (notif.)', 'Notificações relâmpago', 'Liga por Distrito'],
    plus_health: ['Scanner de ingredientes', 'Relatório nutricional', 'Ranking de saúde por loja'],
  };

  // ---- Distritos ----
  const DISTRICTS = [
    { id:'aveiro',          name:'Aveiro',          flag:'🏙️' },
    { id:'beja',            name:'Beja',             flag:'🌾' },
    { id:'braga',           name:'Braga',            flag:'⛪' },
    { id:'braganca',        name:'Bragança',        flag:'🏔️' },
    { id:'castelo-branco',  name:'Castelo Branco',   flag:'🏰' },
    { id:'coimbra',         name:'Coimbra',          flag:'🎓' },
    { id:'evora',           name:'Évora',           flag:'🏛️' },
    { id:'faro',            name:'Faro',             flag:'☀️' },
    { id:'guarda',          name:'Guarda',           flag:'🏔️' },
    { id:'leiria',          name:'Leiria',           flag:'🏰' },
    { id:'lisboa',          name:'Lisboa',           flag:'🌉' },
    { id:'portalegre',      name:'Portalegre',       flag:'🌿' },
    { id:'porto',           name:'Porto',            flag:'🍷' },
    { id:'santarem',        name:'Santarém',        flag:'🌳' },
    { id:'setubal',         name:'Setúbal',         flag:'⚓' },
    { id:'viana-do-castelo',name:'Viana do Castelo', flag:'🎤' },
    { id:'vila-real',       name:'Vila Real',        flag:'🍇' },
    { id:'viseu',           name:'Viseu',            flag:'🏖️' },
  ];
  // ---- Lojas (supermercados + locais) ----
  // tipo: supermercado | peixaria | talho | mercearia
  const STORES = [
    // Grandes superfícies (todas nacionais)
    { id:'continente',   name:'Continente',   short:'Cont.', tipo:'supermercado', distritos:['all'], categorias:['all'], hue:20  },
    { id:'pingodoce',    name:'Pingo Doce',   short:'P.D.',  tipo:'supermercado', distritos:['all'], categorias:['all'], hue:145 },
    { id:'lidl',         name:'Lidl',         short:'Lidl',  tipo:'supermercado', distritos:['all'], categorias:['all'], hue:225 },
    { id:'aldi',         name:'Aldi',         short:'Aldi',  tipo:'supermercado', distritos:['all'], categorias:['all'], hue:200 },
    { id:'mercadona',    name:'Mercadona',     short:'Merc.', tipo:'supermercado', distritos:['all'], categorias:['all'], hue:160 },
    { id:'intermarche',  name:'Intermarché',  short:'Inter', tipo:'supermercado', distritos:['all'], categorias:['all'], hue:10  },
    { id:'minipreco',    name:'Minipreço',    short:'Mini',  tipo:'supermercado', distritos:['all'], categorias:['all'], hue:50  },
    { id:'froiz',        name:'Froiz',        short:'Froiz', tipo:'supermercado', distritos:['all'], categorias:['all'], hue:130 },
    { id:'spar',         name:'Spar',         short:'Spar',  tipo:'supermercado', distritos:['all'], categorias:['all'], hue:30  },
    { id:'leclerc',      name:'E.Leclerc',    short:'Lec.', tipo:'supermercado', distritos:['all'], categorias:['all'], hue:220 },
  ];

  const STORE_BY_ID = {};
  STORES.forEach(s => STORE_BY_ID[s.id] = s);

  // ---- Categorias ----
  const CATEGORIES = [
    { id:'carnes',     name:'Carnes & Peixe',    glyph:'🥩' },
    { id:'frescos',    name:'Frescos',            glyph:'🥬' },
    { id:'laticinios', name:'Laticínios',         glyph:'🥛' },
    { id:'bebidas',    name:'Bebidas',            glyph:'💧' },
    { id:'higiene',    name:'Higiene & Limpeza',  glyph:'🧴' },
    { id:'congelados', name:'Congelados',         glyph:'❄️' },
  ];

  // ---- Produtos (estrutura v4 com nutri_score, nova, promo_ate) ----
  const PRODUCTS = [
    // CARNES & PEIXE
    { id:'frango_inteiro', name:'Frango Inteiro', unit:'unid.', category:'carnes', nutri_score:'B', nova:2, glyph:'🍗',
      prices:{ continente:{base:3.29,promo:null}, pingodoce:{base:3.29,promo:1.49,promo_ate:'2026-06-14'}, lidl:{base:2.59,promo:null}, aldi:{base:2.79,promo:null}, mercadona:{base:2.99,promo:null}, intermarche:{base:3.19,promo:null}, minipreco:{base:2.79,promo:null}, froiz:{base:2.69,promo:null}, spar:{base:2.99,promo:null}, leclerc:{base:2.59,promo:null} }},
    { id:'carne_picada', name:'Carne Picada 500g', unit:'emb.', category:'carnes', nutri_score:'C', nova:3, glyph:'🥩',
      prices:{ continente:{base:3.99,promo:null}, pingodoce:{base:3.79,promo:null}, lidl:{base:3.29,promo:2.49,promo_ate:'2026-06-15'}, aldi:{base:3.19,promo:null}, mercadona:{base:3.49,promo:null}, intermarche:{base:3.89,promo:null}, minipreco:{base:3.49,promo:null}, froiz:{base:3.39,promo:null}, spar:{base:3.69,promo:null}, leclerc:{base:3.29,promo:null} }},
    { id:'pescada', name:'Pescada Congelada 700g', unit:'emb.', category:'carnes', nutri_score:'A', nova:1, glyph:'🐟',
      prices:{ continente:{base:4.49,promo:null}, pingodoce:{base:4.29,promo:null}, lidl:{base:3.59,promo:null}, aldi:{base:3.49,promo:null}, mercadona:{base:3.99,promo:null}, intermarche:{base:4.29,promo:null}, minipreco:{base:3.99,promo:null}, froiz:{base:3.89,promo:null}, spar:{base:4.19,promo:null}, leclerc:{base:3.79,promo:null} }},
    { id:'salmao_fresco', name:'Salmão Fresco 300g', unit:'emb.', category:'carnes', nutri_score:'A', nova:1, glyph:'🍣',
      prices:{ continente:{base:6.99,promo:null}, pingodoce:{base:6.49,promo:null}, lidl:{base:5.99,promo:null}, aldi:{base:5.89,promo:null}, mercadona:{base:6.29,promo:null}, intermarche:{base:6.79,promo:5.49,promo_ate:'2026-06-13'}, minipreco:{base:6.49,promo:null}, froiz:{base:6.19,promo:null}, spar:{base:6.79,promo:null}, leclerc:{base:5.99,promo:null} }},
    // FRESCOS
    { id:'tomates', name:'Tomates 1kg', unit:'kg', category:'frescos', nutri_score:'A', nova:1, glyph:'🍅',
      prices:{ continente:{base:1.99,promo:null}, pingodoce:{base:1.99,promo:0.59,promo_ate:'2026-06-14'}, lidl:{base:1.49,promo:null}, aldi:{base:1.59,promo:null}, mercadona:{base:1.69,promo:null}, intermarche:{base:1.89,promo:null}, minipreco:{base:1.59,promo:null}, froiz:{base:1.49,promo:null}, spar:{base:1.79,promo:null}, leclerc:{base:1.39,promo:null} }},
    { id:'alface', name:'Alface Iceberg', unit:'unid.', category:'frescos', nutri_score:'A', nova:1, glyph:'🥬',
      prices:{ continente:{base:0.99,promo:null}, pingodoce:{base:0.99,promo:0.29,promo_ate:'2026-06-14'}, lidl:{base:0.79,promo:null}, aldi:{base:0.79,promo:null}, mercadona:{base:0.89,promo:null}, intermarche:{base:0.95,promo:null}, minipreco:{base:0.89,promo:null}, froiz:{base:0.79,promo:null}, spar:{base:0.99,promo:null}, leclerc:{base:0.75,promo:null} }},
    { id:'laranjas', name:'Laranjas Valencia 1kg', unit:'kg', category:'frescos', nutri_score:'A', nova:1, glyph:'🍊',
      prices:{ continente:{base:1.99,promo:null}, pingodoce:{base:1.99,promo:0.59,promo_ate:'2026-06-14'}, lidl:{base:1.39,promo:null}, aldi:{base:1.29,promo:null}, mercadona:{base:1.59,promo:null}, intermarche:{base:1.79,promo:null}, minipreco:{base:1.69,promo:null}, froiz:{base:1.49,promo:null}, spar:{base:1.89,promo:null}, leclerc:{base:1.39,promo:null} }},
    { id:'bananas', name:'Bananas 1kg', unit:'kg', category:'frescos', nutri_score:'A', nova:1, glyph:'🍌',
      prices:{ continente:{base:1.49,promo:null}, pingodoce:{base:1.39,promo:null}, lidl:{base:1.09,promo:null}, aldi:{base:0.99,promo:null}, mercadona:{base:1.19,promo:null}, intermarche:{base:1.35,promo:null}, minipreco:{base:1.19,promo:null}, froiz:{base:1.09,promo:null}, spar:{base:1.29,promo:null}, leclerc:{base:0.99,promo:null} }},
    // LATICÍNIOS
    { id:'leite_uht', name:'Leite UHT 1L', unit:'unid.', category:'laticinios', nutri_score:'B', nova:2, glyph:'🥛',
      prices:{ continente:{base:1.09,promo:null}, pingodoce:{base:1.05,promo:null}, lidl:{base:0.85,promo:null}, aldi:{base:0.82,promo:null}, mercadona:{base:0.95,promo:null}, intermarche:{base:1.00,promo:null}, minipreco:{base:0.95,promo:null}, froiz:{base:0.89,promo:null}, spar:{base:1.05,promo:null}, leclerc:{base:0.85,promo:null} }},
    { id:'iogurte_grego', name:'Iogurte Grego 4×150g', unit:'pack', category:'laticinios', nutri_score:'B', nova:2, glyph:'🍶',
      prices:{ continente:{base:2.49,promo:null}, pingodoce:{base:2.29,promo:null}, lidl:{base:1.89,promo:1.19,promo_ate:'2026-06-15'}, aldi:{base:1.79,promo:null}, mercadona:{base:2.09,promo:null}, intermarche:{base:2.39,promo:null}, minipreco:{base:2.09,promo:null}, froiz:{base:1.99,promo:null}, spar:{base:2.29,promo:null}, leclerc:{base:1.89,promo:null} }},
    { id:'queijo_flamengo', name:'Queijo Flamengo 400g', unit:'emb.', category:'laticinios', nutri_score:'C', nova:3, glyph:'🧀',
      prices:{ continente:{base:3.49,promo:null}, pingodoce:{base:3.29,promo:null}, lidl:{base:2.79,promo:null}, aldi:{base:2.69,promo:null}, mercadona:{base:3.09,promo:null}, intermarche:{base:3.39,promo:null}, minipreco:{base:3.19,promo:null}, froiz:{base:2.99,promo:null}, spar:{base:3.39,promo:null}, leclerc:{base:2.89,promo:null} }},
    { id:'manteiga', name:'Manteiga sem Sal 250g', unit:'emb.', category:'laticinios', nutri_score:'D', nova:3, glyph:'🧈',
      prices:{ continente:{base:2.99,promo:null}, pingodoce:{base:2.79,promo:null}, lidl:{base:2.39,promo:null}, aldi:{base:1.59,promo:null,promo_ate:'2026-06-15'}, mercadona:{base:2.59,promo:null}, intermarche:{base:2.89,promo:null}, minipreco:{base:2.49,promo:null}, froiz:{base:2.39,promo:null}, spar:{base:2.79,promo:null}, leclerc:{base:2.29,promo:null} }},
    // BEBIDAS
    { id:'agua_6pack', name:'Água 1.5L pack 6', unit:'pack', category:'bebidas', nutri_score:'A', nova:1, glyph:'💧',
      prices:{ continente:{base:2.49,promo:null}, pingodoce:{base:2.29,promo:null}, lidl:{base:1.99,promo:null}, aldi:{base:1.89,promo:null}, mercadona:{base:1.39,promo:null,promo_ate:'2026-06-14'}, intermarche:{base:2.39,promo:null}, minipreco:{base:1.89,promo:null}, froiz:{base:1.79,promo:null}, spar:{base:1.99,promo:null}, leclerc:{base:1.69,promo:null} }},
    { id:'sumo_laranja', name:'Sumo Laranja 1L', unit:'unid.', category:'bebidas', nutri_score:'C', nova:3, glyph:'🧃',
      prices:{ continente:{base:2.49,promo:null}, pingodoce:{base:1.19,promo:null,promo_ate:'2026-06-14'}, lidl:{base:1.89,promo:null}, aldi:{base:1.79,promo:null}, mercadona:{base:2.09,promo:null}, intermarche:{base:2.29,promo:null}, minipreco:{base:1.99,promo:null}, froiz:{base:1.89,promo:null}, spar:{base:2.19,promo:null}, leclerc:{base:1.79,promo:null} }},
    { id:'cerveja_6pack', name:'Cerveja pack 6×33cl', unit:'pack', category:'bebidas', nutri_score:'D', nova:4, glyph:'🍺',
      prices:{ continente:{base:4.99,promo:null}, pingodoce:{base:4.79,promo:null}, lidl:{base:3.99,promo:null}, aldi:{base:3.89,promo:null}, mercadona:{base:4.29,promo:null}, intermarche:{base:4.69,promo:null}, minipreco:{base:4.49,promo:null}, froiz:{base:4.29,promo:null}, spar:{base:4.69,promo:null}, leclerc:{base:3.99,promo:null} }},
    // HIGIENE
    { id:'champo', name:'Champô 400ml', unit:'unid.', category:'higiene', nutri_score:null, nova:null, glyph:'🧴',
      prices:{ continente:{base:3.99,promo:null}, pingodoce:{base:3.79,promo:null}, lidl:{base:2.99,promo:null}, aldi:{base:2.89,promo:null}, mercadona:{base:3.29,promo:null}, intermarche:{base:3.69,promo:null}, minipreco:{base:3.49,promo:null}, froiz:{base:3.29,promo:null}, spar:{base:3.79,promo:null}, leclerc:{base:2.99,promo:null} }},
    { id:'gel_banho', name:'Gel de Banho 500ml', unit:'unid.', category:'higiene', nutri_score:null, nova:null, glyph:'🫧',
      prices:{ continente:{base:1.99,promo:null,promo_ate:'2026-06-14'}, pingodoce:{base:2.79,promo:null}, lidl:{base:1.99,promo:null}, aldi:{base:1.89,promo:null}, mercadona:{base:2.29,promo:null}, intermarche:{base:2.69,promo:null}, minipreco:{base:2.19,promo:null}, froiz:{base:1.99,promo:null}, spar:{base:2.39,promo:null}, leclerc:{base:1.89,promo:null} }},
    { id:'detergente_roupa', name:'Detergente Roupa 30 doses', unit:'unid.', category:'higiene', nutri_score:null, nova:null, glyph:'🧺',
      prices:{ continente:{base:8.99,promo:null}, pingodoce:{base:8.49,promo:null}, lidl:{base:6.99,promo:null}, aldi:{base:4.79,promo:null,promo_ate:'2026-06-15'}, mercadona:{base:7.49,promo:null}, intermarche:{base:8.29,promo:null}, minipreco:{base:7.99,promo:null}, froiz:{base:7.49,promo:null}, spar:{base:8.49,promo:null}, leclerc:{base:6.99,promo:null} }},
    // CONGELADOS
    { id:'ervilhas', name:'Ervilhas Congeladas 1kg', unit:'emb.', category:'congelados', nutri_score:'A', nova:1, glyph:'🟢',
      prices:{ continente:{base:1.99,promo:null}, pingodoce:{base:1.89,promo:null}, lidl:{base:1.49,promo:null}, aldi:{base:1.39,promo:null}, mercadona:{base:1.69,promo:null}, intermarche:{base:1.89,promo:null}, minipreco:{base:1.59,promo:null}, froiz:{base:1.49,promo:null}, spar:{base:1.79,promo:null}, leclerc:{base:1.39,promo:null} }},
    { id:'pizza_congelada', name:'Pizza Ristorante 355g', unit:'unid.', category:'congelados', nutri_score:'D', nova:4, glyph:'🍕',
      prices:{ continente:{base:4.99,promo:null}, pingodoce:{base:4.79,promo:null}, lidl:{base:2.49,promo:null,promo_ate:'2026-06-15'}, aldi:{base:3.29,promo:null}, mercadona:{base:3.99,promo:null}, intermarche:{base:4.59,promo:null}, minipreco:{base:3.79,promo:null}, froiz:{base:3.59,promo:null}, spar:{base:3.99,promo:null}, leclerc:{base:3.49,promo:null} }},
    { id:'batata_frita', name:'Batatas Fritas 1kg', unit:'emb.', category:'congelados', nutri_score:'C', nova:4, glyph:'🍟',
      prices:{ continente:{base:2.49,promo:null}, pingodoce:{base:2.29,promo:null}, lidl:{base:1.79,promo:null}, aldi:{base:1.69,promo:null}, mercadona:{base:2.09,promo:null}, intermarche:{base:2.39,promo:null}, minipreco:{base:1.99,promo:null}, froiz:{base:1.89,promo:null}, spar:{base:2.19,promo:null}, leclerc:{base:1.79,promo:null} }},
  ];

  const PRODUCT_BY_ID = {};
  PRODUCTS.forEach(p => PRODUCT_BY_ID[p.id] = p);

  // ---- Folhetos semanais ----
  const FLYERS = [
    { id:'fl_frango', category:'carnes', store:'pingodoce', product:'Frango do Campo Inteiro', detail:'unid. ≈1,2kg', normalPrice:3.29, promoPrice:1.49, savingPct:55, validUntil:'14 jun', glyph:'🍗', highlight:true, relampago:false },
    { id:'fl_tomate', category:'frescos', store:'pingodoce', product:'Tomate Rama', detail:'1 kg', normalPrice:1.99, promoPrice:0.59, savingPct:70, validUntil:'14 jun', glyph:'🍅', highlight:true, relampago:false },
    { id:'fl_laranja', category:'frescos', store:'pingodoce', product:'Laranjas Valencia', detail:'1 kg', normalPrice:1.99, promoPrice:0.59, savingPct:70, validUntil:'14 jun', glyph:'🍊', highlight:false, relampago:false },
    { id:'fl_picada', category:'carnes', store:'lidl', product:'Carne Picada Novilho', detail:'500 g', normalPrice:3.99, promoPrice:2.49, savingPct:38, validUntil:'15 jun', glyph:'🥩', highlight:false, relampago:false },
    { id:'fl_pizza', category:'congelados', store:'lidl', product:'Pizza Ristorante', detail:'355 g', normalPrice:4.99, promoPrice:2.49, savingPct:50, validUntil:'15 jun', glyph:'🍕', highlight:true, relampago:false },
    { id:'fl_iogurte', category:'laticinios', store:'lidl', product:'Iogurte Grego Natural', detail:'4×150g', normalPrice:2.29, promoPrice:1.19, savingPct:48, validUntil:'15 jun', glyph:'🍶', highlight:true, relampago:false },
    { id:'fl_manteiga', category:'laticinios', store:'aldi', product:'Manteiga sem Sal', detail:'250 g', normalPrice:2.99, promoPrice:1.59, savingPct:47, validUntil:'15 jun', glyph:'🧈', highlight:false, relampago:false },
    { id:'fl_detergente', category:'higiene', store:'aldi', product:'Detergente Roupa 30 doses', detail:'30 doses', normalPrice:8.99, promoPrice:4.79, savingPct:47, validUntil:'15 jun', glyph:'🧺', highlight:false, relampago:false },
    { id:'fl_agua', category:'bebidas', store:'mercadona', product:'Água 1,5L pack 6', detail:'pack 6', normalPrice:2.49, promoPrice:1.39, savingPct:44, validUntil:'14 jun', glyph:'💧', highlight:true, relampago:true },
    { id:'fl_sumo', category:'bebidas', store:'pingodoce', product:'Compal Frutos Tropicais', detail:'1 L', normalPrice:2.49, promoPrice:1.19, savingPct:52, validUntil:'14 jun', glyph:'🧃', highlight:false, relampago:true },
    { id:'fl_salmao', category:'carnes', store:'intermarche', product:'Salmão Fumado', detail:'100 g', normalPrice:3.49, promoPrice:1.99, savingPct:43, validUntil:'13 jun', glyph:'🐟', highlight:false, relampago:false },
    { id:'fl_gel', category:'higiene', store:'continente', product:'Dove Shower Gel', detail:'500 ml', normalPrice:3.99, promoPrice:1.99, savingPct:50, validUntil:'14 jun', glyph:'🧴', highlight:true, relampago:false },
  ];

  // ---- Notificações ----
  const NOTIFICATIONS = [
    { id:'n1', type:'ranking', title:'Pingo Doce sobe no ranking', body:'Pingo Doce ultrapassa Lidl nos Frescos e fica em 2.ª posição — promoções nos legumes até domingo.', time:'há 2h', read:false, plan:'plus' },
    { id:'n2', type:'relampago', title:'⚡ Relâmpago · Mercadona', body:'Pack de 6 águas a 1,39€ — menos 44%. Válido só hoje!', time:'há 30min', read:false, plan:'free' },
    { id:'n3', type:'relampago', title:'⚡ Relâmpago · Pingo Doce', body:'Compal Frutos Tropicais 1L a 1,19€ — menos 52%. Até amanhã.', time:'há 1h', read:false, plan:'free' },
    { id:'n4', type:'ranking', title:'Aldi desce nos Laticínios', body:'Aldi perde 2 posições no ranking de Laticínios após subida de preços na manteiga e iogurtes.', time:'há 1 dia', read:true, plan:'plus' },
  ];

  // ---- Helpers ----
  function getPrice(p, storeId) {
    const d = p.prices[storeId];
    if (!d) return null;
    return d.promo != null ? d.promo : d.base;
  }

  function getStoresForDistrict(districtId, categoryId) {
    return STORES.filter(s => {
      const distOk = s.distritos.includes('all') || s.distritos.includes(districtId);
      const catOk  = !categoryId || s.categorias.includes('all') || s.categorias.includes(categoryId);
      return distOk && catOk;
    });
  }

  function compareCartV4(cartItems, districtId) {
    if (!cartItems || !cartItems.length) return null;
    const stores = getStoresForDistrict(districtId, null);
    const totals = {};
    stores.forEach(sm => {
      const t = cartItems.reduce((sum, item) => {
        const p = PRODUCT_BY_ID[item.productId];
        if (!p) return sum;
        const price = getPrice(p, sm.id);
        return price != null ? sum + price * item.qty : sum;
      }, 0);
      if (t > 0) totals[sm.id] = t;
    });
    const validStores = stores.filter(s => totals[s.id] != null);
    if (!validStores.length) return null;
    const sorted = validStores.slice().sort((a, b) => totals[a.id] - totals[b.id]);
    const bestSingle = sorted[0];
    const worstSingle = sorted[sorted.length - 1];
    const singleTotal = Math.round(totals[bestSingle.id] * 100) / 100;
    const worstTotal  = Math.round(totals[worstSingle.id] * 100) / 100;

    // optimal split (max 2 stores)
    const itemOptimal = cartItems.map(item => {
      const p = PRODUCT_BY_ID[item.productId];
      if (!p) return null;
      let best = bestSingle, bestPrice = getPrice(p, bestSingle.id) || Infinity;
      validStores.forEach(s => {
        const pr = getPrice(p, s.id);
        if (pr != null && pr < bestPrice) { best = s; bestPrice = pr; }
      });
      return { productId:item.productId, qty:item.qty, product:p, supermarket:best, unitPrice:bestPrice, isPromo:!!(p.prices[best.id]?.promo) };
    }).filter(Boolean);

    const groupMap = {};
    itemOptimal.forEach(it => {
      const sid = it.supermarket.id;
      if (!groupMap[sid]) groupMap[sid] = { supermarket:it.supermarket, items:[], subtotal:0 };
      groupMap[sid].items.push(it);
      groupMap[sid].subtotal += it.unitPrice * it.qty;
    });
    let groups = Object.values(groupMap).sort((a, b) => b.subtotal - a.subtotal);
    if (groups.length > 2) {
      const top2 = groups.slice(0, 2);
      groups.slice(2).forEach(g => g.items.forEach(it => {
        const tgt = top2.reduce((best, tg) => {
          const pa = getPrice(it.product, tg.supermarket.id) || Infinity;
          const pb = getPrice(it.product, best.supermarket.id) || Infinity;
          return pa < pb ? tg : best;
        });
        const pr = getPrice(it.product, tgt.supermarket.id) || it.unitPrice;
        tgt.items.push({ ...it, supermarket:tgt.supermarket, unitPrice:pr, isPromo:!!(it.product.prices[tgt.supermarket.id]?.promo) });
        tgt.subtotal += pr * it.qty;
      }));
      groups = top2;
    }
    groups = groups.map(g => ({ ...g, subtotal:Math.round(g.subtotal*100)/100 }));
    const splitTotal   = Math.round(groups.reduce((s, g) => s + g.subtotal, 0) * 100) / 100;
    const savings      = Math.round((singleTotal - splitTotal) * 100) / 100;
    const savingsPct   = singleTotal > 0 ? Math.round(savings / singleTotal * 1000) / 10 : 0;
    const shouldSplit  = groups.length > 1 && (savings > 2 || savingsPct > 3);

    // ---- Optimal: cheapest store per product across ALL stores (no limit) ----
    const optGroupMap = {};
    itemOptimal.forEach(it => {
      const sid = it.supermarket.id;
      if (!optGroupMap[sid]) optGroupMap[sid] = { supermarket:it.supermarket, items:[], subtotal:0 };
      optGroupMap[sid].items.push(it);
      optGroupMap[sid].subtotal += it.unitPrice * it.qty;
    });
    const optimalGroups = Object.values(optGroupMap)
      .sort((a,b) => b.subtotal - a.subtotal)
      .map(g => ({ ...g, subtotal:Math.round(g.subtotal*100)/100 }));
    const optimalTotal    = Math.round(optimalGroups.reduce((s,g)=>s+g.subtotal,0)*100)/100;
    const optimalSavings  = Math.round((worstTotal - optimalTotal)*100)/100;
    const optimalSavingsPct = worstTotal>0 ? Math.round(optimalSavings/worstTotal*1000)/10 : 0;

    return {
      singleTotal, splitTotal, savings, savingsPct,
      bestSingle, worstSingle, worstSingleTotal:worstTotal,
      allTotals: sorted.map(s => ({ supermarket:s, total:Math.round(totals[s.id]*100)/100 })),
      splitGroups:groups, shouldSplit,
      optimalGroups, optimalTotal, optimalSavings, optimalSavingsPct,
      totalItems: cartItems.reduce((s, i) => s + i.qty, 0),
    };
  }

  // health ranking per store (avg nutri score A=1..E=5)
  const NS_VAL = { A:1, B:2, C:3, D:4, E:5 };
  function getHealthRanking(districtId) {
    const stores = getStoresForDistrict(districtId, null).filter(s => s.tipo === 'supermercado');
    return stores.map(sm => {
      const prods = PRODUCTS.filter(p => p.nutri_score && p.prices[sm.id]?.base);
      if (!prods.length) return null;
      const avgNS = prods.reduce((s, p) => s + (NS_VAL[p.nutri_score] || 3), 0) / prods.length;
      const avgNOVA = prods.filter(p => p.nova).reduce((s, p) => s + p.nova, 0) / prods.filter(p=>p.nova).length;
      const score = Math.round((avgNS + avgNOVA / 2) * 10) / 10;
      return { store:sm, score, avgNS:Math.round(avgNS*10)/10, avgNOVA:Math.round(avgNOVA*10)/10 };
    }).filter(Boolean).sort((a, b) => a.score - b.score);
  }

  const DEMO_CART = [
    { productId:'frango_inteiro', qty:1 },
    { productId:'tomates', qty:2 },
    { productId:'laranjas', qty:1 },
    { productId:'leite_uht', qty:4 },
    { productId:'iogurte_grego', qty:1 },
    { productId:'agua_6pack', qty:1 },
    { productId:'detergente_roupa', qty:1 },
    { productId:'pizza_congelada', qty:2 },
  ];

  // ---- Category ↔ compatible store types ----
  const CAT_STORE_TYPES = {
    carnes:     ['supermercado','talho','peixaria','mercearia'],
    frescos:    ['supermercado','mercearia','peixaria'],
    congelados: ['supermercado','mercearia','congelados'],
    laticinios: ['supermercado','mercearia'],
    bebidas:    ['supermercado','mercearia'],
    higiene:    ['supermercado','mercearia'],
    todos:      ['supermercado','talho','peixaria','mercearia','congelados'],
  };

  // Simulated weekly noise per store (price multiplier, 8 weeks)
  const WEEKLY_NOISE = {
    continente:[1.01,1.02,1.00,1.01,1.02,1.01,1.00,1.00],pingodoce:[1.04,0.99,0.97,0.94,0.93,0.95,0.94,0.94],
    lidl:[0.92,0.91,0.93,0.90,0.91,0.89,0.90,0.90],aldi:[0.91,0.92,0.90,0.89,0.90,0.88,0.89,0.89],
    mercadona:[0.97,0.98,0.96,0.97,0.97,0.96,0.96,0.96],intermarche:[0.99,1.00,1.01,1.00,1.01,1.00,1.00,1.00],
    minipreco:[1.00,1.01,0.99,1.00,1.00,0.99,1.00,1.00],froiz:[0.97,0.96,0.98,0.97,0.96,0.97,0.97,0.97],spar:[1.02,1.01,1.03,1.02,1.01,1.02,1.02,1.02],leclerc:[0.95,0.94,0.96,0.95,0.94,0.95,0.95,0.95],
    peixaria_ribeira:[0.88,0.87,0.86,0.88,0.85,0.84,0.85,0.85],    mercearia_bairro:[0.93,0.94,0.92,0.93,0.92,0.91,0.92,0.92],    peixaria_santos:[0.86,0.87,0.85,0.86,0.84,0.83,0.84,0.84],    peixaria_bolhao:[0.87,0.86,0.88,0.85,0.86,0.84,0.85,0.85],talho_porto:[0.91,0.90,0.92,0.89,0.90,0.88,0.89,0.89],
    mercearia_porto:[0.94,0.93,0.95,0.92,0.93,0.91,0.92,0.92],talho_braga:[0.92,0.91,0.93,0.90,0.91,0.89,0.90,0.90],
    mercearia_braga:[0.95,0.94,0.96,0.93,0.94,0.92,0.93,0.93],peixaria_setubal:[0.88,0.87,0.89,0.86,0.87,0.85,0.86,0.86],
    mercearia_faro:[0.94,0.95,0.93,0.94,0.93,0.92,0.93,0.93],
  };

  function _avgPrice(storeId, categoryId) {
    const prods = categoryId && categoryId!=='todos' ? PRODUCTS.filter(p=>p.category===categoryId) : PRODUCTS;
    const relevant = prods.filter(p=>p.prices[storeId]?.base!=null||p.prices[storeId]?.promo!=null);
    if (!relevant.length) return null;
    const n = WEEKLY_NOISE[storeId]||Array(8).fill(1);
    const base = relevant.reduce((s,p)=>s+(getPrice(p,storeId)||0),0)/relevant.length;
    return Math.round(base*n[7]*100)/100;
  }

  function getTop10Ranking(districtId, storeTypeFilter, categoryId) {
    const compatTypes = storeTypeFilter && storeTypeFilter!=='todos'
      ? [storeTypeFilter]
      : (categoryId && categoryId!=='todos' ? CAT_STORE_TYPES[categoryId] : CAT_STORE_TYPES.todos);
    const stores = STORES.filter(s=>{
      const distOk = s.distritos.includes('all')||s.distritos.includes(districtId);
      const typeOk = compatTypes.includes(s.tipo);
      const catOk  = !categoryId||categoryId==='todos' ? true : (s.categorias.includes('all')||s.categorias.includes(categoryId));
      return distOk&&typeOk&&catOk;
    });
    return stores.map(s=>{
      const avg = _avgPrice(s.id, categoryId);
      if (avg==null) return null;
      const n = WEEKLY_NOISE[s.id]||Array(8).fill(1);
      const baseAll=(categoryId&&categoryId!=='todos'?PRODUCTS.filter(p=>p.category===categoryId):PRODUCTS).filter(p=>p.prices[s.id]?.base!=null);
      const rawBase = baseAll.length ? baseAll.reduce((sum,p)=>sum+(p.prices[s.id]?.base||0),0)/baseAll.length : avg;
      const prevAvg = Math.round(rawBase*n[6]*100)/100;
      const delta   = Math.round((avg-prevAvg)*100)/100;
      const trend   = delta<-0.005?'up':delta>0.005?'down':'flat';
      return { store:s, avg, delta, trend };
    }).filter(Boolean).sort((a,b)=>a.avg-b.avg).slice(0,10);
  }

  function getWinningProducts(storeId, categoryId) {
    const prods = categoryId&&categoryId!=='todos' ? PRODUCTS.filter(p=>p.category===categoryId) : PRODUCTS;
    return prods.map(p=>{
      const myPrice = getPrice(p,storeId);
      if (myPrice==null) return null;
      let worstStore=null, worstPrice=-Infinity;
      STORES.forEach(s=>{ const pr=getPrice(p,s.id); if(pr!=null&&pr>worstPrice){worstStore=s;worstPrice=pr;} });
      const cheapestPrice = Math.min(...STORES.map(s=>getPrice(p,s.id)||Infinity));
      if (Math.abs(myPrice-cheapestPrice)>0.005) return null;
      const savingVsWorst = worstPrice>0 ? Math.round((worstPrice-myPrice)*100)/100 : 0;
      const savingPct     = worstPrice>0 ? Math.round((worstPrice-myPrice)/worstPrice*1000)/10 : 0;
      return { product:p, price:myPrice, worstStore, worstPrice:Math.round(worstPrice*100)/100, savingVsWorst, savingPct, isPromo:!!(p.prices[storeId]?.promo) };
    }).filter(Boolean).sort((a,b)=>b.savingVsWorst-a.savingVsWorst);
  }

  return {
    PLANS, PLAN_FEATURES, DISTRICTS, STORES, STORE_BY_ID, CATEGORIES,
    PRODUCTS, PRODUCT_BY_ID, FLYERS, NOTIFICATIONS, WEEKLY_NOISE,
    getPrice, getStoresForDistrict, compareCartV4, getHealthRanking,
    getTop10Ranking, getWinningProducts, CAT_STORE_TYPES,
    DEMO_CART,
    // --- Backend integration hook ---
    loadFromBackend: function(data) {
      try {
        if (data.produtos && Array.isArray(data.produtos)) {
          PRODUCTS.length = 0;
          data.produtos.forEach(p => PRODUCTS.push(p));
          Object.keys(PRODUCT_BY_ID).forEach(k => delete PRODUCT_BY_ID[k]);
          PRODUCTS.forEach(p => { PRODUCT_BY_ID[p.id] = p; });
        }
        if (data.lojas && Array.isArray(data.lojas)) {
          STORES.length = 0;
          data.lojas.forEach(s => STORES.push(s));
          Object.keys(STORE_BY_ID).forEach(k => delete STORE_BY_ID[k]);
          STORES.forEach(s => { STORE_BY_ID[s.id] = s; });
        }
        if (data.promocoes) {
          // merge promos into existing product prices
          Object.entries(data.promocoes).forEach(([prodId, promos]) => {
            const prod = PRODUCT_BY_ID[prodId];
            if (prod) Object.assign(prod.prices, promos);
          });
        }
        console.log('[OlaSuperDataV4] loadFromBackend: ok', { produtos: PRODUCTS.length, lojas: STORES.length });
        return true;
      } catch(e) {
        console.error('[OlaSuperDataV4] loadFromBackend error:', e);
        return false;
      }
    },
  };
})();
