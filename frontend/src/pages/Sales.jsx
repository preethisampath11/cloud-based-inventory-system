import React, { useState, useEffect } from 'react';
import SalesForm from '../components/SalesForm';
import InvoiceModal from '../components/InvoiceModal';
import medicineService from '../services/medicineService';
import saleService from '../services/saleService';
import ErrorAlert from '../components/ErrorAlert';
import SuccessAlert from '../components/SuccessAlert';
import { useAuth } from '../hooks/useAuth';

/**
 * Sales & Transactions Page
 * Record and manage sales transactions
 * 
 * Features:
 * - Select medicine from dropdown
 * - Enter quantity to sell
 * - Show available stock for each medicine
 * - Auto calculate total price based on selling price
 * - Submit to POST /api/sales
 * - Show invoice preview after success
 * - Validate if quantity exceeds available stock
 * - Proper error handling from backend
 */
const Sales = () => {
  // Form-related states
  const [medicines, setMedicines] = useState([]);
  const [loadingMedicines, setLoadingMedicines] = useState(true);
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Invoice modal states
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  // Sales history states
  const [sales, setSales] = useState([]);
  const [loadingSales, setLoadingSales] = useState(true);
  const [salesError, setSalesError] = useState(null);

  // Filter states
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('');

  const { user } = useAuth();

  // Fetch data on mount
  useEffect(() => {
    fetchMedicines();
    fetchSales();
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

  const fetchSales = async (startDate = '', endDate = '', paymentMethod = '') => {
    try {
      setLoadingSales(true);
      setSalesError(null);

      const filters = {};
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      if (paymentMethod) filters.paymentMethod = paymentMethod;

      const response = await saleService.getSales(filters);
      const salesData = response.data.data.sales || [];
      setSales(salesData);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to load sales. Please try again.';
      setSalesError(errorMessage);
      console.error('Error fetching sales:', err);
    } finally {
      setLoadingSales(false);
    }
  };

  const handleFilterChange = () => {
    fetchSales(filterStartDate, filterEndDate, filterPaymentMethod);
  };

  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      setFormError(null);
      setSuccessMessage(null);

      // Prepare sale data for API
      const salePayload = {
        items: formData.items.map((item) => ({
          medicine: item.medicineId,
          quantity: parseInt(item.quantity, 10),
          pricePerUnit: parseFloat(item.pricePerUnit),
        })),
        paymentMethod: formData.paymentMethod,
        discountAmount: parseFloat(formData.discountAmount) || 0,
        taxAmount: parseFloat(formData.taxAmount) || 0,
        notes: formData.notes || '',
      };

      // Submit sale
      const response = await saleService.createSale(salePayload);
      const createdSale = response.data.data.sale;

      // Set invoice data for modal display
      const invoice = {
        saleId: createdSale._id,
        saleDate: new Date(createdSale.saleDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        cashier: `${createdSale.cashier.firstName} ${createdSale.cashier.lastName}`,
        items: createdSale.items.map((item) => ({
          medicine: item.medicine.name,
          quantity: item.quantity,
          pricePerUnit: item.pricePerUnit,
          totalPrice: item.totalPrice,
        })),
        subtotal: createdSale.totalAmount,
        discountAmount: createdSale.discountAmount,
        taxAmount: createdSale.taxAmount,
        totalAmount:
          createdSale.totalAmount + createdSale.taxAmount - createdSale.discountAmount,
        paymentMethod: createdSale.paymentMethod,
        notes: createdSale.notes,
      };

      setInvoiceData(invoice);
      setShowInvoiceModal(true);

      // Show success message
      setSuccessMessage('Sale recorded successfully!');

      // Refresh sales list
      setTimeout(() => {
        fetchSales(filterStartDate, filterEndDate, filterPaymentMethod);
      }, 1000);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to create sale. Please try again.';
      setFormError(errorMessage);
      console.error('Error creating sale:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseInvoiceModal = () => {
    setShowInvoiceModal(false);
    setInvoiceData(null);
  };

  return (
    <div className="sales-page">
      <div className="page-header">
        <h1>Point of Sale</h1>
        <p>Record medicine sales and generate invoices</p>
      </div>

      <div className="sales-container">
        {/* Sales Form Section */}
        <div className="sales-form-section">
          <div className="section-header">
            <h2>New Sale</h2>
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

          {loadingMedicines ? (
            <div className="loading-spinner">Loading medicines...</div>
          ) : (
            <SalesForm
              medicines={medicines}
              onSubmit={handleFormSubmit}
              isLoading={isSubmitting}
            />
          )}
        </div>

        {/* Sales History Section */}
        <div className="sales-history-section">
          <div className="section-header">
            <h2>Sales History</h2>
          </div>

          {salesError && (
            <ErrorAlert
              message={salesError}
              onClose={() => setSalesError(null)}
            />
          )}

          {/* Filters */}
          <div className="filters-container">
            <div className="filter-group">
              <label htmlFor="startDate">From Date</label>
              <input
                type="date"
                id="startDate"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="endDate">To Date</label>
              <input
                type="date"
                id="endDate"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="paymentMethod">Payment Method</label>
              <select
                id="paymentMethod"
                value={filterPaymentMethod}
                onChange={(e) => setFilterPaymentMethod(e.target.value)}
              >
                <option value="">All Methods</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="insurance">Insurance</option>
                <option value="check">Check</option>
                <option value="mobile_money">Mobile Money</option>
              </select>
            </div>

            <button className="btn btn-secondary" onClick={handleFilterChange}>
              Apply Filters
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => {
                setFilterStartDate('');
                setFilterEndDate('');
                setFilterPaymentMethod('');
                fetchSales('', '', '');
              }}
            >
              Reset
            </button>
          </div>

          {/* Sales List */}
          {loadingSales ? (
            <div className="loading-spinner">Loading sales history...</div>
          ) : sales.length === 0 ? (
            <div className="empty-state">
              <p>No sales recorded yet.</p>
            </div>
          ) : (
            <div className="sales-table-wrapper">
              <table className="sales-table">
                <thead>
                  <tr>
                    <th>Sale ID</th>
                    <th>Date</th>
                    <th>Cashier</th>
                    <th>Items</th>
                    <th>Total Amount</th>
                    <th>Payment Method</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale._id}>
                      <td>{sale._id.substring(0, 8).toUpperCase()}</td>
                      <td>
                        {new Date(sale.saleDate).toLocaleDateString('en-US')}
                      </td>
                      <td>{sale.cashier.firstName} {sale.cashier.lastName}</td>
                      <td>{sale.items.length}</td>
                      <td>
                        ${sale.totalAmount.toFixed(2)}
                      </td>
                      <td>
                        <span className="payment-badge">
                          {sale.paymentMethod}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Modal */}
      {invoiceData && (
        <InvoiceModal
          isOpen={showInvoiceModal}
          invoice={invoiceData}
          onClose={handleCloseInvoiceModal}
        />
      )}
    </div>
  );
};

export default Sales;
