import { useAuth } from '@/contexts/AuthContext';

const SellerDashboard = () => {
  const { userProfile } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Business Dashboard</h1>
          <p className="text-gray-600">Welcome back, {userProfile?.businessName || userProfile?.displayName}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Products
            </h3>
            <p className="text-gray-600">Manage your product catalog</p>
            <div className="mt-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                View Products
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Orders
            </h3>
            <p className="text-gray-600">Track and manage orders</p>
            <div className="mt-4">
              <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                View Orders
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Analytics
            </h3>
            <p className="text-gray-600">View business insights</p>
            <div className="mt-4">
              <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
