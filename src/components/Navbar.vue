<template>
  <header class="header">
    <div class="header-content">
      <div class="logo">
        <img src="/logo.png" alt="Logo" style="width: 280px; height: auto;" />
      </div>

      <nav class="navigation">
        <router-link class="nav-link" to="/">HOME</router-link>

        <v-menu open-on-hover transition="slide-y-transition" offset="20">
          <template #activator="{ props }">
            <span class="nav-link d-inline-flex align-center repo-trigger" v-bind="props">
              REPOSITORY
              <v-icon size="small" class="chevron-icon">mdi-chevron-down</v-icon>
            </span>
          </template>

          <v-list class="clean-dropdown pa-0">

            <v-list-item to="/resources" link>
              <v-list-item-title>Library</v-list-item-title>
            </v-list-item>

            <v-list-item to="/featured-research" link>
              <v-list-item-title>Featured Research</v-list-item-title>
            </v-list-item>

            <v-list-item to="/public-records-requests" link>
              <v-list-item-title>Public Records Requests</v-list-item-title>
            </v-list-item>

          </v-list>
        </v-menu>

        <router-link class="nav-link" to="/blog">BLOG</router-link>
        <router-link class="nav-link" to="/about">ABOUT</router-link>

        <router-link v-if="!isLoggedIn" class="nav-link" to="/ebcommunity">
          LOGIN
        </router-link>

        <a v-else class="nav-link" href="#" @click.prevent="handleLogout">
          LOGOUT
        </a>
      </nav>

      <button class="submit-btn">Submit Resource</button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { token, logout } = useAuth()

const isLoggedIn = computed(() => !!token.value)

function handleLogout() {
  logout()
  router.push('/')
}
</script>

<style scoped>
.header {
  background-color: #2B3B47;
  padding: 20px 40px;
  border-top: 2px solid #F4D06F;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.navigation {
  display: flex;
  gap: 20px;
  align-items: center;
}

.nav-link {
  color: #F4D06F;
  text-decoration: none;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 2px solid transparent;
}

.nav-link:hover,
.router-link-active {
  border-bottom: 2px solid #F4D06F;
}

.clean-dropdown {
  background-color: #2B3B47 !important;
  border-radius: 0 !important;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25) !important;
  padding: 8px 0 !important;
}

/* FIX 2: Vuetify 3 active item styling */
.v-list-item--active {
  color: #F4D06F !important;
}

.submit-btn {
  background-color: #F4D06F;
  color: #2B3B47;
  border: none;
  padding: 10px 20px;
  font-weight: bold;
  cursor: pointer;
}

.repo-trigger {
  cursor: pointer;
}

.chevron-icon {
  color: #F4D06F !important;
}

.clean-dropdown {
  background-color: #2B3B47 !important;
  border-radius: 6px !important;
  padding: 6px 0 !important;
  min-width: 240px;
}

.clean-dropdown .v-list-item {
  color: #F4D06F !important;
  font-size: 15px;
  font-weight: 500;
  padding: 10px 16px;
  transition: background 0.2s ease;
}

.clean-dropdown .v-list-item:hover {
  background-color: rgba(244, 208, 111, 0.08);
}
</style>