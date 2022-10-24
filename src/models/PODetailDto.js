import moment from "moment";

const PODetailDto = {
    PoDetailId: 0
    , PoId: 0
    , MaterialId: 0
    , Description: ''
    , Qty: 0
    , RemainQty: 0
    , DeliveryDate: moment.utc()
    , DueDate: moment.utc()
    , isActived: true
    , createdDate: moment.utc()
    , createdBy: 0
    , createdName: 0
    , modifiedDate: moment.utc()
    , modifiedBy: 0
    , modifiedName: 0
    , row_version: null
}

export default PODetailDto;