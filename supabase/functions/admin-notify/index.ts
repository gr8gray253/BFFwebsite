import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API = 'https://api.resend.com/emails';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const resendKey  = Deno.env.get('RESEND_API_KEY');
  const emailTo    = Deno.env.get('NOTIFY_EMAIL_TO') || 'kyle.rockefeller@bayoucharity.org';
  const emailFrom  = Deno.env.get('NOTIFY_EMAIL_FROM') || 'admin@bayoucharity.org';

  // Optional WEBHOOK_SECRET check — skip if not configured
  const secret     = Deno.env.get('WEBHOOK_SECRET');
  const authHeader = req.headers.get('Authorization');
  if (secret && authHeader && authHeader !== 'Bearer ' + secret) {
    return new Response('Unauthorized', { status: 401 });
  }

  let body: any;
  try { body = await req.json(); } catch { return new Response('Bad JSON', { status: 400 }); }

  const { type, table, record } = body;
  if (!record) return new Response('OK', { status: 200 });

  let subject = 'Bayou Charity — Admin Action Needed';
  let html = '';
  const portalUrl = 'https://bayoucharity.org/#members';

  if (table === 'gallery_submissions' && type === 'INSERT') {
    subject = '📷 New Gallery Photo Needs Approval';
    html = `<p>A member submitted a photo for gallery review.</p>
            <p><a href="${portalUrl}">Open Admin Tab → Gallery Submissions</a></p>`;
  } else if (table === 'profiles' && type === 'INSERT') {
    const name = record.display_name || record.email || record.id;
    subject = `👤 New Member Request: ${name}`;
    html = `<p><strong>${name}</strong> has signed up and is waiting for your approval.</p>
            <p><a href="${portalUrl}">Open Admin Tab → Pending Accounts</a></p>`;
  } else if (table === 'pins' && type === 'UPDATE' && record.flagged === true) {
    subject = '🚩 A Post Has Been Flagged';
    html = `<p>A member flagged a post for your review.</p>
            <p><a href="${portalUrl}">Open Admin Tab → Flagged Posts</a></p>`;
  } else {
    return new Response('OK', { status: 200 });
  }

  if (!resendKey) {
    console.warn('RESEND_API_KEY not configured — skipping email');
    return new Response('OK (no key)', { status: 200 });
  }

  const resp = await fetch(RESEND_API, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Bayou Charity Admin <${emailFrom}>`,
      to: [emailTo],
      subject,
      html,
    }),
  });

  const result = await resp.json();
  return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });
});
