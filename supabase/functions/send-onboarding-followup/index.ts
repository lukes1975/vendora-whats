import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OnboardingEmailRequest {
  email: string;
  fullName: string;
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName, userId }: OnboardingEmailRequest = await req.json();
    
    console.log(`Sending onboarding follow-up email to: ${email}`);

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if onboarding email already sent
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('onboarding_email_sent')
      .eq('id', userId)
      .single();

    if (profileError) {
      throw new Error('Failed to fetch user profile');
    }

    if (profile?.onboarding_email_sent) {
      return new Response(
        JSON.stringify({ message: 'Onboarding email already sent' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const firstName = fullName?.split(' ')[0] || 'there';
    const loginUrl = `${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '')}.lovable.app/dashboard`;
    const feedbackUrl = "https://vendora.business/feedback";

    const emailResponse = await resend.emails.send({
      from: "Vendora <team@vendora.business>",
      to: [email],
      subject: "🎉 Welcome to Vendora — You're Among the First!",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🎉 Welcome to Vendora — You're Among the First!</h1>
          </div>
          
          <div style="padding: 0 20px;">
            <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">Hi ${firstName},</p>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              You've officially been selected by our team as one of the first-ever Vendora test users — and we couldn't be more excited to have you on board.
            </p>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              Vendora is a tool designed to help African entrepreneurs organize, structure, and grow their businesses — especially those selling through WhatsApp and social media.
              We're on a mission to turn hustles into real businesses and empower sellers with serious tools that drive serious results.
            </p>
            
            <h3 style="color: #333; margin: 30px 0 20px 0;">As a test user, here's what you get:</h3>
            <ul style="color: #555; line-height: 1.6; margin-bottom: 30px; padding-left: 20px;">
              <li style="margin-bottom: 10px;">✅ Full access to Vendora's powerful tools — free</li>
              <li style="margin-bottom: 10px;">✅ A direct line to share feedback and shape how Vendora evolves</li>
              <li style="margin-bottom: 10px;">✅ Early-bird perks for future plans and features</li>
              <li style="margin-bottom: 10px;">✅ Priority support as we work together to make this a game-changer</li>
            </ul>
            
            <h3 style="color: #333; margin: 30px 0 20px 0;">Your next step:</h3>
            <ul style="color: #555; line-height: 1.6; margin-bottom: 30px; padding-left: 20px;">
              <li style="margin-bottom: 10px;">👉 <a href="${loginUrl}" style="color: #667eea; text-decoration: none;">Log in and set up your business</a></li>
              <li style="margin-bottom: 10px;">👉 Try out the key features: storefront setup, product management, automation</li>
              <li style="margin-bottom: 10px;">👉 <a href="${feedbackUrl}" style="color: #667eea; text-decoration: none;">Give feedback anytime</a> or via WhatsApp</li>
            </ul>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              This isn't just software — it's a mission. Vendora exists to empower African entrepreneurs with world-class tools, structure, and growth systems.
            </p>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 30px;">
              <strong>Let's build the future together.</strong>
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                Access Your Dashboard
              </a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center;">
              <p style="color: #888; font-size: 14px; margin: 0;">
                With you,<br>
                <strong>Team Vendora</strong><br>
                <a href="mailto:team@vendora.business" style="color: #667eea;">team@vendora.business</a>
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Onboarding follow-up email sent successfully:", emailResponse);

    // Mark onboarding email as sent
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ onboarding_email_sent: true })
      .eq('id', userId);

    if (updateError) {
      console.error('Failed to update onboarding_email_sent:', updateError);
    }

    // Send welcome email after onboarding email (with delay)
    setTimeout(async () => {
      try {
        console.log('Sending welcome email after onboarding...');
        const welcomeResponse = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-welcome-email`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`
            },
            body: JSON.stringify({
              email,
              fullName
            })
          }
        );
        
        if (!welcomeResponse.ok) {
          console.error('Welcome email failed:', await welcomeResponse.text());
        } else {
          console.log('Welcome email sent successfully');
        }
      } catch (error) {
        console.error('Error sending welcome email:', error);
      }
    }, 30000); // 30 seconds delay

    return new Response(JSON.stringify({ success: true, messageId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending onboarding follow-up email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);