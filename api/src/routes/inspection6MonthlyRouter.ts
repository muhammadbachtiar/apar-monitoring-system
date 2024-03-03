import { Router } from 'express'
import inspection6MonthlyController from '../controllers/inspection6MonthlyController'
import isTokenAutorized from '../middlewares/authorize'
import isAdminOrChecker from '../middlewares/isAdminOrChecker'
import multerConfig from '../middlewares/multer'

const inspection6MonthlyRouter: Router = Router()

inspection6MonthlyRouter.get('/api/v1/6monthly-inspections/:id', isTokenAutorized, inspection6MonthlyController.getInspectionById)
inspection6MonthlyRouter.get('/api/v1/6monthly-inspections', isTokenAutorized, inspection6MonthlyController.getAllInspection)
inspection6MonthlyRouter.post('/api/v1/6monthly-inspections', [multerConfig, isTokenAutorized, isAdminOrChecker], inspection6MonthlyController.addInspection6Monthly)
inspection6MonthlyRouter.put('/api/v1/6monthly-inspections/:id', multerConfig, isTokenAutorized, isAdminOrChecker, inspection6MonthlyController.updateInspection6Monthly)
inspection6MonthlyRouter.delete('/api/v1/6monthly-inspections/:id', multerConfig, isTokenAutorized, isAdminOrChecker, inspection6MonthlyController.deleteInspection)

export default inspection6MonthlyRouter
