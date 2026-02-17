'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export default function ProfileCompletionModal({ isOpen, onComplete }: ProfileCompletionModalProps) {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    displayName: (user?.unsafeMetadata?.displayName as string) || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.displayName.trim()) {
      setError('All fields are required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Update Clerk user profile
      await user?.update({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        unsafeMetadata: {
          ...user.unsafeMetadata,
          displayName: formData.displayName.trim(),
          onboardingComplete: true,
        }
      });

      // Sync to Webflow
      const syncResponse = await fetch('/api/sync-user', { method: 'POST' });
      
      if (!syncResponse.ok) {
        throw new Error('Failed to sync profile');
      }

      onComplete();
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2.5rem',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👋</div>
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            color: '#1a1625',
            marginBottom: '0.5rem'
          }}>
            Complete Your Profile
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
            Help us personalize your experience by completing your profile
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: '#1a1625',
              fontSize: '0.9rem'
            }}>
              First Name <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              placeholder="Enter your first name"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                outline: 'none',
                background: 'white',
                color: '#1a1625'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: '#1a1625',
              fontSize: '0.9rem'
            }}>
              Last Name <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              placeholder="Enter your last name"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                outline: 'none',
                background: 'white',
                color: '#1a1625'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: '#1a1625',
              fontSize: '0.9rem'
            }}>
              Display Name <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              placeholder="e.g., NYC Events, John's Productions"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                outline: 'none',
                background: 'white',
                color: '#1a1625'
              }}
              maxLength={50}
              required
            />
            <p style={{
              fontSize: '0.8rem',
              color: '#6b7280',
              marginTop: '0.5rem',
              lineHeight: '1.4'
            }}>
              💡 This name will appear publicly on your event listings
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
            {isSubmitting ? 'Saving...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
