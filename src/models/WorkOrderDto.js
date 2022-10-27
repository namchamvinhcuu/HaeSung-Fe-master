const WorkOrderDto = {
  WoId: 0,
  WoCode: "",

  OrderQty: 0,
  ActualQty: 0,
  StartDate: new Date(),

  FPOId: 0,
  FPoMasterId: 0,
  FPoMasterCode: "",
  MaterialId: 0,
  MaterialCode: "",
  LineId: 0,
  LineName: "",

  StartSearchingDate: new Date(),
  EndSearchingDate: new Date(),

  isActived: true,
  createdDate: new Date(),
  createdBy: 0,
  createdName: "",
  modifiedDate: new Date(),
  modifiedBy: 0,
  modifiedName: "",
  row_version: "",
};

export default WorkOrderDto;
