/* =========================================================================
   AUTH ADMIN — CALEB CREATIVE
   -------------------------------------------------------------------------
   Charge ce fichier après le CDN supabase-js, ../assets/supabase-config.js
   et ../assets/supabase-client.js, sur chaque page /admin.
   Fournit : requireAdminSession(), logout().
   (getSupabase() vit maintenant dans assets/supabase-client.js, partagé
   avec le site public et la boutique.)
   ========================================================================= */

/**
 * À appeler en haut de chaque page protégée (tout /admin sauf login.html,
 * forgot-password.html, reset-password.html).
 * Redirige vers login.html si : pas connecté, OU connecté mais pas admin.
 * Retourne l'utilisateur Supabase si tout est en ordre.
 */
async function requireAdminSession(){
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session){
    window.location.href = 'login.html';
    return null;
  }

  // Vérifie que ce compte connecté fait bien partie de la table "admins".
  // Si non-admin, la policy RLS renvoie un résultat vide (pas une erreur).
  const { data, error } = await supabase.from('admins').select('id').eq('id', session.user.id).maybeSingle();
  if (error || !data){
    await supabase.auth.signOut();
    window.location.href = 'login.html?denied=1';
    return null;
  }

  return session.user;
}

async function logout(){
  const supabase = getSupabase();
  if (supabase) await supabase.auth.signOut();
  window.location.href = 'login.html';
}
