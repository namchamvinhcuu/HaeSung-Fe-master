const LotDto = {
  Id: 0,
  // LotCode: '',
  MaterialId: 0,
  LotStatus: false,
  Qty: 0,
  QCDate: new Date(),
  QCResult: true,
  WarehouseType: 0,
  LocationId: 0,
  SupplierId: null,

  MaterialCode: '',
  MaterialColorCode: '',
  LocationCode: '',

  StartSearchingDate: new Date(),
  EndSearchingDate: new Date(),

  isActived: true,
  createdDate: new Date(),
  createdBy: 0,
  createdName: '',
  modifiedDate: new Date(),
  modifiedBy: 0,
  modifiedName: '',
  row_version: '',
  QcIDList: [],
};

export default LotDto;
