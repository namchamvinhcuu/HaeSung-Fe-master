import moment from "moment";
const QCMasterDto= {
    QCMasterId: 0
    ,QCMasterCode: ''
    ,Description: ''
    ,MaterialId: 0
    ,MaterialCode: null
    ,QCType: 0
    ,QCTypeName: null
    , isActived: true
    , createdBy: null
    , createdDate: moment.utc()
    , modifiedDate: moment.utc()
    , modifiedBy: null
    , row_version: null
}

export default QCMasterDto