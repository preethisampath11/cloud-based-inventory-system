import React, { useState, useEffect } from 'react';
import MedicineTable from '../components/MedicineTable';
import MedicineFormModal from '../components/MedicineFormModal';
import medicineService from '../services/medicineService';

/**
 * Medicines Page
 * Main page for managing medicines
 * 
 * Features:
 * - Fetch and display medicines
 * - Search medicines by name
 * - Add new medicine
 * - Edit existing medicine
 * - Delete medicine
 * - Loading and error states
 */
const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);

  // Fetch medicines on mount
  useEffect(() => {
    fetchMedicines();
  }, []);

  // Filter medicines when search term changes
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = medicines.filter((medicine) =>
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMedicines(filtered);
    } else {
      setFilteredMedicines(medicines);
    }
  }, [searchTerm, medicines]);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await medicineService.getMedicines();
      setMedicines(response.data.data || []);
      setFilteredMedicines(response.data.data || []);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to load medicines. Please try again.';
      setError(errorMessage);
      console.error('Error fetching medicines:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicine = () => {
    setEditingMedicine(null);
    setIsModalOpen(true);
  };

  const handleEditMedicine = (medicine) => {
    setEditingMedicine(medicine);
    setIsModalOpen(true);
  };

  const handleDeleteMedicine = async (medicineId) => {
    if (window.confirm('Are you sure you want to delete this medicine? This action cannot be undone.')) {
      try {
        await medicineService.deleteMedicine(medicineId);
        setMedicines((prev) => prev.filter((m) => (m._id || m.id) !== medicineId));
        alert('Medicine deleted successfully');
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          'Failed to delete medicine. Please try again.';
        alert(errorMessage);
        console.error('Error deleting medicine:', err);
      }
    }
  };

  const handleSubmitMedicine = async (formData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (editingMedicine) {
        // Update existing medicine
        const response = await medicineService.updateMedicine(
          editingMedicine._id || editingMedicine.id,
          formData
        );
        setMedicines((prev) =>
          prev.map((m) =>
            (m._id || m.id) === (editingMedicine._id || editingMedicine.id)
              ? response.data.data
              : m
          )
        );
        alert('Medicine updated successfully');
      } else {
        // Create new medicine
        const response = await medicineService.createMedicine(formData);
        setMedicines((prev) => [response.data.data, ...prev]);
        alert('Medicine added successfully');
      }

      setIsModalOpen(false);
      setEditingMedicine(null);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to save medicine. Please try again.';
      setError(errorMessage);
      alert(errorMessage);
      console.error('Error saving medicine:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
      setEditingMedicine(null);
    }
  };

  return (
    <div className="medicines-page">
      <div className="page-header">
        <div className="header-content">
          <h1>💊 Medicines Management</h1>
          <p>Manage your pharmacy medicines inventory</p>
        </div>
        <button className="btn-primary btn-lg" onClick={handleAddMedicine}>
          + Add Medicine
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="medicines-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search medicines by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button
              className="clear-search"
              onClick={() => setSearchTerm('')}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {filteredMedicines.length > 0 && (
          <div className="results-info">
            Showing {filteredMedicines.length} of {medicines.length} medicines
          </div>
        )}
      </div>

      <MedicineTable
        medicines={filteredMedicines}
        isLoading={loading}
        onEdit={handleEditMedicine}
        onDelete={handleDeleteMedicine}
      />

      <MedicineFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitMedicine}
        initialData={editingMedicine}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default Medicines;
