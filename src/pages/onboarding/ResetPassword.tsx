import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import TextInput from '../../components/forms/TextInput';
import DashboardPreview from '../../components/DashboardPreview';
import { supabase } from '../../lib/supabase';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Get email from state passed during navigation
  const email = location.state?.email;

  useEffect(() => {
    // Redirect if no email is provided
    if (!email) {
      navigate('/onboarding/signin');
    }
  }, [email, navigate]);

  const validatePasswords = () => {
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleResetPassword = async () => {
    if (!validatePasswords()) return;

    setIsLoading(true);
    setError('');

    try {
      const { error: resetError } = await supabase.auth.updateUser({
        password: password
      });

      if (resetError) throw resetError;

      setSuccess(true);
      setTimeout(() => {
        navigate('/onboarding/signin');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900/30">
      {/* LEFT HALF: full-height form */}
      <div className="flex-1 h-full p-12 flex items-center justify-center">
        <div className="w-full h-full card p-12 flex flex-col justify-center space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-white">
              Reset Password
            </h2>
            <p className="text-gray-400">
              Reset password for: <span className="text-purple-400">{email}</span>
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-2 rounded">
              Password reset successful! Redirecting to login...
            </div>
          )}

          <TextInput
            id="password"
            type={showPassword ? 'text' : 'password'}
            label="New Password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="input-base w-full"
          />

          <TextInput
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            label="Confirm New Password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="input-base w-full"
          />

          <div
            className="flex items-center space-x-2 text-gray-300 cursor-pointer"
            onClick={() => setShowPassword(v => !v)}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
            <span className="select-none">Show password</span>
          </div>

          <button
            onClick={handleResetPassword}
            disabled={isLoading || !password || !confirmPassword}
            className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </button>

          <button
            onClick={() => navigate('/onboarding/signin')}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            Back to Sign In
          </button>
        </div>
      </div>

      {/* RIGHT HALF: dashboard preview */}
      <div className="flex-1 h-full p-8 flex items-center justify-center">
        <DashboardPreview displayName={email?.split('@')[0] || 'User'} />
      </div>
    </div>
  );
};

export default ResetPassword;