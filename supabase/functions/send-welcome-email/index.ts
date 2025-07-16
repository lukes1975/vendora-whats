import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Check if user's email is confirmed
    if (!user.email_confirmed_at) {
      return new Response(
        JSON.stringify({ error: 'Email not confirmed' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get user profile to check first_login_done status
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('first_login_done, full_name')
      .eq('id', user.id)
      .single()

    if (profileError) {
      throw new Error('Failed to fetch user profile')
    }

    // If welcome email already sent, return early
    if (profile.first_login_done) {
      return new Response(
        JSON.stringify({ message: 'Welcome email already sent' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Send welcome email via Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('Resend API key not configured')
    }

    const firstName = profile.full_name?.split(' ')[0] || 'there'
    const dashboardUrl = `${req.headers.get('origin') || 'https://vendora.lovableproject.com'}/dashboard`

    const emailHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #2563eb; margin-bottom: 10px;">Your Business Just Leveled Up 🚀</h1>
          </div>
          
          <p style="font-size: 16px; margin-bottom: 20px;">Hi ${firstName},</p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            You've just unlocked a platform built for ambitious sellers.
          </p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Vendora gives you the tools, brand presence, and automation once reserved for the big names — now fully in your hands.
          </p>
          
          <p style="font-size: 16px; margin-bottom: 20px;"><strong>Here's what's waiting inside:</strong></p>
          
          <ul style="font-size: 16px; margin-bottom: 30px; padding-left: 20px;">
            <li style="margin-bottom: 10px;">✅ A branded storefront that lives inside WhatsApp — always one tap away from your customers.</li>
            <li style="margin-bottom: 10px;">✅ One smart dashboard to manage products, orders, payments, and promotions.</li>
            <li style="margin-bottom: 10px;">✅ Built-in automation, AI, and growth tools — made to scale with you.</li>
          </ul>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            You're not just running a business. You're building a brand.<br>
            And Vendora is here to make that brand unstoppable.
          </p>
          
          <p style="font-size: 16px; margin-bottom: 30px;">
            This isn't about catching up. It's about standing out.
          </p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${dashboardUrl}" style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">👉 Launch Your Dashboard</a>
          </div>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Welcome to the future of selling.<br>
            — The Vendora Team
          </p>
        </body>
      </html>
    `

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Vendora <hello@vendora.io>',
        to: [user.email],
        subject: 'Your Business Just Leveled Up 🚀',
        html: emailHtml,
      }),
    })

    if (!resendResponse.ok) {
      const resendError = await resendResponse.text()
      throw new Error(`Failed to send email: ${resendError}`)
    }

    // Update user profile to mark welcome email as sent
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ first_login_done: true })
      .eq('id', user.id)

    if (updateError) {
      console.error('Failed to update first_login_done:', updateError)
      // Don't throw here since email was sent successfully
    }

    return new Response(
      JSON.stringify({ message: 'Welcome email sent successfully' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in send-welcome-email function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})