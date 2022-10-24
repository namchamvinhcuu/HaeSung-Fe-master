import moment from "moment";

const PurchaseOrderDto = {
    PoId: 0
    , PoCode: ''
    , Description: ''
    , TotalQty: 0
    , DeliveryDate: moment.utc()
    , RemainQty: 0
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

export default PurchaseOrderDto;