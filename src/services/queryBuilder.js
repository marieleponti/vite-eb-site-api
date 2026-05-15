export function buildResourceQuery(filters = {}, page, perPage) {

  const params = new URLSearchParams()

  params.append('page', page)
  params.append('per_page', perPage)

  if (filters.s) {
    params.append('search', filters.s)
  }

  const taxonomies = ['topic', 'source', 'format', 'country', 'language']

  taxonomies.forEach(tax => {
    if (filters[tax]?.length) {
      params.append(tax, filters[tax].join(','))
    }
  })

  return params.toString()
}