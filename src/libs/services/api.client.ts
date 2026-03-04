import axios from 'axios';

const apiClient = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Attach JWT token to every request
apiClient.interceptors.request.use(
    config => {
        const token = localStorage.getItem('pv_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

// Handle responses and auth errors
apiClient.interceptors.response.use(
    response => response.data,
    error => {
        // Redirect to login on 401/403
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('pv_token');
            localStorage.removeItem('pv_user');
            if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                window.location.href = '/login';
            }
        }
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error.response?.data || error);
    }
);

export default apiClient;
