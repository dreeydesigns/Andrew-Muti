export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, service, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const entry = {
    name,
    email,
    service: service || '',
    message,
    timestamp: new Date().toISOString(),
  };

  // Always log to Vercel dashboard
  console.log('New contact submission:', JSON.stringify(entry));

  // Optional: send email via Resend (set RESEND_API_KEY in Vercel env vars)
  const resendKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL || 'Dreeydesigns@gmail.com';

  if (resendKey) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Portfolio Contact <onboarding@resend.dev>',
          to: [toEmail],
          subject: `New enquiry from ${name} — ${service || 'Portfolio site'}`,
          html: `
            <h2>New contact form submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Service:</strong> ${service || '—'}</p>
            <hr>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
            <hr>
            <p style="color:#999;font-size:12px;">Sent ${entry.timestamp}</p>
          `,
        }),
      });
    } catch (err) {
      console.error('Resend error:', err);
      // Don't fail the response — submission is still logged
    }
  }

  return res.status(200).json({ success: true });
}
