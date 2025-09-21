import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const VerifyEmailNotice = () => {
  const { error, resendVerification, loading } = useAuth();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  // Only render when the auth context has the verification required error
  if (!error || !/verification required/i.test(error)) return null;

  const handleResend = async () => {
    try {
      setSending(true);
      setMessage('');
      await resendVerification();
      setMessage('Verification email sent. Check your inbox.');
    } catch (err) {
      setMessage(err.message || 'Failed to resend verification');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-yellow-700">{error}</p>
          {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={handleResend}
            disabled={sending || loading}
            className="px-3 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Resend Email'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailNotice;
