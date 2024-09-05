import express from 'express'
import {
  editProfile,
  getCurrent,
  getUser,
  login,
  logout,
  refresh,
  register,
} from '../controllers/authController.js'
import validateBody from '../middlewares/validateBody.js'
import { registerSchema } from '../schemas/userSchema.js'
import authenticate from '../middlewares/authenticate.js'
import upload from '../middlewares/upload.js'

const authRouter = express.Router()

authRouter.post('/register', validateBody(registerSchema), register)

authRouter.post('/login', login)

authRouter.post('/logout', authenticate, logout)

authRouter.post('/refresh', refresh)

authRouter.get('/current', authenticate, getCurrent)

authRouter.get('/:id', authenticate, getUser)

authRouter.patch('/update', authenticate, upload.single('avatar'), editProfile)

export default authRouter
