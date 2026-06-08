<template>
  <div class="login-page">
    <div class="login-card">
      <h1>Member Login</h1>

      <p class="subtitle">
        Access restricted resources and collaboration spaces.
      </p>

      <form @submit.prevent="handleLogin">
        <input
          v-model="username"
          type="text"
          placeholder="Username"
        />

        <input
          v-model="password"
          type="password"
          placeholder="Password"
        />

        <button type="submit">
          Sign In
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')

const { login } = useAuth()
const router = useRouter()

async function handleLogin() {
  try {
    const data = await login(
      username.value,
      password.value
    )

    if (data?.token) {
      router.push('/resources')
    }

  } catch (err) {
    console.error(err)
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #2f4354;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.login-card {
  width: 100%;
  max-width: 460px;
  background: #35495d;
  padding: 3rem;
  border-top: 5px solid #e4c46a;
}

.login-card h1 {
  color: #e4c46a;
  text-align: center;
  margin-bottom: 1rem;
  font-size: 2.2rem;
}

.subtitle {
  color: #f3f3f3;
  text-align: center;
  margin-bottom: 2rem;
  line-height: 1.6;
}

input {
  width: 100%;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #516476;
  background: #2f4354;
  color: white;
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: #e4c46a;
}

button {
  width: 100%;
  padding: 1rem;
  background: #e4c46a;
  color: #2f4354;
  border: none;
  font-weight: 700;
  cursor: pointer;
  transition: .2s;
}

button:hover {
  opacity: .9;
}
</style>