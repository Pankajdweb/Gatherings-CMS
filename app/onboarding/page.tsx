'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      setError('Please enter a display name');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Update user metadata
      await user?.update({
        unsafeMetadata: {
          displayName: displayName.trim(),
          onboardingComplete: true,
        }
      });

      // Reload the user to get fresh session
      await user?.reload();

      // Small delay to ensure Clerk syncs
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Force a full page reload with cache bypass
      window.location.replace('/');
    } catch (err) {
      console.error('Onboarding error:', err);
      setError('Failed to save display name. Please try again.');
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
      </div>
    </div>
  );
}
