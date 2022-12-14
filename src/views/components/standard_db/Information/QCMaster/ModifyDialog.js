import { MuiAutocomplete, MuiDialog, MuiResetButton, MuiSubmitButton } from '@controls';
import { Grid, TextField } from '@mui/material';
import { qcMasterService } from '@services';
import { ErrorAlert, SuccessAlert } from '@utils';
import { useFormik } from 'formik';
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import * as yup from 'yup';

const ModifyDialog = (props) => {
  const intl = useIntl();

  const { initModal, isOpen, onClose, setModifyData } = props;
  const clearParent = useRef(null);
  const [qcType, setqcType] = useState('');

  const dataModalRef = useRef({ ...initModal });
  const [dialogState, setDialogState] = useState({
    ...initModal,
    isSubmit: false,
  });

  const schema = yup.object().shape({
    QCMasterCode: yup
      .string()
      .trim()
      .required(intl.formatMessage({ id: 'general.field_required' })),
    MaterialTypeId: yup
      .number()
      .min(1, intl.formatMessage({ id: 'general.field_required' }))
      .required(intl.formatMessage({ id: 'general.field_required' })),
    QCType: yup
      .number()
      .min(1, intl.formatMessage({ id: 'general.field_required' }))
      .required(intl.formatMessage({ id: 'general.field_required' })),
    Description: yup.string().trim(),
  });

  const formik = useFormik({
    validationSchema: schema,
    initialValues: { ...initModal },
    enableReinitialize: true,
    onSubmit: async (values) => {
      const res = await qcMasterService.modify(values);
      if (res.HttpResponseCode === 200) {
        SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
        handleCloseDialog();
        setModifyData({ ...res.Data });
        setDialogState({ ...dialogState, isSubmit: false });
        handleReset();
      } else {
        ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
        handleCloseDialog();
        setDialogState({ ...dialogState, isSubmit: false });
        handleReset();
      }
    },
  });
  const { handleChange, handleBlur, handleSubmit, values, setFieldValue, errors, touched, isValid, resetForm } = formik;

  useEffect(() => {
    formik.initialValues = initModal;
    setqcType(initModal.QCTypeName);
  }, [initModal]);

  const handleCloseDialog = () => {
    setqcType('');
    resetForm();
    setDialogState({
      ...dialogState,
    });
    onClose();
  };

  const getMaterial = async (qcType) => {
    const res = await qcMasterService.getMaterialForSelect({ qcType: qcType });
    return res;
  };
  const getQC = async () => {
    const res = await qcMasterService.getQCTypeForSelect();
    return res;
  };
  const handleReset = () => {
    setqcType('');
    resetForm();
    setDialogState({
      ...dialogState,
    });
  };
  return (
    <MuiDialog
      maxWidth="sm"
      title={intl.formatMessage({ id: 'general.modify' })}
      isOpen={isOpen}
      disabledCloseBtn={dialogState.isSubmit}
      disable_animate={300}
      onClose={handleCloseDialog}
    >
      <form onSubmit={handleSubmit}>
        <Grid container rowSpacing={2.5} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="text"
                  size="small"
                  name="QCMasterCode"
                  disabled={dialogState.isSubmit}
                  value={values.QCMasterCode}
                  onChange={handleChange}
                  label={intl.formatMessage({ id: 'qcMaster.QCMasterCode' }) + ' *'}
                  error={touched.QCMasterCode && Boolean(errors.QCMasterCode)}
                  helperText={touched.QCMasterCode && errors.QCMasterCode}
                />
              </Grid>
              <Grid item xs={12}>
                <MuiAutocomplete
                  label={intl.formatMessage({ id: 'qcMaster.qcType' }) + ' *'}
                  fetchDataFunc={getQC}
                  displayLabel="commonDetailName"
                  displayValue="commonDetailId"
                  value={values.QCType ? { commonDetailId: values.QCType, commonDetailName: values.QCTypeName } : null}
                  disabled={dialogState.isSubmit}
                  onChange={(e, value) => {
                    setFieldValue('MaterialTypeName', '');
                    setFieldValue('MaterialTypeId', 0);
                    setqcType(value?.commonDetailName || '');

                    setFieldValue('QCTypeName', value?.commonDetailName || '');
                    setFieldValue('QCType', value?.commonDetailId || '');
                  }}
                  error={touched.QCType && Boolean(errors.QCType)}
                  helperText={touched.QCType && errors.QCType}
                />
              </Grid>
              <Grid item xs={12}>
                <MuiAutocomplete
                  label={intl.formatMessage({ id: 'material.MaterialCode' }) + ' *'}
                  fetchDataFunc={() => getMaterial(qcType)}
                  displayLabel="MaterialTypeName"
                  displayValue="MaterialTypeId"
                  value={
                    values.MaterialTypeId
                      ? { MaterialTypeId: values.MaterialTypeId, MaterialTypeName: values.MaterialTypeName }
                      : null
                  }
                  disabled={dialogState.isSubmit}
                  onChange={(e, value) => {
                    setFieldValue('MaterialTypeName', value?.MaterialTypeName || '');
                    setFieldValue('MaterialTypeId', value?.MaterialTypeId || '');
                  }}
                  error={touched.MaterialTypeId && Boolean(errors.MaterialTypeId)}
                  helperText={touched.MaterialTypeId && errors.MaterialTypeId}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Grid container item spacing={2} marginBottom={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="text"
                  size="small"
                  name="Description"
                  disabled={dialogState.isSubmit}
                  value={values.Description}
                  onChange={handleChange}
                  label={intl.formatMessage({ id: 'general.description' })}
                  error={touched.Description && Boolean(errors.Description)}
                  helperText={touched.Description && errors.Description}
                />
              </Grid>
            </Grid>
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

export default ModifyDialog;
