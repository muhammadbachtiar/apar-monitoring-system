import { Model, type ModelObject, type QueryBuilder } from 'objection'
import { UserModel } from './user'

export class InspectionModel extends Model {
  id!: string
  documents?: string
  result_check!: string
  id_apar!: string
  checker_account_id!: string
  checker_name!: string
  status_check!: boolean
  check_time!: Date
  inspection_type!: string

  static readonly tableName = 'inspection'

  static relationMappings = {
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: UserModel,
      join: {
        from: 'inspection.checker_account_id',
        to: 'users.id'
      },
      modify: (query: any) => {
        query.select('id', 'name', 'role')
      }
    }
  }

  static modifiers = {
    orderByCheckTimeDesc: async (query: QueryBuilder<InspectionModel, InspectionModel[]>) => {
      await query.orderBy('check_time', 'desc').where('status_check', false)
    }
  }
}

export type User = ModelObject<InspectionModel>
