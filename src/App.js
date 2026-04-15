import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { ExpenseProvider } from './context/ExpenseContext';
import { ToastProvider } from './context/ToastContext';
import Group from './components/Group';
import Expenses from './components/Expenses';
import Balances from './components/Balances';
import History from './components/History';
import Charts from './components/Charts';
import Toast from './components/Toast';
import './App.css';

const NAV_ITEMS = [
  { to: '/',         icon: '👥', label: 'Group'    },
  { to: '/expenses', icon: '➕', label: 'Add Expense' },
  { to: '/balances', icon: '⚖️', label: 'Balances'  },
  { to: '/history',  icon: '📋', label: 'History'   },
  { to: '/charts',   icon: '📊', label: 'Charts'    },
];

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <ToastProvider>
      <ExpenseProvider>
        <Router>
          <div className="app-shell">
            {/* Mobile hamburger */}
            <button className="hamburger" onClick={() => setSidebarOpen(o => !o)} aria-label="Toggle menu">
              {sidebarOpen ? '✕' : '☰'}
            </button>

            {/* Sidebar backdrop (mobile) */}
            {sidebarOpen && (
              <div className="sidebar-backdrop show" onClick={closeSidebar} />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
              <div className="sidebar-brand">
                <div className="brand-logo">
                  <div className="brand-icon">💸</div>
                  <div>
                    <div className="brand-name">SplitWise</div>
                    <div className="brand-tagline">Group Expense Tracker</div>
                  </div>
                </div>
              </div>

              <nav className="sidebar-nav">
                {NAV_ITEMS.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    onClick={closeSidebar}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <div className="sidebar-footer">
                <button className="theme-toggle" onClick={() => setDarkMode(d => !d)}>
                  <span className="theme-toggle-icon">{darkMode ? '☀️' : '🌙'}</span>
                  {darkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
              </div>
            </aside>

            {/* Main content */}
            <main className="main-content">
              <Routes>
                <Route path="/"         element={<Group />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/balances" element={<Balances />} />
                <Route path="/history"  element={<History />} />
                <Route path="/charts"   element={<Charts />} />
              </Routes>
            </main>
          </div>

          {/* Global toasts */}
          <Toast />
        </Router>
      </ExpenseProvider>
    </ToastProvider>
  );
}

export default App;
