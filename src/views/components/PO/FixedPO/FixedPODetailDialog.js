import React, { useEffect, useRef, useState } from 'react'
import { MuiDialog, MuiResetButton, MuiSubmitButton, MuiDateField, MuiSelectField } from '@controls'
import { Checkbox, FormControlLabel, Grid, TextField } from '@mui/material'
import { useIntl } from 'react-intl'
import * as yup from 'yup'
import { purchaseOrderService } from '@services'
import { ErrorAlert, SuccessAlert, WarningAlert } from '@utils'
import { CREATE_ACTION, UPDATE_ACTION } from '@constants/ConfigConstants';
import { useFormik } from 'formik'

const FixedPODetailDialog = ({ PoId, initModal, isOpen, onClose, setNewData, setUpdateData, mode, updateDataPO, setUpdateDataPO }) => {
  const intl = useIntl();
  const [dialogState, setDialogState] = useState({ isSubmit: false });
  const defaultValue = { PoId: null, MaterialId: null, Qty: '', Description: '', DeliveryDate: null, DueDate: null };
  const [MaterialList, setMaterialList] = useState([]);

  const schema = yup.object().shape({
    MaterialId: yup.number().nullable().required(intl.formatMessage({ id: 'general.field_required' })),
    Qty: yup.number().nullable().required(intl.formatMessage({ id: 'general.field_required' }))
      .moreThan(0, intl.formatMessage({ id: 'purchase_order.Qty_min' }))
      .typeError(intl.formatMessage({ id: 'general.field_invalid' })),
    DeliveryDate: yup.date().nullable().required(intl.formatMessage({ id: 'general.field_required' }))
      .typeError(intl.formatMessage({ id: 'general.field_invalid' })),
    DueDate: yup.date().nullable().required(intl.formatMessage({ id: 'general.field_required' }))
      .typeError(intl.formatMessage({ id: 'general.field_invalid' }))
  });

  const formik = useFormik({
    validationSchema: schema,
    initialValues: mode == CREATE_ACTION ? defaultValue : initModal,
    enableReinitialize: true,
    onSubmit: async values => onSubmit(values)
  });

  const { handleChange, handleBlur, handleSubmit, values, setFieldValue, errors, touched, isValid, resetForm } = formik;

  useEffect(() => {
    if (PoId)
      getMaterial(PoId, mode);
  }, [PoId, mode])

  const handleReset = () => {
    resetForm();
  }

  const handleCloseDialog = () => {
    resetForm();
    onClose();
  }

  const handleChangeDate = (date, e) => {
    let x = new Date(e);
    let y = new Date();

    if (date === "DeliveryDate") {
      if (values.DueDate != null) {
        y = new Date(values.DueDate);
        if (+x >= +y) {
          e = values.DueDate;
          WarningAlert(intl.formatMessage({ id: "purchase_order.DeliveryDate_warning" }));
        }
      }
      setFieldValue(date, e)
    }
    else {
      if (values.DeliveryDate != null) {
        y = new Date(values.DeliveryDate);
        if (+x < +y) {
          e = values.DeliveryDate;
          WarningAlert(intl.formatMessage({ id: "purchase_order.DueDate_warning" }));
        }
      }
      setFieldValue(date, e)
    }
  };

  const onSubmit = async (data) => {
    setDialogState({ ...dialogState, isSubmit: true });

    if (mode == CREATE_ACTION) {
      const res = await purchaseOrderService.createPODetail({ ...data, PoId: PoId });
      if (res.HttpResponseCode === 200 && res.Data) {
        SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }))
        setNewData({ ...res.Data });
        setDialogState({ ...dialogState, isSubmit: false });
        //Update qty Po
        let TotalQtyNew = updateDataPO.TotalQty + data.Qty
        setUpdateDataPO({ ...updateDataPO, TotalQty: TotalQtyNew });
        handleReset();

      }
      else {
        ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }))
        setDialogState({ ...dialogState, isSubmit: false });
      }
    }
    else {
      const res = await purchaseOrderService.modifyPODetail(data);
      if (res.HttpResponseCode === 200) {
        SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }))
        setUpdateData({ ...res.Data });
        setDialogState({ ...dialogState, isSubmit: false });
        //Update qty Po
        let TotalQtyNew = updateDataPO.TotalQty - initModal.Qty + data.Qty
        setUpdateDataPO({ ...updateDataPO, TotalQty: TotalQtyNew });

        handleReset();
        handleCloseDialog();

      }
      else {
        ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }))
        setDialogState({ ...dialogState, isSubmit: false });
      }
    }
  };

  const getMaterial = async (id, mode) => {
    const res = await purchaseOrderService.getMaterial(id);
    if (res.HttpResponseCode === 200 && res.Data) {
      if (mode == UPDATE_ACTION) {
        let a = [...res.Data, { MaterialId: initModal.MaterialId, MaterialCode: initModal.MaterialCode }];
        setMaterialList(a);
        console.log(MaterialList);
      }
      else
        setMaterialList([...res.Data]);
    }
  }

  return (
    <MuiDialog
      maxWidth='sm'
      title={intl.formatMessage({ id: mode == CREATE_ACTION ? 'general.create' : 'general.modify' })}
      isOpen={isOpen}
      disabledCloseBtn={dialogState.isSubmit}
      disable_animate={300}
      onClose={handleCloseDialog}
    >
      <form onSubmit={handleSubmit} >
        <Grid container rowSpacing={2.5} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          <Grid item xs={12}>
            <MuiSelectField
              required
              value={values.MaterialId ? { MaterialId: values.MaterialId, MaterialCode: values.MaterialCode } : null}
              disabled={dialogState.isSubmit}
              label={intl.formatMessage({ id: 'purchase_order.MaterialId' })}
              options={MaterialList}
              displayLabel="MaterialCode"
              displayValue="MaterialId"
              onChange={(e, value) => {
                setFieldValue("MaterialCode", value?.MaterialCode || '');
                setFieldValue("MaterialId", value?.MaterialId || '');
              }}
              error={touched.MaterialId && Boolean(errors.MaterialId)}
              helperText={touched.MaterialId && errors.MaterialId}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size='small'
              name='Description'
              disabled={dialogState.isSubmit}
              value={values.Description}
              onChange={handleChange}
              label={intl.formatMessage({ id: 'purchase_order.Description' })}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type='number'
              size='small'
              name='Qty'
              disabled={dialogState.isSubmit}
              value={values.Qty}
              onChange={handleChange}
              label={intl.formatMessage({ id: 'purchase_order.Qty' }) + ' *'}
              error={touched.Qty && Boolean(errors.Qty)}
              helperText={touched.Qty && errors.Qty}
            />
          </Grid>
          <Grid item xs={12}>
            <MuiDateField
              required
              disabled={dialogState.isSubmit}
              label={intl.formatMessage({ id: 'purchase_order.DeliveryDate' })}
              value={values.DeliveryDate ?? null}
              onChange={(e) => handleChangeDate("DeliveryDate", e)}
              error={touched.DeliveryDate && Boolean(errors.DeliveryDate)}
              helperText={touched.DeliveryDate && errors.DeliveryDate}
            />
          </Grid>
          <Grid item xs={12}>
            <MuiDateField
              required
              disabled={dialogState.isSubmit}
              label={intl.formatMessage({ id: 'purchase_order.DueDate' })}
              value={values.DueDate ?? null}
              onChange={(e) => handleChangeDate("DueDate", e)}
              error={touched.DueDate && Boolean(errors.DueDate)}
              helperText={touched.DueDate && errors.DueDate}
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
  )
}

export default FixedPODetailDialog