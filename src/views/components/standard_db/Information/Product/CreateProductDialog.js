import { MuiAutocomplete, MuiDialog, MuiResetButton, MuiSubmitButton, MuiButton } from '@controls';
import { Box, Grid, TextField } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import * as yup from 'yup';
import { BASE_URL } from '@constants/ConfigConstants';
import { productService } from '@services';
import { ErrorAlert, SuccessAlert } from '@utils';
import { useFormik } from 'formik';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import readXlsxFile from 'read-excel-file';

const CreateDialog = (props) => {
  const intl = useIntl();
  const { initModal, isOpen, onClose, setNewData, fetchData } = props;
  const regex = /^([a-z0-9]{4})-([a-z0-9]{6})+$/gi;
  const dataModalRef = useRef({ ...initModal });
  const refFile = useRef();
  const [dialogState, setDialogState] = useState({
    isSubmit: false,
  });
  const schemaY = yup.object().shape({
    MaterialCode: yup
      .string()
      .trim()
      .required(intl.formatMessage({ id: 'general.field_required' }))
      .matches(regex, intl.formatMessage({ id: 'product.Not_match_code' })),
    ProductType: yup
      .number()
      .min(1, intl.formatMessage({ id: 'general.field_required' }))
      .required(intl.formatMessage({ id: 'general.field_required' })),
    Model: yup
      .number()
      .min(1, intl.formatMessage({ id: 'general.field_required' }))
      .required(intl.formatMessage({ id: 'general.field_required' })),
    Description: yup.string().trim(),
    Inch: yup.number().test('is-decimal', 'Invalid decimal', (value) => (value + '').match(/^\d*\.{1}\d*$/)),
    QCMasterId: yup
      .number()
      .min(1, intl.formatMessage({ id: 'general.field_required' }))
      .required(intl.formatMessage({ id: 'general.field_required' })),
  });
  const formik = useFormik({
    validationSchema: schemaY,
    initialValues: { ...initModal },

    onSubmit: async (values) => {
      const res = await productService.createProduct(values);
      if (res.HttpResponseCode === 200) {
        debugger;
        SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
        setNewData({ ...res.Data });
        setDialogState({ ...dialogState, isSubmit: false });
        setDialogState({
          ...dialogState,
        });
      } else {
        ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
        setDialogState({ ...dialogState, isSubmit: false });
      }
    },
  });
  const { handleChange, handleBlur, handleSubmit, values, setFieldValue, errors, touched, isValid, resetForm } = formik;

  const getModel = async () => {
    const res = await productService.getProductModel();
    return res;
  };
  const getproductType = async () => {
    const res = await productService.getProductType();
    return res;
  };
  useEffect(() => {
    resetForm({ ...initModal });
  }, [initModal]);

  const handleReset = () => {
    resetForm();
    setDialogState({
      ...dialogState,
    });
  };

  const handleCloseDialog = () => {
    setSelectedFile(null);
    resetForm();
    setDialogState({
      ...dialogState,
    });
    onClose();
  };
  const [value, setValue] = React.useState('tab1');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dataReadFile, setDataReadFile] = useState([]);
  const schema = {
    'PRODUCT CODE': {
      prop: 'ProductCode',
      type: String,
      required: true,
    },
    MODEL: {
      prop: 'Model',
      type: String,
      required: true,
    },
    INCH: {
      prop: 'Inch',
      type: String,
      required: true,
    },
    'PRODUCT TYPE CODE': {
      prop: 'ProductTypeCode',
      type: String,
      required: true,
    },
    'QC MASTER CODE': {
      prop: 'QCMasterCode',
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

    // if (event.target.files[0]?.name !== 'Product.xlsx') {
    //   ErrorAlert(intl.formatMessage({ id: 'Files.Product' }));
    // }

    readXlsxFile(event.target.files[0]).then(function (data) {
      setDataReadFile(data);
    });
  };

  const handleSubmitFile = async (rows) => {
    const res = await productService.createProductByExcel(rows);
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
    document.getElementById('upload-excel-product').text = '';
    setSelectedFile(null);
    refFile.current.value = '';
    refFile.current.text = '';
    setDataReadFile([]);
    setDialogState({ ...dialogState, isSubmit: false });
  };

  const getQCMasterList = async () => {
    const res = await productService.GetQCMasterModel();
    return res;
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
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      autoFocus
                      fullWidth
                      type="text"
                      size="small"
                      name="MaterialCode"
                      disabled={dialogState.isSubmit}
                      value={values.MaterialCode}
                      onChange={handleChange}
                      label={intl.formatMessage({ id: 'general.code' }) + ' *'}
                      error={touched.MaterialCode && Boolean(errors.MaterialCode)}
                      helperText={touched.MaterialCode && errors.MaterialCode}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="text"
                      size="small"
                      name="Inch"
                      label={intl.formatMessage({ id: 'product.Inch' }) + ' *'}
                      disabled={dialogState.isSubmit}
                      value={values.Inch}
                      onChange={handleChange}
                      error={touched.Inch && Boolean(errors.Inch)}
                      helperText={touched.Inch && errors.Inch}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container item spacing={2}>
                  <Grid item xs={6}>
                    <MuiAutocomplete
                      label={intl.formatMessage({ id: 'product.Model' }) + ' *'}
                      fetchDataFunc={getModel}
                      displayLabel="commonDetailName"
                      displayValue="commonDetailId"
                      // defaultValue={
                      // mode == CREATE_ACTION
                      //     ? null
                      //     : { LineId: initModal.LineId, LineName: initModal.LineName }
                      // }
                      value={values.Model ? { commonDetailId: values.Model, commonDetailName: values.ModelName } : null}
                      disabled={dialogState.isSubmit}
                      onChange={(e, value) => {
                        setFieldValue('ModelName', value?.commonDetailName || '');
                        setFieldValue('Model', value?.commonDetailId || '');
                      }}
                      error={touched.Model && Boolean(errors.Model)}
                      helperText={touched.Model && errors.Model}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <MuiAutocomplete
                      label={intl.formatMessage({ id: 'product.product_type' }) + ' *'}
                      fetchDataFunc={getproductType}
                      displayLabel="commonDetailName"
                      displayValue="commonDetailId"
                      // defaultValue={
                      // mode == CREATE_ACTION
                      //     ? null
                      //     : { LineId: initModal.LineId, LineName: initModal.LineName }
                      // }
                      value={
                        values.ProductType
                          ? { commonDetailId: values.ProductType, commonDetailName: values.ProductTypeName }
                          : null
                      }
                      disabled={dialogState.isSubmit}
                      onChange={(e, value) => {
                        setFieldValue('ProductTypeName', value?.commonDetailName || '');
                        setFieldValue('ProductType', value?.commonDetailId || '');
                      }}
                      error={touched.ProductType && Boolean(errors.ProductType)}
                      helperText={touched.ProductType && errors.ProductType}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <MuiAutocomplete
                  label={'QC Master Code' + ' *'}
                  fetchDataFunc={getQCMasterList}
                  displayLabel="QCMasterCode"
                  displayValue="QCMasterId"
                  value={
                    values.QCMasterId
                      ? {
                          QCMasterId: values.QCMasterId,
                          QCMasterCode: values.QCMasterCode,
                        }
                      : null
                  }
                  disabled={dialogState.isSubmit}
                  onChange={(e, value) => {
                    setFieldValue('QCMasterCode', value?.QCMasterCode || '');
                    setFieldValue('QCMasterId', value?.QCMasterId || '');
                  }}
                  error={touched.QCMasterId && Boolean(errors.QCMasterId)}
                  helperText={touched.QCMasterId && errors.QCMasterId}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                {/* <Grid container item spacing={2}> */}
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
                {/* </Grid> */}
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
                    window.location.href = `${BASE_URL}/TemplateImport/Product.xlsx`;
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
      </TabContext>
    </MuiDialog>
  );
};

export default CreateDialog;
