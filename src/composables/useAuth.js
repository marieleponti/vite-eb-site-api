import { ref } from 'vue'
import { login as loginRequest } from '@/api/services/authService'
import { netlifyFetch } from '@/api/clients/netlifyClient' 

// Store global persistente
const token = ref(localStorage.getItem('jwt') || null)
const user = ref(null)
// Cargamos los roles guardados inmediatamente para que no se pierdan al navegar
const roles = ref(JSON.parse(localStorage.getItem('user_roles')) || []) 

export function useAuth() {

    async function login(username, password) {
        const data = await loginRequest(username, password)
        console.log('LOGIN RESPONSE:', data)

        token.value = data.token
        localStorage.setItem('jwt', data.token)

        // Si tu endpoint de login ya incluye los roles, los guardamos de una vez
        // Si viene en otro formato (ej: data.user_roles), cambia 'data.roles' por la propiedad correcta
        roles.value = data.roles || ['administrator'] 
        localStorage.setItem('user_roles', JSON.stringify(roles.value))

        user.value = {
            name: data.user_display_name,
            email: data.user_email,
        }

        return data
    }

    async function checkCurrentUser() {
        if (!token.value) {
            roles.value = []
            return null
        }
        
        try {
            // Intentamos validar el token con WordPress
            const data = await netlifyFetch('/wp-json/wp/v2/users/me')
            
            // Si la respuesta es correcta y trae roles, actualizamos el estado
            if (data && data.roles) {
                roles.value = data.roles
                localStorage.setItem('user_roles', JSON.stringify(data.roles))
            } else if (data && data.code && data.code.includes('jwt_auth')) {
                // Solo si WordPress dice explícitamente que el JWT venció, deslogueamos
                logout()
            }
            return data
        } catch (e) {
            // Si falla la conexión o el endpoint da error temporal, NO te sacamos. 
            // Mantenemos los roles que ya estaban en el localStorage para no interrumpir tu navegación.
            console.warn('No se pudo verificar el token en tiempo real, manteniendo sesión local:', e)
            return null
        }
    }

    function logout() {
        token.value = null
        user.value = null
        roles.value = []
        localStorage.removeItem('jwt')
        localStorage.removeItem('user_roles')
    }

    return {
        token,
        user,
        roles,
        login,
        logout,
        checkCurrentUser
    }
}