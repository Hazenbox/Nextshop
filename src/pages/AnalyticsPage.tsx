import React from 'react';
import { Layout } from '../components/Layout';
import { BarChart2, TrendingUp, DollarSign, LineChart } from 'lucide-react';

export function AnalyticsPage() {
  return (
    <Layout>
      <div className="md-content" style={{ 
        minHeight: '100vh', 
        padding: '24px'
      }}>
        <h1 className="md-headline-medium" style={{ 
          margin: '0 0 24px 0',
          color: 'var(--md-on-surface)'
        }}>
          Analytics Dashboard
        </h1>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '16px',
          marginBottom: '24px'
        }}>
          {/* Analytics Cards */}
          <div className="md-card">
            <div className="md-card-content" style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                backgroundColor: 'var(--md-primary-container)', 
                borderRadius: '50%', 
                width: '48px', 
                height: '48px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginRight: '16px'
              }}>
                <DollarSign size={24} color="var(--md-on-primary-container)" />
              </div>
              <div>
                <p className="md-body-medium" style={{ color: 'var(--md-on-surface-variant)', margin: 0 }}>Total Revenue</p>
                <p className="md-headline-small" style={{ margin: '4px 0 0 0' }}>₹120,500</p>
              </div>
            </div>
          </div>

          <div className="md-card">
            <div className="md-card-content" style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                backgroundColor: 'var(--md-primary-container)', 
                borderRadius: '50%', 
                width: '48px', 
                height: '48px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginRight: '16px'
              }}>
                <TrendingUp size={24} color="var(--md-on-primary-container)" />
              </div>
              <div>
                <p className="md-body-medium" style={{ color: 'var(--md-on-surface-variant)', margin: 0 }}>Growth Rate</p>
                <p className="md-headline-small" style={{ margin: '4px 0 0 0' }}>+15.2%</p>
              </div>
            </div>
          </div>

          <div className="md-card">
            <div className="md-card-content" style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                backgroundColor: 'var(--md-primary-container)', 
                borderRadius: '50%', 
                width: '48px', 
                height: '48px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginRight: '16px'
              }}>
                <BarChart2 size={24} color="var(--md-on-primary-container)" />
              </div>
              <div>
                <p className="md-body-medium" style={{ color: 'var(--md-on-surface-variant)', margin: 0 }}>Total Sales</p>
                <p className="md-headline-small" style={{ margin: '4px 0 0 0' }}>487</p>
              </div>
            </div>
          </div>
        </div>

        <div className="md-card">
          <div className="md-card-header">
            <h2 className="md-title-large" style={{ margin: 0 }}>Sales Performance</h2>
          </div>
          <div className="md-card-content" style={{ 
            height: '300px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <div style={{ textAlign: 'center' }}>
              <LineChart size={48} color="var(--md-primary)" style={{ marginBottom: '16px' }} />
              <p className="md-body-medium" style={{ color: 'var(--md-on-surface-variant)' }}>
                Analytics charts will be implemented here
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}