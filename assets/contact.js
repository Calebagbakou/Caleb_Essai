/* =========================================================================
   FORMULAIRE DE CONTACT — CALEB CREATIVE
   -------------------------------------------------------------------------
   Envoie réellement le message dans Supabase (table "messages"), lu ensuite
   depuis /admin/messages.html. Charge après supabase-config.js et
   supabase-client.js.
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  if (!form) return; // page sans formulaire de contact

  const statusBox = document.getElementById('contactStatus');
  const submitBtn = document.getElementById('contactSubmit');

  function setStatus(kind, text){
    statusBox.textContent = text;
    statusBox.className = 'form-status show ' + kind;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const supabase = window.getSupabase ? window.getSupabase() : null;
    if (!supabase){
      setStatus('error', "Une erreur technique empêche l'envoi pour le moment. Merci de me contacter directement par email ou WhatsApp.");
      return;
    }

    const nom = form.querySelector('[name="nom"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const message = form.querySelector('[name="message"]').value.trim();

    if (!nom || !email || !message){
      setStatus('error', 'Merci de remplir tous les champs.');
      return;
    }

    submitBtn.disabled = true;
    setStatus('loading', 'Envoi en cours…');

    const { error } = await supabase.from('messages').insert({
      name: nom,
      email: email,
      content: message,
    });

    submitBtn.disabled = false;

    if (error){
      console.error('Erreur envoi message de contact :', error);
      setStatus('error', "L'envoi a échoué. Merci de réessayer, ou de me contacter directement par email ou WhatsApp.");
      return;
    }

    setStatus('success', '✓ Message envoyé — je vous répondrai rapidement.');
    form.reset();
  });
});
