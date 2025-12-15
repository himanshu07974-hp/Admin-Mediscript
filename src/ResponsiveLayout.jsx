// src/Components/ResponsiveLayout.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from './Components/Sidebar';

const ResponsiveLayout = ({ children }) => {
  const [sidebarWidth, setSidebarWidth] = useState('240px');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      setSidebarWidth(window.innerWidth <= 768 ? '0px' : '240px');
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSidebarToggle = (isOpen) => {
    if (isMobile) {
      setSidebarWidth(isOpen ? '250px' : '0px');
    } else {
      setSidebarWidth(isOpen ? '240px' : '60px');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: '#E0F2FE',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <Sidebar onToggle={handleSidebarToggle} isMobile={isMobile} />
      
      <main style={{ 
        marginLeft: sidebarWidth, 
        flex: 1, 
        padding: '1rem',
        transition: 'margin-left 0.3s ease-in-out',
        width: '100%',
        boxSizing: 'border-box',
        overflowX: 'hidden'
      }}>
        {children}
      </main>
    </div>
  );
};

export default ResponsiveLayout;