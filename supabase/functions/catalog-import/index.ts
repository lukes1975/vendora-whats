import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ImportProduct {
  name: string;
  price: number;
  description?: string;
}

interface ImportRequest {
  vendor_id: string;
  products: ImportProduct[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify API key
    const apiKey = Deno.env.get('CATALOG_IMPORT_API_KEY');
    if (!apiKey) {
      console.error('CATALOG_IMPORT_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check authorization header or query param
    const authHeader = req.headers.get('Authorization');
    const url = new URL(req.url);
    const tokenParam = url.searchParams.get('token');
    
    const providedToken = authHeader?.replace('Bearer ', '') || tokenParam;
    
    if (!providedToken || providedToken !== apiKey) {
      console.warn('Unauthorized catalog import attempt');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }), 
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: ImportRequest = await req.json();
    
    if (!body.vendor_id || !Array.isArray(body.products)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request format. vendor_id and products array required.' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verify vendor exists
    const { data: vendor, error: vendorError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', body.vendor_id)
      .single();

    if (vendorError || !vendor) {
      console.error('Vendor not found:', body.vendor_id);
      return new Response(
        JSON.stringify({ error: 'Vendor not found' }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get or create store for vendor
    let { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('vendor_id', body.vendor_id)
      .eq('is_active', true)
      .single();

    if (storeError || !store) {
      // Create a default store if none exists
      const { data: newStore, error: createStoreError } = await supabase
        .from('stores')
        .insert({
          vendor_id: body.vendor_id,
          name: 'WhatsApp Catalog Store',
          description: 'Store created from WhatsApp Business catalog import',
          is_active: true
        })
        .select('id')
        .single();

      if (createStoreError || !newStore) {
        console.error('Failed to create store:', createStoreError);
        return new Response(
          JSON.stringify({ error: 'Failed to create store' }), 
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      store = newStore;
    }

    // Process products
    const results = {
      created: 0,
      updated: 0,
      errors: [] as string[]
    };

    for (const product of body.products) {
      try {
        // Validate product data
        if (!product.name || typeof product.price !== 'number' || product.price < 0) {
          results.errors.push(`Invalid product data: ${JSON.stringify(product)}`);
          continue;
        }

        // Check if product already exists (by name in same store)
        const { data: existingProduct } = await supabase
          .from('products')
          .select('id')
          .eq('store_id', store.id)
          .eq('name', product.name)
          .single();

        if (existingProduct) {
          // Update existing product
          const { error: updateError } = await supabase
            .from('products')
            .update({
              price: product.price,
              description: product.description || null,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingProduct.id);

          if (updateError) {
            results.errors.push(`Failed to update product "${product.name}": ${updateError.message}`);
          } else {
            results.updated++;
          }
        } else {
          // Create new product
          const { error: insertError } = await supabase
            .from('products')
            .insert({
              name: product.name,
              price: product.price,
              description: product.description || null,
              vendor_id: body.vendor_id,
              store_id: store.id,
              status: 'active'
            });

          if (insertError) {
            results.errors.push(`Failed to create product "${product.name}": ${insertError.message}`);
          } else {
            results.created++;
          }
        }
      } catch (error) {
        results.errors.push(`Error processing product "${product.name}": ${error.message}`);
      }
    }

    console.log(`Catalog import completed for vendor ${body.vendor_id}:`, results);

    return new Response(
      JSON.stringify({ 
        success: true, 
        summary: results,
        message: `Processed ${body.products.length} products: ${results.created} created, ${results.updated} updated${results.errors.length > 0 ? `, ${results.errors.length} errors` : ''}`
      }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Catalog import error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});