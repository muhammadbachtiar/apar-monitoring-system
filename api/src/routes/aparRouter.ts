import { Router } from 'express'
import aparsControler from '../controllers/aparsControler'
import isTokenAutorized from '../middlewares/authorize'
import isAdmin from '../middlewares/isAdmin'
import isAdminOrChecker from '../middlewares/isAdminOrChecker'

const aparRouter: Router = Router()

aparRouter.get('/api/v1/apars/:id', isTokenAutorized, aparsControler.getAparById)
aparRouter.get('/api/v1/apars', isTokenAutorized, aparsControler.getAllApars)
aparRouter.post('/api/v1/apars', isTokenAutorized, isAdmin, aparsControler.addApar)
aparRouter.put('/api/v1/apars/:id', isTokenAutorized, isAdmin, aparsControler.updateApar)
aparRouter.put('/api/v1/apars/fix/:id', isTokenAutorized, isAdminOrChecker, aparsControler.fixApar)
aparRouter.delete('/api/v1/apars/:id', isTokenAutorized, isAdmin, aparsControler.deleteApar)

export default aparRouter
