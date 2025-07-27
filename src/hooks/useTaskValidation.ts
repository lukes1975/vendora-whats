import { supabase } from "@/integrations/supabase/client";

interface TaskValidationResult {
  isCompleted: boolean;
  reason?: string;
  data?: any;
}

export const useTaskValidation = () => {
  
  const validateTask = async (taskId: string, userId: string): Promise<TaskValidationResult> => {
    try {
      switch (taskId) {
        case 'add_first_product':
          return await validateFirstProduct(userId);
        
        case 'customize_storefront':
          return await validateStorefrontCustomization(userId);
        
        case 'set_store_link':
          return await validateStoreLink(userId);
        
        case 'connect_payout_account':
          return await validatePayoutAccount(userId);
        
        case 'set_delivery_options':
          return await validateDeliveryOptions(userId);
        
        case 'set_notification_preference':
          return await validateNotificationPreference(userId);
        
        case 'connect_whatsapp':
          return await validateWhatsApp(userId);
        
        case 'add_business_info':
          return await validateBusinessInfo(userId);
        
        case 'choose_selling_method':
          return await validateSellingMethod(userId);
        
        case 'preview_store':
          return await validateStorePreview(userId);
        
        case 'share_store_link':
          return await validateStoreShare(userId);
        
        case 'launch_store':
          return await validateStoreLaunch(userId);
        
        default:
          return { isCompleted: false, reason: 'Unknown task' };
      }
    } catch (error) {
      console.error(`Error validating task ${taskId}:`, error);
      return { isCompleted: false, reason: 'Validation error' };
    }
  };

  const validateFirstProduct = async (userId: string): Promise<TaskValidationResult> => {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name')
      .eq('vendor_id', userId)
      .limit(1);

    if (error) throw error;
    
    return {
      isCompleted: products && products.length > 0,
      reason: products && products.length > 0 ? 'Product added' : 'No products found',
      data: { productCount: products?.length || 0 }
    };
  };

  const validateStorefrontCustomization = async (userId: string): Promise<TaskValidationResult> => {
    const { data: store, error } = await supabase
      .from('stores')
      .select('name, description, logo_url')
      .eq('vendor_id', userId)
      .single();

    if (error) throw error;
    
    const hasCustomization = store && (
      (store.name && store.name !== 'My Store') || 
      store.description || 
      store.logo_url
    );
    
    return {
      isCompleted: !!hasCustomization,
      reason: hasCustomization ? 'Store customized' : 'Store needs customization',
      data: { 
        hasName: store?.name && store.name !== 'My Store',
        hasDescription: !!store?.description,
        hasLogo: !!store?.logo_url
      }
    };
  };

  const validateStoreLink = async (userId: string): Promise<TaskValidationResult> => {
    const { data: store, error } = await supabase
      .from('stores')
      .select('slug')
      .eq('vendor_id', userId)
      .single();

    if (error) throw error;
    
    return {
      isCompleted: !!store?.slug,
      reason: store?.slug ? 'Store link set' : 'Store link not set',
      data: { slug: store?.slug }
    };
  };

  const validatePayoutAccount = async (userId: string): Promise<TaskValidationResult> => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('paystack_customer_code')
      .eq('id', userId)
      .single();

    if (error) throw error;
    
    return {
      isCompleted: !!profile?.paystack_customer_code,
      reason: profile?.paystack_customer_code ? 'Payout account connected' : 'No payout account',
      data: { hasPaystackAccount: !!profile?.paystack_customer_code }
    };
  };

  const validateDeliveryOptions = async (userId: string): Promise<TaskValidationResult> => {
    // For now, we'll consider delivery options set if WhatsApp is connected
    // This can be expanded when delivery options are properly implemented
    const { data: store, error } = await supabase
      .from('stores')
      .select('whatsapp_number')
      .eq('vendor_id', userId)
      .single();

    if (error) throw error;
    
    return {
      isCompleted: !!store?.whatsapp_number,
      reason: store?.whatsapp_number ? 'Delivery via WhatsApp set' : 'No delivery method set',
      data: { hasWhatsApp: !!store?.whatsapp_number }
    };
  };

  const validateNotificationPreference = async (userId: string): Promise<TaskValidationResult> => {
    // Default to completed - notification preferences can be set later
    return {
      isCompleted: true,
      reason: 'Default notification preferences applied',
      data: { useDefault: true }
    };
  };

  const validateWhatsApp = async (userId: string): Promise<TaskValidationResult> => {
    const { data: store, error } = await supabase
      .from('stores')
      .select('whatsapp_number')
      .eq('vendor_id', userId)
      .single();

    if (error) throw error;
    
    return {
      isCompleted: !!store?.whatsapp_number,
      reason: store?.whatsapp_number ? 'WhatsApp connected' : 'WhatsApp not connected',
      data: { whatsappNumber: store?.whatsapp_number }
    };
  };

  const validateBusinessInfo = async (userId: string): Promise<TaskValidationResult> => {
    const [{ data: profile }, { data: store }] = await Promise.all([
      supabase.from('profiles').select('full_name').eq('id', userId).single(),
      supabase.from('stores').select('name').eq('vendor_id', userId).single()
    ]);
    
    const hasInfo = profile?.full_name && store?.name && store.name !== 'My Store';
    
    return {
      isCompleted: !!hasInfo,
      reason: hasInfo ? 'Business info complete' : 'Business info incomplete',
      data: { 
        hasFullName: !!profile?.full_name,
        hasStoreName: !!(store?.name && store.name !== 'My Store')
      }
    };
  };

  const validateSellingMethod = async (userId: string): Promise<TaskValidationResult> => {
    // Consider selling method chosen if user has products
    const { data: products, error } = await supabase
      .from('products')
      .select('id')
      .eq('vendor_id', userId)
      .limit(1);

    if (error) throw error;
    
    return {
      isCompleted: products && products.length > 0,
      reason: products && products.length > 0 ? 'Selling method chosen' : 'No selling method chosen',
      data: { hasProducts: products && products.length > 0 }
    };
  };

  const validateStorePreview = async (userId: string): Promise<TaskValidationResult> => {
    // Consider preview completed if store has basic setup
    const [{ data: store }, { data: products }] = await Promise.all([
      supabase.from('stores').select('name, slug').eq('vendor_id', userId).single(),
      supabase.from('products').select('id').eq('vendor_id', userId).limit(1)
    ]);
    
    const hasPreview = store?.name && products && products.length > 0;
    
    return {
      isCompleted: !!hasPreview,
      reason: hasPreview ? 'Store ready for preview' : 'Store not ready for preview',
      data: { 
        hasStore: !!store?.name,
        hasProducts: products && products.length > 0
      }
    };
  };

  const validateStoreShare = async (userId: string): Promise<TaskValidationResult> => {
    const { data: store, error } = await supabase
      .from('stores')
      .select('slug')
      .eq('vendor_id', userId)
      .single();

    if (error) throw error;
    
    return {
      isCompleted: !!store?.slug,
      reason: store?.slug ? 'Store link ready to share' : 'Store link not set',
      data: { slug: store?.slug }
    };
  };

  const validateStoreLaunch = async (userId: string): Promise<TaskValidationResult> => {
    // Consider launched if has received orders or manually marked
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id')
      .eq('vendor_id', userId)
      .limit(1);

    if (error) throw error;
    
    return {
      isCompleted: orders && orders.length > 0,
      reason: orders && orders.length > 0 ? 'Store has received orders' : 'Store not launched',
      data: { hasOrders: orders && orders.length > 0 }
    };
  };

  return {
    validateTask,
    validateFirstProduct,
    validateStorefrontCustomization,
    validateStoreLink,
    validatePayoutAccount,
    validateDeliveryOptions,
    validateNotificationPreference,
    validateWhatsApp,
    validateBusinessInfo,
    validateSellingMethod,
    validateStorePreview,
    validateStoreShare,
    validateStoreLaunch
  };
};