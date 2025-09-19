import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI, userAPI } from '../services/api';
import { 
  Users, 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle,
  BarChart3,
  Upload,
  Calendar,
  AlertCircle,
  TrendingUp,
  FileCheck,
  Timer,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  superusers: number;
}

interface Document {
  id: string;
  title: string;
  type: string;
  size: string;
  status: string;
  uploadedAt: string;
  lastAccessed?: string;
}

interface Deadline {
  id: string;
  title: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed' | 'overdue';
}

interface AnalyticsData {
  documentsReceivedToday: number;
  totalDeadlines: number;
  totalDocuments: number;
  pendingTasks: number;
  completedThisWeek: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    documentsReceivedToday: 0,
    totalDeadlines: 0,
    totalDocuments: 0,
    pendingTasks: 0,
    completedThisWeek: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);

  // Mock data for demonstration - replace with actual API calls
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Mock analytics data
        setAnalytics({
          documentsReceivedToday: 5,
          totalDeadlines: 12,
          totalDocuments: 47,
          pendingTasks: 8,
          completedThisWeek: 15
        });

        // Mock deadlines data
        setDeadlines([
          {
            id: '1',
            title: 'Project Proposal Review',
            dueDate: '2024-01-15T10:00:00Z',
            priority: 'high',
            status: 'pending'
          },
          {
            id: '2',
            title: 'Monthly Report Submission',
            dueDate: '2024-01-20T17:00:00Z',
            priority: 'medium',
            status: 'pending'
          },
          {
            id: '3',
            title: 'Contract Renewal',
            dueDate: '2024-01-25T12:00:00Z',
            priority: 'high',
            status: 'pending'
          }
        ]);

        // Mock recent documents
        setRecentDocuments([
          {
            id: '1',
            title: 'Q4 Financial Report.pdf',
            type: 'PDF',
            size: '2.4 MB',
            status: 'processed',
            uploadedAt: '2024-01-10T09:30:00Z',
            lastAccessed: '2024-01-12T14:20:00Z'
          },
          {
            id: '2',
            title: 'Meeting Notes.docx',
            type: 'Word',
            size: '156 KB',
            status: 'processing',
            uploadedAt: '2024-01-11T11:15:00Z',
            lastAccessed: '2024-01-11T11:15:00Z'
          },
          {
            id: '3',
            title: 'Budget Analysis.xlsx',
            type: 'Excel',
            size: '890 KB',
            status: 'processed',
            uploadedAt: '2024-01-09T16:45:00Z',
            lastAccessed: '2024-01-10T10:30:00Z'
          }
        ]);
        
        if (user?.role === 'superuser') {
          // Fetch admin dashboard data
          const [usersResponse, docsResponse] = await Promise.all([
            adminAPI.getAllUsers(),
            userAPI.getDocuments()
          ]);
          
          setStats(usersResponse.data.data.stats);
        } else {
          // Fetch user dashboard data
          await userAPI.getDocuments();
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.role]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    console.log('Files dropped:', files);
    // Handle file upload logic here
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    console.log('Files selected:', files);
    // Handle file upload logic here
  }, []);

  // Utility function to format time remaining
  const getTimeRemaining = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due.getTime() - now.getTime();
    
    if (diff < 0) return 'Overdue';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return 'Due soon';
  };

  // Get current date and time
  const getCurrentDateTime = () => {
    const now = new Date();
    return {
      date: now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentDateTime = getCurrentDateTime();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Bento Grid Layout */}
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Row 1: Welcome Card (Full Width) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your account and the system.
          </p>
        </div>

        {/* Row 2: Analytics Card (Full Width) */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-sm p-8 text-white">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Today's Overview</h2>
              <p className="text-blue-100">{currentDateTime.date}</p>
              <p className="text-blue-200 text-sm">{currentDateTime.time}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-200" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-5 h-5 text-blue-200" />
                <TrendingUp className="w-4 h-4 text-green-300" />
              </div>
              <p className="text-2xl font-bold">{analytics.documentsReceivedToday}</p>
              <p className="text-blue-200 text-sm">Documents Today</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Timer className="w-5 h-5 text-blue-200" />
                <AlertCircle className="w-4 h-4 text-orange-300" />
              </div>
              <p className="text-2xl font-bold">{analytics.totalDeadlines}</p>
              <p className="text-blue-200 text-sm">Total Deadlines</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <FileCheck className="w-5 h-5 text-blue-200" />
                <CheckCircle className="w-4 h-4 text-green-300" />
              </div>
              <p className="text-2xl font-bold">{analytics.totalDocuments}</p>
              <p className="text-blue-200 text-sm">Total Documents</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-blue-200" />
                <XCircle className="w-4 h-4 text-red-300" />
              </div>
              <p className="text-2xl font-bold">{analytics.pendingTasks}</p>
              <p className="text-blue-200 text-sm">Pending Tasks</p>
            </div>
          </div>
        </div>

        {/* Row 3: Document Upload & Deadlines (Split Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left: Document Upload Box */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Upload Documents</h3>
              <Plus className="w-5 h-5 text-gray-400" />
            </div>
            
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                isDragOver 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drop files here or click to browse
              </p>
              <p className="text-gray-500 text-sm mb-4">
                Supports PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
              </p>
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Files
              </label>
            </div>
          </div>

          {/* Right: Deadlines List */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Upcoming Deadlines</h3>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {deadlines.map((deadline) => (
                <div key={deadline.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{deadline.title}</h4>
                    <p className="text-sm text-gray-500">
                      Due: {new Date(deadline.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-2 ${
                      deadline.priority === 'high' 
                        ? 'bg-red-100 text-red-800' 
                        : deadline.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {deadline.priority}
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {getTimeRemaining(deadline.dueDate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 4: Recently Accessed Files (Full Width) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Recently Accessed Files</h3>
            <Link 
              to="/documents" 
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="p-2 bg-blue-100 rounded-lg mr-4">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{doc.title}</h4>
                  <p className="text-sm text-gray-500">{doc.type} • {doc.size}</p>
                  <p className="text-xs text-gray-400">
                    Last accessed: {doc.lastAccessed ? new Date(doc.lastAccessed).toLocaleDateString() : 'Never'}
                  </p>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  doc.status === 'processed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Admin Stats (Only for superusers) */}
        {user?.role === 'superuser' && stats && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">System Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="p-3 bg-blue-100 rounded-xl w-fit mx-auto mb-3">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">Total Users</p>
              </div>
              <div className="text-center">
                <div className="p-3 bg-green-100 rounded-xl w-fit mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                <p className="text-sm text-gray-600">Approved</p>
              </div>
              <div className="text-center">
                <div className="p-3 bg-yellow-100 rounded-xl w-fit mx-auto mb-3">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
              <div className="text-center">
                <div className="p-3 bg-red-100 rounded-xl w-fit mx-auto mb-3">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                <p className="text-sm text-gray-600">Rejected</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
