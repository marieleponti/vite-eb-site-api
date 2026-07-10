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
    </div>

    <div class="divider" aria-hidden="true"></div>

    <div class="page-wrapper">
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
    </div>

    <div class="divider" aria-hidden="true"></div>

    <div class="page-wrapper">
      <h2 class="h2">{{ $t('about.networkHeading') }}</h2>

      <div class="content">
        <p>{{ $t('about.networkPara1') }}</p>
        <p>{{ $t('about.networkPara2') }}</p>

        <form class="form" name="contact" @submit.prevent="submit">
          <input type="hidden" name="form-name" value="contact" />

          <input v-model="form.name" type="text" :placeholder="$t('about.formNamePlaceholder')" />
          <input v-model="form.email" type="email" :placeholder="$t('about.formEmailPlaceholder')" />
          <textarea v-model="form.message" :placeholder="$t('about.formMessagePlaceholder')"></textarea>

          <!-- honeypot: invisible to humans, visible to bots -->
          <input v-model="form.website" type="text" name="website" autocomplete="off" tabindex="-1" class="honeypot" />

          <button type="submit" :disabled="status === 'sending'">
            {{ status === 'sending' ? $t('about.formSending') : $t('about.formSubmit') }}
          </button>

          <p v-if="status === 'success'" class="form-alert form-alert--success">
            {{ $t('about.formSuccess') }}
          </p>
          <p v-if="status === 'error'" class="form-alert form-alert--error">
            {{ $t('about.formError') }}
          </p>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

const form = reactive({
  name: '',
  email: '',
  message: '',
  website: '' // honeypot, must stay empty
})

const status = ref(null) // null | 'sending' | 'success' | 'error'

const encode = (data) =>
  Object.keys(data)
    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(data[k]))
    .join('&')

const submit = async () => {
  if (form.website) {
    // a bot filled the hidden field, silently ignore
    return
  }

  status.value = 'sending'

  try {
    await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encode({
        'form-name': 'contact',
        name: form.name,
        email: form.email,
        message: form.message,
        website: form.website
      })
    })
    status.value = 'success'
    form.name = ''
    form.email = ''
    form.message = ''
  } catch (e) {
    console.error('Error submitting form', e)
    status.value = 'error'
  }
}
</script>

<style scoped>
.about-page {
  background: #f3f3f7;
  color: #000000;
}

.page-wrapper {
  width: 80%;
  max-width: 1080px;
  margin: 0 auto;
  padding: 40px 20px;
}

.divider {
  width: 100%;
  height: 40px;
  /* ajusta al alto real de tu PNG */
  background-image: url('/terrain_yellow.png');
  background-repeat: repeat-x;
  background-position: left center;
  background-size: auto 100%;
}

.h1 {
  font-family: 'Cormorant', Georgia, 'Times New Roman', serif;
  font-size: 60px;
  font-weight: 700;
  margin-bottom: 30px;
  color: #2b3f47;
  text-align: left;
}

.h2 {
  font-family: 'Cormorant', Georgia, 'Times New Roman', serif;
  font-size: 50px;
  font-weight: 700;
  margin: 40px 0 20px;
  color: #f38a4e;
  text-align: left;
}

.content p {
  font-family: 'Work Sans', Helvetica, Arial, Lucida, sans-serif;
  font-size: 17px;
  font-weight: 300;
  line-height: 1.7em;
  margin-bottom: 18px;
  color: #000000;
  text-align: left;
}

a {
  color: #0c71c3;
  text-decoration: underline;
}

ul {
  margin: 20px 0 20px 20px;
  padding-bottom: 1em;
}

li {
  margin-bottom: 0.5em;
  line-height: 1.7em;
  font-family: 'Work Sans', Helvetica, Arial, sans-serif;
  font-size: 16px;
}

.form {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

input,
textarea {
  -webkit-appearance: none;
  background-color: #eee;
  border-width: 0;
  border-radius: 0;
  color: #999;
  font-size: 14px;
  padding: 16px;
  font-family: 'Work Sans', Helvetica, Arial, sans-serif;
}

textarea {
  min-height: 150px;
}

button {
  color: #2b3f47;
  background: transparent;
  border: 2px solid #2b3f47;
  padding: 0.3em 1em;
  font-family: 'Work Sans', Helvetica, Arial, sans-serif;
  font-weight: 500;
  font-size: 20px;
  border-radius: 3px;
  cursor: pointer;
  width: fit-content;
  transition: all 0.2s;
}

button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.content :deep(a) {
  color: #0c71c3;
  text-decoration: underline;
}

.content :deep(a:visited) {
  color: #0c71c3;
}

.content :deep(a:hover) {
  opacity: 0.8;
}

.honeypot {
  position: absolute;
  left: -9999px;
  opacity: 0;
  height: 0;
  width: 0;
  pointer-events: none;
}

.form-alert {
  font-family: 'Work Sans', Helvetica, Arial, sans-serif;
  font-size: 14px;
  padding: 12px 16px;
  border-radius: 3px;
  margin-top: 8px;
}

.form-alert--success {
  background-color: #e6f4ea;
  color: #1e7e34;
}

.form-alert--error {
  background-color: #fdecea;
  color: #c0392b;
}
</style>