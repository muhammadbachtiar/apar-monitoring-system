import { Model } from 'objection'
import { LocationModel } from './location'
import { InspectionModel } from './inspection_6monthly'

export class AparModel extends Model {
  id!: string
  apar_number!: string
  id_location!: string
  apar_type!: string
  condition!: boolean
  last_6montly_check_time!: Date
  last_1montly_check_time!: Date
  last_filing_time!: Date
  registered_time!: Date
  location?: LocationModel

  static readonly tableName = 'apars'

  static relationMappings = {
    location: {
      relation: Model.BelongsToOneRelation,
      modelClass: LocationModel,
      join: {
        from: 'apars.id_location',
        to: 'locations.id'
      },
      modify: (query: any) => {
        query.select('location_name', 'id')
      }
    },
    inspection: {
      relation: Model.HasManyRelation,
      modelClass: InspectionModel,
      join: {
        from: 'apars.id',
        to: 'inspection.id_apar'
      }
    }
  }
}
