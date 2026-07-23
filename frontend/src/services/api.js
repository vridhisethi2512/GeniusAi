import axios from 'axios';

// Create Axios instance with base URL pointing to the backend API v1
const api = axios.create({
    baseURL: 'http://localhost:5000/api/v1',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true // necessary for handling secure HTTP-only cookies
});

// Request Interceptor: Attach access token from local storage if cookies aren't used
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

// Response Interceptor: Handle token expiration and automatic token refreshing
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // If unauthorized and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // Try to get a new access token via refresh token endpoint
                const res = await axios.post('http://localhost:5000/api/v1/auth/refresh', {}, { withCredentials: true });
                const { accessToken } = res.data.data;
                
                if (accessToken) {
                    localStorage.setItem('accessToken', accessToken);
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh token is expired or invalid, log out the user
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;
