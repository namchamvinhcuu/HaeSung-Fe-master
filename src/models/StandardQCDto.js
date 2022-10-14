import moment from "moment";
const StandardQCDto= {
    QCId : 0
    ,QCCode : ''
    ,Description : ''
    , isActived: true
    , createdBy: null
    , createdDate: moment.utc()
    , modifiedDate: moment.utc()
    , modifiedBy: null
    , row_version: null  
  
}

export default StandardQCDto