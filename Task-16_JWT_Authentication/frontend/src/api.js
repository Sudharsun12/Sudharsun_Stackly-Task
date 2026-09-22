import axios from 'axios'

// ─── Axios instance ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: 'http://127.0.0.1:5001'
})

// ─── Request interceptor — attach access token to every request ────────────────
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// ─── Response interceptor — auto-refresh on 401 ────────────────────────────────
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // If 401 and we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')

        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        // Use plain axios (not api) to avoid interceptor loop
        const res = await axios.post(
          'http://127.0.0.1:5001/api/refresh',
          {},
          {
            headers: { Authorization: `Bearer ${refreshToken}` }
          }
        )

        const newAccessToken = res.data.access_token
        localStorage.setItem('access_token', newAccessToken)

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api(originalRequest)

      } catch (refreshError) {
        // Refresh failed — clear everything and redirect to login
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
