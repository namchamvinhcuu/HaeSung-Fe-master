import moment from "moment";

const StaffDto = {
    StaffId: 0
    , StaffCode: ''
    , StaffName: ''
    , isActived: true
    , createdDate: moment.utc()
    , createdBy: 0
    , modifiedDate: moment.utc()
    , modifiedBy: 0
    , row_version: null
}

export default StaffDto