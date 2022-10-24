import moment from "moment";

const PurchaseOrderDto = {
    PoId: 0
    , PoCode: ''
    , Description: ''
    , TotalQty: 0
    , DeliveryDate: moment.utc()
    , RemainQty: 0
    , DueDate: moment.utc()
}

export default PurchaseOrderDto;