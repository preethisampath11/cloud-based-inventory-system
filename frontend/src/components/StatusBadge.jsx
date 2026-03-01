import React from 'react';

/**
 * StatusBadge Component
 * Displays status with appropriate color coding
 * 
 * Props:
 * - status: 'pending', 'received', 'partial', 'cancelled'
 */
const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: {
      label: 'Pending',
      className: 'badge-pending',
    },
    received: {
      label: 'Received',
      className: 'badge-received',
    },
    partial: {
      label: 'Partial',
      className: 'badge-partial',
    },
    cancelled: {
      label: 'Cancelled',
      className: 'badge-cancelled',
    },
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;

  return (
    <span className={`status-badge ${config.className}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
