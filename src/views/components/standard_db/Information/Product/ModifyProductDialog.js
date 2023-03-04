import { MuiAutocomplete, MuiDialog, MuiResetButton, MuiSubmitButton } from '@controls';
import { Grid, TextField } from '@mui/material';
import { productService } from '@services';
import { ErrorAlert, SuccessAlert } from '@utils';
import { useFormik } from 'formik';
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import * as yup from 'yup';

const ModifyProductDialog = (props) => {
  const intl = useIntl();

  const { initModal, isOpen, onClose, setModifyData } = props;
  const clearParent = useRef(null);
  const regex = /^([a-z0-9]{4})-([a-z0-9]{6})+$/gi;
  const dataModalRef = useRef({ ...initModal });
  const [dialogState, setDialogState] = useState({
    ...initModal,
    isSubmit: false,
  });

  const pattern3DigisAfterComma = /^\d+(\.\d{0,3})?$/;

  const schema = yup.object().shape({
    MaterialCode: yup
      .string()
      .trim()
      .required(intl.formatMessage({ id: 'general.field_required' }))
      .matches(regex, intl.formatMessage({ id: 'product.Not_match_code' })),
    ProductType: yup
      .number()
      .min(1, intl.formatMessage({ id: 'general.field_required' }))
      .required(intl.formatMessage({ id: 'general.field_required' })),
    Model: yup
      .number()
      .min(1, intl.formatMessage({ id: 'general.field_required' }))
      .required(intl.formatMessage({ id: 'general.field_required' })),
    Description: yup.string().trim(),
    Inch: yup
      .number()
      // .test('is-decimal', 'Invalid decimal', (value) => (value + '').match(/^\d+(\.\d{0,3})?$/)),
      .test('is-decimal', 'The amount should be a decimal with maximum two digits after comma', (val) => {
        if (val) {
          return pattern3DigisAfterComma.test(val);
        }
        return true;
      }),
    QCMasterId: yup
      .number()
      .min(1, intl.formatMessage({ id: 'general.field_required' }))
      .required(intl.formatMessage({ id: 'general.field_required' })),
  });
  const formik = useFormik({
    validationSchema: schema,
    initialValues: { ...initModal },
    enableReinitialize: true,
    onSubmit: async (values) => {
      const res = await productService.modifyProduct(values);
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
    resetForm({ ...initModal });
  }, [initModal]);

  const handleCloseDialog = () => {
    resetForm();
    setDialogState({
      ...dialogState,
    });
    onClose();
  };

  const getModel = async () => {
    const res = await productService.getProductModel();
    return res;
  };
  const getproductType = async () => {
    const res = await productService.getProductType();
    return res;
  };
  const handleReset = () => {
    resetForm();
    setDialogState({
      ...dialogState,
    });
  };
  const getQCMasterList = async () => {
    const res = await productService.GetQCMasterModel();
    return res;
  };
  return (
    <MuiDialog
      maxWidth="md"
      title={intl.formatMessage({ id: 'general.modify' })}
      isOpen={isOpen}
      disabledCloseBtn={dialogState.isSubmit}
      disable_animate={300}
      onClose={handleCloseDialog}
    >
      <form onSubmit={handleSubmit}>
        <Grid container rowSpacing={2.5} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          <Grid item xs={12}>
            <Grid container spacing={2} marginBottom={3}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="text"
                  size="small"
                  name="MaterialCode"
                  disabled={dialogState.isSubmit}
                  value={values.MaterialCode}
                  onChange={handleChange}
                  label={intl.formatMessage({ id: 'general.code' }) + ' *'}
                  error={touched.MaterialCode && Boolean(errors.MaterialCode)}
                  helperText={touched.MaterialCode && errors.MaterialCode}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="text"
                  size="small"
                  name="Inch"
                  label={intl.formatMessage({ id: 'product.Inch' }) + ' *'}
                  disabled={dialogState.isSubmit}
                  value={values.Inch}
                  onChange={handleChange}
                  error={touched.Inch && Boolean(errors.Inch)}
                  helperText={touched.Inch && errors.Inch}
                />
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container item spacing={2} marginBottom={3}>
                <Grid item xs={6}>
                  <MuiAutocomplete
                    label={intl.formatMessage({ id: 'product.Model' }) + ' *'}
                    fetchDataFunc={getModel}
                    displayLabel="commonDetailName"
                    displayValue="commonDetailId"
                    // defaultValue={
                    // mode == CREATE_ACTION
                    //     ? null
                    //     : { LineId: initModal.LineId, LineName: initModal.LineName }
                    // }
                    value={values.Model ? { commonDetailId: values.Model, commonDetailName: values.ModelName } : null}
                    disabled={dialogState.isSubmit}
                    onChange={(e, value) => {
                      setFieldValue('ModelName', value?.commonDetailName || '');
                      setFieldValue('Model', value?.commonDetailId || '');
                    }}
                    error={touched.Model && Boolean(errors.Model)}
                    helperText={touched.Model && errors.Model}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={6}>
                  <MuiAutocomplete
                    label={intl.formatMessage({ id: 'product.product_type' }) + ' *'}
                    fetchDataFunc={getproductType}
                    displayLabel="commonDetailName"
                    displayValue="commonDetailId"
                    // defaultValue={
                    // mode == CREATE_ACTION
                    //     ? null
                    //     : { LineId: initModal.LineId, LineName: initModal.LineName }
                    // }
                    value={
                      values.ProductType
                        ? { commonDetailId: values.ProductType, commonDetailName: values.ProductTypeName }
                        : null
                    }
                    disabled={dialogState.isSubmit}
                    onChange={(e, value) => {
                      setFieldValue('ProductTypeName', value?.commonDetailName || '');
                      setFieldValue('ProductType', value?.commonDetailId || '');
                    }}
                    error={touched.ProductType && Boolean(errors.ProductType)}
                    helperText={touched.ProductType && errors.ProductType}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} className="mb-4">
              <MuiAutocomplete
                label={'QC Master Code' + ' *'}
                fetchDataFunc={getQCMasterList}
                displayLabel="QCMasterCode"
                displayValue="QCMasterId"
                // value={
                //   values.QCMasterId
                //     ? {
                //         QCMasterId: values.QCMasterId,
                //         QCMasterCode: values.QCMasterCode,
                //       }
                //     : null
                // }
                value={values.QCMasterId ? { QCMasterId: values.QCMasterId, QCMasterCode: values.QCMasterCode } : null}
                disabled={dialogState.isSubmit}
                onChange={(e, value) => {
                  setFieldValue('QCMasterCode', value?.QCMasterCode || '');
                  setFieldValue('QCMasterId', value?.QCMasterId || '');
                }}
                error={touched.QCMasterId && Boolean(errors.QCMasterId)}
                helperText={touched.QCMasterId && errors.QCMasterId}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <Grid container item spacing={2}>
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

export default ModifyProductDialog;
