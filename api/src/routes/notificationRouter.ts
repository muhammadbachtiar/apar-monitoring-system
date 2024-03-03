import { Router } from 'express'
import notificationsController from '../controllers/notificationsController'
import isTokenAutorized from '../middlewares/authorize'

const notificationRouter: Router = Router()

// notificationRouter.get('/api/v1/apars/:id', isTokenAutorized, aparsControler.getAparById)
notificationRouter.get('/api/v1/notifications', isTokenAutorized, notificationsController.getAllNotifications)
// notificationRouter.post('/api/v1/apars', isTokenAutorized, isAdmin, aparsControler.addApar)
notificationRouter.put('/api/v1/notifications/:id', isTokenAutorized, notificationsController.readNotification)
notificationRouter.put('/api/v1/notifications', isTokenAutorized, notificationsController.readAllNotification)
// notificationRouter.put('/api/v1/apars/fix/:id', isTokenAutorized, isAdminOrChecker, aparsControler.fixApar)
// notificationRouter.delete('/api/v1/apars/:id', isTokenAutorized, isAdmin, aparsControler.deleteApar)

export default notificationRouter
