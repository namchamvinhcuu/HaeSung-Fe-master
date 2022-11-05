import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { CombineStateToProps, CombineDispatchToProps } from "@plugins/helperJS";
import { User_Operations } from "@appstate/user";
import { Store } from "@appstate";
import {
  Box,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  Input,
  InputLabel,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  MuiButton,
  MuiDataGrid,
  MuiSearchField,
  MuiSelectField,
} from "@controls";
import { useIntl } from "react-intl";
import EditIcon from "@mui/icons-material/Edit";
import UndoIcon from "@mui/icons-material/Undo";
import DeleteIcon from "@mui/icons-material/Delete";
import ForecastDetailDialog from "./ForecastDetailDialog";
import { ForecastPODto } from "@models";
import { useModal } from "@basesShared";
import { ErrorAlert, SuccessAlert, getCurrentWeek } from "@utils";
import { CREATE_ACTION, UPDATE_ACTION } from "@constants/ConfigConstants";
import { forecastService } from "@services";
import moment from "moment";

const min = 1;
const max = 52;
const minyear = 2022;
const maxyear = 2050;
const ForecastPODetail = ({ FPoMasterId }) => {
  const intl = useIntl();
  let isRendered = useRef(true);
  const [mode, setMode] = useState(CREATE_ACTION);
  const [newData, setNewData] = useState({ ...ForecastPODto });
  const [updateData, setUpdateData] = useState({});
  const [rowData, setRowData] = useState({});
  const { isShowing, toggle } = useModal();
  const [valueYear, setValueYear] = useState("");
  const curWeek = getCurrentWeek();
  const [currentWeek, setCurrentWeek] = useState(curWeek);
  const [forecastState, setForecastState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 8,
    searchData: {
      keyWord: "",
      keyWordWeekStart: 0,
      keyWordWeekEnd: curWeek,
      keyWordYear: new Date().getFullYear(),
      showDelete: true,
    },
    FPoMasterId: FPoMasterId,
  });
  useEffect(() => {
    // getYearList();
    return () => {
      isRendered = false;
    };
  }, []);
  useEffect(() => {
    FPoMasterId && fetchData(FPoMasterId);
  }, [
    forecastState.page,
    forecastState.pageSize,
    FPoMasterId,
    forecastState.searchData.showDelete,
  ]);
  useEffect(() => {
    if (
      !_.isEmpty(newData) &&
      isRendered &&
      !_.isEqual(newData, ForecastPODto)
    ) {
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
    setRowData({ ...row, FPoMasterId: FPoMasterId });
    toggle();
  };

  const columns = [
    { field: "FPOId", headerName: "", hide: true },
    {
      field: "id",
      headerName: "",
      width: 80,
      filterable: false,
      renderCell: (index) =>
        index.api.getRowIndex(index.row.FPOId) +
        1 +
        (forecastState.page - 1) * forecastState.pageSize,
    },
    {
      field: "action",
      headerName: "",
      width: 80,
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
      field: "Inch",
      headerName: "Inch",
      width: 100,
    },
    {
      field: "FPoCode",
      headerName: intl.formatMessage({ id: "forecast.FPoCode" }),
      width: 120,
    },
    {
      field: "LineName",
      headerName: intl.formatMessage({ id: "forecast.LineId" }),
      width: 200,
    },
    {
      field: "MaterialCode",
      headerName: intl.formatMessage({ id: "forecast.MaterialId" }),
      width: 200,
    },
    {
      field: "BuyerCode",
      headerName: intl.formatMessage({ id: "forecast.BuyerId" }),
      width: 200,
    },
    {
      field: "DescriptionMaterial",
      headerName: intl.formatMessage({ id: "forecast.Desciption" }),
      width: 300,
      renderCell: (params) => {
        return (
          <Tooltip
            title={params.row.DescriptionMaterial ?? ""}
            className="col-text-elip"
          >
            <Typography sx={{ fontSize: 14, maxWidth: 300 }}>
              {params.row.DescriptionMaterial}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      field: "Description",
      headerName: "Desc 2",
      width: 180,
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

  // const getYearList = async () => {
  //   const res = await forecastService.getYearModel();
  //   if (res.HttpResponseCode === 200 && res.Data && isRendered) {
  //     setYearList([...res.Data]);
  //   }
  // };

  async function fetchData(FPoMasterId) {
    if (
      forecastState.searchData.keyWordWeekStart >
      forecastState.searchData.keyWordWeekEnd &&
      forecastState.searchData.keyWordWeekEnd != 0
    ) {
      ErrorAlert(intl.formatMessage({ id: "forecast.Start_end_week_error" }));
      return;
    }
    setForecastState({ ...forecastState, isLoading: true });
    const params = {
      page: forecastState.page,
      pageSize: forecastState.pageSize,
      keyWord: forecastState.searchData.keyWord,
      keyWordWeekStart: forecastState.searchData.keyWordWeekStart,
      keyWordWeekEnd: forecastState.searchData.keyWordWeekEnd,
      keyWordYear: forecastState.searchData.keyWordYear===0?new Date().getFullYear():forecastState.searchData.keyWordYear,
      showDelete: forecastState.searchData.showDelete,
      FPoMasterId: FPoMasterId,
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
          FPoMasterId: FPoMasterId
        });
        if (res && res.HttpResponseCode === 200) {
          SuccessAlert(intl.formatMessage({ id: "general.success" }));
          await fetchData(FPoMasterId);
        } else {
          ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const [valueStart, setValueStart] = useState("");
  const [valueEnd, setValueEnd] = useState("");
  // useEffect(() => {
  //   if (!_.isEmpty(newDataChild)) {
  //     const data = [newDataChild, ...forecastState.data];
  //     if (data.length > forecastState.pageSize) {
  //       data.pop();
  //     }
  //     setState({
  //       ...forecastState,
  //       data: [...data],
  //       totalRow: forecastState.totalRow + 1,
  //     });
  //   }
  // }, [newDataChild]);
  return (
    <React.Fragment>
      <Grid
        container
        direction="row"
        justifyContent="space-between"
        alignItems="flex-end"
      >
        <Grid item xs={5}>
          <MuiButton
            text="create"
            color="success"
            onClick={handleAdd}
            disabled={FPoMasterId ? false : true}
          />
        </Grid>
        <Grid item>
          <Box display="flex">
            <Box sx={{ mr: 2, maxWidth: "120px" }}>

              <TextField
                disabled={FPoMasterId ? false : true}
                label={intl.formatMessage({ id: "forecast.Year" })}
                variant="standard"
                type="number"
                sx={{ width: "120px" }}
                value={valueYear || new Date().getFullYear()}
                // inputProps={{ minyear, maxyear }}
                onChange={(e) => {
                  var value = parseInt(e.target.value, 10);
                  if (e.target.value.length > 4) {
                    return;
                  }
                  if (value > maxyear && e.target.value.length === 4) value = maxyear;
                  if (value < minyear && e.target.value.length === 4) value = minyear;
                  setValueYear(value || "");
                  handleSearch(value || 0, "keyWordYear");
                }}
              />
              {/* <FormControl sx={{ marginTop: "3px" }}>
                <MuiSelectField
                  disabled={FPoMasterId ? false : true}
                  label={intl.formatMessage({ id: "forecast.Year" })}
                  options={yearList}
                  defaultValue={{
                    YearId: new Date().getFullYear() || "",
                    YearName: `${new Date().getFullYear() + ""}` || "",
                  }}
                  displayLabel="YearName"
                  displayValue="YearId"
                  onChange={(e, item) =>
                    handleSearch(
                      item ? item.YearId ?? null : null,
                      "keyWordYear"
                    )
                  }
                  variant="standard"
                  sx={{ width: 120 }}
                />
              </FormControl> */}

            </Box>
            <Box sx={{ maxWidth: "120px", mr: 2 }}>
              <TextField
                disabled={FPoMasterId ? false : true}
                label={intl.formatMessage({ id: "forecast.Week_start" })}
                variant="standard"
                type="number"
                sx={{ width: "120px" }}
                value={valueStart}
                inputProps={{ min, max }}
                onChange={(e) => {
                  var value = parseInt(e.target.value, 10);
                  if (value > max) value = max;
                  if (value < min) value = min;
                  setValueStart(value || "");
                  handleSearch(value || 0, "keyWordWeekStart");
                }}
              />

            </Box>
            <Box sx={{ maxWidth: "120px", mr: 2 }}>
              <TextField
                disabled={FPoMasterId ? false : true}
                label={intl.formatMessage({ id: "forecast.Week_end" })}
                variant="standard"
                type="number"
                sx={{ width: "120px" }}
                value={valueEnd || currentWeek}
                // inputProps={{ min, max }}
                onChange={(e) => {
                  var value = parseInt(e.target.value, 10);
                  if (value > max) value = max;
                  if (value < min) value = min;
                  setCurrentWeek(value || "");
                  setValueEnd(value || "");
                  handleSearch(value || 0, "keyWordWeekEnd");
                }}
              />
            </Box>

            <Box sx={{ marginTop: "3px" }}>
              <MuiSearchField
                disabled={FPoMasterId ? false : true}
                label="general.name"
                name="LineName"
                onClick={() => fetchData(FPoMasterId)}
                onChange={(e) => handleSearch(e.target.value, "keyWord")}
              />
            </Box>
          </Box>
        </Grid>
        <Grid item>
          <MuiButton
            text="search"
            color="info"
            onClick={() => fetchData(FPoMasterId)}
            disabled={FPoMasterId ? false : true}
          />
        </Grid>
        <Grid item>
          <FormControlLabel
            sx={{ marginBottom: "3px" }}
            control={
              <Switch
                disabled={FPoMasterId ? false : true}
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
        gridHeight={350}
        columns={columns}
        rows={forecastState.data}
        page={forecastState.page - 1}
        pageSize={forecastState.pageSize}
        rowCount={forecastState.totalRow}
        // rowsPerPageOptions={[5, 10, 20, 30]}

        onPageChange={(newPage) => {
          setForecastState({ ...forecastState, page: newPage + 1 });
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
          if (
            _.isEqual(params.row, newData) 
            // ||
            // _.isEqual(params.row, newDataChild)
          ) {
            return `Mui-created`;
          }
        }}
        initialState={{ pinnedColumns: { left: ['id', 'FPoCode', 'MaterialCode', 'BuyerCode'], right: ['action'] } }}
      />
      <ForecastDetailDialog
        initModal={rowData}
        setNewData={setNewData}
        setUpdateData={setUpdateData}
        isOpen={isShowing}
        onClose={toggle}
        mode={mode}
        FPoMasterId={FPoMasterId}
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

export default connect(mapStateToProps, mapDispatchToProps)(ForecastPODetail);
