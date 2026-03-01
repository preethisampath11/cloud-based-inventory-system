import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';

/**
 * Admin Requests Management Page
 * Allows admins to view and manage pending admin access requests
 */
const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchAdminRequests();
  }, [statusFilter]);

  const fetchAdminRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/auth/admin-requests', {
        params: { status: statusFilter },
      });

      setRequests(response.data.data.requests || []);
    } catch (err) {
      console.error('Error fetching admin requests:', err);
      setError(err.response?.data?.message || 'Failed to fetch admin requests');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="admin-requests-page" style={{ padding: '20px' }}>
      <h1>Admin Access Requests</h1>

      {error && (
        <div style={{
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '4px',
          padding: '12px',
          marginBottom: '20px',
          color: '#c33',
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px' }}>Filter by Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #ddd',
          }}
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading && <p>Loading requests...</p>}

      {!loading && requests.length === 0 && (
        <p>No {statusFilter} admin requests found.</p>
      )}

      {!loading && requests.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Reason</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Requested At</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>
                    {req.firstName} {req.lastName}
                  </td>
                  <td style={{ padding: '12px' }}>{req.email}</td>
                  <td style={{ padding: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {req.reason}
                  </td>
                  <td style={{ padding: '12px', fontSize: '12px' }}>
                    {formatDate(req.requestedAt)}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: req.status === 'pending' ? '#fef3c7' :
                        req.status === 'approved' ? '#dcfce7' : '#fee2e2',
                      color: req.status === 'pending' ? '#92400e' :
                        req.status === 'approved' ? '#166534' : '#991b1b',
                    }}>
                      {req.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {req.status === 'pending' && (
                      <div>
                        <button
                          onClick={() => setSelectedRequest(req)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#22c55e',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginRight: '5px',
                            fontSize: '12px',
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setSelectedRequest({ ...req, action: 'reject' })}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for approval/rejection */}
      {selectedRequest && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
          }}>
            <h2>
              {selectedRequest.action === 'reject' ? 'Reject' : 'Approve'} Admin Request
            </h2>
            <p>
              <strong>Name:</strong> {selectedRequest.firstName} {selectedRequest.lastName}
            </p>
            <p>
              <strong>Email:</strong> {selectedRequest.email}
            </p>
            <p>
              <strong>Reason:</strong>
            </p>
            <p style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
              {selectedRequest.reason}
            </p>

            {selectedRequest.action === 'reject' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>
                  Rejection Reason (Optional):
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this request was rejected"
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    fontFamily: 'Arial',
                  }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setRejectionReason('');
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#e5e7eb',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    if (selectedRequest.action === 'reject') {
                      // Call reject endpoint
                      await apiClient.put(`/auth/admin-requests/${selectedRequest.approvalToken}/reject`, {
                        rejectionReason,
                      });
                    } else {
                      // Call approve endpoint
                      await apiClient.put(`/auth/admin-requests/${selectedRequest.approvalToken}/approve`, {});
                    }
                    setSelectedRequest(null);
                    setRejectionReason('');
                    fetchAdminRequests();
                  } catch (err) {
                    alert(err.response?.data?.message || 'Failed to process request');
                  }
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: selectedRequest.action === 'reject' ? '#ef4444' : '#22c55e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {selectedRequest.action === 'reject' ? 'Reject' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRequests;
