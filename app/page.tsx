"use client";

import styles from "./page.module.css";
import Link from "next/link";
import { useState, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import EditItemModal from "./components/EditItemModal";

async function getCollectionItems() {
  const res = await fetch(`/api/collection`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to fetch collection items");
  }
  return res.json();
}

// Helper function to format dates consistently
function formatDate(dateString: string) {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    return "";
  }
}

// Helper function to get relative time
function getRelativeTime(dateString: string) {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${diffInWeeks} week${diffInWeeks !== 1 ? 's' : ''} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
    }

    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
  } catch (error) {
    return "";
  }
}

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserWebflowId, setCurrentUserWebflowId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First, get current user's Webflow ID
        const userResponse = await fetch('/api/current-user-webflow');
        let userWebflowId = null;
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          userWebflowId = userData.webflowUserId;
          setCurrentUserWebflowId(userWebflowId);
        }

        // Then fetch all events
        const result = await getCollectionItems();
        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sync user to Webflow on first visit
  useEffect(() => {
    const syncUser = async () => {
      try {
        await fetch('/api/sync-user', { method: 'POST' });
      } catch (error) {
        console.error('Error syncing user:', error);
      }
    };

    syncUser();
  }, []);

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleSave = (updatedItem: any) => {
    setData((prev: any) => ({
      ...prev,
      items: prev.items.map((item: any) =>
        item.id === updatedItem.id ? updatedItem : item
      ),
    }));
  };

  if (isLoading) {
    return <div className={styles.page}>Loading...</div>;
  }

  if (!data) {
    return <div className={styles.page}>Error loading data</div>;
  }

  // Filter events to show only current user's events
  const userEvents = data?.items?.filter((item: any) => 
    item.fieldData?.['organiser-name'] === currentUserWebflowId
  ) || [];

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.apiData}>
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '2rem',
            paddingTop: '1rem'
          }}>
            <h4 style={{ 
              fontSize: '2rem', 
              fontWeight: '700',
              margin: '0 0 0.5rem 0'
            }}>
              My Events
            </h4>
            <p style={{ 
              color: '#9ca3af', 
              fontSize: '1rem', 
              margin: 0 
            }}>
              Showing all events you've created (Draft, Published, and Archived)
            </p>
          </div>
          <div className={styles.items}>
            {userEvents.map((item: any) => (
              <div
                key={item.id}
                className={styles.item}
                onClick={() => handleItemClick(item)}
                style={{ cursor: "pointer" }}
              >
                <h6>
                  {item.fieldData?.name ||
                    item.name ||
                    item.displayName ||
                    "Untitled Event"}
                </h6>

                {/* Description */}
                {item.fieldData?.description && (
                  <p><strong>Description:</strong> {item.fieldData.description}</p>
                )}

                {/* Club Name */}
                {item.fieldData?.['club-name'] && (
                  <p><strong>Club:</strong> {item.fieldData['club-name']}</p>
                )}

                {/* Organiser */}
                {item.fieldData?.['event-organiser-name'] && (
                  <p><strong>Organiser:</strong> {item.fieldData['event-organiser-name']}</p>
                )}

                {/* Date and Time */}
                {item.fieldData?.['date-and-time'] && (
                  <p><strong>📅 Date:</strong> {new Date(item.fieldData['date-and-time']).toLocaleString()}</p>
                )}

                {/* Address */}
                {item.fieldData?.address && (
                  <p><strong>📍 Address:</strong> {item.fieldData.address}</p>
                )}

                {/* Badges */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  {item.fieldData?.thumbnail && (
                    <span className={styles.statusBadge} style={{ background: '#e0e7ff', color: '#3730a3' }}>
                      🖼️ Has Thumbnail
                    </span>
                  )}
                  {item.fieldData?.['featured-image'] && (
                    <span className={styles.statusBadge} style={{ background: '#fef3c7', color: '#92400e' }}>
                      ⭐ Featured
                    </span>
                  )}
                </div>

                {/* Ticket Link */}
                {item.fieldData?.['ticket-link'] && (
                  <p><strong>🎟️ Tickets:</strong> <a href={item.fieldData['ticket-link']} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>Get Tickets</a></p>
                )}

                {/* Order */}
                {typeof item.fieldData?.order !== 'undefined' && (
                  <p><strong>Order:</strong> {item.fieldData.order}</p>
                )}

                {/* Archive Status */}
                {typeof item.isArchived !== 'undefined' && (
                  <p className={styles.readyStatus}>
                    Archived:
                    <span
                      className={`${styles.statusBadge} ${
                        item.isArchived
                          ? styles.published
                          : styles.draft
                      }`}
                    >
                      {item.isArchived ? "Yes" : "No"}
                    </span>
                  </p>
                )}

                {typeof item.isDraft !== 'undefined' && (
                  <p className={styles.readyStatus}>
                    Draft:
                    <span
                      className={`${styles.statusBadge} ${
                        item.isDraft
                          ? styles.draft
                          : styles.published
                      }`}
                    >
                      {item.isDraft ? "Yes" : "No"}
                    </span>
                  </p>
                )}

                {/* Timestamps */}
                {item.lastPublished && (
                  <div className={styles.dateBadgeContainer}>
                    <span className={`${styles.dateBadge} ${styles.published}`}>
                      📅 Published
                    </span>
                    <span className={styles.relativeTime}>
                      {getRelativeTime(item.lastPublished)}
                    </span>
                  </div>
                )}
                {item.lastUpdated && (
                  <div className={styles.dateBadgeContainer}>
                    <span className={`${styles.dateBadge} ${styles.updated}`}>
                      🔄 Updated
                    </span>
                    <span className={styles.relativeTime}>
                      {getRelativeTime(item.lastUpdated)}
                    </span>
                  </div>
                )}
                {item.createdOn && (
                  <div className={styles.dateBadgeContainer}>
                    <span className={`${styles.dateBadge} ${styles.created}`}>
                      ✨ Created
                    </span>
                    <span className={styles.relativeTime}>
                      {getRelativeTime(item.createdOn)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
          {userEvents.length === 0 && !isLoading && (
            <p className={styles.error}>
              {currentUserWebflowId 
                ? "You haven't created any events yet. Click 'Add New Event' to get started!"
                : "Loading your events..."}
            </p>
          )}
        </div>

        {selectedItem && (
          <EditItemModal
            item={selectedItem}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedItem(null);
            }}
            onSave={handleSave}
          />
        )}

      </main>
    </div>
  );
}
