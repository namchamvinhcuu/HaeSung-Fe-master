import React, { useEffect, useState, useRef } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { CombineStateToProps, CombineDispatchToProps } from "@plugins/helperJS";
import { User_Operations } from "@appstate/user";
import { Store } from "@appstate";

import {
  MuiButton,
  MuiDataGrid,
  MuiSearchField,
  MuiDateField,
} from "@controls";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import UndoIcon from "@mui/icons-material/Undo";
import {
  FormControlLabel,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import _ from "lodash";
import moment from "moment";
import { useIntl } from "react-intl";
import { CREATE_ACTION, UPDATE_ACTION } from "@constants/ConfigConstants";
import { useModal } from "@basesShared";
import { PurchaseOrderDto } from "@models";
import { purchaseOrderService } from "@services";
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
      PoCode: "",
      // DeliveryDate: moment(currentDate).format("YYYY-MM-DD"),
      DeliveryDate: currentDate,
      DueDate: moment(currentDate).add(30, "days").format("YYYY-MM-DD"),
      showDelete: true,
    },
  });

  const [PoId, setPoId] = useState(0);
  const [mode, setMode] = useState(CREATE_ACTION);
  const { isShowing, toggle } = useModal();

  const [newData, setNewData] = useState(PurchaseOrderDto);
  const [updateData, setUpdateData] = useState(PurchaseOrderDto);
  const [rowData, setRowData] = useState(PurchaseOrderDto);

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
    setMode(UPDATE_ACTION);
    setRowData({ ...row });
    toggle();
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
    if (state.searchData.DeliveryDate == "Invalid Date") {
      ErrorAlert(
        intl.formatMessage({ id: "purchase_order.DeliveryDate_Invalid" })
      );
    } else if (state.searchData.DueDate == "Invalid Date") {
      ErrorAlert(intl.formatMessage({ id: "purchase_order.DueDate_Invalid" }));
    } else {
      setState({ ...state, isLoading: true });
      const params = {
        page: state.page,
        pageSize: state.pageSize,
        PoCode: state.searchData.PoCode.trim(),
        DeliveryDate: state.searchData.DeliveryDate,
        DueDate: state.searchData.DueDate,
        isActived: state.searchData.showDelete,
      };

      const res = await purchaseOrderService.get(params);
      setPoId(0);
      if (res && isRendered)
        setState({
          ...state,
          data: !res.Data ? [] : [...res.Data],
          totalRow: res.TotalRow,
          isLoading: false,
        });
    }
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
          PoId: row.PoId,
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

  //useEffect
  useEffect(() => {
    fetchData();
    return () => {
      isRendered = false;
    };
  }, [state.page, state.pageSize, state.searchData.showDelete]);

  useEffect(() => {
    if (!_.isEmpty(newData) && !_.isEqual(newData, PurchaseOrderDto)) {
      const data = [newData, ...state.data];
      if (data.length > state.pageSize) {
        data.pop();
      }
      setState({
        ...state,
        data: [...data],
        totalRow: state.totalRow + 1,
      });
    }
  }, [newData]);

  useEffect(() => {
    if (
      !_.isEmpty(updateData) &&
      !_.isEqual(updateData, rowData) &&
      isRendered
    ) {
      let newArr = [...state.data];
      const index = _.findIndex(newArr, function (o) {
        return o.PoId == updateData.PoId;
      });
      if (index !== -1) {
        newArr[index] = updateData;
      }

      setState({ ...state, data: [...newArr] });
    }
  }, [updateData]);

  const columns = [
    { field: "PoId", headerName: "", hide: true },
    {
      field: "id",
      headerName: "",
      width: 50,
      filterable: false,
      renderCell: (index) =>
        index.api.getRowIndex(index.row.PoId) +
        1 +
        (state.page - 1) * state.pageSize,
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
            <Grid item xs={6}>
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
            <Grid item xs={6}>
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
          </Grid>
        );
      },
    },
    {
      field: "PoCode",
      headerName: intl.formatMessage({ id: "purchase_order.PoCode" }),
      width: 200,
    },
    {
      field: "Description",
      headerName: intl.formatMessage({ id: "purchase_order.Description" }),
      width: 400,
      renderCell: (params) => {
        return (
          <Tooltip
            title={params.row.Description ?? ""}
            className="col-text-elip"
          >
            <Typography sx={{ fontSize: 14, maxWidth: 200 }}>
              {params.row.Description}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      field: "TotalQty",
      headerName: intl.formatMessage({ id: "purchase_order.TotalQty" }),
      width: 150,
    },
    {
      field: "RemainQty",
      headerName: intl.formatMessage({ id: "purchase_order.RemainQty" }),
      width: 150,
    },
    {
      field: "DeliveryDate",
      headerName: intl.formatMessage({ id: "purchase_order.DeliveryDate" }),
      width: 150,
      valueFormatter: (params) => {
        if (params.value !== null) {
          return moment(params?.value).format("YYYY-MM-DD");
        }
      },
    },
    {
      field: "DueDate",
      headerName: intl.formatMessage({ id: "purchase_order.DueDate" }),
      width: 150,
      valueFormatter: (params) => {
        if (params.value !== null) {
          return moment(params?.value).format("YYYY-MM-DD");
        }
      },
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
          <MuiButton
            text="create"
            color="success"
            onClick={handleAdd}
            sx={{ mt: 1 }}
          />
          <MuiButton
            text="excel"
            color="info"
            onClick={() => handleDownload(PoId)}
            sx={{ mt: 1 }}
          />
        </Grid>
        <Grid item xs>
          <TextField
            sx={{ width: 230, mb: 0.5 }}
            fullWidth
            variant="standard"
            size="small"
            label="Code"
            onChange={(e) => handleSearch(e.target.value, "PoCode")}
          />
        </Grid>
        <Grid item xs>
          <MuiDateField
            disabled={state.isLoading}
            label={intl.formatMessage({ id: "purchase_order.DeliveryDate" })}
            value={state.searchData.DeliveryDate}
            onChange={(e) => handleChangeSearchDate(e, "deliveryDate")}
            variant="standard"
            sx={{ width: 230 }}
          />
        </Grid>
        <Grid item xs>
          <MuiDateField
            disabled={state.isLoading}
            label={intl.formatMessage({ id: "purchase_order.DueDate" })}
            value={state.searchData.DueDate}
            onChange={(e) => handleChangeSearchDate(e, "dueDate")}
            variant="standard"
            sx={{ width: 230 }}
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
        getRowId={(rows) => rows.PoId}
        onSelectionModelChange={(newSelectedRowId) =>
          setPoId(newSelectedRowId[0])
        }
        getRowClassName={(params) => {
          if (_.isEqual(params.row, newData)) return `Mui-created`;
        }}
        onRowClick={(params, event) => setUpdateData(params.row)}
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
        PoId={PoId}
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
