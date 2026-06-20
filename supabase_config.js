// OláSuper — Supabase configuration
// Replace SUPABASE_URL and SUPABASE_ANON_KEY with your project values from:
// https://supabase.com/dashboard/project/_/settings/api

(function () {
  const SUPABASE_URL     = 'https://fnyxmdpdhknxczdsoyzi.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZueXhtZHBkaGtueGN6ZHNveXppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NDAzMDIsImV4cCI6MjA5NzAxNjMwMn0.sJhQVmXLHvwk2HP5MbpYrxd9JsNJyV72OF3dmCerYRY';

  const IS_CONFIGURED = !SUPABASE_URL.includes('XXXXXX') && SUPABASE_ANON_KEY.length > 20;

  // Expose config + client when Supabase CDN is loaded
  window.OláSuperSupabase = {
    IS_CONFIGURED,
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    client: null,   // set after CDN loads

    init() {
      if (!IS_CONFIGURED) {
        console.warn('[OláSuper] Supabase não configurado — a usar contas hardcoded.');
        return;
      }
      if (!window.supabase) {
        console.error('[OláSuper] Supabase CDN não carregou.');
        return;
      }
      this.client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          storageKey: 'cd4_supabase_session',
          storage: window.localStorage,
          autoRefreshToken: true,
        }
      });
      console.log('[OláSuper] Supabase inicializado ✓');
    },

    // ── Auth helpers ──────────────────────────────────────

    async login(email, password) {
      const { data, error } = await this.client.auth.signInWithPassword({ email, password });
      if (error) return { ok: false, msg: 'Email ou password incorrectos.' };

      const profile = await this._getProfile(data.user.id);
      return {
        ok: true,
        user: {
          id:        data.user.id,
          email:     data.user.email,
          name:      data.user.user_metadata?.name || data.user.email.split('@')[0],
          plan:      profile?.plano    || 'free',
          district:  profile?.distrito || 'lisboa',
          lang:      profile?.lingua   || 'pt',
          usageLeft: this._usageLeft(profile),
        }
      };
    },

    async register(email, password, name) {
      const { data, error } = await this.client.auth.signUp({
        email,
        password,
        options: { data: { name } }
      });
      if (error) return { ok: false, msg: error.message };
      // Profile row created by Supabase trigger (see README)
      return { ok: true, user: { id: data.user?.id, email, name, plan: 'free', usageLeft: 1 } };
    },

    async logout() {
      await this.client.auth.signOut();
    },

    async checkSession() {
      const { data: { session } } = await this.client.auth.getSession();
      if (!session) return null;

      const profile = await this._getProfile(session.user.id);
      return {
        id:        session.user.id,
        email:     session.user.email,
        name:      session.user.user_metadata?.name || session.user.email.split('@')[0],
        plan:      profile?.plano    || 'free',
        district:  profile?.distrito || 'lisboa',
        lang:      profile?.lingua   || 'pt',
        usageLeft: this._usageLeft(profile),
      };
    },

    async updatePlan(userId, plano) {
      if (!this.client) return;
      await this.client.from('profiles').update({ plano }).eq('id', userId);
    },

    async decrementUsage(userId) {
      if (!this.client) return;
      await this.client.rpc('decrement_analises', { user_id: userId });
    },

    // ── Internal helpers ──────────────────────────────────

    async _getProfile(userId) {
      const { data } = await this.client
        .from('profiles')
        .select('plano, distrito, lingua, analises_usadas, data_reset, created_at')
        .eq('id', userId)
        .single();
      return data;
    },

    _usageLeft(profile) {
      if (!profile) return 1;
      // Plano pago = ilimitado
      if (profile.plano === 'plus' || profile.plano === 'plus_health') return Infinity;
      // Grátis: 1 análise/mês, reset no dia 1
      const used = profile.analises_usadas ?? 0;
      return Math.max(0, 1 - used);
    },
  };

  // Also expose without accent for JS property access
  window.OlaSuperSupabase = window['OláSuperSupabase'];

  // Auto-init — wait for Supabase CDN to load
  function tryInit(attempts) {
    if (attempts > 50) { console.warn('[OláSuper] Supabase CDN timeout.'); return; }
    if (window.supabase) {
      window['OláSuperSupabase'].init();
    } else {
      setTimeout(() => tryInit((attempts||0)+1), 100);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => tryInit(0));
  } else {
    tryInit(0);
  }
})();
