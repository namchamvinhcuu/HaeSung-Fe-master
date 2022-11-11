import React, {  useState } from "react";
import {
  MuiDialog,
  MuiResetButton,
  MuiSubmitButton,
  MuiSelectField,
  MuiAutocomplete,
} from "@controls";
import { useIntl } from "react-intl";
import { useFormik } from "formik";
import * as yup from "yup";
import { Autocomplete, Grid, TextField } from "@mui/material";
import { CREATE_ACTION, UPDATE_ACTION } from "@constants/ConfigConstants";
import { iqcService } from "@services";
import { ErrorAlert, SuccessAlert } from "@utils";
import { useEffect } from "react";

const IQCDialog = (props) => {
  const { initModal, isOpen, onClose, setNewData, setUpdateData, mode } = props;
  // const [materialId, setMaterialId] = useState(0);
  // const [qcList, setQCList] = useState([]);
  const [QCResult, setQCResult] = useState("");
  const optionQCResult = [
    { QCResult: "True", QCResultName: "OK" },
    { QCResult: "False", QCResultName: "NG" },
  ];
  const intl = useIntl();
  const [dialogState, setDialogState] = useState({
    isSubmit: false,
  });

  const schema = yup.object().shape({
    MaterialId: yup
      .number()
      .required(intl.formatMessage({ id: "forecast.MaterialId_required" }))
      .min(1, intl.formatMessage({ id: "forecast.MaterialId_required" })),
    Qty: yup.number().nullable().required(intl.formatMessage({ id: "lot.Qty_required" })).min(1, intl.formatMessage({ id: "lot.Qty_bigger_1" })),
    
  });
  const handleReset = () => {
    resetForm();
  };
  const handleCloseDialog = () => {
    setDialogState({
      ...dialogState,
    });
    resetForm();
    onClose();
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
 
  const onSubmit = async (data) => {
    setDialogState({ ...dialogState, isSubmit: true });
    if (mode == CREATE_ACTION) {
      const res = await iqcService.createIQC(data);
      if (res.HttpResponseCode === 200 && res.Data) {
        SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
        setNewData({ ...res.Data });
        setDialogState({ ...dialogState, isSubmit: false });
        handleReset();
      } else {
        ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
        setDialogState({ ...dialogState, isSubmit: false });
      }
    } else {
      const res = await iqcService.modifyIQC({
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
  };
  const getMaterialTypeRaw = async () => {
    const res = await iqcService.getMaterialModelTypeRaw();
    return res;
  };
  useEffect(()=>{
       if(mode===UPDATE_ACTION) {
        getSelectQCByLotId(initModal.Id);
        // setMaterialId(initModal.MaterialId);
      }
      
  },[initModal])
  const getSelectQCByLotId = async (id) => {
    const res = await iqcService.getSelectQCByLotId({LotId:id});
    setFieldValue("QcIDList", res.Data)
    return res;
  };

  return (
    <MuiDialog
      maxWidth="sm"
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
              fetchDataFunc={getMaterialTypeRaw}
              displayLabel="MaterialCode"
              displayValue="MaterialId"
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
              onChange={(e, value) => {
                setFieldValue("MaterialCode", value?.MaterialCode);
                setFieldValue("MaterialId", value?.MaterialId);
                // setMaterialId(value?.MaterialId);
                setFieldValue("QcIDList",  [])
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
              name="Qty"
              disabled={dialogState.isSubmit}
              value={values.Qty}
              onChange={handleChange}
              label="Qty"
              error={touched.Qty && Boolean(errors.Qty)}
              helperText={touched.Qty && errors.Qty}
            />
          </Grid>
          <Grid item xs={12}>
            <MuiSelectField
              required
              value={{
                QCResult: values.QCResult ? "True" : "False",
                QCResultName: values.QCResult ? "OK" : "NG",
              }}
              disabled={dialogState.isSubmit}
              label="QC Result"
              options={optionQCResult}
              displayLabel="QCResultName"
              displayValue="QCResult"
              onChange={(e, item) => {
                setFieldValue(
                  "QCResult",
                  item?.QCResult === "True" ? true : false
                );
                setQCResult( item?.QCResult === "True" ? true : false)
              }}
              error={touched.QCResult && Boolean(errors.QCResult)}
              helperText={touched.QCResult && errors.QCResult}
            />
          </Grid>
         {(QCResult===false || values.QCResult===false) &&<Grid item xs={12}>
                <MuiAutocomplete
                  multiple={true}
                  value={values.QcIDList ? values.QcIDList : []}
                  label={intl.formatMessage({ id: 'actual.Qc' })}
                  fetchDataFunc={() => iqcService.getSelectQC({ MaterialId: values?.MaterialId })}
                  displayLabel="QCCode"
                  displayValue="QcId"
                  onChange={(e, value) =>{setFieldValue("QcIDList", value || [])}}
                  error={touched.QcIDList && Boolean(errors.QcIDList)}
                  helperText={touched.QcIDList && errors.QcIDList}
                />

            </Grid>}
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
      </form>
    </MuiDialog>
  );
};
export default IQCDialog;
