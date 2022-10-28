import React, { useEffect, useState, useRef } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { CombineStateToProps, CombineDispatchToProps } from "@plugins/helperJS";
import { User_Operations } from "@appstate/user";
import { Store } from "@appstate";
import { MuiButton, MuiDataGrid, MuiSearchField, MuiSelectField, MuiDateField, } from "@controls";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveAsIcon from '@mui/icons-material/SaveAs';
import UndoIcon from "@mui/icons-material/Undo";
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import { FormControlLabel, Switch, TextField, Tooltip, Typography, } from "@mui/material";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import _ from "lodash";
import moment from "moment";
import { useIntl } from "react-intl";
import { CREATE_ACTION, UPDATE_ACTION } from "@constants/ConfigConstants";
import { useModal } from "@basesShared";
import { PurchaseOrderDto } from "@models";
import { purchaseOrderService, forecastService } from "@services";
import { ErrorAlert, SuccessAlert, WarningAlert } from "@utils";
import FixedPODialog from "./FixedPODialog";
import FixedPODetail from "./FixedPODetail";

const FixedPO = (props) => {
  const currentDate = new Date();
  let isRendered = useRef(true);
  const intl = useIntl();

  const [state, setState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 7,
    searchData: {
      MaterialId: null,
      week: null,
      year: currentDate.getFullYear(),
      // DeliveryDate: currentDate,
      // DueDate: moment(currentDate).add(30, "days").format("YYYY-MM-DD"),
      showDelete: true,
    },
  });

  const [RowID, setRowID] = useState(0);
  const [mode, setMode] = useState(CREATE_ACTION);
  const { isShowing, toggle } = useModal();
  const [MaterialList, setMaterialList] = useState([]);
  const [YearList, setYearList] = useState([]);
  const [newData, setNewData] = useState(PurchaseOrderDto);
  const [updateData, setUpdateData] = useState(PurchaseOrderDto);
  const [rowData, setRowData] = useState(PurchaseOrderDto);

  const [valueRow, setValueRow] = useState({ PoCode: '' });

  const handleChangeSearchDate = (e, date) => {
    let x = new Date(e);
    let y = new Date();

    if (date === "deliveryDate") {
      y = new Date(state.searchData.DueDate);
      if (+x >= +y) {
        e = state.searchData.DueDate;
      }

      setState({
        ...state,
        searchData: {
          ...state.searchData,
          DeliveryDate: e,
        },
      });
    } else {
      y = new Date(state.searchData.DeliveryDate);
      if (+x < +y) {
        e = state.searchData.DeliveryDate;
      }

      setState({
        ...state,
        searchData: {
          ...state.searchData,
          DueDate: e,
        },
      });
    }
  };

  const handleAdd = () => {
    setMode(CREATE_ACTION);
    setRowData();
    toggle();
  };

  const handleUpdate = (row) => {
    setRowID(row.FPOId);
    // setRowData({ ...row });
    // toggle();
  };

  const handleSave = async (row, valueRow) => {
    console.log(row, valueRow)

    const res = await purchaseOrderService.createPOByForeCastPO({ FPOId: RowID, PoCode: valueRow.PoCode, TotalQty: valueRow.Amount });
    if (res.HttpResponseCode === 200 && res.Data) {
      SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }))
      setNewData({ ...res.Data });
      // setDialogState({ ...dialogState, isSubmit: false });
      setValueRow({});
      setRowID(0);
      handleReset();
    }
    else {
      ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }))
      // setDialogState({ ...dialogState, isSubmit: false });
    }
  };

  const handleDownload = async () => {
    try {
      if (state.searchData.DeliveryDate == "Invalid Date") {
        ErrorAlert(
          intl.formatMessage({ id: "purchase_order.DeliveryDate_Invalid" })
        );
      } else if (state.searchData.DueDate == "Invalid Date") {
        ErrorAlert(
          intl.formatMessage({ id: "purchase_order.DueDate_Invalid" })
        );
      } else {
        await purchaseOrderService.downloadReport(state.searchData);
      }
    } catch (error) {
      console.log(`ERROR: ${error}`);
    }
  };

  const fetchData = async () => {
    setState({ ...state, isLoading: true });
    const params = {
      page: state.page,
      pageSize: state.pageSize,
      MaterialId: state.searchData.MaterialId,
      week: state.searchData.week,
      year: state.searchData.year,
      isActived: state.searchData.showDelete,
    };

    const res = await purchaseOrderService.getForecastPO(params);
    setRowID(0);
    if (res && isRendered)
      setState({
        ...state,
        data: !res.Data ? [] : [...res.Data],
        totalRow: res.TotalRow,
        isLoading: false,
      });
  };

  const handleDelete = async (row) => {
    if (
      window.confirm(
        intl.formatMessage({
          id: row.isActived
            ? "general.confirm_delete"
            : "general.confirm_redo_deleted",
        })
      )
    ) {
      try {
        let res = await purchaseOrderService.deletePO({
          RowID: row.RowID,
          row_version: row.row_version,
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
    let newSearchData = { ...state.searchData };
    newSearchData[inputName] = e;
    if (inputName == "showDelete") {
      setState({ ...state, page: 1, searchData: { ...newSearchData } });
    } else {
      setState({ ...state, searchData: { ...newSearchData } });
    }
  };

  const getMaterial = async () => {
    const res = await purchaseOrderService.getMaterial();
    if (res.HttpResponseCode === 200 && res.Data) {
      setMaterialList([...res.Data]);
    }
  }

  const getYearList = async () => {
    const res = await forecastService.getYearModel();
    if (res.HttpResponseCode === 200 && res.Data && isRendered) {
      setYearList([...res.Data]);
    }
  };

  //useEffect
  useEffect(() => {
    fetchData();
    getMaterial();
    getYearList();
    return () => {
      isRendered = false;
    };
  }, [state.page, state.pageSize, state.searchData.showDelete]);

  // useEffect(() => {
  //   if (!_.isEmpty(newData) && !_.isEqual(newData, PurchaseOrderDto)) {
  //     const data = [newData, ...state.data];
  //     if (data.length > state.pageSize) {
  //       data.pop();
  //     }
  //     setState({
  //       ...state,
  //       data: [...data],
  //       totalRow: state.totalRow + 1,
  //     });
  //   }
  // }, [newData]);

  useEffect(() => {
    if (
      !_.isEmpty(updateData) &&
      !_.isEqual(updateData, rowData) &&
      isRendered
    ) {
      let newArr = [...state.data];
      const index = _.findIndex(newArr, function (o) {
        return o.RowID == updateData.RowID;
      });
      if (index !== -1) {
        newArr[index] = updateData;
      }

      setState({ ...state, data: [...newArr] });
    }
  }, [updateData]);

  const columns = [
    { field: "FPOId", headerName: "", hide: true },
    { field: "id", headerName: "", width: 80, filterable: false, renderCell: (index) => index.api.getRowIndex(index.row.FPOId) + 1 + (state.page - 1) * state.pageSize, },
    {
      field: "action",
      headerName: "",
      width: 80,
      disableClickEventBubbling: true,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        return (
          <Grid container spacing={1} alignItems="center" justifyContent="center"          >
            <Grid item xs={6} style={{ textAlign: "center" }}>
              {params.row.FPOId == RowID ?
                <>
                  <IconButton
                    aria-label="save"
                    color="success"
                    size="small"
                    sx={[{ "&:hover": { border: "1px solid red" } }]}
                    onClick={() => handleSave(params.row, valueRow)}
                  >
                    <SaveAsIcon fontSize="inherit" />
                  </IconButton>
                  <IconButton
                    aria-label="save"
                    color="warning"
                    size="small"
                    sx={[{ "&:hover": { border: "1px solid red" } }]}
                    onClick={() => setRowID(0)}
                  >
                    <DoDisturbIcon fontSize="inherit" />
                  </IconButton>
                </>
                :
                <IconButton
                  aria-label="delete"
                  color="error"
                  size="small"
                  sx={[{ "&:hover": { border: "1px solid red" } }]}
                  onClick={() => handleUpdate(params.row)}
                  disabled={RowID == 0 ? false : params.row.FPOId == RowID ? false : true}
                >
                  <DeleteIcon fontSize="inherit" />
                </IconButton>}
            </Grid>
          </Grid>
        );
      },
    },
    {
      field: "PoCode", headerName: intl.formatMessage({ id: "purchase_order.PoCode" }), width: 150, renderCell: (params) => {
        return (<>{params.row.FPOId == RowID &&
          <TextField
            value={valueRow.PoCode}
            label=' '
            size='small'
            onChange={(e) => setValueRow({ ...valueRow, PoCode: e.target.value })}
          />}</>)
      }
    },
    {
      field: "Amount", headerName: intl.formatMessage({ id: "forecast.Amount" }), width: 150, renderCell: (params) => {
        return (<>{params.row.FPOId != RowID ? params.row.Amount :
          <TextField
            value={valueRow.Amount}
            label={intl.formatMessage({ id: "forecast.Week" })}
            size='small'
            type="number"
            onChange={(e) => setValueRow({ ...valueRow, Amount: e.target.value })}
            defaultValue={params.row.Amount}
          />}</>)
      }
    },
    {
      field: "Inch",
      headerName: "Inch",
      width: 100,
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
    <React.Fragment>
      <Grid
        container
        spacing={3}
        sx={{ mb: 1 }}
        direction="row"
        justifyContent="space-between"
        alignItems="flex-end"
      >
        <Grid item xs={4}>
          {/* <MuiButton
            text="create"
            color="success"
            onClick={handleAdd}
            sx={{ mt: 1 }}
          />
          <MuiButton
            text="excel"
            color="info"
            onClick={() => handleDownload(RowID)}
            sx={{ mt: 1 }}
          /> */}
        </Grid>
        <Grid item xs>
          <MuiSelectField
            label={intl.formatMessage({ id: 'purchase_order.MaterialId' })}
            options={MaterialList}
            displayLabel="MaterialCode"
            displayValue="MaterialId"
            onChange={(e, item) => handleSearch(item ? item.MaterialId ?? null : null, 'MaterialId')}
            variant="standard"
            sx={{ width: 230, mb: 0.5 }}
          />
        </Grid>
        <Grid item xs>
          <MuiSelectField
            label={intl.formatMessage({ id: "forecast.Year" })}
            options={YearList}
            defaultValue={state.searchData.year ? { YearId: state.searchData.year, YearName: `${state.searchData.year}` } : null}
            displayLabel="YearName"
            displayValue="YearId"
            onChange={(e, item) => handleSearch(item ? item.YearId ?? null : null, "year")}
            variant="standard"
            sx={{ width: 230, mb: 0.5 }}
          />
        </Grid>
        <Grid item xs>
          <TextField
            label={intl.formatMessage({ id: "forecast.Week" })}
            variant="standard"
            type="number"
            sx={{ width: 230, mb: 0.5 }}
            //inputProps={{ min, max }}
            // defaultValue={}
            onChange={(e) => {
              // var value = parseInt(e.target.value, 10);
              // if (value > max) value = max;
              // if (value < min) value = min;
              // setValueStart(value || "");
              console.log(new Date().getDay())
              handleSearch(e.target.value || 0, "week");
            }}
          />
        </Grid>
        <Grid item>
          <MuiButton text="search" color="info" onClick={fetchData} />
        </Grid>
        <Grid item>
          <FormControlLabel
            sx={{ mb: 0.5 }}
            control={
              <Switch
                defaultChecked={true}
                color="primary"
                onChange={(e) => handleSearch(e.target.checked, "showDelete")}
              />
            }
            label={intl.formatMessage({
              id: state.searchData.showDelete
                ? "general.data_actived"
                : "general.data_deleted",
            })}
          />
        </Grid>
      </Grid>

      <MuiDataGrid
        showLoading={state.isLoading}
        isPagingServer={true}
        headerHeight={45}
        gridHeight={345}
        columns={columns}
        rows={state.data}
        page={state.page - 1}
        pageSize={state.pageSize}
        rowCount={state.totalRow}
        onPageChange={(newPage) => setState({ ...state, page: newPage + 1 })}
        getRowId={(rows) => rows.FPOId}
        // onSelectionModelChange={(newSelectedRowId) =>
        //   setRowID(newSelectedRowId[0])
        // }
        getRowClassName={(params) => {
          if (_.isEqual(params.row, newData)) return `Mui-created`;
        }}
      // onRowClick={(params, event) => setUpdateData(params.row)}
      />

      <FixedPODialog
        setNewData={setNewData}
        setUpdateData={setUpdateData}
        initModal={rowData}
        isOpen={isShowing}
        onClose={toggle}
        mode={mode}
      />

      <FixedPODetail
        newData={newData}
        setNewData={setNewData}
        RowID={RowID}
        updateDataPO={updateData}
        setUpdateDataPO={setUpdateData}
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

export default connect(mapStateToProps, mapDispatchToProps)(FixedPO);
