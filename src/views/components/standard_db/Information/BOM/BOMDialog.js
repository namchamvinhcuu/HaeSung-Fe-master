import React, { useEffect, useRef, useState } from 'react'
import { MuiDialog, MuiResetButton, MuiSubmitButton, MuiDateField, MuiSelectField } from '@controls'
import { Grid, TextField } from '@mui/material'
import { useIntl } from 'react-intl'
import * as yup from 'yup'
import { bomService } from '@services'
import { ErrorAlert, SuccessAlert } from '@utils'
import { CREATE_ACTION, UPDATE_ACTION } from '@constants/ConfigConstants';
import { useFormik } from 'formik'

const BOMDialog = ({ initModal, isOpen, onClose, setNewData, setNewDataChild, setUpdateData, setBomId, mode }) => {
  const intl = useIntl();
  let bomId = null;
  const [checkLV, setCheckLV] = useState(true);
  const [hidecheckLV, setHideCheckLV] = useState(true);
  const [BomCode, setBomCode] = useState("");
  const [MaterialType, setMaterialType] = useState("");
  const [dialogState, setDialogState] = useState({ isSubmit: false });
  const [ParentList, setParentList] = useState([]);
  const [MaterialList, setMaterialList] = useState([]);

  const schema = yup.object().shape({
    MaterialId: yup.number().nullable().required(intl.formatMessage({ id: 'general.field_required' })),
    Amount: yup.number().nullable().moreThan(0, intl.formatMessage({ id: 'bom.min_value' })).required(intl.formatMessage({ id: 'general.field_required' })),
    ParentId: yup.number().nullable().when('parentId', () => {
      if (!checkLV) return yup.string().required(intl.formatMessage({ id: 'general.field_required' }))
    }),
    Version: yup.string().nullable().when('version', () => {
      if (checkLV) return yup.string().required(intl.formatMessage({ id: 'general.field_required' }))
    }),
  });

  const formik = useFormik({
    validationSchema: schema,
    initialValues: mode == CREATE_ACTION ? defaultValue : initModal,
    enableReinitialize: true,
    onSubmit: async values => onSubmit(values)
  });

  const { handleChange, handleBlur, handleSubmit, values, setFieldValue, errors, touched, isValid, resetForm, setValues } = formik;

  useEffect(() => {
    getParent(0);
    getMaterial(0);
  }, [])

  useEffect(() => {
    if (MaterialType == "BARE MATERIAL")
      getMaterial(2, bomId);
    else
      getMaterial(1, bomId);
  }, [MaterialType])

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
    setCheckLV(true);
    setHideCheckLV(true);
    getMaterial(0);
    resetForm();
    setBomCode("");
    onClose();
  }

  const onSubmit = async (data) => {
    setDialogState({ ...dialogState, isSubmit: true });

    if (mode == CREATE_ACTION) {
      const res = await bomService.createBom(data);
      if (res.HttpResponseCode === 200 && res.Data) {
        SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }))
        bomId = res.Data.BomId;
        if (hidecheckLV) {
          handleReset();
          setFieldValue("ParentCode", res.Data.MaterialType, true);
          setFieldValue("ParentId", res.Data.BomId, true);
          setFieldValue("Amount", '', true);
          setBomId(res.Data.BomId);
          setBomCode(res.Data.BomCode);
          setNewData(res.Data);
        }
        else {
          setFieldValue("Remark", "", true);
          setFieldValue("Amount", "", true);
          setFieldValue("MaterialCode", "", true);
          setFieldValue("MaterialId", null, true);
          setNewDataChild(res.Data);
        }
        if (MaterialType == "BARE MATERIAL")
          getMaterial(2, bomId);
        else
          getMaterial(1, bomId);
        setDialogState({ ...dialogState, isSubmit: false });
        setCheckLV(false);
        setHideCheckLV(false);
        getParent(res.Data.BomId);
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

  const getParent = async (BomId) => {
    const res = await bomService.getParent(BomId);
    if (res.Data) {
      setParentList([...res.Data])
    }
  }

  const getMaterial = async (id, BomId) => {
    const res = await bomService.getMaterial(id, BomId);
    if (res.Data) {
      setMaterialList([...res.Data])
    }
  }

  return (
    <MuiDialog
      maxWidth='sm'
      title={intl.formatMessage({ id: mode == CREATE_ACTION ? checkLV ? 'bom.CreateLv1' : 'bom.CreateLv2' : 'general.modify' }) + BomCode}
      isOpen={isOpen}
      disabledCloseBtn={dialogState.isSubmit}
      disable_animate={300}
      onClose={handleCloseDialog}
    >
      <form onSubmit={handleSubmit} >
        <Grid container rowSpacing={2.5} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          {checkLV ? <Grid item xs={12}>
            {mode == CREATE_ACTION ? <MuiSelectField
              required
              value={values.MaterialId ? { MaterialId: values.MaterialId, MaterialCode: values.MaterialCode } : null}
              disabled={mode == UPDATE_ACTION ? true : dialogState.isSubmit}
              label={intl.formatMessage({ id: 'bom.MaterialId' })}
              options={MaterialList}
              displayLabel="MaterialCode"
              displayValue="MaterialId"
              displayGroup="GroupMaterial"
              onChange={(e, value) => {
                setMaterialType(value?.GroupMaterial);
                setFieldValue("MaterialCode", value?.MaterialCode || '', true);
                setFieldValue("MaterialId", value?.MaterialId || "", true);
              }}
              defaultValue={mode == CREATE_ACTION ? null : { MaterialId: initModal.MaterialId, MaterialCode: initModal.MaterialCode }}
              error={touched.MaterialId && Boolean(errors.MaterialId)}
              helperText={touched.MaterialId && errors.MaterialId}
            /> : <TextField
              fullWidth
              size='small'
              disabled
              value={values.MaterialCode}
              label={intl.formatMessage({ id: 'bom.MaterialId' })}
            />}

          </Grid> :
            <>
              <Grid item xs={12}>
                <MuiSelectField
                  required
                  name="ParentId"
                  value={values.ParentId ? { BomId: values.ParentId, BomCode: values.ParentCode } : null}
                  disabled={mode == UPDATE_ACTION ? true : dialogState.isSubmit}
                  label={intl.formatMessage({ id: 'bom.ParentId' })}
                  options={ParentList}
                  displayLabel="BomCode"
                  displayValue="BomId"
                  displayGroup="BomLevelGroup"
                  onChange={(e, value) => {
                    setMaterialType(value?.MaterialType);
                    setFieldValue("MaterialCode", '', true);
                    setFieldValue("MaterialId", null, true);
                    setFieldValue("ParentCode", value?.BomCode || '', true);
                    setFieldValue("ParentId", value?.BomId || "", true);
                  }}
                  error={touched.ParentId && Boolean(errors.ParentId)}
                  helperText={touched.ParentId && errors.ParentId}
                />
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
                    setFieldValue("MaterialId", value?.MaterialId || "", true);
                    if (value?.GroupMaterial == "FINISH GOOD")
                      setFieldValue("Amount", '1', true);
                    else
                      setFieldValue("Amount", '', true);
                  }}
                  error={touched.MaterialId && Boolean(errors.MaterialId)}
                  helperText={touched.MaterialId && errors.MaterialId}
                />
              </Grid>
            </>
          }
          {!checkLV ? <Grid item xs={12}>
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
          </Grid> :
            <Grid item xs={12}>
              <TextField
                fullWidth
                size='small'
                name='Version'
                inputProps={{ maxLength: 8 }}
                disabled={mode == UPDATE_ACTION ? true : dialogState.isSubmit}
                value={values.Version}
                onChange={handleChange}
                label={intl.formatMessage({ id: 'bom.Version' }) + ' *'}
                error={touched.Version && Boolean(errors.Version)}
                helperText={touched.Version && errors.Version}
              />
            </Grid>}
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
  MaterialId: null,
  MaterialCode: '',
  ParentId: null,
  ParentCode: '',
  Amount: 1,
  Version: '',
  Remark: ''
};

export default BOMDialog