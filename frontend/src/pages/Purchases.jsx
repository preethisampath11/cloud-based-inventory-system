import React, { useState, useEffect } from 'react';
import PurchaseForm from '../components/PurchaseForm';
import purchaseService from '../services/purchaseService';
import medicineService from '../services/medicineService';
import supplierService from '../services/supplierService';
import ErrorAlert from '../components/ErrorAlert';
import SuccessAlert from '../components/SuccessAlert';

/**
 * Purchases Page
 * Create and manage purchase orders
 * 
 * Features:
 * - View recent purchase details with filters
 * - Filter by supplier
 * - Filter by date range
 * - Create new purchase order
 * - Select supplier from dropdown
 * - Add multiple medicines in one purchase
 * - Dynamic form rows
 * - Calculate total purchase amount automatically
 * - Submit to POST /api/purchases
 * - Show success notification
 */
const Purchases = () => {
  // Form-related states
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loadingMedicines, setLoadingMedicines] = useState(true);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Purchase history states
  const [purchases, setPurchases] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(true);
  const [purchasesError, setPurchasesError] = useState(null);

  // Filter states
  const [filterSupplier, setFilterSupplier] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Fetch data on mount
  useEffect(() => {
    fetchMedicines();
    fetchSuppliers();
    fetchPurchases();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoadingMedicines(true);
      const response = await medicineService.getMedicines();
      const medicinesData = response.data.data.medicines || [];
      setMedicines(medicinesData);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to load medicines. Please try again.';
      setFormError(errorMessage);
      console.error('Error fetching medicines:', err);
    } finally {
      setLoadingMedicines(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      setLoadingSuppliers(true);
      const response = await supplierService.getSuppliers();
      const suppliersData = response.data.data.suppliers || [];
      setSuppliers(suppliersData);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to load suppliers. Please try again.';
      setFormError(errorMessage);
      console.error('Error fetching suppliers:', err);
    } finally {
      setLoadingSuppliers(false);
    }
  };

  const fetchPurchases = async (supplier = '', startDate = '', endDate = '') => {
    try {
      setLoadingPurchases(true);
      setPurchasesError(null);

      const filters = {};
      if (supplier) filters.supplier = supplier;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const response = await purchaseService.getPurchases(filters);
      const purchasesData = response.data.data.purchases || [];
      setPurchases(purchasesData);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to load purchases. Please try again.';
      setPurchasesError(errorMessage);
      console.error('Error fetching purchases:', err);
    } finally {
      setLoadingPurchases(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = async () => {
    await fetchPurchases(filterSupplier, filterStartDate, filterEndDate);
  };

  const handleResetFilters = async () => {
    setFilterSupplier('');
    setFilterStartDate('');
    setFilterEndDate('');
    await fetchPurchases('', '', '');
  };

  const handleSubmitPurchase = async (purchaseData) => {
    try {
      setIsSubmitting(true);
      setFormError(null);

      if (!purchaseData.items || purchaseData.items.length === 0) {
        setFormError('Please add at least one medicine to the purchase');
        setIsSubmitting(false);
        return;
      }

      const response = await purchaseService.createPurchase(purchaseData);

      setSuccessMessage(
        `Purchase order created successfully! Order ID: ${response.data.data._id || 'Created'}`
      );

      // Refresh purchases list
      await fetchPurchases(filterSupplier, filterStartDate, filterEndDate);

      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to create purchase order. Please try again.';
      setFormError(errorMessage);
      console.error('Error creating purchase:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormLoading = loadingMedicines || loadingSuppliers;

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get supplier name by ID
  const getSupplierName = (supplierId) => {
    const supplier = suppliers.find((s) => s._id === supplierId || s.id === supplierId);
    return supplier ? supplier.name : 'Unknown';
  };

  return (
    <div className="purchases-page">
      {/* Purchase History Section */}
      <section className="purchase-history-section">
        <div className="section-header">
          <h2>Purchase History</h2>
        </div>

        {purchasesError && (
          <ErrorAlert
            message={purchasesError}
            onClose={() => setPurchasesError(null)}
          />
        )}

        {/* Filters */}
        <div className="filters-container">
          <div className="filter-group">
            <label htmlFor="filterSupplier">Supplier</label>
            <select
              id="filterSupplier"
              value={filterSupplier}
              onChange={(e) => setFilterSupplier(e.target.value)}
            >
              <option value="">All Suppliers</option>
              {suppliers.map((supplier) => (
                <option key={supplier._id || supplier.id} value={supplier._id || supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="filterStartDate">From Date</label>
            <input
              id="filterStartDate"
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="filterEndDate">To Date</label>
            <input
              id="filterEndDate"
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
            />
          </div>

          <div className="filter-actions">
            <button
              className="btn-primary"
              onClick={handleFilterChange}
              disabled={loadingPurchases}
            >
              Apply Filters
            </button>
            <button
              className="btn-secondary"
              onClick={handleResetFilters}
              disabled={loadingPurchases}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Purchases Table */}
        {loadingPurchases ? (
          <div className="loading-container">
            <p>Loading purchases...</p>
          </div>
        ) : purchases.length === 0 ? (
          <div className="empty-state">
            <p>No purchases found. Create your first purchase order!</p>
          </div>
        ) : (
          <div className="purchases-table-container">
            <table className="purchases-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Supplier</th>
                  <th>Purchase Date</th>
                  <th>Delivery Date</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => (
                  <tr key={purchase._id || purchase.id} className={`status-${purchase.status}`}>
                    <td>
                      <span className="order-id">{(purchase._id || purchase.id).slice(-8)}</span>
                    </td>
                    <td>{getSupplierName(purchase.supplier)}</td>
                    <td>{formatDate(purchase.purchaseDate)}</td>
                    <td>{formatDate(purchase.expectedDeliveryDate || purchase.actualDeliveryDate)}</td>
                    <td>
                      <span className="item-count">{purchase.items?.length || 0}</span>
                    </td>
                    <td className="amount">
                      ₹{(purchase.totalAmount || 0).toFixed(2)}
                    </td>
                    <td>
                      <span className={`status-badge status-${purchase.status}`}>
                        {purchase.status?.charAt(0).toUpperCase() + purchase.status?.slice(1) || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Create Purchase Section */}
      <section className="create-purchase-section">
        <div className="section-header">
          <h2>Create New Purchase Order</h2>
        </div>

        {formError && (
          <ErrorAlert
            message={formError}
            onClose={() => setFormError(null)}
          />
        )}

        {successMessage && (
          <SuccessAlert
            message={successMessage}
            onClose={() => setSuccessMessage(null)}
          />
        )}

        <div className="page-content">
          {isFormLoading ? (
            <div className="loading-container">
              <p>Loading medicines and suppliers...</p>
            </div>
          ) : (
            <PurchaseForm
              medicines={medicines}
              suppliers={suppliers}
              onSubmit={handleSubmitPurchase}
              isLoading={isSubmitting}
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default Purchases;
