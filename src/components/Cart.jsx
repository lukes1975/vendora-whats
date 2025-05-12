// import { FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useCart } from "../constants/Context";
import { BackIcon, FormatCurrency } from "../constants";
import { useNavigate } from "react-router-dom";

// eslint-disable-next-line react/prop-types
const Cart = () => {
    const { cart, removeFromCart, clearCart } = useCart();

    // Calculate total price
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const navigate = useNavigate();
    return (
        <div className="absolute z-[60] block w-full">
            <div
                className={`fixed right-0 top-0 w-full bg-black cursor-pointer bg-opacity-90 transition-transform duration-300 ease-in-out 
                    }`}
            >
                <div className="bg-white text-black shadow-2xl rounded-s-[5%] p-4 w-[60%] h-[100vh] md:w-[50%]  sm:w-[80%] lg:w-[40%] ml-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center font-bold text-xl px-4 py-2 border-b">
                        <p>Cart Items</p>
                        <button
   onClick={() => navigate(-1)}
                               className="smHidden cursor-pointer border-[1px] p-1 rounded-xl"

                        >
                            <BackIcon />
                        </button>
                    </div>

                    {/* Cart Items List */}
                    <div className="overflow-y-auto h-[75vh] mt-4">
                        {cart.length === 0 ? (
                            <p className="text-gray-500 text-center mt-10">Your cart is empty.</p>
                        ) : (
                            cart.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex justify-between items-center p-3 border-b gap-3"
                                >
                                    <img
                                        src={item.cover}
                                        alt={item.name}
                                        className="w-16 h-16 rounded-lg object-cover"
                                    />
                                    <p className="flex-1 ml-4">{item.name}</p>
                                    <p className="text-green-600 font-bold">{FormatCurrency(item.price)}</p>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="bg-red-300 text-white px-1 py-1 rounded-md"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                        </svg>

                                    </button>
                                </div>
                            ))
                        )}

                        <button
                            onClick={clearCart}
                            className="w-full mt-2 bg-gray-700 text-white px-4 py-2 rounded-md"
                        >
                            Clear Cart
                        </button>
                    </div>

                    {/* Total and Checkout */}
                    {cart.length > 0 && (
                        <div className="fixed bottom-0 w-[60%] md:w-[50%] lg:w-[40%] bg-white shadow-lg p-4">
                            <div className="flex justify-between font-semibold text-lg border-t pt-3">
                                <span>Total:</span>
                                <span>{FormatCurrency(total)}</span>
                            </div>

                            <Link
                                to="/checkout"
                                className="block w-full mt-3 bg-black text-white text-center py-3 rounded-lg hover:bg-opacity-90"
                            >
                                Proceed to Checkout
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Cart;
