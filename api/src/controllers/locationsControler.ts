import { LocationModel } from '../models/location'
import { LocationCheckerModel } from '../models/location_checker'
import { AparModel } from '../models/apar'
import { type Request, type Response } from 'express'
import { v4 as uuidv4 } from 'uuid'

const addLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { locations } = req.body.data

    if (!locations || !Array.isArray(locations)) {
      res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'Invalid request format. Expecting an array of locations.'
      })
      return
    }

    const registeredLocations = []

    for (const { location_name, checker_6monthly, checker_1monthly } of locations) {
      const existingLocation = await LocationModel.query().findOne({ location_name })

      if (existingLocation) {
        res.status(400).json({
          error: 'INVALID_LOCATION_NAME',
          message: `Location '${location_name}' is already exists. Please use a different location.`
        })
        return
      }

      const uniqueId = uuidv4()
      const registeredLocation = await LocationModel.query().insert({
        id: uniqueId,
        location_name,
        registered_time: new Date(),
        update_time: new Date()
      }).returning('*')

      for (const id_user of checker_6monthly) {
        await LocationCheckerModel.query().insert({
          id: uuidv4(),
          id_user,
          id_location: registeredLocation.id,
          checker_type: '6MONTHLY'
        })
      }

      for (const id_user of checker_1monthly) {
        await LocationCheckerModel.query().insert({
          id: uuidv4(),
          id_user,
          id_location: registeredLocation.id,
          checker_type: '1MONTHLY'
        })
      }

      registeredLocations.push(registeredLocation)
    }

    res.status(201).json({
      message: 'Create Success, New Locations Created',
      locationsInformation: registeredLocations
    })
  } catch (error: any) {
    console.error(error.message)
    res.status(500).json({ message: error.message })
  }
}

const getLocationById = async (req: Request, res: Response): Promise<void> => {
  const locationId = req.params.id
  const filterById = await LocationModel.query().findById(locationId).withGraphFetched('[checker]')

  if (filterById === null || filterById === undefined) {
    res.status(404).json({
      error: 'INVALID_ID',
      message: 'No location data found by that id'
    })
    return
  }

  res.status(201).json({
    message: 'Success Get location Data by ID',
    data: filterById
  })
}

const getAllLocations = async (req: Request, res: Response): Promise<void> => {
  const allLocations = await LocationModel.query().withGraphFetched('[checker.[user]]')

  res.status(201).json({
    message: 'Succsesfully get all locations data',
    data: allLocations
  })
}

const updateLocation = async (req: Request & { location?: any }, res: Response): Promise<void> => {
  const locationIdToUpdate = req.params.id
  const data = req.body
  const location_name = data.data.location_name
  try {
    const locationToUpdate = await LocationModel.query().findById(locationIdToUpdate).withGraphFetched('[checker]')

    if (locationToUpdate === null || locationToUpdate === undefined) {
      res.status(404).json({ error: 'INVALID_ID', message: 'No location data found by that id' })
      return
    }

    if (location_name !== locationToUpdate.location_name) {
      const existingLocation = await LocationModel.query().findOne({ location_name })
      if (existingLocation) {
        res.status(400).json({
          error: 'INVALID_LOCATION_NAME',
          message: `Location '${location_name}' is already exists. Please use a different location.`
        })
        return
      }
    }

    if (locationToUpdate === null || locationToUpdate === undefined) {
      res.status(404).json({ error: 'INVALID_ID', message: 'No location data found by that id' })
      return
    }
    const currentChecker6Monthly: string[] = data.data.checker_6monthly
    const prevChecker6Monthly = (locationToUpdate?.checker ?? []).filter(checker => checker.checker_type === '6MONTHLY')
    const currentChecker6MonthlyNew = currentChecker6Monthly?.filter((checker) => !prevChecker6Monthly.map(checker => checker.id_user).includes(checker))
    const currentChecker6MonthlyDeleted = prevChecker6Monthly.map(checker => checker.id_user).filter((checker) => !currentChecker6Monthly.includes(checker))
    if (currentChecker6MonthlyDeleted && currentChecker6MonthlyDeleted.length > 0) {
      await Promise.all(
        currentChecker6MonthlyDeleted.map(async (deletedCheckerId) => {
          await LocationCheckerModel.query().delete().where({
            id_location: locationToUpdate.id,
            id_user: deletedCheckerId,
            checker_type: '6MONTHLY'
          })
        })
      )
    }

    if (currentChecker6MonthlyNew && currentChecker6MonthlyNew.length > 0) {
      const insertData = currentChecker6MonthlyNew.map(newCheckerId => ({
        id: uuidv4(),
        id_user: newCheckerId,
        id_location: locationToUpdate.id,
        checker_type: '6MONTHLY'
      }))
      console.log(insertData)
      await LocationCheckerModel.query().insert(insertData)
    }

    const currentChecker1Monthly: string[] = data.data.checker_1monthly
    const prevChecker1Monthly = (locationToUpdate?.checker ?? []).filter(checker => checker.checker_type === '1MONTHLY')
    const currentChecker1MonthlyNew = currentChecker1Monthly?.filter((checker) => !prevChecker1Monthly.map(checker => checker.id_user).includes(checker))
    const currentChecker1MonthlyDeleted = prevChecker1Monthly.map(checker => checker.id_user).filter((checker) => !currentChecker1Monthly.includes(checker))
    if (currentChecker1MonthlyDeleted && currentChecker1MonthlyDeleted.length > 0) {
      await Promise.all(
        currentChecker1MonthlyDeleted.map(async (deletedCheckerId) => {
          await LocationCheckerModel.query().delete().where({
            id_location: locationToUpdate.id,
            id_user: deletedCheckerId,
            checker_type: '1MONTHLY'
          })
        })
      )
    }

    if (currentChecker1MonthlyNew && currentChecker1MonthlyNew.length > 0) {
      const insertData = currentChecker1MonthlyNew.map(newCheckerId => ({
        id: uuidv4(),
        id_user: newCheckerId,
        id_location: locationToUpdate.id,
        checker_type: '1MONTHLY'
      }))
      await LocationCheckerModel.query().insert(insertData)
    }

    await LocationModel.query().patchAndFetchById(locationIdToUpdate, { location_name, update_time: new Date() })
    res.status(200).json({
      message: `Success Update Location "${locationToUpdate.location_name}" Data`
    })
  } catch (error: any) {
    console.log(error.message)
    res.status(500).json({ message: error.message })
  }
}

const deleteLocation = async (req: Request & { location?: any }, res: Response): Promise<void> => {
  try {
    const locationId = req.params.id
    const data = req.body
    const locationToDelete = await LocationModel.query().findById(locationId)

    if (!locationToDelete) {
      res.status(404).json({
        error: 'INVALID_ID',
        message: 'No location data found by that id'
      })
      return
    }

    const aparUsingLocation = await AparModel.query().where('id_location', locationId).first()
    if (aparUsingLocation) {
      res.status(400).json({
        error: 'LOCATION_IN_USE',
        message: `Cannot delete location because ${locationToDelete.location_name} is still used by some APARs`
      })
      return
    }

    const checkerIdsToDelete = data.map((item: { id: string }) => item.id)
    await LocationCheckerModel.query().whereIn('id', checkerIdsToDelete as string[]).del()
    await LocationModel.query().deleteById(locationId)

    res.status(200).json({
      message: `Location '${locationToDelete.location_name}' deleted successfully`
    })
  } catch (error: any) {
    console.log(error.message)
    res.status(500).json({ message: error.message })
  }
}

export default {
  addLocation,
  getLocationById,
  getAllLocations,
  updateLocation,
  deleteLocation
}
