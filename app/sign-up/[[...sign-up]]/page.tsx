import { SignUp } from '@clerk/nextjs';
import styles from '../../page.module.css';

export default function SignUpPage() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '80vh',
          gap: '2rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Create Your Account
            </h1>
            <p style={{ color: '#666', fontSize: '1rem' }}>
              Join Gatherings CMS to start managing events
            </p>
          </div>
          <SignUp 
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-lg"
              }
            }}
          />
        </div>
      </main>
    </div>
  );
}

