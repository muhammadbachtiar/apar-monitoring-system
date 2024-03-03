import { Model } from 'objection'

class NotificationModel extends Model {
  id!: string
  id_user!: string
  title!: string
  message!: string
  status_read!: boolean
  notification_type!: string
  timestamp!: Date

  static readonly tableName = 'notifications'
}

export default NotificationModel
