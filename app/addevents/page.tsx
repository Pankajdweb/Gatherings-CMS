"use client";

import { useState, useEffect } from "react";
import styles from "../page.module.css";
import Link from "next/link";
import MultiSelectBadge from "../components/MultiSelectBadge";

export default function AddItemPage() {
  const [isSendingToCMS, setIsSendingToCMS] = useState(false);
  const [cmsMessage, setCmsMessage] = useState("");
  const [formData, setFormData] = useState({
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
    eventCommunityReferences: [] as string[],
    categoryReferences: [] as string[],
  });
  const [collectionFields, setCollectionFields] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  // Fetch collection structure, categories, communities, and locations on component mount
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
      // Prepare the payload
      const fieldData: any = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || "",
        "club-name": formData.clubName || "",
        "event-organiser-name": formData.eventOrganiserName || "",
        "date-and-time": formData.dateAndTime || "",
        address: formData.address || "",
        thumbnail: formData.thumbnail || "",
        "ticket-link": formData.ticketLink || "",
        "featured-image": formData.featuredImage,
        order: formData.order || 0,
      };

      // Add references if provided
      if (formData.locationReference) {
        fieldData.location = formData.locationReference;
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
          <Link href="/" className={styles.backButton}>
            ← Back to Collections
          </Link>

          <div className={styles.scrapedDataSection}>
            <div className={styles.sectionHeader}>
              <h2>Add New Event</h2>
              <button
                onClick={handleClearData}
                className={styles.clearButton}
              >
                Clear Form
              </button>
            </div>

            <p className={styles.editInstructions}>
              Fill in the event details below to create a new item in the CMS:
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

              <div className={styles.dataField}>
                <label>Thumbnail Image URL:</label>
                <input
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      thumbnail: e.target.value,
                    }))
                  }
                  className={styles.dataInput}
                  placeholder="Enter thumbnail image URL..."
                />
              </div>

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
                <MultiSelectBadge
                  label="Event Communities"
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
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.featuredImage}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        featuredImage: e.target.checked,
                      }))
                    }
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>Featured Event</span>
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

            {/* Send to CMS Button */}
            <button
              onClick={handleSendToCMS}
              className={styles.sendToCMSButton}
              disabled={isSendingToCMS}
            >
              {isSendingToCMS ? "Creating Event..." : "Create Event in CMS"}
            </button>
            {cmsMessage && (
              <p className={`${styles.cmsMessage} ${getCmsMessageClass()}`}>
                {cmsMessage}
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

