import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  addDoc,
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Collections
 */
export const COLLECTIONS = {
  USERS: 'users',
  STORES: 'stores',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  RIDERS: 'riders',
  ANALYTICS: 'analytics'
};

/**
 * Generic CRUD operations
 */

// Create document
export const createDocument = async (collectionName, data, customId = null) => {
  try {
    const docData = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    if (customId) {
      await setDoc(doc(db, collectionName, customId), docData);
      return customId;
    } else {
      const docRef = await addDoc(collection(db, collectionName), docData);
      return docRef.id;
    }
  } catch (error) {
    console.error(`Error creating document in ${collectionName}:`, error);
    throw error;
  }
};

// Read document
export const getDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    throw error;
  }
};

// Update document
export const updateDocument = async (collectionName, docId, updates) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(docRef, updateData);
    return updateData;
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
};

// Delete document
export const deleteDocument = async (collectionName, docId) => {
  try {
    await deleteDoc(doc(db, collectionName, docId));
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw error;
  }
};

// Get collection with query
export const getCollection = async (collectionName, queryConstraints = []) => {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...queryConstraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error getting collection ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Store-specific operations
 */

// Create store for seller
export const createStore = async (sellerId, storeData) => {
  try {
    const storeId = await createDocument(COLLECTIONS.STORES, {
      ...storeData,
      sellerId,
      isActive: true,
      productsCount: 0,
      ordersCount: 0
    });
    
    return storeId;
  } catch (error) {
    throw new Error('Failed to create store');
  }
};

// Get stores by seller
export const getSellerStores = async (sellerId) => {
  try {
    return await getCollection(COLLECTIONS.STORES, [
      where('sellerId', '==', sellerId),
      orderBy('createdAt', 'desc')
    ]);
  } catch (error) {
    throw new Error('Failed to get seller stores');
  }
};

// Get store by subdomain or ID
export const getStore = async (identifier, bySubdomain = false) => {
  try {
    if (bySubdomain) {
      const stores = await getCollection(COLLECTIONS.STORES, [
        where('subdomain', '==', identifier),
        where('isActive', '==', true),
        limit(1)
      ]);
      return stores[0] || null;
    } else {
      return await getDocument(COLLECTIONS.STORES, identifier);
    }
  } catch (error) {
    throw new Error('Failed to get store');
  }
};

/**
 * Product-specific operations
 */

// Create product
export const createProduct = async (storeId, productData) => {
  try {
    const productId = await createDocument(COLLECTIONS.PRODUCTS, {
      ...productData,
      storeId,
      isActive: true,
      viewsCount: 0,
      ordersCount: 0
    });
    
    // Update store products count
    const storeRef = doc(db, COLLECTIONS.STORES, storeId);
    await updateDoc(storeRef, {
      productsCount: increment(1)
    });
    
    return productId;
  } catch (error) {
    throw new Error('Failed to create product');
  }
};

// Get products by store
export const getStoreProducts = async (storeId, isActive = true) => {
  try {
    const constraints = [
      where('storeId', '==', storeId),
      orderBy('createdAt', 'desc')
    ];
    
    if (isActive !== null) {
      constraints.unshift(where('isActive', '==', isActive));
    }
    
    return await getCollection(COLLECTIONS.PRODUCTS, constraints);
  } catch (error) {
    throw new Error('Failed to get store products');
  }
};

// Get product by ID
export const getProduct = async (productId) => {
  try {
    return await getDocument(COLLECTIONS.PRODUCTS, productId);
  } catch (error) {
    throw new Error('Failed to get product');
  }
};

// Search products
export const searchProducts = async (searchTerm, storeId = null) => {
  try {
    let constraints = [
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    ];
    
    if (storeId) {
      constraints.unshift(where('storeId', '==', storeId));
    }
    
    // Note: Firestore doesn't support full-text search
    // This is a basic implementation - consider using Algolia for better search
    const products = await getCollection(COLLECTIONS.PRODUCTS, constraints);
    
    return products.filter(product => 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    throw new Error('Failed to search products');
  }
};

/**
 * Order-specific operations
 */

// Create order
export const createOrder = async (orderData) => {
  try {
    const orderId = await createDocument(COLLECTIONS.ORDERS, {
      ...orderData,
      status: 'pending',
      paymentStatus: 'pending'
    });
    
    // Update store orders count
    if (orderData.storeId) {
      const storeRef = doc(db, COLLECTIONS.STORES, orderData.storeId);
      await updateDoc(storeRef, {
        ordersCount: increment(1)
      });
    }
    
    return orderId;
  } catch (error) {
    throw new Error('Failed to create order');
  }
};

// Get orders by store/seller
export const getSellerOrders = async (sellerId, status = null) => {
  try {
    let constraints = [
      where('sellerId', '==', sellerId),
      orderBy('createdAt', 'desc')
    ];
    
    if (status) {
      constraints.unshift(where('status', '==', status));
    }
    
    return await getCollection(COLLECTIONS.ORDERS, constraints);
  } catch (error) {
    throw new Error('Failed to get seller orders');
  }
};

// Get orders by customer
export const getCustomerOrders = async (customerId) => {
  try {
    return await getCollection(COLLECTIONS.ORDERS, [
      where('customerId', '==', customerId),
      orderBy('createdAt', 'desc')
    ]);
  } catch (error) {
    throw new Error('Failed to get customer orders');
  }
};

// Update order status
export const updateOrderStatus = async (orderId, status, updates = {}) => {
  try {
    return await updateDocument(COLLECTIONS.ORDERS, orderId, {
      status,
      ...updates
    });
  } catch (error) {
    throw new Error('Failed to update order status');
  }
};

/**
 * Real-time listeners
 */

// Listen to document changes
export const listenToDocument = (collectionName, docId, callback) => {
  const docRef = doc(db, collectionName, docId);
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    } else {
      callback(null);
    }
  });
};

// Listen to collection changes
export const listenToCollection = (collectionName, queryConstraints, callback) => {
  const collectionRef = collection(db, collectionName);
  const q = query(collectionRef, ...queryConstraints);
  
  return onSnapshot(q, (querySnapshot) => {
    const docs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(docs);
  });
};