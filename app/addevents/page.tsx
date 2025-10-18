"use client";

import { useState, useEffect } from "react";
import styles from "../page.module.css";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import MultiSelectBadge from "../components/MultiSelectBadge";
import ImageUpload from "../components/ImageUpload";

export default function AddItemPage() {
  const [isSendingToCMS, setIsSendingToCMS] = useState(false);
  const [cmsMessage, setCmsMessage] = useState("");
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    slug: string;
    description: string;
    clubName: string;
    eventOrganiserName: string;
    dateAndTime: string;
    address: string;
    thumbnail: string | { fileId: string; url: string; alt?: string };
    ticketLink: string;
    featuredImage: boolean;
    order: number;
    locationReference: string;
    organiserNameReference: string;
    eventCommunityReferences: string[];
    categoryReferences: string[];
  }>({
    name: "",
    slug: "",
    description: "",
    clubName: "",
    eventOrganiserName: "",
    dateAndTime: "",
    address: "",
    thumbnail: "",
    ticketLink: "",
    featuredImage: false,
    order: 0,
    locationReference: "",
    organiserNameReference: "", // Auto-filled with current user
    eventCommunityReferences: [] as string[],
    categoryReferences: [] as string[],
  });
  const [collectionFields, setCollectionFields] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [currentUserInfo, setCurrentUserInfo] = useState<any>(null);

  // Fetch collection structure, categories, communities, locations, and current user
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch collection structure
        const collectionResponse = await fetch(`/api/collection`);
        if (collectionResponse.ok) {
          const data = await collectionResponse.json();
          setCollectionFields(data.collection?.fields || []);
        }

        // Fetch categories
        const categoriesResponse = await fetch(`/api/categories`);
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData.items || []);
        }

        // Fetch communities
        const communitiesResponse = await fetch(`/api/communities`);
        if (communitiesResponse.ok) {
          const communitiesData = await communitiesResponse.json();
          setCommunities(communitiesData.items || []);
        }

        // Fetch locations
        const locationsResponse = await fetch(`/api/locations`);
        if (locationsResponse.ok) {
          const locationsData = await locationsResponse.json();
          setLocations(locationsData.items || []);
        }

        // Fetch current user's Webflow ID
        const userResponse = await fetch(`/api/current-user-webflow`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setCurrentUserInfo(userData);
          // Auto-fill the organiser field with current user's Webflow ID
          setFormData((prev) => ({
            ...prev,
            organiserNameReference: userData.webflowUserId,
          }));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);


  const handleSendToCMS = async () => {
    if (!formData.name || !formData.slug) {
      setCmsMessage("❌ Please enter both Name and Slug (required fields)");
      return;
    }

    setIsSendingToCMS(true);
    setCmsMessage("");

    try {
      let thumbnailData = formData.thumbnail;
      
      // If there's a pending image file, upload it first
      if (pendingImageFile) {
        console.log('=== Uploading image before creating item ===');
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
          thumbnailData = imageData;
        } catch (uploadError) {
          console.error('❌ Image upload failed:', uploadError);
          setCmsMessage(`❌ Failed to upload image: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
          setIsSendingToCMS(false);
          return; // Don't proceed with creation if image upload fails
        }
      }
      
      // Prepare the payload
      const fieldData: any = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || "",
        "club-name": formData.clubName || "",
        "event-organiser-name": formData.eventOrganiserName || "",
        "date-and-time": formData.dateAndTime || "",
        address: formData.address || "",
        thumbnail: thumbnailData || "",
        "ticket-link": formData.ticketLink || "",
        "featured-image": formData.featuredImage,
        order: formData.order || 0,
      };

      // Add references if provided
      if (formData.locationReference) {
        fieldData.location = formData.locationReference;
      }
      if (formData.organiserNameReference) {
        fieldData["organiser-name"] = formData.organiserNameReference;
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
        `✅ Successfully created item in CMS! Item ID: ${newItem.id}`
      );

      // Clear the form after successful creation
      setTimeout(() => {
        handleClearData();
        setCmsMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error creating item:", error);
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
      slug: "",
      description: "",
      clubName: "",
      eventOrganiserName: "",
      dateAndTime: "",
      address: "",
      thumbnail: "",
      ticketLink: "",
      featuredImage: false,
      order: 0,
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
          <div className={styles.scrapedDataSection}>
            <div className={styles.sectionHeader}>
              <h2 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600',
                color: 'var(--text-primary)',
                margin: 0
              }}>
                Event Information
              </h2>
              <button
                onClick={handleClearData}
                className={styles.clearButton}
                style={{
                  background: 'rgba(255, 107, 53, 0.1)',
                  color: 'var(--accent-orange)',
                  border: '1px solid rgba(255, 107, 53, 0.3)',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 107, 53, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 107, 53, 0.1)';
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
              background: 'rgba(255, 107, 53, 0.05)',
              borderLeft: '3px solid var(--accent-orange)',
              borderRadius: '4px'
            }}>
              💡 <strong>Required fields</strong> are marked with <span style={{color: 'red'}}>*</span>
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
                <label>Slug (URL): <span style={{color: 'red'}}>*</span></label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      slug: e.target.value,
                    }))
                  }
                  className={styles.dataInput}
                  placeholder="e.g., my-event-2025"
                  required
                />
              </div>

              <div className={styles.dataField}>
                <label>Description:</label>
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
                />
              </div>

              <div className={styles.dataField}>
                <label>Club Name:</label>
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
                />
              </div>

              <div className={styles.dataField}>
                <label>Event Organiser Name:</label>
                <input
                  type="text"
                  value={formData.eventOrganiserName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      eventOrganiserName: e.target.value,
                    }))
                  }
                  className={styles.dataInput}
                  placeholder="Enter organiser name..."
                />
              </div>

              <div className={styles.dataField}>
                <label>Date and Time:</label>
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
                />
              </div>

              <div className={styles.dataField}>
                <label>Address:</label>
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
                label="Thumbnail Image"
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
                <label>Location:</label>
                <select
                  value={formData.locationReference}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      locationReference: e.target.value,
                    }))
                  }
                  className={styles.dataInput}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="">Select a location...</option>
                  {locations.map((loc: any) => (
                    <option key={loc.id} value={loc.id}>
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
                  label="Communities"
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
                />
              </div>

              <div className={styles.dataField}>
                <MultiSelectBadge
                  label="Categories"
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
                />
              </div>

              <div className={styles.dataField}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem', 
                  cursor: 'pointer',
                  padding: '1rem',
                  background: formData.featuredImage ? 'rgba(255, 107, 53, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '8px',
                  border: `2px solid ${formData.featuredImage ? 'var(--accent-orange)' : 'rgba(255, 255, 255, 0.1)'}`,
                  transition: 'all 0.2s ease'
                }}>
                  <input
                    type="checkbox"
                    checked={formData.featuredImage}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        featuredImage: e.target.checked,
                      }))
                    }
                    style={{ 
                      width: '20px', 
                      height: '20px', 
                      cursor: 'pointer',
                      accentColor: 'var(--accent-orange)'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: '600', fontSize: '1rem' }}>⭐ Featured Event</span>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Highlight this event on the main page
                    </p>
                  </div>
                </label>
              </div>

              <div className={styles.dataField}>
                <label>Order (for sorting):</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      order: parseInt(e.target.value) || 0,
                    }))
                  }
                  className={styles.dataInput}
                  placeholder="Enter order number..."
                  min="0"
                  step="1"
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
                    : 'linear-gradient(135deg, #FF6B35 0%, #f59e42 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: isSendingToCMS ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: isSendingToCMS 
                    ? 'none' 
                    : '0 4px 16px rgba(255, 107, 53, 0.4)',
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
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 107, 53, 0.5)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isSendingToCMS) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 107, 53, 0.4)';
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

