import React, { useEffect, useState, useRef } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { CombineStateToProps, CombineDispatchToProps } from "@plugins/helperJS";
import { User_Operations } from "@appstate/user";
import { Store } from "@appstate";

import { MuiDialog, MuiResetButton, MuiSubmitButton, MuiTextField, MuiButton, MuiDataGrid } from "@controls";
import { Badge, Checkbox, FormControlLabel, Grid, TextField } from "@mui/material";
import { useIntl } from "react-intl";
import * as yup from "yup";
import { actualService } from "@services";
import { ErrorAlert, SuccessAlert, getCurrentWeek } from "@utils";
import { useFormik } from "formik";
import moment from "moment";

const ActualDialog = ({ woId, initModal, isOpen, onClose }) => {
  const intl = useIntl();
  let isRendered = useRef(true);
  const [rowSelected, setRowSelected] = useState([]);

  const [dialogState, setDialogState] = useState({ isSubmit: false });

  const [state, setState] = useState({
    isLoading: false,
    status: false,
    dataDemo: [],
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 7,
    WoId: woId
  });

  const defaultValue = {
    WoId: woId,
    Qty: 1,
    LotNumber: 1,
    LotSerial: '',
  };

  const schema = yup.object().shape({
    Qty: yup.number().nullable().moreThan(0, intl.formatMessage({ id: "general.field_min" }, { min: 1 })),
    LotNumber: yup.number().nullable().moreThan(0, intl.formatMessage({ id: "general.field_min" }, { min: 1 })),
  });

  const columns = [
    {
      field: 'id', headerName: '', flex: 0.1, align: 'center',
      filterable: false,
      renderCell: (index) => (index.api.getRowIndex(index.row.Id) + 1) + (state.page - 1) * state.pageSize,
    },
    { field: 'Id', hide: true },
    { field: 'LotCode', headerName: intl.formatMessage({ id: "actual.LotCode" }), flex: 0.8, hide: true },
    { field: 'MaterialCode', headerName: intl.formatMessage({ id: "actual.MaterialId" }), flex: 0.5, },
    { field: 'LotStatus', headerName: intl.formatMessage({ id: "actual.LotStatus" }), flex: 0.3, },
    { field: 'Qty', headerName: intl.formatMessage({ id: "actual.Qty" }), flex: 0.3, },
    { field: "createdName", headerName: intl.formatMessage({ id: "general.createdName" }), width: 120, },
    {
      field: "createdDate", headerName: intl.formatMessage({ id: "general.createdDate" }), width: 150,
      valueFormatter: (params) => params?.value ? moment(params?.value).add(7, "hours").format("YYYY-MM-DD HH:mm:ss") : null
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

  const {
    handleChange,
    handleBlur,
    handleSubmit,
    values,
    setFieldValue,
    errors,
    touched,
    isValid,
    resetForm,
  } = formik;

  useEffect(() => {
    if (isOpen)
      fetchData(woId);
    return () => { isRendered = false; }
  }, [isOpen]);

  async function fetchData(woId) {
    setState({ ...state, isLoading: true });
    const params = {
      WoId: woId
    }
    const res = await actualService.getByWo(params);
    if (res && res.Data && isRendered)
      setState({
        ...state
        , data: res.Data ?? []
        , totalRow: res.TotalRow
        , isLoading: false
      });
  }

  const handleReset = () => {
    setState({ ...state, dataDemo: [], status: false })
    resetForm();
  };
  const handleCloseDialog = () => {
    resetForm();
    onClose();
  };

  const handleDataDemo = () => {
    let data = [];
    for (let i = 0; i < values.LotNumber; i++) {
      data.push({ Id: i, MaterialCode: "BN63-18466A", LotStatus: false, Qty: values.Qty })
    }
    setState({ ...state, dataDemo: data, status: true })
  }

  const onSubmit = async (data) => {
    setDialogState({ ...dialogState, isSubmit: true });

    const res = await actualService.createByWo(data);
    if (res && isRendered) {
      if (res.HttpResponseCode === 200) {
        SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
        setState({ ...state, dataDemo: [], status: false });
        fetchData(woId);
      } else {
        ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
      }
    }
    else {
      ErrorAlert(intl.formatMessage({ id: "general.system_error" }));
    }
    setDialogState({ ...dialogState, isSubmit: false });
  };


  return (
    <React.Fragment>
      <MuiDialog
        maxWidth="lg"
        title={intl.formatMessage({ id: "general.create" })}
        isOpen={isOpen}
        disabledCloseBtn={dialogState.isSubmit}
        disable_animate={300}
        onClose={handleCloseDialog}
      >
        <form onSubmit={handleSubmit}>
          <Grid
            container
            rowSpacing={2.5}
            columnSpacing={{ xs: 1, sm: 2, md: 3 }}
            alignItems="width-end"
          >
            <Grid item container spacing={2} alignItems="width-end">
              <Grid item container spacing={2} xs={9}>
                <Grid item xs={4}>
                  <MuiTextField
                    disabled={dialogState.isSubmit}
                    label={intl.formatMessage({ id: "actual.Qty" })}
                    type="number"
                    name="Qty"
                    value={values.Qty ?? ""}
                    onChange={handleChange}
                    error={touched.Qty && Boolean(errors.Qty)}
                    helperText={touched.Qty && errors.Qty}
                  />
                </Grid>
                <Grid item xs={4}>
                  <MuiTextField
                    disabled={dialogState.isSubmit}
                    label={intl.formatMessage({ id: "actual.LotNumber" })}
                    type="number"
                    name="LotNumber"
                    value={values.LotNumber ?? ""}
                    onChange={handleChange}
                    error={touched.LotNumber && Boolean(errors.LotNumber)}
                    helperText={touched.LotNumber && errors.LotNumber}
                  />
                </Grid>
                <Grid item xs={4}>
                  <MuiTextField
                    disabled={dialogState.isSubmit}
                    label={intl.formatMessage({ id: "actual.LotSerial" })}
                    name="LotSerial"
                    value={values.LotSerial ?? ""}
                    onChange={handleChange}
                    error={touched.LotSerial && Boolean(errors.LotSerial)}
                    helperText={touched.LotSerial && errors.LotSerial}
                  />
                </Grid>
              </Grid>
              <Grid item xs={3} sx={{ paddingTop: '13px !important', textAlign: 'right' }}>
                <MuiButton
                  text="create"
                  color="success"
                  disabled={state.status}
                  onClick={() => handleDataDemo()}
                />
                <MuiResetButton onClick={handleReset} disabled={dialogState.isSubmit} />
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <MuiDataGrid
                showLoading={state.isLoading}
                isPagingServer={true}
                headerHeight={45}
                columns={columns}
                rows={state.dataDemo}
                row={[]}
                gridHeight={200}
                page={state.page - 1}
                pageSize={state.pageSize}
                rowCount={state.totalRow}
                getRowId={(rows) => rows.Id}
              />
            </Grid>
            <Grid item xs={12} >
              <MuiSubmitButton text="save" loading={dialogState.isSubmit} disabled={!state.status} />
              <Badge badgeContent={rowSelected.length} color="warning">
                <MuiButton text="print" sx={{ ml: 0 }} disabled={rowSelected.length == 0 ? true : false} />
              </Badge>
            </Grid>
            <Grid item xs={12}>
              <MuiDataGrid
                showLoading={state.isLoading}
                isPagingServer={true}
                headerHeight={45}
                columns={columns}
                rows={state.data}
                row={[]}
                checkboxSelection
                onSelectionModelChange={(ids) => setRowSelected(ids)}
                gridHeight={200}
                page={state.page - 1}
                pageSize={state.pageSize}
                rowCount={state.totalRow}
                getRowId={(rows) => rows.Id}
              />
            </Grid>
          </Grid>
        </form>
      </MuiDialog>
    </React.Fragment >
  )
}

User_Operations.toString = function () {
  return "User_Operations";
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