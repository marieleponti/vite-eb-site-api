<script setup>
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'

</script>

<template>
  <div class="website-container">
    <Navbar />

    <div class="dashed-line-decoration"></div>

    <router-view />

     <Footer />

  </div>
</template>