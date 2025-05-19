import { defineStore } from 'pinia'
import axios from 'axios'

export const useTicketsStore = defineStore('tickets', {
    state: () => ({
        tickets: [],
        isLoading: false,
        error: null
    }),
    actions: {
        // Получить все тикеты
        async fetchTickets() {
            this.isLoading = true
            this.error = null
            try {
                const response = await axios.get('api/tickets')
                this.tickets = response.data.data
            } catch (e) {
                this.error = 'Ошибка при загрузке обращений'
                console.error(e)
            } finally {
                this.isLoading = false
            }
        },
        // Фильтрация по статусу
        getTicketsByStatus(status) {
            return this.tickets.filter(t => t.status === status)
        },
        // Создание нового обращения
        async createTicket({ topic, text }) {
            try {
                const response = await axios.post('api/tickets', { topic, text })
                this.tickets.push(response.data)
                return { success: true }
            } catch (e) {
                console.error(e)
                return { success: false, message: 'Ошибка при создании обращения' }
            }
        },
        // Отменить обращения "В работе"
        async cancelAllInProgress() {
            try {
                await axios.patch('api/tickets/cancel-all-in-progress')
                // Перезагрузим тикеты после отмены
                await this.fetchTickets()
            } catch (err) {
                console.error('Ошибка при отмене обращений в работе:', err)
            }
        },
        // Взять обращение в работу (обновить статус на "В работе")
        async takeTicketToWork(id) {
            try {
                await axios.patch(`api/tickets/${id}/start`)
                await this.fetchTickets()
            } catch (error) {
                this.error = error.message || 'Ошибка при взятии обращения в работу'
            }
        },
        // Завершить обращение (обновить статус на "Завершено" с текстом решения)
        async completeTicket(id, resolutionText) {
            try {
                await axios.patch(`/api/tickets/${id}/complete`, { resolutionText })
                await this.fetchTickets()
            } catch (error) {
                this.error = error.message || 'Ошибка при завершении обращения'
            }
        },
        // Отменить обращение (обновить статус на "Отменено" с текстом решения)
        async cancelTicket(id, cancellationReason) {
            try {
                await axios.patch(`api/tickets/${id}/cancel`, { cancellationReason })
                await this.fetchTickets()
            } catch (error) {
                this.error = error.message || 'Ошибка при завершении обращения'
            }
        },
    }
})
