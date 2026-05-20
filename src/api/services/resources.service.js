import {
  netlifyFetch
} from '../clients/netlifyClient'

export async function fetchResources(query = '') {

  const token =
    localStorage.getItem('jwt')

  return netlifyFetch(
    '/resources',
    query, {
      Authorization: `Bearer ${token}`,
    }
  )
}

export async function fetchResourceFilters() {

  const token =
    localStorage.getItem('jwt')

  return netlifyFetch(
    '/filters',
    '', {
      Authorization: `Bearer ${token}`,
    }
  )
}