"use client";

import { useState, useEffect } from "react";
import styles from "../page.module.css";
import Link from "next/link";
import RichTextEditor from "../components/RichTextEditor";

export default function AddItemPage() {
  const [isSendingToCMS, setIsSendingToCMS] = useState(false);
  const [cmsMessage, setCmsMessage] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    imageUrl: "",
    openingDate: "",
    closingDate: "",
    duration: "",
    mainBody: "",
    fundingBody: "",
    awardValue: "",
    url: "",
    order: 0,
  });
  const [collectionFields, setCollectionFields] = useState<any>(null);

  // Fetch collection structure on component mount
  useEffect(() => {
    const fetchCollectionStructure = async () => {
      try {
        const response = await fetch(`/api/collection`);
        if (response.ok) {
          const data = await response.json();
          setCollectionFields(data.collection?.fields || []);
        }
      } catch (error) {
        console.error("Error fetching collection structure:", error);
      }
    };

    fetchCollectionStructure();
  }, []);


  const handleSendToCMS = async () => {
    if (!formData.title) {
      setCmsMessage("❌ Please enter at least a title before submitting");
      return;
    }

    setIsSendingToCMS(true);
    setCmsMessage("");

    try {
      const response = await fetch(`/api/collection/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fieldData: {
            name: formData.title,
            "client-stories-summary": formData.shortDescription || "",
            "opens": formData.openingDate,
            "closes": formData.closingDate,
            "deadline-text": formData.duration,
            "funding-body": formData.fundingBody,
            "award-value": formData.awardValue,
            "client-stories-thumbnail-image": formData.imageUrl,
            "client-stories-body": formData.mainBody,
            "meta-title": formData.title,
            "meta-description": (formData.shortDescription || "")
              .replace(/\n/g, " ")
              .trim(),
            "url-5": formData.url,
            order: formData.order,
          },
        }),
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
      title: "",
      shortDescription: "",
      imageUrl: "",
      openingDate: "",
      closingDate: "",
      duration: "",
      mainBody: "",
      fundingBody: "",
      awardValue: "",
      url: "",
      order: 0,
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
              <h2>Add New Item</h2>
              <button
                onClick={handleClearData}
                className={styles.clearButton}
              >
                Clear Form
              </button>
            </div>

            <p className={styles.editInstructions}>
              Fill in the details below to create a new item in the CMS:
            </p>

            <div className={styles.dataGrid}>
              <div className={styles.dataField}>
                <label>Title: <span style={{color: 'red'}}>*</span></label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className={styles.dataInput}
                  placeholder="Enter title..."
                  required
                />
              </div>

              <div className={styles.dataField}>
                <label>Short Description:</label>
                <textarea
                  value={formData.shortDescription}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      shortDescription: e.target.value,
                    }))
                  }
                  className={styles.dataTextarea}
                  placeholder="Enter short description..."
                  rows={3}
                />
              </div>

              <div className={styles.dataField}>
                <label>Image URL:</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      imageUrl: e.target.value,
                    }))
                  }
                  className={styles.dataInput}
                  placeholder="Enter image URL..."
                />
              </div>

              <div className={styles.dataField}>
                <label>Opening Date (YYYY-MM-DD):</label>
                <input
                  type="date"
                  value={formData.openingDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      openingDate: e.target.value,
                    }))
                  }
                  className={styles.dataInput}
                />
              </div>

              <div className={styles.dataField}>
                <label>Closing Date (YYYY-MM-DD):</label>
                <input
                  type="date"
                  value={formData.closingDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      closingDate: e.target.value,
                    }))
                  }
                  className={styles.dataInput}
                />
              </div>

              <div className={styles.dataField}>
                <label>Duration:</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      duration: e.target.value,
                    }))
                  }
                  className={styles.dataInput}
                  placeholder="e.g., 6 months"
                />
              </div>

              <div className={styles.dataField}>
                <label>Funding Body:</label>
                <input
                  type="text"
                  value={formData.fundingBody}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      fundingBody: e.target.value,
                    }))
                  }
                  className={styles.dataInput}
                  placeholder="Enter funding body..."
                />
              </div>

              <div className={styles.dataField}>
                <label>Award Value:</label>
                <input
                  type="text"
                  value={formData.awardValue}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      awardValue: e.target.value,
                    }))
                  }
                  className={styles.dataInput}
                  placeholder="Enter award value..."
                />
              </div>

              <div className={styles.dataField}>
                <label>Main Body Content:</label>
                <RichTextEditor
                  value={formData.mainBody}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      mainBody: value,
                    }))
                  }
                  placeholder="Enter main body content..."
                />
              </div>

              <div className={styles.dataField}>
                <label>URL:</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      url: e.target.value,
                    }))
                  }
                  className={styles.dataInput}
                  placeholder="Enter URL..."
                />
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
              {isSendingToCMS ? "Creating Item..." : "Create Item in CMS"}
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
