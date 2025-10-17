'use client';

import { useState } from 'react';
import styles from '../page.module.css';

interface MultiSelectBadgeProps {
  options: Array<{ id: string; name: string }>;
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  label: string;
  placeholder?: string;
}

export default function MultiSelectBadge({
  options,
  selectedIds,
  onChange,
  label,
  placeholder = 'Select...'
}: MultiSelectBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAdd = (id: string) => {
    if (!selectedIds.includes(id)) {
      onChange([...selectedIds, id]);
    }
    setIsOpen(false);
  };

  const handleRemove = (id: string) => {
    onChange(selectedIds.filter(selectedId => selectedId !== id));
  };

  const selectedOptions = selectedIds
    .map(id => options.find(opt => opt.id === id))
    .filter(Boolean) as Array<{ id: string; name: string }>;

  const availableOptions = options.filter(opt => !selectedIds.includes(opt.id));

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#ffffff' }}>
        {label}
      </label>

      {/* Selected Items as Badges */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '0.5rem', 
        marginBottom: '0.5rem',
        minHeight: '56px',
        padding: '0.75rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        background: 'rgba(0, 0, 0, 0.2)'
      }}>
        {selectedOptions.length === 0 ? (
          <span style={{ color: '#a0a3bd', fontSize: '0.875rem', alignSelf: 'center' }}>
            No items selected
          </span>
        ) : (
          selectedOptions.map(option => (
            <span
              key={option.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.375rem 0.875rem',
                background: '#FF6B35',
                color: 'white',
                borderRadius: '20px',
                fontSize: '0.875rem',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(255, 107, 53, 0.3)'
              }}
            >
              {option.name}
              <button
                type="button"
                onClick={() => handleRemove(option.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '1.25rem',
                  lineHeight: '1',
                  fontWeight: 'bold',
                  opacity: 0.9,
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                title="Remove"
              >
                ×
              </button>
            </span>
          ))
        )}
      </div>

      {/* Dropdown to Add Items */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={styles.dataInput}
          style={{
            width: '100%',
            textAlign: 'left',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer'
          }}
        >
          <span style={{ color: availableOptions.length > 0 ? '#a0a3bd' : '#6b7280' }}>
            {availableOptions.length > 0 ? placeholder : 'All items selected'}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#a0a3bd' }}>
            {isOpen ? '▲' : '▼'}
          </span>
        </button>

        {isOpen && availableOptions.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '0.5rem',
              background: '#2a2d3a',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
              maxHeight: '240px',
              overflowY: 'auto',
              zIndex: 10
            }}
          >
            {availableOptions.map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleAdd(option.id)}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  textAlign: 'left',
                  border: 'none',
                  background: 'transparent',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  transition: 'background 0.15s',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 107, 53, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {option.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

