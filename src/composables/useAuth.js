import {
    ref
} from 'vue'
import {
    login as loginRequest
} from '@/api/services/auth.service'

const token = ref(
    localStorage.getItem('jwt') || null
)

const user = ref(null)

export function useAuth() {

    async function login(username, password) {

        const data = await loginRequest(
            username,
            password
        )

        token.value = data.token

        localStorage.setItem(
            'jwt',
            data.token
        )

        user.value = {
            name: data.user_display_name,
            email: data.user_email,
        }

        return data

    }

    function logout() {

        token.value = null
        user.value = null
        localStorage.removeItem('jwt')

    }

    return {
        token,
        user,

        login,
        logout,
}
}
