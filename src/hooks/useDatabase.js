import { useState, useEffect } from 'react';
import * as dbService from '@/services/db';
import { useAuth } from './useAuth';

/**
 * Hook for creating documents
 */
export const useCreateDocument = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createDocument = async (collection, data, customId = null) => {
    try {
      setLoading(true);
      setError(null);
      const id = await dbService.createDocument(collection, data, customId);
      return id;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createDocument, loading, error };
};

/**
 * Hook for fetching a single document
 */
export const useDocument = (collection, docId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!docId) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchDocument = async () => {
      try {
        setLoading(true);
        setError(null);
        const doc = await dbService.getDocument(collection, docId);
        setData(doc);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [collection, docId]);

  return { data, loading, error };
};

/**
 * Hook for fetching collections with queries
 */
export const useCollection = (collection, queryConstraints = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        setLoading(true);
        setError(null);
        const docs = await dbService.getCollection(collection, queryConstraints);
        setData(docs);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, [collection, JSON.stringify(queryConstraints)]);

  return { data, loading, error, refetch: () => fetchCollection() };
};

/**
 * Hook for real-time document listening
 */
export const useDocumentListener = (collection, docId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!docId) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = dbService.listenToDocument(collection, docId, (doc) => {
      setData(doc);
      setLoading(false);
    });

    return unsubscribe;
  }, [collection, docId]);

  return { data, loading, error };
};

/**
 * Hook for real-time collection listening
 */
export const useCollectionListener = (collection, queryConstraints = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = dbService.listenToCollection(collection, queryConstraints, (docs) => {
      setData(docs);
      setLoading(false);
    });

    return unsubscribe;
  }, [collection, JSON.stringify(queryConstraints)]);

  return { data, loading, error };
};

/**
 * Hook for seller-specific operations
 */
export const useSellerData = () => {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createStore = async (storeData) => {
    try {
      setLoading(true);
      setError(null);
      const storeId = await dbService.createStore(user.uid, storeData);
      return storeId;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (storeId, productData) => {
    try {
      setLoading(true);
      setError(null);
      const productId = await dbService.createProduct(storeId, productData);
      return productId;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSellerStores = async () => {
    try {
      setLoading(true);
      setError(null);
      const stores = await dbService.getSellerStores(user.uid);
      return stores;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSellerOrders = async (status = null) => {
    try {
      setLoading(true);
      setError(null);
      const orders = await dbService.getSellerOrders(user.uid, status);
      return orders;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createStore,
    createProduct,
    getSellerStores,
    getSellerOrders,
    loading,
    error
  };
};