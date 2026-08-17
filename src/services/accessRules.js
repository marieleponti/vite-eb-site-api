export function canViewResource(user, resource) {

  if (resource.status === 'publish') {
    return true
  }

  if (resource.status === 'private') {
    return user?.roles?.includes('ebteam') || user?.roles?.includes('administrator')
  }

  return false
}