import { getCurrentWeek } from "@utils";

const WorkOrderDto = {
  WoId: 0,
  WoCode: "",
  FPOId: 0,
  MaterialId: 0,
  BomId: 0,
  LineId: 0,
  OrderQty: 0,
  StartDate: new Date(),
  ActualQty: 0,

  MaterialCode: "",
  BomVersion: "",
  FPoMasterId: 0,
  FPoMasterCode: "",
  LineName: "",

  StartSearchingDate: new Date(),
  EndSearchingDate: new Date(),

  Week: getCurrentWeek(),
  Year: new Date().getFullYear(),
  MaterialBuyerCode: "",

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
