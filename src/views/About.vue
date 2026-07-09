<template>
  <div class="about-page">

    <div class="page-wrapper">

      <h1 class="h1">{{ $t('about.pageTitle') }}</h1>

      <h2 class="h2">{{ $t('about.projectHeading') }}</h2>

      <div class="content">
        <p v-html="$t('about.projectIntroHtml')"></p>

        <p>{{ $t('about.projectPara2') }}</p>

        <p>{{ $t('about.projectPara3') }}</p>

        <p>{{ $t('about.projectPara4') }}</p>

        <p>{{ $t('about.projectPara5') }}</p>

        <p>{{ $t('about.projectPara6') }}</p>

        <p>{{ $t('about.projectPara7') }}</p>
      </div>

      <h2 class="h2">{{ $t('about.approachHeading') }}</h2>

      <div class="content">
        <p>{{ $t('about.approachPara1') }}</p>

        <p>{{ $t('about.approachPara2') }}</p>

        <ul>
          <li>{{ $t('about.approachQ1') }}</li>
          <li>{{ $t('about.approachQ2') }}</li>
          <li>{{ $t('about.approachQ3') }}</li>
          <li>{{ $t('about.approachQ4') }}</li>
          <li>{{ $t('about.approachQ5') }}</li>
        </ul>

        <p>{{ $t('about.approachPara3') }}</p>
      </div>

      <h2 class="h2">{{ $t('about.networkHeading') }}</h2>

      <div class="content">
        <p>{{ $t('about.networkPara1') }}</p>

        <p>{{ $t('about.networkPara2') }}</p>

        <form class="form" @submit.prevent="submit">
          <input v-model="form.name" type="text" :placeholder="$t('about.formNamePlaceholder')" />
          <input v-model="form.email" type="email" :placeholder="$t('about.formEmailPlaceholder')" />
          <textarea v-model="form.message" :placeholder="$t('about.formMessagePlaceholder')"></textarea>

          <button type="submit">{{ $t('about.formSubmit') }}</button>
        </form>

      </div>

    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import Navbar from '@/components/Navbar.vue'

const form = reactive({
  name: '',
  email: '',
  message: ''
})

const submit = () => {
  console.log(form)
}
</script>

<style scoped>
.about-page {
  background: #F0EFF3; /* lavanda claro, no navy */
  color: #3A4650;
}

.page-wrapper {
  max-width: 1400px; /* mucho más ancho que 820px */
  margin: 0 auto;
  padding: 80px 40px;
}

.h1 {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 48px;
  font-weight: 600;
  margin-bottom: 30px;
  color: #2E3A46; /* NO naranja, es oscuro */
}

.h2 {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 32px;
  font-weight: 600;
  margin: 50px 0 20px;
  color: #E0824B; /* naranja solo aquí */
}

.content p {
  font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif;
  font-size: 17px;
  line-height: 1.8;
  margin-bottom: 20px;
  color: #3A4650;
}

a {
  color: #3B6FA0;
  text-decoration: underline;
}

/* separador tipo "montaña" punteado */
.divider {
  width: 100%;
  height: 60px;
  margin: 40px 0;
  background-image: url("data:image/svg+xml,%3Csvg ...%3E"); /* ver abajo */
}

input, textarea {
  background: #EAEAEA;
  color: #333;
  border: none;
  padding: 14px;
}

input::placeholder, textarea::placeholder {
  color: #999;
}

button {
  background: #F0B23C;
  color: #1a1a1a;
  font-weight: bold;
}

</style>