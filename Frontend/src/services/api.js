import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  // withCredentials: true, // Remove or comment out if not using cookies
});

// Add JWT token from localStorage to Authorization header for every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  verifyEmail: (token) => api.get(`/auth/verify-email?token=${token}`),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  applicationStatus: (email) => api.get(`/auth/application-status?email=${email}`),
  getMe: () => api.get('/auth/me'),
};

// Applications API
export const applicationAPI = {
  submitApplication: (applicationData) => api.post('/applications', applicationData),
  getAllApplications: () => api.get('/applications'),
  approveApplication: (id) => api.patch(`/applications/${id}/approve`),
  rejectApplication: (id) => api.patch(`/applications/${id}/reject`),
};

// Documents API
export const documentAPI = {
  uploadDocument: (documentData) => api.post('/documents', documentData),
  getDocuments: (filters = {}) => api.get('/documents', { params: filters }),
  getMyDocuments: () => api.get('/documents/my'),
  getDocument: (id) => api.get(`/documents/${id}`),
  updateDocument: (id, data) => api.patch(`/documents/${id}`, data),
  deleteDocument: (id) => api.delete(`/documents/${id}`),
};

// Admin API
export const adminAPI = {
  getBranches: () => api.get('/admin/branches'),
  createBranch: (branchData) => api.post('/admin/branches', branchData),
  // Use query param for branchId
  getSemesters: (branchId) => api.get(`/admin/semesters`, { params: { branchId } }),
  createSemester: (branchId, semesterData) => api.post(`/admin/branches/${branchId}/semesters`, semesterData),
  // Use query params for branchId and semesterId
  getSubjects: (branchId, semesterId) => api.get(`/admin/subjects`, { params: { branchId, semesterId } }),
  createSubject: (branchId, semesterId, subjectData) => api.post(`/admin/branches/${branchId}/semesters/${semesterId}/subjects`, subjectData),
  getAllUsers: () => api.get('/admin/users'),
  approveUser: (userId) => api.patch(`/admin/users/${userId}/approve`),
  rejectUser: (userId) => api.patch(`/admin/users/${userId}/reject`),
  getAllUploads: (filters = {}) => api.get('/admin/uploads', { params: filters }),
  approveUpload: (id) => api.patch(`/documents/${id}/approve`),
  rejectUpload: (id) => api.patch(`/documents/${id}/reject`),
};

// Public API
export const publicAPI = {
  getPublicDocuments: (filters = {}) => api.get('/public/documents', { params: filters }),
  getBranches: () => api.get('/public/branches'),
  getSemesters: (branchId) => api.get(`/public/branches/${branchId}/semesters`),
  getSubjects: (branchId, semesterId) => api.get(`/public/branches/${branchId}/semesters/${semesterId}/subjects`),
};

export default api; 