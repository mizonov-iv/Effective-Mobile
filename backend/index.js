const express = require('express')
const cors = require('cors')
const { sequelize } = require('./db')
const ticketsRoutes = require('./routes/ticketsRoutes')

const app = express()
const PORT = 3000

app.use(express.json())
app.use('/', ticketsRoutes)

async function startServer () {
    try {
        await sequelize.authenticate()
        console.log("База данных подключена")

        await sequelize.sync()
        console.log("База данных синхронизирована")

        app.listen(PORT, () => {
            console.log(`Сервер запущен на http://localhost:${PORT}`)
        })
    } catch (error) {
        console.error("Ошибка при подключении к БД:", error)
    }
}
startServer()
