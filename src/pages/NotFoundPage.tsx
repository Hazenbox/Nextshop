import React from 'react';
import { Layout } from '../components/Layout';
import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <Layout>
      <div style={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: 'var(--md-surface-container)'
      }}>
        <div className="md-card" style={{ 
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          padding: '32px'
        }}>
          <h1 className="md-headline-medium" style={{ marginBottom: '16px', color: 'var(--md-primary)' }}>
            404 - Page Not Found
          </h1>
          
          <p className="md-body-large" style={{ marginBottom: '24px', color: 'var(--md-on-surface-variant)' }}>
            The page you are looking for might have been removed, had its name changed, 
            or is temporarily unavailable.
          </p>
          
          <Link to="/" className="md-button md-button-filled md-state-layer" style={{ display: 'inline-flex' }}>
            <Home size={18} style={{ marginRight: '8px' }} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </Layout>
  );
} 