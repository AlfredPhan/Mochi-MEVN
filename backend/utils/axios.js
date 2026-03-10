// src/utils/axios.js
import axios from 'axios'

const instance = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // 🔥 Bắt buộc để gửi cookie (token)
})

export default instance
