import React, { useEffect, useState } from 'react'
import { MuiDialog, MuiResetButton, MuiSubmitButton, MuiSelectField } from '@controls'
import { Grid, TextField } from '@mui/material'
import { useIntl } from 'react-intl'
import * as yup from 'yup'
import { bomService } from '@services'
import { ErrorAlert, SuccessAlert } from '@utils'
import { CREATE_ACTION } from '@constants/ConfigConstants';
import { useFormik } from 'formik'

const BOMDetailDialog = ({ initModal, isOpen, onClose, setNewData, setUpdateData, mode, BomId }) => {
  const intl = useIntl();
  const [dialogState, setDialogState] = useState({ isSubmit: false });
  const [MaterialList, setMaterialList] = useState([]);
  const [ParentList, setParentList] = useState([]);
  const defaultValue = { BomId: BomId, MaterialId: null, MaterialCode: '', Amount: '', Remark: '', ParentId: null, ParentCode: '' };

  const schema = yup.object().shape({
    ParentId: yup.number().nullable().required(intl.formatMessage({ id: 'general.field_required' })),
    MaterialId: yup.number().nullable().required(intl.formatMessage({ id: 'general.field_required' })),
    Amount: yup.number().nullable().moreThan(0, intl.formatMessage({ id: 'bom.min_value' })).required(intl.formatMessage({ id: 'general.field_required' })),
  });

  const formik = useFormik({
    validationSchema: schema,
    initialValues: mode == CREATE_ACTION ? defaultValue : initModal,
    enableReinitialize: true,
    onSubmit: async values => onSubmit(values)
  });

  const { handleChange, handleBlur, handleSubmit, values, setFieldValue, errors, touched, isValid, resetForm } = formik;

  //useEffect
  useEffect(() => {
    console.log(initModal)
    if (BomId != null && isOpen) {
      getParent(BomId);
      if (mode == CREATE_ACTION) {
        getMaterial(1);
      }
      else {
        getMaterial(3, initModal.ParentId);
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (mode == CREATE_ACTION) {
      formik.initialValues = defaultValue
    }
    else {
      formik.initialValues = initModal;
    }
  }, [initModal, mode])

  //handle
  const handleReset = () => {
    resetForm();
  }

  const handleCloseDialog = () => {
    resetForm();
    onClose();
  }

  const onSubmit = async (data) => {
    setDialogState({ ...dialogState, isSubmit: true });

    if (mode == CREATE_ACTION) {
      const res = await bomService.createBom(data);
      if (res.HttpResponseCode === 200 && res.Data) {
        SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }))
        setNewData(res.Data);
        setDialogState({ ...dialogState, isSubmit: false });
        setFieldValue("Remark", "");
        setFieldValue("MaterialId", null);
        setFieldValue("MaterialCode", "");
        getParent(BomId);
      }
      else {
        ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }))
        setDialogState({ ...dialogState, isSubmit: false });
      }
    }
    else {
      const res = await bomService.modifyBom(data);
      if (res.HttpResponseCode === 200) {
        SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }))
        setUpdateData(res.Data);
        setDialogState({ ...dialogState, isSubmit: false });
        handleReset();
        handleCloseDialog();
      }
      else {
        ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }))
        setDialogState({ ...dialogState, isSubmit: false });
      }
    }
  };

  const getMaterial = async (id, BomId) => {
    const res = await bomService.getMaterial(id, BomId);
    if (res.Data) {
      setMaterialList([...res.Data])
    }
  }

  const getParent = async (BomId) => {
    const res = await bomService.getParent(BomId);
    if (res.Data) {
      setParentList([...res.Data])
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
            {mode == CREATE_ACTION ? <MuiSelectField
              required
              value={values.ParentId ? { BomId: values.ParentId, BomCode: values.ParentCode } : null}
              disabled={dialogState.isSubmit}
              label={intl.formatMessage({ id: 'bom.ParentId' })}
              options={ParentList}
              displayLabel="BomCode"
              displayValue="BomId"
              displayGroup="BomLevelGroup"
              onChange={(e, value) => {
                if (value?.MaterialType == "BARE MATERIAL")
                  getMaterial(2, BomId);
                else
                  getMaterial(1, BomId);
                setFieldValue("MaterialCode", '');
                setFieldValue("MaterialId", null);
                setFieldValue("ParentCode", value?.BomCode || '');
                setFieldValue("ParentId", value?.BomId || null);
              }}
              error={touched.ParentId && Boolean(errors.ParentId)}
              helperText={touched.ParentId && errors.ParentId}
            /> : <TextField
              fullWidth
              size='small'
              disabled
              value={values.ParentCode}
              label={intl.formatMessage({ id: 'bom.ParentId' })}
            />}
          </Grid>
          <Grid item xs={12}>
            <MuiSelectField
              required
              value={values.MaterialId ? { MaterialId: values.MaterialId, MaterialCode: values.MaterialCode } : null}
              disabled={dialogState.isSubmit}
              label={intl.formatMessage({ id: 'bomDetail.MaterialId' })}
              options={MaterialList}
              displayLabel="MaterialCode"
              displayValue="MaterialId"
              displayGroup="GroupMaterial"
              onChange={(e, value) => {
                setFieldValue("MaterialCode", value?.MaterialCode || '', true);
                setFieldValue("MaterialId", value?.MaterialId || null, true);
              }}
              error={touched.MaterialId && Boolean(errors.MaterialId)}
              helperText={touched.MaterialId && errors.MaterialId}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="number"
              size='small'
              name='Amount'
              disabled={dialogState.isSubmit}
              value={values.Amount}
              onChange={handleChange}
              label={intl.formatMessage({ id: 'bomDetail.Amount' }) + ' *'}
              error={touched.Amount && Boolean(errors.Amount)}
              helperText={touched.Amount && errors.Amount}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size='small'
              name='Remark'
              disabled={dialogState.isSubmit}
              value={values.Remark}
              onChange={handleChange}
              label={intl.formatMessage({ id: 'bomDetail.Remark' })}
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

export default BOMDetailDialog