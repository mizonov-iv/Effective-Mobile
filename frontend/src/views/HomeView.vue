<template>
  <h2>Управление статусами обращений</h2>
  <!-- Вкладки по статусу -->
  <div class="tabs-wrapper">
    <p class="tabs-label">Отфильровать по статусу</p>
    <select class="select" v-model="currentTab">
      <option value="Все">Все</option>
      <option value="Новое">Новое</option>
      <option value="В работе">В работе</option>
      <option value="Завершено">Завершено</option>
      <option value="Отменено">Отменено</option>
    </select>
  </div>
  <!-- Кнопка отмены -->
  <div v-if="currentTab === 'В работе' && filteredTickets.length">
    <button class="btn" @click="cancelInProgress">Отменить все обращения</button>
  </div>
  <!-- Статусы загрузки и ошибки -->
  <div v-if="store.isLoading">Загрузка...</div>
  <div v-else-if="store.error">{{ store.error }}</div>
  <!-- Список обращений -->
  <ul v-else class="tickets-list" v-for="ticket in filteredTickets" :key="ticket.id">
    <li class="tickets-list_item">
      <div class="list-item_description">
        <p><span>Тема:</span> {{ ticket.topic }}</p>
        <p><span>Описание:</span> {{ ticket.text }}</p>
        <p><span>Дата создания:</span> {{ formatDate(ticket.createdAt) }}</p>
        <p><span>Статус:</span> {{ ticket.status }}</p>
        <p v-if="ticket.resolutionText"><span>Решение:</span> {{ ticket.resolutionText }}</p>
        <p v-if="ticket.cancellationReason"><span>Причина отмены:</span> {{ ticket.cancellationReason }}</p>
      </div>
      <div class="list-buttons-wrapper">
        <button class="btn" @click="takeToWork(ticket.id)" v-show="ticket.status === 'Новое'">Взять в работу</button>
        <button class="btn" v-show="ticket.status !== 'Завершено' && ticket.status !== 'Отменено'" @click="completeTicket(ticket.id)">Завершить</button>
        <button class="btn" v-show="ticket.status !== 'Отменено' && ticket.status !== 'Завершено'" @click="cancelTicket(ticket.id)">Отменить</button>
      </div>
    </li>
  </ul>
  <p class="empty-tip" v-show="!filteredTickets.length">Список пуст</p>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTicketsStore } from '../store/tickets'

const store = useTicketsStore()
const currentTab = ref('Все')

onMounted(() => {
  store.fetchTickets()
})

const filteredTickets = computed(() => {
  if (currentTab.value === 'Все') return store.tickets
  return store.getTicketsByStatus(currentTab.value)
})

const cancelInProgress = async () => {
  await store.cancelAllInProgress()
}

const takeToWork = async (id) => {
  await store.takeTicketToWork(id)
}

const completeTicket = async (id) => {
  const resolutionText = prompt('Введите решение для обращения:')
  if (resolutionText) {
    await store.completeTicket(id, resolutionText)
  }
}

const cancelTicket = async (id) => {
  const resolutionText = prompt('Введите причину отмены:')
  if (resolutionText) {
    await store.cancelTicket(id, resolutionText)
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

</script>