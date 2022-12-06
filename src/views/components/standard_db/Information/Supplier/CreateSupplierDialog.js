import { Box, Grid, TextField } from '@mui/material';
import { ErrorAlert, SuccessAlert } from '@utils';
import { useFormik } from 'formik';
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import * as yup from 'yup';
import { MuiDialog, MuiResetButton, MuiSubmitButton, MuiButton } from '@controls';
import { supplierService } from '@services';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import readXlsxFile from 'read-excel-file';
import { BASE_URL } from '@constants/ConfigConstants';

const CreateSupplierDialog = (props) => {
  const intl = useIntl();
  let isRendered = useRef(true);
  const { initModal, isOpen, onClose, setNewData, fetchData } = props;
  const refFile = useRef();
  const [dataReadFile, setDataReadFile] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const [dialogState, setDialogState] = useState({
    ...initModal,
    isSubmit: false,
  });

  const schemaY = yup.object().shape({
    SupplierCode: yup.string().required(intl.formatMessage({ id: 'general.field_required' })),
    SupplierName: yup.string().required(intl.formatMessage({ id: 'general.field_required' })),
  });

  const formik = useFormik({
    validationSchema: schemaY,
    initialValues: { ...initModal },
    onSubmit: async (values) => {
      const res = await supplierService.create(values);

      if (res && isRendered)
        if (res.HttpResponseCode === 200 && res.Data) {
          SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
          setNewData({ ...res.Data });
          setDialogState({ ...dialogState, isSubmit: false });
          // handleCloseDialog();
        } else {
          ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
        }
    },
  });

  const { handleChange, handleBlur, handleSubmit, values, setFieldValue, errors, touched, isValid, resetForm } = formik;

  const handleCloseDialog = () => {
    setDialogState({
      ...dialogState,
    });
    resetForm();
    onClose();
  };

  useEffect(() => {
    return () => {
      isRendered = false;
    };
  });
  const [value, setValue] = React.useState('tab1');
  const schema = {
    'SUPPLIER CODE': {
      prop: 'SupplierCode',
      type: String,
      required: true,
    },
    'SUPPLIER NAME': {
      prop: 'SupplierName',
      type: String,
      required: true,
    },
    'RESIN UL CODE': {
      prop: 'ResinULCode',
      type: String,
    },
    'SUPPLIER CONTACT': {
      prop: 'SupplierContact',
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
    const res = await supplierService.createSupplierByExcel(rows);
    if (res.HttpResponseCode === 200) {
      SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
      fetchData();
      handleCloseDialog();
    } else {
      if (res.HttpResponseCode === 400 && res.ResponseMessage === 'general.duplicated_code') {
        ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
      }
      if (res.HttpResponseCode === 400 && res.ResponseMessage === 'supplier.duplicated_code_resin') {
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
          </TabList>
        </Box>
        <TabPanel value="tab1">
          <form onSubmit={handleSubmit}>
            <Grid container rowSpacing={2.5} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
              <Grid item xs={12}>
                <TextField
                  autoFocus
                  fullWidth
                  size="small"
                  disabled={dialogState.isSubmit}
                  label={intl.formatMessage({ id: 'supplier.SupplierCode' }) + ' *'}
                  name="SupplierCode"
                  value={values.SupplierCode}
                  onChange={handleChange}
                  error={touched.SupplierCode && Boolean(errors.SupplierCode)}
                  helperText={touched.SupplierCode && errors.SupplierCode}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  disabled={dialogState.isSubmit}
                  label={intl.formatMessage({ id: 'supplier.SupplierName' }) + ' *'}
                  name="SupplierName"
                  value={values.SupplierName}
                  onChange={handleChange}
                  error={touched.SupplierName && Boolean(errors.SupplierName)}
                  helperText={touched.SupplierName && errors.SupplierName}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  disabled={dialogState.isSubmit}
                  label="ResinULCode"
                  name="ResinULCode"
                  value={values.ResinULCode}
                  onChange={handleChange}
                  error={touched.ResinULCode && Boolean(errors.ResinULCode)}
                  helperText={touched.ResinULCode && errors.ResinULCode}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  multiline={true}
                  rows={3}
                  disabled={dialogState.isSubmit}
                  label={intl.formatMessage({ id: 'supplier.SupplierContact' })}
                  name="SupplierContact"
                  value={values.SupplierContact}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Grid container direction="row-reverse">
                  <MuiSubmitButton text="save" loading={dialogState.isSubmit} disabled={!isValid} />
                  <MuiResetButton onClick={resetForm} disabled={dialogState.isSubmit} />
                </Grid>
              </Grid>
            </Grid>
          </form>
        </TabPanel>
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
                    window.location.href = `${BASE_URL}/TemplateImport/Supplier.xlsx`;
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

export default CreateSupplierDialog;
