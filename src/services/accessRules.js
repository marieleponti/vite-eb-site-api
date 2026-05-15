export function canViewResource(user, resource) {

  if (resource.status === 'publish') {
    return true
  }

  if (resource.status === 'private') {
    return user?.role === 'ebteam' || user?.role === 'admin'
  }

  return false
}