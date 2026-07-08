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
  background: #2B3B47;
  color: #F5F5F5;
}

/* clave: ancho tipo artículo (como Divi real) */
.page-wrapper {
  max-width: 820px;
  margin: 0 auto;
  padding: 80px 20px;
}

/* títulos muy simples (como original) */
.h1 {
  font-size: 42px;
  font-weight: 500;
  margin-bottom: 30px;
  color: #F4D06F;
}

.h2 {
  font-size: 26px;
  font-weight: 500;
  margin: 40px 0 20px;
  color: #F4D06F;
}

/* texto alineado a la izquierda (CLAVE del original) */
.content p {
  font-size: 14px;
  line-height: 1.9;
  margin-bottom: 18px;
  text-align: left;
}

/* links simples */
a {
  color: #F4D06F;
  text-decoration: underline;
}

/* lista simple tipo editorial */
ul {
  margin: 20px 0 20px 20px;
}

li {
  margin-bottom: 10px;
  line-height: 1.7;
}

/* FORM estilo mínimo */
.form {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

input, textarea {
  padding: 10px;
  border: none;
  background: #1f2a33;
  color: white;
  font-size: 14px;
}

textarea {
  min-height: 120px;
}

button {
  background: #F4D06F;
  color: #2B3B47;
  padding: 10px 18px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  width: fit-content;
}

button:hover {
  background: #F79456;
}

</style>