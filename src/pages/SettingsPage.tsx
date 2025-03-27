import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import UserProfile from '../components/profile/UserProfile';
import { 
  User, 
  Building, 
  Bell, 
  Lock, 
  Globe, 
  Save
} from 'lucide-react';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account');
  const [setting1, setSetting1] = useState('');
  const [setting2, setSetting2] = useState('Option 1');
  const [loading, setLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Settings sub-items
  const settingsSubItems = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'business', label: 'Business', icon: Building },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'language', label: 'Language', icon: Globe }
  ];

  const saveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert('Settings saved successfully!');
    }, 1000);
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  // Render the content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return <UserProfile />;
      default:
        return (
          <>
            <h2 style={{ 
              margin: '0 0 16px 0', 
              fontSize: '18px', 
              fontWeight: '500'
            }}>
              {activeTab === 'business' ? 'Business Settings' : 
               activeTab === 'notifications' ? 'Notification Settings' : 
               activeTab === 'security' ? 'Security Settings' : 'Language Settings'}
            </h2>
            
            <p style={{ 
              color: 'rgba(0,0,0,0.6)',
              marginBottom: '24px',
              fontSize: '14px'
            }}>
              Manage your {activeTab} settings and preferences here.
            </p>
            
            <form onSubmit={saveChanges}>
              {/* Text Field */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '8px'
                }}>
                  Setting 1
                </label>
                <input
                  type="text"
                  placeholder="Enter setting"
                  value={setting1}
                  onChange={(e) => setSetting1(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    fontSize: '14px',
                    border: '1px solid rgba(0,0,0,0.12)',
                    borderRadius: '4px',
                    backgroundColor: 'transparent',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Select Field */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '8px'
                }}>
                  Setting 2
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={setting2}
                    onChange={(e) => setSetting2(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      fontSize: '14px',
                      border: '1px solid rgba(0,0,0,0.12)',
                      borderRadius: '4px',
                      backgroundColor: 'transparent',
                      appearance: 'none',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <option value="Option 1">Option 1</option>
                    <option value="Option 2">Option 2</option>
                    <option value="Option 3">Option 3</option>
                  </select>
                  <div style={{ 
                    position: 'absolute',
                    top: '50%',
                    right: '14px',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none'
                  }}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L5 5L9 1" stroke="#757575" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Toggle Switch */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '24px'
              }}>
                <label style={{ 
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Enable Notifications
                </label>
                <button
                  type="button"
                  onClick={toggleNotifications}
                  style={{
                    position: 'relative',
                    width: '52px',
                    height: '32px',
                    borderRadius: '16px',
                    backgroundColor: notificationsEnabled ? '#4CAF50' : '#e0e0e0',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease'
                  }}
                >
                  <span style={{
                    position: 'absolute',
                    top: '4px',
                    left: notificationsEnabled ? '24px' : '4px',
                    width: '24px',
                    height: '24px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    transition: 'left 0.3s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }} />
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  height: '40px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 16px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'default' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <Save size={16} />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </form>
          </>
        );
    }
  };

  return (
    <Layout>
      <div className="md-content">
        {/* Main Content Header */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h1 style={{ fontSize: '24px', margin: 0, flex: 1 }}>
            Settings
          </h1>
          
          {/* Save Changes Button - Only show for non-account tabs */}
          {activeTab !== 'account' && (
            <button
              onClick={saveChanges}
              disabled={loading}
              style={{
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 16px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: loading ? 'default' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                gap: '8px',
                fontSize: '14px'
              }}
            >
              <Save size={16} />
              <span style={{ fontWeight: '500' }}>
                {loading ? 'Saving...' : 'Save Changes'}
              </span>
            </button>
          )}
        </div>

        {/* Settings Navigation and Content */}
        <div style={{ display: 'flex', gap: '24px' }}>
          {/* Settings Sub-Navigation */}
          <div style={{ 
            width: '200px',
            backgroundColor: 'white',
            borderRadius: '10px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <nav style={{ padding: '8px' }}>
              {settingsSubItems.map(item => {
                const isActive = item.id === activeTab;
                
                return (
                  <a 
                    key={item.id}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab(item.id);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      textDecoration: 'none',
                      color: isActive ? '#4CAF50' : 'rgba(0,0,0,0.7)',
                      fontWeight: isActive ? '500' : 'normal',
                      fontSize: '14px',
                      backgroundColor: isActive ? 'rgba(76, 175, 80, 0.08)' : 'transparent',
                      borderRadius: '100px',
                      marginBottom: '4px',
                      transition: 'all 0.2s ease',
                      gap: '12px'
                    }}
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </nav>
          </div>
          
          {/* Settings Content */}
          <div style={{ 
            flex: 1,
            backgroundColor: 'white',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ padding: '24px' }}>
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}