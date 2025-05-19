const express = require('express')
const router = express.Router()
const { Tickets, Sequelize } = require('../db')

const Op = Sequelize.Op

// Создание нового обращения
router.post('/tickets', async (req, res) => {
    try {
        const { topic, text } = req.body
        // Валидация — проверяем, что оба поля есть и не пустые
        if (!topic || !text) {
            return res.status(400).json({ success: false, message: 'Тема и текст обязательны' })
        }
        // Создаём запись в БД
        const newTicket = await Tickets.create({ topic, text })
        res.status(201).json({ success: true, data: newTicket })
    } catch (error) {
        console.error('Ошибка при создании обращения:', error)
        res.status(500).json({ success: false, message: 'Ошибка сервера' })
    }
})

// Взять обращение в работу
router.patch('/tickets/:id/start', async (req, res) => {
    try {
        const { id } = req.params
        // Пытаемся найти обращение по id
        const ticket = await Tickets.findByPk(id)
        // Если не найдено — вернём 404
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Обращение не найдено' })
        }
        // Проверка: если уже завершено или отменено — менять нельзя
        if (ticket.status === 'Завершено' || ticket.status === 'Отменено') {
            return res.status(400).json({
                success: false,
                message: `Нельзя взять в работу обращение со статусом "${ticket.status}"`
            })
        }
        // Обновляем статус
        ticket.status = 'В работе'
        await ticket.save()
        res.json({ success: true, data: ticket })
    } catch (error) {
        console.error('Ошибка при обновлении статуса:', error)
        res.status(500).json({ success: false, message: 'Ошибка сервера' })
    }
})

// Завершить обращение с текстом решения
router.patch('/tickets/:id/complete', async (req, res) => {
    try {
        const { id } = req.params
        const { resolutionText } = req.body
        // Валидация
        if (!resolutionText) {
            return res.status(400).json({ success: false, message: 'Текст решения обязателен' })
        }
        // Ищем обращение по id
        const ticket = await Tickets.findByPk(id)
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Обращение не найдено' })
        }
        // Нельзя завершать отменённое обращение
        if (ticket.status === 'Отменено') {
            return res.status(400).json({
                success: false,
                message: 'Нельзя завершить уже отменённое обращение'
            })
        }
        // Обновляем статус и текст решения
        ticket.status = 'Завершено'
        ticket.resolutionText = resolutionText
        await ticket.save()
        res.json({ success: true, data: ticket })
    } catch (error) {
        console.error('Ошибка при завершении обращения:', error)
        res.status(500).json({ success: false, message: 'Ошибка сервера' })
    }
})

// Отменить обращение с причиной
router.patch('/tickets/:id/cancel', async (req, res) => {
    try {
        const { id } = req.params
        const { cancellationReason } = req.body
        // Проверка наличия причины отмены
        if (!cancellationReason) {
            return res.status(400).json({ success: false, message: 'Причина отмены обязательна' })
        }
        // Ищем обращение по id
        const ticket = await Tickets.findByPk(id)
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Обращение не найдено' })
        }
        // Нельзя отменить завершённое обращение
        if (ticket.status === 'Завершено') {
            return res.status(400).json({
                success: false,
                message: 'Нельзя отменить завершённое обращение'
            })
        }
        // Обновляем статус и причину
        ticket.status = 'Отменено'
        ticket.cancellationReason = cancellationReason
        await ticket.save()
        res.json({ success: true, data: ticket })
    } catch (error) {
        console.error('Ошибка при отмене обращения:', error)
        res.status(500).json({ success: false, message: 'Ошибка сервера' })
    }
})

// Получить список обращений с фильтрацией по дате или диапазону
router.get('/tickets', async (req, res) => {
    try {
        const { date, startDate, endDate } = req.query
        const filter = {}
        // Фильтр по конкретной дате
        if (date) {
            const start = new Date(date)
            const end = new Date(date)
            end.setDate(end.getDate() + 1)
            filter.createdAt = {
                [Sequelize.Op.gte]: start,
                [Sequelize.Op.lt]: end,
            }
        }
        // Фильтр по диапазону дат
        if (startDate && endDate) {
            filter.createdAt = {
                [Sequelize.Op.gte]: new Date(startDate),
                [Sequelize.Op.lte]: new Date(endDate),
            }
        }
        const tickets = await Tickets.findAll({ where: filter, order: [['createdAt', 'DESC']] })
        res.json({ success: true, data: tickets })
    } catch (error) {
        console.error('Ошибка при получении обращений:', error)
        res.status(500).json({ success: false, message: 'Ошибка сервера' })
    }
})

// Отменить все обращения "В работе"
router.patch('/tickets/cancel-all-in-progress', async (req, res) => {
    try {
        // Находим все обращения со статусом "В работе"
        const ticketsInProgress = await Tickets.findAll({
            where: {
                status: 'В работе'
            }
        })
        // Если ничего не найдено — сразу отвечаем
        if (ticketsInProgress.length === 0) {
            return res.json({
                success: true,
                message: 'Нет обращений в статусе "В работе" для отмены',
                count: 0
            })
        }
        // Обновляем каждое обращение
        for (const ticket of ticketsInProgress) {
            ticket.status = 'Отменено'
            ticket.cancellationReason = 'Автоматическая отмена'
            await ticket.save() // сохраняем каждое изменение
        }
        res.json({
            success: true,
            message: 'Обращения успешно отменены',
            count: ticketsInProgress.length
        })
    } catch (error) {
        console.error('Ошибка при отмене обращений:', error)
        res.status(500).json({ success: false, message: 'Ошибка сервера' })
    }
})

module.exports = router