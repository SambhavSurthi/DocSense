import React, { useEffect, useState, useCallback } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Download, 
  User, 
  FileText, 
  Calendar,
  AlertCircle,
  Filter,
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DownloadRequest {
  id: string;
  document: {
    id: string;
    title: string;
    fileType: string;
    uploadedBy: {
      username: string;
      email: string;
    };
  };
  requestedBy: {
    username: string;
    email: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  requestReason: string;
  createdAt: string;
  approvedBy?: {
    username: string;
    email: string;
  };
  approvedAt?: string;
  downloadCount: number;
  maxDownloads: number;
}

const AdminDownloadRequests: React.FC = () => {
  const [requests, setRequests] = useState<DownloadRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<DownloadRequest | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [actionData, setActionData] = useState({
    maxDownloads: 1,
    rejectionReason: ''
  });

  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(filterStatus !== 'all' && { status: filterStatus })
      });

      const response = await fetch(`/api/documents/admin/download-requests?${params}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch requests');

      const data = await response.json();
      setRequests(data.data.requests);
      setTotalPages(data.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching download requests:', error);
      toast.error('Failed to fetch download requests');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filterStatus]);

  const handleRequestAction = async () => {
    if (!selectedRequest) return;

    try {
      const response = await fetch(`/api/documents/admin/download-requests/${selectedRequest.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          action: actionType,
          ...(actionType === 'approve' && { maxDownloads: actionData.maxDownloads }),
          ...(actionType === 'reject' && { reason: actionData.rejectionReason })
        })
      });

      if (!response.ok) throw new Error('Failed to process request');

      toast.success(`Download request ${actionType}d successfully`);
      setShowActionModal(false);
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      console.error('Error processing request:', error);
      toast.error(`Failed to ${actionType} request`);
    }
  };

  const openActionModal = (request: DownloadRequest, type: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(type);
    setActionData({
      maxDownloads: 1,
      rejectionReason: ''
    });
    setShowActionModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'expired':
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = requests.filter(request => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        request.document.title.toLowerCase().includes(searchLower) ||
        request.requestedBy.username.toLowerCase().includes(searchLower) ||
        request.requestedBy.email.toLowerCase().includes(searchLower) ||
        request.requestReason.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Download Requests</h1>
              <p className="text-gray-600">
                Manage and approve document download requests from users
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Download className="w-5 h-5" />
              <span>{requests.length} Total Requests</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by document title, user, or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <Download className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterStatus !== 'all' ? 'No requests found' : 'No download requests yet'}
            </h3>
            <p className="text-gray-600">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Download requests from users will appear here.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-2xl">📄</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {request.document.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {request.document.fileType.toUpperCase()} • 
                          Uploaded by {request.document.uploadedBy.username}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {request.requestedBy.username}
                          </p>
                          <p className="text-xs text-gray-500">{request.requestedBy.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Requested {formatDate(request.createdAt)}
                          </p>
                          {request.approvedAt && (
                            <p className="text-xs text-gray-500">
                              Approved {formatDate(request.approvedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Reason:</span> {request.requestReason}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(request.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>

                      {request.status === 'approved' && (
                        <div className="text-sm text-gray-600">
                          Downloads: {request.downloadCount}/{request.maxDownloads}
                        </div>
                      )}

                      {request.approvedBy && (
                        <div className="text-sm text-gray-600">
                          Approved by: {request.approvedBy.username}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-6">
                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => openActionModal(request, 'approve')}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </button>
                        <button
                          onClick={() => openActionModal(request, 'reject')}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </button>
                      </>
                    )}

                    {request.status === 'approved' && (
                      <div className="text-sm text-gray-600 text-center">
                        <div className="font-medium text-green-600">Approved</div>
                        <div>Downloads: {request.downloadCount}/{request.maxDownloads}</div>
                      </div>
                    )}

                    {request.status === 'rejected' && (
                      <div className="text-sm text-gray-600 text-center">
                        <div className="font-medium text-red-600">Rejected</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Modal */}
        {showActionModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {actionType === 'approve' ? 'Approve Download Request' : 'Reject Download Request'}
                </h3>
                <button
                  onClick={() => setShowActionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Document:</span> {selectedRequest.document.title}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Requested by:</span> {selectedRequest.requestedBy.username}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Reason:</span> {selectedRequest.requestReason}
                  </p>
                </div>

                {actionType === 'approve' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Downloads Allowed
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={actionData.maxDownloads}
                      onChange={(e) => setActionData(prev => ({ 
                        ...prev, 
                        maxDownloads: parseInt(e.target.value) || 1 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      The user will be able to download this document up to {actionData.maxDownloads} time(s).
                    </p>
                  </div>
                )}

                {actionType === 'reject' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rejection Reason
                    </label>
                    <textarea
                      value={actionData.rejectionReason}
                      onChange={(e) => setActionData(prev => ({ 
                        ...prev, 
                        rejectionReason: e.target.value 
                      }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Please provide a reason for rejection..."
                    />
                  </div>
                )}
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowActionModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestAction}
                  className={`flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    actionType === 'approve'
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  }`}
                >
                  {actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDownloadRequests;
