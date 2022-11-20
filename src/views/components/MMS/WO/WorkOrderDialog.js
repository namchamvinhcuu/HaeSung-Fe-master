import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { CombineStateToProps, CombineDispatchToProps } from '@plugins/helperJS';
import { User_Operations } from '@appstate/user';
import { Store } from '@appstate';

import { MuiDialog, MuiResetButton, MuiSubmitButton, MuiDateTimeField, MuiAutocomplete, MuiTextField } from '@controls';
import { yupResolver } from '@hookform/resolvers/yup';
import { Checkbox, FormControlLabel, Grid, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';
import * as yup from 'yup';
import { workOrderService } from '@services';
import { ErrorAlert, SuccessAlert, getCurrentWeek } from '@utils';
import { CREATE_ACTION, UPDATE_ACTION } from '@constants/ConfigConstants';
import { useFormik } from 'formik';
import moment from 'moment';

const WorkOrderDialog = (props) => {
  let isRendered = useRef(true);

  const { initModal, isOpen, onClose, setNewData, setUpdateData, mode, valueOption } = props;

  const intl = useIntl();
  const [dialogState, setDialogState] = useState({
    ...initModal,
    isSubmit: false,
  });

  const curWeek = getCurrentWeek();
  const curYear = new Date().getFullYear();

  const schema = yup.object().shape({
    FPoMasterId: yup.number().nullable(),
    Week: yup
      .string()
      .nullable()
      .when('FPoMasterId', (val) => {
        if (val && val > 0) {
          return yup
            .number()
            .typeError(intl.formatMessage({ id: 'general.field_invalid' }))
            .required(intl.formatMessage({ id: 'general.field_required' }))
            .integer()
            .min(curWeek, intl.formatMessage({ id: 'general.field_min' }, { min: curWeek }))
            .max(52, intl.formatMessage({ id: 'general.field_max' }, { max: 52 }));
        } else {
          return yup.number().nullable();
        }
      }),
    Year: yup
      .string()
      .nullable()
      .when('FPoMasterId', (val) => {
        if (val && val > 0) {
          return yup
            .number()
            .typeError(intl.formatMessage({ id: 'general.field_invalid' }))
            .required(intl.formatMessage({ id: 'general.field_required' }))
            .integer()
            .min(curYear, intl.formatMessage({ id: 'general.field_min' }, { min: curYear }))
            .max(2050, intl.formatMessage({ id: 'general.field_max' }, { max: 2050 }));
        } else {
          return yup.number().nullable();
        }
      }),
    FPOId: yup
      .number()
      .nullable()
      .when('FPoMasterId', (val) => {
        if (val && val > 0) {
          return yup
            .number()
            .required(intl.formatMessage({ id: 'general.field_required' }))
            .min(1, intl.formatMessage({ id: 'general.field_required' }));
        } else {
          return yup.number().nullable();
        }
      }),
    MaterialId: yup
      .number()
      .nullable()
      .when('FPoMasterId', (val) => {
        if (val === 0) {
          return yup
            .number()
            .required(intl.formatMessage({ id: 'general.field_required' }))
            .min(1, intl.formatMessage({ id: 'general.field_required' }));
        } else {
          return yup.number().notRequired();
        }
      }),
    BomId: yup
      .number()
      .nullable()
      .required(intl.formatMessage({ id: 'general.field_required' }))
      .min(1, intl.formatMessage({ id: 'general.field_required' })),
    WoCode: yup
      .string()
      .required(intl.formatMessage({ id: 'general.field_required' }))
      .length(12, intl.formatMessage({ id: 'general.field_length' }, { length: 12 })),
    OrderQty: yup
      .number()
      .integer()
      .required(intl.formatMessage({ id: 'general.field_required' }))
      .min(1, intl.formatMessage({ id: 'general.field_min' }, { min: 1 })),
    StartDate: yup
      .date()
      .typeError(intl.formatMessage({ id: 'general.field_invalid' }))
      .nullable()
      .required(intl.formatMessage({ id: 'general.field_required' })),
  });

  const formik = useFormik({
    validationSchema: schema,
    initialValues:
      mode === UPDATE_ACTION
        ? {
            ...initModal,
            StartDate: moment(initModal.StartDate).add(7, 'hours'),
          }
        : { ...initModal },
    enableReinitialize: true,
    onSubmit: async (values, actions) => {
      await onSubmit(values);
      // actions.setSubmitting(false);
    },
  });

  const { handleChange, handleBlur, handleSubmit, values, setFieldValue, errors, touched, isValid, resetForm } = formik;
  const handleReset = () => {
    resetForm();
  };
  const handleCloseDialog = () => {
    resetForm();
    onClose();
  };

  const onSubmit = async (data) => {
    setDialogState({ ...dialogState, isSubmit: true });

    if (mode == CREATE_ACTION) {
      // console.log(data);

      const res = await workOrderService.create(data);
      if (res && isRendered) {
        if (res.HttpResponseCode === 200 && res.Data) {
          SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
          setNewData({ ...res.Data });

          // handleReset();
        } else {
          ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
        }
      } else {
        ErrorAlert(intl.formatMessage({ id: 'general.system_error' }));
      }
      setDialogState({ ...dialogState, isSubmit: false });
    } else {
      const res = await workOrderService.modify(data);
      if (res && isRendered) {
        if (res.HttpResponseCode === 200 && res.Data) {
          SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
          setUpdateData({ ...res.Data });
          setDialogState({ ...dialogState, isSubmit: false });
          handleReset();
          handleCloseDialog();
        } else {
          ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
        }
      } else {
        ErrorAlert(intl.formatMessage({ id: 'general.system_error' }));
      }
    }
    setDialogState({ ...dialogState, isSubmit: false });
  };

  const getForecastPOMaster = async () => {
    return await workOrderService.getPoMasterArr();
  };

  const getMaterials = async () => {
    if (values.FPoMasterId && values.FPoMasterId !== 0)
      return await workOrderService.getMaterialArrByForecastPOMaster(values);
    else return await workOrderService.getSearchMaterialArr(0, 0);
  };

  const getBomArr = async () => {
    return await workOrderService.getBom(values);
  };

  const getLineArr = async () => {
    return await workOrderService.getLineArr();
  };

  return (
    <React.Fragment>
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
              <Grid container spacing={2}>
                {/* ForecastPOMaster - Autocomplete*/}
                <Grid item xs={4}>
                  <MuiAutocomplete
                    label={intl.formatMessage({
                      id: 'work_order.FPoMasterCode',
                    })}
                    disabled={dialogState.isSubmit}
                    fetchDataFunc={getForecastPOMaster}
                    displayValue="FPoMasterId"
                    displayLabel="FPoMasterCode"
                    value={
                      values.FPoMasterId && values.FPoMasterId !== 0
                        ? {
                            FPoMasterId: values.FPoMasterId,
                            FPoMasterCode: values.FPoMasterCode,
                          }
                        : null
                    }
                    onChange={(e, item) => {
                      setFieldValue('FPoMasterId', item?.FPoMasterId || 0);
                      setFieldValue('FPoMasterCode', item?.FPoMasterCode || '');
                      setFieldValue('FPOId', item?.FPOId || 0);
                      setFieldValue('MaterialBuyerCode', item?.MaterialBuyerCode || '');
                      setFieldValue('MaterialId', item?.MaterialId || 0);
                      setFieldValue('MaterialCode', item?.MaterialCode || '');
                      setFieldValue('BomId', item?.BomId || 0);
                      setFieldValue('BomVersion', item?.BomVersion || '');
                    }}
                    error={touched.FPoMasterId && Boolean(errors.FPoMasterId)}
                    helperText={touched.FPoMasterId && errors.FPoMasterId}
                  />
                </Grid>

                {/* Year */}
                <Grid item xs={4}>
                  <MuiTextField
                    disabled={dialogState.isSubmit}
                    label={intl.formatMessage({
                      id: 'work_order.Year',
                    })}
                    type="number"
                    name="Year"
                    value={values.Year ?? ''}
                    onChange={handleChange}
                    error={touched.Year && Boolean(errors.Year)}
                    helperText={touched.Year && errors.Year}
                  />
                </Grid>

                {/* Week */}
                <Grid item xs={4}>
                  <MuiTextField
                    disabled={dialogState.isSubmit}
                    label={intl.formatMessage({
                      id: 'work_order.Week',
                    })}
                    type="number"
                    name="Week"
                    value={values.Week ?? ''}
                    onChange={handleChange}
                    error={touched.Week && Boolean(errors.Week)}
                    helperText={touched.Week && errors.Week}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={2}>
                {/* Material */}
                <Grid item xs={6}>
                  {values.FPoMasterId && values.FPoMasterId !== 0 ? (
                    <MuiAutocomplete
                      label={intl.formatMessage({
                        id: 'work_order.MaterialCode',
                      })}
                      disabled={dialogState.isSubmit}
                      fetchDataFunc={getMaterials}
                      displayValue="FPOId"
                      displayLabel="MaterialBuyerCode"
                      displayGroup="GroupMaterial"
                      value={
                        values.FPOId && values.FPOId !== 0
                          ? {
                              FPOId: values.FPOId,
                              MaterialBuyerCode: values.MaterialBuyerCode,
                            }
                          : null
                      }
                      onChange={(e, item) => {
                        setFieldValue('FPOId', item?.FPOId || 0);
                        setFieldValue('MaterialBuyerCode', item?.MaterialBuyerCode || '');
                        setFieldValue('BomId', item?.BomId || 0);
                        setFieldValue('BomVersion', item?.BomVersion || '');
                      }}
                      error={touched.FPOId && Boolean(errors.FPOId)}
                      helperText={touched.FPOId && errors.FPOId}
                    />
                  ) : (
                    <MuiAutocomplete
                      label={intl.formatMessage({ id: 'work_order.MaterialCode' })}
                      fetchDataFunc={getMaterials}
                      displayLabel="MaterialCode"
                      displayValue="MaterialId"
                      displayGroup="GroupMaterial"
                      value={
                        values.MaterialId && values.MaterialId !== 0
                          ? {
                              MaterialId: values.MaterialId,
                              MaterialCode: values.MaterialCode,
                            }
                          : null
                      }
                      onChange={(e, item) => {
                        setFieldValue('MaterialId', item?.MaterialId || 0);
                        setFieldValue('MaterialCode', item?.MaterialCode || '');
                        setFieldValue('BomId', item?.BomId || 0);
                        setFieldValue('BomVersion', item?.BomVersion || '');
                      }}
                      error={touched.MaterialId && Boolean(errors.MaterialId)}
                      helperText={touched.MaterialId && errors.MaterialId}
                    />
                  )}
                </Grid>

                {/* Bom - Version */}
                <Grid item xs={6}>
                  <MuiAutocomplete
                    label={intl.formatMessage({
                      id: 'work_order.BomVersion',
                    })}
                    disabled={dialogState.isSubmit}
                    fetchDataFunc={getBomArr}
                    displayValue="BomId"
                    displayLabel="BomVersion"
                    value={
                      values.BomId && values.BomId !== 0
                        ? {
                            BomId: values.BomId,
                            BomVersion: values.BomVersion,
                          }
                        : null
                    }
                    onChange={(e, item) => {
                      setFieldValue('BomId', item?.BomId || 0);
                      setFieldValue('BomVersion', item?.BomVersion || '');
                    }}
                    error={touched.BomId && Boolean(errors.BomId)}
                    helperText={touched.BomId && errors.BomId}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={2}>
                {/* WoCode */}
                <Grid item xs>
                  <MuiTextField
                    required
                    disabled={dialogState.isSubmit}
                    label={intl.formatMessage({ id: 'work_order.WoCode' })}
                    name="WoCode"
                    value={values.WoCode}
                    onChange={handleChange}
                    error={touched.WoCode && Boolean(errors.WoCode)}
                    helperText={touched.WoCode && errors.WoCode}
                  />
                </Grid>

                {/* Line */}
                <Grid item xs>
                  <MuiAutocomplete
                    label={intl.formatMessage({
                      id: 'work_order.LineName',
                    })}
                    disabled={dialogState.isSubmit}
                    fetchDataFunc={getLineArr}
                    displayValue="LineId"
                    displayLabel="LineName"
                    value={
                      values.LineId && values.LineId !== 0
                        ? {
                            LineId: values.LineId,
                            LineName: values.LineName,
                          }
                        : null
                    }
                    onChange={(e, value) => {
                      setFieldValue('LineId', value?.LineId || 0);
                      setFieldValue('LineName', value?.LineName || '');
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={2}>
                {/* OrderQty */}
                <Grid item xs>
                  <MuiTextField
                    required
                    disabled={dialogState.isSubmit}
                    type="number"
                    label={intl.formatMessage({ id: 'work_order.OrderQty' })}
                    name="OrderQty"
                    value={values.OrderQty}
                    onChange={handleChange}
                    error={touched.OrderQty && Boolean(errors.OrderQty)}
                    helperText={touched.OrderQty && errors.OrderQty}
                  />
                </Grid>

                {/* StartDate */}
                <Grid item xs>
                  <MuiDateTimeField
                    required
                    disabled={dialogState.isSubmit}
                    label={intl.formatMessage({
                      id: 'work_order.StartDate',
                    })}
                    value={values.StartDate ?? null}
                    onChange={(e) => setFieldValue('StartDate', e)}
                    error={touched.StartDate && Boolean(errors.StartDate)}
                    helperText={touched.StartDate && errors.StartDate}
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
    </React.Fragment>
  );
};

User_Operations.toString = function () {
  return 'User_Operations';
};

const mapStateToProps = (state) => {
  const {
    User_Reducer: { language },
  } = CombineStateToProps(state.AppReducer, [[Store.User_Reducer]]);

  return { language };
};

const mapDispatchToProps = (dispatch) => {
  const {
    User_Operations: { changeLanguage },
  } = CombineDispatchToProps(dispatch, bindActionCreators, [[User_Operations]]);

  return { changeLanguage };
};

export default connect(mapStateToProps, mapDispatchToProps)(WorkOrderDialog);
