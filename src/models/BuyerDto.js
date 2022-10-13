import moment from "moment";

const BuyerDto = {
    BuyerId: 0
    , BuyerCode: ''
    , BuyerName: ''
    , Contact: ''
    , Description: ''
    , isActived: true
    , createdDate: moment.utc()
    , createdBy: 0
    , modifiedDate: moment.utc()
    , modifiedBy: 0
    , row_version: null
}

export default BuyerDto