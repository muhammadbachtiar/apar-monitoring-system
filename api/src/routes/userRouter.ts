import { Router } from 'express'
import userControllers from '../controllers/usersControlers'
import isTokenAutorized from '../middlewares/authorize'
import isAdmin from '../middlewares/isAdmin'

const userRouter: Router = Router()

userRouter.post('/api/v1/login', userControllers.login)
userRouter.get('/api/v1/auth', isTokenAutorized, userControllers.authUserInfo)
userRouter.put('/api/v1/profile', isTokenAutorized, userControllers.updateProfile)
userRouter.get('/api/v1/users/:id', isTokenAutorized, userControllers.getUserById)
userRouter.get('/api/v1/users', isTokenAutorized, userControllers.getAllUsers)
userRouter.post('/api/v1/users', isTokenAutorized, isAdmin, userControllers.register)
userRouter.put('/api/v1/users/:id', isTokenAutorized, isAdmin, userControllers.updateUser)
userRouter.delete('/api/v1/users/:id', isTokenAutorized, isAdmin, userControllers.deleteUser)

export default userRouter
