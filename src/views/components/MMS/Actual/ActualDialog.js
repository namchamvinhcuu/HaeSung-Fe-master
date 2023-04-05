import { Store } from '@appstate';
import { User_Operations } from '@appstate/user';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useModal, useModal2 } from '@basesShared';
import {
  MuiAutocomplete,
  MuiButton,
  MuiDataGrid,
  MuiDialog,
  MuiResetButton,
  MuiSelectField,
  MuiSubmitButton,
  MuiTextField,
} from '@controls';
import { Badge, Grid } from '@mui/material';
import { actualService, eslService } from '@services';
import { ErrorAlert, SuccessAlert, delayDuration } from '@utils';
import { useFormik } from 'formik';
import moment from 'moment';
import { useIntl } from 'react-intl';
import * as yup from 'yup';
import ActualPrintDialog from './ActualPrintDialog';
import ActualPrint from './ActualPrint';
import ReactDOMServer from 'react-dom/server';

import ActualScanBarcode from './ActualScanBarcode';

const ActualDialog = ({ woId, isOpen, onClose, setUpdateData }) => {
  const intl = useIntl();
  let isRendered = useRef(true);

  const { isShowing, toggle } = useModal();
  const { isShowing2, toggle2 } = useModal2();

  const [WOInfo, setWOInfo] = useState({ ActualQty: 0, OrderQty: 0, TotalLotQty: 0, Remain: 0, QCMasterId: 0 });
  const [rowSelected, setRowSelected] = useState([]);
  const [listData, setListData] = useState([]);
  const [dialogState, setDialogState] = useState({ isSubmit: false });
  const eslInputRef = useRef(null);
  const [state, setState] = useState({
    isLoading: false,
    status: false,
    dataDemo: [],
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 7,
    WoId: woId,
  });

  const defaultValue = {
    WoId: woId,
    Qty: 0,
    LotNumber: 1,
    LotSerial: '',
    QCResult: 'OK',
    QCId: [],
  };

  const QCResultOption = [{ QCResult: 'OK' }, { QCResult: 'NG' }];

  const schema = yup.object().shape({
    Qty: yup
      .number()
      .nullable()
      .moreThan(0, intl.formatMessage({ id: 'general.field_min' }, { min: 1 })),
    LotNumber: yup
      .number()
      .nullable()
      .moreThan(0, intl.formatMessage({ id: 'general.field_min' }, { min: 1 }))
      .max(5, intl.formatMessage({ id: 'general.field_max' }, { max: 5 })),
    QCResult: yup
      .string()
      .nullable()
      .required(intl.formatMessage({ id: 'general.field_required' })),
    QCId: yup
      .array()
      .nullable()
      .when('QCResult', (QCResult) => {
        if (QCResult == 'NG') return yup.array().min(1, intl.formatMessage({ id: 'general.field_required' }));
      }),
  });

  const demoColumns = [
    {
      field: 'id',
      headerName: '',
      flex: 0.1,
      align: 'center',
      filterable: false,
      renderCell: (index) => index.api.getRowIndex(index.row.Id) + 1 + (state.page - 1) * state.pageSize,
    },
    { field: 'Id', hide: true },
    { field: 'MaterialCode', headerName: intl.formatMessage({ id: 'actual.MaterialId' }), flex: 0.5 },
    {
      field: 'QCResult',
      headerName: intl.formatMessage({ id: 'actual.QCResult' }),
      flex: 0.4,
      valueFormatter: (params) => (params?.value ? 'OK' : 'NG'),
    },
    { field: 'Qty', headerName: intl.formatMessage({ id: 'actual.Qty' }), flex: 0.4 },
    { field: 'QCCode', headerName: intl.formatMessage({ id: 'actual.Qc' }), flex: 0.5 },
  ];

  const columns = [
    {
      field: 'id',
      headerName: '',
      flex: 0.1,
      align: 'center',
      filterable: false,
      renderCell: (index) => index.api.getRowIndex(index.row.Id) + 1 + (state.page - 1) * state.pageSize,
    },
    { field: 'Id', hide: true },
    { field: 'LotSerial', headerName: intl.formatMessage({ id: 'actual.LotSerial' }), flex: 0.5 },
    { field: 'MaterialCode', headerName: intl.formatMessage({ id: 'actual.MaterialId' }), flex: 0.5 },
    {
      field: 'QCResult',
      headerName: intl.formatMessage({ id: 'actual.QCResult' }),
      flex: 0.3,
      valueFormatter: (params) => (params?.value ? 'OK' : 'NG'),
    },
    { field: 'Qty', headerName: intl.formatMessage({ id: 'actual.Qty' }), flex: 0.3 },
    { field: 'QCCode', headerName: intl.formatMessage({ id: 'actual.Qc' }), flex: 0.4 },
    { field: 'createdName', headerName: intl.formatMessage({ id: 'general.createdName' }), width: 120 },
    {
      field: 'createdDate',
      headerName: intl.formatMessage({ id: 'general.createdDate' }),
      width: 150,
      valueFormatter: (params) =>
        params?.value ? moment(params?.value).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss') : null,
    },
  ];

  const formik = useFormik({
    validationSchema: schema,
    initialValues: defaultValue,
    enableReinitialize: true,
    onSubmit: async (values, actions) => {
      await onSubmit(values);
    },
  });

  const { handleChange, handleBlur, handleSubmit, values, setFieldValue, errors, touched, isValid, resetForm } = formik;

  useEffect(() => {
    if (isOpen) {
      fetchData(woId);
      getWoInfo(woId, false);
    }
    return () => {
      isRendered = false;
    };
  }, [isOpen]);

  async function fetchData(woId) {
    setState({ ...state, isLoading: true });
    const params = {
      WoId: woId,
    };
    const res = await actualService.getByWo(params);
    if (res && res.Data && isRendered)
      setState({
        ...state,
        data: res.Data ?? [],
        dataDemo: [],
        status: false,
        totalRow: res.TotalRow,
        isLoading: false,
      });
  }

  async function getWoInfo(woId, isSubmit) {
    const res = await actualService.getWoInfo({ WoId: woId });
    if (res && res.Data && isRendered) {
      let Remain = res.Data.OrderQty - res.Data.ActualQty;
      setWOInfo({ ...res.Data, Remain: Remain < 0 ? 0 : Remain });
      if (isSubmit) setUpdateData(res.Data);
    }
  }

  const handleReset = () => {
    setState({ ...state, dataDemo: [], status: false });
    resetForm();
  };

  const handleCloseDialog = () => {
    resetForm();
    setRowSelected([]);
    setListData([]);
    onClose();
  };

  const handlePrint = async () => {
    let data = [];
    for (let i = 0; i < rowSelected.length; i++) {
      var item = state.data.filter((x) => x.Id == rowSelected[i]);
      data.push(item[0]);
    }
    setListData(data);

    const newWindow = window.open('', '', '');
    const htmlContent = ReactDOMServer.renderToString(<ActualPrint listData={data} />);
    newWindow.document.write(htmlContent);
    newWindow.document.close();
    // toggle();
  };

  const handleDataDemo = () => {
    let data = [];
    let QcName = '';
    if (values.QCId) {
      for (let i = 0; i < values.QCId.length; i++) {
        QcName += values.QCId[i].QCCode;
        if (i != values.QCId.length - 1) QcName += ', ';
      }
    }

    for (let i = 0; i < values.LotNumber; i++) {
      data.push({
        Id: i,
        MaterialCode: WOInfo.MaterialCode,
        Qty: values.Qty,
        QCResult: values.QCResult == 'OK' ? true : false,
        QCCode: QcName,
      });
    }
    setState({ ...state, dataDemo: data, status: true });
  };

  const onSubmit = async (data) => {
    setDialogState({ ...dialogState, isSubmit: true });
    if (!state.status) {
      handleDataDemo();
    } else {
      const res = await actualService.createByWo(data);
      if (res && isRendered) {
        if (res.HttpResponseCode === 200) {
          SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
          fetchData(woId);
          getWoInfo(woId, true);
        } else {
          ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
          handleReset();
        }
      } else {
        ErrorAlert(intl.formatMessage({ id: 'general.system_error' }));
      }
    }
    setDialogState({ ...dialogState, isSubmit: false });
  };

  const keyPress = async (e) => {
    if (e.key === 'Enter') {
      let inputVal = '';

      if (eslInputRef.current.value) {
        inputVal = eslInputRef.current.value.trim().toUpperCase();
      }
      await handleScanESLCode(inputVal);
    }
  };

  const handleScanESLCode = async (inputValue) => {
    if (!inputValue || inputValue.length !== 12) {
      ErrorAlert(intl.formatMessage({ id: 'esl.tag_unregistrated' }));
      eslInputRef.current.value = '';
    } else {
      const getRegisteredESLTag = await eslService.getRegisteredESLTagByCode(inputValue);

      if (getRegisteredESLTag.status !== 200) {
        ErrorAlert(intl.formatMessage({ id: 'esl.tag_unregistrated' }));
        eslInputRef.current.value = '';
        return;
      }

      let lotDataArr = [];
      for (let i = 0; i < rowSelected.length; i++) {
        var item = state.data.filter((x) => x.Id == rowSelected[i]);
        lotDataArr.push(item[0]);
      }

      console.log('lotDataArr[0]', lotDataArr[0]);

      // Create/Update ESL
      const createResponse = await eslService.createLotOnESLServer(lotDataArr[0], 'Bin-1');

      if (createResponse.status === 200) {
        await delayDuration(2000);
        const linkResponse = await eslService.linkESLTagWithBin(lotDataArr[0].Id, inputValue);
        if (linkResponse.status === 200) {
          // Update ESL Data
          await delayDuration(1000);
          const updateESLDataRes = await eslService.updateESLDataByLot(lotDataArr[0]);
          console.log(updateESLDataRes);

          if (updateESLDataRes.status === 200) {
            SuccessAlert(intl.formatMessage({ id: 'esl.mapping_success' }));
            eslInputRef.current.value = '';
          } else {
            ErrorAlert(intl.formatMessage({ id: 'esl.mapping_error' }));
          }
        }
      }
    }
  };

  return (
    <React.Fragment>
      <MuiDialog
        maxWidth="xl"
        title={intl.formatMessage({ id: 'general.create' })}
        isOpen={isOpen}
        disabledCloseBtn={dialogState.isSubmit}
        disable_animate={300}
        onClose={handleCloseDialog}
      >
        <form onSubmit={handleSubmit}>
          <Grid container rowSpacing={2.5} columnSpacing={{ xs: 1, sm: 2, md: 3 }} alignItems="flex-end">
            <Grid item container spacing={2} xs={12}>
              <Grid item xs={3}>
                <MuiTextField
                  autoFocus
                  required
                  // disabled={state.status ? state.status : dialogState.isSubmit}
                  disabled={true}
                  label={intl.formatMessage({ id: 'actual.Qty' })}
                  type="number"
                  name="Qty"
                  value={values.Qty ?? ''}
                  onChange={handleChange}
                  error={touched.Qty && Boolean(errors.Qty)}
                  helperText={touched.Qty && errors.Qty}
                />
              </Grid>
              <Grid item xs={3}>
                <MuiTextField
                  required
                  // disabled={state.status ? state.status : dialogState.isSubmit}
                  disabled={true}
                  label={intl.formatMessage({ id: 'actual.LotNumber' })}
                  type="number"
                  name="LotNumber"
                  value={values.LotNumber ?? ''}
                  onChange={handleChange}
                  error={touched.LotNumber && Boolean(errors.LotNumber)}
                  helperText={touched.LotNumber && errors.LotNumber}
                />
              </Grid>
              <Grid item xs={3}>
                <MuiSelectField
                  required
                  value={values.QCResult != '' ? { QCResult: values.QCResult } : null}
                  disabled={state.status ? state.status : dialogState.isSubmit}
                  label={intl.formatMessage({ id: 'actual.QCResult' })}
                  options={QCResultOption}
                  displayLabel="QCResult"
                  displayValue="QCResult"
                  onChange={(e, value) => {
                    setFieldValue('QCId', []);
                    setFieldValue('QCResult', value?.QCResult || '');
                  }}
                  error={touched.QCResult && Boolean(errors.QCResult)}
                  helperText={touched.QCResult && errors.QCResult}
                />
              </Grid>
              <Grid item xs={3}>
                <MuiAutocomplete
                  multiple={true}
                  value={values.QCId ? values.QCId : []}
                  disabled={state.status ? state.status : values.QCResult == 'OK' ? true : dialogState.isSubmit}
                  label={intl.formatMessage({ id: 'actual.Qc' })}
                  fetchDataFunc={() => actualService.getQcDetail({ QCMasterId: WOInfo.QCMasterId })}
                  displayLabel="QCCode"
                  displayValue="QCId"
                  onChange={(e, value) => setFieldValue('QCId', value || [])}
                  error={touched.QCId && Boolean(errors.QCId)}
                  helperText={touched.QCId && errors.QCId}
                />
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} alignItems="flex-end">
                <Grid item xs={4}>
                  <MuiButton text="scan" onClick={() => toggle2()} sx={{ whiteSpace: 'nowrap' }} />
                </Grid>
                <Grid item>
                  <MuiSubmitButton text="create" loading={dialogState.isSubmit} disabled={state.status} />
                  <MuiResetButton onClick={handleReset} disabled={dialogState.isSubmit} />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <MuiDataGrid
                showLoading={state.isLoading}
                isPagingServer={true}
                headerHeight={45}
                columns={demoColumns}
                rows={state.dataDemo}
                gridHeight={200}
                page={state.page - 1}
                pageSize={state.pageSize}
                rowCount={state.totalRow}
                getRowId={(rows) => rows.Id}
                hideFooter
              />
            </Grid>
            <Grid item xs={12}>
              <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} alignItems="flex-end">
                <Grid item>
                  <MuiSubmitButton text="save" loading={dialogState.isSubmit} disabled={!state.status} />
                  <Badge badgeContent={rowSelected.length} color="warning">
                    <MuiButton
                      text="print"
                      disabled={rowSelected.length == 0 ? true : false}
                      onClick={() => handlePrint()}
                    />
                  </Badge>
                </Grid>
                <Grid item>
                  <MuiTextField
                    disabled={rowSelected.length !== 1 ?? false}
                    sx={{ width: 300, mr: 1 }}
                    ref={eslInputRef}
                    label={intl.formatMessage({ id: 'MappingBin.ESLCode' })}
                    onChange={(e) => (eslInputRef.current.value = e.target.value)}
                    onKeyDown={keyPress}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </form>
        <Grid container rowSpacing={2.5} columnSpacing={{ xs: 1, sm: 2, md: 3 }} alignItems="width-end">
          <Grid item xs={12} sx={{ mt: 2 }}>
            <MuiDataGrid
              showLoading={state.isLoading}
              isPagingServer={true}
              headerHeight={45}
              columns={columns}
              rows={state.data}
              checkboxSelection
              onSelectionModelChange={(ids) => setRowSelected(ids)}
              gridHeight={200}
              page={state.page - 1}
              pageSize={state.pageSize}
              rowCount={state.totalRow}
              getRowId={(rows) => rows.Id}
              hideFooter
            />
          </Grid>
          <Grid item container spacing={2} alignItems="width-end">
            <Grid item container spacing={2} xs={12}>
              <Grid item xs={4}>
                <MuiTextField
                  disabled={dialogState.isSubmit}
                  label={intl.formatMessage({ id: 'actual.WoOrderQty' })}
                  value={WOInfo.OrderQty}
                />
              </Grid>
              <Grid item xs={4}>
                <MuiTextField
                  disabled={dialogState.isSubmit}
                  label={intl.formatMessage({ id: 'work_order.ActualQty' })}
                  value={WOInfo.ActualQty}
                />
              </Grid>
              <Grid item xs={4}>
                <MuiTextField
                  disabled={dialogState.isSubmit}
                  label={intl.formatMessage({ id: 'actual.Remain' })}
                  value={WOInfo.Remain}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </MuiDialog>

      <ActualScanBarcode openScan={isShowing2} onClose={toggle2} woId={woId} />
      <ActualPrintDialog isOpen={isShowing} onClose={toggle} listData={listData} />
    </React.Fragment>
  );
};

User_Operations.toString = function () {
  return 'User_Operations';
};

const mapStateToProps = (state) => {
  const {
    User_Reducer: { language },
  } = CombineStateToProps(state.AppReducer, [[Store.User_Reducer]]);

  return { language };
};

const mapDispatchToProps = (dispatch) => {
  const {
    User_Operations: { changeLanguage },
  } = CombineDispatchToProps(dispatch, bindActionCreators, [[User_Operations]]);

  return { changeLanguage };
};

export default connect(mapStateToProps, mapDispatchToProps)(ActualDialog);
