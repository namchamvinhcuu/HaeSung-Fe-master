import React, { useEffect, useRef, useState } from "react";
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { CombineStateToProps, CombineDispatchToProps } from '@plugins/helperJS'
import { User_Operations } from '@appstate/user'
import { Store } from '@appstate'
import { Grid } from '@mui/material'
import {
    MuiAutocomplete,
    MuiButton,
    MuiDataGrid,
    MuiDateField,
    MuiSearchField
} from "@controls";
import { useIntl } from "react-intl";
import { FormControlLabel, Switch } from "@mui/material";
import { materialSOService } from "@services";
import { MaterialSOMasterDto, MaterialSODetailDto, } from "@models";
import { addDays, ErrorAlert, SuccessAlert } from "@utils";
import { MaterialSODetail, MaterialSODialog } from '@components'
import moment from "moment";

const MaterialPicking = (props) => {
    let isRendered = useRef(true);
    const intl = useIntl();
    const [MsoId, setMsoId] = useState(null);
    const [materialSOPicking, setMaterialSOPicking] = useState({
        isLoading: false,
        data: [],
        totalRow: 0,
        page: 1,
        pageSize: 8,
        searchData: {
            ...MaterialSOMasterDto,
            EndSearchingDate: addDays(new Date(), 7)
        }
    });

    // const [mode, setMode] = useState(CREATE_ACTION);

    // const [newData, setNewData] = useState({ ...MaterialSOMasterDto });

    const [showActivedData, setShowActivedData] = useState(true);

    const [selectedRow, setSelectedRow] = useState({
        ...MaterialSOMasterDto,
    });

    // const toggleDialog = (mode) => {
    //     if (mode === CREATE_ACTION) {
    //         setMode(CREATE_ACTION);
    //     } else {
    //         setMode(UPDATE_ACTION);
    //     }
    //     setIsOpenDialog(!isOpenDialog);
    // };

    const changeSearchData = async (e, inputName) => {
        let newSearchData = { ...materialSOPicking.searchData };

        newSearchData[inputName] = e;

        switch (inputName) {
            case "StartSearchingDate":
            case "EndSearchingDate":
                newSearchData[inputName] = e;
                break;
            default:
                newSearchData[inputName] = e.target.value;
                break;
        }

        setMaterialSOPicking({
            ...materialSOPicking,
            searchData: { ...newSearchData },
        });
    };

    const handleshowActivedData = async (event) => {
        setShowActivedData(event.target.checked);
        if (!event.target.checked) {
            setMaterialSOPicking({
                ...materialSOPicking,
                page: 1,
            });
        }
    };

    const handleRowSelection = (arrIds) => {
        const rowSelected = materialSOPicking.data.filter(function (item) {
            return item.MsoId === arrIds[0];
        });

        if (rowSelected && rowSelected.length > 0) {
            setSelectedRow({ ...rowSelected[0] });
        } else {
            setSelectedRow({ ...MaterialSOMasterDto });
        }
    };

  

    const fetchData = async () => {
        setMsoId(null)
        let flag = true;
        let message = "";
        const checkObj = { ...materialSOPicking.searchData };
        _.forOwn(checkObj, (value, key) => {
            switch (key) {
                case "StartSearchingDate":
                    if (value == "Invalid Date") {
                        message = "general.StartSearchingDate_invalid";
                        flag = false;
                    }
                    break;
                case "EndSearchingDate":
                    if (value == "Invalid Date") {
                        message = "general.EndSearchingDate_invalid";
                        flag = false;
                    }
                    break;

                default:
                    break;
            }
        });

        if (flag && isRendered) {
            setMaterialSOPicking({
                ...materialSOPicking,
                isLoading: true,
            });

            const params = {
                page: materialSOPicking.page,
                pageSize: materialSOPicking.pageSize,
                MsoCode: materialSOPicking.searchData.MsoCode.trim(),
                StartSearchingDate: materialSOPicking.searchData.StartSearchingDate,
                EndSearchingDate: materialSOPicking.searchData.EndSearchingDate,
                isActived: showActivedData,
            };

            const res = await materialSOService.getMsoMasters(params);

            if (res && isRendered)
            setMaterialSOPicking({
                    ...materialSOPicking,
                    data: !res.Data ? [] : [...res.Data],
                    totalRow: res.TotalRow,
                    isLoading: false,
                });
        } else {
            ErrorAlert(intl.formatMessage({ id: message }));
        }
    }

    const columns = [
        { field: "MsoId", headerName: "", hide: true },

        {
            field: "id",
            headerName: "",
            width: 100,
            filterable: false,
            renderCell: (index) =>
                index.api.getRowIndex(index.row.MsoId) +
                1 +
                (materialSOPicking.page - 1) * materialSOPicking.pageSize,
        },

        {
            field: "MsoCode",
            headerName: intl.formatMessage({ id: "material-so-master.MsoCode" }),
      /*flex: 0.7,*/ width: 150,
        },

        {
            field: "MsoStatus",
            headerName: intl.formatMessage({ id: "material-so-master.MsoStatus" }),
            align:"center",
      /*flex: 0.7,*/ width: 120,
            renderCell: (params) => { 
                return(
                    params.row.MsoStatus
                    ?<span className="badge badge-success" style={{fontSize:"13px"}}>DONE</span>
                    :<span className="badge badge-danger" style={{fontSize:"13px"}}>NOT YET</span>
                );
            }
        },

        {
            field: "Requester",
            headerName: intl.formatMessage({ id: "material-so-master.Requester" }),
      /*flex: 0.7,*/ width: 200,
        },

        {
            field: "DueDate",
            headerName: intl.formatMessage({ id: "material-so-master.DueDate" }),
            width: 150,
            valueFormatter: (params) => {
                if (params.value !== null) {
                    return moment(params?.value)
                        .add(7, "hours")
                        .format("YYYY-MM-DD");
                }
            },
        },

        {
            field: "Remark",
            headerName: intl.formatMessage({ id: "material-so-master.Remark" }),
      /*flex: 0.7,*/ width: 400,
        },

        {
            field: "createdName",
            headerName: intl.formatMessage({ id: "general.createdName" }),
            width: 150,
        },

        {
            field: "createdDate",
            headerName: intl.formatMessage({ id: "general.created_date" }),
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
            field: "modifiedName",
            headerName: intl.formatMessage({ id: "general.modifiedName" }),
            width: 150,
        },

        {
            field: "modifiedDate",
            headerName: intl.formatMessage({ id: "general.modified_date" }),
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
    }, [materialSOPicking.page, materialSOPicking.pageSize, showActivedData]);

    useEffect(() => {
        if (!_.isEmpty(selectedRow) && !_.isEqual(selectedRow, MaterialSOMasterDto)) {
            let newArr = [...materialSOPicking.data];
            const index = _.findIndex(newArr, function (o) {
                return o.MsoId == selectedRow.MsoId;
            });
            if (index !== -1) {
                newArr[index] = selectedRow;
            }

            setMaterialSOPicking({
                ...materialSOPicking,
                data: [...newArr],
            });
        }
    }, [selectedRow]);
    return (
        <React.Fragment>
            <Grid
                container
                spacing={2}
                justifyContent="flex-end"
                alignItems="flex-end"
            >
                <Grid item xs={1.5}>
                    {/* <MuiButton
                        text="create"
                        color="success"
                        onClick={() => {
                            toggleDialog(CREATE_ACTION);
                        }}
                    /> */}
                </Grid>

                <Grid item xs>
                    <MuiSearchField
                        label="material-so-master.MsoCode"
                        name="MsoCode"
                        onClick={fetchData}
                        onChange={(e) => changeSearchData(e, "MsoCode")}
                    />
                </Grid>

                <Grid item xs>
                    <MuiDateField
                        disabled={materialSOPicking.isLoading}
                        label={intl.formatMessage({
                            id: "general.StartSearchingDate",
                        })}
                        value={materialSOPicking.searchData.StartSearchingDate}
                        onChange={(e) => {
                            changeSearchData(e, "StartSearchingDate");
                        }}
                        variant="standard"
                    />
                </Grid>

                <Grid item xs>
                    <MuiDateField
                        disabled={materialSOPicking.isLoading}
                        label={intl.formatMessage({
                            id: "general.EndSearchingDate",
                        })}
                        value={materialSOPicking.searchData.EndSearchingDate}
                        onChange={(e) => {
                            changeSearchData(e, "EndSearchingDate");
                        }}
                        variant="standard"
                    />
                </Grid>

                <Grid item xs={2.5}>
                    <Grid
                        container
                        justifyContent="space-around"
                        alignItems="flex-end"
                    >
                        <Grid item>
                            <MuiButton text="search" color="info" onClick={fetchData} />
                        </Grid>

                        <Grid item>
                            <FormControlLabel
                                sx={{ mb: 0, ml: "1px" }}
                                control={
                                    <Switch
                                        defaultChecked={true}
                                        color="primary"
                                        onChange={(e) => handleshowActivedData(e)}
                                    />
                                }
                                label={showActivedData ? "Actived" : "Deleted"}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            <MuiDataGrid
                showLoading={materialSOPicking.isLoading}
                isPagingServer={true}
                headerHeight={45}
                // rowHeight={30}
                // gridHeight={736}
                columns={columns}
                rows={materialSOPicking.data}
                page={materialSOPicking.page - 1}
                pageSize={materialSOPicking.pageSize}
                rowCount={materialSOPicking.totalRow}
                onPageChange={(newPage) => {
                    setMaterialSOPicking({ ...materialSOPicking, page: newPage + 1 });
                }}
                getRowId={(rows) => rows.MsoId}
                onSelectionModelChange={(newSelectedRowId) =>
                    {
                        handleRowSelection(newSelectedRowId);
                        setMsoId(newSelectedRowId[0]);
                    }
                }
                // getRowClassName={(params) => {
                //     if (_.isEqual(params.row, newData)) {
                //         return `Mui-created`;
                //     }
                // }}
                initialState={{ pinnedColumns: { right: ['action'] } }}
            />

            {/* <MaterialSODialog
                setNewData={setNewData}
                setUpdateData={setSelectedRow}
                initModal={mode === CREATE_ACTION ? MaterialSOMasterDto : selectedRow}
                isOpen={isOpenDialog}
                onClose={toggleDialog}
                mode={mode}
            /> */}

            <MaterialSODetail MsoId={MsoId} fromPicking={true}/>
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

export default connect(mapStateToProps, mapDispatchToProps)(MaterialPicking);