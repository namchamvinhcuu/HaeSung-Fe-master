import { MuiAutocomplete, MuiDialog, MuiResetButton, MuiSubmitButton, MuiButton } from '@controls';
import { Box, Grid, TextField } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import * as yup from 'yup';
import { qcMasterService } from '@services';
import { ErrorAlert, SuccessAlert } from '@utils';
import { useFormik } from 'formik';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import readXlsxFile from 'read-excel-file';
import { BASE_URL } from '@constants/ConfigConstants';

const CreateDialog = (props) => {
  const intl = useIntl();
  const { initModal, isOpen, onClose, setNewData, fetchData } = props;
  const refFile = useRef();
  const [dataReadFile, setDataReadFile] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [qcType, setqcType] = useState(['']);

  const dataModalRef = useRef({ ...initModal });
  const [dialogState, setDialogState] = useState({
    isSubmit: false,
  });
  const schemaY = yup.object().shape({
    QCMasterCode: yup
      .string()
      .trim()
      .required(intl.formatMessage({ id: 'general.field_required' })),
    MaterialTypeId: yup
      .number()
      .min(1, intl.formatMessage({ id: 'general.field_required' }))
      .required(intl.formatMessage({ id: 'general.field_required' })),
    QCType: yup
      .number()
      .min(1, intl.formatMessage({ id: 'general.field_required' }))
      .required(intl.formatMessage({ id: 'general.field_required' })),
    Description: yup.string().trim(),
  });

  const formik = useFormik({
    validationSchema: schemaY,
    initialValues: { ...initModal },
    onSubmit: async (values) => {
      const res = await qcMasterService.create(values);
      if (res.HttpResponseCode === 200) {
        SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
        // handleCloseDialog();
        setNewData({ ...res.Data });
        setDialogState({ ...dialogState, isSubmit: false });
        // handleReset();
      } else {
        ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
        //   handleCloseDialog();
        setDialogState({ ...dialogState, isSubmit: false });
        // handleReset();
      }
    },
  });
  const { handleChange, handleBlur, handleSubmit, values, setFieldValue, errors, touched, isValid, resetForm } = formik;

  const getMaterial = async (qcType) => {
    const res = await qcMasterService.getMaterialForSelect({ qcType: qcType });
    return res;
  };
  const getQC = async () => {
    const res = await qcMasterService.getQCTypeForSelect();
    return res;
  };
  useEffect(() => {
    setqcType('');
    resetForm({ ...initModal });
  }, [initModal]);

  const handleReset = () => {
    setqcType('');
    resetForm();
    setDialogState({
      ...dialogState,
    });
  };

  const handleCloseDialog = () => {
    setqcType('');
    resetForm();
    setDialogState({
      ...dialogState,
    });
    onClose();
  };
  const [value, setValue] = React.useState('tab1');
  const schema = {
    'QC MASTER CODE': {
      prop: 'QCMasterCode',
      type: String,
      required: true,
    },
    'QC TYPE': {
      prop: 'QCType',
      type: String,
      required: true,
    },
    'MATERIAL TYPE CODE': {
      prop: 'MaterialTypeCode',
      type: String,
      required: true,
    },
    DESCRIPTION: {
      prop: 'Description',
      type: String,
    },
  };
  const handleChangeTab = (event, newValue) => {
    setValue(newValue);
  };

  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);
    readXlsxFile(event.target.files[0]).then(function (data) {
      setDataReadFile(data);
    });
  };

  const handleSubmitFile = async (rows) => {
    const res = await qcMasterService.createQCMasterByExcel(rows);
    if (res.HttpResponseCode === 200) {
      SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
      fetchData();
      handleCloseDialog();
    } else {
      if (res.HttpResponseCode === 400 && res.ResponseMessage === 'general.duplicated_code') {
        ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
      }
      if (
        (res.HttpResponseCode === 400 && res.ResponseMessage === '') ||
        res.ResponseMessage === 'Files.Data_Invalid'
      ) {
        ErrorAlert(intl.formatMessage({ id: 'Files.Data_Invalid' }));
      }
    }
  };

  const handleUpload = async () => {
    setDialogState({ ...dialogState, isSubmit: true });
    if (!selectedFile) {
      ErrorAlert('Chưa chọn file update');
      return;
    }

    readXlsxFile(selectedFile, { schema }).then(({ rows, errors }) => {
      errors.length === 0;

      handleSubmitFile(rows);
    });
    // document.getElementById('upload-excel').value = '';
    document.getElementById('upload-excel').text = '';
    setSelectedFile(null);
    refFile.current.value = '';
    refFile.current.text = '';
    setDataReadFile([]);
    setDialogState({ ...dialogState, isSubmit: false });
  };

  return (
    <MuiDialog
      maxWidth="md"
      title={intl.formatMessage({ id: 'general.create' })}
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
            {/* {mode === CREATE_ACTION && <Tab label="Excel" value="tab2" />} */}
          </TabList>
        </Box>
        <TabPanel value="tab1">
          <form onSubmit={handleSubmit}>
            <Grid container rowSpacing={2.5} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="text"
                      size="small"
                      name="QCMasterCode"
                      disabled={dialogState.isSubmit}
                      value={values.QCMasterCode}
                      onChange={handleChange}
                      label={intl.formatMessage({ id: 'qcMaster.QCMasterCode' }) + ' *'}
                      error={touched.QCMasterCode && Boolean(errors.QCMasterCode)}
                      helperText={touched.QCMasterCode && errors.QCMasterCode}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MuiAutocomplete
                      label={intl.formatMessage({ id: 'qcMaster.qcType' }) + ' *'}
                      fetchDataFunc={getQC}
                      displayLabel="commonDetailName"
                      displayValue="commonDetailId"
                      value={
                        values.QCType ? { commonDetailId: values.QCType, commonDetailName: values.QCTypeName } : null
                      }
                      disabled={dialogState.isSubmit}
                      onChange={(e, value) => {
                        setFieldValue('MaterialTypeName', '');
                        setFieldValue('MaterialTypeId', 0);
                        setqcType(value?.commonDetailName || '');

                        setFieldValue('QCTypeName', value?.commonDetailName || '');
                        setFieldValue('QCType', value?.commonDetailId || '');
                      }}
                      error={touched.QCType && Boolean(errors.QCType)}
                      helperText={touched.QCType && errors.QCType}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MuiAutocomplete
                      label={intl.formatMessage({ id: 'material.MaterialCode' }) + ' *'}
                      fetchDataFunc={() => getMaterial(qcType)}
                      displayLabel="MaterialTypeName"
                      displayValue="MaterialTypeId"
                      value={
                        values.MaterialTypeId
                          ? { MaterialTypeId: values.MaterialTypeId, MaterialTypeName: values.MaterialTypeName }
                          : null
                      }
                      disabled={dialogState.isSubmit}
                      onChange={(e, value) => {
                        setFieldValue('MaterialTypeName', value?.MaterialTypeName || '');
                        setFieldValue('MaterialTypeId', value?.MaterialTypeId || '');
                      }}
                      error={touched.MaterialTypeId && Boolean(errors.MaterialTypeId)}
                      helperText={touched.MaterialTypeId && errors.MaterialTypeId}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container item spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="text"
                      size="small"
                      name="Description"
                      disabled={dialogState.isSubmit}
                      value={values.Description}
                      onChange={handleChange}
                      label={intl.formatMessage({ id: 'general.description' })}
                      error={touched.Description && Boolean(errors.Description)}
                      helperText={touched.Description && errors.Description}
                    />
                  </Grid>
                </Grid>
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
        {/* {mode === CREATE_ACTION && ( */}
        <TabPanel value="tab2">
          <Grid>
            <Grid item xs={12} sx={{ p: 3 }}>
              <input type="file" name="file" onChange={changeHandler} id="upload-excel" ref={refFile} />
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
                    window.location.href = `${BASE_URL}/TemplateImport/QCSOP_Master.xlsx`;
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
                              {data}
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
        {/* )} */}
      </TabContext>
    </MuiDialog>
  );
};

export default CreateDialog;
