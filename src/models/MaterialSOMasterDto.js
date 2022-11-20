const MaterialSOMasterDto = {
  MsoId: 0,
  MsoCode: '',
  MsoStatus: false,
  Requester: '',
  DueDate: new Date(),
  Remark: '',

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
};

export default MaterialSOMasterDto;
