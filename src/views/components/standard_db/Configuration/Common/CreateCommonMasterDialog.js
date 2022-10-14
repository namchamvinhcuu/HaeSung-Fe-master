import { MuiDialog, MuiResetButton, MuiSubmitButton } from '@controls'
import { yupResolver } from '@hookform/resolvers/yup'
import {
    Autocomplete,
    Checkbox, FormControlLabel, Grid, RadioGroup, TextField
} from '@mui/material'
import { useFormik } from 'formik'
import React, { useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import * as yup from 'yup'

import { commonService } from '@services'
import { ErrorAlert, SuccessAlert } from '@utils'
import { GetLocalStorage, SetLocalStorage, RemoveLocalStorage } from '@utils'
import * as ConfigConstants from '@constants/ConfigConstants';

const CreateCommonMasterDialog = (props) => {
    const intl = useIntl();

    const { initModal, isOpen, onClose, setNewData } = props;

    const dataModalRef = useRef({ ...initModal });

    const [dialogState, setDialogState] = useState({
        ...initModal,
        isSubmit: false,
    })




    const schema = yup.object().shape({
        commonMasterName: yup.string().required(intl.formatMessage({ id: 'general.name' })),
    });

    const formik = useFormik({
        validationSchema: schema,
        initialValues: { ...initModal },
        onSubmit: async values => {
            console.log(values);
            const res = await commonService.createCommonMaster(values);
            if (res.HttpResponseCode === 200) {
                SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }))
                setNewData({ ...res.Data });
                setDialogState({ ...dialogState, isSubmit: false });
                handleCloseDialog();
            }
            else {
                ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }))
                handleCloseDialog();
            }
        }
    });
    const {
        handleChange
        , handleBlur
        , handleSubmit
        , values
        , setFieldValue
        , errors
        , touched
        , isValid
    } = formik;


    const handleCloseDialog = () => {
        setDialogState({
            ...dialogState
        });
        formik.resetForm();
        onClose();
    }
    const RoleUser = GetLocalStorage(ConfigConstants.CURRENT_USER);
    const setRole = RoleUser.RoleNameList.replace(" ","");
    const RoleArr = setRole.split(',');

    return (
        <MuiDialog
            maxWidth='sm'
            title={intl.formatMessage({ id: 'general.create' })}
            isOpen={isOpen}
            disabledCloseBtn={dialogState.isSubmit}
            disable_animate={300}
            onClose={handleCloseDialog}
        >
            <form onSubmit={handleSubmit}>
                <Grid container rowSpacing={2.5} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                    <Grid item xs={12}>
                        <Grid container spacing={2}>
                            <Grid item xs={RoleArr.includes('ROOT') ? 9 : 12}>
                                <TextField
                                    autoFocus
                                    fullWidth
                                    size='small'
                                    disabled={dialogState.isSubmit}
                                    label={intl.formatMessage({ id: 'general.name' })}
                                    name='commonMasterName'
                                    value={values.commonMasterName}
                                    onChange={handleChange}
                                    error={touched.commonMasterName && Boolean(errors.commonMasterName)}
                                    helperText={touched.commonMasterName && errors.commonMasterName}
                                />
                            </Grid>
                            {RoleArr.includes('ROOT') &&
                                <Grid item xs={3}>
                                    <FormControlLabel
                                        control={<Checkbox checked={values.forRoot} />}
                                        label='For Root'
                                        name="forRoot"
                                        onChange={formik.handleChange}
                                    />
                                </Grid>
                            }
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container direction="row-reverse">
                            <MuiSubmitButton
                                text="save"
                                loading={dialogState.isSubmit}
                            />
                            {/* <MuiResetButton
                                onClick={handleReset}
                                disabled={dialogState.isSubmit}
                            /> */}
                        </Grid>
                    </Grid>
                </Grid>
            </form>
        </MuiDialog>
    )
}

export default CreateCommonMasterDialog