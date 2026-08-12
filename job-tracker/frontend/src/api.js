import axios from 'axios'

// No baseURL — requests go to the same port as Vite.
// Vite proxy forwards /api/* to Flask on :5000.
// This makes cookies work correctly (same origin).
const api = axios.create({
  baseURL: '',
  withCredentials: true,
})

export default api

