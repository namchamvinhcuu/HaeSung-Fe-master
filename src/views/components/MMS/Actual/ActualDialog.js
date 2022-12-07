import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { CombineStateToProps, CombineDispatchToProps } from '@plugins/helperJS';
import { User_Operations } from '@appstate/user';
import { Store } from '@appstate';

import {
  MuiDialog,
  MuiResetButton,
  MuiSubmitButton,
  MuiTextField,
  MuiButton,
  MuiDataGrid,
  MuiAutocomplete,
  MuiSelectField,
} from '@controls';
import { Autocomplete, Badge, Checkbox, FormControlLabel, Grid, TextField } from '@mui/material';
import { useIntl } from 'react-intl';
import * as yup from 'yup';
import { actualService } from '@services';
import { ErrorAlert, SuccessAlert, getCurrentWeek } from '@utils';
import { useFormik } from 'formik';
import moment from 'moment';
import ActualPrintDialog from './ActualPrintDialog';
import { useModal, useModal2 } from '@basesShared';

const ActualDialog = ({ woId, isOpen, onClose, setUpdateData }) => {
  const intl = useIntl();
  let isRendered = useRef(true);
  const { isShowing, toggle } = useModal();
  const [WOInfo, setWOInfo] = useState({ ActualQty: 0, OrderQty: 0, TotalLotQty: 0, Remain: 0, QCMasterId: 0 });
  const [rowSelected, setRowSelected] = useState([]);
  const [listData, setListData] = useState([]);
  const [dialogState, setDialogState] = useState({ isSubmit: false });
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
    Qty: 12,
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
      let Remain = res.Data.OrderQty - res.Data.TotalLotQty;
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

  const handlePrint = () => {
    let data = [];
    for (let i = 0; i < rowSelected.length; i++) {
      var item = state.data.filter((x) => x.Id == rowSelected[i]);
      data.push(item[0]);
    }
    setListData(data);
    toggle();
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

  return (
    <React.Fragment>
      <MuiDialog
        maxWidth="lg"
        title={intl.formatMessage({ id: 'general.create' })}
        isOpen={isOpen}
        disabledCloseBtn={dialogState.isSubmit}
        disable_animate={300}
        onClose={handleCloseDialog}
      >
        <form onSubmit={handleSubmit}>
          <Grid container rowSpacing={2.5} columnSpacing={{ xs: 1, sm: 2, md: 3 }} alignItems="width-end">
            <Grid item container spacing={2} xs={12}>
              <Grid item xs={3}>
                <MuiTextField
                  autoFocus
                  required
                  disabled={state.status ? state.status : dialogState.isSubmit}
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
                  disabled={state.status ? state.status : dialogState.isSubmit}
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
              <MuiSubmitButton text="create" loading={dialogState.isSubmit} disabled={state.status} />
              <MuiResetButton onClick={handleReset} disabled={dialogState.isSubmit} />
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
              <MuiSubmitButton text="save" loading={dialogState.isSubmit} disabled={!state.status} />
              <Badge badgeContent={rowSelected.length} color="warning">
                <MuiButton
                  text="print"
                  disabled={rowSelected.length == 0 ? true : false}
                  onClick={() => handlePrint()}
                />
              </Badge>
            </Grid>
            <Grid item xs={12}>
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
                    label={intl.formatMessage({ id: 'actual.TotalLotQty' })}
                    value={WOInfo.TotalLotQty}
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
        </form>
      </MuiDialog>
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
