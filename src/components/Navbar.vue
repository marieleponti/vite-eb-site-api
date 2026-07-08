<template>
  <header class="header">
    <div class="header-top-line"></div>
    <div class="header-content">
      <div class="header-col header-col--logo">
        <div class="logo">
          <img src="/logo.png" alt="Logo" class="logo-img" />
        </div>
      </div>

      <div class="header-col header-col--nav">
        <nav class="navigation">
          <router-link class="nav-link" to="/">{{ $t('nav.home') }}</router-link>

          <v-menu open-on-hover transition="slide-y-transition" offset="20">
            <template #activator="{ props }">
              <span class="nav-link d-inline-flex align-center repo-trigger" v-bind="props">
                {{ $t('nav.repository') }}
                <v-icon size="small" class="chevron-icon">mdi-chevron-down</v-icon>
              </span>
            </template>

            <v-list class="clean-dropdown pa-0">

              <v-list-item to="/resources" link>
                <v-list-item-title>{{ $t('nav.library') }}</v-list-item-title>
              </v-list-item>

              <v-list-item to="/featured-research" link>
                <v-list-item-title>{{ $t('nav.featuredResearch') }}</v-list-item-title>
              </v-list-item>

              <v-list-item to="/public-records-requests" link>
                <v-list-item-title>{{ $t('nav.publicRecordsRequests') }}</v-list-item-title>
              </v-list-item>

            </v-list>
          </v-menu>

          <router-link class="nav-link" to="/blog">{{ $t('nav.blog') }}</router-link>
          <router-link class="nav-link" to="/about">{{ $t('nav.about') }}</router-link>

          <!-- Selector de idioma: muestra el idioma AL QUE se puede cambiar -->
          <a class="nav-link nav-link--lang" href="#" @click.prevent="toggleLocale">
            {{ $t('nav.languageSwitch') }}
          </a>

          <a v-if="isLoggedIn" class="nav-link" href="#" @click.prevent="handleLogout">
            {{ $t('nav.logout') }}
          </a>
        </nav>
      </div>

      <div class="header-col header-col--btn"></div>
    </div>
  </header>

  <!-- Dashed wave decoration (no walking figure here — legacy only shows it in body sections) -->
  <div class="dashed-path-wrap">
    <div class="dashed-path-line" role="presentation"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { token, logout } = useAuth()
const { locale } = useI18n()

const isLoggedIn = computed(() => !!token.value)

function toggleLocale() {
  locale.value = locale.value === 'en' ? 'es' : 'en'
  localStorage.setItem('locale', locale.value)
}

function handleLogout() {
  logout()
  router.push('/')
}
</script>

<style scoped>
/* Montserrat is loaded globally in index.html — see the <link> snippet
   provided separately. Avoid per-component @import. */

.header {
  /* Legacy uses terrain_yellow.png as the section's own background image
     (repeat-x, position: center bottom 8%), which is what creates the
     dashed line right at the bottom edge of the header. We keep that as
     a separate strip below (.dashed-path-wrap) for simplicity, but the
     background-color and 1px gold accent line match the source exactly. */
  background-color: #2b3f47;
  padding: 72px 0 18px;
  border-top: 1px solid #f5c670;
}

.header-top-line {
  width: 100%;
  margin: 0 0 24px;
  height: 5px;
  border-bottom: 1px solid #f5c670;
}

.header-content {
  display: flex;
  align-items: center;
  width: 80%;
  margin: 0 auto;
  gap: 16px;
  flex-wrap: wrap;
}

.header-col {
  display: flex;
  align-items: center;
}

.header-col--logo {
  flex: 0 0 20%;
  max-width: 20%;
  justify-content: flex-start;
}

.header-col--nav {
  flex: 0 0 60%;
  max-width: 60%;
  justify-content: flex-start;
}

.header-col--btn {
  flex: 0 0 20%;
  max-width: 20%;
  justify-content: flex-end;
}

.logo-img {
  width: 100%;
  max-width: 240px;
  height: auto;
  display: block;
}

.navigation {
  display: flex;
  gap: 26px;
  align-items: center;
  margin-top: 18px; /* legacy: margin-top: 35px on a taller row */
  flex-wrap: wrap;
}

.nav-link {
  color: #f5c670;
  text-decoration: none;
  font-family: 'Montserrat', Helvetica, Arial, sans-serif;
  font-size: 18px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 2px solid transparent;
  padding-bottom: 3px;
  transition: opacity 0.3s ease;
}

/* Legacy hover behavior: dims to opacity .7, no color/underline change.
   The underline is reserved for the current/active page only. */
.nav-link:hover {
  opacity: 0.7;
}

.router-link-active {
  border-bottom: 2px solid #f5c670;
}

.repo-trigger {
  cursor: pointer;
}

.chevron-icon {
  color: #f5c670 !important;
}

.nav-link--lang {
  font-size: 15px;
  opacity: 0.9;
}

.clean-dropdown {
  background-color: #2b3f47 !important;
  border-radius: 0 !important;
  border-top: 3px solid #f5c670;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1) !important;
  padding: 20px 0 !important;
  width: 240px;
  min-width: 240px;
}

/* FIX 2: Vuetify 3 active item styling */
.v-list-item--active {
  color: #f5c670 !important;
}

.clean-dropdown .v-list-item {
  color: #f5c670 !important;
  font-family: 'Montserrat', Helvetica, Arial, sans-serif;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 6px 20px;
  line-height: 1.4em;
  transition: color 0.2s ease;
}

.clean-dropdown .v-list-item-title {
  text-transform: uppercase !important;
  font-family: inherit !important;
  font-size: inherit !important;
  font-weight: inherit !important;
  letter-spacing: inherit !important;
  color: inherit !important;
}

/* Legacy's "current item" highlight color inside the dropdown */
.clean-dropdown .v-list-item:hover {
  color: #f38a4e !important;
  background-color: transparent;
}



/* -------------------------------------------------------------------- */
/* Dashed path decoration                                                */
/* -------------------------------------------------------------------- */
.dashed-path-wrap {
  background-color: #2b3f47;
  line-height: 0;
  position: relative;
  padding-bottom: 24px;
}

.dashed-path-line {
  width: 100%;
  height: 60px;
  background-image: url('/terrain_yellow.png');
  background-repeat: repeat-x;
  background-position: left center;
  background-size: auto 70%;
}
</style>