<template>
  <div class="about-page">

    <div class="page-wrapper">

      <h1 class="h1">About</h1>

      <h2 class="h2">The project</h2>

      <div class="content">
        <p>
          The Everywhere Border project is led by the
          <a href="https://law.temple.edu/ilit/" target="_blank">
            Institute for Law, Innovation and Technology at Temple University
          </a>,
          the
          <a href="https://r3d.mx" target="_blank">
            Red en Defensa de los Derechos Digitales (R3D)
          </a>,
          and
          <a href="https://thecrcr.org" target="_blank">
            the Collaborative Research Center for Resilience
          </a>.
        </p>

        <p>
          We came together in 2023 after a consultation with civil society advocates throughout the Americas...
        </p>

        <p>
          We provide information and resources to support civil society...
        </p>

        <p>
          Our goal is to strengthen transnational solidarities...
        </p>

        <p>
          The increase in militarization and policing that accompanies externalized bordering...
        </p>

        <p>
          We thank all contributors to this info repository for sharing resources...
        </p>
      </div>

      <h2 class="h2">Our Approach</h2>

      <div class="content">
        <p>
          Our approach is to expand collective knowledge on border externalization...
        </p>

        <p>
          Our research covers a set of primary questions concerning processes of border militarization...
        </p>

        <ul>
          <li>What are key surveillance infrastructures in the Americas?</li>
          <li>What geopolitical contexts enable them?</li>
          <li>How does this manifest in Latin America?</li>
          <li>Who are the industry actors?</li>
          <li>What are the human impacts?</li>
        </ul>

        <p>
          We have been exploring these questions through desk research, interviews, and fieldwork...
        </p>
      </div>

      <h2 class="h2">The Everywhere Border Network</h2>

      <div class="content">
        <p>
          As part of this project, we convene a transnational network of civil society organizations...
        </p>

        <p>
          Are you interested in joining? Contact the Everywhere Border team below.
        </p>

        <form class="form" @submit.prevent="submit">
          <input v-model="form.name" type="text" placeholder="Name" />
          <input v-model="form.email" type="email" placeholder="Email Address" />
          <textarea v-model="form.message" placeholder="Message"></textarea>

          <button type="submit">Submit</button>
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