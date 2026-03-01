import React, { useState, useEffect } from 'react';
import StatusBadge from './StatusBadge';
import SkeletonLoader from './SkeletonLoader';
import ActionDropdown from './ActionDropdown';
import ConfirmationModal from './ConfirmationModal';

/**
 * PurchaseTable Component
 * Advanced SaaS-style table with pagination, sorting, search, and actions
 * 
 * Props:
 * - purchases: Array of purchase objects
 * - suppliers: Array of supplier objects
 * - isLoading: Loading state
 * - onFetchPurchases: Callback to fetch purchases with filters
 * - onViewDetails: Handler for view action
 * - onEditPurchase: Handler for edit action
 * - onMarkReceived: Handler to mark as received
 * - onDeletePurchase: Handler for delete action
 */
const PurchaseTable = ({
  purchases = [],
  suppliers = [],
  isLoading = false,
  totalCount = 0,
  onFetchPurchases,
  onViewDetails = () => {},
  onEditPurchase = () => {},
  onMarkReceived = () => {},
  onDeletePurchase = () => {},
}) => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: 'purchaseDate',
    direction: 'desc',
  });

  // Search state with debouncing
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Action states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    purchaseId: null,
    isLoading: false,
  });

  // Debounce search (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch purchases when filters change
  useEffect(() => {
    if (onFetchPurchases) {
      onFetchPurchases({
        page: currentPage,
        pageSize,
        search: debouncedSearch,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
      });
    }
  }, [currentPage, pageSize, debouncedSearch, sortConfig, onFetchPurchases]);

  // Calculate pagination info
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalCount);

  // Handle column sort
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Handle delete action
  const handleDeleteClick = (purchaseId) => {
    setConfirmModal({
      isOpen: true,
      purchaseId,
      isLoading: false,
    });
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    setConfirmModal((prev) => ({ ...prev, isLoading: true }));
    try {
      await onDeletePurchase(confirmModal.purchaseId);
      setConfirmModal({ isOpen: false, purchaseId: null, isLoading: false });
    } catch (err) {
      console.error('Error deleting purchase:', err);
      setConfirmModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Get supplier name
  const getSupplierName = (supplierId) => {
    const supplier = suppliers.find(
      (s) => s._id === supplierId || s.id === supplierId
    );
    return supplier ? supplier.name : 'Unknown';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Sort icon component
  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <span className="sort-icon">⇅</span>;
    }
    return (
      <span className={`sort-icon ${sortConfig.direction}`}>
        {sortConfig.direction === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  // Render empty state
  if (!isLoading && purchases.length === 0) {
    return (
      <div className="purchase-table-card">
        <div className="table-empty">
          <div className="empty-icon">📦</div>
          <h3>No Purchase Orders Found</h3>
          <p>{debouncedSearch ? 'Try adjusting your search filters' : 'Create your first purchase order to get started'}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="purchase-table-card">
        {/* Search Bar */}
        <div className="table-search-bar">
          <input
            type="text"
            placeholder="Search by Order ID or Supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <table className="purchase-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('_id')} className="sortable">
                  Order ID <SortIcon columnKey="_id" />
                </th>
                <th onClick={() => handleSort('supplier')} className="sortable">
                  Supplier <SortIcon columnKey="supplier" />
                </th>
                <th onClick={() => handleSort('purchaseDate')} className="sortable">
                  Purchase Date <SortIcon columnKey="purchaseDate" />
                </th>
                <th onClick={() => handleSort('expectedDeliveryDate')} className="sortable">
                  Delivery Date <SortIcon columnKey="expectedDeliveryDate" />
                </th>
                <th>Items</th>
                <th onClick={() => handleSort('totalAmount')} className="sortable">
                  Total Amount <SortIcon columnKey="totalAmount" />
                </th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <SkeletonLoader rows={pageSize} />
              ) : (
                purchases.map((purchase) => (
                  <tr key={purchase._id || purchase.id} className="table-row">
                    <td>
                      <span className="order-id-badge">
                        {(purchase._id || purchase.id).slice(-8).toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className="supplier-name">
                        {getSupplierName(purchase.supplier)}
                      </span>
                    </td>
                    <td>{formatDate(purchase.purchaseDate)}</td>
                    <td>
                      {formatDate(purchase.expectedDeliveryDate || purchase.actualDeliveryDate)}
                    </td>
                    <td>
                      <span className="item-badge">{purchase.items?.length || 0}</span>
                    </td>
                    <td>
                      <span className="amount">
                        ₹{(purchase.totalAmount || 0).toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={purchase.status} />
                    </td>
                    <td className="action-cell">
                      <ActionDropdown
                        purchase={purchase}
                        onView={() => onViewDetails(purchase._id || purchase.id)}
                        onEdit={() => onEditPurchase(purchase._id || purchase.id)}
                        onMarkReceived={() => onMarkReceived(purchase._id || purchase.id)}
                        onDelete={() => handleDeleteClick(purchase._id || purchase.id)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!isLoading && purchases.length > 0 && (
          <div className="table-footer">
            <div className="pagination-info">
              <span className="result-count">
                Showing {startIndex}–{endIndex} of {totalCount} results
              </span>
            </div>

            <div className="pagination-controls">
              <div className="page-size-selector">
                <label htmlFor="pageSize">Per page:</label>
                <select
                  id="pageSize"
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  disabled={isLoading}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
              </div>

              <div className="pagination-buttons">
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1 || isLoading}
                >
                  ← Previous
                </button>

                <span className="pagination-page-info">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages || isLoading}
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title="Delete Purchase Order"
        message="Are you sure you want to delete this purchase order? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setConfirmModal({ isOpen: false, purchaseId: null, isLoading: false })
        }
        isLoading={confirmModal.isLoading}
        isDangerous
      />
    </>
  );
};

export default PurchaseTable;
