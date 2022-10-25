import moment from "moment";

const DeliveryOrderDto = {
  DoId: 0,
  DoCode: "",
  PoId: 0,
  MaterialId: 0,
  OrderQty: 0,
  RemainQty: 0,
  PackingNote: "",
  InvoiceNo: "",
  Dock: "",
  ETDLoad: moment.utc(),
  DeliveryTime: moment.utc(),
  Remark: "",
  Truck: "",

  PoCode: "",
  MaterialCode: "",

  isActived: true,
  createdDate: moment.utc(),
  createdBy: 0,
  createdName: "",
  modifiedDate: moment.utc(),
  modifiedBy: 0,
  modifiedName: "",
  row_version: "",
};

export default DeliveryOrderDto;
