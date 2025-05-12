import { createContext, useContext, useEffect, useState } from "react";

// Create Context
const CategoryContext = createContext();

// Create Provider Component
// eslint-disable-next-line react/prop-types
export const CategoryProvider = ({ children }) => {
  const [currentCategory, setCurrentCategory] = useState(null);

  return (
    <CategoryContext.Provider value={{ currentCategory, setCurrentCategory }}>
      {children}
    </CategoryContext.Provider>
  );
};

const CartContext = createContext();
// eslint-disable-next-line react/prop-types
export const CartProvider = ({ children }) => {
  // Load cart from local storage or set an empty array
  const [cart, setCart] = useState(() => {
    return JSON.parse(localStorage.getItem("cart")) || [];
  });

  // Update local storage whenever cart changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Function to add items to cart
  const addToCart = (product) => {
    setCart((prevCart) => {
      const updatedCart = [...prevCart, product];
      return updatedCart;
    });
  };

  // Function to remove an item
  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // Function to clear cart
  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom Hook to use CartContext
// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  return useContext(CartContext);
};
// Custom Hook to Use Context
// eslint-disable-next-line react-refresh/only-export-components
export const useCategory = () => {
  return useContext(CategoryContext);
};
