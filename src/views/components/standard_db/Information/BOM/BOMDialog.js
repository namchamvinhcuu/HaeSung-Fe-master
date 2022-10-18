import React, { useEffect, useRef, useState } from 'react'
import { MuiDialog, MuiResetButton, MuiSubmitButton, MuiDateField, MuiSelectField } from '@controls'
import { Checkbox, FormControlLabel, Grid, TextField } from '@mui/material'
import { useIntl } from 'react-intl'
import * as yup from 'yup'
import { bomService } from '@services'
import { ErrorAlert, SuccessAlert } from '@utils'
import { CREATE_ACTION, UPDATE_ACTION } from '@constants/ConfigConstants';
import { useFormik } from 'formik'

const BOMDialog = ({ initModal, isOpen, onClose, setNewData, setUpdateData, mode, valueOption }) => {
  const intl = useIntl();
  const [checkLV, setCheckLV] = useState(true);
  const [hidecheckLV, setHideCheckLV] = useState(true);
  const [MaterialType, setMaterialType] = useState("");
  const [dialogState, setDialogState] = useState({ isSubmit: false });
  const [ParentList, setParentList] = useState([]);
  const [MaterialList, setMaterialList] = useState([]);

  const schema = yup.object().shape({
    //BomCode: yup.string().nullable().required(intl.formatMessage({ id: 'general.field_required' })),
    // MaterialId: yup.number().nullable().required(intl.formatMessage({ id: 'general.field_required' })),

    // MaterialId: yup.number().nullable()
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
    getMaterial(1);
  }, [])

  useEffect(() => {
    console.log(MaterialType)
    if (MaterialType == "BARE MATERIAL")
      getMaterial(2);
    else
      getMaterial(1);

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

        if (hidecheckLV) {
          handleReset();
          setFieldValue("ParentCode", res.Data.MaterialType);
          setFieldValue("ParentId", res.Data.BomId);
        }
        else {
          setFieldValue("Remark", "");
          setFieldValue("MaterialId", null);
          setFieldValue("MaterialCode", "");
        }

        setDialogState({ ...dialogState, isSubmit: false });
        setCheckLV(false);
        setHideCheckLV(false);
        getParent();
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
    if (res.Data) {
      setParentList([...res.Data])
    }
  }

  const getMaterial = async (id) => {
    const res = await bomService.getMaterial(id);
    if (res.Data) {
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
          {hidecheckLV && <Grid item xs={12}>
            <FormControlLabel sx={{ m: 0 }} control={<Checkbox disabled={mode == UPDATE_ACTION ? true : false} defaultChecked={checkLV} value={checkLV} onChange={() => setCheckLV(!checkLV)} />} label={intl.formatMessage({ id: 'bom.CheckBomLv1' })} />
          </Grid>}
          {checkLV ? <Grid item xs={12}>
            <MuiSelectField
              value={values.MaterialId ? { MaterialId: values.MaterialId, MaterialCode: values.MaterialCode } : null}
              disabled={mode == UPDATE_ACTION ? true : dialogState.isSubmit}
              label={intl.formatMessage({ id: 'bom.MaterialId' })}
              options={valueOption.MaterialList}
              displayLabel="MaterialCode"
              displayValue="MaterialId"
              onChange={(e, value) => {
                setFieldValue("MaterialCode", value?.MaterialCode || '');
                setFieldValue("MaterialId", value?.MaterialId || "");
              }}
              defaultValue={mode == CREATE_ACTION ? null : { MaterialId: initModal.MaterialId, MaterialCode: initModal.MaterialCode }}
              error={touched.MaterialId && Boolean(errors.MaterialId)}
              helperText={touched.MaterialId && errors.MaterialId}
            />
          </Grid> :
            <>
              <Grid item xs={12}>
                <MuiSelectField
                  value={values.ParentId ? { BomId: values.ParentId, BomCode: values.ParentCode } : null}
                  disabled={mode == UPDATE_ACTION ? true : dialogState.isSubmit}
                  label={intl.formatMessage({ id: 'bom.ParentId' })}
                  options={ParentList}
                  displayLabel="BomCode"
                  displayValue="BomId"
                  displayGroup="BomLevelGroup"
                  onChange={(e, value) => {
                    setMaterialType(value?.MaterialType);
                    setFieldValue("MaterialCode", '');
                    setFieldValue("MaterialId", null);
                    setFieldValue("ParentCode", value?.BomCode || '');
                    setFieldValue("ParentId", value?.BomId || "");
                  }}
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
                  displayGroup="GroupMaterial"
                  onChange={(e, value) => {
                    setFieldValue("MaterialCode", value?.MaterialCode || '');
                    setFieldValue("MaterialId", value?.MaterialId || "");
                  }}
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
  MaterialId: null,
  MaterialCode: '',
  ParentId: null,
  ParentCode: '',
  // MaterialId: null,
  // MaterialCode: '',
  Remark: ''
};

export default BOMDialog