import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true,
})

export function getImageUrl(url) {
  if (!url) return 'https://picsum.photos/400/300'
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`
}

export default api
