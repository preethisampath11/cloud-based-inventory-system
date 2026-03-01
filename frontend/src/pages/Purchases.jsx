import React, { useState, useEffect } from 'react';
import PurchaseTable from '../components/PurchaseTable';
import PurchaseFilters from '../components/PurchaseFilters';
import PurchaseModal from '../components/PurchaseModal';
import purchaseService from '../services/purchaseService';
import medicineService from '../services/medicineService';
import supplierService from '../services/supplierService';
import ErrorAlert from '../components/ErrorAlert';
import SuccessAlert from '../components/SuccessAlert';

/**
 * Purchases Page
 * Modern SaaS-style purchase order management
 * 
 * Features:
 * - View purchase history with filters
 * - Filter by supplier and date range
 * - Sortable and paginated table
 * - Create new purchase orders via modal
 */
const Purchases = () => {
  // Form-related states
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loadingMedicines, setLoadingMedicines] = useState(true);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Purchase history states
  const [purchases, setPurchases] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(true);
  const [purchasesError, setPurchasesError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

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
      console.error('Error fetching suppliers:', err);
    } finally {
      setLoadingSuppliers(false);
    }
  };

  const fetchPurchases = async (options = {}) => {
    try {
      setLoadingPurchases(true);
      setPurchasesError(null);

      const filters = {
        ...(filterSupplier && { supplier: filterSupplier }),
        ...(filterStartDate && { startDate: filterStartDate }),
        ...(filterEndDate && { endDate: filterEndDate }),
        ...(options.search && { search: options.search }),
        ...(options.page && { page: options.page }),
        ...(options.pageSize && { pageSize: options.pageSize }),
        ...(options.sortBy && { sortBy: options.sortBy }),
        ...(options.sortOrder && { sortOrder: options.sortOrder }),
      };

      const response = await purchaseService.getPurchases(filters);
      const purchasesData = response.data.data.purchases || [];
      const totalCount = response.data.data.totalCount || purchasesData.length;
      
      setPurchases(purchasesData);
      setTotalCount(totalCount);
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
    await fetchPurchases({});
  };

  const handleResetFilters = async () => {
    setFilterSupplier('');
    setFilterStartDate('');
    setFilterEndDate('');
    await fetchPurchases({});
  };

  // Action handlers
  const handleViewDetails = (purchaseId) => {
    console.log('View purchase details:', purchaseId);
    // TODO: Implement view details modal
  };

  const handleEditPurchase = (purchaseId) => {
    console.log('Edit purchase:', purchaseId);
    // TODO: Implement edit functionality
  };

  const handleMarkReceived = async (purchaseId) => {
    try {
      setLoadingPurchases(true);
      await purchaseService.markAsReceived(purchaseId);
      setSuccessMessage('Purchase marked as received successfully!');
      await fetchPurchases({});
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to mark purchase as received.';
      setFormError(errorMessage);
      console.error('Error marking purchase as received:', err);
      setLoadingPurchases(false);
    }
  };

  const handleDeletePurchase = async (purchaseId) => {
    try {
      setLoadingPurchases(true);
      await purchaseService.deletePurchase(purchaseId);
      setSuccessMessage('Purchase deleted successfully!');
      await fetchPurchases({});
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to delete purchase.';
      setFormError(errorMessage);
      console.error('Error deleting purchase:', err);
      setLoadingPurchases(false);
    }
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

      // Close modal and refresh purchases list
      setIsModalOpen(false);
      await fetchPurchases({});

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

  return (
    <div className="purchases-page-modern">
      {/* Header Section */}
      <div className="page-header-modern">
        <div className="header-content">
          <div className="header-text">
            <h1 className="page-title">Purchase Orders</h1>
            <p className="page-subtitle">Manage supplier orders and track deliveries</p>
          </div>
          <button
            className="btn-new-purchase"
            onClick={() => setIsModalOpen(true)}
            disabled={isFormLoading}
          >
            <span className="btn-icon">+</span>
            New Purchase Order
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {purchasesError && (
        <ErrorAlert
          message={purchasesError}
          onClose={() => setPurchasesError(null)}
        />
      )}

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

      {/* Main Content */}
      <div className="page-content-modern">
        {/* Filters Section */}
        <PurchaseFilters
          suppliers={suppliers}
          filterSupplier={filterSupplier}
          filterStartDate={filterStartDate}
          filterEndDate={filterEndDate}
          onSupplierChange={setFilterSupplier}
          onStartDateChange={setFilterStartDate}
          onEndDateChange={setFilterEndDate}
          onApplyFilters={handleFilterChange}
          onResetFilters={handleResetFilters}
          isLoading={loadingPurchases}
        />

        {/* Purchases Table Section */}
        <PurchaseTable
          purchases={purchases}
          suppliers={suppliers}
          isLoading={loadingPurchases}
          totalCount={totalCount}
          onFetchPurchases={fetchPurchases}
          onViewDetails={handleViewDetails}
          onEditPurchase={handleEditPurchase}
          onMarkReceived={handleMarkReceived}
          onDeletePurchase={handleDeletePurchase}
        />
      </div>

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        medicines={medicines}
        suppliers={suppliers}
        onSubmit={handleSubmitPurchase}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default Purchases;
