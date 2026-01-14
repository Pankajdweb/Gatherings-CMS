"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../page.module.css";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import MultiSelectBadge from "../components/MultiSelectBadge";
import ImageUpload from "../components/ImageUpload";

export default function AddItemPage() {
  const router = useRouter();
  const [isSendingToCMS, setIsSendingToCMS] = useState(false);
  const [cmsMessage, setCmsMessage] = useState("");
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    clubName: string;
    dateAndTime: string;
    address: string;
    thumbnail: string | { fileId: string; url: string; alt?: string };
    ticketLink: string;
    timezone: string;
    locationReference: string;
    organiserNameReference: string;
    eventCommunityReferences: string[];
    categoryReferences: string[];
  }>({
    name: "",
    description: "",
    clubName: "",
    dateAndTime: "",
    address: "",
    thumbnail: "",
    ticketLink: "",
    timezone: "",
    locationReference: "",
    organiserNameReference: "", 
    eventCommunityReferences: [] as string[],
    categoryReferences: [] as string[],
  });
  const [collectionFields, setCollectionFields] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [currentUserInfo, setCurrentUserInfo] = useState<any>(null);

 
  const [fetchErrors, setFetchErrors] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch collection structure
      try {
        const collectionResponse = await fetch(`/api/collection`);
        if (collectionResponse.ok) {
          const data = await collectionResponse.json();
          setCollectionFields(data.collection?.fields || []);
        } else {
          setFetchErrors(prev => [...prev, 'Failed to load collection structure']);
        }
      } catch (e) {
        setFetchErrors(prev => [...prev, 'Error loading collection']);
      }

      // Fetch categories
      try {
        const categoriesResponse = await fetch(`/api/categories`);
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData.items || []);
        } else {
          setFetchErrors(prev => [...prev, 'Failed to load categories']);
        }
      } catch (e) {
        setFetchErrors(prev => [...prev, 'Error loading categories']);
      }

      // Fetch communities
      try {
        const communitiesResponse = await fetch(`/api/communities`);
        if (communitiesResponse.ok) {
          const communitiesData = await communitiesResponse.json();
          setCommunities(communitiesData.items || []);
        } else {
          setFetchErrors(prev => [...prev, 'Failed to load communities']);
        }
      } catch (e) {
        setFetchErrors(prev => [...prev, 'Error loading communities']);
      }

      // Fetch locations
      try {
        const locationsResponse = await fetch(`/api/locations`);
        if (locationsResponse.ok) {
          const locationsData = await locationsResponse.json();
          setLocations(locationsData.items || []);
        } else {
          setFetchErrors(prev => [...prev, 'Failed to load locations']);
        }
      } catch (e) {
        setFetchErrors(prev => [...prev, 'Error loading locations']);
      }

      // Fetch current user's Webflow ID
      try {
        const userResponse = await fetch(`/api/current-user-webflow`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setCurrentUserInfo(userData);
          setFormData((prev) => ({
            ...prev,
            organiserNameReference: userData.webflowUserId,
          }));
        }
      } catch (e) {
        console.error("Error fetching user info:", e);
      }
    };

    fetchData();
  }, []);


  const handleSendToCMS = async () => {
    // Validate all required fields
    const requiredFields = [];
    
    if (!formData.name) requiredFields.push("Event Name");
    if (!formData.description) requiredFields.push("Description");
    if (!formData.clubName) requiredFields.push("Club Name");
    if (!formData.dateAndTime) requiredFields.push("Date and Time");
    if (!formData.address) requiredFields.push("Address");
    if (!formData.thumbnail && !pendingImageFile) requiredFields.push("Thumbnail Image");
    if (!formData.locationReference) requiredFields.push("Location");
    if (formData.eventCommunityReferences.length === 0) requiredFields.push("Communities (select 1-2)");
    if (formData.categoryReferences.length === 0) requiredFields.push("Categories (select 1-2)");
    
    if (requiredFields.length > 0) {
      setCmsMessage(`❌ Please fill in the following required fields: ${requiredFields.join(", ")}`);
      return;
    }

    setIsSendingToCMS(true);
    setCmsMessage("");

    try {
      let thumbnailData = formData.thumbnail;
      
      if (pendingImageFile) {
        try{
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
          thumbnailData = imageData;
        } catch (uploadError) {
          setCmsMessage(`❌ Failed to upload image: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
          setIsSendingToCMS(false);
          return; // Don't proceed with creation if image upload fails
        }
      }
      
      // Prepare the payload
      const fieldData: any = {
        name: formData.name,
        description: formData.description || "",
        "club-name": formData.clubName || "",
        "date-and-time": formData.dateAndTime || "",
        address: formData.address || "",
        thumbnail: thumbnailData || "",
        "ticket-link": formData.ticketLink || "",
        timezone: formData.timezone || "",
      };

      // Add references if provided
      if (formData.locationReference) {
        fieldData.location = formData.locationReference;
      }
      if (formData.organiserNameReference) {
        // Webflow reference fields should be arrays, even for single references
        fieldData["organiser-name"] = [formData.organiserNameReference];
      }
      if (formData.eventCommunityReferences.length > 0) {
        fieldData["event-community"] = formData.eventCommunityReferences;
      }
      if (formData.categoryReferences.length > 0) {
        fieldData["places-2"] = formData.categoryReferences;
      }

      const response = await fetch(`/api/collection/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fieldData }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        let errorMessage = `Failed to create item: ${response.status} ${response.statusText}`;

        try {
          const errorJson = JSON.parse(errorData);
          if (errorJson.details) {
            errorMessage += ` - ${errorJson.details}`;
          }
        } catch (e) {
          errorMessage += ` - ${errorData}`;
        }

        throw new Error(errorMessage);
      }

      const newItem = await response.json();
      setCmsMessage(
        `✅ Successfully created event! Redirecting to My Events...`
      );

      // Redirect to main page after successful creation
      setTimeout(() => {
        router.push('/');
      }, 2000);
      } catch (error) {
        setCmsMessage(
        `❌ Failed to create item: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsSendingToCMS(false);
    }
  };

  const handleClearData = () => {
    setFormData({
      name: "",
      description: "",
      clubName: "",
      dateAndTime: "",
      address: "",
      thumbnail: "",
      ticketLink: "",
      timezone: "",
      locationReference: "",
      organiserNameReference: currentUserInfo?.webflowUserId || "", // Keep current user
      eventCommunityReferences: [] as string[],
      categoryReferences: [] as string[],
    });
    setCmsMessage("");
  };

  const getCmsMessageClass = () => {
    if (cmsMessage.includes("✅")) return styles.success;
    if (cmsMessage.includes("❌")) return styles.error;
    return "";
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.scraperContainer}>
          {fetchErrors.length > 0 && (
            <div style={{ 
              background: 'rgba(255, 0, 0, 0.1)', 
              border: '1px solid #ff4d4f', 
              borderRadius: '8px', 
              padding: '1rem', 
              margin: '1rem',
              color: '#ff4d4f',
              width: 'calc(100% - 2rem)'
            }}>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>⚠️</span> Data Loading Issues
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.9rem' }}>
                {fetchErrors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
              <p style={{ fontSize: '0.8rem', marginTop: '0.75rem', color: '#ffa39e', opacity: 0.8 }}>
                Check Netlify environment variables: <code>NEXT_PUBLIC_AUTH_TOKEN</code>, <code>NEXT_PUBLIC_COMMUNITY_COLLECTION_ID</code>, etc.
              </p>
            </div>
          )}
          <div className={styles.scrapedDataSection}>
            <div className={styles.sectionHeader}>
              <h2 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600',
                color: 'var(--text-primary)',
                margin: 0
              }}>
                Event - Information
              </h2>
              <button
                onClick={handleClearData}
                className={styles.clearButton}
                style={{
                  background: 'rgba(110, 86, 207, 0.1)',
                  color: 'var(--accent-orange)',
                  border: '1px solid rgba(110, 86, 207, 0.3)',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(110, 86, 207, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(110, 86, 207, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                🗑️ Clear Form
              </button>
            </div>

            <p className={styles.editInstructions} style={{
              color: 'var(--text-secondary)',
              fontSize: '0.95rem',
              marginTop: '1rem',
              marginBottom: '2rem',
              padding: '1rem',
              background: 'rgba(110, 86, 207, 0.05)',
              borderLeft: '3px solid var(--accent-orange)',
              borderRadius: '4px'
            }}>
              💡 <strong>All fields marked with</strong> <span style={{color: 'red'}}>*</span> <strong>are required.</strong> You can select up to 2 communities and 2 categories per event. The URL slug will be auto-generated from the event name.
            </p>

            <div className={styles.dataGrid}>
              <div className={styles.dataField}>
                <label>Event Name: <span style={{color: 'red'}}>*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className={styles.dataInput}
                  placeholder="Enter event name..."
                  required
                />
              </div>

              <div className={styles.dataField}>
                <label>Description: <span style={{color: 'red'}}>*</span></label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className={styles.dataTextarea}
                  placeholder="Enter event description..."
                  rows={4}
                  required
                />
              </div>

              <div className={styles.dataField}>
                <label>Club Name: <span style={{color: 'red'}}>*</span></label>
                <input
                  type="text"
                  value={formData.clubName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      clubName: e.target.value,
                    }))
                  }
                  className={styles.dataInput}
                  placeholder="Enter club name..."
                  required
                />
              </div>

              <div className={styles.dataField}>
                <label>Date and Time: <span style={{color: 'red'}}>*</span></label>
                <input
                  type="datetime-local"
                  value={formData.dateAndTime}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      dateAndTime: e.target.value,
                    }))
                  }
                  className={styles.dataInput}
                  required
                />
              </div>

              <div className={styles.dataField}>
                <label>Timezone:</label>
                <select
                  value={formData.timezone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      timezone: e.target.value,
                    }))
                  }
                  className={styles.dataInput}
                  style={{ 
                    cursor: 'pointer',
                    fontWeight: '500',
                    color: formData.timezone ? '#ffffff' : '#a0a3bd'
                  }}
                >
                  <option value="" style={{ background: '#211f2e', color: '#a0a3bd' }}>Select timezone...</option>
                  {collectionFields && (() => {
                    // Find the timezone field in collection fields
                    const timezoneField = collectionFields.find((field: any) => 
                      field.slug === 'timezone' || field.slug === 'Timezone' || 
                      field.name === 'Timezone' || field.name === 'timezone' ||
                      (field.type === 'Option' && (field.slug?.toLowerCase().includes('timezone') || field.name?.toLowerCase().includes('timezone')))
                    );
                    // Extract options from the field - handle different Webflow API structures
                    let timezoneOptions: any[] = [];
                    if (timezoneField) {
                      if (Array.isArray(timezoneField.options)) {
                        timezoneOptions = timezoneField.options;
                      } else if (timezoneField.validations?.options) {
                        timezoneOptions = timezoneField.validations.options;
                      } else if (timezoneField.validations?.choices) {
                        timezoneOptions = timezoneField.validations.choices;
                      }
                    }
                    return timezoneOptions.map((option: any, index: number) => {
                      const optionValue = option.id || option.value || option.name || option;
                      const optionLabel = option.name || option.label || option.value || option.id || option;
                      return (
                        <option 
                          key={option.id || option.value || option.name || index} 
                          value={optionValue}
                          style={{ background: '#211f2e', color: '#ffffff' }}
                        >
                          {optionLabel}
                        </option>
                      );
                    });
                  })()}
                </select>
              </div>

              <div className={styles.dataField}>
                <label>Address: <span style={{color: 'red'}}>*</span></label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  className={styles.dataInput}
                  placeholder="Enter event address..."
                  required
                />
              </div>

              <ImageUpload
                currentImageUrl={formData.thumbnail}
                onImageUploaded={(imageData) =>
                  setFormData((prev) => ({
                    ...prev,
                    thumbnail: imageData,
                  }))
                }
                onFileSelected={(file) => {
                  console.log('📁 File selected for thumbnail:', file?.name || 'none');
                  setPendingImageFile(file);
                }}
                uploadOnSelect={false}
                label="Thumbnail Image *"
              />

              <div className={styles.dataField}>
                <label>Ticket Link:</label>
                <input
                  type="url"
                  value={formData.ticketLink}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      ticketLink: e.target.value,
                    }))
                  }
                  className={styles.dataInput}
                  placeholder="Enter ticket purchase link..."
                />
              </div>

              <div className={styles.dataField}>
                <label>Location: <span style={{color: 'red'}}>*</span></label>
                <select
                  value={formData.locationReference}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      locationReference: e.target.value,
                    }))
                  }
                  className={styles.dataInput}
                  style={{ 
                    cursor: 'pointer',
                    fontWeight: '500',
                    color: formData.locationReference ? '#ffffff' : '#a0a3bd'
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

              <div className={styles.dataField}>
                <label>Organiser Name: <span style={{color: '#14a68e', fontSize: '0.9rem', fontWeight: 'normal'}}>(Auto-filled)</span></label>
                <input
                  type="text"
                  value={currentUserInfo?.name || 'Loading...'}
                  disabled
                  className={styles.dataInput}
                  style={{ 
                    backgroundColor: '#f3f4f6', 
                    cursor: 'not-allowed',
                    color: '#6b7280',
                    fontWeight: '500'
                  }}
                  title="Automatically set to your user account"
                />
                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem', marginBottom: 0 }}>
                  ℹ️ This event will be associated with your account: <strong>{currentUserInfo?.email}</strong>
                </p>
              </div>

              <div className={styles.dataField}>
                <MultiSelectBadge
                  label="Communities *"
                  options={communities.map((c: any) => ({
                    id: c.id,
                    name: c.fieldData?.name || c.name || c.slug || c.id
                  }))}
                  selectedIds={formData.eventCommunityReferences}
                  onChange={(selectedIds) => 
                    setFormData((prev) => ({
                      ...prev,
                      eventCommunityReferences: selectedIds,
                    }))
                  }
                  placeholder="Click to add communities..."
                  maxSelections={2}
                />
              </div>

              <div className={styles.dataField}>
                <MultiSelectBadge
                  label="Categories *"
                  options={categories.map((c: any) => ({
                    id: c.id,
                    name: c.fieldData?.name || c.name || c.slug || c.id
                  }))}
                  selectedIds={formData.categoryReferences}
                  onChange={(selectedIds) => 
                    setFormData((prev) => ({
                      ...prev,
                      categoryReferences: selectedIds,
                    }))
                  }
                  placeholder="Click to add categories..."
                  maxSelections={2}
                />
              </div>
            </div>

            {/* Submit Section */}
            <div style={{
              marginTop: '3rem',
              paddingTop: '2rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem'
            }}>
              <button
                onClick={handleSendToCMS}
                disabled={isSendingToCMS}
                style={{
                  padding: '1rem 3rem',
                  background: isSendingToCMS 
                    ? 'rgba(107, 114, 128, 0.5)' 
                    : 'linear-gradient(135deg, #6E56CF 0%, #8b73e0 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: isSendingToCMS ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: isSendingToCMS 
                    ? 'none' 
                    : '0 4px 16px rgba(110, 86, 207, 0.4)',
                  transform: isSendingToCMS ? 'none' : 'translateY(0)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  minWidth: '250px',
                  justifyContent: 'center'
                }}
                onMouseOver={(e) => {
                  if (!isSendingToCMS) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(110, 86, 207, 0.5)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isSendingToCMS) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(110, 86, 207, 0.4)';
                  }
                }}
              >
                {isSendingToCMS ? (
                  <>
                    <span style={{ 
                      display: 'inline-block', 
                      animation: 'spin 1s linear infinite',
                      fontSize: '1.2rem'
                    }}>⏳</span>
                    Creating Event...
                  </>
                ) : (
                  <>
                    ✨ Create Event
                  </>
                )}
              </button>
              
              {cmsMessage && (
                <div style={{
                  padding: '1rem 1.5rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  minWidth: '300px',
                  justifyContent: 'center',
                  background: cmsMessage.includes("✅") 
                    ? 'rgba(34, 197, 94, 0.1)' 
                    : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${cmsMessage.includes("✅") ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  color: cmsMessage.includes("✅") ? '#22c55e' : '#ef4444',
                  animation: 'slideIn 0.3s ease-out'
                }}>
                  {cmsMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

