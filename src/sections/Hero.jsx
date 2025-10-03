import Button from "../components/Button.jsx";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative overflow-hidden pt-44 pb-32 max-lg:pt-36 max-lg:pb-28 max-md:pt-28 max-md:pb-20 bg-gradient-to-br from-s1 via-s2 to-s3 text-white">
      <div className="container relative z-10 flex flex-col lg:flex-row items-center justify-between">
        
        {/* Left content */}
        <div className="max-w-xl">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-p1/10 border border-p1/20 mb-6">
            <span className="text-p1 text-sm font-medium uppercase tracking-wider">FUOYE Official Marketplace</span>
          </div>
          
          {/* Headline */}
          <h1 className="mb-6 text-5xl font-bold max-lg:text-4xl max-md:text-3xl leading-tight">
            Buy and Sell Anything on Campus
          </h1>
          <h2 className="mb-8 text-2xl font-semibold text-neutral-300 max-lg:text-xl">
            <span className="bg-gradient-to-r from-p1 to-p2 bg-clip-text text-transparent">Fuye Market</span> powered by Vendora
          </h2>

          {/* Subheadlines */}
          <p className="max-w-lg mb-4 body-1 text-neutral-300">
            The fastest, safest way to buy and sell on campus. 
            <span className="text-p1 font-semibold"> No more WhatsApp groups!</span>
          </p>
          <p className="max-w-lg mb-8 body-1 text-neutral-300">
            Trusted by 1000+ FUOYE students. Instant delivery. Secure payments.
          </p>

          {/* Call-to-actions */}
          <div className="flex flex-col sm:flex-row gap-6 max-w-lg">
            <Link to="/" className="flex-1">
              <Button icon="/images/zap.svg">Browse Products</Button>
            </Link>
            <Link to="/signup" className="flex-1">
              <Button icon="/images/magic.svg" variant="outline">Start Selling</Button>
            </Link>
          </div>
        </div>

        {/* Right image */}
        <div className="relative mt-12 lg:mt-0 lg:ml-10">
          <img
            src="/images/2203.i201.046.S.m004.c13.modern futre professions isometric.jpg"
            className="w-[600px] max-w-full drop-shadow-2xl rounded-2xl"
            alt="hero"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#0f172a50] to-transparent rounded-2xl" />
        </div>
      </div>

      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] bg-gradient-to-r from-p1/20 via-p2/20 to-p3/20 opacity-30 blur-3xl rounded-full pointer-events-none" />
    </section>
  );
};

export default Hero;
