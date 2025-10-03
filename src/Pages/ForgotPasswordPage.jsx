import { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Email is required');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 2000);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-s1 via-s2 to-s3 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Success State */}
          <div className="text-center mb-8">
            <img 
              src="/images/xora.svg" 
              alt="Logo" 
              className="mx-auto h-16 w-auto mb-6"
            />
            <div className="w-20 h-20 bg-gradient-to-br from-p1 to-p2 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Check Your Email</h1>
            <p className="text-neutral-300 mb-8">
              We've sent password reset instructions to <br />
              <span className="text-p1 font-medium">{email}</span>
            </p>
          </div>

          {/* Success Card */}
          <div className="bg-s2/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-s3/30">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-p1/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-p1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Reset Link Sent!</h3>
                <p className="text-neutral-300 text-sm leading-relaxed">
                  Click the link in your email to reset your password. 
                  The link will expire in 1 hour for security.
                </p>
              </div>

              <div className="space-y-3">
                <Link 
                  to="/login" 
                  className="w-full bg-gradient-to-r from-p1 to-p2 text-white py-3 px-4 rounded-lg font-medium hover:from-p1/90 hover:to-p2/90 focus:outline-none focus:ring-2 focus:ring-p1 focus:ring-offset-2 transition-all duration-200 inline-block text-center"
                >
                  Back to Login
                </Link>
                
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail('');
                  }}
                  className="w-full text-p1 hover:text-p2 transition-colors duration-200 text-sm font-medium"
                >
                  Try Different Email
                </button>
              </div>
            </div>
          </div>

          {/* Help Text */}
          <div className="text-center mt-8">
            <p className="text-neutral-400 text-sm">
              Didn't receive the email? Check your spam folder or{' '}
              <button className="text-p1 hover:text-p2 transition-colors duration-200">
                contact support
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-s1 via-s2 to-s3 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <img 
            src="/images/xora.svg" 
            alt="Logo" 
            className="mx-auto h-16 w-auto mb-6"
          />
          <h1 className="text-3xl font-bold text-white">Forgot Password?</h1>
          <p className="text-neutral-300 mt-2">No worries, we'll send you reset instructions</p>
        </div>

        {/* Forgot Password Form */}
        <div className="bg-s2/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-s3/30">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-200 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-p1 focus:border-transparent transition-all duration-200 bg-s3/30 text-white placeholder-neutral-400 ${
                  error ? 'border-red-400 bg-red-500/10' : 'border-s4/30'
                }`}
                placeholder="Enter your email address"
              />
              {error && (
                <p className="mt-1 text-sm text-red-400">{error}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-p1 to-p2 text-white py-3 px-4 rounded-lg font-medium hover:from-p1/90 hover:to-p2/90 focus:outline-none focus:ring-2 focus:ring-p1 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending...
                </div>
              ) : (
                'Send Reset Link'
              )}
            </button>

            {/* Back to Login */}
            <div className="text-center">
              <Link 
                to="/login" 
                className="text-p1 hover:text-p2 transition-colors duration-200 text-sm font-medium"
              >
                ← Back to Login
              </Link>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="text-center mt-8">
          <p className="text-neutral-400 text-sm">
            Remember your password?{' '}
            <Link to="/login" className="text-p1 hover:text-p2 transition-colors duration-200">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
