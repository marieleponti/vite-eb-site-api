import { ref } from 'vue'
import { login as loginRequest } from '@/api/services/authService'
import { netlifyFetch } from '@/api/clients/netlifyClient'

// =======================
// GLOBAL STATE (shared)
// =======================
export const token = ref(localStorage.getItem('jwt') || null)
export const roles = ref(JSON.parse(localStorage.getItem('user_roles') || '[]'))
export const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

export function useAuth() {

  // =======================
  // LOGIN
  // =======================
  async function login(username, password) {

    const data = await loginRequest(username, password)

    // Validación estricta del token
    if (!data || !data.token) {
      throw new Error('Login failed: invalid response (no token)')
    }

    // Guardar token
    token.value = data.token
    localStorage.setItem('jwt', data.token)

    // Roles seguros (NO fallback, NO defaults)
    if (Array.isArray(data.roles)) {
      roles.value = data.roles
    } else {
      roles.value = []
    }

    localStorage.setItem('user_roles', JSON.stringify(roles.value))

    // Usuario seguro
    user.value = {
      name: data.user_display_name || null,
      email: data.user_email || null,
    }

    localStorage.setItem('user', JSON.stringify(user.value))

    return data
  }

  // =======================
  // CHECK CURRENT USER
  // =======================
  async function checkCurrentUser() {

  if (!token.value) return null

  try {
    const data = await netlifyFetch('/me')

    if (data && Array.isArray(data.roles)) {
      roles.value = data.roles
      localStorage.setItem('user_roles', JSON.stringify(data.roles))
    }

    return data

  } catch (error) {
    // Si el token es inválido/expirado, cerramos sesión de verdad
    if (error.status === 401 || error.status === 403) {
      logout()
      return null
    }

    // Error de red u otro problema temporal: no rompemos la sesión,
    // pero tampoco logueamos detalles sensibles
    if (import.meta.env.DEV) {
      console.warn('Auth check failed (network or server issue):', error)
    }

    return null
  }
}

  // =======================
  // LOGOUT
  // =======================
  function logout() {
    token.value = null
    roles.value = []
    user.value = null

    localStorage.removeItem('jwt')
    localStorage.removeItem('user_roles')
    localStorage.removeItem('user')
  }

  // =======================
  // HELPERS (seguridad UI)
  // =======================
  function isAuthenticated() {
    return !!token.value
  }

  function hasRole(role) {
    return Array.isArray(roles.value) && roles.value.includes(role)
  }

  return {
    token,
    roles,
    user,

    login,
    logout,
    checkCurrentUser,

    isAuthenticated,
    hasRole
  }
}