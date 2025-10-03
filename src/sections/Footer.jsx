import { socials } from "../constants/index.jsx";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-s1 to-s2 border-t border-s3/30">
      <div className="container py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <img src="/images/xora.svg" alt="Vendora" className="h-8 w-auto mr-3" />
              <span className="text-xl font-bold text-white">Vendora</span>
            </div>
            <p className="text-neutral-300 mb-4 max-w-md">
              The official marketplace for FUOYE students. Buy and sell safely within your campus community.
            </p>
            <div className="flex gap-3">
              {socials.map(({ id, url, icon, title }) => (
                <a
                  key={id}
                  href={url}
                  className="w-10 h-10 bg-s2/50 backdrop-blur-sm border border-s3/30 rounded-full flex items-center justify-center hover:bg-p1/20 hover:border-p1/50 transition-all duration-300"
                >
                  <img
                    src={icon}
                    alt={title}
                    className="w-5 h-5 object-contain"
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/" className="text-neutral-300 hover:text-p1 transition-colors duration-200">Marketplace</a></li>
              <li><a href="/home#about" className="text-neutral-300 hover:text-p1 transition-colors duration-200">About</a></li>
              <li><a href="/home#how-it-works" className="text-neutral-300 hover:text-p1 transition-colors duration-200">How It Works</a></li>
              <li><a href="/home#contact" className="text-neutral-300 hover:text-p1 transition-colors duration-200">Contact</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="/login" className="text-neutral-300 hover:text-p1 transition-colors duration-200">Login</a></li>
              <li><a href="/signup" className="text-neutral-300 hover:text-p1 transition-colors duration-200">Sign Up</a></li>
              <li><a href="/forgot-password" className="text-neutral-300 hover:text-p1 transition-colors duration-200">Forgot Password</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-p1 transition-colors duration-200">Help Center</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-s3/30">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-neutral-400 text-sm">
              © 2024 Vendora. All Rights Reserved. | Fuye Market - FUOYE Student Marketplace
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-neutral-400 hover:text-p1 transition-colors duration-200">Privacy Policy</a>
              <a href="#" className="text-neutral-400 hover:text-p1 transition-colors duration-200">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
