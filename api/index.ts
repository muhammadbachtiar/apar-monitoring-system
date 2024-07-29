import express, { type Request, type Response, type Application } from 'express'
import knex from 'knex'
import { Model } from 'objection'
import databaseConfig from './src/config/databaseConfig'
import userRouter from './src/routes/userRouter'
import locationRouter from './src/routes/locationRouter'
import aparRouter from './src/routes/aparRouter'
import inspection6MonthlyRouter from './src/routes/inspection6MonthlyRouter'
import inspection1MonthlyRouter from './src/routes/inspection1MonthlyRouter'
import notificationRouter from './src/routes/notificationRouter'
import notification from './src/controllers/notificationsController'

const app: Application = express()
const cors = require('cors')
const PORT: number = 8082
const knexInstance = knex({
  client: 'postgresql',
  connection: databaseConfig
})

Model.knex(knexInstance)

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())
app.use('', userRouter)
app.use('', locationRouter)
app.use('', aparRouter)
app.use('', inspection6MonthlyRouter)
app.use('', inspection1MonthlyRouter)
app.use('', notificationRouter)

app.get('/', (req: Request, res: Response) => {
  res.send('Hello world!')
})

setInterval(notification.notificationOnRepair, 1000)
setInterval(notification.notificationToCheck6Montly, 1000)
setInterval(notification.notificationToCheck1Montly, 1000)

app.listen(Number(process.env.PORT ?? PORT), '0.0.0.0', () => {
  console.log(`Server is running on port ${process.env.PORT ?? PORT}`)
})
