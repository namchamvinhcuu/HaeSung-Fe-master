import React, { useEffect, useRef, useState } from 'react'
import { MuiDialog, MuiResetButton, MuiSubmitButton, MuiDateField, MuiSelectField } from '@controls'
import { Checkbox, FormControlLabel, Grid, TextField } from '@mui/material'
import { useIntl } from 'react-intl'
import * as yup from 'yup'
import { bomService } from '@services'
import { ErrorAlert, SuccessAlert } from '@utils'
import { CREATE_ACTION } from '@constants/ConfigConstants';
import { useFormik } from 'formik'

const BOMDialog = ({ initModal, isOpen, onClose, setNewData, setUpdateData, mode, valueOption }) => {
  const intl = useIntl();
  const [checkLV, setCheckLV] = useState(true);
  const [dialogState, setDialogState] = useState({ isSubmit: false });
  const [ParentList, setParentList] = useState([]);
  const [MaterialList, setMaterialList] = useState([]);

  const schema = yup.object().shape({
    BomCode: yup.string().nullable().required(intl.formatMessage({ id: 'general.field_required' })),
    // ProductId: yup.number().nullable().required(intl.formatMessage({ id: 'general.field_required' })),

    // ProductId: yup.number().nullable()
    // .when("menuLevel", (menuLevel) => {
    //     if (parseInt(menuLevel) === 3) {
    //         return yup.string()
    //             .required(intl.formatMessage({ id: 'menu.navigateUrl_required' }))
    //     }
    // }),


  });

  const formik = useFormik({
    validationSchema: schema,
    initialValues: mode == CREATE_ACTION ? defaultValue : initModal,
    enableReinitialize: true,
    onSubmit: async values => onSubmit(values)
  });

  const { handleChange, handleBlur, handleSubmit, values, setFieldValue, errors, touched, isValid, resetForm } = formik;

  useEffect(() => {
    getParent();
    getMaterial();
  }, [])

  useEffect(() => {
    if (mode == CREATE_ACTION) {
      formik.initialValues = defaultValue
    }
    else {
      formik.initialValues = initModal;
    }
  }, [initModal, mode])

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
        handleReset();
        handleCloseDialog();
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

  const getParent = async () => {
    const res = await bomService.getParent();
    if (res.HttpResponseCode === 200 && res.Data) {
      setParentList([...res.Data])
    }
  }

  const getMaterial = async () => {
    const res = await bomService.getMaterial();
    if (res.HttpResponseCode === 200 && res.Data) {
      setMaterialList([...res.Data])
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
            <FormControlLabel sx={{ m: 0 }} control={<Checkbox defaultChecked={checkLV} value={checkLV} onChange={() => setCheckLV(!checkLV)} />} label={intl.formatMessage({ id: 'bom.CheckBomLv1' })} />
          </Grid>
          <Grid item xs={12}>
            <TextField
              autoFocus
              fullWidth
              size='small'
              name='BomCode'
              disabled={dialogState.isSubmit}
              value={values.BomCode}
              onChange={handleChange}
              label={intl.formatMessage({ id: 'bom.BomCode' })}
              error={touched.BomCode && Boolean(errors.BomCode)}
              helperText={touched.BomCode && errors.BomCode}
            />
          </Grid>
          {checkLV ? <Grid item xs={12}>
            <MuiSelectField
              value={values.ProductId ? { ProductId: values.ProductId, ProductCode: values.ProductCode } : null}
              disabled={dialogState.isSubmit}
              label={intl.formatMessage({ id: 'bom.ProductId' })}
              options={valueOption.ProductList}
              displayLabel="ProductCode"
              displayValue="ProductId"
              onChange={(e, value) => {
                setFieldValue("ProductCode", value?.ProductCode || '');
                setFieldValue("ProductId", value?.ProductId || "");
              }}
              defaultValue={mode == CREATE_ACTION ? null : { ProductId: initModal.ProductId, ProductCode: initModal.ProductCode }}
              error={touched.ProductId && Boolean(errors.ProductId)}
              helperText={touched.ProductId && errors.ProductId}
            />
          </Grid> :
            <>
              <Grid item xs={12}>
                <MuiSelectField
                  value={values.ParentId ? { BomId: values.ParentId, BomCode: values.ParentCode } : null}
                  disabled={dialogState.isSubmit}
                  label={intl.formatMessage({ id: 'bom.ParentId' })}
                  options={ParentList}
                  displayLabel="BomCode"
                  displayValue="BomId"
                  displayGroup="BomLevelGroup"
                  onChange={(e, value) => {
                    setFieldValue("ParentCode", value?.BomCode || '');
                    setFieldValue("ParentId", value?.BomId || "");
                  }}
                  //defaultValue={mode == CREATE_ACTION ? null : { ProductId: initModal.ProductId, ProductCode: initModal.ProductCode }}
                  error={touched.ParentId && Boolean(errors.ParentId)}
                  helperText={touched.ParentId && errors.ParentId}
                />
              </Grid>
              <Grid item xs={12}>
                <MuiSelectField
                  value={values.MaterialId ? { MaterialId: values.MaterialId, MaterialCode: values.MaterialCode } : null}
                  disabled={dialogState.isSubmit}
                  label={intl.formatMessage({ id: 'bomDetail.MaterialId' })}
                  options={MaterialList}
                  displayLabel="MaterialCode"
                  displayValue="MaterialId"
                  onChange={(e, value) => {
                    setFieldValue("MaterialCode", value?.MaterialCode || '');
                    setFieldValue("MaterialId", value?.MaterialId || "");
                  }}
                  //defaultValue={mode == CREATE_ACTION ? null : { MaterialId: initModal.MaterialId, MaterialCode: initModal.MaterialCode }}
                  error={touched.MaterialId && Boolean(errors.MaterialId)}
                  helperText={touched.MaterialId && errors.MaterialId}
                />
              </Grid>
            </>
          }
          <Grid item xs={12}>
            <TextField
              fullWidth
              size='small'
              name='Remark'
              disabled={dialogState.isSubmit}
              value={values.Remark}
              onChange={handleChange}
              label={intl.formatMessage({ id: 'bom.Remark' })}
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

const defaultValue = {
  BomCode: '',
  ProductId: null,
  ProductCode: '',
  ParentId: null,
  ParentCode: '',
  MaterialId: null,
  MaterialCode: '',
  Remark: ''
};

export default BOMDialog