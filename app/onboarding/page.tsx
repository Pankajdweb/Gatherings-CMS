'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export default function OnboardingPage() {
  const { user } = useUser();
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  // Check current metadata on load
  useEffect(() => {
    if (user) {
      console.log('Current user metadata:', user.unsafeMetadata);
      setDebugInfo(`Current onboarding status: ${user.unsafeMetadata?.onboardingComplete ? 'Complete' : 'Incomplete'}`);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      setError('Please enter a display name');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setDebugInfo('Starting update...');

    try {
      console.log('Updating user metadata...');
      
      const updateResult = await user?.update({
        unsafeMetadata: {
          displayName: displayName.trim(),
          onboardingComplete: true,
        }
      });
      
      console.log('Update result:', updateResult);
      console.log('Updated metadata:', updateResult?.unsafeMetadata);
      
      setDebugInfo('Update successful! Reloading session...');
      
      // Force reload the user session
      await user?.reload();
      
      console.log('After reload:', user?.unsafeMetadata);
      setDebugInfo('Session reloaded. Redirecting in 3 seconds...');
      
      // Wait 3 seconds so we can see the debug info
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Direct navigation
      window.location.href = '/';
    } catch (err) {
      console.error('Full error:', err);
      setError(`Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setDebugInfo(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#1a1625',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '3rem',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '600',
          marginBottom: '1rem',
          color: '#1a1625'
        }}>
          Complete Your Profile
        </h1>
        
        <p style={{
          color: '#6b7280',
          marginBottom: '2rem',
          fontSize: '1rem'
        }}>
          Choose a display name that will appear on your event listings.
        </p>

        {debugInfo && (
          <div style={{
            padding: '0.75rem',
            background: '#e0f2fe',
            color: '#0369a1',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.875rem',
            fontFamily: 'monospace'
          }}>
            {debugInfo}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: '#1a1625'
            }}>
              Display Name <span style={{ color: 'red' }}>*</span>
            </label>
            
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g., NYC Events, John Smith, or Smith Promotions"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                outline: 'none',
                opacity: isSubmitting ? 0.6 : 1
              }}
              maxLength={50}
              required
            />
            
            <p style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginTop: '0.5rem',
              lineHeight: '1.4'
            }}>
              💡 This can be your personal name, organization name, or promoter name. 
              It will be visible on all events you create.
            </p>
          </div>

          {error && (
            <div style={{
              padding: '0.75rem',
              background: '#fee2e2',
              color: '#dc2626',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '1rem',
              background: isSubmitting ? '#9ca3af' : 'linear-gradient(135deg, #6E56CF 0%, #8b73e0 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {isSubmitting ? 'Saving...' : 'Continue'}
          </button>
        </form>

        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          background: '#f3f4f6',
          borderRadius: '8px',
          fontSize: '0.75rem',
          color: '#6b7280'
        }}>
          Debug: Open browser console (F12) to see detailed logs
        </div>
      </div>
    </div>
  );
}
