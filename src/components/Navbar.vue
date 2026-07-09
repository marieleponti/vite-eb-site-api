<template>
  <header class="header">
    <div class="header-top-line"></div>
    <div class="header-content">

      <!-- Logo -->
      <div class="header-col header-col--logo">
        <div class="logo">
          <img src="/logo.png" alt="Logo" class="logo-img" />
        </div>
      </div>

      <!-- Desktop nav -->
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

          <a class="nav-link nav-link--lang" href="#" @click.prevent="toggleLocale">
            {{ $t('nav.languageSwitch') }}
          </a>

          <a v-if="isLoggedIn" class="nav-link" href="#" @click.prevent="handleLogout">
            {{ $t('nav.logout') }}
          </a>

          <!-- Search icon inline -->
          <button class="icon-btn" @click="toggleSearch" :aria-label="searchOpen ? 'Close search' : 'Open search'">
            <svg v-if="!searchOpen" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </nav>
      </div>

      <!-- Right col: hamburger (mobile only) -->
      <div class="header-col header-col--btn">
        <button class="icon-btn hamburger" @click="toggleMobile" aria-label="Toggle menu">
          <svg v-if="!mobileOpen" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Search bar -->
    <div v-if="searchOpen" class="search-bar">
      <form @submit.prevent="submitSearch" class="search-form">
        <input
          ref="searchInput"
          v-model="searchQuery"
          class="search-input"
          type="search"
          :placeholder="$t('search.placeholder')"
          autocomplete="off"
        />
        <button type="submit" class="search-submit">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>
      </form>
    </div>

    <!-- Mobile menu -->
    <nav v-if="mobileOpen && !isDesktop" class="mobile-nav" @click="mobileOpen = false">
      <router-link class="mobile-link" to="/">{{ $t('nav.home') }}</router-link>
      <div class="mobile-link mobile-group-label">{{ $t('nav.repository') }}</div>
      <router-link class="mobile-link mobile-sub" to="/resources">{{ $t('nav.library') }}</router-link>
      <router-link class="mobile-link mobile-sub" to="/featured-research">{{ $t('nav.featuredResearch') }}</router-link>
      <router-link class="mobile-link mobile-sub" to="/public-records-requests">{{ $t('nav.publicRecordsRequests') }}</router-link>
      <router-link class="mobile-link" to="/blog">{{ $t('nav.blog') }}</router-link>
      <router-link class="mobile-link" to="/about">{{ $t('nav.about') }}</router-link>
      <a class="mobile-link mobile-link--lang" href="#" @click.prevent="toggleLocale">{{ $t('nav.languageSwitch') }}</a>
      <a v-if="isLoggedIn" class="mobile-link" href="#" @click.prevent="handleLogout">{{ $t('nav.logout') }}</a>
    </nav>
  </header>

  <!-- Dashed wave decoration -->
  <div class="dashed-path-wrap">
    <div class="dashed-path-line" role="presentation"></div>
  </div>
</template>

<script setup>
import { computed, ref, nextTick, onMounted, onUnmounted } from 'vue'
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

/* -------------------------------------------------------------------- */
/* Search                                                                */
/* -------------------------------------------------------------------- */
const searchOpen = ref(false)
const searchQuery = ref('')
const searchInput = ref(null)

async function toggleSearch() {
  searchOpen.value = !searchOpen.value
  if (searchOpen.value) {
    await nextTick()
    searchInput.value?.focus()
  } else {
    searchQuery.value = ''
  }
}

function submitSearch() {
  const q = searchQuery.value.trim()
  if (!q) return
  searchOpen.value = false
  searchQuery.value = ''
  router.push({ path: '/search', query: { q } })
}

/* -------------------------------------------------------------------- */
/* Mobile hamburger                                                      */
/* -------------------------------------------------------------------- */
const mobileOpen = ref(false)
const isDesktop = ref(window.innerWidth >= 768)

function toggleMobile() {
  mobileOpen.value = !mobileOpen.value
}

function onResize() {
  isDesktop.value = window.innerWidth >= 768
  if (isDesktop.value) mobileOpen.value = false
}

onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))
</script>

<style scoped>
.header {
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

.header-col { display: flex; align-items: center; }
.header-col--logo { flex: 0 0 20%; max-width: 20%; justify-content: flex-start; }
.header-col--nav  { flex: 0 0 60%; max-width: 60%; justify-content: flex-start; }
.header-col--btn  { flex: 0 0 20%; max-width: 20%; justify-content: flex-end; }

.logo-img { width: 100%; max-width: 240px; height: auto; display: block; }

.navigation {
  display: flex;
  gap: 26px;
  align-items: center;
  margin-top: 18px;
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

.nav-link:hover { opacity: 0.7; }
.router-link-active { border-bottom: 2px solid #f5c670; }
.repo-trigger { cursor: pointer; }
.chevron-icon { color: #f5c670 !important; }
.nav-link--lang { font-size: 15px; opacity: 0.9; }

/* -------------------------------------------------------------------- */
/* Icon buttons                                                          */
/* -------------------------------------------------------------------- */
.icon-btn {
  background: none;
  border: none;
  color: #f5c670;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s ease;
}

.icon-btn:hover { opacity: 0.7; }
.hamburger { display: none; }

/* -------------------------------------------------------------------- */
/* Search bar                                                            */
/* -------------------------------------------------------------------- */
.search-bar {
  width: 80%;
  margin: 12px auto 0;
  padding: 0 0 12px;
  border-bottom: 1px solid rgba(245, 198, 112, 0.3);
}

.search-form {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(245, 198, 112, 0.4);
  border-radius: 4px;
  padding: 8px 14px;
}

.search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: #f5c670;
  font-family: 'Montserrat', Helvetica, Arial, sans-serif;
  font-size: 15px;
  font-weight: 500;
}

.search-input::placeholder { color: rgba(245, 198, 112, 0.5); }

.search-submit {
  background: none;
  border: none;
  color: #f5c670;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.search-submit:hover { opacity: 1; }

/* -------------------------------------------------------------------- */
/* Dropdown                                                              */
/* -------------------------------------------------------------------- */
.clean-dropdown {
  background-color: #2b3f47 !important;
  border-radius: 0 !important;
  border-top: 3px solid #f5c670;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1) !important;
  padding: 20px 0 !important;
  width: 240px;
  min-width: 240px;
}

.v-list-item--active { color: #f5c670 !important; }

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

.clean-dropdown .v-list-item:hover {
  color: #f38a4e !important;
  background-color: transparent;
}

/* -------------------------------------------------------------------- */
/* Mobile menu                                                           */
/* -------------------------------------------------------------------- */
.mobile-nav {
  display: flex;
  flex-direction: column;
  background-color: #2b3f47;
  border-top: 1px solid rgba(245, 198, 112, 0.2);
  padding: 16px 0;
}

.mobile-link {
  color: #f5c670;
  text-decoration: none;
  font-family: 'Montserrat', Helvetica, Arial, sans-serif;
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 12px 10%;
  border-bottom: 1px solid rgba(245, 198, 112, 0.08);
  transition: opacity 0.2s ease;
}

.mobile-link:hover { opacity: 0.7; }
.mobile-group-label { opacity: 0.6; font-size: 13px; padding-bottom: 6px; cursor: default; }
.mobile-sub { font-size: 14px; font-weight: 600; padding-left: 14%; text-transform: none; letter-spacing: 0.5px; }
.mobile-link--lang { font-size: 14px; opacity: 0.9; }

/* -------------------------------------------------------------------- */
/* Dashed path                                                           */
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

/* -------------------------------------------------------------------- */
/* Responsive                                                            */
/* -------------------------------------------------------------------- */
@media (max-width: 768px) {
  .hamburger { display: flex; }
  .header-col--nav { display: none; }
  .header-col--logo { flex: 1; max-width: none; }
  .header-col--btn { flex: 0 0 auto; max-width: none; }
  .header-content { width: 90%; }
  .search-bar { width: 90%; }
}
</style>