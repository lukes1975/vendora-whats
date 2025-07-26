import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = new Resend(resendApiKey);

    // Get unconfirmed users from the last 24-72 hours
    const { data: users, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error("Error fetching users:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch users" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let emailsSent = 0;

    for (const user of users.users) {
      // Skip confirmed users
      if (user.email_confirmed_at) continue;

      // Check if user signed up in the last 24-72 hours
      const signupTime = new Date(user.created_at);
      const now = new Date();
      const hoursAgo = (now.getTime() - signupTime.getTime()) / (1000 * 60 * 60);

      if (hoursAgo >= 24 && hoursAgo <= 72) {
        try {
          await resend.emails.send({
            from: "Vendora <onboarding@resend.dev>",
            to: [user.email!],
            subject: "Don't miss out on your business transformation! 🚀",
            html: `
              <h1>Your Vendora account is waiting!</h1>
              <p>Hi ${user.user_metadata?.full_name || 'there'},</p>
              <p>We noticed you started setting up your Vendora account but haven't confirmed your email yet.</p>
              <p>Click the confirmation link in your original signup email to activate your account and start building your business presence.</p>
              <p>Need help? Simply reply to this email and we'll get you sorted.</p>
              <p>Best regards,<br>The Vendora Team</p>
            `,
          });
          emailsSent++;
        } catch (emailError) {
          console.error(`Failed to send reminder to ${user.email}:`, emailError);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, emailsSent }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-email-reminder function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);