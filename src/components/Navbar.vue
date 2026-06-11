<template>
  <header class="header">
    <div class="header-content">
      <div class="logo">
        <img src="/logo.png" alt="Logo" style="width: 280px; height: auto;" />
      </div>

      <nav class="navigation">
        <router-link class="nav-link" to="/">HOME</router-link>
        
        <!-- Dropdown REPOSITORY integrado limpiamente -->
        <v-menu open-on-hover transition="slide-y-transition" offset="20">
          <template #activator="{ props }">
            <router-link class="nav-link d-inline-flex align-center" v-bind="props">
              REPOSITORY
              <v-icon size="small" class="chevron-icon">mdi-chevron-down</v-icon>
            </router-link>
          </template>

          <!-- Contenedor del menú invisible, adaptado al fondo del navbar -->
          <v-list class="clean-dropdown pa-0">
            <v-list-item to="/resources" class="dropdown-item">
              <span class="dropdown-link-text">Library</span>
            </v-list-item>
            <v-list-item to="/featured-research" class="dropdown-item">
              <span class="dropdown-link-text">Featured Research</span>
            </v-list-item>
            <v-list-item to="/prr" class="dropdown-item">
              <span class="dropdown-link-text">Public Records Requests</span>
            </v-list-item>
          </v-list>
        </v-menu>

        <router-link class="nav-link" to="/blog">BLOG</router-link>
        <router-link class="nav-link" to="/about">ABOUT</router-link>
        <router-link v-if="!isLoggedIn" class="nav-link" to="/ebcommunity">
          LOGIN
        </router-link>

        <a v-else href="#" class="nav-link" @click.prevent="handleLogout">
          LOGOUT
        </a>
      </nav>

      <button class="submit-btn">Submit Resource</button>
    </div>
  </header>

  <div class="dashed-line-decoration"></div>
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
/* ==========================================
   ESTILOS BASE DEL HEADER
   ========================================== */
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

.logo {
  display: flex;
  align-items: center;
}

.navigation {
  display: flex;
  gap: 20px;
  align-items: center;
}

/* Enlaces principales del Navbar */
.nav-link {
  color: #F4D06F;
  text-decoration: none;
  font-size: 18px;
  font-weight: bold;
  transition: border-bottom 0.2s ease;
  border-bottom: 2px solid transparent;
}

.nav-link:hover,
.router-link-active {
  border-bottom: 2px solid #F4D06F;
}

/* ==========================================
   ESTILOS EXACTOS PARA EL DROPDOWN UNIFICADO
   ========================================== */
.clean-dropdown {
  background-color: #2B3B47 !important; /* Copia fiel del fondo del header */
  border-radius: 0 !important;           /* Quitamos bordes redondeados */
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25) !important; /* Sombra sutil flotante */
  padding: 8px 0 !important;
}

.dropdown-item {
  padding: 10px 24px !important;
  min-height: auto !important;
  cursor: pointer;
  text-align: center;
}

/* Eliminamos el fondo gris por defecto de Vuetify en el hover */
.dropdown-item:deep(.v-list-item__overlay) {
  display: none !important;
}

/* Texto del menú secundario: idéntico formato que el Navbar */
.dropdown-link-text {
  color: #F4D06F;
  font-size: 18px;
  text-transform: uppercase; /* Forzamos mayúsculas igual que el navbar */
  text-decoration: none;
  transition: border-bottom 0.2s ease;
  border-bottom: 2px solid transparent;
  padding-bottom: 2px;
}

/* Mismo efecto de subrayado amarillo al pasar el ratón */
.dropdown-item:hover .dropdown-link-text,
.dropdown-item.v-list-item--active .dropdown-link-text {
  border-bottom: 2px solid #F4D06F;
}

/* ==========================================
   ELEMENTOS DE DECORACIÓN Y BOTONES
   ========================================== */
.submit-btn {
  background-color: #F4D06F;
  color: #2B3B47;
  border: none;
  padding: 10px 20px;
  font-weight: bold;
  cursor: pointer;
}

.dashed-line-decoration {
  height: 2px;
  background-image:
    linear-gradient(45deg, #F4D06F 25%, transparent 25%),
    linear-gradient(-45deg, #F4D06F 25%, transparent 25%);
  background-size: 20px 20px;
}

/* Clases de utilidad */
.d-inline-flex {
  display: inline-flex !important;
}

.align-center {
  align-items: center !important;
}

.ml-1 {
  margin-left: 4px !important;
}

.chevron-icon {
  color: #F4D06F !important;
}

.pa-0 {
  padding: 0 !important;
}
</style>