import { wpClient } from './wpClient'

// GET any 

export function getPosts(type = 'posts', params = '') {
  return wpClient.get(`/${type}?_embed&per_page=100${params}`)
}

// GET one
export function getPost(type, id) {
  return wpClient.get(`/${type}/${id}`)
}