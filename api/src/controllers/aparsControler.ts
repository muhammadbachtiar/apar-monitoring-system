import { AparModel } from '../models/apar'
import { InspectionModel } from '../models/inspection'
import { type Request, type Response } from 'express'
import { v4 as uuidv4 } from 'uuid'

const addApar = async (req: Request, res: Response): Promise<void> => {
  try {
    const apars: Array<{
      apar_number: string
      id_location: string
      apar_type: string
      condition: boolean
      check_6monthly: string
      check_1monthly: string
      last_filing_time: string
    }> = req.body.apars

    if (!apars || !Array.isArray(apars) || apars.length === 0) {
      res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'Invalid request format. Expecting an array of apars.'
      })
      return
    }

    const registeredApars = []
    for (const apar of apars) {
      const { apar_number, id_location, apar_type, condition, check_6monthly, check_1monthly, last_filing_time } = apar
      const existingApar = await AparModel.query().findOne({ apar_number })

      if (existingApar) {
        res.status(400).json({
          error: 'INVALID_APAR_NUMBER',
          message: `Apar '${apar_number}' is already exists. Please use a different apar.`
        })
        return
      }

      const uniqueId = uuidv4()
      const registeredApar = await AparModel.query().insert({
        id: uniqueId,
        apar_number,
        id_location,
        apar_type,
        condition,
        last_6montly_check_time: new Date(check_6monthly),
        last_1montly_check_time: new Date(check_1monthly),
        last_filing_time: new Date(last_filing_time),
        registered_time: new Date()
      }).returning('*')

      registeredApars.push(registeredApar)
    }

    res.status(201).json({
      message: 'Create Success, New Apars Created',
      aparsInformation: registeredApars
    })
  } catch (error: any) {
    console.log(error.message)
    res.status(500).json({ message: error.message })
  }
}

const getAparById = async (req: Request, res: Response): Promise<void> => {
  const aparId = req.params.id
  const filterById = await AparModel.query().findById(aparId).withGraphFetched('[location.[checker.[user]]]')

  if (filterById === null || filterById === undefined) {
    res.status(404).json({
      error: 'INVALID_ID',
      message: 'No apar data found by that id'
    })
    return
  }

  res.status(201).json({
    message: 'Success Get apar Data by ID',
    data: filterById
  })
}

const getAllApars = async (req: Request, res: Response): Promise<void> => {
  try {
    let query = AparModel.query().withGraphFetched('[location.[checker.[user]]]')

    const { condition, withInspection } = req.query
    if (condition !== undefined) {
      const conditionValue = condition === 'true'
      query = query.where('condition', conditionValue)
    }

    if (withInspection === 'true') {
      query = query
        .withGraphFetched('[inspection]')
        .modifyGraph('inspection', (inspectionQuery: any) => {
          inspectionQuery.modify('orderByCheckTimeDesc')
        })
    }

    const allApars = await query

    res.status(200).json({
      message: 'Successfully get apars data',
      data: allApars
    })
  } catch (error: any) {
    console.error(error)
    res.status(500).json({
      message: 'Internal Server Error',
      error: error.message
    })
  }
}

const updateApar = async (req: Request & { apar?: any }, res: Response): Promise<void> => {
  interface RequestBodyType {
    apar_number: string
    id_location: string
    apar_type: string
    condition: boolean
    check_6monthly: string
    check_1monthly: string
    last_filing_time: string
  }
  const aparIdToUpdate = req.params.id
  try {
    const aparToUpdate = await AparModel.query().findById(aparIdToUpdate)
    if (aparToUpdate === null || aparToUpdate === undefined) {
      res.status(404).json({ error: 'INVALID_ID', message: 'No APAR data found by that id' })
      return
    }

    const { apar_number, id_location, apar_type, condition, check_6monthly, check_1monthly, last_filing_time }: RequestBodyType = req.body

    await AparModel.query().patchAndFetchById(aparIdToUpdate, { id_location, apar_type, condition, last_6montly_check_time: new Date(check_6monthly), last_1montly_check_time: new Date(check_1monthly), last_filing_time: new Date(last_filing_time) })
    res.status(200).json({
      message: `Success Update "${apar_number}" APAR Data`
    })
  } catch (error: any) {
    console.log(error.message)
    res.status(500).json({ message: error.message })
  }
}

const fixApar = async (req: Request & { apar?: any }, res: Response): Promise<void> => {
  interface RequestBodyType {
    id_location: string
    refill_status: string
    apar_number: string
  }
  const aparIdToUpdate = req.params.id
  try {
    const aparToUpdate = await AparModel.query().findById(aparIdToUpdate)
    if (aparToUpdate === null || aparToUpdate === undefined) {
      res.status(404).json({ error: 'INVALID_ID', message: 'No APAR data found by that id' })
      return
    }

    if (aparToUpdate.condition) {
      res.status(400).json({
        error: 'INVALID_APAR',
        message: `Apar with ID '${aparIdToUpdate}' is not under repair.`
      })
      return
    }

    const { id_location, refill_status, apar_number }: RequestBodyType = req.body
    const updateData: { id_location: string, condition: boolean, last_filing_time: Date } = {
      id_location,
      condition: true,
      last_filing_time: aparToUpdate.last_filing_time
    }

    if (refill_status === 'true') {
      updateData.last_filing_time = new Date()
    }

    await AparModel.query().patchAndFetchById(aparIdToUpdate, updateData)

    res.status(200).json({
      message: `Success Fix "${apar_number}" APAR Data`
    })
  } catch (error: any) {
    console.log(error.message)
    res.status(500).json({ message: error.message })
  }
}

const deleteApar = async (req: Request & { apar?: any }, res: Response): Promise<void> => {
  try {
    const aparId = req.params.id
    const aparToDelete = await AparModel.query().findById(aparId)

    if (!aparToDelete) {
      res.status(404).json({
        error: 'INVALID_ID',
        message: 'No apar data found by that id'
      })
      return
    }

    const inspectionUsingApar = await InspectionModel.query().where('id_apar', aparId).first()
    if (inspectionUsingApar) {
      res.status(400).json({
        error: 'APAR_IN_USE',
        message: `Cannot delete APAR ${aparToDelete.apar_number} because it is still used by some inspections`
      })
      return
    }

    await AparModel.query().deleteById(aparId)

    res.status(200).json({
      message: `Apar with number '${aparToDelete.apar_number}' deleted successfully`
    })
  } catch (error: any) {
    console.log(error.message)
    res.status(500).json({ message: error.message })
  }
}

export default {
  addApar,
  getAparById,
  getAllApars,
  updateApar,
  fixApar,
  deleteApar
}
