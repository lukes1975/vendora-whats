import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "@/services/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";

const Dashboard = () => {
  const { user, userProfile } = useAuth();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "products"),
      where("ownerId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(items);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <h1 className="text-2xl font-bold mb-4">
        Welcome, {userProfile?.displayName || user?.email} 👋
      </h1>

      <p className="text-gray-700 mb-8">
        You’re now part of{" "}
        <span className="font-semibold text-indigo-600">Vendora</span> — built
        for fuoye students like you to sell smarter, reach more buyers, and grow
        with confidence. 🚀
      </p>

      <div className="grid gap-6 md:grid-cols-3">
        {/* My Products */}
        <div className="bg-white shadow rounded-lg p-6 flex flex-col">
          <h2 className="text-lg font-semibold mb-4">📦 My Products</h2>

          {products.length === 0 ? (
            <p className="text-sm text-gray-500 mb-4">
              No products yet. Add your first one!
            </p>
          ) : (
            <div className="grid gap-4">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="border rounded-lg shadow-sm hover:shadow-md transition bg-gray-50 overflow-hidden"
                >
                  {/* Image */}
                  {p.imageUrl && (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-40 object-cover border-b"
                    />
                  )}

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800">{p.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      ₦{p.price?.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      {p.description}
                    </p>

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/edit-product/${p.id}`}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Product Button */}
          <Link
            to="/add-product"
            className="mt-6 inline-block text-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            + Add Product
          </Link>
        </div>

        {/* Orders */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">🛒 Orders</h2>
          <p className="text-sm text-gray-500">
            Track and manage incoming customer orders in one place.
          </p>
        </div>

        {/* Analytics */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">📊 Analytics</h2>
          <p className="text-sm text-gray-500">
            Insights coming soon — see how your business grows with Vendora.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
