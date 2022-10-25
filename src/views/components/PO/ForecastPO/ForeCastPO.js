import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { CombineStateToProps, CombineDispatchToProps } from "@plugins/helperJS";
import { User_Operations } from "@appstate/user";
import { Store } from "@appstate";
import { Box, FormControlLabel, Grid, IconButton, Switch } from "@mui/material";
import { MuiButton, MuiDataGrid, MuiSearchField } from "@controls";
import { useIntl } from "react-intl";
import EditIcon from "@mui/icons-material/Edit";
import UndoIcon from "@mui/icons-material/Undo";
import DeleteIcon from "@mui/icons-material/Delete";
import ForecastDialog from "./ForecastDialog";
import { ForecastPODto } from "@models";
import { useModal } from "@basesShared";
import { ErrorAlert, SuccessAlert } from "@utils";
import { CREATE_ACTION, UPDATE_ACTION } from "@constants/ConfigConstants";
import { forecastService } from "@services";
import moment from "moment";

const ForecastPO = (props) => {
  const intl = useIntl();
  let isRendered = useRef(true);
  const [mode, setMode] = useState(CREATE_ACTION);
  const [MaterialList, setMaterialList] = useState([]);
  const [LineList, setLineList] = useState([]);
  const [newData, setNewData] = useState({ ...ForecastPODto });
  const [updateData, setUpdateData] = useState({});
  const [rowData, setRowData] = useState({});
  const { isShowing, toggle } = useModal();
  const [forecastState, setForecastState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 20,
    searchData: {
      keyWord: "",
      showDelete: true,
    },
  });
  useEffect(() => {
    getMaterialList();
    getLineList();
    return () => {
      isRendered = false;
    };
  }, []);
  useEffect(() => {
    fetchData();
  }, [
    forecastState.page,
    forecastState.pageSize,
    forecastState.searchData.showDelete,
  ]);
  useEffect(() => {
    if (!_.isEmpty(newData)) {
      const data = [newData, ...forecastState.data];
      if (data.length > forecastState.pageSize) {
        data.pop();
      }
      setForecastState({
        ...forecastState,
        data: [...data],
        totalRow: forecastState.totalRow + 1,
      });
    }
  }, [newData]);

  useEffect(() => {
    if (
      !_.isEmpty(updateData) &&
      !_.isEqual(updateData, rowData) &&
      isRendered
    ) {
      let newArr = [...forecastState.data];
      const index = _.findIndex(newArr, function (o) {
        return o.FPOId == updateData.FPOId;
      });
      if (index !== -1) {
        newArr[index] = updateData;
      }
      setForecastState({ ...forecastState, data: [...newArr] });
    }
  }, [updateData]);

  const handleAdd = () => {
    setMode(CREATE_ACTION);
    setRowData();
    toggle();
  };
  const handleUpdate = (row) => {
    setMode(UPDATE_ACTION);
    setRowData({ ...row });
    toggle();
  };

  const columns = [
    { field: "FPOId", headerName: "", hide: true },
    {
      field: "id",
      headerName: "",
      width: 100,
      filterable: false,
      renderCell: (index) =>
        index.api.getRowIndex(index.row.FPOId) +
        1 +
        (forecastState.page - 1) * forecastState.pageSize,
    },
    {
      field: "action",
      headerName: "",
      width: 110,
      disableClickEventBubbling: true,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        return (
          <Grid
            container
            spacing={1}
            alignItems="center"
            justifyContent="center"
          >
            <Grid item xs={6} style={{ textAlign: "center" }}>
              <IconButton
                aria-label="delete"
                color="error"
                size="small"
                sx={[{ "&:hover": { border: "1px solid red" } }]}
                onClick={() => handleDelete(params.row)}
              >
                {params.row.isActived ? (
                  <DeleteIcon fontSize="inherit" />
                ) : (
                  <UndoIcon fontSize="inherit" />
                )}
              </IconButton>
            </Grid>
        
              <Grid item xs={6} style={{ textAlign: "center" }}>
                <IconButton
                  aria-label="edit"
                  color="warning"
                  size="small"
                  sx={[{ "&:hover": { border: "1px solid orange" } }]}
                  onClick={() => handleUpdate(params.row)}
                >
                  <EditIcon fontSize="inherit" />
                </IconButton>
              </Grid>
       
          </Grid>
        );
      },
    },
    {
      field: "MaterialCode",
      headerName: intl.formatMessage({ id: "forecast.MaterialId" }),
      width: 200,
    },
    {
      field: "LineName",
      headerName: intl.formatMessage({ id: "forecast.LineId" }),
      width: 200,
    },
    {
      field: "Week",
      headerName: intl.formatMessage({ id: "forecast.Week" }),
      width: 100,
    },
    {
      field: "Year",
      headerName: intl.formatMessage({ id: "forecast.Year" }),
      width: 100,
    },
    {
      field: "Amount",
      headerName: intl.formatMessage({ id: "forecast.Amount" }),
      width: 100,
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
  const getMaterialList = async () => {
    const res = await forecastService.getMaterialModel();
    if (res.HttpResponseCode === 200 && res.Data && isRendered) {
      setMaterialList([...res.Data]);
    }
  };
  const getLineList = async () => {
    const res = await forecastService.getLineModel();
    if (res.HttpResponseCode === 200 && res.Data && isRendered) {
      setLineList([...res.Data]);
    }
  };

  async function fetchData() {
    setForecastState({ ...forecastState, isLoading: true });
    const params = {
      page: forecastState.page,
      pageSize: forecastState.pageSize,
      keyWord: forecastState.searchData.keyWord,
      showDelete: forecastState.searchData.showDelete,
    };
    const res = await forecastService.getForecastList(params);
    if (res && res.Data && isRendered)
      setForecastState({
        ...forecastState,
        data: res.Data ?? [],
        totalRow: res.TotalRow,
        isLoading: false,
      });
  }

  const handleSearch = (e, inputName) => {
    let newSearchData = { ...forecastState.searchData };
    newSearchData[inputName] = e;
    if (inputName == "showDelete") {
      setForecastState({
        ...forecastState,
        page: 1,
        searchData: { ...newSearchData },
      });
    } else {
      setForecastState({ ...forecastState, searchData: { ...newSearchData } });
    }
  };

  const handleDelete = async (forecast) => {
    if (
      window.confirm(
        intl.formatMessage({
          id: forecast.isActived
            ? "general.confirm_delete"
            : "general.confirm_redo_deleted",
        })
      )
    ) {
      try {
        let res = await forecastService.deleteForecast({
          FPOId: forecast.FPOId,
          row_version: forecast.row_version,
        });
        if (res && res.HttpResponseCode === 200) {
          SuccessAlert(intl.formatMessage({ id: "general.success" }));
          await fetchData();
        } else {
          ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
        }
      } catch (error) {
        console.log(error);
      }
    }
  };
  return (
    <React.Fragment>
      <Grid
        container
        direction="row"
        justifyContent="space-between"
        alignItems="flex-end"
      >
        <Grid item xs={8}>
          <MuiButton text="create" color="success" onClick={handleAdd} />
        </Grid>
        <Grid item>
          <MuiSearchField
            label="general.name"
            name="LineName"
            onClick={fetchData}
            onChange={(e) => handleSearch(e.target.value, "keyWord")}
          />
        </Grid>
        <Grid item >
          <MuiButton text="search" color="info" onClick={fetchData} />
        </Grid>
        <Grid item>
          <FormControlLabel
          sx={{marginBottom:"3px"}}
            control={
              <Switch
                defaultChecked={true}
                color="primary"
                onChange={(e) => handleSearch(e.target.checked, "showDelete")}
              />
            }
            label={intl.formatMessage({
              id: forecastState.searchData.showDelete
                ? "general.data_actived"
                : "general.data_deleted",
            })}
          />
        </Grid>
      </Grid>
      <MuiDataGrid
        showLoading={forecastState.isLoading}
        isPagingServer={true}
        headerHeight={45}
        // rowHeight={30}
        gridHeight={736}
        columns={columns}
        rows={forecastState.data}
        page={forecastState.page - 1}
        pageSize={forecastState.pageSize}
        rowCount={forecastState.totalRow}
        // rowsPerPageOptions={[5, 10, 20, 30]}

        onPageChange={(newPage) => {
          setLineState({ ...forecastState, page: newPage + 1 });
        }}
        // onPageSizeChange={(newPageSize) => {
        //     setLineState({ ...lineState, pageSize: newPageSize, page: 1 });
        // }}
        getRowId={(rows) => rows.FPOId}
        // onSelectionModelChange={(newSelectedRowId) => {
        //   handleRowSelection(newSelectedRowId);
        // }}
        // selectionModel={selectedRow.menuId}
        getRowClassName={(params) => {
          if (_.isEqual(params.row, newData)) {
            return `Mui-created`;
          }
        }}
      />
      <ForecastDialog
        initModal={rowData}
        valueOption={{ MaterialList: MaterialList, LineList: LineList }}
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
