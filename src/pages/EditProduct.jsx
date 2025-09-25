// src/pages/EditProduct.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "@/services/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";

const CLOUD_NAME = "dmkow18t0"; // your cloud name
const UPLOAD_PRESET = "vendora_unsigned"; // your unsigned preset

const EditProduct = () => {
  const { id } = useParams(); // productId from URL
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    imageUrl: "",
  });
  const [newImage, setNewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          const data = snap.data();
          if (data.ownerId !== user.uid) {
            setError("You are not authorized to edit this product.");
            return;
          }
          setForm({
            name: data.name,
            price: data.price,
            description: data.description,
            imageUrl: data.imageUrl || "",
          });
        } else {
          setError("Product not found.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load product.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id, user]);

  const handleChange = (e) =>
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

  const handleImageChange = (e) => {
    setNewImage(e.target.files[0]);
  };

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    const data = await res.json();
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let imageUrl = form.imageUrl;

      // upload new image if selected
      if (newImage) {
        imageUrl = await uploadImageToCloudinary(newImage);
      }

      const docRef = doc(db, "products", id);
      await updateDoc(docRef, {
        name: form.name,
        price: Number(form.price),
        description: form.description,
        imageUrl,
        updatedAt: serverTimestamp(),
      });

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Failed to update product.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center py-10">Loading...</p>;

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Edit Product</h2>
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div className="mb-4">
          <label className="block text-sm">Product Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>

        {/* Price */}
        <div className="mb-4">
          <label className="block text-sm">Price (₦)</label>
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>

        {/* Current Image Preview */}
        {form.imageUrl && (
          <div className="mb-4">
            <label className="block text-sm">Current Image</label>
            <img
              src={form.imageUrl}
              alt="Current product"
              className="w-full h-40 object-cover rounded border"
            />
          </div>
        )}

        {/* Upload New Image */}
        <div className="mb-4">
          <label className="block text-sm">Change Image</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded"
        >
          {loading ? "Updating..." : "Update Product"}
        </button>
      </form>
    </div>
  );
};

export default EditProduct;
