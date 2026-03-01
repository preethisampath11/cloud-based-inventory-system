import React, { useState, useEffect } from 'react';
import medicineService from '../services/medicineService';
import saleService from '../services/saleService';
import purchaseService from '../services/purchaseService';
import LoadingSpinner from '../components/LoadingSpinner';

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
  const [metrics, setMetrics] = useState({
    totalMedicines: 0,
    lowStockItems: 0,
    totalSales: 0,
    totalPurchases: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardMetrics();
    
    // Set up a focus listener to refetch data when user returns to dashboard
    window.addEventListener('focus', fetchDashboardMetrics);
    return () => window.removeEventListener('focus', fetchDashboardMetrics);
  }, []);

  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      let medicines = [];
      let sales = [];
      let purchases = [];

      // Fetch medicines with error handling
      try {
        const medicinesResponse = await medicineService.getMedicines();
        console.log('Medicines response:', medicinesResponse);
        medicines = medicinesResponse.data?.data?.medicines || [];
      } catch (err) {
        console.warn('Warning: Could not fetch medicines:', err.message);
        medicines = [];
      }

      // Fetch sales with error handling
      try {
        const salesResponse = await saleService.getSales();
        console.log('Sales response:', salesResponse);
        sales = salesResponse.data?.data?.sales || [];
      } catch (err) {
        console.warn('Warning: Could not fetch sales:', err.message);
        sales = [];
      }

      // Fetch purchases with error handling
      try {
        const purchasesResponse = await purchaseService.getPurchases();
        console.log('Purchases response:', purchasesResponse);
        purchases = purchasesResponse.data?.data?.purchases || [];
      } catch (err) {
        console.warn('Warning: Could not fetch purchases:', err.message);
        purchases = [];
      }

      // Calculate metrics
      const totalMedicines = medicines.length;
      
      // Low stock items: medicines with low quantity
      const lowStockItems = medicines.filter(
        (medicine) => medicine.quantity < 10 || (medicine.reorderLevel && medicine.quantity < medicine.reorderLevel)
      ).length;
      
      // Total sales amount
      const totalSales = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
      
      // Total purchases amount
      const totalPurchases = purchases.reduce((sum, purchase) => sum + (purchase.totalAmount || 0), 0);

      console.log('Calculated metrics:', { totalMedicines, lowStockItems, totalSales, totalPurchases });

      setMetrics({
        totalMedicines,
        lowStockItems,
        totalSales,
        totalPurchases,
      });
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
      setError('Failed to load dashboard metrics. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (error) {
    return (
      <div className="dashboard-page">
        <h1>Dashboard</h1>
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
          <button onClick={fetchDashboardMetrics} style={{ marginLeft: '10px' }}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Key Metrics</h2>
        <button 
          onClick={fetchDashboardMetrics}
          disabled={loading}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {loading && <LoadingSpinner />}

      <section className="dashboard-section">
        <div className="metrics-grid">
          <div className="metric-card">
            <h3>Total Medicines</h3>
            <p className="metric-value">{metrics.totalMedicines}</p>
          </div>
          <div className="metric-card">
            <h3>Low Stock Items</h3>
            <p className="metric-value">{metrics.lowStockItems}</p>
          </div>
          <div className="metric-card">
            <h3>Total Sales</h3>
            <p className="metric-value">{formatCurrency(metrics.totalSales)}</p>
          </div>
          <div className="metric-card">
            <h3>Total Purchases</h3>
            <p className="metric-value">{formatCurrency(metrics.totalPurchases)}</p>
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
