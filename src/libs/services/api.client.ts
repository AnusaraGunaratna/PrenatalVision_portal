import axios from 'axios';

const apiClient = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor for global error handling
apiClient.interceptors.response.use(
    response => response.data,
    error => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error.response?.data || error);
    }
);

export default apiClient;
