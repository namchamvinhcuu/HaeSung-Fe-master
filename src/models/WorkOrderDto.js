const WorkOrderDto = {
  WoId: 0,
  WoCode: "",
  FPOId: 0,
  MaterialId: 0,
  LineId: 0,
  OrderQty: 0,
  ActualQty: 0,
  StartDate: new Date(),

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

export default WorkOrderDto;
