import axios from 'axios'

const WP_BASE = import.meta.env.VITE_WP_API

export const wpClient = axios.create({
  baseURL: `${WP_BASE}/wp-json/wp/v2`,
})