import { Model, type ModelObject } from 'objection'
import { UserModel } from './user'
import { LocationModel } from './location'

export class LocationCheckerModel extends Model {
  id!: string
  id_user!: string
  id_location!: string
  checker_type!: string

  static readonly tableName = 'location_checker'

  static relationMappings = {
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: UserModel,
      join: {
        from: 'location_checker.id_user',
        to: 'users.id'
      }
    },
    location: {
      relation: Model.BelongsToOneRelation,
      modelClass: LocationModel,
      join: {
        from: 'location_checker.id_location',
        to: 'locations.id'
      }
    }
  }
}

export type User = ModelObject<LocationCheckerModel>
