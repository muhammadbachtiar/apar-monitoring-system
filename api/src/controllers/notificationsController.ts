import { type Request, type Response } from 'express'
import { AparModel } from '../models/apar'
import NotificationModel from '../models/notifications'
import { LocationModel } from '../models/location'
import { LocationCheckerModel } from '../models/location_checker'
import { v4 as uuidv4 } from 'uuid'
import { UserModel } from '../models/user'

const notificationOnRepair = async (): Promise<void> => {
  try {
    const AparfalseConditions = await AparModel.query().where({ condition: false })

    if (AparfalseConditions.length > 0) {
      const dataUser = await UserModel.query().where({ role: 'Admin' })
      for (const userAdmin of dataUser) {
        await saveNotification(AparfalseConditions.length, userAdmin.id)
      }
    }

    await deleteReadNotifications()
  } catch (error) {
    console.error('Gagal melakukan pemantauan harian:', error)
  }
}

const notificationToCheck6Montly = async (): Promise<void> => {
  const thresholdDays = 175
  const currentDate = new Date()
  currentDate.setDate(currentDate.getDate() - thresholdDays)

  try {
    const locationData = await LocationModel.query()

    for (const location of locationData) {
      const ApartoCheck = await AparModel.query().where('id_location', location.id).where('condition', true).where('last_6montly_check_time', '<', currentDate).orderBy('last_6montly_check_time', 'desc')
      if (ApartoCheck.length > 0) {
        const checkerData = await LocationCheckerModel.query().where('checker_type', 'SEMESTER').where('id_location', location.id)
        for (const userChecker of checkerData) {
          await saveNotificationToCheck(ApartoCheck.length, location.location_name, 'SEMESTER', userChecker.id_user)
        }
      }
    }

    await deleteReadNotifications()
  } catch (error) {
    console.error('Gagal melakukan pemantauan harian:', error)
  }
}

const notificationToCheck1Montly = async (): Promise<void> => {
  const thresholdDays = 1
  const currentDate = new Date()
  currentDate.setDate(currentDate.getDate() - thresholdDays)

  try {
    const locationData = await LocationModel.query()

    for (const location of locationData) {
      const ApartoCheck = await AparModel.query().where('id_location', location.id).where('condition', true).where('last_1montly_check_time', '<', currentDate).orderBy('last_1montly_check_time', 'desc')
      if (ApartoCheck.length > 0) {
        const checkerData = await LocationCheckerModel.query().where('checker_type', 'MONTHLY').where('id_location', location.id)
        for (const userChecker of checkerData) {
          await saveNotificationToCheck(ApartoCheck.length, location.location_name, 'MONTHLY', userChecker.id_user)
        }
      }
    }

    await deleteReadNotifications()
  } catch (error) {
    console.error('Gagal melakukan pemantauan harian:', error)
  }
}

const saveNotification = async (message: number, id_user: string): Promise<void> => {
  const notificationMessage = `Terdapat ${message} APAR yang tercatat tidak dapat dioperasikan. Segera lakukan perbaikan pada APAR.`
  const title = 'Peringatan Perbaikan APAR'
  try {
    const lastNotification = await NotificationModel.query()
      .where({ message: `${notificationMessage}`, id_user, title, status_read: false })
      .orderBy('timestamp', 'desc')
      .first()
    if (!lastNotification) {
      await NotificationModel.query().insert({
        id: uuidv4(),
        id_user,
        title,
        message: notificationMessage,
        status_read: false,
        notification_type: 'REPAIR APAR NOTIFICATION',
        timestamp: new Date()
      })
      console.log('Berhasil Insert Notification')
    }
  } catch (error) {
    console.error('Gagal menyimpan notifikasi ke tabel notifikasi:', error)
  }
}

const saveNotificationToCheck = async (message: number, locationName: string, checkType: string, id_user: string): Promise<void> => {
  let notificationMessage = ''
  let title = ''

  if (checkType === 'MONTHLY') {
    notificationMessage = `Terdapat ${message} APAR yang perlu dilakukan pemeriksaan bulanan di lokasi ${locationName}. Segera lakukan pemeriksaan pada APAR.`
    title = 'Peringatan Pemeriksaan APAR Bulanan'
  } else if (checkType === 'SEMESTER') {
    notificationMessage = `Terdapat ${message} APAR yang perlu dilakukan pemeriksaan semester di lokasi ${locationName}. Segera lakukan pemeriksaan pada APAR.`
    title = 'Peringatan Pemeriksaan APAR Semester'
  }

  try {
    const lastNotification = await NotificationModel.query()
      .where({ message: `${notificationMessage}`, id_user, title, status_read: false })
      .orderBy('timestamp', 'desc')
      .first()
    if (!lastNotification) {
      await NotificationModel.query().insert({
        id: uuidv4(),
        id_user,
        title,
        message: notificationMessage,
        status_read: false,
        notification_type: 'CHECK APAR NOTIFICATION',
        timestamp: new Date()
      })
      console.log('Berhasil Insert Notification')
    }
  } catch (error) {
    console.error('Gagal menyimpan notifikasi ke tabel notifikasi:', error)
  }
}

const deleteReadNotifications = async (): Promise<void> => {
  try {
    const daysAgo = 1

    await NotificationModel
      .query()
      .where({ status_read: true })
      .whereRaw('timestamp < NOW() - ? * INTERVAL \'1 day\'', [daysAgo])
      .delete()
  } catch (error) {
    console.error('Gagal menghapus notifikasi yang sudah dibaca:', error)
  }
}

const getAllNotifications = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const id_user = req.user.id
    let query = NotificationModel.query().where({ id_user })
    const { read_status } = req.query

    if (read_status !== undefined) {
      const conditionValue = read_status === 'true'
      query = query.where('status_read', conditionValue)
    }

    const allNotifications = await query.orderBy('timestamp', 'desc')

    res.status(201).json({
      message: 'Succsesfully get all locations data',
      data: allNotifications
    })
  } catch (error: any) {
    console.error(error)
    res.status(500).json({
      message: 'Internal Server Error',
      error: error.message
    })
  }
}

const readNotification = async (req: Request, res: Response): Promise<void> => {
  const notificationId = req.params.id
  try {
    const notificationToRead = await NotificationModel.query().findById(notificationId)
    if (notificationToRead === null || notificationToRead === undefined) {
      res.status(404).json({ error: 'INVALID_ID', message: 'No APAR data found by that id' })
      return
    }

    await NotificationModel.query().patchAndFetchById(notificationId, { status_read: true })
    res.status(200).json({
      message: `Success read "${notificationId}" notification Data`
    })
  } catch (error: any) {
    console.log(error.message)
    res.status(500).json({ message: error.message })
  }
}

const readAllNotification = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const userId = req.user.id

    await NotificationModel.query().where({ id_user: userId }).patch({ status_read: true })

    res.status(200).json({
      message: 'Success read all notification Data'
    })
  } catch (error: any) {
    console.log(error.message)
    res.status(500).json({ message: error.message })
  }
}

export default { notificationOnRepair, notificationToCheck6Montly, notificationToCheck1Montly, getAllNotifications, readNotification, readAllNotification }
