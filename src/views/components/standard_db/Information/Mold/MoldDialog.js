import React, { useEffect, useRef, useState } from 'react';
import {
  MuiDialog,
  MuiResetButton,
  MuiSubmitButton,
  MuiDateField,
  MuiSelectField,
  MuiAutocomplete,
  MuiButton,
} from '@controls';
import { Box, Grid, TextField } from '@mui/material';
import { useIntl } from 'react-intl';
import * as yup from 'yup';
import { moldService } from '@services';
import { ErrorAlert, SuccessAlert } from '@utils';
import { CREATE_ACTION } from '@constants/ConfigConstants';
import { useFormik } from 'formik';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import readXlsxFile from 'read-excel-file';
import { BASE_URL } from '@constants/ConfigConstants';

const MoldDialog = ({ initModal, isOpen, onClose, setNewData, setUpdateData, mode, valueOption, fetchData }) => {
  const intl = useIntl();
  const ETAStatus = [
    { ETAStatus: 'True', ETAStatusName: 'YES' },
    { ETAStatus: 'False', ETAStatusName: 'NO' },
  ];
  const [dialogState, setDialogState] = useState({ isSubmit: false });
  const [dataReadFile, setDataReadFile] = useState([]);
  const refFile = useRef();
  const [value, setValue] = React.useState('tab1');
  const [selectedFile, setSelectedFile] = useState(null);

  const schemay = yup.object().shape({
    MoldSerial: yup.string().required(intl.formatMessage({ id: 'mold.MoldSerial_required' })),
    MoldCode: yup
      .string()
      .required(intl.formatMessage({ id: 'mold.MoldCode_required' }))
      .matches(/(\w{4})-(\w{6})/, intl.formatMessage({ id: 'general.field_format' }, { format: '****-******' })),
    Inch: yup
      .number()
      .nullable()
      .required(intl.formatMessage({ id: 'mold.Inch_required' }))
      .moreThan(0, intl.formatMessage({ id: 'bom.min_value' })),
    MachineTon: yup
      .number()
      .nullable()
      .required(intl.formatMessage({ id: 'mold.MachineTon_required' }))
      .moreThan(0, intl.formatMessage({ id: 'bom.min_value' })),
    Cabity: yup
      .string()
      .nullable()
      .required(intl.formatMessage({ id: 'mold.Cabity_required' })),
    Model: yup
      .number()
      .nullable()
      .required(intl.formatMessage({ id: 'mold.Model_required' })),
    MoldType: yup
      .number()
      .nullable()
      .required(intl.formatMessage({ id: 'mold.MoldType_required' })),
    MachineType: yup
      .number()
      .nullable()
      .required(intl.formatMessage({ id: 'mold.MachineType_required' })),
    ETAStatus1: yup
      .string()
      .nullable()
      .required(intl.formatMessage({ id: 'mold.ETAStatus_required' })),
    ETADate: yup
      .date()
      .nullable()
      .required(intl.formatMessage({ id: 'mold.ETADate_required' })),
  });

  const formik = useFormik({
    validationSchema: schemay,
    initialValues: mode == CREATE_ACTION ? defaultValue : initModal,
    enableReinitialize: true,
    onSubmit: async (values) => onSubmit(values),
  });

  const { handleChange, handleBlur, handleSubmit, values, setFieldValue, errors, touched, isValid, resetForm } = formik;

  useEffect(() => {
    if (mode == CREATE_ACTION) {
      formik.initialValues = defaultValue;
    } else {
      formik.initialValues = initModal;
    }
  }, [initModal, mode]);

  const handleReset = () => {
    resetForm();
  };

  const handleCloseDialog = () => {
    resetForm();
    onClose();
  };

  const onSubmit = async (data) => {
    setDialogState({ ...dialogState, isSubmit: true });

    if (mode == CREATE_ACTION) {
      const res = await moldService.createMold(data);
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
      const res = await moldService.modifyMold({
        ...data,
        MoldId: initModal.MoldId,
        row_version: initModal.row_version,
      });
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
  const schema = {
    'MOLD SERIAL': {
      prop: 'MoldSerial',
      type: String,
      required: true,
    },
    'MOLD CODE': {
      prop: 'MoldCode',
      type: String,
      required: true,
    },
    'MODEL CODE': {
      prop: 'ModelCode',
      type: String,
      required: true,
    },
    INCH: {
      prop: 'Inch',
      type: String,
      required: true,
    },
    'MOLD TYPE CODE': {
      prop: 'MoldTypeCode',
      type: String,
      required: true,
    },
    'MACHINE TYPE CODE': {
      prop: 'MachineTypeCode',
      type: String,
      required: true,
    },
    'ETA DATE': {
      prop: 'ETADate',
      type: String,
      required: true,
    },
    'MACHINE TON': {
      prop: 'MachineTon',
      type: String,
      required: true,
    },
    CABITY: {
      prop: 'Cabity',
      type: Number,
      required: true,
    },
    'ETA STATUS': {
      prop: 'ETAStatus',
      type: Boolean,
      required: true,
    },
    REMARK: {
      prop: 'Remark',
      type: String,
    },
  };
  const handleChangeTab = (event, newValue) => {
    setValue(newValue);
  };

  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);

    // if (event.target.files[0]?.name !== 'Mold.xlsx') {
    //   ErrorAlert(intl.formatMessage({ id: 'Files.Mold' }));
    // }

    readXlsxFile(event.target.files[0]).then(function (data) {
      setDataReadFile(data);
    });
  };

  const handleSubmitFile = async (rows) => {
    const res = await moldService.createMoldByExcel(rows);
    if (res.HttpResponseCode === 200) {
      SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
      fetchData();
      handleCloseDialog();
    } else {
      if (res.HttpResponseCode === 400 && res.ResponseMessage === 'general.duplicated_code') {
        ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
      }
      if (res.HttpResponseCode === 400 && res.ResponseMessage === 'mold.duplicated_serial') {
        ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
      }
      if (res.HttpResponseCode === 400 && res.ResponseMessage === '') {
        ErrorAlert(intl.formatMessage({ id: 'Files.Data_Invalid' }));
      }
    }
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

    // document.getElementById('upload-excel').value = '';
    document.getElementById('upload-excel-product').text = '';
    setSelectedFile(null);
    refFile.current.value = '';
    refFile.current.text = '';
    setDataReadFile([]);
    setDialogState({ ...dialogState, isSubmit: false });
  };

  return (
    <MuiDialog
      maxWidth="lg"
      title={intl.formatMessage({
        id: mode == CREATE_ACTION ? 'general.create' : 'general.modify',
      })}
      isOpen={isOpen}
      disabledCloseBtn={dialogState.isSubmit}
      disable_animate={300}
      onClose={handleCloseDialog}
    >
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChangeTab} aria-label="lab API tabs example">
            <Tab label="Single" value="tab1" />
            <Tab label="Excel" value="tab2" />
          </TabList>
        </Box>
        <TabPanel value="tab1">
          <form onSubmit={handleSubmit}>
            <Grid container rowSpacing={2.5} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
              <Grid item container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    autoFocus
                    fullWidth
                    size="small"
                    name="MoldSerial"
                    disabled={dialogState.isSubmit}
                    value={values.MoldSerial}
                    onChange={handleChange}
                    label={intl.formatMessage({ id: 'mold.MoldSerial' }) + ' *'}
                    error={touched.MoldSerial && Boolean(errors.MoldSerial)}
                    helperText={touched.MoldSerial && errors.MoldSerial}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    name="MoldCode"
                    disabled={dialogState.isSubmit}
                    value={values.MoldCode}
                    onChange={handleChange}
                    label={intl.formatMessage({ id: 'mold.MoldCode' }) + ' *'}
                    error={touched.MoldCode && Boolean(errors.MoldCode)}
                    helperText={touched.MoldCode && errors.MoldCode}
                  />
                </Grid>
              </Grid>
              <Grid item container spacing={2}>
                <Grid item xs={6}>
                  <MuiAutocomplete
                    required
                    value={
                      values.Model
                        ? {
                            commonDetailId: values.Model,
                            commonDetailName: values.ModelName,
                          }
                        : null
                    }
                    disabled={dialogState.isSubmit}
                    label={intl.formatMessage({ id: 'mold.Model' })}
                    fetchDataFunc={moldService.getProductModel}
                    displayLabel="commonDetailName"
                    displayValue="commonDetailId"
                    onChange={(e, value) => {
                      setFieldValue('ModelName', value?.commonDetailName || '');
                      setFieldValue('Model', value?.commonDetailId || '');
                    }}
                    error={touched.Model && Boolean(errors.Model)}
                    helperText={touched.Model && errors.Model}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    size="small"
                    name="Inch"
                    disabled={dialogState.isSubmit}
                    value={values.Inch}
                    onChange={handleChange}
                    label={intl.formatMessage({ id: 'mold.Inch' }) + ' *'}
                    error={touched.Inch && Boolean(errors.Inch)}
                    helperText={touched.Inch && errors.Inch}
                  />
                </Grid>
              </Grid>
              <Grid item container spacing={2}>
                <Grid item xs={6}>
                  <MuiAutocomplete
                    required
                    value={
                      values.MoldType
                        ? {
                            commonDetailId: values.MoldType,
                            commonDetailName: values.MoldTypeName,
                          }
                        : null
                    }
                    disabled={dialogState.isSubmit}
                    label={intl.formatMessage({ id: 'mold.MoldType' })}
                    fetchDataFunc={moldService.getProductType}
                    displayLabel="commonDetailName"
                    displayValue="commonDetailId"
                    onChange={(e, value) => {
                      setFieldValue('MoldTypeName', value?.commonDetailName || '');
                      setFieldValue('MoldType', value?.commonDetailId || '');
                    }}
                    error={touched.MoldType && Boolean(errors.MoldType)}
                    helperText={touched.MoldType && errors.MoldType}
                  />
                </Grid>
                <Grid item xs={6}>
                  <MuiAutocomplete
                    required
                    value={
                      values.MachineType
                        ? {
                            commonDetailId: values.MachineType,
                            commonDetailName: values.MachineTypeName,
                          }
                        : null
                    }
                    disabled={dialogState.isSubmit}
                    label={intl.formatMessage({ id: 'mold.MachineType' })}
                    fetchDataFunc={moldService.getMachineType}
                    displayLabel="commonDetailName"
                    displayValue="commonDetailId"
                    onChange={(e, value) => {
                      setFieldValue('MachineTypeName', value?.commonDetailName || '');
                      setFieldValue('MachineType', value?.commonDetailId || '');
                    }}
                    error={touched.MachineType && Boolean(errors.MachineType)}
                    helperText={touched.MachineType && errors.MachineType}
                  />
                </Grid>
              </Grid>
              <Grid item container spacing={2}>
                <Grid item xs={6}>
                  <MuiDateField
                    required
                    disabled={dialogState.isSubmit}
                    label={intl.formatMessage({ id: 'mold.ETADate' })}
                    value={values.ETADate ?? null}
                    onChange={(e) => setFieldValue('ETADate', e)}
                    error={touched.ETADate && Boolean(errors.ETADate)}
                    helperText={touched.ETADate && errors.ETADate}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    size="small"
                    name="MachineTon"
                    disabled={dialogState.isSubmit}
                    value={values.MachineTon}
                    onChange={handleChange}
                    label={intl.formatMessage({ id: 'mold.MachineTon' }) + ' *'}
                    error={touched.MachineTon && Boolean(errors.MachineTon)}
                    helperText={touched.MachineTon && errors.MachineTon}
                  />
                </Grid>
              </Grid>
              <Grid item container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    size="small"
                    name="Cabity"
                    inputProps={{ min: 0 }}
                    disabled={dialogState.isSubmit}
                    value={values.Cabity}
                    onChange={handleChange}
                    label={intl.formatMessage({ id: 'mold.Cabity' }) + ' *'}
                    error={touched.Cabity && Boolean(errors.Cabity)}
                    helperText={touched.Cabity && errors.Cabity}
                  />
                </Grid>
                <Grid item xs={6}>
                  <MuiSelectField
                    required
                    value={
                      values.ETAStatus1 != ''
                        ? {
                            ETAStatus: values.ETAStatus1,
                            ETAStatusName: values.ETAStatusName,
                          }
                        : null
                    }
                    disabled={dialogState.isSubmit}
                    label={intl.formatMessage({ id: 'mold.ETAStatus' })}
                    options={ETAStatus}
                    displayLabel="ETAStatusName"
                    displayValue="ETAStatus"
                    onChange={(e, value) => {
                      setFieldValue('ETAStatusName', value?.ETAStatusName || '');
                      setFieldValue('ETAStatus1', value?.ETAStatus || null);
                    }}
                    error={touched.ETAStatus1 && Boolean(errors.ETAStatus1)}
                    helperText={touched.ETAStatus1 && errors.ETAStatus1}
                  />
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  name="Remark"
                  disabled={dialogState.isSubmit}
                  value={values.Remark}
                  onChange={handleChange}
                  label={intl.formatMessage({ id: 'mold.Remark' })}
                />
              </Grid>
              <Grid item xs={12}>
                <Grid container direction="row-reverse">
                  <MuiSubmitButton text="save" loading={dialogState.isSubmit} />
                  <MuiResetButton onClick={handleReset} disabled={dialogState.isSubmit} />
                </Grid>
              </Grid>
            </Grid>
          </form>
        </TabPanel>
        <TabPanel value="tab2">
          <Grid>
            <Grid item xs={12} sx={{ p: 3 }}>
              <input type="file" name="file" onChange={changeHandler} id="upload-excel-product" ref={refFile} />
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
                    window.location.href = `${BASE_URL}/TemplateImport/Mold.xlsx`;
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
          <Box sx={{ mt: 2 }}>
            <table className="table table-striped">
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
                              {String(data)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
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
  MoldSerial: '',
  MoldCode: '',
  Model: null,
  ModelName: '',
  MoldType: null,
  MoldTypeName: '',
  Inch: '',
  MachineType: null,
  MachineTypeName: '',
  MachineTon: '',
  ETADate: '',
  Cabity: '',
  ETAStatus: null,
  ETAStatus1: '',
  ETAStatusName: '',
  Remark: '',
};

export default MoldDialog;
