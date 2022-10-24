import { Store } from '@appstate'
import { User_Operations } from '@appstate/user'
import { MuiButton, MuiDataGrid, MuiSearchField } from '@controls'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import UndoIcon from '@mui/icons-material/Undo'
import { FormControlLabel, Switch } from "@mui/material"
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS'
import _ from 'lodash'
import moment from "moment"
import React, { useEffect, useState, useRef } from 'react'
import { useIntl } from 'react-intl'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { LineDto } from '@models'
import { lineService } from '@services'
import { ErrorAlert, SuccessAlert } from '@utils'


import CreateLineDialog from './CreateLineDialog'
import ModifyLineDialog from './ModifyLineDialog'

const Line = (props) => {
    let isRendered = useRef(false);
    const intl = useIntl();

    const [lineState, setLineState] = useState({
        isLoading: false,
        data: [],
        totalRow: 0,
        page: 1,
        pageSize: 20,
        searchData: {
            LineName: ''
        }
    });

    const [isOpenCreateDialog, setIsOpenCreateDialog] = useState(false);
    const [isOpenModifyDialog, setIsOpenModifyDialog] = useState(false);
    const [showActivedData, setShowActivedData] = useState(true);

    const [selectedRow, setSelectedRow] = useState({
        ...LineDto
    });

    const [newData, setNewData] = useState({ ...LineDto });

    const toggleCreateDialog = () => {
        setIsOpenCreateDialog(!isOpenCreateDialog);
    }

    const toggleModifyDialog = () => {
        setIsOpenModifyDialog(!isOpenModifyDialog);
    }

    const handleRowSelection = (arrIds) => {
        const rowSelected = lineState.data.filter(function (item) {
            return item.LineId === arrIds[0]
        });

        if (rowSelected && rowSelected.length > 0) {
            setSelectedRow({ ...rowSelected[0] });
        }
        else {
            setSelectedRow({ ...LineDto });
        }
    }

    const changeSearchData = (e, inputName) => {
        let newSearchData = { ...lineState.searchData };
        newSearchData[inputName] = e.target.value;

        setLineState({ ...lineState, searchData: { ...newSearchData } })
    }

    const fetchData = async () => {
        setLineState({
            ...lineState
            , isLoading: true

        });
        const params = {
            page: lineState.page,
            pageSize: lineState.pageSize,
            LineName: lineState.searchData.LineName.trim(),
            isActived: showActivedData,
        }
        const res = await lineService.get(params);

        if (res && isRendered)
            setLineState({
                ...lineState
                , data: !res.Data ? [] : [...res.Data]
                , totalRow: res.TotalRow
                , isLoading: false
            });
    }

    const handleDelete = async (line) => {
        if (window.confirm(intl.formatMessage({ id: showActivedData ? 'general.confirm_delete' : 'general.confirm_redo_deleted' }))) {
            try {
                let res = await lineService.handleDelete(line);
                if (res && res.HttpResponseCode === 200) {
                    await fetchData();
                }
                else {
                    ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }))
                }
            } catch (error) {
                console.log(error)
            }
        }
    }

    const handleshowActivedData = async (event) => {
        setShowActivedData(event.target.checked);
        if (!event.target.checked) {
            setLineState({
                ...lineState
                , page: 1
            });
        }
    };

    useEffect(() => {
        isRendered = true
        if (isRendered)
            fetchData();
        return () => {
            isRendered = false;
        }
    }, [lineState.page, lineState.pageSize, showActivedData]);

    useEffect(() => {
        if (!_.isEmpty(newData) && !_.isEqual(newData, LineDto)) {
            const data = [newData, ...lineState.data]
            if (data.length > lineState.pageSize) {
                data.pop();
            }
            setLineState({
                ...lineState
                , data: [...data]
                , totalRow: lineState.totalRow + 1
            });
        }
    }, [newData]);

    useEffect(() => {
        if (!_.isEmpty(selectedRow) && !_.isEqual(selectedRow, LineDto)) {
            let newArr = [...lineState.data]
            const index = _.findIndex(newArr, (o) => { return o.LineId == selectedRow.LineId; });
            if (index !== -1) {
                newArr[index] = selectedRow
            }
            setLineState({
                ...lineState
                , data: [...newArr]
            });
        }
    }, [selectedRow]);

    const columns = [
        { field: 'LineId', headerName: '', hide: true },
        {
            field: 'id', headerName: '', width: 20,
            filterable: false,
            renderCell: (index) => (index.api.getRowIndex(index.row.LineId) + 1) + (lineState.page - 1) * lineState.pageSize,
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
                    <Grid container spacing={1} alignItems="center" justifyContent="center">
                        <Grid item xs={6}>
                            <IconButton
                                aria-label="edit"
                                color="warning"
                                size="small"
                                sx={[{ '&:hover': { border: '1px solid orange', }, }]}
                                onClick={toggleModifyDialog}
                            >
                                <EditIcon fontSize="inherit" />
                            </IconButton>
                        </Grid>

                        <Grid item xs={6}>
                            <IconButton
                                aria-label="delete"
                                color="error"
                                size="small"
                                sx={[{ '&:hover': { border: '1px solid red', }, }]}
                                onClick={() => handleDelete(params.row)}
                            >
                                {showActivedData ? <DeleteIcon fontSize="inherit" /> : <UndoIcon fontSize="inherit" />}
                            </IconButton>
                        </Grid>
                    </Grid>
                );
            },
        },
        { field: 'LineName', headerName: intl.formatMessage({ id: "line.LineName" }), width: 200, },
        { field: 'Description', headerName: intl.formatMessage({ id: "line.Description" }), width: 500, },
        { field: 'createdName', headerName: intl.formatMessage({ id: "general.createdName" }), width: 150, },
        {
            field: 'createdDate', headerName: intl.formatMessage({ id: "general.created_date" }), width: 200, valueFormatter: params => {
                if (params.value !== null) {
                    return moment(params?.value).add(7, 'hours').format("YYYY-MM-DD HH:mm:ss")
                }
            },
        },
        { field: 'modifiedName', headerName: intl.formatMessage({ id: "general.modifiedName" }), width: 150, },
        {
            field: 'modifiedDate', headerName: intl.formatMessage({ id: "general.modified_date" }), width: 200, valueFormatter: params => {
                if (params.value !== null) {
                    return moment(params?.value).add(7, 'hours').format("YYYY-MM-DD HH:mm:ss")
                }
            },
        },
    ];

    return (
        <React.Fragment>
            <Grid
                container
                spacing={2}
                direction="row"
                justifyContent="space-between"
                alignItems="flex-end"
            >
                <Grid item xs={7}>
                    <MuiButton
                        text="create"
                        color='success'
                        onClick={toggleCreateDialog}
                    />
                </Grid>
                <Grid item xs>
                    <MuiSearchField
                        label='general.name'
                        name='LineName'
                        onClick={fetchData}
                        onChange={(e) => changeSearchData(e, 'LineName')}
                    />
                </Grid>

                <Grid item xs sx={{ display: 'flex', justifyContent: 'right' }}>
                    <MuiButton
                        text="search"
                        color='info'
                        onClick={fetchData}
                    />
                    <FormControlLabel
                        sx={{ mb: 0, ml: '1px' }}
                        control={<Switch defaultChecked={true} color="primary" onChange={(e) => handleshowActivedData(e)} />}
                        label={showActivedData ? "Actived" : "Deleted"} />
                </Grid>

            </Grid>

            <MuiDataGrid
                showLoading={lineState.isLoading}
                isPagingServer={true}
                headerHeight={45}
                // rowHeight={30}
                gridHeight={736}
                columns={columns}
                rows={lineState.data}
                page={lineState.page - 1}
                pageSize={lineState.pageSize}
                rowCount={lineState.totalRow}
                // rowsPerPageOptions={[5, 10, 20, 30]}

                onPageChange={(newPage) => {
                    setLineState({ ...lineState, page: newPage + 1 });
                }}
                // onPageSizeChange={(newPageSize) => {
                //     setLineState({ ...lineState, pageSize: newPageSize, page: 1 });
                // }}
                getRowId={(rows) => rows.LineId}
                onSelectionModelChange={(newSelectedRowId) => {
                    handleRowSelection(newSelectedRowId)
                }}
                // selectionModel={selectedRow.menuId}
                getRowClassName={(params) => {
                    if (_.isEqual(params.row, newData)) {
                        return `Mui-created`
                    }
                }}
            />

            <CreateLineDialog
                initModal={LineDto}
                setNewData={setNewData}
                isOpen={isOpenCreateDialog}
                onClose={toggleCreateDialog}
            />

            <ModifyLineDialog
                initModal={selectedRow}
                setModifyData={setSelectedRow}
                isOpen={isOpenModifyDialog}
                onClose={toggleModifyDialog}
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

export default connect(mapStateToProps, mapDispatchToProps)(Line);