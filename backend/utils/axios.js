// backend/src/utils/axios.js
import axios from 'axios'

const instance = axios.create({
  baseURL: 'https://mochi-mevn.onrender.com/api',
  withCredentials: true
})

export default instance