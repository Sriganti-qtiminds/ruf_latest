import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { STUDIO_BASE } from '../../routes/routesPath';

const SIDEBAR_WIDTH = 320;

const sidebarStyle = {
  background: '#181f3a',
  color: 'white',
  width: SIDEBAR_WIDTH + 'px',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  padding: '24px 0',
  position: 'fixed',
  left: 0,
  top: 0,
  boxShadow: '2px 0 16px 0 rgba(0,0,0,0.15)',
  zIndex: 10,
  transition: 'transform 0.3s ease-in-out',
};

// Update the mobileSidebarStyle to be smaller and hidden by default
const mobileSidebarStyle = {
  ...sidebarStyle,
  width: '280px', // Reduced from 100vw
  maxWidth: '280px', // Reduced from 320px
  transform: 'translateX(-100%)', // Hidden by default
};

const navItemBaseStyle = {
  padding: '12px 32px',
  fontSize: '1.15rem',
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  border: 'none',
  background: 'none',
  color: 'inherit',
  textAlign: 'left',
  gap: '12px',
  borderRadius: '16px',
  transition: 'background 0.2s',
  marginBottom: '12px',
};

const navItems = [
  { label: 'Dashboard', icon: 'ri-dashboard-line' },
  { label: 'Projects', icon: 'ri-folder-line' },
  { label: 'Finance', icon: 'ri-money-dollar-circle-line' },
  { label: 'Vendors', icon: 'ri-store-line' },
  { label: 'Users', icon: 'ri-user-line' },
  { label: 'Rooms', icon: 'ri-home-2-line' },
  { label: 'Testimonials', icon: 'ri-chat-smile-2-line' },
];

const smNavItems = [
  { label: 'Projects', icon: 'ri-folder-line' },
];

function Sidebar({ selected, setSelected, role, isOpen, onToggle }) {
  const [hovered, setHovered] = useState(null);
  const [projectsExpanded, setProjectsExpanded] = useState(false);

  const getNavItemStyle = (itemLabel) => {
    let style = { ...navItemBaseStyle };
    if (selected === itemLabel) {
      style.background = '#E07A5F';
      style.color = 'white';
    } else if (hovered === itemLabel) {
      style.background = '#3b82f6';
      style.color = 'white';
    }
    return style;
  };

  let itemsToShow = [];
  if (role === 'admin') {
    itemsToShow = navItems;
  } else if (role === 'site-manager') {
    itemsToShow = smNavItems;
  } else {
    return null;
  }
  const navigate = useNavigate();
  const currentSidebarStyle = window.innerWidth <= 768 
    ? { 
        ...mobileSidebarStyle, 
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        display: isOpen ? 'flex' : 'none' 
      }
    : sidebarStyle;

  return (
    <>
      {/* Mobile Overlay - only show when sidebar is open on mobile */}
      {isOpen && window.innerWidth <= 768 && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div style={currentSidebarStyle}>
        {/* Mobile Close Button */}
        {window.innerWidth <= 768 && (
          <button
            onClick={onToggle}
            className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl"
          >
            <i className="ri-close-line"></i>
          </button>
        )}
        
        <div style={{ fontWeight: 'bold', fontSize: '2rem', marginBottom: '32px', paddingLeft: '32px' }}>
          <button onClick={()=> navigate("/base/studio")}>Rufrent Studio</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', paddingRight: '16px' }}>
          {itemsToShow.map((item) => {
            if (item.label === 'Projects') {
              return (
                <div key="Projects">
                  <button
                    style={{ ...getNavItemStyle('Projects'), width: '100%' }}
                    onClick={() => {
                      setSelected('Projects');
                      // Close sidebar on mobile after selection
                      if (window.innerWidth <= 768) {
                        onToggle();
                      }
                    }}
                    onMouseEnter={() => setHovered('Projects')}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <i className={`${item.icon} ri-lg`} style={{ marginRight: '12px' }}></i>
                    Projects
                  </button>
                  {/* Show sub-options only if Projects is selected */}
                  {selected.startsWith('Projects') && (
                    <div style={{ marginLeft: '32px', display: 'flex', flexDirection: 'column', gap: '0px' }}>
                      {[ 'Add Project', 'Add Main Task', 'Add Subtask'].map((sub, idx) => (
                        <button
                          key={sub}
                          style={{
                            ...navItemBaseStyle,
                            fontSize: '1rem',
                            background: selected === `Projects:${sub}` ? '#E07A5F' : 'none',
                            color: selected === `Projects:${sub}` ? 'white' : '#cbd5e1',
                            marginBottom: idx === 3 ? '12px' : '0',
                          }}
                          onClick={() => {
                            setSelected(`Projects:${sub}`);
                            // Close sidebar on mobile after selection
                            if (window.innerWidth <= 768) {
                              onToggle();
                            }
                          }}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            } else if (item.label === 'Finance') {
              return (
                <div key="Finance">
                  <button
                    style={{ ...getNavItemStyle('Finance'), width: '100%' }}
                    onClick={() => {
                      setSelected('Finance');
                      // Close sidebar on mobile after selection
                      if (window.innerWidth <= 768) {
                        onToggle();
                      }
                    }}
                    onMouseEnter={() => setHovered('Finance')}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <i className={`${item.icon} ri-lg`} style={{ marginRight: '12px' }}></i>
                    Finance
                  </button>
                  {/* Show sub-options only if Finance is selected */}
                  {selected.startsWith('Finance') && (
                    <div style={{ marginLeft: '32px', display: 'flex', flexDirection: 'column', gap: '0px' }}>
                      {[  'Check Payment','Vendor Invoices', ].map((sub, idx) => (
                        <button
                          key={sub}
                          style={{
                            ...navItemBaseStyle,
                            fontSize: '1rem',
                            background: selected === `Finance:${sub}` ? '#E07A5F' : 'none',
                            color: selected === `Finance:${sub}` ? 'white' : '#cbd5e1',
                            marginBottom: idx === 4 ? '12px' : '0',
                          }}
                          onClick={() => {
                            setSelected(`Finance:${sub}`);
                            // Close sidebar on mobile after selection
                            if (window.innerWidth <= 768) {
                              onToggle();
                            }
                          }}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <button
                key={item.label}
                style={getNavItemStyle(item.label)}
                onClick={() => {
                  setSelected(item.label);
                  // Close sidebar on mobile after selection
                  if (window.innerWidth <= 768) {
                    onToggle();
                  }
                }}
                onMouseEnter={() => setHovered(item.label)}
                onMouseLeave={() => setHovered(null)}
              >
                <i className={`${item.icon} ri-lg`} style={{ marginRight: '12px' }}></i>
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default Sidebar; 