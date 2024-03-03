import { Model, type ModelObject } from 'objection'

export class UserModel extends Model {
  id!: string
  username!: string
  email!: string
  password!: string
  role!: Enumerator<['Admin', 'Viewer', 'Checker']>
  name!: string
  registered_time!: Date

  static readonly tableName = 'users'
}

export type User = ModelObject<UserModel>
