// import { useParams } from "react-router-dom";
// import { useState, useEffect } from "react";
// import { product } from "../constants";
// import { useCart } from "../constants/Context";
// import { FormatCurrency } from "../constants";

// function ProductDetails() {
//     const { id } = useParams();
//     console.log(typeof id);
//     // const id = 1
//     const { addToCart } = useCart();
//     const [productDetails, setProductDetails] = useState(null);

//     useEffect(() => {
//         const foundProduct = product.find((item) => item.id === parseInt(id));
//         setProductDetails(foundProduct);
//     }, [id]);

//     if (!productDetails) {
//         return <p className="text-center text-gray-500">Loading product details...</p>;
//     }

//     return (
//         <div className="container mx-auto p-4 mt-24 md:p-8">
//             <div className="grid md:grid-cols-2 gap-8">
//                 {/* Product Image */}
//                 <div>
//                     <img
//                         src={productDetails.cover}
//                         alt={productDetails.name}
//                         className="w-full h-[400px] object-cover rounded-lg shadow-md"
//                     />
//                 </div>
//                 {/* Product Info */}
//                 <div>
//                     <h1 className="text-2xl font-bold text-white-900">{productDetails.name}</h1>
//                     <p className="text-gray-700 mt-4">{productDetails.desc}</p>

//                     <div>
//                         vendor detials
//                     </div>
//                     <button
//                         onClick={() => addToCart(productDetails)}
//                         className="mt-6 bg-p2 text-white py-2 px-5 rounded-lg font-medium hover:bg-p3 transition"
//                     >
//                         Add to Cart
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default ProductDetails;



import { Link, useParams } from "react-router-dom";
import { useCart } from "../constants/Context";
import { FormatCurrency, product } from "../constants";

const ProductDetails = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const selectedProduct = product.find((item) => item.id === Number(id));

    if (!selectedProduct) {
        return <p className="text-center text-red-500">Product not found!</p>;
    }

    return (
        <div className="container  mt-24 mx-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Image */}
                <img
                    src={selectedProduct.cover}
                    alt={selectedProduct.name}
                    className="w-full h-96 object-cover rounded-lg shadow-md"
                />

                {/* Product Info */}
                <div>
                    <h1 className="text-3xl font-bold text-white-900">{selectedProduct.name}</h1>
                    <p className="text-lg text-gray-700 mt-2">{selectedProduct.desc}</p>
                    <p className="text-lg text-white font-bold mt-2">{FormatCurrency(selectedProduct.price)}</p>

                    {/* Vendor Details */}
                    <Link to={`/vendor/${selectedProduct.vendor.id}`}>
                        <div className="mt-4 p-4 border rounded-lg bg-gray-100">
                            <h2 className="text-xl text-black-100 font-semibold">Vendor Information</h2>
                            <div className="flex items-center gap-10"
                            >
                                <img
                                    src={selectedProduct.vendor.cover}
                                    alt={selectedProduct.vendor.name}
                                    className="w-30 h-30 object-cover rounded"
                                />
                                <div>
                                    <p className="text-gray-700"><strong>Name:</strong> {selectedProduct.vendor.name}</p>
                                    <p className="text-gray-700"><strong>Location:</strong> {selectedProduct.vendor.location}</p>
                                    <p className="text-gray-700"><strong>Contact:</strong> {selectedProduct.vendor.contact}</p>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Add to Cart Button */}
                    <button
                        onClick={() => addToCart(selectedProduct)}
                        className="mt-6 bg-p2 text-white py-2 px-6 rounded-lg text-lg font-semibold hover:bg-p3 transition"
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;