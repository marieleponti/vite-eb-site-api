export function normalizeResourcesResponse(response) {
  const rawItems =
    response?.items ??
    response ??
    []

  return {
    items: Array.isArray(rawItems)
      ? rawItems.map(normalizeResource)
      : [],

    total: response?.total ?? rawItems.length ?? 0,

    totalPages: response?.total_pages ?? 1
  }
}