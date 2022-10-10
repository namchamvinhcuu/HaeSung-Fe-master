import React, { useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { ErrorAlert, SuccessAlert } from '@utils'

import { SupplierDto } from '@models'
import { supplierService } from '@services'

const CreateSupplierDialog = (props) => {
    const intl = useIntl();

    const { initModal, isOpen, onClose, setNewData } = props;

    const [dialogState, setDialogState] = useState({
        ...initModal,
        isSubmit: false,
    });

    const schema = yup.object().shape({
        SupplierCode: yup.string().required(intl.formatMessage({ id: 'general.field_required' })),
        SupplierName: yup.string().required(intl.formatMessage({ id: 'general.field_required' })),
    })

    const formik = useFormik({
        validationSchema: schema,
        initialValues: { ...initModal },
        onSubmit: async values => {
            console.log(values);
            const res = await supplierService.create(values);
            if (res.HttpResponseCode === 200 && res.Data) {
                SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
                setNewData({ ...res.Data });
                setDialogState({ ...dialogState, isSubmit: false });
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

    const handleCloseDialog = () => {
        setDialogState({
            ...dialogState
        });
        formik.resetForm();
        onClose();
    }

    useEffect(() => {
        if (isOpen)
            getPermissionTypeArr(dialogState.menuLevel);
    }, [isOpen, dialogState]);

    return (
        <div>CreateSupplierDialog</div>
    )
}

export default CreateSupplierDialog