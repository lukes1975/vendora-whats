import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-vendora-secret',
};

interface InboundMessage {
  tenant_id: string; // store_id
  chat_id: string;
  from: string;
  text: string;
  message_id: string;
  timestamp: number;
}

interface USSDState {
  step: string;
  selectedItems: Array<{
    product_id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  customerData: {
    name?: string;
    address?: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate webhook secret
    const webhookSecret = req.headers.get('x-vendora-secret');
    const expectedSecret = Deno.env.get('WHATSAPP_WEBHOOK_SECRET');
    
    if (!webhookSecret || webhookSecret !== expectedSecret) {
      console.error('Invalid webhook secret');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const message: InboundMessage = await req.json();
    console.log('Received WhatsApp message:', message);

    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get store settings
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('*, vendor_id')
      .eq('id', message.tenant_id)
      .eq('is_active', true)
      .single();

    if (storeError || !store) {
      console.error('Store not found:', storeError);
      return new Response(JSON.stringify({ error: 'Store not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (store.use_ai_chat) {
      // AI mode - for now return a simple acknowledgment
      // TODO: Integrate with AI orchestrator
      console.log('AI mode enabled for store:', store.id);
      
      await sendWhatsAppMessage(message.chat_id, 
        "Hi! I'm your AI assistant. How can I help you today? You can ask about our products or place an order!");
      
      return new Response(JSON.stringify({ status: 'queued', mode: 'ai' }), {
        status: 202,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // USSD mode
      const response = await handleUSSDFlow(supabase, message, store);
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleUSSDFlow(supabase: any, message: InboundMessage, store: any) {
  // Get or create chat state
  let { data: chatState, error } = await supabase
    .from('wa_chats')
    .select('*')
    .eq('store_id', message.tenant_id)
    .eq('chat_id', message.chat_id)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching chat state:', error);
    throw error;
  }

  // Create new chat state if not exists or expired
  if (!chatState || new Date(chatState.expires_at) < new Date()) {
    const { data: newState, error: createError } = await supabase
      .from('wa_chats')
      .upsert({
        store_id: message.tenant_id,
        chat_id: message.chat_id,
        state: 'START',
        context: {},
        last_message_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      }, { onConflict: 'store_id,chat_id' })
      .select()
      .single();

    if (createError) {
      console.error('Error creating chat state:', createError);
      throw createError;
    }
    chatState = newState;
  }

  const currentState: USSDState = chatState.context || { step: chatState.state, selectedItems: [], customerData: {} };
  const userInput = message.text.trim();

  let nextReply = '';
  let newState = currentState;
  let shouldCreateOrder = false;

  switch (chatState.state) {
    case 'START':
      // Get products from store
      const { data: products } = await supabase
        .from('products')
        .select('id, name, price, status')
        .eq('store_id', message.tenant_id)
        .eq('status', 'active')
        .limit(5);

      if (!products || products.length === 0) {
        nextReply = "Sorry, no products are available at the moment. Please try again later.";
        break;
      }

      nextReply = `Welcome to ${store.name}! 🛍️\n\nSelect a product:\n\n`;
      products.forEach((product, index) => {
        nextReply += `${index + 1}. ${product.name} - ₦${product.price}\n`;
      });
      nextReply += '\nReply with the number of your choice.';

      newState = { 
        ...currentState, 
        step: 'BROWSING',
        products: products 
      };
      break;

    case 'BROWSING':
      const productIndex = parseInt(userInput) - 1;
      const availableProducts = currentState.products || [];
      
      if (isNaN(productIndex) || productIndex < 0 || productIndex >= availableProducts.length) {
        nextReply = "Invalid selection. Please reply with a valid number.";
        break;
      }

      const selectedProduct = availableProducts[productIndex];
      nextReply = `Great choice! ${selectedProduct.name} - ₦${selectedProduct.price}\n\nHow many would you like? (Enter a number)`;
      
      newState = {
        ...currentState,
        step: 'QTY',
        selectedProduct: selectedProduct
      };
      break;

    case 'QTY':
      const quantity = parseInt(userInput);
      if (isNaN(quantity) || quantity <= 0) {
        nextReply = "Please enter a valid quantity (number greater than 0).";
        break;
      }

      const item = {
        product_id: currentState.selectedProduct.id,
        name: currentState.selectedProduct.name,
        price: currentState.selectedProduct.price,
        quantity: quantity
      };

      nextReply = `Perfect! ${quantity}x ${item.name}\nTotal: ₦${(item.price * quantity).toFixed(2)}\n\nWhat's your name?`;
      
      newState = {
        ...currentState,
        step: 'NAME',
        selectedItems: [item]
      };
      break;

    case 'NAME':
      nextReply = `Nice to meet you, ${userInput}! 👋\n\nWhat's your delivery address?`;
      
      newState = {
        ...currentState,
        step: 'ADDRESS',
        customerData: { ...currentState.customerData, name: userInput }
      };
      break;

    case 'ADDRESS':
      const address = userInput;
      const total = currentState.selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      nextReply = `Order Summary:\n\n`;
      currentState.selectedItems.forEach(item => {
        nextReply += `${item.quantity}x ${item.name} - ₦${(item.price * item.quantity).toFixed(2)}\n`;
      });
      nextReply += `\nTotal: ₦${total.toFixed(2)}\nDelivery: ${address}\n\nReply "CONFIRM" to place your order or "CANCEL" to start over.`;
      
      newState = {
        ...currentState,
        step: 'CONFIRM',
        customerData: { ...currentState.customerData, address: address }
      };
      break;

    case 'CONFIRM':
      if (userInput.toLowerCase() === 'confirm') {
        shouldCreateOrder = true;
        nextReply = "Creating your order...";
      } else if (userInput.toLowerCase() === 'cancel') {
        newState = { step: 'START', selectedItems: [], customerData: {} };
        nextReply = "Order cancelled. Type anything to start over.";
      } else {
        nextReply = 'Please reply "CONFIRM" to place your order or "CANCEL" to start over.';
      }
      break;

    default:
      newState = { step: 'START', selectedItems: [], customerData: {} };
      nextReply = `Welcome to ${store.name}! Type anything to see our products.`;
      break;
  }

  // Update chat state
  await supabase
    .from('wa_chats')
    .update({
      state: newState.step,
      context: newState,
      last_message_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', chatState.id);

  // Create order if confirmed
  if (shouldCreateOrder) {
    const orderId = await createOrder(supabase, message, store, newState);
    if (orderId) {
      nextReply = `Order created successfully! 🎉\n\nYour order ID: ${orderId.slice(0, 8)}\n\nPlease wait for payment instructions...`;
      
      // Reset chat state after order creation
      await supabase
        .from('wa_chats')
        .update({
          state: 'START',
          context: { step: 'START', selectedItems: [], customerData: {} },
        })
        .eq('id', chatState.id);
    }
  }

  // Send reply
  await sendWhatsAppMessage(message.chat_id, nextReply);

  return { ok: true, state: newState.step };
}

async function createOrder(supabase: any, message: InboundMessage, store: any, state: USSDState) {
  try {
    const subtotal = state.selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 0; // TODO: Calculate based on distance
    const total = subtotal + deliveryFee;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders_v2')
      .insert({
        store_id: message.tenant_id,
        vendor_id: store.vendor_id,
        chat_id: message.chat_id,
        customer_phone: message.from,
        customer_name: state.customerData.name,
        customer_address: { address: state.customerData.address },
        items: state.selectedItems,
        subtotal: subtotal,
        delivery_fee: deliveryFee,
        total: total,
        status: 'pending_payment',
        payment_provider: 'paystack',
        currency: 'NGN'
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      await sendWhatsAppMessage(message.chat_id, "Sorry, there was an error creating your order. Please try again.");
      return null;
    }

    // Create Paystack payment link
    const paymentLink = await createPaystackLink(order.id, total, state.customerData.name || 'Customer', message.from);
    
    if (paymentLink) {
      // Update order with payment link
      await supabase
        .from('orders_v2')
        .update({
          payment_link: paymentLink.authorization_url,
          payment_reference: paymentLink.reference
        })
        .eq('id', order.id);

      // Send payment link
      await sendWhatsAppMessage(message.chat_id, 
        `Payment Required 💳\n\nTotal: ₦${total.toFixed(2)}\n\nPay here: ${paymentLink.authorization_url}\n\nOnce payment is confirmed, we'll process your order!`);
    }

    return order.id;
  } catch (error) {
    console.error('Error in createOrder:', error);
    return null;
  }
}

async function createPaystackLink(orderId: string, amount: number, customerName: string, customerEmail: string) {
  try {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PAYSTACK_SECRET_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: customerEmail,
        amount: Math.round(amount * 100), // Convert to kobo
        currency: 'NGN',
        reference: `order_${orderId}_${Date.now()}`,
        callback_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/paystack-subscription-webhook`,
        metadata: {
          order_id: orderId,
          customer_name: customerName,
          source: 'whatsapp'
        }
      }),
    });

    const data = await response.json();
    
    if (data.status) {
      return data.data;
    } else {
      console.error('Paystack error:', data);
      return null;
    }
  } catch (error) {
    console.error('Error creating Paystack link:', error);
    return null;
  }
}

async function sendWhatsAppMessage(chatId: string, message: string) {
  try {
    // TODO: Implement actual WhatsApp provider message sending
    // This would integrate with your WhatsApp provider (Baileys, Cloud API, etc.)
    console.log(`Sending WhatsApp message to ${chatId}: ${message}`);
    
    // For now, just log the message
    // In production, this would call your WhatsApp provider API
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return false;
  }
}