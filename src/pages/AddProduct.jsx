import { useState } from "react";
import { db } from "@/services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const AddProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    image: null, // store file object
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setForm((prev) => ({
        ...prev,
        image: files[0],
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.price || !form.description) {
      setError("All fields are required");
      return;
    }

    if (!form.image) {
      setError("Please select a product image");
      return;
    }

    setLoading(true);
    try {
      // 1. Upload image to Cloudinary
      const data = new FormData();
      data.append("file", form.image);
      data.append("upload_preset", "vendora_unsigned"); //  unsigned preset from cloudinary

      const res = await fetch(                          //for image upload on cloudinary pelu
        `https://api.cloudinary.com/v1_1/dmkow18t0/image/upload`,
        {
          method: "POST",
          body: data,
        }
      );

      const cloudinaryData = await res.json();
      if (!cloudinaryData.secure_url) {
        throw new Error("Image upload failed");
      }

      // 2. Save product details to Firestore
      await addDoc(collection(db, "products"), {
        name: form.name.trim(),
        price: Number(form.price),
        description: form.description.trim(),
        imageUrl: cloudinaryData.secure_url, // 👈 save image URL
        ownerId: user.uid,
        createdAt: serverTimestamp(),
      });

      navigate("/dashboard");
    } catch (err) {
      console.error("Add product error:", err);
      setError("Failed to save product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Add New Product</h2>
      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Product Name
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            required
          />
        </div>

        {/* Price */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Price (₦)
          </label>
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            required
            min="1"
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            rows="3"
            required
          />
        </div>

        {/* Image */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Product Image
          </label>
          <input
            name="image"
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            required
          />
        </div>

        {/* Error */}
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
        >
          {loading ? "Saving..." : "Save Product"}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
