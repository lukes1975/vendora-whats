
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  fullName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName }: WelcomeEmailRequest = await req.json();
    
    console.log(`Sending welcome email to: ${email}`);

    const emailResponse = await resend.emails.send({
      from: "Vendora <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to Vendora - Your WhatsApp Business Journey Starts Here! 🚀",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Welcome to Vendora!</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">Your WhatsApp business journey starts here</p>
          </div>
          
          <div style="padding: 0 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">Hey ${fullName || 'there'}! 👋</h2>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              You're no longer just selling from your phone. Now you're running a business that looks global — even if you're just starting out.
            </p>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #333; margin-top: 0;">What's Next? 🎯</h3>
              <ul style="color: #555; line-height: 1.8; padding-left: 20px;">
                <li><strong>Create your storefront</strong> - Add your products and brand story</li>
                <li><strong>Get your branded link</strong> - Share it everywhere your customers are</li>
                <li><strong>Watch buyers DM you</strong> - They'll come prepared and ready to buy</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${Deno.env.get('SUPABASE_URL')?.replace('https://ncetgnojwfrnsxpytcia.supabase.co', window.location?.origin || 'https://your-app-url.com')}/dashboard" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; display: inline-block;">
                Set Up Your Business Hub →
              </a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center;">
              <p style="color: #888; font-size: 14px; margin: 0;">
                From hustler to brand. From seller to business.<br>
                Vendora gives you more than a store — it gives you a stage.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, messageId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
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
