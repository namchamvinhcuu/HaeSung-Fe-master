import { Store } from "@appstate";
import { User_Operations } from "@appstate/user";
import { CombineDispatchToProps, CombineStateToProps } from "@plugins/helperJS";
import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { CREATE_ACTION, UPDATE_ACTION } from "@constants/ConfigConstants";
import {
  MuiAutoComplete,
  MuiButton,
  MuiDataGrid,
  MuiDateTimeField,
  MuiSearchField,
  MuiSelectField,
} from "@controls";
import { DeliveryOrderDto } from "@models";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import UndoIcon from "@mui/icons-material/Undo";
import { FormControlLabel, Switch, Tooltip, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import { deliveryOrderService } from "@services";
import { addDays, ErrorAlert } from "@utils";
import _ from "lodash";
import moment from "moment";
import { useIntl } from "react-intl";

import DeliveryOrderDialog from "./DeliveryOrderDialog";

const DeliveryOrder = (props) => {
  let isRendered = useRef(true);
  const intl = useIntl();
  const initETDLoad = new Date();

  const [deliveryOrderState, setDeliveryOrderState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 20,
    searchData: {
      DoCode: "",
      PoId: 0,
      PoCode: "",
      MaterialId: 0,
      MaterialCode: "",
      ETDLoad: initETDLoad,
      DeliveryTime: addDays(initETDLoad, 1),
    },
  });

  const [mode, setMode] = useState(CREATE_ACTION);

  const [selectedRow, setSelectedRow] = useState({
    ...DeliveryOrderDto,
  });

  const [newData, setNewData] = useState({ ...DeliveryOrderDto });

  const [isOpenDialog, setIsOpenDialog] = useState(false);

  const [showActivedData, setShowActivedData] = useState(true);

  const [materialArr, setMaterialArr] = useState([]);

  const toggleDialog = (mode) => {
    if (mode === CREATE_ACTION) {
      setMode(CREATE_ACTION);
    } else {
      setMode(UPDATE_ACTION);
    }
    setIsOpenDialog(!isOpenDialog);
  };

  const handleshowActivedData = async (event) => {
    setShowActivedData(event.target.checked);
    if (!event.target.checked) {
      setDeliveryOrderState({
        ...deliveryOrderState,
        page: 1,
      });
    }
  };

  const handleRowSelection = (arrIds) => {
    const rowSelected = deliveryOrderState.data.filter(function (item) {
      return item.DoId === arrIds[0];
    });

    if (rowSelected && rowSelected.length > 0) {
      setSelectedRow({ ...rowSelected[0] });
    } else {
      setSelectedRow({ ...DeliveryOrderDto });
    }
  };

  const handleDelete = async (deliveryOrder) => {
    if (
      window.confirm(
        intl.formatMessage({
          id: showActivedData
            ? "general.confirm_delete"
            : "general.confirm_redo_deleted",
        })
      )
    ) {
      try {
        let res = await deliveryOrderService.handleDelete(deliveryOrder);
        if (res && res.HttpResponseCode === 200) {
          await fetchData();
        } else {
          ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const changeSearchData = (e, inputName) => {
    let newSearchData = { ...deliveryOrderState.searchData };

    newSearchData[inputName] = e;

    switch (inputName) {
      case "ETDLoad":
      case "DeliveryTime":
        newSearchData[inputName] = e;
        break;
      case "PoId":
        newSearchData[inputName] = e ? e.PoId : DeliveryOrderDto.PoId;
        newSearchData["PoCode"] = e ? e.PoCode : DeliveryOrderDto.PoCode;
        newSearchData.MaterialId = 0;
        newSearchData.MaterialCode = "";
        break;
      case "MaterialId":
        newSearchData[inputName] = e
          ? e.MaterialId
          : DeliveryOrderDto.MaterialId;
        newSearchData["MaterialCode"] = e
          ? e.MaterialCode
          : DeliveryOrderDto.MaterialCode;
        break;
      default:
        newSearchData[inputName] = e.target.value;
        break;
    }

    setDeliveryOrderState({
      ...deliveryOrderState,
      searchData: { ...newSearchData },
    });
  };

  const getPoArr = async () => {
    return await deliveryOrderService.getPoArr();
  };

  const getMaterialArr = async (poId) => {
    const res = await deliveryOrderService.getMaterialArr(poId);
    if (res && isRendered) {
      setMaterialArr(!res.Data ? [] : [...res.Data]);
    }
  };

  const fetchData = async () => {
    let flag = true;
    let message = "";
    const checkObj = { ...deliveryOrderState.searchData };
    _.forOwn(checkObj, (value, key) => {
      switch (key) {
        case "ETDLoad":
          if (value == "Invalid Date") {
            message = "delivery_order.ETDLoad_invalid";
            flag = false;
          }
          break;
        case "DeliveryTime":
          if (value == "Invalid Date") {
            message = "delivery_order.DeliveryTime_invalid";
            flag = false;
          }
          break;

        default:
          break;
      }
    });

    if (flag) {
      setDeliveryOrderState({
        ...deliveryOrderState,
        isLoading: true,
      });

      const params = {
        page: deliveryOrderState.page,
        pageSize: deliveryOrderState.pageSize,
        DoCode: deliveryOrderState.searchData.DoCode.trim(),
        PoId: deliveryOrderState.searchData.PoId,
        MaterialId: deliveryOrderState.searchData.MaterialId,
        ETDLoad: deliveryOrderState.searchData.ETDLoad,
        DeliveryTime: deliveryOrderState.searchData.DeliveryTime,
        isActived: showActivedData,
      };

      const res = await deliveryOrderService.get(params);

      if (res && isRendered)
        setDeliveryOrderState({
          ...deliveryOrderState,
          data: !res.Data ? [] : [...res.Data],
          totalRow: res.TotalRow,
          isLoading: false,
        });
    } else {
      ErrorAlert(intl.formatMessage({ id: message }));
    }
  };

  useEffect(() => {
    if (isRendered)
      if (deliveryOrderState.searchData.PoId !== 0) {
        getMaterialArr(deliveryOrderState.searchData.PoId);
      } else {
        setMaterialArr([]);
      }
  }, [deliveryOrderState.searchData.PoId]);

  useEffect(() => {
    fetchData();

    return () => {
      isRendered = false;
    };
  }, [deliveryOrderState.page, deliveryOrderState.pageSize, showActivedData]);

  useEffect(() => {
    if (!_.isEmpty(newData) && !_.isEqual(newData, DeliveryOrderDto)) {
      const data = [newData, ...deliveryOrderState.data];
      if (data.length > deliveryOrderState.pageSize) {
        data.pop();
      }
      if (isRendered)
        setDeliveryOrderState({
          ...deliveryOrderState,
          data: [...data],
          totalRow: deliveryOrderState.totalRow + 1,
        });
    }
  }, [newData]);

  useEffect(() => {
    if (!_.isEmpty(selectedRow) && !_.isEqual(selectedRow, DeliveryOrderDto)) {
      let newArr = [...deliveryOrderState.data];
      const index = _.findIndex(newArr, function (o) {
        return o.DoId == selectedRow.DoId;
      });
      if (index !== -1) {
        newArr[index] = selectedRow;
      }

      setDeliveryOrderState({
        ...deliveryOrderState,
        data: [...newArr],
      });
    }
  }, [selectedRow]);

  const columns = [
    { field: "DoId", headerName: "", hide: true },

    {
      field: "id",
      headerName: "",
      width: 100,
      filterable: false,
      renderCell: (index) =>
        index.api.getRowIndex(index.row.DoId) +
        1 +
        (deliveryOrderState.page - 1) * deliveryOrderState.pageSize,
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
                onClick={() => {
                  toggleDialog(UPDATE_ACTION);
                }}
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
                {showActivedData ? (
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
      field: "DoCode",
      headerName: intl.formatMessage({ id: "delivery_order.DoCode" }),
      /*flex: 0.7,*/ width: 120,
    },

    {
      field: "PoCode",
      headerName: intl.formatMessage({ id: "delivery_order.PoCode" }),
      /*flex: 0.7,*/ width: 120,
    },

    {
      field: "MaterialCode",
      headerName: intl.formatMessage({ id: "delivery_order.MaterialCode" }),
      /*flex: 0.7,*/ width: 120,
    },

    {
      field: "OrderQty",
      headerName: intl.formatMessage({ id: "delivery_order.OrderQty" }),
      /*flex: 0.7,*/ width: 120,
    },

    {
      field: "RemainQty",
      headerName: intl.formatMessage({ id: "delivery_order.RemainQty" }),
      /*flex: 0.7,*/ width: 120,
    },

    {
      field: "PackingNote",
      headerName: intl.formatMessage({ id: "delivery_order.PackingNote" }),
      width: 200,
      renderCell: (params) => {
        return (
          <Tooltip
            title={params.row.PackingNote ?? ""}
            className="col-text-elip"
          >
            <Typography sx={{ fontSize: 14, maxWidth: 200 }}>
              {params.row.PackingNote}
            </Typography>
          </Tooltip>
        );
      },
    },

    {
      field: "InvoiceNo",
      headerName: intl.formatMessage({ id: "delivery_order.InvoiceNo" }),
      width: 150,
      renderCell: (params) => {
        return (
          <Tooltip title={params.row.InvoiceNo ?? ""} className="col-text-elip">
            <Typography sx={{ fontSize: 14, maxWidth: 200 }}>
              {params.row.InvoiceNo}
            </Typography>
          </Tooltip>
        );
      },
    },

    {
      field: "Dock",
      headerName: intl.formatMessage({ id: "delivery_order.Dock" }),
      width: 150,
      renderCell: (params) => {
        return (
          <Tooltip title={params.row.Dock ?? ""} className="col-text-elip">
            <Typography sx={{ fontSize: 14, maxWidth: 200 }}>
              {params.row.Dock}
            </Typography>
          </Tooltip>
        );
      },
    },

    {
      field: "ETDLoad",
      headerName: intl.formatMessage({ id: "delivery_order.ETDLoad" }),
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
      field: "DeliveryTime",
      headerName: intl.formatMessage({ id: "delivery_order.DeliveryTime" }),
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
      field: "Remark",
      headerName: intl.formatMessage({ id: "delivery_order.Remark" }),
      width: 150,
      renderCell: (params) => {
        return (
          <Tooltip title={params.row.Remark ?? ""} className="col-text-elip">
            <Typography sx={{ fontSize: 14, maxWidth: 200 }}>
              {params.row.Remark}
            </Typography>
          </Tooltip>
        );
      },
    },

    {
      field: "Truck",
      headerName: intl.formatMessage({ id: "delivery_order.Truck" }),
      width: 150,
      renderCell: (params) => {
        return (
          <Tooltip title={params.row.Truck ?? ""} className="col-text-elip">
            <Typography sx={{ fontSize: 14, maxWidth: 200 }}>
              {params.row.Truck}
            </Typography>
          </Tooltip>
        );
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
        spacing={2}
        direction="row"
        justifyContent="space-between"
        alignItems="flex-end"
      >
        <Grid item xs={1.5}>
          <MuiButton
            text="create"
            color="success"
            onClick={() => {
              toggleDialog(CREATE_ACTION);
            }}
          />
        </Grid>

        <Grid item xs>
          <MuiSearchField
            label="delivery_order.DoCode"
            name="DoCode"
            onClick={fetchData}
            onChange={(e) => changeSearchData(e, "DoCode")}
          />
        </Grid>

        <Grid item xs>
          <MuiAutoComplete
            label={intl.formatMessage({ id: "delivery_order.PoCode" })}
            fetchDataFunc={getPoArr}
            displayLabel="PoCode"
            displayValue="PoId"
            value={
              deliveryOrderState.searchData.PoId !== 0
                ? {
                    PoId: deliveryOrderState.searchData.PoId,
                    PoCode: deliveryOrderState.searchData.PoCode,
                  }
                : null
            }
            onChange={(e, item) => {
              changeSearchData(item ?? null, "PoId");
            }}
            variant="standard"
          />
        </Grid>

        <Grid item xs>
          <MuiSelectField
            label={intl.formatMessage({ id: "delivery_order.MaterialCode" })}
            options={materialArr}
            displayLabel="MaterialCode"
            displayValue="MaterialId"
            value={
              deliveryOrderState.searchData.MaterialId !== 0
                ? {
                    MaterialId: deliveryOrderState.searchData.MaterialId,
                    MaterialCode: deliveryOrderState.searchData.MaterialCode,
                  }
                : null
            }
            onChange={(e, item) => {
              changeSearchData(item ?? null, "MaterialId");
            }}
            variant="standard"
          />
        </Grid>

        <Grid item xs>
          <MuiDateTimeField
            disabled={deliveryOrderState.isLoading}
            label={intl.formatMessage({
              id: "delivery_order.ETDLoad",
            })}
            value={deliveryOrderState.searchData.ETDLoad}
            onChange={(e) => {
              changeSearchData(e, "ETDLoad");
            }}
            variant="standard"
          />
        </Grid>

        <Grid item xs>
          <MuiDateTimeField
            disabled={deliveryOrderState.isLoading}
            label={intl.formatMessage({
              id: "delivery_order.DeliveryTime",
            })}
            value={deliveryOrderState.searchData.DeliveryTime}
            onChange={(e) => {
              changeSearchData(e, "DeliveryTime");
            }}
            variant="standard"
          />
        </Grid>

        <Grid item xs={2} sx={{ display: "flex", justifyContent: "right" }}>
          <MuiButton text="search" color="info" onClick={fetchData} />
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

      <MuiDataGrid
        showLoading={deliveryOrderState.isLoading}
        isPagingServer={true}
        headerHeight={45}
        // rowHeight={30}
        gridHeight={736}
        columns={columns}
        rows={deliveryOrderState.data}
        page={deliveryOrderState.page - 1}
        pageSize={deliveryOrderState.pageSize}
        rowCount={deliveryOrderState.totalRow}
        onPageChange={(newPage) => {
          setDeliveryOrderState({ ...deliveryOrderState, page: newPage + 1 });
        }}
        getRowId={(rows) => rows.DoId}
        onSelectionModelChange={(newSelectedRowId) =>
          handleRowSelection(newSelectedRowId)
        }
        getRowClassName={(params) => {
          if (_.isEqual(params.row, newData)) {
            return `Mui-created`;
          }
        }}
      />

      <DeliveryOrderDialog
        setNewData={setNewData}
        setUpdateData={setSelectedRow}
        initModal={mode === CREATE_ACTION ? DeliveryOrderDto : selectedRow}
        isOpen={isOpenDialog}
        onClose={toggleDialog}
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

export default connect(mapStateToProps, mapDispatchToProps)(DeliveryOrder);
