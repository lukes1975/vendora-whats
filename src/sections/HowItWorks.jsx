import { FaBoxOpen, FaShoppingBag, FaComments, FaCreditCard } from "react-icons/fa";

const HowItWorks = () => {
  const steps = [
    {
      icon: <FaBoxOpen className="text-2xl" />,
      title: "List Items",
      desc: "Students upload products or services they want to sell in the marketplace.",
      number: "01"
    },
    {
      icon: <FaShoppingBag className="text-2xl" />,
      title: "Browse Marketplace",
      desc: "Explore all categories in one place—fashion, food, electronics, and more.",
      number: "02"
    },
    {
      icon: <FaComments className="text-2xl" />,
      title: "Place Order",
      desc: "Add items to cart or message sellers directly to arrange delivery or pickup.",
      number: "03"
    },
    {
      icon: <FaCreditCard className="text-2xl" />,
      title: "Secure Payment",
      desc: "Pay safely by bank transfer or credit/ATM card. Quick and secure transactions.",
      number: "04"
    },
  ];

  return (
    <section id="how-it-works" className="relative py-24 bg-gradient-to-b from-s2 via-s3 to-s4 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('/images/bg-outlines.svg')] bg-center bg-no-repeat bg-contain opacity-5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-p1/10 via-p2/10 to-p3/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container relative z-10">
        {/* Header */}
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-p1/10 border border-p1/20 mb-6">
            <span className="text-p1 text-sm font-medium uppercase tracking-wider">How It Works</span>
          </div>
          
          <h2 className="h2 text-white mb-6">
            Simple Steps to 
            <span className="bg-gradient-to-r from-p1 to-p2 bg-clip-text text-transparent"> Success</span>
          </h2>
          
          <p className="body-1 text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            A streamlined process designed for FUOYE students to buy, sell, and connect within our campus community.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid gap-8 lg:grid-cols-4 md:grid-cols-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group relative"
            >
              {/* Card */}
              <div className="relative bg-s3/40 backdrop-blur-sm border border-s4/30 rounded-3xl p-8 h-full transition-all duration-500 hover:bg-s3/60 hover:border-p1/40 hover:scale-105 hover:shadow-2xl hover:shadow-p1/20">
                {/* Number Badge */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-p1 to-p2 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-s1 font-bold text-lg">{step.number}</span>
                </div>
                
                {/* Icon Container */}
                <div className="w-16 h-16 bg-gradient-to-br from-p1/20 to-p2/20 rounded-2xl flex items-center justify-center mb-6 group-hover:from-p1/30 group-hover:to-p2/30 transition-all duration-300">
                  <div className="text-p1 group-hover:scale-110 transition-transform duration-300">
                    {step.icon}
                  </div>
                </div>
                
                {/* Content */}
                <div className="space-y-4">
                  <h3 className="h6 text-white group-hover:text-p1 transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="body-1 text-neutral-300 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-p1/0 via-p1/5 to-p2/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
              
              {/* Connecting Line (Desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-p1/50 to-transparent transform -translate-y-1/2" />
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-s3/30 backdrop-blur-sm border border-s4/20 rounded-2xl">
            <div className="w-2 h-2 bg-gradient-to-r from-p1 to-p2 rounded-full animate-pulse" />
            <span className="text-neutral-200 text-sm font-medium">
              Ready to get started? Join thousands of FUOYE students
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
