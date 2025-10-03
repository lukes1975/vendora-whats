const About = () => {
  return (
    <section id="about" className="py-20 bg-gradient-to-b from-s1 to-s2">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="h2 text-white mb-4">
            About <span className="bg-gradient-to-r from-p1 to-p2 bg-clip-text text-transparent">Fuye Market</span>
          </h2>
          <p className="body-1 text-neutral-300 max-w-3xl mx-auto">
            The official marketplace for FUOYE students, powered by Vendora. 
            We're revolutionizing campus commerce across Africa.
          </p>
        </div>

        {/* Mission & Vision Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Mission */}
          <div className="relative bg-s2/50 backdrop-blur-sm border border-s3/30 rounded-3xl p-8 hover:bg-s2/70 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-p1 to-p2 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="h4 text-white mb-4">Our Mission</h3>
            <p className="body-1 text-neutral-300 leading-relaxed">
              To empower students to buy and sell safely, quickly, and affordably within their campus community. 
              We eliminate the chaos of WhatsApp groups by providing a trusted marketplace with instant delivery, 
              secure payments, and verified sellers.
            </p>
          </div>

          {/* Vision */}
          <div className="relative bg-s2/50 backdrop-blur-sm border border-s3/30 rounded-3xl p-8 hover:bg-s2/70 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-p2 to-p3 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="h4 text-white mb-4">Our Vision</h3>
            <p className="body-1 text-neutral-300 leading-relaxed">
              To become Africa's leading student-powered marketplace, starting from FUOYE. 
              We aim to connect campuses, empower young entrepreneurs, and build the next generation 
              of digital commerce across the continent.
            </p>
          </div>
        </div>

        {/* Key Features */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-p1 to-p2 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-semibold text-white mb-2">Verified Sellers</h4>
            <p className="text-sm text-neutral-400">All sellers are verified FUOYE students</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-p2 to-p3 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h4 className="font-semibold text-white mb-2">Secure Payments</h4>
            <p className="text-sm text-neutral-400">100% secure payment processing</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-p3 to-accent1 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h4 className="font-semibold text-white mb-2">Fast Delivery</h4>
            <p className="text-sm text-neutral-400">Average 30-minute campus delivery</p>
          </div>
        </div>
      </div>
    </section>
  );
};
export default About;
