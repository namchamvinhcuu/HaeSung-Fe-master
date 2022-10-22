import { MuiDialog, MuiSubmitButton } from '@controls'
import {
    Autocomplete,
    Checkbox, FormControlLabel, Grid, TextField
} from '@mui/material'
import { permissionService } from '@services'
import { ErrorAlert, SuccessAlert } from '@utils'
import { useFormik } from 'formik'
import React, { useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import * as yup from 'yup'

const CreatePermissionDialog = (props) => {
    let isRendered = useRef(true);
    const intl = useIntl();

    const { initModal, isOpen, onClose, refreshGrid } = props;

    const dataModalRef = useRef({ ...initModal });

    const [dialogState, setDialogState] = useState({
        ...initModal,
        isSubmit: false,
    })

    const [permissionTypeArr, setPermissionTypeArr] = useState([])

    const schema = yup.object().shape({
        commonDetailId: yup.number().required(intl.formatMessage({ id: 'general.one_data_at_least' })),
    })

    const handleCloseDialog = () => {
        setDialogState({
            ...dialogState
        });
        formik.resetForm();
        onClose();
    }

    const getPermissionTypeArr = async () => {
        const res = await permissionService.getPermissionTypeArr();
        if (res && isRendered)
            if (res.HttpResponseCode === 200 && res.Data) {

                setPermissionTypeArr([...res.Data])
            }
            else {
                setPermissionTypeArr([])
            }
    }

    useEffect(() => {
        if (isOpen)
            getPermissionTypeArr();

        return () => {
            isRendered = false;
        }
    }, [isOpen, dialogState]);

    const formik = useFormik({
        validationSchema: schema,
        initialValues: { ...initModal },
        onSubmit: async values => {
            console.log(values);
            const res = await permissionService.createPermission(values);
            if (res.HttpResponseCode === 200) {
                SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }))
                setDialogState({ ...dialogState, isSubmit: false });
                refreshGrid()
                handleCloseDialog();
            }
            else {
                ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }))
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
                    <Grid item xs={9}>
                        <Autocomplete
                            options={permissionTypeArr}
                            getOptionLabel={(permissionType) => `${permissionType?.commonDetailName} `}
                            onChange={(e, value) => setFieldValue("commonDetailId", value?.commonDetailId || "")}
                            onOpen={handleBlur}
                            includeInputInList
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    fullWidth
                                    size='small'
                                    label="Permission"
                                    name="commonDetailId"
                                    variant="outlined"
                                    error={Boolean(touched.commonDetailId && errors.commonDetailId)}
                                    helperText={touched.commonDetailId && errors.commonDetailId}
                                />
                            )}
                        />
                    </Grid>
                    <Grid item xs={3}>
                        <FormControlLabel
                            control={<Checkbox checked={values.forRoot} />}
                            label='For Root'
                            name="forRoot"
                            onChange={formik.handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Grid
                            container
                            direction="row-reverse"
                        >
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

export default CreatePermissionDialog