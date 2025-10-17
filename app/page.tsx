"use client";

import styles from "./page.module.css";
import Link from "next/link";
import { useState, useEffect } from "react";
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

  useEffect(() => {
    const fetchData = async () => {
      try {
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

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.navigation}>
          <Link href="/scraper" className={styles.navButton}>
            ➕ Add New Item
          </Link>
        </div>

        <div className={styles.apiData}>
          <h4>{data.collection?.displayName || "Grants Collection"}</h4>
          <div className={styles.items}>
            {data.items?.filter((item: any) => item.isArchived === true).map((item: any) => (
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
                    "Untitled"}
                </h6>
                {item.fieldData?.["faq-answer"] && (
                  <p>FAQ Answer: {item.fieldData["faq-answer"]}</p>
                )}
                {item.fieldData?.['client-stories-summary'] && (
                  <p>Summary: {item.fieldData['client-stories-summary']}</p>
                )}
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
          {!data.items?.filter((item: any) => item.isArchived === true).length && (
            <p className={styles.error}>No archived items found in this collection</p>
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
