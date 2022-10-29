import React, { useEffect, useState, useRef } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { CombineStateToProps, CombineDispatchToProps } from "@plugins/helperJS";
import { User_Operations } from "@appstate/user";

import {
    MuiDialog,
    MuiResetButton,
    MuiSubmitButton,
    MuiDateTimeField,
    MuiAutoComplete,
    MuiAutoComplete,
    MuiTextField,
} from "@controls";
import { yupResolver } from "@hookform/resolvers/yup";
import { Checkbox, FormControlLabel, Grid, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import * as yup from "yup";
import { workOrderService } from "@services";
import { ErrorAlert, SuccessAlert } from "@utils";
import { CREATE_ACTION, UPDATE_ACTION } from "@constants/ConfigConstants";
import { useFormik } from "formik";
import moment from "moment";

const WorkOrderDialog = (props) => {

    let isRendered = useRef(true);

    const {
        initModal,
        isOpen,
        onClose,
        setNewData,
        setUpdateData,
        mode,
        valueOption,
    } = props;


    const intl = useIntl();
    const [dialogState, setDialogState] = useState({
        ...initModal,
        isSubmit: false,
    });

    const formik = useFormik({
        validationSchema: schema,
        initialValues:
            mode === UPDATE_ACTION
                ? {
                    ...initModal,
                    StartDate: moment(initModal.StartDate).add(7, "hours"),
                }
                : { ...initModal },
        enableReinitialize: true,
        onSubmit: async (values, actions) => {
            await onSubmit(values);
            // actions.setSubmitting(false);
        },
    });

    const {
        handleChange,
        handleBlur,
        handleSubmit,
        values,
        setFieldValue,
        errors,
        touched,
        isValid,
        resetForm,
    } = formik;
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
            // const res = await workOrderService.create(data);
            // if (res && isRendered) {
            //     if (res.HttpResponseCode === 200 && res.Data) {
            //         SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
            //         setNewData({ ...res.Data });
            //         setDialogState({ ...dialogState, isSubmit: false });
            //         // handleReset();
            //     } else {
            //         ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
            //         setDialogState({ ...dialogState, isSubmit: false });
            //     }
            // }
        } else {
            // const res = await workOrderService.modify(data);
            // if (res) {
            //     if (res.HttpResponseCode === 200) {
            //         SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
            //         setUpdateData({ ...res.Data });
            //         setDialogState({ ...dialogState, isSubmit: false });
            //         handleReset();
            //         handleCloseDialog();
            //     } else {
            //         ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
            //         setDialogState({ ...dialogState, isSubmit: false });
            //     }
            // } else {
            //     ErrorAlert(intl.formatMessage({ id: "general.system_error" }));
            //     setDialogState({ ...dialogState, isSubmit: false });
            // }
        }
        setDialogState({ ...dialogState, isSubmit: false });
    };

    return (
        <div>WorkOrderDialog</div>
    )
}

User_Operations.toString = function () {
    return "User_Operations";
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

export default connect(mapStateToProps, mapDispatchToProps)(WorkOrder);