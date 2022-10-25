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
  ETDLoad: new Date(),
  DeliveryTime: new Date(),
  Remark: "",
  Truck: "",

  PoCode: "",
  MaterialCode: "",

  isActived: true,
  createdDate: new Date(),
  createdBy: 0,
  createdName: "",
  modifiedDate: new Date(),
  modifiedBy: 0,
  modifiedName: "",
  row_version: "",
};

export default DeliveryOrderDto;
