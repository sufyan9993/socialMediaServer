import express from 'express'
import { upload } from '../middleWare/multer.js'
import { loginUser, registerUser } from '../controller/userController.js'
const AuthRouter = express.Router()

AuthRouter.post('/Register', upload.single('profilePhoto'), registerUser)
AuthRouter.post('/Login', loginUser)

export default AuthRouter