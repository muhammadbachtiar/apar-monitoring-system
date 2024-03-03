import { Model, type ModelObject } from 'objection'
import { LocationCheckerModel } from './location_checker'
import { UserModel } from './user'

export class LocationModel extends Model {
  id!: string
  location_name!: string
  registered_time!: Date
  update_time!: Date
  checker?: LocationCheckerModel[]

  static readonly tableName = 'locations'
  static relationMappings = {
    checker: {
      relation: Model.HasManyRelation,
      modelClass: LocationCheckerModel,
      join: {
        from: 'locations.id',
        to: 'location_checker.id_location'
      }
    },
    users: {
      relation: Model.ManyToManyRelation,
      modelClass: UserModel,
      join: {
        from: 'locations.id',
        through: {
          from: 'location_checker.id_location',
          to: 'location_checker.id_user'
        },
        to: 'users.id'
      }
    }
  }
}

export type Location = ModelObject<LocationModel>
