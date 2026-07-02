<template>
  <footer class="footer">
    <div class="footer-inner">

      <div class="footer-top">
        <div class="footer-logo">
          <img src="/logo.png" alt="Everywhere Border" class="footer-logo-img" />
        </div>
        <nav class="footer-nav">
          <router-link to="/">Home</router-link>
          <router-link to="/resources">Library</router-link>
          <router-link to="/featured-research">Featured Research</router-link>
          <router-link to="/public-records-requests">Public Records Requests</router-link>
          <router-link to="/blog">Blog</router-link>
          <router-link to="/about">About</router-link>
        </nav>
      </div>

      <div class="footer-bottom">
        <p class="footer-copy">
          © {{ year }} Everywhere Border. All rights reserved.
        </p>
      </div>

    </div>

    <!-- Decorative patterns -->
    <div class="halftone-pattern" aria-hidden="true"></div>
    <div class="vertical-bars" aria-hidden="true"></div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear()
</script>

<style scoped>
.footer {
  background-color: #2b3f47;
  position: relative;
  overflow: hidden;
  padding: 60px 0 40px;
  border-top: 1px solid rgba(245, 198, 112, 0.3);
}

.footer-inner {
  position: relative;
  z-index: 2;
  width: 80%;
  margin: 0 auto;
  max-width: 1400px;
}

/* -------------------------------------------------------------------- */
/* Top row: logo + nav                                                   */
/* -------------------------------------------------------------------- */
.footer-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 40px;
  flex-wrap: wrap;
  margin-bottom: 48px;
}

.footer-logo-img {
  width: 200px;
  height: auto;
  display: block;
}

.footer-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 28px;
  justify-content: flex-end;
  max-width: 600px;
}

.footer-nav a {
  color: #f5c670;
  text-decoration: none;
  font-family: 'Montserrat', Helvetica, Arial, sans-serif;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  opacity: 0.85;
  transition: opacity 0.2s ease;
}

.footer-nav a:hover {
  opacity: 1;
}

/* -------------------------------------------------------------------- */
/* Bottom row: copyright + submit link                                   */
/* -------------------------------------------------------------------- */
.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid rgba(245, 198, 112, 0.2);
}

.footer-copy {
  color: rgba(245, 198, 112, 0.6);
  font-family: 'Work Sans', Helvetica, Arial, sans-serif;
  font-size: 13px;
  font-weight: 300;
  margin: 0;
}

.footer-submit {
  color: #f5c670;
  text-decoration: none;
  font-family: 'Montserrat', Helvetica, Arial, sans-serif;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  border: 1px solid #f5c670;
  padding: 8px 20px;
  border-radius: 3px;
  transition: all 0.2s ease;
}

.footer-submit:hover {
  background-color: #f5c670;
  color: #2b3f47;
}

/* -------------------------------------------------------------------- */
/* Decorative patterns (right side, like the legacy site)               */
/* -------------------------------------------------------------------- */
.halftone-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(#f5c670 1px, transparent 1px);
  background-size: 5px 5px;
  opacity: 0.12;
  pointer-events: none;
  z-index: 0;
}

.vertical-bars {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    90deg,
    #f5c670 0px,
    #f5c670 2px,
    transparent 2px,
    transparent 12px
  );
  opacity: 0.2;
  clip-path: polygon(65% 0, 100% 0, 100% 100%, 80% 100%);
  pointer-events: none;
  z-index: 0;
}

/* -------------------------------------------------------------------- */
/* Responsive                                                            */
/* -------------------------------------------------------------------- */
@media (max-width: 768px) {
  .footer-inner {
    width: 90%;
  }

  .footer-top {
    flex-direction: column;
    align-items: flex-start;
  }

  .footer-nav {
    justify-content: flex-start;
    max-width: none;
  }

  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>