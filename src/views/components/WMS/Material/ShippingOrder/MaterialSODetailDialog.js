import React, { useEffect, useState, useRef } from "react";
import {
  MuiDialog,
  MuiSubmitButton,
  MuiResetButton,
  MuiTextField,
  MuiDateField,
  MuiAutocomplete,
  MuiDataGrid
} from "@controls";
import { useIntl } from "react-intl";
import { CREATE_ACTION, UPDATE_ACTION } from "@constants/ConfigConstants";
import { useFormik } from "formik";
import * as yup from "yup";
import { Grid, TextField } from "@mui/material";
import { iqcService } from "@services";
import { materialSOService } from "@services";
import { ErrorAlert, SuccessAlert } from '@utils';
import moment from "moment";

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
  const [selectedRows, setSelectedRows] = useState([]);

  const schema = yup.object().shape({
    MaterialId: yup
      .number()
      .required(intl.formatMessage({ id: "forecast.MaterialId_required" }))
      .min(1, intl.formatMessage({ id: "forecast.MaterialId_required" })),
    SOrderQty: yup.number().nullable().required(intl.formatMessage({ id: "lot.Qty_required" })).min(1, intl.formatMessage({ id: "lot.Qty_bigger_1" })),

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


    if (!selectedRows || !selectedRows.length) {
      ErrorAlert(intl.formatMessage({ id: 'general.one_data_at_least' }));
      return;
    }
    else {
      setDialogState({ ...dialogState, isSubmit: true });
      if (mode == CREATE_ACTION) {

        let LotIds = [];
        for (let i = 0; i < selectedRows.length; i++) {
          LotIds.push(selectedRows[i].Id);
        }

        const dataPush = { ...data, MsoId: MsoId, LotIds: [...LotIds] };

        console.log(dataPush);

        const res = await materialSOService.createMsoDetail(dataPush);
        if (res.HttpResponseCode === 200 && res.Data) {
          SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
          setNewData([...res.Data]);
          setDialogState({ ...dialogState, isSubmit: false });
          handleReset();
        } else {
          ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
          setDialogState({ ...dialogState, isSubmit: false });
        }
      } else {
        const res = await materialSOService.modifyMsoDetail({
          ...data,
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
    }
  };

  const getLots = async (materialId) => {
    setIsLoading(true);
    const res = await materialSOService.getLots(materialId);
    if (res && res.Data) {
      setLotArr([...res.Data]);
    }
    else
      setLotArr([]);

    setIsLoading(false);
  }

  const handleRowSelection = (arrIds) => {
    const rowSelected = lotArr.filter(item => arrIds.includes(item.Id));

    if (rowSelected && rowSelected.length > 0) {
      setSelectedRows([...rowSelected]);
    } else {
      setSelectedRows([]);
    }
  };

  const columns = [
    { field: "Id", headerName: "", hide: true },

    {
      field: "BinCode",
      headerName: intl.formatMessage({ id: "lot.BinCode" }),
      /*flex: 0.7,*/ width: 150,
    },

    {
      field: "LotSerial",
      headerName: intl.formatMessage({ id: "lot.LotSerial" }),
      /*flex: 0.7,*/ width: 120,
    },

    {
      field: "Qty",
      headerName: intl.formatMessage({ id: "lot.Qty" }),
      /*flex: 0.7,*/ width: 200,
    },

    {
      field: "IncomingDate",
      headerName: intl.formatMessage({ id: "lot.IncomingDate" }),
      width: 150,
      valueFormatter: (params) => {
        if (params.value !== null) {
          return moment(params?.value)
            .add(7, "hours")
            .format("YYYY-MM-DD HH:mm:ss");
        }
      },
    },
  ];

  useEffect(() => {
    if (isRendered) {
      setLotArr([]);
    }

    return () => {
      isRendered = false;
    };
  }, [isOpen])

  return (
    <MuiDialog
      maxWidth="md"
      title={intl.formatMessage({
        id: mode == CREATE_ACTION ? "general.create" : "general.modify",
      })}
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
        >
          <Grid item xs={12}>
            <MuiAutocomplete
              label={intl.formatMessage({ id: "forecast.MaterialId" }) + " *"}
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
                setFieldValue("MaterialCode", value?.MaterialCode);
                setFieldValue("MaterialId", value?.MaterialId);
                await getLots(value?.MaterialId ?? 0);
              }}
              error={touched.MaterialId && Boolean(errors.MaterialId)}
              helperText={touched.MaterialId && errors.MaterialId}
              variant="outlined"
              disabled={dialogState.isSubmit}
            />
          </Grid>

          <Grid item xs={12}>
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
          </Grid>

          <Grid item xs={12}>
            <Grid container direction="row-reverse">
              <MuiSubmitButton text="save" loading={dialogState.isSubmit} />
              <MuiResetButton
                onClick={handleReset}
                disabled={dialogState.isSubmit}
              />
            </Grid>
          </Grid>

        </Grid>

        <MuiDataGrid
          showLoading={isLoading}
          // isPagingServer={true}
          headerHeight={45}
          // rowHeight={30}
          // gridHeight={736}
          checkboxSelection
          columns={columns}
          rows={lotArr}
          page={page - 1}
          pageSize={pageSize}
          rowCount={lotArr.length}
          onPageChange={(newPage) => {
            setPage(newPage + 1);
          }}
          getRowId={(rows) => rows.Id}
          onSelectionModelChange={(newSelectedRowId) =>
            handleRowSelection(newSelectedRowId)
          }
          onPageSizeChange={(newPageSize) => {
            setPageSize(newPageSize);
            setPage(1);
          }}
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
      </form>
    </MuiDialog>
  );
};
export default MaterialSODetailDialog;
