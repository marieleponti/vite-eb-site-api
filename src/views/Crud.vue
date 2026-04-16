<template>
  <v-sheet border rounded>
    <v-data-table :headers="headers" :hide-default-footer="entries.length < 11" :items="entries">
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>
            <v-icon color="medium-emphasis" icon="mdi-entry-multiple" size="x-small" start></v-icon>
            Popular entries
          </v-toolbar-title>
          <v-btn class="me-2" prepend-icon="mdi-plus" rounded="lg" text border @click="add">Add an entry</v-btn>
        </v-toolbar>
      </template>

      <template v-slot:item.title="{ value }">
        <v-chip :text="value" border="thin opacity-25" prepend-icon="mdi-entry" label>
          <template v-slot:prepend>
            <v-icon color="medium-emphasis"></v-icon>
          </template>
        </v-chip>
      </template>

      <template v-slot:item.actions="{ item }">
        <div class="d-flex ga-2 justify-end">
          <v-icon color="medium-emphasis" icon="mdi-pencil" size="small" @click="edit(item.id)"></v-icon>
          <v-icon color="medium-emphasis" icon="mdi-delete" size="small" @click="remove(item.id)"></v-icon>
        </div>
      </template>

      <template v-slot:no-data>
        <v-btn prepend-icon="mdi-backup-restore" rounded="lg" text border @click="reset">Reset data</v-btn>
      </template>
    </v-data-table>
  </v-sheet>

  <v-dialog v-model="dialog" max-width="500">
    <v-card :subtitle="`${isEditing ? 'Update' : 'Create'} your entry`" :title="`${isEditing ? 'Edit' : 'Add'} an entry`">
      <template v-slot:text>
        <v-row>
          <v-col cols="12">
            <v-text-field v-model="formModel.title" label="Title"></v-text-field>
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field type="text" v-model="formModel.author" label="Author"></v-text-field>
          </v-col>

          <v-col cols="12">
            <v-text-field v-model="formModel.content" label="Content"></v-text-field>
          </v-col>
        </v-row>
      </template>

      <v-divider></v-divider>

      <v-card-actions class="bg-surface-light">
        <v-btn text variant="plain" @click="dialog = false">Cancel</v-btn>
        <v-spacer></v-spacer>
        <v-btn text @click="save">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, shallowRef, onMounted, computed } from 'vue'
import axios from 'axios'
import { usePosts } from '../composables/usePosts'

const WP_BASE_URL = import.meta.env.VITE_WP_API

const currentYear = new Date().getFullYear()

function createNewRecord() {
  return {
    id: '',
    title: '',
    author: '',
    content: '',
    date: currentYear,
    status: 'draft',
  }
}

const { items: entries, fetchAll } = usePosts('posts')
const formModel = ref(createNewRecord())
const dialog = shallowRef(false)
const isEditing = computed(() => !!formModel.value.id)

const headers = [
  { title: 'Title', key: 'title', align: 'start' },
  { title: 'Author', key: 'author' },
  { title: 'Content', key: 'content' },
  { title: 'Date', key: 'date', align: 'end' },
  { title: 'Actions', key: 'actions', align: 'end', sortable: false },
]

onMounted(() => {
  fetchAll()
})

function add() {
  formModel.value = createNewRecord()
  dialog.value = true
}

function edit(id) {
  const found = entries.value.find(e => e.id === id)
  if (!found) return
  formModel.value = { ...found }
  dialog.value = true
}

function remove(id) {
  entries.value = entries.value.filter(e => e.id !== id)
}

function limpiar(value) {
  return value.replace(/<\/?[^>]+(>|$)/g, "")
}

async function getEntries() {
  try {
    const response = await axios.get(`${WP_BASE_URL}/wp-json/wp/v2/posts`);

    console.log('Respuesta completa:', response);

    let data = response.data;

    entries.value = data.map(el => ({
      id: el.id,
      title: el.title.rendered,
      content: limpiar(el.content.rendered),
      date: el.date,
      status: el.status,
    }));

  } catch (error) {
    console.error('Error fetching posts', error);
  }
}

async function save() {
  try {
    let data

    if (isEditing.value) {
      const response = await axios.post('/.netlify/functions/updatePost', {
        id: formModel.value.id,
        title: formModel.value.title,
        content: formModel.value.content,
        status: formModel.value.status || 'draft'
      })
      data = response.data

      const index = entries.value.findIndex(e => e.id === formModel.value.id)
      entries.value[index] = {
        id: data.id,
        title: data.title.rendered,
        content: limpiar(data.content.rendered),
        date: data.date,
        status: data.status
      }
    } else {
      const response = await axios.post('/.netlify/functions/createPost', {
        title: formModel.value.title,
        content: formModel.value.content,
        status: formModel.value.status || 'draft'
      })
      data = response.data

      entries.value.push({
        id: data.id,
        title: data.title.rendered,
        content: limpiar(data.content.rendered),
        date: data.date,
        status: data.status
      })
    }

    dialog.value = false
    console.log('Post guardado correctamente')

  } catch (error) {
    console.error('Error guardando el post', error.response?.data || error)
  }
}

function reset() {
  dialog.value = false
  formModel.value = createNewRecord()
  fetchAll()
}
</script>