const { Sequelize, DataTypes } = require('sequelize')

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite'
})

const Tickets = sequelize.define('Tickets', {
    topic: {
        type: DataTypes.STRING,
        allowNull: false
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('Новое', 'В работе', 'Завершено', 'Отменено'),
        defaultValue: 'Новое'
    },
    resolutionText: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    cancellationReason: {
        type: DataTypes.TEXT,
        allowNull: true
    }
})

module.exports = {
    sequelize,
    Tickets,
    Sequelize,
}