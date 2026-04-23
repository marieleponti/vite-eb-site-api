
<template>
  <div class="website-container">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <div class="logo">
         <img src="/logo.png" alt="Logo" style="width: 280px; height: auto;" />
        </div>
        
        <nav class="navigation">
          <a href="#" class="nav-link">HOME</a>
          <a href="#" class="nav-link">REPOSITORY</a>
          <a href="#" class="nav-link">BLOG</a>
          <a href="#" class="nav-link">ABOUT</a>
          <a href="#" class="nav-link">ENGLISH</a>
        </nav>

        <button class="submit-btn">Submit Resource</button>
      </div>
    </header>

    <!-- Dashed Line Decoration -->
    <div class="dashed-line-decoration"></div>

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <p class="hero-text">
          Welcome to the Everywhere Border info repository. This is a living resource that makes visible the harms of US-driven border externalization, and how tech infrastructures are implemented and used in migration control systems, militarization, and policing in the Americas. Our goal is to support and strengthen transnational collaboration and advocacy to combat the role of technology in migration deterrence as a method of control, consolidation of power, structural violence, and impunity.
        </p>
        <p class="hero-text">
          This info repository supports and reflects collaboration across borders. It contains original research, documentation, and analysis on border externalization policies and practices of multiple countries in the region, and the ever-growing tech and data infrastructure that support them, often made of opaque and inaccessible systems. Resources draw from the work of civil society organizations, academic research, financial investigation, and public records requests. The info repository is a collective work in progress—we welcome contributions from activists, researchers, and civil society organizations.
        </p>
        <button class="join-btn">JOIN THE COMMUNITY</button>
      </div>
      <div class="fence-decoration"></div>
    </section>

    <!-- Content Section -->
    <section class="content-section">
      <h2 class="section-title">Why the Everywhere Border?</h2>
      <p class="section-text">
        The border is not a fixed territorial boundary. It is an all-encompassing system of ideas, policies, practices, and infrastructures that reach deep into the interior of origin and transit countries through externalization processes, with the goal of controlling the movement of the majority of humans, reserving free movement to reach territorial frontiers and cross political boundaries for a select few. The US has been a key actor in advancing this vision and practice, which has a tremendous impact on targeted countries, facilitating and increasing militarization, state violence, and corporate power.
      </p>
    </section>

    <!-- Another Dashed Line -->
    <div class="dashed-line-decoration"></div>

    <!-- Footer with Patterns -->
    <footer class="footer">
      <div class="pattern-section">
        <div class="halftone-pattern"></div>
        <div class="vertical-bars"></div>
      </div>
      
      <div class="footer-content">
        <p class="footer-text">
          The bordering regime of the United States both drives and reflects a global trend. Wealthy nations, development finance institutions, and massive technology firms are feverishly investing in border policing regimes that entrench and reinforce structural violence and inequality. These same powerful interests derive much of their economic wealth and political clout through extractive and repressive practices, historically and in the present day. Despite playing a central role in fueling forced migration—including being responsible for the vast majority of emissions driving the climate crisis—these actors are constructing and expanding barriers to access national territories. By peddling securitization and militarization as solutions to societal inequalities, they disregard human rights, and undermine existing legal regimes.
        </p>
        
        <div class="icon-row">
          <div class="icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="5" y="2" h="14" w="14" rx="2" ry="2"/>
              <line x1="12" y1="18" x2="12" y2="18"/>
            </svg>
          </div>
          <div class="icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 11c0 6.627-8 11-8 11s8-4.373 8-11S4 0 4 0s8 4.373 8 11z"/>
              <circle cx="12" cy="11" r="3"/>
            </svg>
          </div>
          <div class="icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <ellipse cx="12" cy="5" rx="9" ry="3"/>
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
            </svg>
          </div>
          <div class="icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
// Vue 3 Composition API - No additional logic needed for this static page
</script>

<style scoped>
/* Color Variables */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.website-container {
  min-height: 100vh;
  background-color: #2B3B47;
  color: #F5F5F5;
  font-family: 'Arial', sans-serif;
}

/* Header Styles */
.header {
  background-color: #2B3B47;
  padding: 20px 40px;
  border-top: 2px solid #F4D06F;
  border-bottom: 1px solid transparent;
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
  gap: 15px;
}

.logo-svg {
  width: 60px;
  height: 60px;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-text-bold {
  font-family: 'Arial', sans-serif;
  font-weight: bold;
  color: #F4D06F;
  font-size: 14px;
  letter-spacing: 1px;
}

.navigation {
  display: flex;
  gap: 20px;
}

.nav-link {
  color: #F4D06F;
  text-decoration: none;
  font-family: 'Arial', sans-serif;
  font-size: 12px;
  font-weight: bold;
  letter-spacing: 1px;
  transition: border-bottom 0.3s;
}

.nav-link:hover {
  border-bottom: 2px solid #F4D06F;
}

.submit-btn {
  background-color: #F4D06F;
  color: #2B3B47;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 12px;
}

.submit-btn:hover {
  background-color: #F79456;
}

/* Dashed Line Decoration */
.dashed-line-decoration {
  height: 2px;
  background-image: 
    linear-gradient(45deg, #F4D06F 25%, transparent 25%),
    linear-gradient(-45deg, #F4D06F 25%, transparent 25%);
  background-size: 20px 20px;
  background-repeat: repeat-x;
  margin: 0;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #F79456, #FDBB80);
  padding: 60px 40px;
  position: relative;
  min-height: 400px;
  display: flex;
  align-items: center;
}

.hero-content {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.hero-text {
  font-family: 'Arial', sans-serif;
  font-size: 13px;
  line-height: 1.8;
  color: #2B3B47;
  margin-bottom: 20px;
}

.join-btn {
  background-color: #2B3B47;
  color: #FFFFFF;
  border: none;
  padding: 15px 30px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 14px;
  margin-top: 20px;
}

.join-btn:hover {
  background-color: #2B3B47;
  opacity: 0.9;
}

.fence-decoration {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 200px;
  height: 200px;
  background-image: 
    linear-gradient(45deg, #2B3B47 25%, transparent 25%),
    linear-gradient(-45deg, #2B3B47 25%, transparent 25%);
  background-size: 20px 20px;
  opacity: 0.1;
}

/* Content Section */
.content-section {
  padding: 80px 40px;
  max-width: 1400px;
  margin: 0 auto;
}

.section-title {
  font-family: 'Georgia', serif;
  font-size: 32px;
  color: #F4D06F;
  margin-bottom: 30px;
  text-align: center;
}

.section-text {
  font-family: 'Arial', sans-serif;
  font-size: 14px;
  line-height: 1.8;
  color: #F5F5F5;
  text-align: center;
  max-width: 1000px;
  margin: 0 auto;
}

/* Footer */
.footer {
  background-color: #2B3B47;
  padding: 60px 40px;
  position: relative;
  min-height: 600px;
}

.pattern-section {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 300px;
  overflow: hidden;
}

.halftone-pattern {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(#F4D06F 1px, transparent 1px);
  background-size: 4px 4px;
  opacity: 0.2;
}

.vertical-bars {
  position: absolute;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    90deg,
    #F4D06F 0px,
    #F4D06F 2px,
    transparent 2px,
    transparent 10px
  );
  opacity: 0.3;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  padding-top: 300px;
}

.footer-text {
  font-family: 'Arial', sans-serif;
  font-size: 12px;
  line-height: 1.8;
  color: #F5F5F5;
  text-align: center;
  margin-bottom: 40px;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}

.icon-row {
  display: flex;
  justify-content: center;
  gap: 30px;
}

.icon-circle {
  width: 60px;
  height: 60px;
  border: 2px solid #F4D06F;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #F4D06F;
}

.icon-circle svg {
  width: 30px;
  height: 30px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 20px;
  }
  
  .navigation {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .hero-section,
  .content-section,
  .footer {
    padding: 40px 20px;
  }
  
  .pattern-section {
    height: 150px;
  }
  
  .footer-content {
    padding-top: 150px;
  }
}
</style>
