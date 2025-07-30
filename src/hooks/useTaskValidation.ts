import { supabase } from "@/integrations/supabase/client";

interface TaskValidationResult {
  isCompleted: boolean;
  reason?: string;
  data?: any;
}

export const useTaskValidation = () => {
  
  const validateTask = async (taskId: string, userId: string): Promise<TaskValidationResult> => {
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
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
        retryCount++;
        console.warn(`Task validation attempt ${retryCount} failed for ${taskId}:`, error);
        
        if (retryCount >= maxRetries) {
          console.error(`Task validation failed after ${maxRetries} attempts for ${taskId}:`, error);
          return { isCompleted: false, reason: `Validation failed: ${error.message}` };
        }
        
        // Exponential backoff: wait 1s, 2s, 4s between retries
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount - 1) * 1000));
      }
    }
    
    return { isCompleted: false, reason: 'Validation timeout' };
  };

  const validateFirstProduct = async (userId: string): Promise<TaskValidationResult> => {
    try {
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
    } catch (error) {
      // Fallback validation - assume incomplete on error
      console.warn('First product validation failed, assuming incomplete:', error);
      return {
        isCompleted: false,
        reason: 'Unable to verify product status',
        data: { productCount: 0 }
      };
    }
  };

  const validateStorefrontCustomization = async (userId: string): Promise<TaskValidationResult> => {
    try {
      const { data: store, error } = await supabase
        .from('stores')
        .select('name, description, logo_url')
        .eq('vendor_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
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
    } catch (error) {
      console.warn('Storefront customization validation failed:', error);
      return {
        isCompleted: false,
        reason: 'Unable to verify store customization',
        data: { hasName: false, hasDescription: false, hasLogo: false }
      };
    }
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
    const { data: bankAccount, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    return {
      isCompleted: !!bankAccount,
      reason: bankAccount ? 'Bank account connected' : 'No bank account found',
      data: { hasBankAccount: !!bankAccount }
    };
  };

  const validateDeliveryOptions = async (userId: string): Promise<TaskValidationResult> => {
    const { data: deliveryOptions, error } = await supabase
      .from('delivery_options')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error && error.code !== 'PGRST116') throw error;
    
    const hasOptions = deliveryOptions && deliveryOptions.length > 0;
    
    return {
      isCompleted: !!hasOptions,
      reason: hasOptions ? 'Delivery options configured' : 'No delivery options set',
      data: { optionsCount: deliveryOptions?.length || 0 }
    };
  };

  const validateNotificationPreference = async (userId: string): Promise<TaskValidationResult> => {
    const { data: preferences, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    return {
      isCompleted: !!preferences,
      reason: preferences ? 'Notification preferences set' : 'Default preferences will be used',
      data: { hasPreferences: !!preferences }
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
    const { data: sellingMethod, error } = await supabase
      .from('selling_methods')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    return {
      isCompleted: !!sellingMethod,
      reason: sellingMethod ? 'Selling method chosen' : 'No selling method selected',
      data: { method: sellingMethod?.method }
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