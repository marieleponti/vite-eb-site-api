<template>
  <header class="header">
    <div class="header-content">
      <div class="logo">
        <img src="/logo.png" alt="Logo" style="width: 280px; height: auto;" />
      </div>
      
      <nav class="navigation">
        <router-link class="nav-link" to="/">HOME</router-link>
        <router-link class="nav-link" to="/resources">REPOSITORY</router-link>
        <router-link class="nav-link" to="/blog">BLOG</router-link>
        <router-link class="nav-link" to="/about">ABOUT</router-link>
      </nav>

      <button class="submit-btn">Submit Resource</button>
    </div>
  </header>

  <!-- 👇 ESTA LÍNEA TAMBIÉN ES PARTE DEL NAVBAR -->
  <div class="dashed-line-decoration"></div>
</template>

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

.logo {
  display: flex;
  align-items: center;
}

.navigation {
  display: flex;
  gap: 20px;
}

.nav-link {
  color: #F4D06F;
  text-decoration: none;
  font-size: 18px;
  font-weight: bold;
}

.nav-link:hover {
  border-bottom: 2px solid #F4D06F;
}

.router-link-active {
  border-bottom: 2px solid #F4D06F;
}

.submit-btn {
  background-color: #F4D06F;
  color: #2B3B47;
  border: none;
  padding: 10px 20px;
  font-weight: bold;
}

.dashed-line-decoration {
  height: 2px;
  background-image: 
    linear-gradient(45deg, #F4D06F 25%, transparent 25%),
    linear-gradient(-45deg, #F4D06F 25%, transparent 25%);
  background-size: 20px 20px;
}

.header {
  border-bottom: none;
}

.header {
  border-bottom: 1px solid transparent;
}
</style>