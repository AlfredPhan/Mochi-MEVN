import axios from 'axios'

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://mochi-mevn.onrender.com/api',
  withCredentials: true
})

export default instance
