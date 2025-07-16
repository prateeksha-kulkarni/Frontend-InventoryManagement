import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../Button/Button';
import styles from './Layout.module.css';

const Layout = () => {
  const { currentUser, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={styles.layoutContainer}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? '' : styles.sidebarClosed}`}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Inventory System</h2>
          <button className={styles.sidebarToggle} onClick={toggleSidebar}>
            {isSidebarOpen ? '←' : '→'}
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => 
              `${styles.navLink} ${isActive ? styles.activeLink : ''}`
            }
          >
            <span className={styles.navIcon}>📊</span>
            <span className={styles.navText}>Dashboard</span>
          </NavLink>

          {/* Change Log - Accessible to all roles */}
          <NavLink 
            to="/change-log" 
            className={({ isActive }) => 
              `${styles.navLink} ${isActive ? styles.activeLink : ''}`
            }
          >
            <span className={styles.navIcon}>📝</span>
            <span className={styles.navText}>Change Log</span>
          </NavLink>

          {/* Analytics - Accessible to Analyst and higher */}
          {hasRole('Analyst') && (
            <NavLink 
              to="/analytics" 
              className={({ isActive }) => 
                `${styles.navLink} ${isActive ? styles.activeLink : ''}`
              }
            >
              <span className={styles.navIcon}>📈</span>
              <span className={styles.navText}>Analytics</span>
            </NavLink>
          )}

          {/* Manager-only pages */}
          {hasRole('Manager') && (
            <>
              <NavLink 
                to="/stock-adjustment" 
                className={({ isActive }) => 
                  `${styles.navLink} ${isActive ? styles.activeLink : ''}`
                }
              >
                <span className={styles.navIcon}>📦</span>
                <span className={styles.navText}>Stock Adjustment</span>
              </NavLink>

              <NavLink 
                to="/transfer" 
                className={({ isActive }) => 
                  `${styles.navLink} ${isActive ? styles.activeLink : ''}`
                }
              >
                <span className={styles.navIcon}>🔄</span>
                <span className={styles.navText}>Inter-Store Transfer</span>
              </NavLink>

              <NavLink 
                to="/restock-suggestions" 
                className={({ isActive }) => 
                  `${styles.navLink} ${isActive ? styles.activeLink : ''}`
                }
              >
                <span className={styles.navIcon}>🔍</span>
                <span className={styles.navText}>Restock Suggestions</span>
              </NavLink>

              <NavLink 
                to="/purchase-order" 
                className={({ isActive }) => 
                  `${styles.navLink} ${isActive ? styles.activeLink : ''}`
                }
              >
                <span className={styles.navIcon}>📋</span>
                <span className={styles.navText}>Purchase Orders</span>
              </NavLink>
              <NavLink 
              to="/low-stock-alerts" 
            className={({ isActive }) => 
              `${styles.navLink} ${isActive ? styles.activeLink : ''}`
                }
           >
             <span className={styles.navIcon}>⚠️</span>
              <span className={styles.navText}>Low Stock</span>
              </NavLink>

            </>
          )}
 
          {hasRole('Admin') && (
            <>
              <NavLink 
                to="/user-registration" 
                className={({ isActive }) => 
                  `${styles.navLink} ${isActive ? styles.activeLink : ''}`
                }
              >
                <span className={styles.navIcon}>👤</span>
                <span className={styles.navText}>User Registration</span>
              </NavLink>

              <NavLink 
                to="/store-setup" 
                className={({ isActive }) => 
                  `${styles.navLink} ${isActive ? styles.activeLink : ''}`
                }
              >
                <span className={styles.navIcon}>🏪</span>
                <span className={styles.navText}>Store Setup</span>
              </NavLink>
                {/* <NavLink 
              to="/low-stock-alerts" 
            className={({ isActive }) => 
              `${styles.navLink} ${isActive ? styles.activeLink : ''}`
                }
           >
             <span className={styles.navIcon}>⚠️</span>
              <span className={styles.navText}>Low Stock</span>
          </NavLink> */}
            </>
          )}
        </nav>
      </aside>

      {/* Main content */}
      <main className={styles.mainContent}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button 
              className={styles.mobileMenuButton} 
              onClick={toggleSidebar}
              aria-label="Toggle menu"
            >
              ☰
            </button>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{currentUser?.name}</span>
              <span className={styles.userRole}>{currentUser?.role}</span>
            </div>
            <Button 
              variant="outline" 
              size="small" 
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </header>

        {/* Page content */}
        <div className={styles.pageContent}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
