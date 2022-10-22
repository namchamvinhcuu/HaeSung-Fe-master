import React, { useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { CombineStateToProps, CombineDispatchToProps } from '@plugins/helperJS'
import { User_Operations } from '@appstate/user'
import { Store } from '@appstate'
import { createTheme, ThemeProvider, TextField } from "@mui/material"
import { buyerService } from '@services'
import { useIntl } from 'react-intl'
import FormGroup from '@mui/material/FormGroup';
import Checkbox from '@mui/material/Checkbox';
import Box from "@mui/material/Box";
import Grid from '@mui/material/Grid'
import { MuiButton, MuiDataGrid, MuiSearchField } from '@controls'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import { BuyerDto } from "@models"
import EditIcon from '@mui/icons-material/Edit'
import moment from "moment";
import CreateBuyerDialog from './CreateBuyerDialog'
import ModifyBuyerDialog from './ModifyBuyerDialog'
import _ from 'lodash'
import { FormControlLabel, Switch, Tooltip, Typography } from "@mui/material"
import UndoIcon from '@mui/icons-material/Undo'
import { ErrorAlert, SuccessAlert } from '@utils'


const Buyer = (props) => {
    let isRendered = useRef(false);
    const intl = useIntl();

    
    const [newData, setNewData] = useState({ ...BuyerDto });

    const [selectedRow, setSelectedRow] = useState({
        ...BuyerDto
    })


     const [isOpenCreateDialog, setIsOpenCreateDialog] = useState(false)
     const [isOpenModifyDialog, setIsOpenModifyDialog] = useState(false);
     const [showActivedData, setShowActivedData] = useState(true);

    const toggleCreateDialog = () => {

        setIsOpenCreateDialog(!isOpenCreateDialog);
    }

    const toggleModifyDialog = () => {
        setIsOpenModifyDialog(!isOpenModifyDialog);
    }


    const [buyerState, setbuyerState] = useState({
        isLoading: false,
        data: [],
        totalRow: 0,
        page: 1,
        pageSize: 20,
        searchData: {
            BuyerCode: null,
            BuyerName: null
        }
    });

    const handleRowSelection = (arrIds) => {

        const rowSelected = buyerState.data.filter(function (item) {
            return item.BuyerId === arrIds[0]
        });
        if (rowSelected && rowSelected.length > 0) {
            setSelectedRow({ ...rowSelected[0] });
           
        }
        else {
            setSelectedRow({ ...BuyerDto });
           
        }

    }

    const changeSearchData = (e, inputName) => {
        let newSearchData = { ...buyerState.searchData };
        newSearchData[inputName] = e.target.value;

        setbuyerState({ ...buyerState, searchData: { ...newSearchData } })
    }

    async function fetchData() {
        setbuyerState({
            ...buyerState
            , isLoading: true

        });
        const params = {
            page: buyerState.page,
            pageSize: buyerState.pageSize,
            BuyerCode: buyerState.searchData.BuyerCode,
            BuyerName: buyerState.searchData.BuyerName,
            isActived: showActivedData,
        }
        //console.log(params,'dsds');
       const res = await buyerService.getBuyerList(params);
     
       if (res && isRendered)
        setbuyerState({
           ...buyerState
           , data: !res.Data ? [] : [...res.Data]
           , totalRow: res.TotalRow
           , isLoading: false
       });
    }

    const handleDeleteBuyer = async (buyer) => {
        if (window.confirm(intl.formatMessage({ id: showActivedData ? 'general.confirm_delete' : 'general.confirm_redo_deleted' }))) {
            try {
                let res = await buyerService.deleteBuyer(buyer);
                if (res && res.HttpResponseCode === 200) {
                    SuccessAlert(intl.formatMessage({ id: 'general.success' }))
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
            setbuyerState({
                ...buyerState
                , page: 1
            });
        }
    };

    useEffect(() => {
        //fetchData();
        isRendered = true;
        if (isRendered)
            fetchData();

        return () => {
            isRendered = false
        }
    }, [buyerState.page, buyerState.pageSize,showActivedData]); //, 

    useEffect(() => {
        if (!_.isEmpty(newData) && !_.isEqual(newData, BuyerDto)) {
            const data = [newData, ...buyerState.data];
            if (data.length > buyerState.pageSize) {
                data.pop();
            }
            setbuyerState({
                ...buyerState
                , data: [...data]
                , totalRow: buyerState.totalRow + 1
            });
        }
    }, [newData]);


    useEffect(() => {
        if (!_.isEmpty(selectedRow) && !_.isEqual(selectedRow, BuyerDto)) {
            let newArr = [...buyerState.data]
            const index = _.findIndex(newArr, function (o) { return o.BuyerId == selectedRow.BuyerId; });
            if (index !== -1) {
                newArr[index] = selectedRow
            }

            setbuyerState({
                ...buyerState
                , data: [...newArr]
            });
        }
    }, [selectedRow]);

    const columns = [
        { field: 'BuyerId', headerName: '', hide: true},
        {
            field: 'id', headerName: '', flex: 0.01,
            filterable: false,
            renderCell: (index) => index.api.getRowIndex(index.row.BuyerId) + 1,
        },
        {
            field: "action",
            headerName: "",
            width: 100,
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
                               onClick={() => handleDeleteBuyer(params.row)}
                            >
                               {showActivedData ? <DeleteIcon fontSize="inherit" /> : <UndoIcon fontSize="inherit" />}
                            </IconButton>
                        </Grid>
                    </Grid>
                );
            },
        },
        { field: 'BuyerCode', headerName: intl.formatMessage({ id: "buyer.BuyerCode" }), /*flex: 0.7,*/  width: 150, },
        { field: 'BuyerName', headerName: intl.formatMessage({ id: "buyer.BuyerName" }), flex: 1 },
        { field: 'Contact', headerName: intl.formatMessage({ id: "buyer.Contact" }), flex: 1, renderCell: (params) => {
            return (
              <Tooltip title={params.row.Contact ?? ""} className="col-text-elip">
                <Typography sx={{ fontSize: 14, maxWidth: 200 }}>{params.row.Contact}</Typography>
              </Tooltip>
            )
          }
        },
        { field: 'Description', headerName: intl.formatMessage({ id: "buyer.Description" }), flex: 1, renderCell: (params) => {
            return (
              <Tooltip title={params.row.Description ?? ""} className="col-text-elip">
                <Typography sx={{ fontSize: 14, maxWidth: 200 }}>{params.row.Description}</Typography>
              </Tooltip>
            )
          }},
        { field: 'createdName', headerName: 'User Create', width: 150, },
        {
            field: 'createdDate', headerName: intl.formatMessage({ id: "general.created_date" }), width: 150, valueFormatter: params => {
                if (params.value !== null) {
                    return moment(params?.value).add(7, 'hours').format("YYYY-MM-DD HH:mm:ss")
                }
            },
        },
        
        { field: 'modifiedName', headerName: 'User Update', width: 150, },
        {
            field: 'modifiedDate', headerName: intl.formatMessage({ id: "general.modified_date" }), width: 150, valueFormatter: params => {
                if (params.value !== null) {
                    return moment(params?.value).add(7, 'hours').format("YYYY-MM-DD HH:mm:ss")
                }
            },
        },
        //{ field: 'createdName', headerName: intl.formatMessage({ id: "general.createdName" }), width: 150, },
        //{ field: 'modifiedBy', headerName: 'Modified By', flex: 0.3},
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

                <Grid item xs={5}>
                    <MuiButton
                        text="create"
                        color='success'
                        onClick={toggleCreateDialog}
                    />
                </Grid>
                
                <Grid item xs>
                        <MuiSearchField
                            label='general.code'
                            name='BuyerCode'
                            onClick={fetchData}
                            onChange={(e) => changeSearchData(e, 'BuyerCode')}
                        />
                </Grid>

                <Grid item xs>
                        <MuiSearchField
                            label='general.name'
                            name='BuyerName'
                            onClick={fetchData}
                            onChange={(e) => changeSearchData(e, 'BuyerName')}
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
                        label={showActivedData ? "Actived" : "Deleted"} 
                            
                        />
                </Grid>

            </Grid>

            <MuiDataGrid
                getData={buyerService.getBuyerList}
                showLoading={buyerState.isLoading}
                isPagingServer={true}
                headerHeight={45}
                gridHeight={736}
                columns={columns}
                rows={buyerState.data}
                page={buyerState.page - 1}
                pageSize={buyerState.pageSize}
                rowCount={buyerState.totalRow}

                //rowsPerPageOptions={[5, 10, 20, 30]}
                disableGrid={buyerState.isLoading}

                onPageChange={(newPage) => {
                    setbuyerState({ ...buyerState, page: newPage + 1 });
                }}
                // onPageSizeChange={(newPageSize) => {
                //     setbuyerState({ ...buyerState, pageSize: newPageSize, page: 1 });
                // }}
                getRowId={(rows) => rows.BuyerId}
                onSelectionModelChange={(newSelectedRowId) => {
                    handleRowSelection(newSelectedRowId)
                }}

                getRowClassName={(params) => {
                    if (_.isEqual(params.row, newData)) {
                        return `Mui-created`
                    }
                }}
            />

            <CreateBuyerDialog
                initModal={BuyerDto}
                setNewData={setNewData}
                isOpen={isOpenCreateDialog}
                onClose={toggleCreateDialog}
            />
            <ModifyBuyerDialog
                initModal={selectedRow}
                setModifyData={setSelectedRow}
                isOpen={isOpenModifyDialog}
                onClose={toggleModifyDialog}
            />
        </React.Fragment>
    )
}


export default Buyer;