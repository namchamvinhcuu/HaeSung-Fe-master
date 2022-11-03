import React, { useEffect, useRef, useState } from "react";
import ForeCastPODetail from "./ForeCastPODetail";
import { useIntl } from "react-intl";
import EditIcon from "@mui/icons-material/Edit";
import UndoIcon from "@mui/icons-material/Undo";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  MuiButton,
  MuiDataGrid,
  MuiSearchField,
  MuiSelectField,
} from "@controls";
import {
  Box,
  FormControlLabel,
  Grid,
  IconButton,
  Switch,
} from "@mui/material";
import { ForecastPOMasterDto } from "@models";
import { forecastMasterService } from "@services";
import moment from "moment";
import { CREATE_ACTION, UPDATE_ACTION } from "@constants/ConfigConstants";
import { useModal } from "@basesShared";
import ForecastMasterDialog from "./ForecastMasterDialog";
import { ErrorAlert, SuccessAlert, getCurrentWeek } from "@utils";

export default function ForecastPOMaster(props) {
  const intl = useIntl();
  let isRendered = useRef(true);
  const [mode, setMode] = useState(CREATE_ACTION);
  const [rowData, setRowData] = useState({});
  const { isShowing, toggle } = useModal();
  const [FPoMasterId, setFPOMasterId] = useState(null);
  const [newDataChild, setNewDataChild] = useState({})
  const [forecastMasterState, setForecastMasterState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 8,
    searchData: {
      keyWord: "",
      showDelete: true,
    },
  });
  const [newData, setNewData] = useState({ ...ForecastPOMasterDto });
  const [updateData, setUpdateData] = useState({});
  async function fetchData() {
    setFPOMasterId(null);
    setForecastMasterState({ ...forecastMasterState, isLoading: true });
    const params = {
      page: forecastMasterState.page,
      pageSize: forecastMasterState.pageSize,
      keyWord: forecastMasterState.searchData.keyWord,
      showDelete: forecastMasterState.searchData.showDelete,
    };
    const res = await forecastMasterService.getForecastMasterList(params);
    if (res && res.Data && isRendered)
      setForecastMasterState({
        ...forecastMasterState,
        data: res.Data ?? [],
        totalRow: res.TotalRow,
        isLoading: false,
      });
  }
  useEffect(() => {
    return () => {
      isRendered = false;
    };
  }, []);
  useEffect(() => {
    fetchData();
  }, [
    forecastMasterState.page,
    forecastMasterState.pageSize,
    forecastMasterState.searchData.showDelete,
  ]);
  useEffect(() => {
    if (
      !_.isEmpty(newData) &&
      isRendered &&
      !_.isEqual(newData, ForecastPOMasterDto)
    ) {
      const data = [newData, ...forecastMasterState.data];
      if (data.length > forecastMasterState.pageSize) {
        data.pop();
      }
      setForecastMasterState({
        ...forecastMasterState,
        data: [...data],
        totalRow: forecastMasterState.totalRow + 1,
      });
    }
  }, [newData]);

  useEffect(() => {
    if (
      !_.isEmpty(updateData) &&
      !_.isEqual(updateData, rowData) &&
      isRendered
    ) {
      let newArr = [...forecastMasterState.data];
      const index = _.findIndex(newArr, function (o) {
        return o.FPoMasterId == updateData.FPoMasterId;
      });
      if (index !== -1) {
        newArr[index] = updateData;
      }
      setForecastMasterState({ ...forecastMasterState, data: [...newArr] });
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
  const handleDelete = async (fcM) => {
    if (
      window.confirm(
        intl.formatMessage({
          id: fcM.isActived
            ? "general.confirm_delete"
            : "general.confirm_redo_deleted",
        })
      )
    ) {
      try {
        let res = await forecastMasterService.deleteForecastMaster({
          FPoMasterId: fcM.FPoMasterId,
          row_version: fcM.row_version,
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
  const handleSearch = (e, inputName) => {
    let newSearchData = { ...forecastMasterState.searchData };
    newSearchData[inputName] = e;
    if (inputName == "showDelete") {
      setForecastMasterState({
        ...forecastMasterState,
        page: 1,
        searchData: { ...newSearchData },
      });
    } else {
      setForecastMasterState({ ...forecastMasterState, searchData: { ...newSearchData } });
    }
  };
  const columns = [
    { field: "FPoMasterId", headerName: "", hide: true },
    {
      field: "id",
      headerName: "",
      width: 80,
      filterable: false,
      renderCell: (index) =>
        index.api.getRowIndex(index.row.FPoMasterId) +
        1 +
        (forecastMasterState.page - 1) * forecastMasterState.pageSize,
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
      field: "FPoMasterCode",
      headerName: "FPO Master Code",
      width: 200,
    },

    {
      field: "TotalOrderQty",
      headerName: intl.formatMessage({ id: "forecast.Total_Order_Qty" }),
      width: 170,
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
  return (
    <>
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
          <Box display="flex">
            <Box>
              <MuiSearchField
                label="general.name"
                name="LineName"
                onClick={fetchData}
                onChange={(e) => handleSearch(e.target.value, "keyWord")}
              />
            </Box>
          </Box>
        </Grid>
        <Grid item>
          <MuiButton text="search" color="info" onClick={fetchData} />
        </Grid>
        <Grid item>
          <FormControlLabel
            sx={{ marginBottom: "3px" }}
            control={
              <Switch
                defaultChecked={true}
                color="primary"
                onChange={(e) => handleSearch(e.target.checked, "showDelete")}
              />
            }
            label={intl.formatMessage({
              id: forecastMasterState.searchData.showDelete
                ? "general.data_actived"
                : "general.data_deleted",
            })}
          />
        </Grid>
      </Grid>
      <MuiDataGrid
        showLoading={forecastMasterState.isLoading}
        isPagingServer={true}
        headerHeight={45}
        // rowHeight={30}
        gridHeight={350}
        columns={columns}
        rows={forecastMasterState.data}
        page={forecastMasterState.page - 1}
        pageSize={forecastMasterState.pageSize}
        rowCount={forecastMasterState.totalRow}
        // rowsPerPageOptions={[5, 10, 20, 30]}

        onPageChange={(newPage) => {
          setForecastMasterState({ ...forecastMasterState, page: newPage + 1 });
        }}
        onSelectionModelChange={(newSelectedRowId) => setFPOMasterId(newSelectedRowId[0])}
        getRowId={(rows) => rows.FPoMasterId}
        // onSelectionModelChange={(newSelectedRowId) => {
        //   handleRowSelection(newSelectedRowId);
        // }}
        // selectionModel={selectedRow.menuId}
        getRowClassName={(params) => {
          if (_.isEqual(params.row, newData)) {
            return `Mui-created`;
          }
        }}
      // initialState={{ pinnedColumns: { left: ['id', 'DoCode', 'FPoCode', 'MaterialCode'], right: ['action'] } }}
      />
      <ForecastMasterDialog
        initModal={rowData}
        // valueOption={{ MaterialList: MaterialList, LineList: LineList }}
        setNewData={setNewData}
        setUpdateData={setUpdateData}
        isOpen={isShowing}
        onClose={toggle}
        mode={mode}
      />
      <ForeCastPODetail FPoMasterId={FPoMasterId} newDataChild={newDataChild} />
    </>
  );
}
