'use client';

import { useState, useEffect } from 'react';
import styles from '../page.module.css';
import RichTextEditor from './RichTextEditor';

interface EditItemModalProps {
  item: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedItem: any) => void;
}

export default function EditItemModal({ item, isOpen, onClose, onSave }: EditItemModalProps) {
  // Helper function to convert date format for HTML date input
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    
    // If it's already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Try to parse different date formats
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
    }
    
    return '';
  };

  const [formData, setFormData] = useState({
    name: item?.fieldData?.name || item?.name || '',
    'client-stories-summary': item?.fieldData?.['client-stories-summary'] || '',
    opens: formatDateForInput(item?.fieldData?.['opens'] || ''),
    closes: formatDateForInput(item?.fieldData?.['closes'] || ''),
    'deadline-text': item?.fieldData?.['deadline-text'] || '',
    'funding-body': item?.fieldData?.['funding-body'] || '',
    'award-value': item?.fieldData?.['award-value'] || '',
    'client-stories-thumbnail-image': item?.fieldData?.['client-stories-thumbnail-image'] || '',
    'client-stories-body': item?.fieldData?.['client-stories-body'] || '',
    'meta-title': item?.fieldData?.['meta-title'] || '',
    'meta-description': item?.fieldData?.['meta-description'] || '',
    'url-5': item?.fieldData?.['url-5'] || '',
    order: item?.fieldData?.order || 0,
    isArchived: typeof item?.isArchived === 'boolean' ? item.isArchived : false,
    'category-reference-2': item?.fieldData?.['category-reference-2'] || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [updateMode, setUpdateMode] = useState<'staging' | 'live'>('staging');

  useEffect(() => {
    // Fetch categories from the reference collection
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data.items || []);
      } catch (err) {
        setCategories([]);
      }
    }
    fetchCategories();
  }, []);

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string) => {
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
      const response = await fetch(`/api/collection/items/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isArchived: formData.isArchived,
          fieldData: fieldDataWithoutIsArchived,
          updateMode: updateMode
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to update item:', response.status, errorText);
        throw new Error(`Failed to update item: ${response.status} ${errorText}`);
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
          <div className={styles.formGroup}>
            <label htmlFor="name">Title:</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="client-stories-summary">Short Description:</label>
            <textarea
              id="client-stories-summary"
              value={formData['client-stories-summary']}
              onChange={(e) => handleInputChange('client-stories-summary', e.target.value)}
              className={styles.formTextarea}
              rows={3}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="opens">Opening Date:</label>
            <input
              type="date"
              id="opens"
              value={formData['opens']}
              onChange={(e) => handleInputChange('opens', e.target.value)}
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="closes">Closing Date:</label>
            <input
              type="date"
              id="closes"
              value={formData['closes']}
              onChange={(e) => handleInputChange('closes', e.target.value)}
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="funding-body">Funding Body:</label>
            <input
              type="text"
              id="funding-body"
              value={formData['funding-body']}
              onChange={(e) => handleInputChange('funding-body', e.target.value)}
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="award-value">Award Value:</label>
            <input
              type="text"
              id="award-value"
              value={formData['award-value']}
              onChange={(e) => handleInputChange('award-value', e.target.value)}
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="client-stories-thumbnail-image">Thumbnail Image URL:</label>
            <input
              type="url"
              id="client-stories-thumbnail-image"
              value={formData['client-stories-thumbnail-image']}
              onChange={(e) => handleInputChange('client-stories-thumbnail-image', e.target.value)}
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="client-stories-body">Main Body:</label>
            <RichTextEditor
              value={formData['client-stories-body']}
              onChange={(value) => handleInputChange('client-stories-body', value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="meta-title">Meta Title:</label>
            <input
              type="text"
              id="meta-title"
              value={formData['meta-title']}
              onChange={(e) => handleInputChange('meta-title', e.target.value)}
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="meta-description">Meta Description:</label>
            <textarea
              id="meta-description"
              value={formData['meta-description']}
              onChange={(e) => handleInputChange('meta-description', e.target.value)}
              className={styles.formTextarea}
              rows={2}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="url-5">URL:</label>
            <input
              type="url"
              id="url-5"
              value={formData['url-5']}
              onChange={(e) => handleInputChange('url-5', e.target.value)}
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="deadline-text">Duration:</label>
            <input
              type="text"
              id="deadline-text"
              value={formData['deadline-text']}
              onChange={(e) => handleInputChange('deadline-text', e.target.value)}
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="order">Order (for sorting):</label>
            <input
              type="number"
              id="order"
              value={formData.order}
              onChange={(e) => handleInputChange('order', e.target.value)}
              className={styles.formInput}
              min="0"
              step="1"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="category-reference-2">Category Reference:</label>
            <select
              id="category-reference-2"
              value={formData['category-reference-2']}
              onChange={e => handleInputChange('category-reference-2', e.target.value)}
              className={styles.formInput}
            >
              <option value="">Select a category</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.fieldData?.name || cat.name || cat.slug || cat.id}</option>
              ))}
            </select>
          </div>

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

        </div>
        
        <div className={styles.modalFooter}>
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
              </div>
              <div style={{ marginTop: 12, fontSize: '0.9rem', color: '#6b7280', padding: '8px 12px', background: '#ffffff', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                {updateMode === 'staging' 
                  ? '✅ Safe: Changes will be applied to the staging environment first for testing.'
                  : '⚠️ Direct: Changes will be applied directly to the live environment. Use with caution!'
                }
              </div>
            </div>
          </div>
          <div className={styles.modalFooterrow}>
          <button onClick={onClose} className={styles.cancelButton}>
          Cancel
          </button> 
          <button 
            onClick={handleSave} 
             className={styles.saveButton}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : `Save Changes (${updateMode === 'staging' ? 'Staging' : 'Live'})`}
          </button>
          </div>
        </div>
      </div>
    </div>
  );
} 