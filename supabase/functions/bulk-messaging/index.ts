import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BulkMessageRequest {
  campaignId?: string;
  campaignName: string;
  messageTemplate: string;
  targetAudience: string[];
  scheduledAt?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const whatsappApiKey = Deno.env.get('WHATSAPP_BOT_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid authentication');
    }

    const { campaignId, campaignName, messageTemplate, targetAudience, scheduledAt }: BulkMessageRequest = await req.json();

    if (req.method === 'POST') {
      // Create or update campaign
      const campaignData = {
        user_id: user.id,
        campaign_name: campaignName,
        message_template: messageTemplate,
        target_audience: targetAudience,
        total_recipients: targetAudience.length,
        scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        status: scheduledAt ? 'scheduled' : 'draft'
      };

      let campaign;
      if (campaignId) {
        // Update existing campaign
        const { data, error } = await supabase
          .from('bulk_messaging_campaigns')
          .update(campaignData)
          .eq('id', campaignId)
          .eq('user_id', user.id)
          .select()
          .single();
        
        if (error) throw error;
        campaign = data;
      } else {
        // Create new campaign
        const { data, error } = await supabase
          .from('bulk_messaging_campaigns')
          .insert(campaignData)
          .select()
          .single();
        
        if (error) throw error;
        campaign = data;
      }

      // If not scheduled, send immediately
      if (!scheduledAt) {
        await sendBulkMessages(supabase, whatsappApiKey, campaign);
      }

      return new Response(JSON.stringify({ success: true, campaign }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'GET') {
      // Get user's campaigns
      const { data: campaigns, error } = await supabase
        .from('bulk_messaging_campaigns')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ campaigns }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Method not allowed');

  } catch (error) {
    console.error('Error in bulk-messaging function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

async function sendBulkMessages(supabase: any, whatsappApiKey: string, campaign: any) {
  try {
    // Update campaign status
    await supabase
      .from('bulk_messaging_campaigns')
      .update({ 
        status: 'sending',
        started_at: new Date().toISOString()
      })
      .eq('id', campaign.id);

    let sentCount = 0;
    let failedCount = 0;
    const creditsPerMessage = 1; // 1 credit per message

    // Get user's current credit balance
    const { data: creditBalance } = await supabase
      .from('user_credit_balances')
      .select('current_balance')
      .eq('user_id', campaign.user_id)
      .single();

    const totalCreditsNeeded = campaign.total_recipients * creditsPerMessage;
    
    if (!creditBalance || creditBalance.current_balance < totalCreditsNeeded) {
      throw new Error('Insufficient credits for bulk messaging');
    }

    // Send messages to each recipient
    for (const recipient of campaign.target_audience) {
      try {
        // Here you would integrate with your WhatsApp API
        // For now, we'll simulate the API call
        console.log(`Sending message to ${recipient}: ${campaign.message_template}`);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 100));
        
        sentCount++;
      } catch (error) {
        console.error(`Failed to send message to ${recipient}:`, error);
        failedCount++;
      }
    }

    // Record credit usage
    await supabase
      .from('credit_transactions')
      .insert({
        user_id: campaign.user_id,
        amount: sentCount * creditsPerMessage,
        transaction_type: 'usage',
        description: `Bulk messaging campaign: ${campaign.campaign_name}`,
        reference_id: campaign.id
      });

    // Update campaign with results
    await supabase
      .from('bulk_messaging_campaigns')
      .update({
        status: 'completed',
        messages_sent: sentCount,
        messages_failed: failedCount,
        credits_used: sentCount * creditsPerMessage,
        completed_at: new Date().toISOString()
      })
      .eq('id', campaign.id);

  } catch (error) {
    console.error('Error sending bulk messages:', error);
    
    // Update campaign status to failed
    await supabase
      .from('bulk_messaging_campaigns')
      .update({ 
        status: 'failed',
        completed_at: new Date().toISOString()
      })
      .eq('id', campaign.id);
    
    throw error;
  }
}

serve(handler);