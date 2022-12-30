import { CREATE_ACTION, BASE_URL } from '@constants/ConfigConstants';
import { MuiAutocomplete, MuiDialog, MuiResetButton, MuiSubmitButton, MuiButton } from '@controls';
import { Box, Grid, Link, TextField } from '@mui/material';
import { materialService } from '@services';
import { ErrorAlert, SuccessAlert } from '@utils';
import { useFormik } from 'formik';
import React, { useEffect, useState, useRef } from 'react';
import { useIntl } from 'react-intl';
import * as yup from 'yup';

import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import readXlsxFile from 'read-excel-file';
import _ from 'lodash';

const MaterialDialog = ({ initModal, isOpen, onClose, setNewData, setUpdateData, mode, valueOption, fetchData }) => {
  const intl = useIntl();
  const [dialogState, setDialogState] = useState({ isSubmit: false });
  // const [SupplierList, setSupplierList] = useState([]);
  const [UnitList, setUnitList] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dataReadFile, setDataReadFile] = useState([]);
  const refFile = useRef();
  const [ExcelHistory, setExcelHistory] = useState([]);
  const regexMoldCode = /^([a-z0-9]{4})-([a-z0-9]{6})+$/gi;
  const [listMoldCode, setListMoldCode] = useState([]);

  const getListMoldCode = async () => {
    const res = await materialService.getAllMoldCode();
    if (res && res.Data) {
      const listCode = res.Data.map((dt) => dt.MoldCode);
      setListMoldCode(listCode);
    }
  };

  const schemaY = yup.object().shape({
    MaterialCode: yup
      .string()
      .nullable()
      .required(intl.formatMessage({ id: 'general.field_required' }))
      .matches(/(\w{4})-(\w{6})/, intl.formatMessage({ id: 'general.field_format' }, { format: '****-******' })),
    MaterialType: yup
      .number()
      .nullable()
      .required(intl.formatMessage({ id: 'general.field_required' })),
    Unit: yup
      .number()
      .nullable()
      .when('MaterialTypeName', (MaterialTypeName) => {
        if (MaterialTypeName !== 'BARE MATERIAL')
          return yup
            .number()
            .nullable()
            .required(intl.formatMessage({ id: 'general.field_required' }));
      }),
    QCMasterId: yup
      .number()
      .nullable()
      .required(intl.formatMessage({ id: 'general.field_required' })),
    SupplierId: yup
      .number()
      .nullable()
      .when('MaterialTypeName', (MaterialTypeName) => {
        if (MaterialTypeName !== 'BARE MATERIAL')
          return yup
            .number()
            .nullable()
            .required(intl.formatMessage({ id: 'general.field_required' }));
      }),
    MoldCode: yup
      .string()
      .nullable()
      .when('MaterialTypeName', (MaterialTypeName) => {
        if (MaterialTypeName === 'BARE MATERIAL')
          return yup
            .string()
            .nullable()
            .required(intl.formatMessage({ id: 'general.field_required' }))
            .matches(regexMoldCode, intl.formatMessage({ id: 'product.Not_match_code' }))
            .oneOf(listMoldCode, intl.formatMessage({ id: 'material.MoldeCode_not_found' }));
      }),
  });

  const formik = useFormik({
    validationSchema: schemaY,
    initialValues: mode == CREATE_ACTION ? defaultValue : initModal,
    enableReinitialize: true,
    onSubmit: async (values) => onSubmit(values),
  });

  const { handleChange, handleBlur, handleSubmit, values, setFieldValue, errors, touched, isValid, resetForm } = formik;

  useEffect(() => {
    // getSupplier();
    getListMoldCode();
    getUnit();
  }, []);

  const [value, setValue] = React.useState('tab1');
  const handleChangeTab = (event, newValue) => {
    setValue(newValue);
  };

  const handleReset = () => {
    resetForm();
  };

  const handleCloseDialog = () => {
    resetForm();
    setValue('tab1');
    setExcelHistory([]);
    setSelectedFile(null);
    onClose();
  };

  const onSubmit = async (data) => {
    setDialogState({ ...dialogState, isSubmit: true });

    if (mode == CREATE_ACTION) {
      if (data.MaterialTypeName == 'BARE MATERIAL') {
        var unitBare = UnitList.filter((x) => x.commonDetailName == 'PCS');
        data.Unit = unitBare[0].commonDetailId;
      }

      const res = await materialService.createMaterial(data);
      if (res.HttpResponseCode === 200 && res.Data) {
        SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
        setNewData({ ...res.Data });
        setDialogState({ ...dialogState, isSubmit: false });
        handleReset();
      } else {
        ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
        setDialogState({ ...dialogState, isSubmit: false });
      }
    } else {
      const res = await materialService.modifyMaterial(data);
      if (res.HttpResponseCode === 200) {
        SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
        setUpdateData({ ...res.Data });
        setDialogState({ ...dialogState, isSubmit: false });
        handleReset();
        handleCloseDialog();
      } else {
        ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
        setDialogState({ ...dialogState, isSubmit: false });
      }
    }
  };

  const getSupplier = async () => {
    const res = await materialService.getSupplier();
    return res;
    // if (res.HttpResponseCode === 200 && res.Data) {
    //   setSupplierList([...res.Data]);
    // }
  };

  const getUnit = async () => {
    const res = await materialService.getUnit();
    if (res.HttpResponseCode === 200 && res.Data) {
      setUnitList([...res.Data]);
    }
  };

  const schema = {
    'CIS CODE': {
      prop: 'MaterialCode',
      type: String,
      required: true,
    },
    'MATERIAL TYPE': {
      prop: 'MaterialTypeCode',
      type: String,
      required: true,
    },
    UNIT: {
      prop: 'UnitCode',
      type: String,
      required: true,
    },
    'QC MASTER': {
      prop: 'QCMasterCode',
      required: true,
      type: String,
    },
    MAKER: {
      prop: 'SupplierCode',
      type: String,
    },
    GRADE: {
      prop: 'Grade',
      type: String,
    },
    COLOR: {
      prop: 'Color',
      type: String,
    },
    'RESIN TYPE': {
      prop: 'ResinType',
      type: String,
    },
    'FLAME CLASS': {
      prop: 'FlameClass',
      type: String,
    },
    DESCRIPTION: {
      prop: 'Description',
      type: String,
    },
  };

  const handleUpload = async () => {
    setDialogState({ ...dialogState, isSubmit: true });
    if (!selectedFile) {
      ErrorAlert('Chưa chọn file update');
    }

    readXlsxFile(selectedFile, { schema }).then(({ rows, errors }) => {
      errors.length === 0;

      handleSubmitFile(rows);
    });
    document.getElementById('excelinput').text = '';

    setSelectedFile(null);
    refFile.current.value = '';
    refFile.current.text = '';
    setDataReadFile([]);
    setDialogState({ ...dialogState, isSubmit: false });
  };

  const handleSubmitFile = async (rows) => {
    const res = await materialService.createMaterialByExcel(rows);

    setExcelHistory([]);
    if (res.ResponseMessage !== '') {
      fetchData();
      setExcelHistory(res.ResponseMessage.split(','));
      SuccessAlert(intl.formatMessage({ id: 'general.success' }));
    } else {
      ErrorAlert(intl.formatMessage({ id: 'Files.Data_Invalid' }));
    }
  };

  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);
    // if (event.target.files[0]?.name !== 'Material.xlsx') {
    //   ErrorAlert(intl.formatMessage({ id: 'Files.Material' }));
    // }

    readXlsxFile(event.target.files[0]).then(function (data) {
      setDataReadFile(data);
    });
  };

  return (
    <MuiDialog
      maxWidth="lg"
      title={intl.formatMessage({ id: mode == CREATE_ACTION ? 'general.create' : 'general.modify' })}
      isOpen={isOpen}
      disabledCloseBtn={dialogState.isSubmit}
      disable_animate={300}
      onClose={handleCloseDialog}
    >
      <TabContext value={value ?? 'tab1'}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChangeTab}>
            <Tab label="Single" value="tab1" />
            <Tab label="Excel" value="tab2" />
          </TabList>
        </Box>
        <TabPanel value="tab1" sx={{ p: 0, pt: 2 }}>
          <form onSubmit={handleSubmit}>
            <Grid container rowSpacing={2.5} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
              <Grid item xs={6}>
                <TextField
                  autoFocus
                  fullWidth
                  size="small"
                  name="MaterialCode"
                  inputProps={{ maxLength: 11 }}
                  disabled={dialogState.isSubmit}
                  value={values.MaterialCode}
                  onChange={handleChange}
                  label={intl.formatMessage({ id: 'material.MaterialCode' }) + ' *'}
                  error={touched.MaterialCode && Boolean(errors.MaterialCode)}
                  helperText={touched.MaterialCode && errors.MaterialCode}
                />
              </Grid>
              <Grid item xs={6}>
                <MuiAutocomplete
                  required
                  value={
                    values.MaterialType
                      ? { commonDetailId: values.MaterialType, commonDetailName: values.MaterialTypeName }
                      : null
                  }
                  disabled={dialogState.isSubmit}
                  label={intl.formatMessage({ id: 'material.MaterialType' })}
                  fetchDataFunc={materialService.getMaterialType}
                  displayLabel="commonDetailName"
                  displayValue="commonDetailId"
                  onChange={(e, value) => {
                    if (value?.commonDetailName == 'BARE MATERIAL') {
                      setFieldValue('SupplierName', '');
                      setFieldValue('SupplierId', null);
                      var unitBare = UnitList.filter((x) => x.commonDetailName == 'PCS');
                      setFieldValue('UnitName', unitBare[0].commonDetailName);
                      setFieldValue('Unit', unitBare[0].commonDetailId);
                    } else {
                      setFieldValue('UnitName', '');
                      setFieldValue('Unit', null);
                    }
                    setFieldValue('QCMasterCode', '');
                    setFieldValue('QCMasterId', null);
                    setFieldValue('MaterialTypeName', value?.commonDetailName || '');
                    setFieldValue('MaterialType', value?.commonDetailId || '');
                    setFieldValue('MoldCode', '');
                  }}
                  error={touched.MaterialType && Boolean(errors.MaterialType)}
                  helperText={touched.MaterialType && errors.MaterialType}
                />
              </Grid>
              <Grid item xs={6}>
                <MuiAutocomplete
                  required
                  value={
                    values.SupplierId ? { SupplierId: values.SupplierId, SupplierName: values.SupplierName } : null
                  }
                  disabled={
                    values.MaterialTypeName == 'BARE MATERIAL' || values.MaterialType == null
                      ? true
                      : dialogState.isSubmit
                  }
                  label={intl.formatMessage({ id: 'material.SupplierId' })}
                  fetchDataFunc={getSupplier}
                  displayLabel="SupplierName"
                  displayValue="SupplierId"
                  onChange={(e, value) => {
                    setFieldValue('SupplierName', value?.SupplierName || '');
                    setFieldValue('SupplierId', value?.SupplierId || '');
                  }}
                  error={touched.SupplierId && Boolean(errors.SupplierId)}
                  helperText={touched.SupplierId && errors.SupplierId}
                />
              </Grid>
              <Grid item xs={6}>
                <MuiAutocomplete
                  required
                  value={
                    values.QCMasterId ? { QCMasterId: values.QCMasterId, QCMasterCode: values.QCMasterCode } : null
                  }
                  disabled={values.MaterialType == null ? true : dialogState.isSubmit}
                  label={intl.formatMessage({ id: 'material.QCMasterId' })}
                  fetchDataFunc={() => materialService.getQCMasterByMaterialType(values.MaterialType)}
                  displayLabel="QCMasterCode"
                  displayValue="QCMasterId"
                  onChange={(e, value) => {
                    setFieldValue('QCMasterCode', value?.QCMasterCode || '');
                    setFieldValue('QCMasterId', value?.QCMasterId || '');
                  }}
                  error={touched.QCMasterId && Boolean(errors.QCMasterId)}
                  helperText={touched.QCMasterId && errors.QCMasterId}
                />
              </Grid>
              <Grid item xs={6}>
                <MuiAutocomplete
                  required
                  value={values.Unit ? { commonDetailId: values.Unit, commonDetailName: values.UnitName } : null}
                  disabled={values.MaterialTypeName == 'BARE MATERIAL' ? true : dialogState.isSubmit}
                  label={intl.formatMessage({ id: 'material.Unit' })}
                  fetchDataFunc={materialService.getUnit}
                  displayLabel="commonDetailName"
                  displayValue="commonDetailId"
                  onChange={(e, value) => {
                    setFieldValue('UnitName', value?.commonDetailName || '');
                    setFieldValue('Unit', value?.commonDetailId || '');
                  }}
                  error={touched.Unit && Boolean(errors.Unit)}
                  helperText={touched.Unit && errors.Unit}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  size="small"
                  name="Description"
                  disabled={dialogState.isSubmit}
                  value={values.Description}
                  onChange={handleChange}
                  label={intl.formatMessage({ id: 'material.Description' })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  size="small"
                  name="Grade"
                  disabled={dialogState.isSubmit}
                  value={values.Grade}
                  onChange={handleChange}
                  label={intl.formatMessage({ id: 'material.Grade' })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  size="small"
                  name="Color"
                  disabled={dialogState.isSubmit}
                  value={values.Color}
                  onChange={handleChange}
                  label={intl.formatMessage({ id: 'material.Color' })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  size="small"
                  name="ResinType"
                  disabled={dialogState.isSubmit}
                  value={values.ResinType}
                  onChange={handleChange}
                  label={intl.formatMessage({ id: 'material.ResinType' })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  size="small"
                  name="FlameClass"
                  disabled={dialogState.isSubmit}
                  value={values.FlameClass}
                  onChange={handleChange}
                  label={intl.formatMessage({ id: 'material.FlameClass' })}
                />
              </Grid>
              {values.MaterialTypeName === 'BARE MATERIAL' && (
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    name="MoldCode"
                    disabled={dialogState.isSubmit}
                    value={values.MoldCode}
                    onChange={handleChange}
                    label={intl.formatMessage({ id: 'mold.MoldCode' })}
                    error={touched.MoldCode && Boolean(errors.MoldCode)}
                    helperText={touched.MoldCode && errors.MoldCode}
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <Grid container direction="row-reverse">
                  <MuiSubmitButton text="save" loading={dialogState.isSubmit} />
                  <MuiResetButton onClick={handleReset} disabled={dialogState.isSubmit} />
                </Grid>
              </Grid>
            </Grid>
          </form>
        </TabPanel>
        <TabPanel value="tab2" sx={{ p: 0 }}>
          <Grid>
            <Grid item xs={12} sx={{ p: 3 }}>
              <input type="file" name="file" id="excelinput" onChange={changeHandler} ref={refFile} />
            </Grid>
            <Grid item xs={12}>
              <Grid container direction="row-reverse">
                <MuiButton
                  text="upload"
                  color="success"
                  onClick={handleUpload}
                  disabled={selectedFile ? false : true}
                />
                <MuiButton
                  text="excel"
                  variant="outlined"
                  color="primary"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = `${BASE_URL}/TemplateImport/Material.xlsx`;
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
          <Box sx={{ mt: 2 }}>
            <table className="table table-striped" style={{ border: 'solid 1px #dee2e6' }}>
              <thead>
                <tr>
                  {dataReadFile[0] && <th scope="col">STT</th>}
                  {dataReadFile[0]?.map((item, index) => {
                    return (
                      <th key={`TITLE ${index}`} scope="col">
                        {item}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {dataReadFile?.slice(1).length > 0 ? (
                  dataReadFile?.slice(1)?.map((item, index) => {
                    return (
                      <tr key={`ITEM${index}`}>
                        <td scope="col">{index + 1}</td>
                        {item?.map((data, index) => {
                          return (
                            <td key={`DATA${index}`} scope="col">
                              {_.isObject(data) ? moment(data).format('YYYY-MM-DD') : String(data)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                ) : ExcelHistory.length > 0 ? (
                  <>
                    <tr>
                      <th colSpan={3}>History</th>
                    </tr>
                    {ExcelHistory.map((item, index) => {
                      if (item != '')
                        return (
                          <tr key={`ITEM${index}`}>
                            <td style={{ width: '15%' }}>{index + 1}</td>
                            <td style={{ width: '20%' }}>{item.split('|')[0]}</td>
                            <td style={{ width: '65%' }}>{item.split('|')[1]}</td>
                          </tr>
                        );
                    })}
                  </>
                ) : (
                  <tr>
                    <td colSpan="100" className="text-center">
                      <i className="fa fa-database" aria-hidden="true" style={{ fontSize: '35px', opacity: 0.6 }} />
                      <h3 style={{ opacity: 0.6, marginTop: '5px' }}>No Data</h3>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Box>
        </TabPanel>
      </TabContext>
    </MuiDialog>
  );
};

const defaultValue = {
  MaterialId: null,
  MaterialCode: '',
  MaterialType: null,
  MaterialTypeName: '',
  Unit: null,
  UnitName: '',
  SupplierId: null,
  SupplierName: '',
  QCMasterId: null,
  QCMasterCode: '',
  Description: '',
  Suppliers: [],
  Grade: '',
  Color: '',
  ResinType: '',
  FlameClass: '',
  MoldCode: '',
};

export default MaterialDialog;
