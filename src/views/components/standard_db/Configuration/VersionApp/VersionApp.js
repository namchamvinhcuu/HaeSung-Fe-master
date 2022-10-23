import { useModal } from "@basesShared";
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { CombineStateToProps, CombineDispatchToProps } from '@plugins/helperJS'
import { User_Operations } from '@appstate/user'
import { Store } from '@appstate'
import AndroidIcon from '@mui/icons-material/Android';
import DownloadIcon from '@mui/icons-material/Download';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import SettingsIcon from '@mui/icons-material/Settings';
import { Box, Button, Card, CardActions, Collapse, Divider, IconButton, TextField } from "@mui/material";
import { versionAppService } from '@services';
import { ErrorAlert, SuccessAlert } from '@utils';
import React, { useEffect, useRef, useState } from "react";
import { useIntl } from 'react-intl';

const VersionApp = ({ t, ...props }) => {
    const { language } = props;

    let isRendered = useRef(true);
    const intl = useIntl();
    const { isShowing, toggle } = useModal();

    const [info, setInfo] = useState({
        ...versionAppDto
    })

    const [data, setData] = useState([versionAppDto]);
    const [error, setError] = useState({});
    const [selectedFile, setSelectedFile] = useState();

    const versionAppDto = {
        id_app: 0
        , version: 0
        , file: ''
    }

    useEffect(() => {

        window.i18n.changeLanguage(language.toString().toLowerCase());

        getListApkApp();

        return () => {
            isRendered = false;
        }
    }, [language])

    const getListApkApp = async () => {
        const res = await versionAppService.getListApkApp();
        if (res && isRendered)
            if (res.HttpResponseCode === 200 && res.Data) {
                setInfo({ ...res.Data });
            }
            else {
                setInfo({})
            }
    }

    const changeHandler = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleDownload = async (e) => {
        try {

            await versionAppService.downloadApp();

        } catch (error) {
            console.log(`ERROR: ${error}`);
        }
    }

    const handleUpload = async () => {
        if (!selectedFile) {
            return ErrorAlert("Chưa chọn file update")
        }

        if (data.version) {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("id_app", info.id_app);
            formData.append("version", data.version);

            const res = await versionAppService.modify(formData);
            if (res.HttpResponseCode === 200) {
                SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }))
                setInfo({ ...res.Data });
            }
            else {
                ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }))
            }

        }
        else {
            setError({ ...error, Version: (data.version == undefined || data.version == '' ? 'This field is required.' : '') });
        }
    }

    return (
        <>
            <Box sx={{ pb: 3, height: 700, width: "100%" }}>
                <div>
                    <Card sx={{ margin: 'auto', width: 500, textAlign: 'center', mt: 5 }}>
                        {info != null ? <>
                            <AndroidIcon sx={{ fontSize: 180, margin: 'auto', display: 'block' }} />
                            <p style={{ fontWeight: 600, fontSize: '28px' }}> {info.name_file}</p>
                            <p>Version: {info.version}</p>
                            <p>Date: {info.change_date}</p>
                            <Button variant="outlined" sx={{ m: 1 }} startIcon={<DownloadIcon />} onClick={() => handleDownload()}>{t("Download")}</Button></>
                            : null}
                        <CardActions disableSpacing>
                            <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggle} sx={{ mr: 2 }}>
                                <SettingsIcon />
                            </IconButton>
                        </CardActions>
                        <Collapse in={isShowing} timeout="auto" unmountOnExit sx={{ pr: 3, pl: 3 }}>
                            <Divider light style={{ marginBottom: '20px' }} />
                            <TextField
                                fullWidth
                                type="number"
                                margin="dense"
                                label="Version"
                                onChange={(e) => {
                                    setData({ ...data, version: e.target.value });
                                    setError({ ...error, version: (e.target.value == '' ? 'This field is required.' : e.target.value.length > 8 ? 'Max length is 8 letter.' : '') });
                                }}
                                error={error.version ? true : false}
                                helperText={error.version ? error.version : ''}
                            />
                            <input type="file" name="file"
                                onChange={changeHandler}
                                style={{ float: 'left', marginTop: '20px' }} />
                            <div style={{ marginBottom: '20px' }}>
                                <Button variant="outlined" sx={{ mt: 3, width: '100%', height: "56px" }}
                                    startIcon={<FileUploadIcon />} onClick={() => handleUpload()}>
                                    {t("Upload")}</Button>
                            </div>
                        </Collapse>
                    </Card>
                </div>
            </Box>
        </>
    )
}

User_Operations.toString = function () {
    return 'User_Operations';
}

const mapStateToProps = state => {

    const { User_Reducer: { language } } = CombineStateToProps(state.AppReducer, [
        [Store.User_Reducer]
    ]);

    return { language };

};

const mapDispatchToProps = dispatch => {

    const { User_Operations: { changeLanguage } } = CombineDispatchToProps(dispatch, bindActionCreators, [
        [User_Operations]
    ]);

    return { changeLanguage }

};

export default connect(mapStateToProps, mapDispatchToProps)(VersionApp)



