import { Router } from 'express'
import inspection1MonthlyController from '../controllers/inspection1MonthlyController'
import isTokenAutorized from '../middlewares/authorize'
import isAdminOrChecker from '../middlewares/isAdminOrChecker'
import multerConfig from '../middlewares/multer'

const inspection1MonthlyRouter: Router = Router()

inspection1MonthlyRouter.get('/api/v1/1monthly-inspections/:id', isTokenAutorized, inspection1MonthlyController.getInspectionById)
inspection1MonthlyRouter.get('/api/v1/1monthly-inspections', isTokenAutorized, inspection1MonthlyController.getAllInspection)
inspection1MonthlyRouter.post('/api/v1/1monthly-inspections', [multerConfig, isTokenAutorized, isAdminOrChecker], inspection1MonthlyController.addInspection1Monthly)
inspection1MonthlyRouter.put('/api/v1/1monthly-inspections/:id', multerConfig, isTokenAutorized, isAdminOrChecker, inspection1MonthlyController.updateInspection1Monthly)
inspection1MonthlyRouter.delete('/api/v1/1monthly-inspections/:id', multerConfig, isTokenAutorized, isAdminOrChecker, inspection1MonthlyController.deleteInspection)

export default inspection1MonthlyRouter
