import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from './firebase';

/**
 * Firebase Cloud Messaging service for push notifications
 */

// VAPID key for web push (get this from Firebase Console)
const VAPID_KEY = 'your-vapid-key';

/**
 * Request notification permission and get FCM token
 */
export const requestNotificationPermission = async () => {
  try {
    if (!messaging) {
      console.log('Messaging not supported');
      return null;
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      console.log('FCM Token:', token);
      return token;
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

/**
 * Listen to foreground messages
 */
export const listenToMessages = (callback) => {
  if (!messaging) return () => {};
  
  return onMessage(messaging, (payload) => {
    console.log('Message received in foreground:', payload);
    callback(payload);
  });
};

/**
 * Show local notification
 */
export const showLocalNotification = (title, options = {}) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    });
    
    // Auto close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);
    
    return notification;
  }
};

/**
 * Notification templates for Vendora
 */
export const NOTIFICATION_TEMPLATES = {
  // For sellers
  NEW_ORDER: {
    title: 'New Order Received!',
    getBody: (customerName, amount) => `Order from ${customerName} - ₦${amount}`,
    icon: '/icons/order.png'
  },
  
  ORDER_PAID: {
    title: 'Payment Confirmed',
    getBody: (orderId) => `Payment received for order #${orderId}`,
    icon: '/icons/payment.png'
  },
  
  DELIVERY_ASSIGNED: {
    title: 'Rider Assigned',
    getBody: (riderName) => `${riderName} will pickup your order`,
    icon: '/icons/delivery.png'
  },
  
  // For customers
  ORDER_CONFIRMED: {
    title: 'Order Confirmed',
    getBody: (orderId) => `Your order #${orderId} has been confirmed`,
    icon: '/icons/confirmed.png'
  },
  
  ORDER_SHIPPED: {
    title: 'Order Shipped',
    getBody: (orderId) => `Your order #${orderId} is on the way`,
    icon: '/icons/shipped.png'
  },
  
  ORDER_DELIVERED: {
    title: 'Order Delivered',
    getBody: (orderId) => `Your order #${orderId} has been delivered`,
    icon: '/icons/delivered.png'
  },
  
  // For riders
  NEW_DELIVERY: {
    title: 'New Delivery Request',
    getBody: (distance, amount) => `${distance}km away - ₦${amount} delivery fee`,
    icon: '/icons/rider.png'
  }
};

/**
 * Send notification to user
 */
export const sendNotification = (template, data, onClick = null) => {
  const notification = showLocalNotification(
    template.title,
    {
      body: template.getBody(...data),
      icon: template.icon,
      tag: `vendora-${Date.now()}`,
      requireInteraction: true
    }
  );
  
  if (notification && onClick) {
    notification.onclick = onClick;
  }
  
  return notification;
};

/**
 * Send order notification to seller
 */
export const notifySellerNewOrder = (customerName, amount, orderId) => {
  return sendNotification(
    NOTIFICATION_TEMPLATES.NEW_ORDER,
    [customerName, amount],
    () => {
      // Navigate to order details
      window.location.href = `/dashboard/orders/${orderId}`;
    }
  );
};

/**
 * Send delivery notification to customer
 */
export const notifyCustomerOrderUpdate = (status, orderId) => {
  let template;
  
  switch (status) {
    case 'confirmed':
      template = NOTIFICATION_TEMPLATES.ORDER_CONFIRMED;
      break;
    case 'shipped':
      template = NOTIFICATION_TEMPLATES.ORDER_SHIPPED;
      break;
    case 'delivered':
      template = NOTIFICATION_TEMPLATES.ORDER_DELIVERED;
      break;
    default:
      return;
  }
  
  return sendNotification(
    template,
    [orderId],
    () => {
      // Navigate to order tracking
      window.location.href = `/track/${orderId}`;
    }
  );
};

/**
 * Send delivery request to rider
 */
export const notifyRiderNewDelivery = (distance, amount, orderId) => {
  return sendNotification(
    NOTIFICATION_TEMPLATES.NEW_DELIVERY,
    [distance, amount],
    () => {
      // Navigate to delivery details
      window.location.href = `/delivery/${orderId}`;
    }
  );
};

/**
 * Initialize push notifications for the app
 */
export const initializeNotifications = async (userId) => {
  try {
    const token = await requestNotificationPermission();
    
    if (token) {
      // Save token to user profile for server-side notifications
      // This would typically be saved to Firestore
      console.log('FCM token saved for user:', userId);
      
      // Listen to foreground messages
      const unsubscribe = listenToMessages((payload) => {
        // Handle foreground notification
        showLocalNotification(payload.notification.title, {
          body: payload.notification.body,
          icon: payload.notification.icon
        });
      });
      
      return { token, unsubscribe };
    }
    
    return null;
  } catch (error) {
    console.error('Error initializing notifications:', error);
    return null;
  }
};