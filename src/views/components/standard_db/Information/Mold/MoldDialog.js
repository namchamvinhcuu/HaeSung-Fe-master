import React, { useEffect, useRef, useState } from 'react'
import { MuiDialog, MuiResetButton, MuiSubmitButton, MuiDateField } from '@controls'
import { yupResolver } from '@hookform/resolvers/yup'
import { Autocomplete, Grid, TextField } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import * as yup from 'yup'
import { moldService } from '@services'
import { ErrorAlert, SuccessAlert } from '@utils'
import { CREATE_ACTION } from '@constants/ConfigConstants';

const MoldDialog = ({ initModal, isOpen, onClose, setNewData, mode, loadData }) => {
  const intl = useIntl();
  const [PMList, setPMList] = useState([]);// Product Model list
  const [PTList, setPTList] = useState([]);// Product Type list
  const [MTList, setMTList] = useState([]);// Machine Type list
  const [date, setDate] = useState(initModal?.ETADate);
  const ETAStatus = [{ value: true, label: 'YES' }, { value: false, label: 'NO' }]
  const [dialogState, setDialogState] = useState({ isSubmit: false })

  const schema = yup.object().shape({
    // MoldSerial: yup.string().required(intl.formatMessage({ id: 'mold.MoldSerial_required' })),
    // MoldCode: yup.string().required(intl.formatMessage({ id: 'mold.MoldCode_required' })),
    // Inch: yup.string().nullable().required(intl.formatMessage({ id: 'mold.Inch_required' })),
    // Cabity: yup.string().nullable().required(intl.formatMessage({ id: 'mold.Cabity_required' })),
    // Model: yup.number().nullable().required(intl.formatMessage({ id: 'mold.Model_required' })),
    // MoldType: yup.number().nullable().required(intl.formatMessage({ id: 'mold.MoldType_required' })),
    // MachineType: yup.number().nullable().required(intl.formatMessage({ id: 'mold.MachineType_required' })),
    // ETAStatus: yup.bool().nullable().required(intl.formatMessage({ id: 'mold.ETAStatus_required' })),
    // ETADate: yup.date().nullable().required(intl.formatMessage({ id: 'mold.ETADate_required' }))
  });

  const { control, register, setValue, formState: { errors }, handleSubmit, clearErrors, reset } = useForm({
    mode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues: initModal
  });

  useEffect(() => {
    getProductModel();
    getProductType();
    getMachineType();
  }, [])

  useEffect(() => {
    if (mode == CREATE_ACTION) {
      setDate();
      reset({ Inch: null, Cabity: null });
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

  const getProductModel = async () => {
    const res = await moldService.getProductModel();
    if (res.HttpResponseCode === 200 && res.Data) {
      setPMList([...res.Data])
    }
  }

  const getProductType = async () => {
    const res = await moldService.getProductType();
    if (res.HttpResponseCode === 200 && res.Data) {
      setPTList([...res.Data])
    }
  }

  const getMachineType = async () => {
    const res = await moldService.getMachineType();
    if (res.HttpResponseCode === 200 && res.Data) {
      setMTList([...res.Data])
    }
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
        setDialogState({ ...dialogState, isSubmit: false });
        handleReset();
        handleCloseDialog();
        loadData();
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
                    <Autocomplete
                      fullWidth
                      disabled={dialogState.isSubmit}
                      size='small'
                      options={PMList}
                      autoHighlight
                      openOnFocus
                      getOptionLabel={option => option.commonDetailName}
                      isOptionEqualToValue={(option, value) => option.commonDetailId === value.commonDetailId}
                      defaultValue={initModal && { commonDetailId: initModal.Model, commonDetailName: initModal.ModelName }}
                      onChange={(e, item) => onChange(item ? item.commonDetailId ?? null : null)}
                      renderInput={(params) => {
                        return <TextField
                          {...params}
                          label={intl.formatMessage({ id: 'mold.Model' })}
                          error={!!errors.Model}
                          helperText={errors?.Model ? errors.Model.message : null}
                        />
                      }}
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
                    <Autocomplete
                      disabled={dialogState.isSubmit}
                      fullWidth
                      size='small'
                      options={PTList}
                      autoHighlight
                      openOnFocus
                      getOptionLabel={option => option.commonDetailName}
                      isOptionEqualToValue={(option, value) => option.commonDetailId === value.commonDetailId}
                      defaultValue={initModal && { commonDetailId: initModal.MoldType, commonDetailName: initModal.MoldTypeName }}
                      onChange={(e, item) => onChange(item ? item.commonDetailId ?? null : null)}
                      renderInput={(params) => {
                        return <TextField
                          {...params}
                          label={intl.formatMessage({ id: 'mold.MoldType' })}
                          error={!!errors.MoldType}
                          helperText={errors?.MoldType ? errors.MoldType.message : null}
                        />
                      }}
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
                    <Autocomplete
                      disabled={dialogState.isSubmit}
                      fullWidth
                      size='small'
                      options={MTList}
                      autoHighlight
                      openOnFocus
                      getOptionLabel={option => option.commonDetailName}
                      isOptionEqualToValue={(option, value) => option.commonDetailId === value.commonDetailId}
                      defaultValue={initModal && { commonDetailId: initModal.MachineType, commonDetailName: initModal.MachineTypeName }}
                      onChange={(e, item) => onChange(item ? item.commonDetailId ?? null : null)}
                      renderInput={(params) => {
                        return <TextField
                          {...params}
                          label={intl.formatMessage({ id: 'mold.MachineType' })}
                          error={!!errors.MachineType}
                          helperText={errors?.MachineType ? errors.MachineType.message : null}
                        />
                      }}
                    />
                  );
                }}
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
                    <Autocomplete
                      fullWidth
                      disabled={dialogState.isSubmit}
                      size='small'
                      options={ETAStatus}
                      autoHighlight
                      openOnFocus
                      getOptionLabel={option => option.label}
                      isOptionEqualToValue={(option, value) => option.value === value.value}
                      defaultValue={mode == CREATE_ACTION ? null : initModal.ETAStatus ? { value: true, label: 'YES' } : { value: false, label: 'NO' }}
                      onChange={(e, item) => onChange(item ? item.value ?? null : null)}
                      renderInput={(params) => {
                        return <TextField
                          {...params}
                          label={intl.formatMessage({ id: 'mold.ETAStatus' })}
                          error={!!errors.ETAStatus}
                          helperText={errors?.ETAStatus ? errors.ETAStatus.message : null}
                        />
                      }}
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
                disabled={dialogState.isSubmit}
                fullWidth
                size='small'
                label={intl.formatMessage({ id: 'mold.Remark' })}
                {...register('Remark')}
                error={!!errors?.Remark}
                helperText={errors?.Remark ? errors.Remark.message : null}
              />
            </Grid>
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