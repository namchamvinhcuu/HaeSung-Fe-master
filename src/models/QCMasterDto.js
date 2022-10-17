import moment from "moment";
const QCMasterDto= {
    QCMasterId: 0
    ,QCMasterCode: ''
    ,Description: ''
    ,ProductId: 0
    ,ProductCode: null
    , isActived: true
    , createdBy: null
    , createdDate: moment.utc()
    , modifiedDate: moment.utc()
    , modifiedBy: null
    , row_version: null
}

export default QCMasterDto