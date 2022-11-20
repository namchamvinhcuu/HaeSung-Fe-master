import { getCurrentWeek } from '@utils';

const DeliveryOrderDto = {
  DoId: 0,
  DoCode: '',

  FPOId: 0,
  MaterialId: 0,
  OrderQty: 0,
  RemainQty: 0,
  PackingNote: '',
  InvoiceNo: '',
  Dock: '',
  ETDLoad: new Date(),
  DeliveryTime: new Date(),
  Remark: '',
  Truck: '',

  FPoMasterId: 0,
  FPoMasterCode: '',
  FPoCode: '',
  Week: getCurrentWeek(),
  Year: new Date().getFullYear(),
  MaterialCode: '',
  BuyerId: 0,
  BuyerCode: '',
  MateirialBuyerCode: '',

  isActived: true,
  createdDate: new Date(),
  createdBy: 0,
  createdName: '',
  modifiedDate: new Date(),
  modifiedBy: 0,
  modifiedName: '',
  row_version: '',
};

export default DeliveryOrderDto;
