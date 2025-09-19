import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post('/api/auth/refresh', {}, {
          withCredentials: true,
        });

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData: {
    username: string;
    email: string;
    phone: string;
    role: string;
    password: string;
    passwordConfirm: string;
  }) => api.post('/auth/register', userData),

  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),

  logout: () => api.post('/auth/logout'),

  refresh: () => api.post('/auth/refresh'),

  getMe: () => api.get('/auth/me'),
};

// Admin API calls
export const adminAPI = {
  getPendingRequests: () => api.get('/admin/requests'),
  getAllUsers: () => api.get('/admin/users'),
  approveUser: (userId: string) => api.post(`/admin/requests/${userId}/approve`),
  rejectUser: (userId: string) => api.post(`/admin/requests/${userId}/reject`),
  updateUserRole: (userId: string, role: string) => api.put(`/admin/users/${userId}/role`, { role }),
  deleteUser: (userId: string) => api.delete(`/admin/users/${userId}`),
  toggleUserApproval: (userId: string) => api.put(`/admin/users/${userId}/toggle-approval`),
};

// User API calls
export const userAPI = {
  getDocuments: () => api.get('/user/docs'),
  updatePersonalization: (data: { username?: string; phone?: string }) =>
    api.put('/user/personalize', data),
};

// Role API calls
export const roleAPI = {
  getActiveRoles: () => api.get('/roles/active'),
  getAllRoles: () => api.get('/roles'),
  getRoleStats: () => api.get('/roles/stats'),
  createRole: (roleData: {
    name: string;
    displayName: string;
    description?: string;
    permissions?: string[];
  }) => api.post('/roles', roleData),
  updateRole: (roleId: string, roleData: {
    displayName?: string;
    description?: string;
    permissions?: string[];
    isActive?: boolean;
  }) => api.put(`/roles/${roleId}`, roleData),
  deleteRole: (roleId: string) => api.delete(`/roles/${roleId}`),
};

export default api;
