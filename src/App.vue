<script setup>
import Navbar from './components/Navbar.vue'
</script>

<template>
  <div class="website-container">
    <Navbar />

    <div class="dashed-line-decoration"></div>

    <router-view />

    <footer class="footer">
      <div class="pattern-section">
        <div class="halftone-pattern"></div>
        <div class="vertical-bars"></div>
      </div>
    </footer>
  </div>
</template>