import React, { useState, useEffect, useRef } from "react";
import { Box, TextField, FormControl, Button, Grid, FormControlLabel, Checkbox, Switch, Tooltip, Typography, CardContent, Card, IconButton, CardActions, Collapse, Divider } from "@mui/material";
import { useModal, SelectBox, ButtonAsync, DataTable, DateField, ImgField, DraggableDialog } from "@basesShared";
import moment from "moment";
import ImageUploading from "react-images-uploading";
import * as ConfigConstants from '@constants/ConfigConstants';
import AndroidIcon from '@mui/icons-material/Android';
import DownloadIcon from '@mui/icons-material/Download';
import { ExpandMore } from "@mui/icons-material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsIcon from '@mui/icons-material/Settings';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import axios from 'axios';
import { useIntl } from 'react-intl'
import { versionAppService } from '@services'
import { ErrorAlert, SuccessAlert } from '@utils'
import fileDownload from 'js-file-download';

export default function VersionApp({ t }) {
    const intl = useIntl();
    const { isShowing, toggle } = useModal();

    const [info, setInfo] = useState({
        ...versionAppDto
    })

    const [data, setData] = useState([versionAppDto]);
    const [error, setError] = useState({});
    const [selectedFile, setSelectedFile] = useState();
    const gridRef = useRef();

    const versionAppDto = {

        id_app: 0
        , version: 0
        , file: ''

    }
    useEffect(() => {
        getListApkApp();

    }, [])

    useEffect(() => {
    }, [info])



    const getListApkApp = async () => {
        const res = await versionAppService.getListApkApp();
        if (res.HttpResponseCode === 200 && res.Data) {
            setInfo({ ...res.Data });
        }
        else {
            setInfo([])
        }
    }
    const changeHandler = (event) => {
        setSelectedFile(event.target.files[0]);
    };
    const handleDownload = async (e) => {
        try {

            const res = await versionAppService.downloadApp();

            // axios.get('https://localhost:44301/api/VersionApp/download-versionApp', {
            //     responseType: 'blob', // important
            // }).then(response => {
            //     const url = window.URL.createObjectURL(new Blob([response.data]));
            //     const link = document.createElement('a');
            //     link.href = url;
            //     link.setAttribute('download', 'app.apk'); //or any other extension
            //     document.body.appendChild(link);
            //     link.click();
            // });;

        } catch (error) {
            alert("fe");
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

            // const formData = new FormData();
            // formData.append("file", selectedFile);
            // formData.append("id_app", info.id_app);
            // formData.append("version", data.version);
            // try {
            //     let res = await axios({
            //         method: "post",
            //         url: "/api/VersionApp/update-versionApp",
            //         data: formData,
            //         headers: { "Content-Type": "multipart/form-data" },
            //     })

            //     if (res.status == 200) {
            //         setInfo({ ...res.data.Data });
            //         SuccessAlert("Update files success");
            //     }
            // } catch (error) {

            // }


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
                            <Button variant="outlined" sx={{ m: 1 }} startIcon={<DownloadIcon />} onClick={() => handleDownload()}>{t("Down load")}</Button></>
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
                                    {t("Update new Vesion")}</Button>
                            </div>
                        </Collapse>
                    </Card>
                </div>
            </Box>
        </>
    )
}



