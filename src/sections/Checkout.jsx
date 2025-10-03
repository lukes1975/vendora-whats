// import { useState, useEffect, useRef } from 'react';
// import { PaystackButton } from 'react-paystack';
// import { useReactToPrint } from 'react-to-print';
// import { FormatCurrency, WebsiteName } from '../constants';

// export const Checkout = () => {
//     const [cart, setCart] = useState([]);
//     const receiptRef = useRef();
//     const [name, setName] = useState("");
//     const [location, setLocation] = useState("");
//     const [number, setNumber] = useState("");
//     const [verify, setVerify] = useState(false);

//     useEffect(() => {
//         const storedCart = localStorage.getItem('cart');
//         if (storedCart) {
//             setCart(JSON.parse(storedCart));
//         }
//     }, []);
//     console.log(cart);
    

//     useEffect(() => {
//         setVerify(!!(name && location && number));
//     }, [name, location, number]);

//     const handlePaymentSuccess = () => {
//         if (!name || !location || !number) {
//             alert('Please enter all delivery details');
//         } else {
//             alert('Payment Successful! Printing Receipt...');
//             localStorage.removeItem('cart');
//             setCart([]);
//             printReceipt();
//         }
//     };

//     const printReceipt = useReactToPrint({
//         content: () => receiptRef.current,
//     });

//     const paystackProps = {
//         email: "customer@example.com",
//         amount: cart.reduce((total, item) => total + item.price, 0) * 100,
//         publicKey: "pk_test_c475747d64897e53ad10325ad3a8cf138129e9f7",
//         onSuccess: handlePaymentSuccess,
//     };

//     return (
//         <div className="flex flex-col md:flex-row justify-between p-5 gap-5">
//             {/* Order Summary */}
//             <div className="w-full md:w-1/2 bg-white p-5 rounded-lg shadow-md">
//                 <h2 className="text-lg text-black-100 font-semibold mb-4">Order Summary</h2>
//                 {cart.length > 0 ? cart.map((item, index) => (
//                     <div key={index} className="flex items-center gap-3 border-b pb-2 mb-2">
//                         <img src={item.cover} alt={item.name} className="w-16 h-16 rounded" />
//                         <div>
//                             <h4 className="text-md text-blue-400 font-medium">{item.name}</h4>
//                             <p className="text-sm font-bold text-black">NGN {item.price}</p>
//                         </div>
//                     </div>
//                 )) : <p>No items in cart</p>}
//                 {cart.length > 0 && (
//                     <div className="font-bold text-blue-500 mt-3">
//                         Total Amount: {FormatCurrency(cart.reduce((total, item) => total + item.price, 0) / 100 * 100)}
//                     </div>
//                 )}
//                 {verify ? (
//                     <PaystackButton className="mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded cursor-pointer" {...paystackProps}>
//                         Buy Now
//                     </PaystackButton>
//                 ) : (
//                     <p className="text-red-500 mt-3">Please enter all delivery details</p>
//                 )}
//             </div>

//             {/* Delivery Details */}
//             <div className="w-full md:w-1/2 bg-white p-5 rounded-lg shadow-md">
//                 <h2 className="text-lg text-black-100 font-semibold mb-4">Delivery Details</h2>
//                 <form className="flex flex-col gap-3">
//                     <input type="text" onChange={e => setName(e.target.value)} value={name} placeholder="Full Name" className="w-full p-2 border rounded" required />
//                     <input type="text" onChange={e => setLocation(e.target.value)} value={location} placeholder="Address" className="w-full p-2 border rounded" required />
//                     <input type="text" onChange={e => setNumber(e.target.value)} value={number} placeholder="Phone Number" className="w-full p-2 border rounded" required />
//                 </form>
//             </div>

//             {/* Receipt */}
//             <div className="hidden" ref={receiptRef}>
//                 <div className="w-80 p-5 bg-white border-2 border-dashed text-center">
//                     <h2 className="text-lg font-semibold mb-3">Receipt</h2>
//                     <div className="flex items-center justify-between bg-black-100 rounded text-white p-2">
//                         <img src="/images/vendora.png" width={115} height={55} alt="logo" />
//                         <span>{WebsiteName}</span>
//                     </div>
//                     <div className="mt-4">
//                         <h3 className="underline">Buyer Details</h3>
//                         <p>Name: {name}</p>
//                         <p>Address: {location}</p>
//                         <p>Phone: {number}</p>
//                     </div>
//                     {cart.map((item, index) => (
//                         <div key={index} className="mt-3 p-2 bg-green-200 text-black rounded">
//                             <h4>{item.name}</h4>
//                             <p>Amount: NGN {item.price}</p>
//                         </div>
//                     ))}
//                     <p className="font-bold mt-3">Total: {FormatCurrency(cart.reduce((total, item) => total + item.price, 0) * 100)}</p>
//                     <p className="text-gray-500 text-sm mt-3">{new Date().toLocaleString()}</p>
//                 </div>
//             </div>
//         </div>
//     );
// };


import { useState, useEffect, useRef } from 'react';
import { PaystackButton } from 'react-paystack';
import { useReactToPrint } from 'react-to-print';
import { FormatCurrency, WebsiteName } from '../constants';

export const Checkout = () => {
  const [cart, setCart] = useState([]);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [number, setNumber] = useState('');
  const [verify, setVerify] = useState(false);
  const receiptRef = useRef();

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    setVerify(!!(name && location && number));
  }, [name, location, number]);

  const printReceipt = useReactToPrint({
    content: () => receiptRef.current,
  });

  const totalAmount = cart.reduce((total, item) => total + item.price, 0);

  const handlePaymentSuccess = () => {
    if (!name || !location || !number) {
      alert('Please enter all delivery details');
      return;
    }

    alert('Payment successful!');
    localStorage.removeItem('cart');
    setCart([]);
    printReceipt();
  };

  const paystackProps = {
    email: 'customer@example.com',
    amount: totalAmount * 100,
    publicKey: 'pk_test_c475747d64897e53ad10325ad3a8cf138129e9f7',
    onSuccess: handlePaymentSuccess,
  };

  // Group cart items by vendor
  const groupedByVendor = cart.reduce((acc, item) => {
    console.log(item?.data?.vendor?.name)
    const vendorName = item?.data?.vendor?.name || 'Unknown Vendor';
    if (!acc[vendorName]) {
      acc[vendorName] = [];
    }
    acc[vendorName].push(item);
    return acc;
  }, {});

  return (
    <div className="flex flex-col md:flex-row justify-between p-5 gap-5">
      {/* Order Summary */}
      <div className="w-full md:w-1/2 bg-white p-5 rounded-lg shadow-md">
        <h2 className="text-lg text-black font-semibold mb-4">Order Summary</h2>

        {cart.length > 0 ? (
          Object.entries(groupedByVendor).map(([vendorName, items], index) => (
            <div key={index} className="mb-6">
              <h3 className="text-md font-bold mb-2 text-blue-700">{vendorName} Products:</h3>
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 border-b pb-2 mb-2">
                  <img src={item.cover} alt={item.name} className="w-16 h-16 rounded" />
                  <div>
                    <h4 className="text-md text-blue-400 font-medium">{item.name}</h4>
                    <p className="text-sm font-bold text-black">₦{item.price.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <p>No items in cart</p>
        )}

        {cart.length > 0 && (
          <div className="font-bold text-blue-500 mt-3">
            Total Amount: ₦{totalAmount.toLocaleString()}
          </div>
        )}

        {verify ? (
          <PaystackButton
            className="mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded cursor-pointer"
            {...paystackProps}
          >
            Buy Now
          </PaystackButton>
        ) : (
          <p className="text-red-500 mt-3">Please enter all delivery details</p>
        )}
      </div>

      {/* Delivery Details */}
      <div className="w-full md:w-1/2 bg-white p-5 rounded-lg shadow-md">
        <h2 className="text-lg text-black font-semibold mb-4">Delivery Details</h2>
        <form className="flex flex-col gap-3">
          <input
            type="text"
            onChange={(e) => setName(e.target.value)}
            value={name}
            placeholder="Full Name"
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            onChange={(e) => setLocation(e.target.value)}
            value={location}
            placeholder="Address"
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            onChange={(e) => setNumber(e.target.value)}
            value={number}
            placeholder="Phone Number"
            className="w-full p-2 border rounded"
            required
          />
        </form>
      </div>

      {/* Hidden Receipt */}
      <div className="hidden" ref={receiptRef}>
        <div className="w-80 p-5 bg-white border-2 border-dashed text-center">
          <h2 className="text-lg font-semibold mb-3">Receipt</h2>
          <div className="flex items-center justify-between bg-black rounded text-white p-2">
            <img src="/images/vendora.png" width={115} height={55} alt="logo" />
            <span>{WebsiteName}</span>
          </div>
          <div className="mt-4">
            <h3 className="underline">Buyer Details</h3>
            <p>Name: {name}</p>
            <p>Address: {location}</p>
            <p>Phone: {number}</p>
          </div>

          {Object.entries(groupedByVendor).map(([vendorName, items], index) => (
            <div key={index} className="mt-4 text-left">
              <h4 className="font-bold underline mb-2">{vendorName}:</h4>
              {items.map((item, i) => (
                <div key={i} className="mb-2">
                  <p>{item.name} - ₦{item.price.toLocaleString()}</p>
                </div>
              ))}
            </div>
          ))}

          <p className="font-bold mt-3">
            Total: ₦{totalAmount.toLocaleString()}
          </p>
          <p className="text-gray-500 text-sm mt-3">
            {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};
