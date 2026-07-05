import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const donorAPI = {
  searchDonors: (params) => api.get('/donors/search', { params }),
  getDashboard: () => api.get('/donors/dashboard'),
  updateAvailability: (data) => api.put('/donors/availability', data),
  getHistory: () => api.get('/donors/history'),
};

export const requestAPI = {
  createRequest: (data) => api.post('/requests', data),
  getRequests: (params) => api.get('/requests', { params }),
  getMyRequests: () => api.get('/requests/my-requests'),
  respondToRequest: (data) => api.post('/requests/respond', data),
  getTrackingData: (requestId) => api.get(`/requests/tracking/${requestId}`),
  updateStatus: (requestId, data) => api.put(`/requests/${requestId}/status`, data),
};

export const hospitalAPI = {
  getAllHospitals: (params) => api.get('/hospitals', { params }),
  getDashboard: () => api.get('/hospitals/dashboard'),
  getRequests: () => api.get('/hospitals/requests'),
};

export const bloodBankAPI = {
  getAllBloodBanks: (params) => api.get('/blood-banks', { params }),
  getInventory: () => api.get('/blood-banks/inventory'),
  updateInventory: (data) => api.put('/blood-banks/inventory', data),
  getDashboard: () => api.get('/blood-banks/dashboard'),
};

export const doctorAPI = {
  getAllDoctors: (params) => api.get('/doctors', { params }),
  getProfile: () => api.get('/doctors/profile'),
  updateSchedule: (data) => api.put('/doctors/schedule', data),
  getDashboard: () => api.get('/doctors/dashboard'),
};

export const appointmentAPI = {
  bookAppointment: (data) => api.post('/appointments', data),
  respondToAppointment: (data) => api.post('/appointments/respond', data),
  cancelAppointment: (appointmentId) => api.delete(`/appointments/${appointmentId}`),
  getMyAppointments: () => api.get('/appointments/my-appointments'),
  getDoctorAppointments: () => api.get('/appointments/doctor-appointments'),
};

export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export const articleAPI = {
  getAllArticles: (params) => api.get('/articles', { params }),
  getArticle: (articleId) => api.get(`/articles/${articleId}`),
  createArticle: (data) => api.post('/articles', data),
  updateArticle: (articleId, data) => api.put(`/articles/${articleId}`, data),
  deleteArticle: (articleId) => api.delete(`/articles/${articleId}`),
};

export const adminAPI = {
  getAllUsers: (params) => api.get('/admin/users', { params }),
  verifyUser: (userId) => api.put(`/admin/users/${userId}/verify`),
  blockUser: (userId, data) => api.put(`/admin/users/${userId}/block`, data),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getAllRequests: (params) => api.get('/admin/requests', { params }),
  getSystemLogs: () => api.get('/admin/logs'),
  getAnalytics: () => api.get('/admin/analytics'),
};

export const aiAPI = {
  matchDonors: (requestId) => api.post(`/ai/match/${requestId}`),
  getRecommendations: (requestId) => api.get(`/ai/recommendations/${requestId}`),
};

export const chatbotAPI = {
  sendMessage: (data) => api.post('/chatbot', data),
};

export default api;
