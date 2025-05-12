import  { useState } from "react";
import { Link } from "react-router-dom";
import { CartIcon, FormatCurrency, Truncate } from "../constants";
import { useCart } from "../constants/Context";

// eslint-disable-next-line react/prop-types
const ProductCard = ({ id, name, price, cover, description, data }) => {
    const { addToCart } = useCart();
    const [showNotification, setShowNotification] = useState(false);

    const handleAddToCart = () => {
        addToCart({ id, name, price, cover, description, data });

        // Show notification
        setShowNotification(true);

        // Hide after 2 seconds
        setTimeout(() => {
            setShowNotification(false);
        }, 2000);
    };

    return (
        <div className="bg-white rounded-lg width-full w-[250px] fullWidthSm shadow-md p-4 transition duration-300 hover:shadow-lg relative">
            <Link to={`/product/${id}`} className="block">
                <img src={cover} alt={name} className="w-full h-48 object-cover rounded-md" />
            </Link>
            <div>
                <div className="flex items-center justify-between mt-3">
                    <h3 className="text-sm font-semibold text-gray-800">{name}</h3>
                    <button
                        onClick={handleAddToCart}
                        className="mt-3 flex items-center justify-center gap-2 w-[30px] bg-p2 text-white py-1 rounded-lg text-sm font-medium hover:bg-p3 transition"
                    >
                        <CartIcon className="size-3" />
                    </button>
                </div>

                <p className="text-gray-600 text-sm">{Truncate(description)}</p>

                <div className="flex items-center justify-between mt-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                    </svg>
                    <p className="text-lg font-bold text-black">{FormatCurrency(price)}</p>
                </div>
            </div>

            {/* Custom Notification */}
            {showNotification && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-sm px-3 py-1 rounded-md shadow-lg transition-all duration-300">
                    ✅ Added to Cart!
                </div>
            )}
        </div>
    );
};

export default ProductCard;
