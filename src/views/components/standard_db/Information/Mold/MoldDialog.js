import React, { useEffect, useRef, useState } from 'react'
import { MuiDialog, MuiResetButton, MuiSubmitButton, MuiDateField, MuiSelectField } from '@controls'
import { yupResolver } from '@hookform/resolvers/yup'
import { Grid, TextField } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import * as yup from 'yup'
import { moldService } from '@services'
import { ErrorAlert, SuccessAlert } from '@utils'
import { CREATE_ACTION } from '@constants/ConfigConstants';

const MoldDialog = ({ initModal, isOpen, onClose, setNewData, setUpdateData, mode, valueOption }) => {
  const intl = useIntl();
  const [date, setDate] = useState(initModal?.ETADate);
  const ETAStatus = [{ value: true, label: 'YES' }, { value: false, label: 'NO' }]
  const [dialogState, setDialogState] = useState({ isSubmit: false })

  const schema = yup.object().shape({
    MoldSerial: yup.string().required(intl.formatMessage({ id: 'mold.MoldSerial_required' })),
    MoldCode: yup.string().required(intl.formatMessage({ id: 'mold.MoldCode_required' })),
    Inch: yup.string().nullable().required(intl.formatMessage({ id: 'mold.Inch_required' })),
    MachineTon: yup.string().nullable().required(intl.formatMessage({ id: 'mold.MachineTon_required' })),
    Cabity: yup.string().nullable().required(intl.formatMessage({ id: 'mold.Cabity_required' })),
    Model: yup.number().nullable().required(intl.formatMessage({ id: 'mold.Model_required' })),
    MoldType: yup.number().nullable().required(intl.formatMessage({ id: 'mold.MoldType_required' })),
    MachineType: yup.number().nullable().required(intl.formatMessage({ id: 'mold.MachineType_required' })),
    ETAStatus: yup.bool().nullable().required(intl.formatMessage({ id: 'mold.ETAStatus_required' })),
    ETADate: yup.date().nullable().required(intl.formatMessage({ id: 'mold.ETADate_required' }))
  });

  const { control, register, setValue, formState: { errors }, handleSubmit, clearErrors, reset } = useForm({
    mode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues: initModal
  });

  useEffect(() => {
    if (mode == CREATE_ACTION) {
      setDate();
      reset({ Inch: null, Cabity: null, MachineTon: null });
    }
    else {
      setDate(initModal?.ETADate);
      reset(initModal);
    }
  }, [initModal, mode])

  const handleReset = () => {
    reset();
    clearErrors();
    setDialogState({ ...dialogState })
  }

  const handleCloseDialog = () => {
    reset();
    clearErrors();
    setDialogState({ ...dialogState })
    onClose();
  }

  const onSubmit = async (data) => {
    setDialogState({ ...dialogState, isSubmit: true });

    if (mode == CREATE_ACTION) {
      const res = await moldService.createMold(data);
      if (res.HttpResponseCode === 200 && res.Data) {
        SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }))
        setNewData({ ...res.Data });
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
      const res = await moldService.modifyMold({ ...data, MoldId: initModal.MoldId, row_version: initModal.row_version });
      if (res.HttpResponseCode === 200) {
        SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }))
        setUpdateData({ ...res.Data });
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

  return (
    <MuiDialog
      maxWidth='md'
      title={intl.formatMessage({ id: mode == CREATE_ACTION ? 'general.create' : 'general.modify' })}
      isOpen={isOpen}
      disabledCloseBtn={dialogState.isSubmit}
      disable_animate={300}
      onClose={handleCloseDialog}
    >
      <form onSubmit={handleSubmit(onSubmit)} >
        <Grid container rowSpacing={2.5} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          <Grid item container spacing={2}>
            <Grid item xs={6}>
              <TextField
                disabled={dialogState.isSubmit}
                autoFocus
                fullWidth
                size='small'
                label={intl.formatMessage({ id: 'mold.MoldSerial' })}
                {...register('MoldSerial')}
                error={!!errors?.MoldSerial}
                helperText={errors?.MoldSerial ? errors.MoldSerial.message : null}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                disabled={dialogState.isSubmit}
                fullWidth
                size='small'
                label={intl.formatMessage({ id: 'mold.MoldCode' })}
                {...register('MoldCode')}
                error={!!errors?.MoldCode}
                helperText={errors?.MoldCode ? errors.MoldCode.message : null}
              />
            </Grid>
          </Grid>
          <Grid item container spacing={2}>
            <Grid item xs={6}>
              <Controller
                control={control}
                name="Model"
                render={({ field: { onChange, value } }) => {
                  return (
                    <MuiSelectField
                      disabled={dialogState.isSubmit}
                      label={intl.formatMessage({ id: 'mold.Model' })}
                      options={valueOption.PMList}
                      displayLabel="commonDetailName"
                      displayValue="commonDetailId"
                      onChange={(e, item) => onChange(item ? item.commonDetailId ?? null : null)}
                      defaultValue={initModal && { commonDetailId: initModal.Model, commonDetailName: initModal.ModelName }}
                      error={!!errors.Model}
                      helperText={errors?.Model ? errors.Model.message : null}
                    />
                  );
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                disabled={dialogState.isSubmit}
                type='number'
                size='small'
                label={intl.formatMessage({ id: 'mold.Inch' })}
                {...register('Inch')}
                error={!!errors?.Inch}
                helperText={errors?.Inch ? errors.Inch.message : null}
              />
            </Grid>
          </Grid>
          <Grid item container spacing={2}>
            <Grid item xs={6}>
              <Controller
                control={control}
                name="MoldType"
                render={({ field: { onChange, value } }) => {
                  return (
                    <MuiSelectField
                      disabled={dialogState.isSubmit}
                      label={intl.formatMessage({ id: 'mold.MoldType' })}
                      options={valueOption.PTList}
                      displayLabel="commonDetailName"
                      displayValue="commonDetailId"
                      onChange={(e, item) => onChange(item ? item.commonDetailId ?? null : null)}
                      defaultValue={initModal && { commonDetailId: initModal.MoldType, commonDetailName: initModal.MoldTypeName }}
                      error={!!errors.MoldType}
                      helperText={errors?.MoldType ? errors.MoldType.message : null}
                    />
                  );
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                control={control}
                name="MachineType"
                render={({ field: { onChange, value } }) => {
                  return (
                    <MuiSelectField
                      disabled={dialogState.isSubmit}
                      label={intl.formatMessage({ id: 'mold.MachineType' })}
                      options={valueOption.MTList}
                      displayLabel="commonDetailName"
                      displayValue="commonDetailId"
                      onChange={(e, item) => onChange(item ? item.commonDetailId ?? null : null)}
                      defaultValue={initModal && { commonDetailId: initModal.MachineType, commonDetailName: initModal.MachineTypeName }}
                      error={!!errors.MachineType}
                      helperText={errors?.MachineType ? errors.MachineType.message : null}
                    />
                  );
                }}
              />
            </Grid>
          </Grid>
          <Grid item container spacing={2}>
            <Grid item xs={6}>
              <Controller
                control={control}
                name="ETADate"
                render={({ field: { onChange, value } }) => {
                  return (
                    <MuiDateField
                      disabled={dialogState.isSubmit}
                      label="ETA Date"
                      value={date}
                      onChange={(e) => {
                        setDate(e);
                        onChange(e ?? null);
                      }}
                      error={!!errors?.ETADate}
                      helperText={errors?.ETADate ? errors.ETADate.message : null}
                    />);
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                disabled={dialogState.isSubmit}
                type='number'
                size='small'
                label={intl.formatMessage({ id: 'mold.MachineTon' })}
                {...register('MachineTon')}
                error={!!errors?.MachineTon}
                helperText={errors?.MachineTon ? errors.MachineTon.message : null}
              />
            </Grid>
          </Grid>
          <Grid item container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                disabled={dialogState.isSubmit}
                size='small'
                type='number'
                label={intl.formatMessage({ id: 'mold.Cabity' })}
                {...register('Cabity')}
                error={!!errors?.Cabity}
                helperText={errors?.Cabity ? errors.Cabity.message : null}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                control={control}
                name="ETAStatus"
                render={({ field: { onChange, value } }) => {
                  return (
                    <MuiSelectField
                      disabled={dialogState.isSubmit}
                      label={intl.formatMessage({ id: 'mold.ETAStatus' })}
                      options={ETAStatus}
                      displayLabel="label"
                      displayValue="value"
                      onChange={(e, item) => onChange(item ? item.value ?? null : null)}
                      defaultValue={mode == CREATE_ACTION ? null : initModal.ETAStatus ? { value: true, label: 'YES' } : { value: false, label: 'NO' }}
                      error={!!errors.Model}
                      helperText={errors?.Model ? errors.Model.message : null}
                    />
                  );
                }}
              />
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <TextField
              disabled={dialogState.isSubmit}
              fullWidth
              size='small'
              label={intl.formatMessage({ id: 'mold.Remark' })}
              {...register('Remark')}
              error={!!errors?.Remark}
              helperText={errors?.Remark ? errors.Remark.message : null}
            />
          </Grid>
          <Grid item xs={12}>
            <Grid container direction="row-reverse">
              <MuiSubmitButton text="save" loading={dialogState.isSubmit} />
              <MuiResetButton onClick={handleReset} disabled={dialogState.isSubmit} />
            </Grid>
          </Grid>
        </Grid>
      </form >
    </MuiDialog >
  )
}

export default MoldDialog