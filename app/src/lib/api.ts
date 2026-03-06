import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token from localStorage on every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('lms_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Global response error handler
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login') && !error.config?.url?.includes('/auth/me')) {
            localStorage.removeItem('lms_token');
            window.location.href = '/'; // Force redirect to home on session expiry or unauthenticated
        }
        if (error.response?.status === 403) {
            console.error('Permission denied: You do not have access to this resource.');
        }
        return Promise.reject(error);
    }
);

export default api;
