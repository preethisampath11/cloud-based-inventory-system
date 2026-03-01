import React, { useState, useEffect } from 'react';
import BatchTable from '../components/BatchTable';
import BatchForm from '../components/BatchForm';
import batchService from '../services/batchService';
import medicineService from '../services/medicineService';
import supplierService from '../services/supplierService';
import { useAuth } from '../hooks/useAuth';

/**
 * Batches Page
 * Main page for managing medicine batches with inventory tracking
 * 
 * Features:
 * - Fetch and display all batches
 * - Filter by medicine and expiry date
 * - Highlight expiring items and low stock
 * - Add new batch
 * - Display expiry countdown
 * - Loading and error states
 */
const Batches = () => {
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [selectedMedicine, setSelectedMedicine] = useState('');
  const [expiryFilter, setExpiryFilter] = useState('all'); // all, expiring, expired

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user has permission to add batches
  const canAddBatches = user && (user.role === 'admin' || user.role === 'pharmacist');

  // Fetch batches and medicines on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Filter batches when filters change
  useEffect(() => {
    filterBatches();
  }, [selectedMedicine, expiryFilter, batches]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch medicines
      const medicinesResponse = await medicineService.getMedicines();
      const medicinesData = medicinesResponse.data.data.medicines || [];
      setMedicines(medicinesData);

      // Fetch suppliers
      const suppliersResponse = await supplierService.getSuppliers();
      const suppliersData = suppliersResponse.data.data.suppliers || [];
      setSuppliers(suppliersData);

      // Fetch batches
      const batchesResponse = await batchService.getBatches();
      const batchesData = batchesResponse.data.data.batches || [];
      setBatches(batchesData);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to load batches. Please try again.';
      setError(errorMessage);
      console.error('Error fetching batches:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterBatches = () => {
    let filtered = [...batches];

    // Filter by medicine
    if (selectedMedicine) {
      filtered = filtered.filter((batch) => batch.medicine._id === selectedMedicine);
    }

    // Filter by expiry status
    const today = new Date();
    if (expiryFilter === 'expiring') {
      filtered = filtered.filter((batch) => {
        const expiry = new Date(batch.expiryDate);
        const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
      });
    } else if (expiryFilter === 'expired') {
      filtered = filtered.filter((batch) => {
        const expiry = new Date(batch.expiryDate);
        return expiry < today;
      });
    }

    setFilteredBatches(filtered);
  };

  const handleAddBatch = () => {
    setIsModalOpen(true);
  };

  const handleSubmitBatch = async (formData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await batchService.createBatch(formData);
      setBatches((prev) => [response.data.data.batch, ...prev]);
      alert('Batch added successfully');
      setIsModalOpen(false);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to add batch. Please try again.';
      setError(errorMessage);
      alert(errorMessage);
      console.error('Error adding batch:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
    }
  };

  return (
    <div className="batches-page">
      <div className="page-header">
        <div className="header-content">
          <h1>📦 Batch Management</h1>
          <p>Track medicine batches and inventory</p>
        </div>
        {canAddBatches && (
          <button className="btn-primary btn-lg" onClick={handleAddBatch}>
            + Add Batch
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="batches-controls">
        <div className="filter-group">
          <div className="filter-item">
            <label htmlFor="medicine-filter">Medicine</label>
            <select
              id="medicine-filter"
              value={selectedMedicine}
              onChange={(e) => setSelectedMedicine(e.target.value)}
              className="filter-select"
            >
              <option value="">All Medicines</option>
              {medicines.map((medicine) => (
                <option key={medicine._id} value={medicine._id}>
                  {medicine.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label htmlFor="expiry-filter">Expiry Status</label>
            <select
              id="expiry-filter"
              value={expiryFilter}
              onChange={(e) => setExpiryFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Batches</option>
              <option value="expiring">Expiring Soon (≤30 days)</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {(selectedMedicine || expiryFilter !== 'all') && (
            <button
              className="btn-secondary"
              onClick={() => {
                setSelectedMedicine('');
                setExpiryFilter('all');
              }}
              title="Clear filters"
            >
              Clear Filters
            </button>
          )}
        </div>

        {filteredBatches.length > 0 && (
          <div className="results-info">
            Showing {filteredBatches.length} of {batches.length} batches
          </div>
        )}
      </div>

      <BatchTable batches={filteredBatches} isLoading={loading} />

      <BatchForm
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitBatch}
        medicines={medicines}
        suppliers={suppliers}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default Batches;
