import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Vendora Vendor Admin Interface
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            FUOYE Students Marketplace Dashboard
          </p>
          
          {user ? (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Vendor Dashboard
              </h2>
              <p className="text-gray-600">
                Welcome back, {user.email}!
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Get Started
              </h2>
              <p className="text-gray-600 mb-6">
                Create your FUOYE vendor account to manage your products and sales.
              </p>
              <div className="flex justify-center space-x-4">
                <button onClick={() => navigate('/auth?mode=signup')} className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Sign Up
                </button>
                <button onClick={() => navigate('/auth?mode=signin')} className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                  Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
