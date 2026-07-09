<script setup>
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'

</script>

<template>
  <div class="website-container">
    <Navbar />

    <div class="dashed-line-decoration"></div>

    <main class="page-content">
      <router-view />
    </main>

     <Footer />

  </div>
</template>

<style scoped>
/* min-height asegura que el layout siempre ocupe al menos toda la
   pantalla, y flex-direction: column apila navbar / contenido / footer
   verticalmente. La clave es .page-content con flex: 1 más abajo: eso
   hace que el contenido "crezca" para llenar el espacio sobrante,
   empujando el footer hasta el fondo real de la pantalla en vez de
   dejarlo pegado justo después de un contenido corto (que es lo que
   generaba el hueco en blanco debajo del footer en páginas como
   Public Records Requests tras simplificarla).
*/
.website-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-content {
  flex: 1 0 auto;
}
</style>