import { useParams } from "react-router-dom";
import { FormatCurrency, product } from "../constants";
import { useCart } from "../constants/Context";

function VendorProfile() {
    const { id } = useParams();
    const vendorId = parseInt(id)
    const { addToCart } = useCart();

    // Find all products by this vendor
    const vendorProducts = product.filter(p => p.vendor.id === vendorId);

    if (vendorProducts.length === 0) {
        return <p className="text-center text-gray-500 mt-10">Vendor not found or has no products.</p>;
    }

    const vendor = vendorProducts[0].vendor;

    return (
        <div className="container mt-24 mx-auto p-5">
            <div className="bg-white shadow-md rounded-lg p-6 text-center">
                <img src={vendor.cover} alt={vendor.name} className="w-24 h-24 object-cover rounded-full mx-auto" />
                <h2 className="text-xl font-semibold mt-3">{vendor.name}</h2>
                <p className="text-gray-600">{vendor.location}</p>
                <p className="text-gray-600">Contact: {vendor.contact}</p>
            </div>

            <h3 className="mt-6 text-lg font-semibold">Products by {vendor.name}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {vendorProducts.map(prod => (
                    <div key={prod.id} className="bg-white shadow rounded-lg p-4">
                        <img src={prod.cover} alt={prod.name} className="w-full h-40 object-cover rounded" />
                        <h4 className="text-md font-semibold mt-2">{prod.name}</h4>
                        <p className="text-gray-600 text-sm">{FormatCurrency(prod.price)}</p>

                        <button
                            onClick={() => addToCart(prod)}
                            className="mt-6 bg-p2 text-white py-2 px-6 rounded-lg text-lg font-semibold hover:bg-p3 transition"
                        >
                            Add to Cart
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default VendorProfile;
