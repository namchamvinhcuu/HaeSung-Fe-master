import moment from "moment";

const LocationDto = {
    LocationId: 0
    , LocationCode: ''
    , AreaId: 0
    , isActived: true
    , createdDate: moment.utc()
    , createdBy: 0
    , modifiedDate: moment.utc()
    , modifiedBy: 0
    , row_version: null
}

export default LocationDto