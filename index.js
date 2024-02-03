import express from 'express'
import cors from 'cors'
import { config } from 'dotenv'
import { ConnectDB } from './connection/connectDB.js'
import AuthRouter from './Routes/authRoute.js'
import userRouter from './Routes/userRoute.js'
import postRouter from './Routes/postRoute.js'

config()
const App = express()
const port = process.env.PORT || 8080
const URL = process.env.DB_NAME || 'mongodb://0.0.0.0:27017/SocialMedia'
ConnectDB(URL)

App.use(cors('*'))

App.use(express.json())

App.use('/Auth', AuthRouter)
App.use('/User', userRouter)
App.use('/Post', postRouter)





App.listen(port)