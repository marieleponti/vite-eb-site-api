<script setup>
import { ref, shallowRef, onMounted, computed } from 'vue'
import axios from 'axios'
import { usePosts } from '../composables/usePosts'

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

function createNewRecord() {
  return {
    id: '',
    title: '',
    author: '',
    content: '',
    date: new Date().getFullYear(),
    status: 'draft',
  }
}

onMounted(() => fetchAll())

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

function limpiar(value = '') {
  return value.replace(/<\/?[^>]+(>|$)/g, '')
}

async function save() {
  try {
    let data

    if (isEditing.value) {
      const res = await axios.post('/.netlify/functions/updatePost', {
        id: formModel.value.id,
        title: formModel.value.title,
        content: formModel.value.content,
        status: formModel.value.status || 'draft'
      })
      data = res.data

      const index = entries.value.findIndex(e => e.id === formModel.value.id)
      entries.value[index] = {
        id: data.id,
        title: data.title.rendered,
        content: limpiar(data.content.rendered),
        date: data.date,
        status: data.status
      }

    } else {
      const res = await axios.post('/.netlify/functions/createPost', {
        title: formModel.value.title,
        content: formModel.value.content,
        status: formModel.value.status || 'draft'
      })
      data = res.data

      entries.value.push({
        id: data.id,
        title: data.title.rendered,
        content: limpiar(data.content.rendered),
        date: data.date,
        status: data.status
      })
    }

    dialog.value = false

  } catch (err) {
    console.error(err)
  }
}

function reset() {
  dialog.value = false
  formModel.value = createNewRecord()
  fetchAll()
}
</script>