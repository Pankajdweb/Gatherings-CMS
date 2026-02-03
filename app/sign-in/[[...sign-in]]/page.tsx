import { SignIn } from "@clerk/nextjs";
import styles from "../../page.module.css";

export default function SignInPage() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "80vh",
            gap: "2rem",
          }}
        >
          <img
            src="https://cdn.prod.website-files.com/6865ac77d1a4f0d42c02ccbf/69747608ec059323a70420b9_Dark%20Background.png"
            alt="Gatherings CMS"
            style={{
             maxWidth: "300px",
             marginBottom: "1rem",
           
            }}
        
          />
          <div style={{ textAlign: "center", maxWidth: "550px" }}>
            <p
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                marginBottom: "1rem",
              }}
            >
              Post your event in minutes!
            </p>
            <p style={{ color: "#fff", fontSize: "1.25rem" }}>
            Reach thousands of LGBTQ+ people discovering what’s happening around them. It’s free!
            </p>
          </div>
          <SignIn
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-lg",
              },
            }}
          />
        </div>
      </main>
    </div>
  );
}
