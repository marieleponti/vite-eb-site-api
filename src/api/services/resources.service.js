import { netlifyFetch } from '../clients/netlifyClient'

export function fetchResources(query = '') {
  return netlifyFetch('/resources', query)
}

export function fetchResourceFilters() {
  return netlifyFetch('/filters')
}