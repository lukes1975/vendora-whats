import { useEffect, useState } from "react";
import { CartIcon } from "../constants";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "../constants/Context";
import LoginPage from "../Pages/LoginPage";
import SignupPage from "../Pages/SignupPage";

const Header = () => {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 32);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  const { cart } = useCart();
  return (
    <header
      className={`
        fixed top-0 left-0 z-50 w-full py-10 transition-all duration-500 max-lg:py-4
        ${hasScrolled && "py-2 bg-black-100 backdrop-blur-[8px]"}`}
    >
      <div className="container flex h-14 items-center max-lg:px-5">
        <a className="lg:hidden flex-1 cursor-pointer z-2">
          <img src="/images/xora.svg" width={115} height={55} alt="logo" />
        </a>

        <div
          className={`
            w-full max-lg:fixed max-lg:top-0 max-lg:left-0 max-lg:w-full max-lg:bg-s2 max-lg:opacity-0
            ${isOpen ? "max-lg:opacity-100" : "max-lg:pointer-events-none"}
          `}
        >
          <div className="max-lg:relative max-lg:flex max-lg:flex-col max-lg:min-h-screen max-lg:p-6 max-lg:overflow-hidden sidebar-before max-md:px-4">
            <nav className="max-lg:relative max-lg:z-2 max-lg:my-auto">
              <ul className="flex max-lg:block max-lg:px-12">

                <li className="nav-logo">
                  <Link
                    to="Home"
                    className={
                      "max-lg:hidden transition-transform duration-500 cursor-pointer"}
                  >
                    <img
                      src="/images/xora.svg"
                      width={160}
                      height={55}
                      alt="logo"
                    />
                  </Link>
                </li>

                <li className="nav-li">
                  <NavLink className="base-bold text-p4 uppercase transition-colors duration-500 cursor-pointer hover:text-p1 max-lg:my-4 max-lg:h5"
                    to="/home#home" > Home</NavLink>
                  <NavLink className="base-bold text-p4 uppercase transition-colors duration-500 cursor-pointer hover:text-p1 max-lg:my-4 max-lg:h5"
                    to="/home#about" > About</NavLink>
                  <NavLink className="base-bold text-p4 uppercase transition-colors duration-500 cursor-pointer hover:text-p1 max-lg:my-4 max-lg:h5"
                    to="/" > product</NavLink>
                  {/* <Link to="/">Product</Link> */}
                  <NavLink className="base-bold text-p4 uppercase transition-colors duration-500 cursor-pointer hover:text-p1 max-lg:my-4 max-lg:h5"
                    to="/home#Contact" > Contact</NavLink>
                  <div className="dot" />
                  
                  {/* Login and Signup Buttons */}
                  <div className="flex items-center gap-3 max-lg:flex-col max-lg:gap-2 max-lg:mt-4">
                    <Link 
                      to="/login" 
                      className="px-4 py-2 text-sm font-medium text-p4 border border-p4 rounded-md hover:bg-p4 hover:text-white transition-all duration-300 max-lg:w-full max-lg:text-center"
                    >
                      Login
                    </Link>
                    <Link 
                      to="/signup" 
                      className="px-4 py-2 text-sm font-medium text-white bg-p1 rounded-md hover:bg-p2 transition-all duration-300 max-lg:w-full max-lg:text-center"
                    >
                      Sign Up
                    </Link>
                  </div>
                  {/* <div
                    onClick={openCard}
                    className="flex cursor-pointer items-start "
                  >
                    <CartIcon />
                    <p className='cartNumber'><small>{cart && cart.length}</small></p>
                  </div> */}


                </li>
              </ul>
            </nav>

            <div className="lg:hidden block absolute top-1/2 left-0 w-[960px] h-[380px] translate-x-[-290px] -translate-y-1/2 rotate-90">
              <img
                src="/images/bg-outlines.svg"
                width={960}
                height={380}
                alt="outline"
                className="relative z-2"
              />
              <img
                src="/images/bg-outlines-fill.png"
                width={960}
                height={380}
                alt="outline"
                className="absolute inset-0 mix-blend-soft-light opacity-5"
              />
            </div>
          </div>
        </div>
        <Link to="/cart"
          className="flex cursor-pointer items-start button
buttonlg:hidden  mx-4 "
        >
          <CartIcon />
          <p className='cartNumber'><small>{cart && cart.length}</small></p>
        </Link >
        <button
          className="lg:hidden z-2 size-10 border-2 border-s4/25 rounded-full flex justify-center items-center"
          onClick={() => setIsOpen((prevState) => !prevState)}
        >
          <img
            src={`/images/${isOpen ? "close" : "magic"}.svg`}
            alt="magic"
            className="size-1/2 object-contain"
          />
        </button>

      </div>
    </header>
  );
};

export default Header;
