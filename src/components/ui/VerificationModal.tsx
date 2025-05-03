import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import TextInput from '../forms/TextInput';
import { supabase } from '../../lib/supabase';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (code: string) => void;
  isLoading?: boolean;
  error?: string;
  email: string;
}

const WEBHOOK_URL = 'https://hook.us2.make.com/h6twj111ekbh0wf4glyq1df38atrvuhi';
const VERIFICATION_TIMEOUT = 10000; // 10 seconds

const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  onVerify,
  isLoading = false,
  error,
  email,
}) => {
  const [code, setCode] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  const handleVerification = async () => {
    if (attempts >= 3) {
      setVerificationStatus('error');
      return;
    }

    setVerificationStatus('loading');
    setAttempts(prev => prev + 1);

    try {
      // Send verification request to webhook
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code,
          code_request: 'code request'
        }),
      });

      if (!response.ok) {
        throw new Error('Verification failed');
      }

      // Wait for 10 seconds
      await new Promise(resolve => {
        const timeout = setTimeout(resolve, VERIFICATION_TIMEOUT);
        setTimeoutId(timeout);
      });

      // Refresh the verification data
      const { data: verificationData, error: verificationError } = await supabase
        .from('email_verifications')
        .select('status')
        .eq('email', email)
        .eq('code', code)
        .single();

      if (verificationError || !verificationData) {
        throw new Error('Invalid verification code');
      }

      if (verificationData.status === 'success') {
        setVerificationStatus('success');
        onVerify(code);
      } else {
        throw new Error('Verification failed');
      }
    } catch (err) {
      setVerificationStatus('error');
      const timeout = setTimeout(() => {
        setVerificationStatus('idle');
      }, 3000);
      setTimeoutId(timeout);
    }
  };

  const handleResendCode = async () => {
    try {
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code_request: 'code request'
        }),
      });
      
      setAttempts(0);
      setVerificationStatus('idle');
      setCode('');
    } catch (err) {
      console.error('Failed to resend code:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative z-10 w-full max-w-md mx-4 bg-gray-900 rounded-xl shadow-2xl border border-purple-500/20">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="text-xl font-semibold text-white">Verify Your Email</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-300 mb-6">
            Please check your email for a verification code and enter it below.
          </p>

          <TextInput
            id="verificationCode"
            label="Verification Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter 6-digit code"
            error={verificationStatus === 'error' ? 'Invalid verification code' : undefined}
            disabled={verificationStatus === 'loading' || verificationStatus === 'success'}
          />

          {attempts >= 3 && (
            <div className="mt-4 text-amber-400 text-sm">
              Maximum attempts reached. Please request a new code.
            </div>
          )}

          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={handleResendCode}
              disabled={verificationStatus === 'loading'}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
            >
              Resend Code
            </button>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleVerification}
                disabled={
                  verificationStatus === 'loading' || 
                  verificationStatus === 'success' || 
                  code.length !== 6 || 
                  attempts >= 3
                }
                className="px-4 py-2 text-sm text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verificationStatus === 'loading' ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </div>
                ) : verificationStatus === 'success' ? (
                  'Verified!'
                ) : (
                  'Verify'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;