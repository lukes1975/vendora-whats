import { FaStar, FaUsers, FaShieldAlt, FaTruck, FaCreditCard } from 'react-icons/fa';

const SocialProof = () => {
  const stats = [
    {
      icon: <FaUsers className="text-3xl" />,
      number: "1,200+",
      label: "Active Students",
      color: "from-p1 to-p2"
    },
    {
      icon: <FaStar className="text-3xl" />,
      number: "4.9/5",
      label: "Average Rating",
      color: "from-p2 to-p3"
    },
    {
      icon: <FaShieldAlt className="text-3xl" />,
      number: "100%",
      label: "Secure Payments",
      color: "from-p3 to-accent1"
    },
    {
      icon: <FaTruck className="text-3xl" />,
      number: "30min",
      label: "Avg Delivery",
      color: "from-accent1 to-accent2"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Computer Science Student",
      avatar: "SJ",
      text: "Finally! No more endless WhatsApp groups. Found my laptop in 5 minutes and it was delivered to my hostel the same day!",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Business Student",
      avatar: "MC",
      text: "Sold 3 textbooks in one day. The payment was instant and secure. This is a game-changer for students!",
      rating: 5
    },
    {
      name: "Aisha Okafor",
      role: "Engineering Student",
      avatar: "AO",
      text: "The delivery system is amazing. Bought food from a fellow student and it arrived hot and fresh. Highly recommend!",
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-s5 to-s1">
      <div className="container">
        {/* Stats Section */}
        <div className="text-center mb-20">
          <h2 className="h2 text-white mb-4">
            Trusted by <span className="bg-gradient-to-r from-p1 to-p2 bg-clip-text text-transparent">FUOYE Students</span>
          </h2>
          <p className="body-1 text-neutral-300 max-w-2xl mx-auto mb-12">
            Join thousands of students who have made Fuye Market their go-to platform for buying and selling on campus.
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`
                  w-20 h-20 bg-gradient-to-br rounded-2xl flex items-center justify-center mx-auto mb-4
                  ${stat.color} bg-opacity-20 border border-opacity-30
                `}>
                  <div className="text-p1">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-neutral-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mb-16">
          <h3 className="h3 text-white text-center mb-12">
            What Students Are Saying
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="relative bg-s2/40 backdrop-blur-sm border border-s3/30 rounded-2xl p-6 hover:bg-s2/60 transition-all duration-300"
              >
                {/* Rating Stars */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="w-4 h-4 text-p3 mr-1" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-neutral-300 mb-6 italic">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-p1 to-p2 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-sm">
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-neutral-400">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-s2/50 to-s3/50 backdrop-blur-sm rounded-3xl p-12 border border-s4/30">
          <h3 className="h3 text-white mb-4">
            Ready to Join the Community?
          </h3>
          <p className="body-1 text-neutral-300 mb-8 max-w-2xl mx-auto">
            Start buying and selling with fellow FUOYE students today. It's free, secure, and designed specifically for campus life.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-p1 to-p2 text-white rounded-xl font-medium hover:from-p1/90 hover:to-p2/90 transition-all duration-300 hover:scale-105"
            >
              <FaUsers className="w-5 h-5" />
              Join as Buyer
            </a>
            <a
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3 border-2 border-p1 text-p1 rounded-xl font-medium hover:bg-p1 hover:text-white transition-all duration-300 hover:scale-105"
            >
              <FaCreditCard className="w-5 h-5" />
              Start Selling
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-8 mt-8 text-sm text-neutral-400">
            <div className="flex items-center gap-2">
              <FaShieldAlt className="w-4 h-4 text-p1" />
              <span>100% Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <FaTruck className="w-4 h-4 text-p1" />
              <span>Fast Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCreditCard className="w-4 h-4 text-p1" />
              <span>Easy Payments</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
