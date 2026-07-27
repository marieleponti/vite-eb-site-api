// functions/api/contact.js
//
// Cloudflare Pages Function — replaces Netlify Forms, which has no
// equivalent on this platform. Sends the contact form submission
// via Resend instead of Netlify's built-in form handling.

export async function onRequestPost(context) {
  const { request, env } = context

  try {
    const body = await request.json()
    const { name, email, message, website } = body

    // Honeypot check — same logic the frontend already had,
    // duplicated here since a bot could bypass the frontend entirely
    if (website) {
      return new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Basic required-field validation
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Contact Form <onboarding@resend.dev>', // swap once your domain is verified in Resend
        to: env.CONTACT_FORM_RECIPIENT,
        reply_to: email,
        subject: `New contact form submission from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      }),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => null)
      console.error('Resend API error:', errorData)

      return new Response(
        JSON.stringify({ error: 'Failed to send message' }),
        {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {

    console.error('Contact function error:', error)

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}