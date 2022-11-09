import React, { useState, useRef, useEffect } from "react";
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { CombineStateToProps, CombineDispatchToProps } from '@plugins/helperJS'
import { User_Operations } from '@appstate/user'
import { Store } from '@appstate'

import moment from "moment";
import Grid from "@mui/material/Grid";
import Typography from '@mui/material/Typography';
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
    const intl = useIntl();

    const [materialRecevingState, setMaterialRecevingState] = useState({
        isLoading: false,
        data: [],
        totalRow: 0,
        page: 1,
        pageSize: 20,

    });

    const [lotInput, setLotInput] = useState('');
    const [focus, setFocus] = useState(true);
    const [newData, setNewData] = useState({ ...LotDto });

    const handleLotInputChange = (e) => {
        setLotInput(e.target.value)
    }

    const keyPress = async (e) => {
        if (e.key === "Enter") {
            setLotInput('');
            setFocus(true);

            await handleReceivingLot(e.target.value);
        }
    };

    const handleReceivingLot = async (inputValue) => {
        const res = await materialReceivingService.receivingLot(inputValue);
        if (res && isRendered) {
            if (res.HttpResponseCode === 200 && res.Data) {
                setNewData({ ...res.Data });
            }
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
            field: "LotCode",
            headerName: "Lot Code",
            width: 350,
        },

        {
            field: "MaterialCode",
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
                if (params.row.QCResult == true) {
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

    // useEffect(() => {

    //     return () => {
    //         isRendered = false;
    //     };
    // }, []);

    useEffect(() => {
        if (!_.isEmpty(newData) && !_.isEqual(newData, LotDto)) {
            const data = [newData, ...materialRecevingState.data];
            // if (data.length > deliveryOrderState.pageSize) {
            //     data.pop();
            // }
            if (isRendered)
                setMaterialRecevingState({
                    ...materialRecevingState,
                    data: [...data],
                    totalRow: materialRecevingState.totalRow + 1,
                });
        }

        return () => {
            isRendered = false;
        };
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
                                label="Lot"
                                autoFocus={focus}
                                value={lotInput}
                                onChange={handleLotInputChange}
                                onKeyDown={keyPress}
                            // sx={{ mb: 0.5 }}
                            />
                        </Grid>
                        <Grid item xs={2.5}>
                            <MuiButton
                                text="scan"
                                color="success"
                                onClick={() => {
                                    // toggleDialog(CREATE_ACTION);
                                }}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            <MuiDataGrid
                showLoading={materialRecevingState.isLoading}
                isPagingServer={false}
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