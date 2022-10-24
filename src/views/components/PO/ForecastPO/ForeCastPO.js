import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { CombineStateToProps, CombineDispatchToProps } from "@plugins/helperJS";
import { User_Operations } from "@appstate/user";
import { Store } from "@appstate";
import { FormControlLabel, Grid, IconButton, Switch } from "@mui/material";
import { MuiButton, MuiDataGrid, MuiSearchField } from "@controls";
import { useIntl } from "react-intl";
import EditIcon from '@mui/icons-material/Edit';
import UndoIcon from '@mui/icons-material/Undo';
import DeleteIcon from '@mui/icons-material/Delete';
import ForecastDialog from './ForecastDialog';
import { ForecastPODto } from '@models';
import { useModal } from "@basesShared";
import { CREATE_ACTION, UPDATE_ACTION } from '@constants/ConfigConstants';
import {forecastService} from '@services';
const ForecastPO = (props) => {
    const intl = useIntl();
    let isRendered = useRef(true);
    const [isOpenModifyDialog, setIsOpenModifyDialog] = useState(false);
    const [mode, setMode] = useState(CREATE_ACTION);
    const [MaterialList, setMaterialList] = useState([]);
    const [LineList, setLineList] = useState([]);
    const [lineState, setLineState] = useState({
        isLoading: false,
        data: [],
        totalRow: 0,
        page: 1,
        pageSize: 20,
        searchData: {
            // LineName: ''
        }
    });
    useEffect(()=>{
        console.log("RUNEFFFECT")
        getMaterialList();
      },[])
    const [newData, setNewData] = useState({ ...ForecastPODto });
    const [updateData, setUpdateData] = useState({});
    const [rowData, setRowData] = useState({});
    const [showActivedData, setShowActivedData] = useState(true);
    const [isOpenCreateDialog, setIsOpenCreateDialog] = useState(false);
    const { isShowing, toggle } = useModal();
    
    const handleshowActivedData = async (event) => {
        // setShowActivedData(event.target.checked);
        // if (!event.target.checked) {
        //     setLineState({
        //         ...lineState
        //         , page: 1
        //     });
        // }
    };
    const handleAdd = () => {
        setMode(CREATE_ACTION);
        setRowData();
        toggle();
      };
    const toggleCreateDialog = () => {
        setIsOpenCreateDialog(!isOpenCreateDialog);
    }
    const columns = [
        { field: 'FPOId', headerName: '', hide: true },
        {
            field: 'id', headerName: '', width: 100,
            filterable: false,
            renderCell: (index) => (index.api.getRowIndex(index.row.FPOId) + 1) + (lineState.page - 1) * lineState.pageSize,
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
                                // onClick={handleAdd}
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
        // { field: 'MaterialName', headerName: intl.formatMessage({ id: "forecast.MaterialName" }), width: 200, },
        // { field: 'LineName', headerName: intl.formatMessage({ id: "forecast.LineName" }), width: 500, },
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
    const getMaterialList = async () => {
      const res = await forecastService.getMaterialModel();
      console.log("RESS",res)
      if (res.HttpResponseCode === 200 && res.Data && isRendered) {
        setMaterialList([...res.Data])
      }
    }
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
            color="success"
            onClick={handleAdd}
          />
        </Grid>
        <Grid item xs>
          <MuiSearchField
            label="general.name"
            name="LineName"
            // onClick={fetchData}
            // onChange={(e) => changeSearchData(e, "LineName")}
          />
        </Grid>
        <Grid item xs sx={{ display: 'flex', justifyContent: 'right' }}>
                    <MuiButton
                        text="search"
                        color='info'
                        // onClick={fetchData}
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
                getRowId={(rows) => rows.FPOId}
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
             <ForecastDialog
                initModal={rowData}
                valueOption={{ MaterialList: MaterialList, LineList: LineList, }}
                setNewData={setNewData}
                setUpdateData={setUpdateData}
                isOpen={isShowing}
                onClose={toggle}
                mode={mode}
            />
    </React.Fragment>
  );
};

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

export default connect(mapStateToProps, mapDispatchToProps)(ForecastPO);
