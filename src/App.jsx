import { Route, Routes } from "react-router-dom"; 
import HeroPage from "./Pages/HeroPage.jsx";
import ProductPage from "./Pages/ProductPage.jsx";
import CheckOutPage from "./Pages/CheckOutPage.jsx";
import ProductDetailsPage from "./Pages/ProductDetailsPage.jsx";
import VendorProfilePage from "./Pages/VendorProfilePage.jsx";
import LoginPage from "./Pages/LoginPage.jsx";
import SignupPage from "./Pages/SignupPage.jsx";
import ForgotPasswordPage from "./Pages/ForgotPasswordPage.jsx";
import Cart from "./components/Cart.jsx";
import HowItWorks from "./sections/HowItWorks.jsx"; // 

const App = () => {
  return (
    <Routes>
      <Route element={<HeroPage />} path="/home" />
      <Route element={<ProductPage />} path="/" />
      <Route element={<Cart />} path="/cart" />
      <Route element={<CheckOutPage />} path="/checkout" />
      <Route element={<ProductDetailsPage />} path="/product/:id" />
      <Route element={<VendorProfilePage />} path="/vendor/:id" />
      <Route element={<LoginPage />} path="/login" />
      <Route element={<SignupPage />} path="/signup" />
      <Route element={<ForgotPasswordPage />} path="/forgot-password" />
      <Route element={<HowItWorks />} path="/how-it-works" /> {/* ✅ new route */}
    </Routes>
  );
};

export default App;
