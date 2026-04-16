import { wpClient } from './wpClient'

// GET cualquier CPT
export function getPosts(type = 'posts') {
  return wpClient.get(`/${type}`)
}

// GET uno
export function getPost(type, id) {
  return wpClient.get(`/${type}/${id}`)
}