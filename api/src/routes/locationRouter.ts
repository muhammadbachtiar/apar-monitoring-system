import { Router } from 'express'
import locationsControler from '../controllers/locationsControler'
import isTokenAutorized from '../middlewares/authorize'
import isAdmin from '../middlewares/isAdmin'

const locationRouter: Router = Router()

locationRouter.get('/api/v1/locations/:id', isTokenAutorized, locationsControler.getLocationById)
locationRouter.get('/api/v1/locations', isTokenAutorized, locationsControler.getAllLocations)
locationRouter.post('/api/v1/locations', isTokenAutorized, isAdmin, locationsControler.addLocation)
locationRouter.put('/api/v1/locations/:id', isTokenAutorized, isAdmin, locationsControler.updateLocation)
locationRouter.delete('/api/v1/locations/:id', isTokenAutorized, isAdmin, locationsControler.deleteLocation)

export default locationRouter
