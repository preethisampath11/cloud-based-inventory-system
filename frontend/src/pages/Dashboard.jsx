import React from 'react';

/**
 * Dashboard Page
 * Main landing page for authenticated users
 * 
 * Features:
 * - Overview of key metrics
 * - Quick access to main modules
 * - Recent activities
 * - Alerts (low stock, expiring medicines)
 */
const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      
      <section className="dashboard-section">
        <h2>Key Metrics</h2>
        <div className="metrics-grid">
          <div className="metric-card">
            <h3>Total Medicines</h3>
            <p className="metric-value">0</p>
          </div>
          <div className="metric-card">
            <h3>Low Stock Items</h3>
            <p className="metric-value">0</p>
          </div>
          <div className="metric-card">
            <h3>Total Sales</h3>
            <p className="metric-value">₹0</p>
          </div>
          <div className="metric-card">
            <h3>Total Purchases</h3>
            <p className="metric-value">₹0</p>
          </div>
        </div>
      </section>

      <section className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions">
          <a href="/medicines" className="action-button">Manage Medicines</a>
          <a href="/sales" className="action-button">Record Sale</a>
          <a href="/purchases" className="action-button">Record Purchase</a>
          <a href="/reports" className="action-button">View Reports</a>
        </div>
      </section>

      <section className="dashboard-section">
        <h2>Recent Activities</h2>
        <p>No recent activities yet</p>
      </section>
    </div>
  );
};

export default Dashboard;
