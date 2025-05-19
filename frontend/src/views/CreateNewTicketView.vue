<template>
  <h2>Создать обращение</h2>
  <div class="create-ticket">
    <form class="form" @submit.prevent="handleSubmit">
      <input class="input-field_input" v-model="topic" required placeholder="Тема"/>
      <input class="input-field_input" v-model="text" required placeholder="Описание"/>
      <button class="btn" :disabled="loading">
        {{ loading ? "Отправка..." : "Создать" }}
      </button>
    </form>
    <!-- Pop-up сообщение -->
    <div v-if="successMessage || errorMessage" class="popup">
      <p v-if="successMessage" style="color: green">{{ successMessage }}</p>
      <p v-if="errorMessage" style="color: red">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTicketsStore } from '../store/tickets'

const topic = ref('')
const text = ref('')
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const store = useTicketsStore()
const router = useRouter()

const handleSubmit = async () => {
  loading.value = true
  successMessage.value = ''
  errorMessage.value = ''

  const result = await store.createTicket({ topic: topic.value, text: text.value })

  loading.value = false

  if (result.success) {
    successMessage.value = 'Обращение успешно создано!'
    setTimeout(() => router.push('/'), 1500) // редирект через 1.5 секунды
  } else {
    errorMessage.value = result.message || 'Ошибка при создании обращения'
  }
}
</script>