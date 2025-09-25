import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

const StudentDashboard = () => {
  const { userProfile, user } = useAuth();

  useEffect(() => {
    console.log('StudentDashboard mounted', { userProfile, user });
  }, [userProfile, user]);

  if (!userProfile) {
    console.log('No user profile in StudentDashboard');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-900 mb-4">
            Loading profile...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600">Welcome back, {userProfile?.displayName}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              My Courses
            </h3>
            <p className="text-gray-600">Access your enrolled courses</p>
            <div className="mt-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                View Courses
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Assignments
            </h3>
            <p className="text-gray-600">View and submit assignments</p>
            <div className="mt-4">
              <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                View Assignments
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Progress
            </h3>
            <p className="text-gray-600">Track your learning progress</p>
            <div className="mt-4">
              <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                View Progress
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
