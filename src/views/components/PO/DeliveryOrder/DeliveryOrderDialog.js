import { CREATE_ACTION, UPDATE_ACTION, BASE_URL } from '@constants/ConfigConstants';
import {
  MuiAutocomplete,
  MuiDateTimeField,
  MuiDialog,
  MuiResetButton,
  MuiSubmitButton,
  MuiTextField,
  MuiButton,
} from '@controls';
import { Grid, Box } from '@mui/material';
import { deliveryOrderService } from '@services';
import { ErrorAlert, SuccessAlert } from '@utils';
import { useFormik } from 'formik';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import * as yup from 'yup';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Tab from '@mui/material/Tab';
import readXlsxFile from 'read-excel-file';

const DeliveryOrderDialog = (props) => {
  const { initModal, isOpen, onClose, setNewData, setUpdateData, mode, valueOption, fetchData } = props;

  let isRendered = useRef(true);
  const intl = useIntl();
  const [dialogState, setDialogState] = useState({
    ...initModal,
    isSubmit: false,
  });

  const [tab, setTab] = React.useState('tab1');
  const handleChangeTab = (event, newValue) => {
    setTab(newValue);
  };
  const [selectedFile, setSelectedFile] = useState(null);
  const [dataReadFile, setDataReadFile] = useState([]);
  const refFile = useRef();
  const [ExcelHistory, setExcelHistory] = useState([]);

  const schemaY = yup.object().shape({
    FPoMasterId: yup
      .number()
      .nullable()
      .required(intl.formatMessage({ id: 'general.field_required' }))
      .min(1, intl.formatMessage({ id: 'general.field_min' }, { min: 1 })),
    FPOId: yup
      .number()
      .nullable()
      .required(intl.formatMessage({ id: 'general.field_required' }))
      .min(1, intl.formatMessage({ id: 'general.field_required' })),
    // DoCode: yup
    //   .string()
    //   .required(intl.formatMessage({ id: 'general.field_required' }))
    //   .length(12, intl.formatMessage({ id: 'general.field_length' }, { length: 12 })),
    OrderQty: yup
      .number()
      .required(intl.formatMessage({ id: 'general.field_required' }))
      .min(1, intl.formatMessage({ id: 'general.field_min' }, { min: 1 })),
    ETDLoad: yup
      .date()
      .typeError(intl.formatMessage({ id: 'general.field_invalid' }))
      .nullable()
      .required(intl.formatMessage({ id: 'general.field_required' })),
    DeliveryTime: yup
      .date()
      .typeError(intl.formatMessage({ id: 'general.field_invalid' }))
      .nullable()
      .required(intl.formatMessage({ id: 'general.field_required' }))
      .min(yup.ref('ETDLoad'), "end date can't be before start date"),
  });

  const formik = useFormik({
    validationSchema: schemaY,
    initialValues:
      mode === UPDATE_ACTION
        ? {
            ...initModal,
            ETDLoad: moment(initModal.ETDLoad).add(7, 'hours'),
            DeliveryTime: moment(initModal.DeliveryTime).add(7, 'hours'),
          }
        : { ...initModal },
    enableReinitialize: true,
    onSubmit: async (values, actions) => {
      await onSubmit(values);
      // actions.setFieldValue("PoId", values.PoId);
      // actions.setFieldValue("PoCode", values.PoCode);
      // actions.setFieldValue("MaterialId", values.MaterialId);
      // actions.setFieldValue("MaterialCode", values.MaterialCode);
      actions.setSubmitting(false);
    },
  });

  const { handleChange, handleBlur, handleSubmit, values, setFieldValue, errors, touched, isValid, resetForm } = formik;

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
      const res = await deliveryOrderService.create(data);
      if (res && isRendered) {
        if (res.HttpResponseCode === 200 && res.Data) {
          SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
          setNewData({ ...res.Data });
          setDialogState({ ...dialogState, isSubmit: false });
          // handleReset();
        } else {
          ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
          setDialogState({ ...dialogState, isSubmit: false });
        }
      }
    } else {
      const res = await deliveryOrderService.modify(data);
      if (res) {
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
      } else {
        ErrorAlert(intl.formatMessage({ id: 'general.system_error' }));
        setDialogState({ ...dialogState, isSubmit: false });
      }
    }
  };

  const getPoMasterArr = async () => {
    return await deliveryOrderService.getPoMasterArr();
  };

  const getMaterialArr = async () => {
    return await deliveryOrderService.getMaterialArr(values);
  };

  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);
    readXlsxFile(event.target.files[0]).then(function (data) {
      setDataReadFile(data);
    });
  };

  const schema = {
    PLAN: {
      prop: 'FPoMasterCode',
      type: String,
      required: false,
    },
    YEAR: {
      prop: 'Year',
      type: Number,
      required: true,
    },
    WEEK: {
      prop: 'Week',
      type: Number,
      required: true,
    },
    CODE: {
      prop: 'MaterialCode',
      type: String,
      required: true,
    },
    // 'DO CODE': {
    //   prop: 'DOCode',
    //   type: String,
    //   required: false,
    // },
    'ETD LOAD TIME': {
      prop: 'ETDLoad',
      type: String,
      required: true,
    },
    'DELIVERY TIME': {
      prop: 'DeliveryTime',
      type: String,
      required: true,
    },
    'ORDER QTY': {
      prop: 'OrderQty',
      required: true,
      type: Number,
    },
    'PACKING NOTE': {
      prop: 'PackingNote',
      type: String,
    },
    DOCK: {
      prop: 'Dock',
      type: String,
    },
    TRUCK: {
      prop: 'Truck',
      type: String,
    },
    'INVOICE NO': {
      prop: 'InvoiceNo',
      type: String,
    },
    NOTE: {
      prop: 'Remark',
      type: String,
    },
  };

  const handleSubmitFile = async (rows) => {
    const res = await deliveryOrderService.createByExcel(rows);
    if (res) {
      setExcelHistory([]);

      if (res.ResponseMessage !== '') {
        fetchData();
        setExcelHistory(res.ResponseMessage.split(','));
        // SuccessAlert(intl.formatMessage({ id: 'general.success' }));
      } else {
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
    document.getElementById('excelinput').text = '';

    setSelectedFile(null);
    refFile.current.value = '';
    refFile.current.text = '';
    setDataReadFile([]);
    setDialogState({ ...dialogState, isSubmit: false });
  };

  return (
    <React.Fragment>
      <MuiDialog
        maxWidth="md"
        title={intl.formatMessage({
          id: mode == CREATE_ACTION ? 'general.create' : 'general.modify',
        })}
        isOpen={isOpen}
        disabledCloseBtn={dialogState.isSubmit}
        disable_animate={300}
        onClose={handleCloseDialog}
      >
        <TabContext value={tab ?? 'tab1'}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList onChange={handleChangeTab}>
              <Tab label="Single" value="tab1" />
              {mode === CREATE_ACTION && <Tab label="Excel" value="tab2" />}
            </TabList>
          </Box>
          <TabPanel value="tab1" sx={{ p: 0, pt: 2 }}>
            <form onSubmit={handleSubmit}>
              <Grid container rowSpacing={2.5} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <MuiAutocomplete
                        label={intl.formatMessage({ id: 'delivery_order.FPoMasterCode' })}
                        fetchDataFunc={getPoMasterArr}
                        displayValue="FPoMasterId"
                        displayLabel="FPoMasterCode"
                        value={
                          values.FPoMasterId !== 0
                            ? {
                                FPoMasterId: values.FPoMasterId,
                                FPoMasterCode: values.FPoMasterCode,
                              }
                            : null
                        }
                        onChange={(e, value) => {
                          setFieldValue('FPoMasterId', value?.FPoMasterId || 0);
                          setFieldValue('FPoMasterCode', value?.FPoMasterCode || '');
                          setFieldValue('MaterialId', 0);
                          setFieldValue('MaterialBuyerCode', '');
                        }}
                        error={touched.FPoMasterId && Boolean(errors.FPoMasterId)}
                        helperText={touched.FPoMasterId && errors.FPoMasterId}
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <MuiTextField
                        label={intl.formatMessage({ id: 'delivery_order.Year' })}
                        type="number"
                        name="Year"
                        value={values.Year}
                        onChange={(e, value) => {
                          setFieldValue('Year', e.target.value);
                          setFieldValue('MaterialId', 0);
                          setFieldValue('MaterialBuyerCode', '');
                        }}
                        // error={touched.Year && Boolean(errors.Year)}
                        // helperText={touched.Year && errors.Year}
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <MuiTextField
                        label={intl.formatMessage({ id: 'delivery_order.Week' })}
                        type="number"
                        name="Week"
                        value={values.Week}
                        onChange={(e, value) => {
                          setFieldValue('Week', e.target.value);
                          setFieldValue('MaterialId', 0);
                          setFieldValue('MaterialBuyerCode', '');
                        }}
                        // error={touched.Week && Boolean(errors.Week)}
                        // helperText={touched.Week && errors.Week}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs>
                      <MuiAutocomplete
                        label={intl.formatMessage({
                          id: 'delivery_order.MaterialCode',
                        })}
                        fetchDataFunc={getMaterialArr}
                        displayValue="FPOId"
                        displayLabel="MaterialBuyerCode"
                        value={
                          values.FPOId !== 0
                            ? {
                                FPOId: values.FPOId,
                                MaterialBuyerCode: values.MaterialBuyerCode,
                              }
                            : null
                        }
                        onChange={(e, value) => {
                          setFieldValue('FPOId', value?.FPOId || 0);
                          setFieldValue('MaterialBuyerCode', value?.MaterialBuyerCode || '');
                        }}
                        error={touched.FPOId && Boolean(errors.FPOId)}
                        helperText={touched.FPOId && errors.FPOId}
                      />
                    </Grid>
                    {/* <Grid item xs>
                      <MuiTextField
                        required
                        disabled={dialogState.isSubmit}
                        label={intl.formatMessage({
                          id: 'delivery_order.DoCode',
                        })}
                        name="DoCode"
                        value={values.DoCode}
                        onChange={handleChange}
                        error={touched.DoCode && Boolean(errors.DoCode)}
                        helperText={touched.DoCode && errors.DoCode}
                      />
                    </Grid> */}
                    <Grid item xs>
                      <MuiTextField
                        required
                        type="number"
                        disabled={dialogState.isSubmit}
                        label={intl.formatMessage({
                          id: 'delivery_order.OrderQty',
                        })}
                        name="OrderQty"
                        value={values.OrderQty}
                        onChange={handleChange}
                        error={touched.OrderQty && Boolean(errors.OrderQty)}
                        helperText={touched.OrderQty && errors.OrderQty}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs>
                      <MuiDateTimeField
                        required
                        disabled={dialogState.isSubmit}
                        label={intl.formatMessage({
                          id: 'delivery_order.ETDLoad',
                        })}
                        value={values.ETDLoad ?? null}
                        onChange={(e) => setFieldValue('ETDLoad', e)}
                        error={touched.ETDLoad && Boolean(errors.ETDLoad)}
                        helperText={touched.ETDLoad && errors.ETDLoad}
                      />
                    </Grid>
                    <Grid item xs>
                      <MuiDateTimeField
                        required
                        disabled={dialogState.isSubmit}
                        label={intl.formatMessage({
                          id: 'delivery_order.DeliveryTime',
                        })}
                        value={values.DeliveryTime ?? null}
                        onChange={(e) => setFieldValue('DeliveryTime', e)}
                        error={touched.DeliveryTime && Boolean(errors.DeliveryTime)}
                        helperText={touched.DeliveryTime && errors.DeliveryTime}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs>
                      <MuiTextField
                        name="PackingNote"
                        disabled={dialogState.isSubmit}
                        value={values.PackingNote}
                        onChange={handleChange}
                        label={intl.formatMessage({
                          id: 'delivery_order.PackingNote',
                        })}
                      />
                    </Grid>
                    <Grid item xs>
                      <MuiTextField
                        name="Dock"
                        disabled={dialogState.isSubmit}
                        value={values.Dock}
                        onChange={handleChange}
                        label={intl.formatMessage({
                          id: 'delivery_order.Dock',
                        })}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs>
                      <MuiTextField
                        name="Truck"
                        disabled={dialogState.isSubmit}
                        value={values.Truck}
                        onChange={handleChange}
                        label={intl.formatMessage({
                          id: 'delivery_order.Truck',
                        })}
                      />
                    </Grid>
                    <Grid item xs>
                      <MuiTextField
                        name="InvoiceNo"
                        disabled={dialogState.isSubmit}
                        value={values.InvoiceNo}
                        onChange={handleChange}
                        label={intl.formatMessage({
                          id: 'delivery_order.InvoiceNo',
                        })}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs>
                      <MuiTextField
                        name="Remark"
                        disabled={dialogState.isSubmit}
                        value={values.Remark}
                        onChange={handleChange}
                        label={intl.formatMessage({
                          id: 'delivery_order.Remark',
                        })}
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

          {mode === CREATE_ACTION && (
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
                        window.location.href = `${BASE_URL}/TemplateImport/DeliveryOrder.xlsx`;
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
          )}
        </TabContext>
      </MuiDialog>
    </React.Fragment>
  );
};

export default DeliveryOrderDialog;
