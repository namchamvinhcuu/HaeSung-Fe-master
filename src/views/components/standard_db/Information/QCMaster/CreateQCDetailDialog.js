import { MuiDialog, MuiResetButton, MuiSelectField, MuiSubmitButton, MuiButton } from '@controls';
import { Box, Grid } from '@mui/material';
import { useFormik } from 'formik';
import React, { useEffect, useState, useRef } from 'react';
import { useIntl } from 'react-intl';
import * as yup from 'yup';
import { qcDetailService } from '@services';
import { ErrorAlert, SuccessAlert } from '@utils';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import readXlsxFile from 'read-excel-file';
import { BASE_URL } from '@constants/ConfigConstants';

const CreateQCDetailDialog = (props) => {
  const intl = useIntl();
  const { initModal, isOpen, onClose, setNewData, fetchData } = props;
  2;
  const refFile = useRef();
  const [QCCodeArr, setQCCodeArr] = useState([initModal]);
  const [dialogState, setDialogState] = useState({
    ...initModal,
    isSubmit: false,
  });
  const schemaY = yup.object().shape({
    QCMasterId: yup.number().required(),
    QCId: yup
      .number()
      .min(1, intl.formatMessage({ id: 'general.field_required' }))
      .required(intl.formatMessage({ id: 'general.field_required' })),
  });

  const formik = useFormik({
    validationSchema: schemaY,
    initialValues: { ...initModal },
    enableReinitialize: true,

    onSubmit: async (values) => {
      const res = await qcDetailService.create(values);
      if (res.HttpResponseCode === 200) {
        SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
        // handleCloseDialog();
        setNewData({ ...res.Data });
        setDialogState({ ...dialogState, isSubmit: false });
        // handleReset();
      } else {
        ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
        // handleCloseDialog();
        setDialogState({ ...dialogState, isSubmit: false });
        // handleReset();
      }
    },
  });
  const { handleChange, handleBlur, handleSubmit, values, setFieldValue, errors, touched, isValid, resetForm } = formik;

  useEffect(() => {
    if (isOpen)
      // getQCMaster();
      getQC();
  }, [isOpen]);

  const getQCMaster = async () => {
    const res = await qcDetailService.getQCMasterActive();
    if (res.HttpResponseCode === 200 && res.Data) {
      setQCMasterCodeArr([...res.Data]);
    } else {
      setQCMasterCodeArr([]);
    }
  };
  const getQC = async () => {
    const res = await qcDetailService.getStandardQCActive();
    if (res.HttpResponseCode === 200 && res.Data) {
      setQCCodeArr([...res.Data]);
    } else {
      setQCCodeArr([]);
    }
  };

  useEffect(() => {
    formik.resetForm();
    formik.initialValues = initModal;
  }, [initModal]);

  const handleReset = () => {
    resetForm();
  };
  const handleCloseDialog = () => {
    setDialogState({
      ...dialogState,
    });
    formik.resetForm();
    onClose();
  };

  const [value, setValue] = React.useState('tab1');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dataReadFile, setDataReadFile] = useState([]);
  const schema = {
    'QC CODE': {
      prop: 'QCCode',
      type: String,
      required: true,
    },
  };
  const handleChangeTab = (event, newValue) => {
    setValue(newValue);
  };

  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);
    // if (event.target.files[0]?.name !== 'ForecastPODetail.xlsx') {
    //   ErrorAlert(intl.formatMessage({ id: 'Files.ForecastPODetail' }));
    // }

    readXlsxFile(event.target.files[0]).then(function (data) {
      setDataReadFile(data);
    });
  };

  const handleSubmitFile = async (rows) => {
    rows?.forEach((item, index) => {
      return Object.assign(item, { QCMasterId: initModal.QCMasterId });
    });
    const res = await qcDetailService.createQCDetailByExcel(rows);

    if (res.HttpResponseCode === 200) {
      SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
      fetchData();
      handleCloseDialog();
    } else {
      if (res.HttpResponseCode === 400 && res.ResponseMessage === 'general.duplicated_code') {
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
    // document.getElementById('upload-excel-product').text = '';
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
                <Grid container item spacing={2} marginBottom={2}>
                  <Grid item xs={12}>
                    <MuiSelectField
                      value={values.QCId ? { QCId: values.QCId, QCCode: values.QCCode } : null}
                      disabled={dialogState.isSubmit}
                      label={intl.formatMessage({ id: 'standardQC.QCCode' }) + ' *'}
                      options={QCCodeArr}
                      displayLabel="QCCode"
                      displayValue="QCId"
                      onChange={(e, value) => {
                        setFieldValue('QCCode', value?.QCCode || '');
                        setFieldValue('QCId', value?.QCId || '');
                      }}
                      defaultValue={initModal && { QCId: initModal.QCId, QCCode: initModal.QCCode }}
                      error={touched.QCId && Boolean(errors.QCId)}
                      helperText={touched.QCId && errors.QCId}
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
                    window.location.href = `${BASE_URL}/TemplateImport/QCSOP_Detail.xlsx`;
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

export default CreateQCDetailDialog;
