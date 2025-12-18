'use client';

import { useState, useEffect } from 'react';
import styles from '../page.module.css';
import MultiSelectBadge from './MultiSelectBadge';
import ImageUpload from './ImageUpload';

interface EditItemModalProps {
  item: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedItem: any) => void;
  isAdmin?: boolean;
}

export default function EditItemModal({ item, isOpen, onClose, onSave, isAdmin = false }: EditItemModalProps) {
  // Helper function to convert date format for HTML datetime-local input
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    
    // If it's already in YYYY-MM-DDTHH:mm format, return as is
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(dateString)) {
      return dateString.slice(0, 16); // Returns YYYY-MM-DDTHH:mm
    }
    
    // Try to parse different date formats
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      // Convert to local time and format for datetime-local input
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    
    return '';
  };

  const [formData, setFormData] = useState({
    name: item?.fieldData?.name || item?.name || '',
    slug: item?.fieldData?.slug || '',
    description: item?.fieldData?.description || '',
    'club-name': item?.fieldData?.['club-name'] || '',
    'date-and-time': formatDateForInput(item?.fieldData?.['date-and-time'] || ''),
    address: item?.fieldData?.address || '',
    thumbnail: item?.fieldData?.thumbnail || '',  // Can be object {fileId, url, alt} or string
    'ticket-link': item?.fieldData?.['ticket-link'] || '',
    isArchived: typeof item?.isArchived === 'boolean' ? item.isArchived : false,
    location: item?.fieldData?.location || '',
    'organiser-name': item?.fieldData?.['organiser-name'] || '',
    'event-community': item?.fieldData?.['event-community'] || [],
    'places-2': item?.fieldData?.['places-2'] || [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [updateMode, setUpdateMode] = useState<'staging' | 'live'>('staging');
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);

  useEffect(() => {
    // Fetch categories, communities, locations, and users
    async function fetchData() {
      try {
        // Fetch categories
        const categoriesResponse = await fetch('/api/categories');
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData.items || []);
        }

        // Fetch communities
        const communitiesResponse = await fetch('/api/communities');
        if (communitiesResponse.ok) {
          const communitiesData = await communitiesResponse.json();
          setCommunities(communitiesData.items || []);
        }

        // Fetch locations
        const locationsResponse = await fetch('/api/locations');
        if (locationsResponse.ok) {
          const locationsData = await locationsResponse.json();
          setLocations(locationsData.items || []);
        }

        // Fetch users (for organiser dropdown)
        const usersResponse = await fetch('/api/users');
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData.items || []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    }
    fetchData();
  }, []);

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: any) => {
    console.log(`📝 Field "${field}" updated with:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSwitchChange = (field: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // Remove isArchived from fieldData
      const { isArchived, ...fieldDataWithoutIsArchived } = formData;
      
      // If there's a pending image file, upload it first
      if (pendingImageFile) {
        console.log('=== Uploading image before save ===');
        console.log('Pending file:', pendingImageFile.name);
        
        try {
          const imageFormData = new FormData();
          imageFormData.append('file', pendingImageFile);
          
          const uploadResponse = await fetch('/api/upload-image', {
            method: 'POST',
            body: imageFormData,
          });
          
          if (!uploadResponse.ok) {
            const error = await uploadResponse.json();
            throw new Error(error.details || error.error || 'Failed to upload image');
          }
          
          const imageData = await uploadResponse.json();
          console.log('✅ Image uploaded:', imageData);
          
          // Update the thumbnail in fieldData with the uploaded image data
          fieldDataWithoutIsArchived.thumbnail = imageData;
        } catch (uploadError) {
          console.error('❌ Image upload failed:', uploadError);
          alert(`Failed to upload image: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
          setIsLoading(false);
          return; // Don't proceed with save if image upload fails
        }
      }
      
      // Clean up thumbnail field - remove if empty string, keep if object or omit entirely
      if (fieldDataWithoutIsArchived.thumbnail === '') {
        delete fieldDataWithoutIsArchived.thumbnail;
        console.log('Thumbnail is empty string - removing from payload');
      }
      
      console.log('=== Saving Item to CMS ===');
      console.log('Thumbnail data being sent:', fieldDataWithoutIsArchived.thumbnail);
      console.log('Thumbnail type:', typeof fieldDataWithoutIsArchived.thumbnail);
      console.log('Full fieldData:', JSON.stringify(fieldDataWithoutIsArchived, null, 2));
      
      const response = await fetch(`/api/collection/items/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isArchived: formData.isArchived,
          fieldData: fieldDataWithoutIsArchived,
          updateMode: isAdmin ? updateMode : 'staging' // Non-admins always use staging
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to update item');
        console.error('Status:', response.status);
        console.error('Response:', errorText);
        
        // Try to parse error for better display
        try {
          const errorJson = JSON.parse(errorText);
          console.error('Parsed error:', errorJson);
          alert(`Failed to update item: ${errorJson.details || errorJson.error || errorText}`);
        } catch (e) {
          alert(`Failed to update item: ${errorText}`);
        }
        throw new Error(`Failed to update item: ${response.status}`);
      }

      const updatedItem = await response.json();
      onSave(updatedItem);
      onClose();
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div>
            <h3>Edit Item</h3>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>
        
        <div className={styles.modalBody}>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
            padding: '0.75rem 1rem',
            background: 'rgba(110, 86, 207, 0.05)',
            borderLeft: '3px solid #6E56CF',
            borderRadius: '4px'
          }}>
            💡 <strong>Fields marked with</strong> <span style={{color: 'red'}}>*</span> <strong>are required.</strong> Maximum 2 communities and 2 categories per event.
          </p>
          
          <div className={styles.formGroup}>
            <label htmlFor="name">Event Name: <span style={{color: 'red'}}>*</span></label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={styles.formInput}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description: <span style={{color: 'red'}}>*</span></label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={styles.formTextarea}
              rows={4}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="club-name">Club Name: <span style={{color: 'red'}}>*</span></label>
            <input
              type="text"
              id="club-name"
              value={formData['club-name']}
              onChange={(e) => handleInputChange('club-name', e.target.value)}
              className={styles.formInput}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="date-and-time">Date and Time: <span style={{color: 'red'}}>*</span></label>
            <input
              type="datetime-local"
              id="date-and-time"
              value={formData['date-and-time']}
              onChange={(e) => handleInputChange('date-and-time', e.target.value)}
              className={styles.formInput}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="address">Address: <span style={{color: 'red'}}>*</span></label>
            <input
              type="text"
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className={styles.formInput}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="location">Location: <span style={{color: 'red'}}>*</span></label>
            <select
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className={styles.formInput}
              style={{ 
                cursor: 'pointer',
                fontWeight: '500',
                color: formData.location ? '#ffffff' : '#a0a3bd'
              }}
              required
            >
              <option value="" style={{ background: '#211f2e', color: '#a0a3bd' }}>Select a location...</option>
              {locations.map((loc: any) => (
                <option key={loc.id} value={loc.id} style={{ background: '#211f2e', color: '#ffffff' }}>
                  {loc.fieldData?.name || loc.name || loc.slug || loc.id}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="organiser-name">
              Organiser Name: 
              <span style={{color: '#9ca3af', fontSize: '0.9rem', fontWeight: 'normal', marginLeft: '0.5rem'}}>
                (Cannot be changed)
              </span>
            </label>
            <input
              type="text"
              id="organiser-name"
              value={
                (users.find((u) => u.id === formData['organiser-name']) as any)?.fieldData?.name || 
                (users.find((u) => u.id === formData['organiser-name']) as any)?.name ||
                'Not assigned'
              }
              disabled
              className={styles.formInput}
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                cursor: 'not-allowed',
                color: '#9ca3af',
                fontWeight: '500',
                border: '2px solid rgba(255, 255, 255, 0.08)',
                opacity: 0.7
              }}
              title="Organiser is set when the event is created and cannot be changed"
            />
            <p style={{ 
              fontSize: '0.875rem', 
              color: '#9ca3af', 
              marginTop: '0.5rem',
              marginBottom: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              background: 'rgba(110, 86, 207, 0.05)',
              borderRadius: '8px',
              border: '1px solid rgba(110, 86, 207, 0.15)'
            }}>
              <span style={{ fontSize: '1.1rem' }}>🔒</span>
              <span>The organiser is automatically set when the event is created and cannot be modified</span>
            </p>
          </div>

          <ImageUpload
            currentImageUrl={formData.thumbnail}
            onImageUploaded={(imageData) => handleInputChange('thumbnail', imageData as any)}
                onFileSelected={(file) => {
                  setPendingImageFile(file);
                }}
            uploadOnSelect={false}
            label="Thumbnail Image *"
          />

          <div className={styles.formGroup}>
            <label htmlFor="ticket-link">Ticket Link:</label>
            <input
              type="url"
              id="ticket-link"
              value={formData['ticket-link']}
              onChange={(e) => handleInputChange('ticket-link', e.target.value)}
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <MultiSelectBadge
              label="Communities*"
              options={communities.map((c: any) => ({
                id: c.id,
                name: c.fieldData?.name || c.name || c.slug || c.id
              }))}
              selectedIds={Array.isArray(formData['event-community']) ? formData['event-community'] : []}
              onChange={(selectedIds) => handleInputChange('event-community', selectedIds as any)}
              placeholder="Click to add communities..."
              maxSelections={2}
            />
          </div>

          <div className={styles.formGroup}>
            <MultiSelectBadge
              label="Categories *"
              options={categories.map((c: any) => ({
                id: c.id,
                name: c.fieldData?.name || c.name || c.slug || c.id
              }))}
              selectedIds={Array.isArray(formData['places-2']) ? formData['places-2'] : []}
              onChange={(selectedIds) => handleInputChange('places-2', selectedIds as any)}
              placeholder="Click to add categories..."
              maxSelections={2}
            />
          </div>

          {isAdmin && (
            <div className={styles.formGroup} style={{ border: '2px solid #f59e42', borderRadius: 8, padding: 12, background: '#fffbe6', marginBottom: 24 }}>
              <label htmlFor="isArchived" className={styles.switchLabel} style={{ fontWeight: 'bold', color: !formData.isArchived ? '#14a68e' : '#b45309', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="20" height="20" fill={!formData.isArchived ? '#14a68e' : '#f59e42'} viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm.75 11.25a.75.75 0 01-1.5 0v-1.5a.75.75 0 011.5 0v1.5zm0-4.5a.75.75 0 01-1.5 0V7a.75.75 0 011.5 0v1.75z"/></svg>
                  {!formData.isArchived ? 'Live (Switch off to archive this item)' : 'Archived (Switch on to make it live)'}
                </span>
                <div className={styles.switchContainer}>
                  <input
                    type="checkbox"
                    id="isArchived"
                    checked={!formData.isArchived}
                    onChange={(e) => handleSwitchChange('isArchived', !e.target.checked)}
                    className={styles.switchInput}
                    disabled={isLoading}
                  />
                  <label htmlFor="isArchived" className={styles.switchToggle}>
                    <span className={styles.switchSlider}></span>
                  </label>
                </div>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: 8 }}>
                <span style={{
                  fontWeight: 600,
                  color: !formData.isArchived ? '#14a68e' : '#f59e42',
                  background: !formData.isArchived ? '#e6f9f4' : '#fff7ed',
                  borderRadius: 6,
                  padding: '2px 12px',
                  fontSize: '0.95rem',
                  letterSpacing: 1,
                  minWidth: 48,
                  textAlign: 'center',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                }}>
                  {!formData.isArchived ? 'ON (Live)' : 'OFF (Archived)'}
                </span>
              </div>
              <div style={{ color: !formData.isArchived ? '#14a68e' : '#b45309', fontSize: '0.9rem', marginTop: 6 }}>
                {!formData.isArchived
                  ? <span><strong>Active:</strong> This item is <b>live</b> and visible in all lists.</span>
                  : <span><strong>Note:</strong> If toggled off, this item will be <b>archived</b> and hidden from live lists.</span>
                }
              </div>
            </div>
          )}

        </div>
        
        <div className={styles.modalFooter}>
          {isAdmin && (
            <div className={styles.modalFooterrow}>
              <div className={styles.formGroup} style={{ marginBottom: 16, border: '2px solid #e5e7eb', borderRadius: 8, padding: 16, background: '#f9fafb' }}>
                <label style={{ fontWeight: 'bold', marginBottom: 12, display: 'block', color: '#374151' }}>
                  Update Mode:
                </label>
              <div style={{ display: 'flex', gap: 12 }}>
                <label 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8, 
                    cursor: 'pointer',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: `2px solid ${updateMode === 'staging' ? '#059669' : '#e5e7eb'}`,
                    background: updateMode === 'staging' ? '#f0fdf4' : '#ffffff',
                    transition: 'all 0.2s ease',
                    minWidth: '180px',
                    justifyContent: 'center'
                  }}
                  onClick={() => setUpdateMode('staging')}
                >
                  <input
                    type="radio"
                    name="updateMode"
                    value="staging"
                    checked={updateMode === 'staging'}
                    onChange={(e) => setUpdateMode(e.target.value as 'staging' | 'live')}
                    style={{ 
                      margin: 0,
                      width: '18px',
                      height: '18px',
                      accentColor: '#059669'
                    }}
                  />
                  <span style={{ fontWeight: 600, color: updateMode === 'staging' ? '#059669' : '#6b7280' }}>
                    🔄 Staging
                  </span>
                </label>
                {isAdmin && (
                  <label 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 8, 
                      cursor: 'pointer',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: `2px solid ${updateMode === 'live' ? '#dc2626' : '#e5e7eb'}`,
                      background: updateMode === 'live' ? '#fef2f2' : '#ffffff',
                      transition: 'all 0.2s ease',
                      minWidth: '180px',
                      justifyContent: 'center'
                    }}
                    onClick={() => setUpdateMode('live')}
                  >
                    <input
                      type="radio"
                      name="updateMode"
                      value="live"
                      checked={updateMode === 'live'}
                      onChange={(e) => setUpdateMode(e.target.value as 'staging' | 'live')}
                      style={{ 
                        margin: 0,
                        width: '18px',
                        height: '18px',
                        accentColor: '#dc2626'
                      }}
                    />
                    <span style={{ fontWeight: 600, color: updateMode === 'live' ? '#dc2626' : '#6b7280' }}>
                      🚀 Live
                    </span>
                  </label>
                )}
              </div>
              <div style={{ marginTop: 12, fontSize: '0.9rem', color: '#6b7280', padding: '8px 12px', background: '#ffffff', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                {updateMode === 'staging' 
                  ? '✅ Safe: Changes will be applied to the staging environment first for testing.'
                  : '⚠️ Direct: Changes will be applied directly to the live environment. Use with caution!'
                }
              </div>
            </div>
          </div>
          )}
          <div className={styles.modalFooterrow}>
          <button onClick={onClose} className={styles.cancelButton}>
          Cancel
          </button> 
          <button 
            onClick={handleSave} 
             className={styles.saveButton}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : isAdmin ? `Save Changes (${updateMode === 'staging' ? 'Staging' : 'Live'})` : 'Save Changes'}
          </button>
          </div>
        </div>
      </div>
    </div>
  );
} 