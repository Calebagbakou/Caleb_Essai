/* =========================================================================
   CLIENT SUPABASE PARTAGÉ — CALEB CREATIVE
   -------------------------------------------------------------------------
   Charge ce fichier après le CDN supabase-js ET après supabase-config.js.
   Fournit window.getSupabase(), utilisé par le site public, la boutique
   et l'admin. Une seule instance de client est créée par page (singleton).
   ========================================================================= */

(function () {
  let _supabase = null;

  window.getSupabase = function getSupabase() {
    if (_supabase) return _supabase;

    if (!window.supabase) {
      console.error("Le SDK supabase-js n'est pas chargé (vérifie la balise <script> du CDN, avant supabase-client.js).");
      return null;
    }
    if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
      console.error("Configuration Supabase manquante (vérifie que supabase-config.js est chargé avant supabase-client.js).");
      return null;
    }

    _supabase = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    return _supabase;
  };
})();
