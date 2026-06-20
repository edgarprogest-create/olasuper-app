// OláSuper_i18n_v4.jsx — sistema de língua simples
(function(){

const LINGUAS = [
  { id:'pt', nome:'Português', flag:'🇵🇹' },
  { id:'es', nome:'Español',   flag:'🇪🇸' },
  { id:'en', nome:'English',   flag:'🇬🇧' },
];

const TRADUCOES = {
  pt: {
    verAlternativa: 'Ver alternativa natural',
    riscoBaixo: 'Baixo',
    riscoMedio: 'Médio',
    riscoAlto: 'Alto',
    alergenios: 'Alergénios',
    aditivosENumbers: 'Aditivos E-numbers',
    classificacaoNova: 'Classificação NOVA',
    nutriScore: 'Nutri-Score',
    pesquisarIngredientes: 'Pesquisa produto ou inserir ingredientes…',
    analisarProduto: 'Analisar produto',
    exclusivoSaude: 'Exclusivo OláSuper Saúde',
    renovacao: 'Renovação',
    obrigado: 'Obrigado por seres membro',
    idioma: 'Idioma',
    politicaPriv: 'Política de privacidade',
    lojasSeguidas: 'Lojas seguidas',
    distritoFav: 'Distrito favorito',
    notificacoes: 'Notificações',
    partilharApp: 'Partilhar OláSuper',
    convida: 'Convida amigos para o OláSuper',
    poupancaTotal: 'Poupança total',
    ultimaPoupanca: 'Última poupança',
    restantes: 'restantes',
    usadas: 'usadas',
    analisesMes: 'Análises / mês',
    disclaimer: '* Poupança calculada com base nos preços e promoções semanais dos folhetos de cada supermercado. Os preços podem variar por loja e localização.',
    calcularCombinacao: 'Calcular combinação',
    maisBarato2: 'mais barato',
    tabSplit: 'Divisão inteligente',
    personalizada: 'Personalizada',
    lojaUnica: 'Loja única',
    maxPoupanca: 'Máxima poupança',
    verPlanCompras: 'Ver plano de compras',
    iniciarCompras: 'Iniciar compras',
    loja: 'loja',
    lojas: 'lojas',
    distribuindo: 'Distribuindo por',
    poupancaMaximaEncontrada: 'Poupança máxima encontrada',
    resultado: 'Resultado',
    verCarrinho: 'Ver carrinho',
    adicionarAoCarrinho: 'Adicionar ao carrinho',
    promoSemana: 'Promoções da semana',
    continuar: 'Continuar carrinho',
    adicionaProdutos: 'Adiciona produtos pela pesquisa acima',
    carrinhoVazio: 'O carrinho está vazio',
    totalEstimado: 'Total estimado',
    analisarCarrinho: 'Analisar carrinho',
    pesquisarFree: 'Pesquisar (30 produtos disponíveis)…',
    pesquisarProduto: 'Pesquisar produto…',
    folhetos: 'Folhetos',
    orcamentoMensal: 'Orçamento mensal em compras',
    poupancaModerada: 'Poupança moderada',
    poupancaMaxima: 'Poupança máxima',
    compradorOcasional: 'Comprador ocasional',
    marcasReferencia: 'Marcas de referência',
    marcasBrancas: 'Marcas brancas',
    simularGanho: 'Simula o teu ganho mensal',
    queresVerSe: 'Queres ver se a subscrição compensa?',
    verLiga: 'Ver Liga completa por distrito',
    vencedorCategoria: 'Vencedor por Categoria',
    simulador: 'Simulador de Subscrição',
    ligaDistrito: 'Liga por Distrito',
    rankingSemanal: 'Ranking Semanal',
    bemVindo:         'Bem-vindo de volta',
    entrar:           'Entrar',
    criarConta:       'Criar conta',
    email:            'Email',
    password:         'Password',
    manterSessao:     'Manter sessão iniciada',
    esqueciPassword:  'Esqueci-me da password',
    semConta:         'Ainda não tens conta?',
    regista:          'Regista-te',
    temConta:         'Já tens conta?',
    entraAqui:        'Entra aqui',
    nome:             'Nome',
    confirmarPw:      'Confirmar password',
    inicio:           'Início',
    carrinho:         'Carrinho',
    scanner:          'Scanner',
    perfil:           'Perfil',
    analise:          'Análise',
    poupanca:         'Poupança',
    totalMes:         'Total este mês',
    lingua:           'Idioma',
    definicoes:       'Definições',
    terminarSessao:   'Terminar sessão',
    aderir:           'Aderir ao',
    maisBarato:       'mais barato',
    poupa:            'Poupas',
    aEntrar:          'A entrar…',
    aCriar:           'A criar conta…',
    emailInvalido:    'Email inválido.',
    pwCurta:          'Password: mínimo 6 caracteres.',
    pwNaoCoincidem:   'As passwords não coincidem.',
    insereNome:       'Insere o teu nome.',
    emailOuPwErrados: 'Email ou password incorrectos.',
    ocultar:          'Ocultar',
    ver:              'Ver',
    comecarPoupar:    'Compara. Divide. Poupa mais.',
    tagline:          'A app líder em Portugal para compras mais inteligentes e saudáveis.',
    iniciarSessao:    'Entrar na app',
  },
  es: {
    bemVindo:         'Bienvenido de nuevo',
    entrar:           'Entrar',
    criarConta:       'Crear cuenta',
    email:            'Email',
    password:         'Contraseña',
    manterSessao:     'Mantener sesión iniciada',
    esqueciPassword:  'Olvidé mi contraseña',
    semConta:         '¿No tienes cuenta?',
    regista:          'Regístrate',
    temConta:         '¿Ya tienes cuenta?',
    entraAqui:        'Entra aquí',
    nome:             'Nombre',
    confirmarPw:      'Confirmar contraseña',
    inicio:           'Inicio',
    carrinho:         'Carrito',
    scanner:          'Escáner',
    perfil:           'Perfil',
    analise:          'Análisis',
    poupanca:         'Ahorro',
    totalMes:         'Total este mes',
    lingua:           'Idioma',
    definicoes:       'Ajustes',
    terminarSessao:   'Cerrar sesión',
    aderir:           'Suscribirse a',
    maisBarato:       'más barato',
    poupa:            'Ahorras',
    aEntrar:          'Entrando…',
    aCriar:           'Creando cuenta…',
    emailInvalido:    'Email inválido.',
    pwCurta:          'Contraseña: mínimo 6 caracteres.',
    pwNaoCoincidem:   'Las contraseñas no coinciden.',
    insereNome:       'Introduce tu nombre.',
    emailOuPwErrados: 'Email o contraseña incorrectos.',
    ocultar:          'Ocultar',
    ver:              'Ver',
    comecarPoupar:    'Compara. Divide. Ahorra más.',
    tagline:          'La app líder en Portugal para compras más inteligentes y saludables.',
    iniciarSessao:    'Entrar en la app',
  },
  en: {
    bemVindo:         'Welcome back',
    entrar:           'Sign in',
    criarConta:       'Create account',
    email:            'Email',
    password:         'Password',
    manterSessao:     'Keep me signed in',
    esqueciPassword:  'Forgot my password',
    semConta:         "Don't have an account?",
    regista:          'Sign up',
    temConta:         'Already have an account?',
    entraAqui:        'Sign in',
    nome:             'Name',
    confirmarPw:      'Confirm password',
    inicio:           'Home',
    carrinho:         'Cart',
    scanner:          'Scanner',
    perfil:           'Profile',
    analise:          'Analysis',
    poupanca:         'Savings',
    totalMes:         'Total this month',
    lingua:           'Language',
    definicoes:       'Settings',
    terminarSessao:   'Sign out',
    aderir:           'Subscribe to',
    maisBarato:       'cheapest',
    poupa:            'You save',
    aEntrar:          'Signing in…',
    aCriar:           'Creating account…',
    emailInvalido:    'Invalid email.',
    pwCurta:          'Password: minimum 6 characters.',
    pwNaoCoincidem:   "Passwords don't match.",
    insereNome:       'Enter your name.',
    emailOuPwErrados: 'Incorrect email or password.',
    ocultar:          'Hide',
    ver:              'Show',
    comecarPoupar:    'Compare. Split. Save more.',
    tagline:          'The leading app in Portugal for smarter, healthier shopping.',
    iniciarSessao:    'Sign in to the app',
  },
};

const LS_LANG = 'cd4_lang';
const I18nCtx = React.createContext({ t: TRADUCOES.pt, lang:'pt', setLang:()=>{} });

function I18nProvider({ children }) {
  // Língua fixa: Português
  const lang = 'pt';
  function setLang() {}  // no-op
  const t = (key) => (TRADUCOES.pt)[key] || key;
  return (
    <I18nCtx.Provider value={{ t, lang, setLang, LINGUAS }}>
      {children}
    </I18nCtx.Provider>
  );
}

function useI18n() { return React.useContext(I18nCtx); }

// ---- LangSheet: bottom sheet selector ----
function LangSheet({ onClose }) {
  const { lang, setLang, LINGUAS: LS } = useI18n();
  return (
    <div style={{ position:'absolute', inset:0, zIndex:300, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'flex-end' }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ width:'100%', background:'#fff', borderRadius:'20px 20px 0 0', padding:'12px 0 32px' }}>
        <div style={{ width:38, height:4, borderRadius:100, background:'#E0E0E0', margin:'0 auto 16px' }}/>
        <div style={{ fontSize:13, fontWeight:700, color:'#9E9E9E', textTransform:'uppercase', letterSpacing:'0.07em', padding:'0 20px', marginBottom:10 }}>Idioma / Language</div>
        {LS.map(l => (
          <button key={l.id} onClick={()=>{ setLang(l.id); onClose(); }}
            style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'14px 20px', border:'none', background:'none', cursor:'pointer', fontFamily:'inherit' }}>
            <span style={{ fontSize:24 }}>{l.flag}</span>
            <span style={{ flex:1, fontSize:16, color:'#1A1A1A', textAlign:'left', fontWeight: lang===l.id ? 800 : 500 }}>{l.nome}</span>
            {lang===l.id && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={P.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---- LangPickerInline: 3 botões em linha (para welcome screen) ----
function LangPickerInline() {
  const { lang, setLang, LINGUAS: LS } = useI18n();
  return (
    <div style={{ display:'flex', justifyContent:'center', gap:8 }}>
      {LS.map(l => (
        <button key={l.id} onClick={()=>setLang(l.id)}
          style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 14px', borderRadius:20,
            border: lang===l.id ? '2px solid rgba(255,255,255,0.9)' : '1px solid rgba(255,255,255,0.4)',
            background: lang===l.id ? 'rgba(255,255,255,0.2)' : 'transparent',
            color:'#fff', fontSize:13, fontWeight: lang===l.id ? 700 : 500, cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s'
          }}>
          <span style={{ fontSize:16 }}>{l.flag}</span>
          <span>{l.nome}</span>
        </button>
      ))}
    </div>
  );
}

Object.assign(window, { I18nProvider, useI18n, LangSheet, LangPickerInline, LINGUAS, TRADUCOES, LS_LANG });
})();
