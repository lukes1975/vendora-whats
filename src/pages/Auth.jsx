import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthActions } from '@/hooks/useAuth';

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const initialMode =
    (location.state && location.state.mode) || params.get('mode') || 'signin';

  const [mode, setMode] = useState(initialMode);
  const { signIn, signUp } = useAuthActions();
  const [form, setForm] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'customer', // default
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) =>
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signin') {
        await signIn(form.email, form.password);
      } else {
        await signUp(form.email, form.password, {
          displayName: form.displayName,
          role: form.role, // 👈 pass role
        });
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <div className="flex justify-between mb-6">
          <button
            onClick={() => setMode('signin')}
            className={`px-4 py-2 ${
              mode === 'signin' ? 'bg-blue-600 text-white' : 'bg-gray-100'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`px-4 py-2 ${
              mode === 'signup' ? 'bg-green-600 text-white' : 'bg-gray-100'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Full name
                </label>
                <input
                  name="displayName"
                  value={form.displayName}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md"
                />
              </div>

              {/* Role select */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Account type
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md"
                >
                  <option value="customer">Buyer</option>
                  <option value="seller">Seller</option>
                </select>
              </div>
            </>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md"
            />
          </div>

          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md"
          >
            {loading
              ? 'Please wait...'
              : mode === 'signin'
              ? 'Sign In'
              : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
