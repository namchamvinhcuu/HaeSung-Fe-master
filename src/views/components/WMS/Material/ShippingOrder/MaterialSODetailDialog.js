import { CREATE_ACTION } from '@constants/ConfigConstants';
import { MuiAutocomplete, MuiDataGrid, MuiDialog, MuiResetButton, MuiSubmitButton } from '@controls';
import { Grid } from '@mui/material';
import { iqcService, materialSOService } from '@services';
import { ErrorAlert, isNumber, SuccessAlert } from '@utils';
import { useFormik } from 'formik';
import _ from 'lodash';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import * as yup from 'yup';

const MaterialSODetailDialog = (props) => {
  const intl = useIntl();
  let isRendered = useRef(true);

  const [dialogState, setDialogState] = useState({
    isSubmit: false,
  });

  const { initModal, isOpen, onClose, setNewData, setUpdateData, mode, MsoId } = props;

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [lotArr, setLotArr] = useState([]);
  const [selectedRow, setSelectedRow] = useState([]);

  const schema = yup.object().shape({
    MaterialId: yup
      .number()
      .required(intl.formatMessage({ id: 'forecast.MaterialId_required' }))
      .min(1, intl.formatMessage({ id: 'forecast.MaterialId_required' })),
    // SOrderQty: yup.number().nullable().required(intl.formatMessage({ id: "lot.Qty_required" })).min(1, intl.formatMessage({ id: "lot.Qty_bigger_1" })),
  });

  const handleReset = () => {
    resetForm();
  };

  const formik = useFormik({
    validationSchema: schema,
    initialValues: initModal,
    enableReinitialize: true,
    onSubmit: async (values) => onSubmit(values),
  });

  const { handleChange, handleBlur, handleSubmit, values, setFieldValue, errors, touched, isValid, resetForm } = formik;

  const handleCloseDialog = () => {
    setDialogState({
      ...dialogState,
    });
    resetForm();
    onClose();
  };

  const getMaterialTypeRawAndSub = async () => {
    const res = await iqcService.getMaterialModelTypeRaw();
    return res;
  };

  const onSubmit = async (data) => {
    let flag = false;
    for (let i = 0; i < lotArr.length; i++) {
      const element = lotArr[i];
      if (element.RequestQty) {
        flag = true;
        break;
      }
    }

    if (!flag) {
      ErrorAlert(intl.formatMessage({ id: 'general.one_data_at_least' }));
      return;
    }

    const dataPost = { MsoId: MsoId, LotDtos: [...lotArr] };

    //setDialogState({ ...dialogState, isSubmit: true });

    const res = await materialSOService.createMsoDetail(dataPost);

    if (res.HttpResponseCode === 200 && res.Data) {
      SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
      setNewData([...res.Data]);
      //setDialogState({ ...dialogState, isSubmit: false });
      handleReset();
    } else {
      ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
      //setDialogState({ ...dialogState, isSubmit: false });
    }

    // if (!selectedRow || !selectedRow.length) {
    //   ErrorAlert(intl.formatMessage({ id: 'general.one_data_at_least' }));
    //   return;
    // }
    // else {
    //   setDialogState({ ...dialogState, isSubmit: true });
    //   if (mode == CREATE_ACTION) {

    //     let LotIds = [];
    //     for (let i = 0; i < selectedRows.length; i++) {
    //       LotIds.push(selectedRows[i].Id);
    //     }

    //     const dataPush = { ...data, MsoId: MsoId, LotIds: [...LotIds] };

    //     console.log(dataPush);

    //     const res = await materialSOService.createMsoDetail(dataPush);
    //     if (res.HttpResponseCode === 200 && res.Data) {
    //       SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
    //       setNewData([...res.Data]);
    //       setDialogState({ ...dialogState, isSubmit: false });
    //       handleReset();
    //     } else {
    //       ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
    //       setDialogState({ ...dialogState, isSubmit: false });
    //     }
    //   }
    //   else {
    //     const res = await materialSOService.modifyMsoDetail({
    //       ...data,
    //     });
    //     if (res.HttpResponseCode === 200) {
    //       SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
    //       setUpdateData({ ...res.Data });
    //       setDialogState({ ...dialogState, isSubmit: false });
    //       handleReset();
    //       handleCloseDialog();
    //     }
    //     else {
    //       ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
    //       setDialogState({ ...dialogState, isSubmit: false });
    //     }
    //   }
    // }
  };

  const getLots = async (materialId) => {
    setIsLoading(true);
    const res = await materialSOService.getLots(materialId);
    if (res && res.Data) {
      setLotArr([...res.Data]);
    } else setLotArr([]);

    setIsLoading(false);
  };

  const handleRowSelection = (arrIds) => {
    // const rowSelected = lotArr.filter(item => arrIds.includes(item.Id));

    // if (rowSelected && rowSelected.length > 0) {
    //   setSelectedRows([...rowSelected]);
    // } else {
    //   setSelectedRows([]);
    // }
    const rowSelected = lotArr.filter((item) => {
      return item.Id === arrIds[0];
    });

    // if (rowSelected && rowSelected.length > 0) {
    //   setSelectedRow({ ...rowSelected[0] });
    // } else {
    //   setSelectedRow({ ...ForecastPODto });
    // }
  };

  const columns = [
    { field: 'Id', headerName: '', hide: true },

    {
      field: 'BinCode',
      headerName: intl.formatMessage({ id: 'lot.BinCode' }),
      /*flex: 0.7,*/ width: 150,
    },

    {
      field: 'LotSerial',
      headerName: intl.formatMessage({ id: 'lot.LotSerial' }),
      /*flex: 0.7,*/ width: 150,
    },

    {
      field: 'Qty',
      headerName: intl.formatMessage({ id: 'lot.Qty' }),
      /*flex: 0.7,*/ width: 150,
    },

    {
      field: 'RequestQty',
      headerName: intl.formatMessage({ id: 'lot.RequestQty' }),
      description: intl.formatMessage({ id: 'material-so-detail.SOrderQty_tip' }),
      /*flex: 0.7,*/ width: 150,
      editable: true,
    },

    {
      field: 'IncomingDate',
      headerName: intl.formatMessage({ id: 'lot.IncomingDate' }),
      width: 150,
      valueFormatter: (params) => {
        if (params.value !== null) {
          return moment(params?.value).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss');
        }
      },
    },
  ];

  const handleRowUpdate = async (newRow) => {
    if (!isNumber(newRow.RequestQty) || newRow.RequestQty < 0) {
      ErrorAlert(intl.formatMessage({ id: 'forecast.OrderQty_required_bigger' }));
      newRow.RequestQty = 0;
      return newRow;
    }
    newRow = { ...newRow, RequestQty: newRow.RequestQty };

    let newArr = [...lotArr];
    const index = _.findIndex(newArr, (o) => {
      return o.Id == newRow.Id;
    });
    if (index !== -1) {
      newArr[index] = newRow;
    }

    setLotArr([...newArr]);

    return newRow;

    // const res = await fixedPOService.modify(newRow);
    // if (res && res.HttpResponseCode === 200 && isRendered) {
    //   SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
    //   setSelectedRow(res.Data);
    //   return res.Data;
    // }
    // else {
    //   ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
    //   return selectedRow;
    // }
  };

  const handleProcessRowUpdateError = React.useCallback((error) => {
    console.log('update error', error);
    ErrorAlert(intl.formatMessage({ id: 'general.system_error' }));
  }, []);

  useEffect(() => {
    if (isRendered) {
      setLotArr([]);
    }

    return () => {
      isRendered = false;
    };
  }, [isOpen]);

  return (
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
      <form onSubmit={handleSubmit}>
        <Grid container rowSpacing={2.5} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          <Grid item xs={12}>
            <MuiAutocomplete
              label={intl.formatMessage({ id: 'forecast.MaterialId' }) + ' *'}
              fetchDataFunc={getMaterialTypeRawAndSub}
              displayLabel="MaterialCode"
              displayValue="MaterialId"
              displayGroup="GroupMaterial"
              defaultValue={
                mode == CREATE_ACTION
                  ? null
                  : {
                      MaterialId: initModal.MaterialId,
                      MaterialCode: initModal.MaterialCode,
                    }
              }
              value={
                values.MaterialId
                  ? {
                      MaterialId: values.MaterialId,
                      MaterialCode: values.MaterialCode,
                    }
                  : null
              }
              onChange={async (e, value) => {
                setFieldValue('MaterialCode', value?.MaterialCode);
                setFieldValue('MaterialId', value?.MaterialId);
                await getLots(value?.MaterialId ?? 0);
              }}
              error={touched.MaterialId && Boolean(errors.MaterialId)}
              helperText={touched.MaterialId && errors.MaterialId}
              variant="outlined"
              disabled={dialogState.isSubmit}
            />
          </Grid>

          {/* <Grid item xs={12}>
            <TextField
              fullWidth
              type="number"
              size="small"
              name="SOrderQty"
              disabled={dialogState.isSubmit}
              value={values.SOrderQty}
              onChange={handleChange}
              label="Oder Qty"
              error={touched.SOrderQty && Boolean(errors.SOrderQty)}
              helperText={touched.SOrderQty && errors.SOrderQty}
            />
          </Grid> */}
          <Grid item xs={12}>
            <MuiDataGrid
              showLoading={isLoading}
              // isPagingServer={true}
              headerHeight={45}
              // rowHeight={30}
              // gridHeight={736}
              // checkboxSelection
              columns={columns}
              rows={lotArr}
              page={page - 1}
              pageSize={pageSize}
              rowCount={lotArr.length}
              onPageChange={(newPage) => {
                setPage(newPage + 1);
              }}
              getRowId={(rows) => rows.Id}
              onSelectionModelChange={(newSelectedRowId) => handleRowSelection(newSelectedRowId)}
              onPageSizeChange={(newPageSize) => {
                setPageSize(newPageSize);
                setPage(1);
              }}
              processRowUpdate={handleRowUpdate}
              onProcessRowUpdateError={handleProcessRowUpdateError}
              experimentalFeatures={{ newEditingApi: true }}
              // initialState={{
              //   aggregation: {
              //     model: {
              //       orderQty: 'sum',
              //     },
              //   },
              // }}
              rowsPerPageOptions={[5, 10, 15]}
              getRowClassName={(params) => {
                // if (_.isEqual(params.row, newData)) {
                //     return `Mui-created`;
                // }
              }}
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
    </MuiDialog>
  );
};
export default MaterialSODetailDialog;
