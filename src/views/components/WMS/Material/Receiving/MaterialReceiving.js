import React, { useState, useRef, useEffect } from "react";
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { CombineStateToProps, CombineDispatchToProps } from '@plugins/helperJS'
import { User_Operations } from '@appstate/user'
import { Store } from '@appstate'

import moment from "moment";
import Grid from "@mui/material/Grid";
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import { useIntl } from "react-intl";
import { ErrorAlert, SuccessAlert } from "@utils";
import {
    MuiButton,
    MuiDataGrid,
    MuiTextField
} from "@controls";
import { LotDto } from "@models";
import { materialReceivingService } from "@services";

const MaterialReceiving = (props) => {
    let isRendered = useRef(true);

    const lotInputRef = useRef(null);
    const intl = useIntl();

    console.log('component re-render')

    const [materialRecevingState, setMaterialRecevingState] = useState({
        isLoading: false,
        data: [],
        totalRow: 0,
        page: 1,
        pageSize: 20,
    });

    const [focus, setFocus] = useState(true);
    const [newData, setNewData] = useState({ ...LotDto });
    const [selectedRow, setSelectedRow] = useState({
        ...LotDto,
    });

    const handleLotInputChange = (e) => {
        // setLotInput(e.target.value)
        lotInputRef.current.value = e.target.value;
    }

    const keyPress = async (e) => {
        if (e.key === "Enter") {
            await handleReceivingLot(e.target.value);
            lotInputRef.current.value = '';
            setFocus(true);
        }
    };

    const scanBtnClick = async () => {

        await handleReceivingLot(lotInputRef.current.value);
        // setLotInput('');
        lotInputRef.current.value = '';
        setFocus(true);
    };

    const handleReceivingLot = async (inputValue) => {
        const res = await materialReceivingService.receivingLot({ LotCode: inputValue });
        if (res && isRendered) {
            if (res.HttpResponseCode === 200 && res.Data) {
                setNewData({ ...res.Data });
                SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
            }
            else {
                ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
            }
        }
        else {
            ErrorAlert(intl.formatMessage({ id: "general.system_error" }));
        }
    }

    const handleRowSelection = (arrIds) => {
        const rowSelected = materialRecevingState.data.filter(function (item) {
            return item.Id === arrIds[0];
        });

        if (rowSelected && rowSelected.length > 0) {
            setSelectedRow({ ...rowSelected[0] });
        } else {
            setSelectedRow({ ...LotDto });
        }
    };

    const handleDelete = async (lot) => {
        if (
            window.confirm(
                intl.formatMessage({ id: "general.confirm_delete" })
            )
        ) {
            try {
                let res = await materialReceivingService.handleDelete(lot);
                if (res && res.HttpResponseCode === 200) {
                    await fetchData();
                } else {
                    ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
                }
            } catch (error) {
                console.log(error);
            }
        }
    };

    const fetchData = async () => {

        setMaterialRecevingState({
            ...materialRecevingState,
            isLoading: true,
        });

        const params = {
            page: materialRecevingState.page,
            pageSize: materialRecevingState.pageSize,
            IncomingDate: new Date(),
        };

        const res = await materialReceivingService.get(params);

        if (res && isRendered)
            setMaterialRecevingState({
                ...materialRecevingState,
                data: !res.Data ? [] : [...res.Data],
                totalRow: res.TotalRow,
                isLoading: false,
            });

    };

    const columns = [
        { field: "Id", headerName: "", hide: true },
        {
            field: "id",
            headerName: "",
            width: 80,
            filterable: false,
            renderCell: (index) =>
                index.api.getRowIndex(index.row.Id) + 1 + (materialRecevingState.page - 1) * materialRecevingState.pageSize,
        },

        {
            field: "action",
            headerName: "",
            width: 80,
            // headerAlign: 'center',
            disableClickEventBubbling: true,
            sortable: false,
            disableColumnMenu: true,
            renderCell: (params) => {
                return (
                    <Grid
                        container
                        direction="row"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center' }}>
                            <IconButton
                                aria-label="delete"
                                color="error"
                                size="small"
                                sx={[{ "&:hover": { border: "1px solid red" } }]}
                                onClick={() => handleDelete(params.row)}
                            >
                                <DeleteIcon fontSize="inherit" />
                            </IconButton>
                        </Grid>
                    </Grid>
                );
            },
        },

        {
            field: "LotCode",
            headerName: "Lot Code",
            width: 350,
        },

        {
            field: "MaterialColorCode",
            headerName: "Material Code",
            width: 250,
        },

        {
            field: "Qty",
            headerName: "Qty",
            width: 100,
        },
        {
            field: "QCDate",
            headerName: "QC Date",
            width: 150,
            valueFormatter: (params) => {
                if (params.value !== null) {
                    return moment(params?.value)
                        .add(7, "hours")
                        .format("YYYY-MM-DD HH:mm:ss");
                }
            },
        },
        {
            field: "QCResult",
            headerName: "QC Result",
            width: 100,
            renderCell: (params) => {
                if (params.row.QCResult) {
                    return <Typography>OK</Typography>;
                } else {
                    return <Typography>NG</Typography>;
                }
            },
        },
        {
            field: "IncomingDate",
            headerName: "Incoming Date",
            width: 150,
            valueFormatter: (params) => {
                if (params.value !== null) {
                    return moment(params?.value)
                        .add(7, "hours")
                        .format("YYYY-MM-DD HH:mm:ss");
                }
            },
        },
    ];

    useEffect(() => {
        fetchData();

        return () => {
            isRendered = false;
        };
    }, [materialRecevingState.page, materialRecevingState.pageSize]);

    useEffect(() => {
        if (!_.isEmpty(newData) && !_.isEqual(newData, LotDto)) {
            const data = [newData, ...materialRecevingState.data];
            if (data.length > materialRecevingState.pageSize) {
                data.pop();
            }
            if (isRendered)
                setMaterialRecevingState({
                    ...materialRecevingState,
                    data: [...data],
                    totalRow: materialRecevingState.totalRow + 1,
                });
        }

    }, [newData]);

    return (
        <React.Fragment>
            <Grid
                container
                spacing={2}
                direction="row"
                justifyContent="space-between"
                alignItems="flex-end"
            >
                <Grid item xs={4}></Grid>
                <Grid item xs={8}>
                    <Grid
                        container
                        spacing={2}
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Grid item xs={9.5}>
                            <MuiTextField
                                ref={lotInputRef}
                                label="Lot"
                                autoFocus={focus}
                                // value={lotInputRef.current.value}
                                onChange={handleLotInputChange}
                                onKeyDown={keyPress}
                            />
                        </Grid>
                        <Grid item xs={2.5}>
                            <MuiButton
                                text="scan"
                                color="success"
                                onClick={scanBtnClick}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            <MuiDataGrid
                showLoading={materialRecevingState.isLoading}
                isPagingServer={true}
                headerHeight={45}
                // rowHeight={30}
                // gridHeight={736}
                columns={columns}
                rows={materialRecevingState.data}
                page={materialRecevingState.page - 1}
                pageSize={materialRecevingState.pageSize}
                rowCount={materialRecevingState.totalRow}
                rowsPerPageOptions={[5, 10, 15, 20]}
                onPageChange={(newPage) => {
                    setMaterialRecevingState({ ...materialRecevingState, page: newPage + 1 });
                }}
                onPageSizeChange={(newPageSize) => {
                    setMaterialRecevingState({
                        ...materialRecevingState, page: 1, pageSize: newPageSize,
                    });
                }}
                getRowId={(rows) => rows.Id}
                onSelectionModelChange={(newSelectedRowId) =>
                    handleRowSelection(newSelectedRowId)
                }
                getRowClassName={(params) => {
                    if (_.isEqual(params.row, newData)) {
                        return `Mui-created`;
                    }
                }}
                initialState={{ pinnedColumns: { right: ['action'] } }}
            />
        </React.Fragment>
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

export default connect(mapStateToProps, mapDispatchToProps)(MaterialReceiving);