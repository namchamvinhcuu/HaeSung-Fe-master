import moment from "moment";

const PurchaseOrderDto = {
  PoId: 0,
  PoCode: "",
  Description: "",
  TotalQty: 0,
  DeliveryDate: moment.utc(),
  RemainQty: 0,
  DueDate: moment.utc(),

  isActived: true,
  createdDate: moment.utc(),
  createdBy: 0,
  createdName: "",
  modifiedDate: moment.utc(),
  modifiedBy: 0,
  modifiedName: "",
  row_version: null,
};

export default PurchaseOrderDto;
