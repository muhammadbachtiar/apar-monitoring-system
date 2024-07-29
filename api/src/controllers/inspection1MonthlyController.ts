import { InspectionModel } from '../models/inspection'
import { AparModel } from '../models/apar'
import { type Request, type Response } from 'express'
import differenceInMinutes from '../utils/diffrentMinuteTime'
import UploadMultipleFile from '../utils/uploadMultipleFile'
import cloudinaryDelete from '../utils/cloudinaryDelete'
import { v4 as uuidv4, validate as uuidValidate } from 'uuid'

const namePattern = /^[a-zA-Z\s]+$/

const addInspection1Monthly = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const {
      id_apar,
      checker_name,
      result_check
    }: { id_apar: string, checker_name: string, result_check: string } = req.body

    const id_checker_account: string = req.user.id
    const uploadeFiles = req.files

    if (!uuidValidate(id_apar)) {
      res.status(400).json({
        error: 'INVALID_ID_APAR',
        message: 'The provided ID is not a valid UUID.'
      })
      return
    }

    const existingApar = await AparModel.query().findOne({ id: id_apar }).withGraphFetched('[location.[checker.[user]]]')

    if (!existingApar) {
      res.status(404).json({
        error: 'INVALID_APAR_ID',
        message: `Apar with ID '${id_apar}' not found.`
      })
      return
    }

    if (!existingApar.condition) {
      res.status(400).json({
        error: 'INVALID_APAR',
        message: `Apar with ID '${id_apar}' is under repair.`
      })
      return
    }

    const isAparChecker = existingApar.location?.checker?.some(checker => {
      return checker.checker_type === 'MONTHLY' && checker.id_user === id_checker_account
    })

    if (req.user.role !== 'Admin') {
      if (!isAparChecker) {
        res.status(400).json({
          error: 'UNAUTHORIZED',
          message: 'You are not the checker of this APAR.'
        })
        return
      }
    }

    if (checker_name.length < 3 || !namePattern.test(checker_name)) {
      res.status(400).json({
        error: 'INVALID_CHECKER_NAME',
        message: 'Make sure checker name is valid.'
      })
      return
    }

    const uniqueId = uuidv4()
    const status_check = JSON.parse(result_check).every((item: { part: string, status: boolean, note: string }) => item.status)

    const handleUpload = async (): Promise<string | undefined> => {
      try {
        if (uploadeFiles !== undefined) {
          const filesArray = Array.isArray(uploadeFiles) ? uploadeFiles : Object.values(uploadeFiles)
          const result = await UploadMultipleFile(filesArray)

          console.log('Upload berhasil:', result)
          return JSON.stringify(result)
        }
      } catch (error) {
        console.error('Error:', error)
        throw error
      }
    }

    const files = await handleUpload()

    const inspection_result = await InspectionModel.query().insert({
      id: uniqueId,
      documents: files,
      result_check: JSON.stringify(result_check),
      id_apar,
      id_checker_account,
      status_check,
      checker_name,
      check_time: new Date(),
      inspection_type: 'MONTHLY'
    }).returning('*')

    await AparModel.query().patchAndFetchById(id_apar, { condition: status_check, last_1montly_check_time: new Date() })

    res.status(201).json({
      message: 'Create Success, Inspection data noted',
      data: inspection_result

    })
  } catch (error: any) {
    console.log(error.message)
    res.status(500).json({ message: error.message })
  }
}

const getInspectionById = async (req: Request, res: Response): Promise<void> => {
  const inspectionId = req.params.id

  if (!uuidValidate(inspectionId)) {
    res.status(400).json({
      error: 'INVALID_ID',
      message: 'The provided ID is not a valid UUID.'
    })
    return
  }

  try {
    const filterById = await InspectionModel.query().withGraphFetched('[user]').findById(inspectionId)
    if (filterById === null || filterById === undefined) {
      res.status(404).json({
        error: 'INVALID_ID',
        message: 'No inspection data found by that id'
      })
      return
    }
    res.status(201).json({
      message: 'Success Get inspection Data by ID',
      data: filterById
    })
  } catch (error: any) {
    console.log(error.message)
    res.status(500).json({ message: error.message })
  }
}

const getAllInspection = async (req: Request, res: Response): Promise<void> => {
  let query = InspectionModel.query().withGraphFetched('[user]').where('inspection_type', 'MONTHLY')

  try {
    const conditionParam = req.query.id_apar as string | undefined
    if (conditionParam !== undefined) {
      query = query.where('id_apar', conditionParam)
    }
    const allInspections = await query

    res.status(201).json({
      message: 'Succsesfully get all inspections data',
      data: allInspections
    })
  } catch (error: any) {
    console.log(error.message)
    res.status(500).json({ message: error.message })
  }
}

const updateInspection1Monthly = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const {
      id_apar,
      checker_name,
      result_check,
      deleted_documents,
      documents
    }: { id_apar: string, checker_name: string, result_check: string, documents: string, deleted_documents: string } = req.body

    if (!uuidValidate(id_apar)) {
      res.status(400).json({
        error: 'INVALID_APAR_ID',
        message: 'The provided ID is not a valid UUID.'
      })
      return
    }

    if (checker_name.length < 3 || !namePattern.test(checker_name)) {
      res.status(400).json({
        error: 'INVALID_CHECKER_NAME',
        message: 'Make sure checker name is valid.'
      })
      return
    }

    const inspectionId = req.params.id
    const id_checker_account: string = req.user.id
    const uploadeFiles = req.files

    const existingInspection = await InspectionModel.query().findOne({ id: inspectionId })

    if (!existingInspection) {
      res.status(404).json({
        error: 'INVALID_INSPECTION_ID',
        message: `inspection with ID '${inspectionId}' not found.`
      })
      return
    }

    const isAparChecker = existingInspection.id_checker_account === req.user.id

    const existingApar = await AparModel.query().findOne({ id: id_apar })

    if (!existingApar) {
      res.status(404).json({
        error: 'INVALID_APAR_ID',
        message: `Apar with ID '${id_apar}' not found.`
      })
      return
    }

    if (req.user.role !== 'Admin') {
      if (!isAparChecker) {
        res.status(400).json({
          error: 'UNAUTHORIZED',
          message: 'You are not the checker of this APAR.'
        })
        return
      }
    }

    if (differenceInMinutes(String(existingInspection.check_time)) > 30) {
      res.status(404).json({
        error: 'INVALID_INSPECTION',
        message: `inspection with ID '${inspectionId}' can not be edited already.`
      })
      return
    }

    if (deleted_documents && deleted_documents.length > 0) {
      const deletPromise = deleted_documents.split(',').map(async (filesId: any) => {
        try {
          const cloudinaryResult = await cloudinaryDelete(String(filesId))
          console.log(cloudinaryResult.message)
        } catch (error) {
          console.error(`Error deleted document with ${filesId}:`, error)
          return null
        }
      })

      await Promise.all(deletPromise)
    }

    const handleUpload = async (): Promise<string> => {
      try {
        if (uploadeFiles !== undefined) {
          const filesArray = Array.isArray(uploadeFiles) ? uploadeFiles : Object.values(uploadeFiles)
          const result = await UploadMultipleFile(filesArray)
          return JSON.stringify(result)
        }
      } catch (error) {
        console.error('Error:', error)
        throw error
      }
      return ''
    }

    const newDocuments: string = await handleUpload()
    const combinedArray = JSON.parse(documents).concat(JSON.parse(newDocuments))

    const status_check = JSON.parse(result_check).every((item: { part: string, status: boolean, note: string }) => item.status)

    const inspection_result = await InspectionModel.query().patchAndFetchById(inspectionId, { result_check: JSON.stringify(result_check), documents: JSON.stringify(combinedArray), id_checker_account, status_check, checker_name, check_time: new Date() })

    await AparModel.query().patchAndFetchById(id_apar, { condition: status_check, last_1montly_check_time: new Date() })

    res.status(201).json({
      message: 'Create Success, Inspection data noted',
      data: inspection_result
    })
  } catch (error: any) {
    console.log(error.message)
    res.status(500).json({ message: error.message })
  }
}

const deleteInspection = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const inspectionId = req.params.id

    if (!uuidValidate(inspectionId)) {
      res.status(400).json({
        error: 'INVALID_APAR_ID',
        message: 'The provided ID is not a valid UUID.'
      })
      return
    }

    const inspectionToDelete = await InspectionModel.query().findById(inspectionId)

    if (!inspectionToDelete) {
      res.status(404).json({
        error: 'INVALID_ID',
        message: 'No Inspection data found by that id'
      })
      return
    }

    const isAparChecker = inspectionToDelete.id_checker_account === req.user.id

    if (req.user.role !== 'Admin') {
      if (!isAparChecker) {
        res.status(400).json({
          error: 'UNAUTHORIZED',
          message: 'You are not the checker of this APAR.'
        })
        return
      }
    }

    if (inspectionToDelete.documents !== undefined) {
      const filesArray = Array.isArray(inspectionToDelete.documents) ? inspectionToDelete.documents : Object.values(inspectionToDelete.documents)
      const deletPromise = filesArray.map(async (file) => {
        try {
          const cloudinaryResult = await cloudinaryDelete(String(file.fileId))
          console.log(cloudinaryResult.message)
        } catch (error) {
          console.error(`Error uploading ${file.originalname}:`, error)
          return null
        }
      })

      await Promise.all(deletPromise)
    }

    await InspectionModel.query().deleteById(inspectionId)

    const lastInspection1Monthly = await InspectionModel.query()
      .where('id_apar', inspectionToDelete.id_apar)
      .where('inspection_type', 'MONTHLY')
      .orderBy('check_time', 'desc')
      .first()

    const lastInspection = await InspectionModel.query()
      .where('id_apar', inspectionToDelete.id_apar)
      .orderBy('check_time', 'desc')
      .first()

    const condition = lastInspection ? lastInspection.status_check : true
    const last1MonthlyCheckTime = lastInspection1Monthly ? lastInspection1Monthly.check_time : AparModel.query().findById(inspectionToDelete.id_apar).select('registered_time')

    await AparModel.query()
      .patchAndFetchById(inspectionToDelete.id_apar, {
        condition,
        last_1montly_check_time: last1MonthlyCheckTime
      })

    res.status(200).json({
      message: `Inspection ${new Date(inspectionToDelete.check_time).toLocaleString('id-ID', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric'
      })} deleted successfully`
    })
  } catch (error: any) {
    console.log(error.message)
    res.status(500).json({ message: error.message })
  }
}

export default {
  addInspection1Monthly,
  getInspectionById,
  getAllInspection,
  updateInspection1Monthly,
  deleteInspection
}
